import { Schema, model, models } from "mongoose";

const LessonSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  lesson: {
    topic: { type: String, required: true },
    language: { type: String, required: true },
    index: [[{ type: String }]],
    lessons: [{
      indexTitle: String,
      item: String,
      simplified: String,
      detailed: String,
      schematic: String,
      indexNumber: Number,
      itemNumber: Number,
      mindMap: Schema.Types.Mixed
    }]
  },
  history: [{ type: Schema.Types.Mixed }]
});

const Lesson = models.Lesson || model('Lesson', LessonSchema);
export default Lesson;
