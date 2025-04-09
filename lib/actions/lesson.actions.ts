// lessons.actions.ts
"use server"

import { connectToDatabase } from "@/lib/database";
import Lesson from "@/lib/database/models/lesson.model";
import User from "@/lib/database/models/user.model"; // Assuming you have this model
import { revalidatePath } from "next/cache";
import { CreateLessonParams } from "@/types"; // Assuming these types match your input structure

export async function createLesson(params: CreateLessonParams) {
  try {
    await connectToDatabase();

    // Destructure parameters
    const { title, description, owner, topic, language, index, lessons: lessonsInput, history } = params;

    // ---- FIX: Flatten the lessons array ----
    // The input 'lessonsInput' is like: [[{lesson0_0}, {lesson0_1}], [{lesson1_0}]]
    // The schema expects 'lessons' like: [{lesson0_0}, {lesson0_1}, {lesson1_0}]
    const flattenedLessons = lessonsInput.flat();
    
    // Remove duplicates from flattenedLessons based on a unique identifier (e.g., 'id' or 'name')
    const uniqueLessons = flattenedLessons.filter((lesson: any, index: any, self: any) =>
      index === self.findIndex((l: any) => l.id === lesson.id)
    );
    // ----------------------------------------

    console.log("Input Lessons (raw):", lessonsInput);
    console.log("Flattened Lessons (for DB):", uniqueLessons);

    // Create the main Lesson document with flattened sub-lessons
    const newLesson = await Lesson.create({
      title,
      description,
      owner, // Mongoose will convert this string to ObjectId if schema type is ObjectId
      topic,
      language,
      index, 
      lessons: flattenedLessons, // Use the flattened array here
      history: history || [],
      createdAt: new Date() // Mongoose handles this as BSON Date
    });

    console.log("Saved Lesson Document:", newLesson);

    // Optional: Add the lesson reference to the user's document
    // Ensure the 'User' model and its schema are correctly set up for this
    if (owner) { // Check if owner exists before trying to update
      try {
        await User.findByIdAndUpdate(owner, {
          $push: { lessons: newLesson._id } // Assuming User schema has `lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }]`
        });
      } catch (userUpdateError) {
        console.error("Error updating user document:", userUpdateError);
        // Decide if this error should prevent the lesson creation from succeeding
        // For now, we'll just log it and continue.
      }
    }

    revalidatePath("/lessons"); // Or appropriate path

    // Return the plain JS object version of the created document
    return JSON.parse(JSON.stringify(newLesson));

  } catch (error) {
    console.error("Error creating lesson:", error);
    // It's often better to throw a more specific error or handle it
    // rather than just re-throwing the raw error object.
    // For now, re-throwing is fine for debugging.
    throw new Error(`Failed to create lesson: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getLessons() {
  try {
    await connectToDatabase();
    // Populate owner if you need user details when fetching lessons
    const lessons = await Lesson.find({})
                                .populate('owner', 'username email _id') // Example: Populate owner fields
                                .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(lessons));
  } catch (error) {
    console.error("Error fetching lessons:", error);
    throw new Error(`Failed to fetch lessons: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getLessonsByUser(userId: string) {
  try {
    await connectToDatabase();
    const lessons = await Lesson.find({ owner: userId })
      // .populate('owner', 'username email _id') // Optional: populate owner if needed
      .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(lessons));
  } catch (error) {
    console.error("Error fetching lessons by user:", error);
    throw new Error(`Failed to fetch user lessons: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getLesson(lessonId: string) {
  try {
    await connectToDatabase();
    const lesson = await Lesson.findById(lessonId)
                              .populate('owner', 'username email _id'); // Populate owner details
    if (!lesson) throw new Error("Lesson not found");
    return JSON.parse(JSON.stringify(lesson));
  } catch (error) {
    console.error("Error fetching lesson:", error);
     // Handle 'CastError' specifically if the ID format is wrong
    if (error instanceof Error && error.name === 'CastError') {
      throw new Error(`Invalid lesson ID format: ${lessonId}`);
    }
    throw new Error(`Failed to fetch lesson: ${error instanceof Error ? error.message : String(error)}`);
  }
}
