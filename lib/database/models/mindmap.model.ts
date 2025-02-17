import { Schema, model, models } from "mongoose";

const MindMapNodeSchema = new Schema({
    data: {
      label: String,
    },
    id: { // Explicitly marking as not required (already default, but clearer)
      type: String,
      required: false, // Or simply remove this line as 'required: false' is default
    },
    position: {
      x: Number,
      y: Number,
    },
  }, { _id: false });
  
  const MindMapEdgeSchema = new Schema({
    animated: Boolean,
    id: {     // Explicitly marking as not required
      type: String,
      required: false, // Or remove this line
    },
    label: String,
    source: {  // Explicitly marking as not required
      type: String,
      required: false, // Or remove this line
    },
    target: {  // Explicitly marking as not required
      type: String,
      required: false, // Or remove this line
    },
  }, { _id: false });
  
  
  const MindMapSchema = new Schema({
        title: { type: String, required: true},
        description: { type: String, required: true},
        owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, // Assuming you have a User model
        createdAt: { type: Date, required: true},
        mindMap: {
            type: {
                initialNodes: [MindMapNodeSchema],
                initialEdges: [MindMapEdgeSchema]
            },
            required: true
        },
    })
  
  const MindMap = models.MindMap || model('MindMap', MindMapSchema);
  
  export default MindMap;