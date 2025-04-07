"use server"

import { connectToDatabase } from "@/lib/database";
import Lesson from "@/lib/database/models/lesson.model";
import User from "@/lib/database/models/user.model";
import { revalidatePath } from "next/cache";
import { CreateLessonParams } from "@/lib/types";

export async function createLesson(params: CreateLessonParams) {
  try {
    await connectToDatabase();

    const { title, description, owner, lesson, history } = params;

    // Create the lesson
    const newLesson = await Lesson.create({
      title,
      description,
      owner,
      lesson: {
        topic: lesson.topic,
        language: lesson.language,
        index: lesson.index,
        lessons: lesson.lessons
      },
      history: history || [],
      createdAt: new Date()
    });

    // Add the lesson to the user's lessons array
    await User.findByIdAndUpdate(owner, {
      $push: { lessons: newLesson._id }
    });

    revalidatePath("/lessons");
    return JSON.parse(JSON.stringify(newLesson));
  } catch (error) {
    console.error("Error creating lesson:", error);
    throw error;
  }
}

export async function getLessons() {
  try {
    await connectToDatabase();
    const lessons = await Lesson.find({}).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(lessons));
  } catch (error) {
    console.error("Error fetching lessons:", error);
    throw error;
  }
}
export async function getLessonsByUser(userId: string) {
  try {
    await connectToDatabase();
    const lessons = await Lesson.find({ owner: userId })
      .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(lessons));
  } catch (error) {
    console.error("Error fetching lessons:", error);
    throw error;
  }
}

export async function getLesson(lessonId: string) {
  try {
    await connectToDatabase();
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new Error("Lesson not found");
    return JSON.parse(JSON.stringify(lesson));
  } catch (error) {
    console.error("Error fetching lesson:", error);
    throw error;
  }
}
