"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { Textarea } from "@/components/ui/textarea";
import { create } from "domain";
import { createMindMap } from "@/lib/actions/mindmaps.actions";

import { useAuth } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions/user.actions";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { createMindMapSchema, deepResearchSchema } from "@/lib/validator";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface User {
  _id: string;
  clerkId: string;
  email: string;
  username: string;
}

interface UrlObject {
  title: string;
  url: string;
  summary?: string;
}

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export default function App() {
  const [userInput, setUserInput] = useState<string>('');
  const [urls, setUrls] = useState<UrlObject[]>([]);
  const [loadingSummaries, setLoadingSummaries] = useState<boolean>(false);
  const [finalSummary, setFinalSummary] = useState<string>("");
  const [finalSummaryLength, setFinalSummaryLength] = useState<string>("4"); // Default to 4 pages

  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const fetchUser = async () => {
      const user = userId ? await getUserByClerkId(userId) : null;
      setUser(user?.[0]);
      console.log('user: ', user?.[0]);
    };
    fetchUser();
  }, [userId]);


  const geminiInputPrompt = (topic: string) => `(you to answer in the language of the given [${topic}])
    you are given a topic for a research: ${topic} you have to dive into the topic and search the most relevant articles on google,
    you have to at least search through MAX 10 different articles
    you can search no longer than 20 different websites, 20 is the absolute max limit

    just search different articles and don't write anything about them yet.
    put all the urls of the articles you have read in the end
    put all the urls in an array
    with this format:
    [
      {
        title: "Article Title",
        url: "https://www.example.com/article-url",
      },
      ...
    ]
    the array should be complete, so if it runs out of tokens exclude some urls.

    // be aware of writing only correct links, make sure they work and really exist
    // be aware of writing valid links, and not double them in a single line, also make sure they do not give a 404 error
    // the links must be in this format, this one and only: https://www.[example.com]/[article]
    // make sure the [article] exists and does not return a 404 error, or else you cannot read it
    // you don't have to put the [topic] as [article], you have to do a google grounding research on the topic
  `;

  const form = useForm<z.infer<typeof deepResearchSchema>>({
    resolver: zodResolver(deepResearchSchema),
    defaultValues: {
      topic: ""
    },
  });

  async function resolveRedirect(redirectURL: string) {
    try {
      const apiEndpoint = `/api/grounding-api?url=${encodeURIComponent(redirectURL)}`; // IMPORTANT
      const response = await fetch(apiEndpoint);

      if (!response.ok) {
        console.error(`API error! Status: ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (data.error) {
        console.error('API returned an error:', data.error);
        return null;
      }

      const finalURL = data.url;
      console.log('The resolved URL is:', finalURL);
      return finalURL;

    } catch (error) {
      console.error('Error calling API:', error);
      return null;
    }
  }

  const summarizeSite = useCallback(async (urlObject: UrlObject, userInput: string): Promise<string | null> => {
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables!");
      alert("API key is missing. Check console for details.");

    }

    const {
      GoogleGenerativeAI,
      HarmCategory,
      HarmBlockThreshold,
    } = require("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: [{ google_search: {} }]
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    try {
      const chatSession = model.startChat({
        generationConfig,
        history: []
      });

      console.log("Starting chat session for summarization...");

      const redirectUrl = await resolveRedirect(urlObject.url);
      console.log('Redirected URL for summarization:', redirectUrl);

      if (!redirectUrl) {
        console.warn(`Could not resolve redirect for URL: ${urlObject.url}`);
        return null;
      }

      const format = "markdown [summary]";

      const prompt = `(you to answer in the language of the given [${userInput}])
                  make a brief summary of ${redirectUrl}
                  make it by key points
                  ENCLOSE ONLY THE MARKDOWN SUMMARY IN A CODE BLOCK, IT'S A MUST
                  ALSO INCLUDE THE "markdown" TEXT after the first set of backticks of the code block
                  (like should normally be done)

                  this is the format: ${format}
                `;

      console.log('Summarization Prompt:', prompt);

      const result = await chatSession.sendMessage(prompt);
      const rawResponse = result.response.text();
      console.log("Gemini API Summary Response Text:", rawResponse);

      const summaryMatch = rawResponse?.match(/```markdown\s*([\s\S]*?)\s*```/);
      const summary = summaryMatch ? summaryMatch[1].trim() : "Could not extract summary.";

      return summary;

    } catch (apiError: any) {
      console.error("Error from Gemini API during summarization:", apiError);
      return null;
    }
  }, [apiKey, resolveRedirect]);


  const run = useCallback(async (userInput: string) => {
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables!");
      alert("API key is missing. Check console for details.");
      return;
    }

    const {
      GoogleGenerativeAI,
      HarmCategory,
      HarmBlockThreshold,
    } = require("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: [{ google_search: {} }]
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    try {
      const chatSession = model.startChat({
        generationConfig,
        history: []

      } as any);

      console.log("Starting chat session for URL retrieval...");

      const result = await chatSession.sendMessage(geminiInputPrompt(userInput));
      const rawResponse = result.response.text();
      console.log("Gemini API URL Response Text:", rawResponse);

      const jsonStart = rawResponse.indexOf("[");
      const jsonEnd = rawResponse.lastIndexOf("]");
      const jsonString = rawResponse.slice(jsonStart, jsonEnd + 1);

      console.log("Extracted JSON String of URLs:", jsonString);

      try {
        const response: UrlObject[] = JSON.parse(jsonString);
        console.log("Parsed JSON Response (URLs):", response);
        setUserInput(userInput);
        setUrls(response);
        setLoadingSummaries(true); // Start loading summaries

      } catch (jsonError: any) {
        console.error("Error parsing JSON response (URLs):", jsonError);
        console.error("Response text that failed to parse:", jsonString);
        alert("Error parsing Gemini response for URLs. Check console for details.");
      }
    } catch (apiError: any) {
      console.error("Error from Gemini API (URL retrieval):", apiError);
      alert("Error fetching data from Gemini API for URLs. Check console for details.");
    }
  }, [apiKey]);

  const makeFinalSummary = useCallback(async (urls: UrlObject[], userInput: string, length: string) => {
    console.log('Starting makeFinalSummary with URLs:', urls);
    console.log('User Input:', userInput);
    console.log('Desired Length (pages):', length);

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables!");
      alert("API key is missing. Check console for details.");
      return;
    }

    const {
      GoogleGenerativeAI,
      HarmCategory,
      HarmBlockThreshold,
    } = require("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // Using gemini-pro instead of gemini-2.0-pro
      tools: [{ google_search: {} }]
    });

    const generationConfig = {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 16384, // Increased max output tokens for longer summaries
      responseMimeType: "text/plain",
    };

    try {
      const chatSession = model.startChat({
        generationConfig,
        history: []
      } as any);

      const allSummaries = urls.map((url) => `- ${url.title}: ${url.summary}`).join("\n\n");
      
      const prompt = `(you to answer in the language of the given [${userInput}])
        Given the following summaries of research articles on the topic of "${userInput}":

        ${allSummaries}

        Please create a comprehensive final summary that synthesizes the key findings from all the articles.
        The final summary should be approximately ${length} pages long and in markdown format, highlighting the most important insights and connections between the different sources.
        Ensure that the summary is detailed and covers the main aspects of the research.
        ENCLOSE ONLY THE MARKDOWN SUMMARY IN A CODE BLOCK, IT'S A MUST
        ALSO INCLUDE THE "markdown" TEXT after the first set of backticks of the code block
        (like should normally be done)

        MAKE THE SUMMARY AS LONG AND COMPLETE AS POSSIBLE TO FIT THE DESIRED PAGE LENGTH.
      `;

      console.log('Final Summary Prompt:', prompt);

      const result = await chatSession.sendMessage(prompt);
      const rawResponse = result.response.text();
      console.log("Gemini API Final Summary Response Text:", rawResponse);

      const summaryMatch = rawResponse?.match(/```markdown\s*([\s\S]*?)\s*```/);
      const finalSummaryText = summaryMatch ? summaryMatch[1].trim() : "Could not generate final summary.";
      setFinalSummary(finalSummaryText);

    } catch (apiError: any) {
      console.error("Error from Gemini API during final summary generation:", apiError);
      alert("Error generating final summary from Gemini API. Check console for details.");
    }
  }, [apiKey]);


  useEffect(() => {
    const fetchSummaries = async () => {
      if (urls && Array.isArray(urls) && urls.length > 0 && loadingSummaries) {
        const updatedUrls: UrlObject[] = await Promise.all(
          urls.map(async (urlObject) => {
            const summary: string | undefined = await summarizeSite(urlObject, userInput) || undefined;
            if (summary === null) {
              return { ...urlObject, summary: undefined };
            }
            return { ...urlObject, summary };
          })
        ) as UrlObject[];
        setUrls(updatedUrls as UrlObject[]);
        setLoadingSummaries(false);
      }
    };
    fetchSummaries();
  }, [urls, userInput, summarizeSite, loadingSummaries]);

  useEffect(() => {
    if (!loadingSummaries && Array.isArray(urls) && urls.length > 0) {
      console.log('All summaries are finished!');
      makeFinalSummary(urls, userInput, finalSummaryLength);
    }
  }, [loadingSummaries, urls, userInput, makeFinalSummary, finalSummaryLength]);

  const onSubmit = async (data: z.infer<typeof deepResearchSchema>) => {
    console.log("Form Data (Topic):", data.topic);
    run(data.topic);
  };

  return (
    <div className="lexigen-bg w-screen h-screen">
      <Sidebar />
      <div className="absolute w-5/6 right-0 top-20 bottom-0 p-5 flex flex-col items-center gap-y-5">
        <h1 className="text-sky-200 text-3xl font-semibold text-center">Create your Mind map</h1>
        <div className="w-full flex items-center justify-center">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input className="text-white outline-none border-none bg-white/5 p-2 text-md" placeholder="Enter a topic of research" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

              <div className="w-full flex items-center justify-center">
                <Button type="submit" disabled={loadingSummaries}>
                  {loadingSummaries ? "Generating Summaries..." : "Generate Mind Map"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        <div className="w-full mt-5 flex flex-col items-center gap-y-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="summary-length" className="text-white text-sm">
              Final Summary Length:
            </Label>
            <Select value={finalSummaryLength} onValueChange={setFinalSummaryLength}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Approximately 1 Page</SelectItem>
                <SelectItem value="2">Approximately 2 Pages</SelectItem>
                <SelectItem value="3">Approximately 3 Pages</SelectItem>
                <SelectItem value="4">Approximately 4 Pages (Default)</SelectItem>
                <SelectItem value="5">Approximately 5 Pages</SelectItem>
                <SelectItem value="6">Approximately 6 Pages</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="w-full mt-5 flex flex-col items-center gap-y-2">
          {urls && Array.isArray(urls) && urls.map((urlObject, index: number) => (
            <div key={index} className="bg-black/25 rounded-lg px-4 py-2 w-full flex flex-col gap-y-2">
              <Link href={urlObject.url} target="_blank" rel="noopener noreferrer">
                <p className="text-sky-200 text-md hover:underline">{urlObject.title}</p>
                <p className="text-gray-300 text-sm">{urlObject.url}</p>
              </Link>
              {urlObject.summary && (
                <div className="bg-black/50 rounded-md p-3">
                  <h4 className="text-white font-semibold mb-1">Summary:</h4>
                  <p className="text-gray-100 text-sm whitespace-pre-line">{urlObject.summary}</p>
                </div>
              )}
              {!urlObject.summary && loadingSummaries && <p className="text-yellow-300 text-sm">Loading summary...</p>}
            </div>
          ))}
          {finalSummary && (
            <div className="bg-black/50 rounded-md p-3 w-full">
              <h4 className="text-white font-semibold mb-1">Final Summary:</h4>
              <p className="text-gray-100 text-sm whitespace-pre-line">{finalSummary}</p>
            </div>
          )}
          {urls && Array.isArray(urls) && urls.length === 0 && !loadingSummaries && userInput && (
            <p className="text-gray-400">No URLs found for the given topic.</p>
          )}
        </div>
      </div>
    </div>
  );
}
