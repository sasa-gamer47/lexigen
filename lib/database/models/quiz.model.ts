import { Type } from "lucide-react";
import { Schema, model, models } from "mongoose";


const QuizSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    quiz: [{
        question: { type: String, required: true },
        options: [
            {
                answer: { type: String, required: true },
                correct: { type: Boolean, required: true }
            },
        ],
        explanation: {
            correctReason: { type: String, required: true },
            incorrectReasons: [{ type: String, required: true }]
        }
    }],
    owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    history: [
        {
            correctAnswers: { type: Number, required: true },
            incorrectAnswers: { type: Number, required: true },
            userAnswers: { type: Object, required: true },
            date: { type: Date, required: true },
        }, 
    ],
    createdAt: { type: Date, required: true },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Set the default value for history as an empty array
QuizSchema.path('history').default([]);

const Quiz = models.Quiz || model('Quiz', QuizSchema);

export default Quiz;
