import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Column title is required'],
      trim: true,
      maxlength: [50, 'Title cannot exceed 50 characters'],
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

columnSchema.index({ board: 1, position: 1 });

const Column = mongoose.model('Column', columnSchema);

export default Column;
