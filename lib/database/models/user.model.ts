import { Type } from "lucide-react";
import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    photo: { type: String, required: true },
    mindMaps: [{ type: Schema.Types.ObjectId, ref: 'MindMap' }],
    lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }]
});

const User = models.User || model('User', UserSchema);

export default User;