'use server'

import { revalidatePath } from 'next/cache'

import { connectToDatabase } from '@/lib/database'
import User from '@/lib/database/models/user.model'
import { handleError } from '@/lib/utils'
import { CreateQuizParams } from '@/types'

import { Schema, Types, model, models } from "mongoose";
import Quiz from '../database/models/quiz.model'

export async function createQuiz(quiz: CreateQuizParams) {
    try {
        await connectToDatabase()


        console.log('quiz: ', quiz)

        console.log(quiz.quiz)

        const newQuiz = await Quiz.create(quiz)

        const user = await User.findOneAndUpdate(
            { _id: quiz.owner },
            { $push: { quizs: newQuiz._id } },
            { new: true }
        )

        console.log('newQuiz: ', newQuiz)

        return JSON.parse(JSON.stringify(newQuiz))
    } catch (error) {
        handleError(error)
    }
}

export async function getQuizs(userId: string) {
    try {
        await connectToDatabase()

        console.log(userId)
        const quizs = await Quiz.find({ owner: userId })

        console.log('quizs: ', quizs)

        return JSON.parse(JSON.stringify(quizs))
    } catch (error) {
        handleError(error)
    }
}


export async function getQuiz(quizId: string) {
    try {
        await connectToDatabase()

        const quiz = await Quiz.findOne({ _id: quizId })

        console.log('quiz: ', quiz)

        return JSON.parse(JSON.stringify(quiz))
    } catch (error) {
        handleError(error)
    }
}

export async function updateQuizHistory(quizId: string, correctAnswers: number, incorrectAnswers: number, userAnswers: any) {
    try {
        await connectToDatabase();

        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            throw new Error('Quiz not found');
        }

        const newHistoryEntry = {
            correctAnswers,
            incorrectAnswers,
            userAnswers,
            date: new Date(),
        };

        console.log('newHistoryEntry: ', newHistoryEntry)


        quiz.history.push(newHistoryEntry);

        console.log(quiz)

        await quiz.save();

        revalidatePath(`/quizes/${quizId}`);
        return JSON.parse(JSON.stringify(quiz));
    } catch (error) {
        handleError(error);
    }
}
