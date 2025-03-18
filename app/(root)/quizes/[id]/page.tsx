"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import 'reactflow/dist/style.css';

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions/user.actions";
import { getQuiz, updateQuizHistory } from "@/lib/actions/quizs.actions";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface User {
    _id: string;
    clerkId: string;
    email: string;
    username: string;
}

interface QuizOption {
    answer: string;
    correct: boolean;
    _id: string;
}

interface QuizQuestion {
    explanation: {
        correctReason: string;
        incorrectReasons: string[];
    };
    question: string;
    options: QuizOption[];
    _id: string;
}

interface Quiz {
    _id: string;
    description: string;
    quiz: QuizQuestion[];
    title: string;
    owner: string;
    createdAt: string;
    // history?: {
    //     correctAnswers: number;
    //     incorrectAnswers: number;
    //     userAnswers: Record<number, number>;
    //     date: Date;
    // }[];
    history: any
}

// Define the schema for the form
const formSchema = z.object({
    answers: z.record(z.string()), // Record of question index to selected answer index
});

export default function App({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);

    const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [selectedExplanation, setSelectedExplanation] = useState<{ correct: boolean, explanation: string } | null>(null);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [showReview, setShowReview] = useState(false);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [currentTab, setCurrentTab] = useState<"quiz" | "results" | "review" | "history" | "history-detail">("quiz");
    const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<{
        correctAnswers: number;
        incorrectAnswers: number;
        userAnswers: Record<number, number>;
        date: Date;
    } | null>(null);
    const [historyDetailTab, setHistoryDetailTab] = useState<"history-results" | "history-review">("history-results");

    // Initialize the form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            answers: {},
        },
    });

    useEffect(() => {
        const fetchUser = async () => {
            const user = userId ? await getUserByClerkId(userId) : null;
            setUser(user?.[0] || null);

            console.log('user: ', user?.[0]);
        };
        fetchUser();
    }, [userId]);

    useEffect(() => {
        const fetchQuiz = async () => {
            console.log(id);
            const fetchedQuiz = user ? await getQuiz(id) : null;
            console.log('Quiz data fetched from API: ', fetchedQuiz);

            if (fetchedQuiz) {
                setQuiz(fetchedQuiz);
                console.log('Quiz state updated with fetched data:', fetchedQuiz);
            } else {
                console.log("Quiz data is not available from API.");
                setQuiz(null);
            }
        };
        if (user) {
            console.log("Fetching Quiz for ID:", id);
            fetchQuiz();
        }
    }, [user, id]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log("Form submitted:", values);
        setSubmitted(true);
        setCurrentTab("results");

        // Calculate correct answers count
        let correctCount = 0;
        const answers: Record<number, number> = {};
        if (quiz?.quiz) {
            quiz.quiz.forEach((quizItem, index) => {
                const selectedAnswerIndex = values.answers[index];
                if (selectedAnswerIndex !== undefined) {
                    const selectedOption = quizItem.options[parseInt(selectedAnswerIndex)];
                    answers[index] = parseInt(selectedAnswerIndex);
                    if (selectedOption && selectedOption.correct) {
                        correctCount++;
                    }
                }
            });
        }
        setCorrectAnswersCount(correctCount);
        setUserAnswers(answers);
        const incorrectCount = quiz?.quiz.length ? quiz.quiz.length - correctCount : 0;
        const quizHistory = await updateQuizHistory(id, correctCount, incorrectCount, answers);

        console.log(quizHistory)
    };

    const handleOptionClick = (correct: boolean, explanation: string) => {
        setSelectedExplanation({ correct, explanation });
    };

    const isOptionCorrect = (quizItem: QuizQuestion, option: QuizOption) => {
        return option.correct;
    };

    const getCorrectAnswer = (quizItem: QuizQuestion) => {
        const correctAnswer = quizItem.options.find((option) => option.correct);
        return correctAnswer ? correctAnswer.answer : "No correct answer found";
    };

    const handleReviewClick = () => {
        setCurrentTab("review");
    };

    const handleRestartClick = () => {
        setSubmitted(false);
        setShowReview(false);
        setCorrectAnswersCount(0);
        setUserAnswers({});
        setCurrentTab("quiz");
        form.reset();
        setSelectedHistoryEntry(null);
    };

    const handleHistoryClick = () => {
        setCurrentTab("history");
        setSelectedHistoryEntry(null);
    };

    const correctPercentage = quiz ? Math.round((correctAnswersCount / quiz.quiz.length) * 100) : 0;

    const chartData = {
        labels: ['Correct', 'Incorrect'],
        datasets: [
            {
                label: 'Quiz Results',
                data: [correctAnswersCount, quiz?.quiz.length ? quiz.quiz.length - correctAnswersCount : 0],
                backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'white',
                },
            },
            x: {
                ticks: {
                    color: 'white',
                },
            },
        },
        plugins: {
            legend: {
                labels: {
                    color: 'white',
                },
            },
        },
    };

    const handleHistoryEntryClick = (historyEntry: any) => {
        if (!quiz) return;
        setSelectedHistoryEntry(historyEntry);
        setUserAnswers(historyEntry.userAnswers);
        setCorrectAnswersCount(historyEntry.correctAnswers);
        setCurrentTab("history-detail");
        setHistoryDetailTab("history-results");
    };

    return (
        <div className="lexigen-bg w-screen h-screen">
            <Sidebar />

            <div className="absolute w-5/6 right-0 top-20 bottom-0 p-5 flex flex-col items-center gap-y-5">
                <h1 className="text-sky-200 text-3xl font-semibold text-center">{quiz?.title || 'Loading...'}</h1>

                <Tabs defaultValue={currentTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="quiz" onClick={() => setCurrentTab("quiz")} disabled={submitted}>Quiz</TabsTrigger>
                        <TabsTrigger value="results" onClick={() => setCurrentTab("results")} disabled={!submitted}>Results</TabsTrigger>
                        <TabsTrigger value="review" onClick={() => setCurrentTab("review")} disabled={!submitted || selectedHistoryEntry !== null}>Review</TabsTrigger>
                        <TabsTrigger value="history" onClick={() => setCurrentTab("history")} disabled={!quiz?.history || quiz.history.length === 0}>History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="quiz">
                        {quiz && !submitted && (
                            <div className="w-full m-4 my-2 p-4 bg-black/10 h-full rounded-lg overflow-y-auto flex flex-col items-center gap-y-4">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                                        {quiz?.quiz ? (
                                            quiz.quiz.map((quizItem: QuizQuestion, index: number) => (
                                                <FormField
                                                    key={index}
                                                    control={form.control}
                                                    name={`answers.${index}`}
                                                    render={({ field }) => (
                                                        <FormItem className="w-full p-4 rounded-lg bg-black/10">
                                                            <FormLabel className="text-center text-white font-semibold text-lg">{index + 1}. {quizItem.question}</FormLabel>
                                                            <RadioGroup
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                                className="mt-2 grid grid-cols-2 w-full gap-2"
                                                            >
                                                                {quizItem.options.map((option: QuizOption, optionIndex: number) => (
                                                                    <FormItem key={optionIndex} className="border-none w-full">
                                                                        <FormControl>
                                                                            <RadioGroupItem
                                                                                value={optionIndex.toString()}
                                                                                id={`question-${index}-option-${optionIndex}`}
                                                                                className="peer hidden"
                                                                                disabled={submitted}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel
                                                                            htmlFor={`question-${index}-option-${optionIndex}`}
                                                                            className={`m-2 w-full h-full bg-black/10 p-2 rounded-lg text-white cursor-pointer flex items-center justify-center
                                                                        ${submitted && !isOptionCorrect(quizItem, option) && form.getValues(`answers.${index}`) === optionIndex.toString() ? 'bg-red-500' : ''}
                                                                        ${submitted && isOptionCorrect(quizItem, option) ? 'bg-green-500' : ''}
                                                                        peer-data-[state=checked]:bg-sky-500 peer-data-[state=checked]:text-white`}
                                                                            onClick={() => {
                                                                                if (!submitted) return;
                                                                                if (option.correct) {
                                                                                    handleOptionClick(option.correct, quizItem.explanation.correctReason);
                                                                                } else {
                                                                                    handleOptionClick(option.correct, quizItem.explanation.incorrectReasons[quizItem.options.indexOf(option)]);
                                                                                }
                                                                            }}
                                                                        >
                                                                            {option.answer}
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                ))}
                                                            </RadioGroup>
                                                            {submitted && form.getValues(`answers.${index}`) && !quizItem.options[parseInt(form.getValues(`answers.${index}`))]?.correct && (
                                                                <div className="mt-2 text-red-500">
                                                                    Correct Answer: {getCorrectAnswer(quizItem)}
                                                                </div>
                                                            )}
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            ))
                                        ) : <p>No quiz data available.</p>}
                                        <Button type="submit" disabled={submitted}>Submit</Button>
                                    </form>
                                </Form>
                                {selectedExplanation && (
                                    <div className="mt-4 p-4 bg-black/20 rounded-lg text-white">
                                        <h3 className="font-semibold">Explanation:</h3>
                                        <p>{selectedExplanation.explanation}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="results">
                        {quiz && submitted && !showReview && (
                            <div className="w-full bg-black/10 p-4 rounded-lg flex flex-col items-center gap-y-4">
                                <h1 className="text-sky-200 text-2xl font-semibold text-center">Results: </h1>
                                <p className="text-white text-center">Correct answers: {correctAnswersCount} / {quiz?.quiz.length}</p>
                                <p className="text-white text-center">Correct percentage: {correctPercentage}%</p>
                                <div className="w-full">
                                    <Bar data={chartData} options={chartOptions} />
                                </div>
                                <Button onClick={handleReviewClick}>Review Answers</Button>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="review">
                        {quiz && submitted && selectedHistoryEntry === null && (
                            <div className="w-full m-4 my-2 p-4 bg-black/10 h-full rounded-lg overflow-y-auto flex flex-col items-center gap-y-4">
                                {quiz?.quiz.map((quizItem: QuizQuestion, index: number) => (
                                    <div key={index} className="w-full p-4 rounded-lg bg-black/20">
                                        <h2 className="text-white font-semibold text-lg">{index + 1}. {quizItem.question}</h2>
                                        <div className="mt-2 flex flex-col gap-2">
                                            {quizItem.options.map((option: QuizOption, optionIndex: number) => (
                                                <div key={optionIndex} className={`p-2 rounded-lg text-white ${userAnswers[index] === optionIndex ? (option.correct ? 'bg-green-500' : 'bg-red-500') : 'bg-black/10'}`}>
                                                    <p>{option.answer}</p>
                                                    {userAnswers[index] === optionIndex && (
                                                        <p className="text-sm">
                                                            {option.correct ? (
                                                                <span className="text-green-300">Your answer is correct.</span>
                                                            ) : (
                                                                <>
                                                                    <span className="text-red-300">Your answer is incorrect.</span>
                                                                    <br />
                                                                    <span className="text-white">Explanation: {quizItem.explanation.incorrectReasons[quizItem.options.indexOf(option)]}</span>
                                                                </>
                                                            )}
                                                        </p>
                                                    )}
                                                    {option.correct && (
                                                        <p className="text-sm text-green-300">Correct answer</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {quizItem.options.find(option => option.correct) && (
                                            <div className="mt-2 text-white">
                                                <p>Correct Explanation: {quizItem.explanation.correctReason}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="history">
                        {quiz && quiz?.history && quiz.history.length > 0 ? (
                            <div className="w-full m-4 my-2 p-4 bg-black/10 h-full rounded-lg overflow-y-auto flex flex-col items-center gap-y-4">
                                {quiz.history.map((historyEntry: any, index: number) => (
                                    <div key={index} className="w-full p-4 rounded-lg bg-black/20 cursor-pointer hover:bg-black/30 transition-colors" onClick={() => handleHistoryEntryClick(historyEntry as any)}>
                                        <h2 className="text-white font-semibold text-lg  font-semibold text-lg">Attempt {quiz.history.length - index} - {format(new Date(historyEntry.date), 'dd/MM/yyyy HH:mm')}</h2>
                                        <p className="text-white">Correct Answers: {historyEntry.correctAnswers}</p>
                                        <p className="text-white">Incorrect Answers: {historyEntry.incorrectAnswers}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full m-4 my-2 p-4 bg-black/10 h-full rounded-lg overflow-y-auto flex flex-col items-center gap-y-4">
                                <p className="text-white">No history available for this quiz.</p>
                            </div>
                        )}
                    </TabsContent>
                        {quiz && selectedHistoryEntry && (
                            <Tabs defaultValue={historyDetailTab} className="w-full" >
                                <TabsList className="grid w-full grid-cols-2" >
                                <TabsTrigger onClick={() => setHistoryDetailTab("history-results")} value="history-results">Results</TabsTrigger>
                                <TabsTrigger onClick={() => setHistoryDetailTab("history-review")} value="history-review">Review</TabsTrigger>
                                </TabsList>
                                <TabsContent value="history-results">
                                    <div className="w-full bg-black/10 p-4 rounded-lg flex flex-col items-center gap-y-4">
                                        <h1 className="text-sky-200 text-2xl font-semibold text-center">Results: </h1>
                                        <p className="text-white text-center">Correct answers: {selectedHistoryEntry.correctAnswers} / {quiz?.quiz.length}</p>
                                        <p className="text-white text-center">Incorrect answers: {selectedHistoryEntry.incorrectAnswers} / {quiz?.quiz.length}</p>
                                        <p className="text-white text-center">Date: {selectedHistoryEntry.date ? format(new Date(selectedHistoryEntry.date), 'dd/MM/yyyy HH:mm') : ''}</p>
                                        <div className="w-full">
                                            <Bar data={{
                                                labels: ['Correct', 'Incorrect'],
                                                datasets: [
                                                    {
                                                        label: 'Quiz Results',
                                                        data: [selectedHistoryEntry.correctAnswers, selectedHistoryEntry.incorrectAnswers],
                                                        backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                                                        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                                                        borderWidth: 1,
                                                    },
                                                ],
                                            }} options={chartOptions} />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="history-review">
                                    <div className="w-full m-4 my-2 p-4 bg-black/10 h-full rounded-lg overflow-y-auto flex flex-col items-center gap-y-4">
                                        {quiz?.quiz.map((quizItem: QuizQuestion, index: number) => (
                                            <div key={index} className="w-full p-4 rounded-lg bg-black/20">
                                                <h2 className="text-white font-semibold text-lg">{index + 1}. {quizItem.question}</h2>
                                                <div className="mt-2 flex flex-col gap-2">
                                                    {quizItem.options.map((option: QuizOption, optionIndex: number) => (
                                                        <div key={optionIndex} className={`p-2 rounded-lg text-white ${selectedHistoryEntry.userAnswers[index] === optionIndex ? (option.correct ? 'bg-green-500' : 'bg-red-500') : 'bg-black/10'}`}>
                                                            <p>{option.answer}</p>
                                                            {selectedHistoryEntry.userAnswers[index] === optionIndex && (
                                                                <p className="text-sm">
                                                                    {option.correct ? (
                                                                        <span className="text-green-300">Your answer is correct.</span>
                                                                    ) : (
                                                                        <>
                                                                            <span className="text-red-300">Your answer is incorrect.</span>
                                                                            <br />
                                                                            <span className="text-white">Explanation: {quizItem.explanation.incorrectReasons[quizItem.options.indexOf(option)]}</span>
                                                                        </>
                                                                    )}
                                                                </p>
                                                            )}
                                                            {option.correct && (
                                                                <p className="text-sm text-green-300">Correct answer</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                {quizItem.options.find(option => option.correct) && (
                                                    <div className="mt-2 text-white" >
                                                        <p>Correct Explanation: {quizItem.explanation.correctReason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        )}
                </Tabs>
                {submitted && (
                    <Button onClick={handleRestartClick}>Restart Quiz</Button>
                )}
                {submitted && currentTab !== "history" && currentTab !== "history-detail" && (
                    <Button onClick={handleHistoryClick}>View History</Button>
                )}
                {currentTab === "history-detail" && (
                    <Button onClick={handleHistoryClick}>Back to History</Button>
                )}
            </div>
        </div>
    );
}
