const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a quiz title'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Low', 'Medium', 'High'],
      default: 'Medium',
    },
    timeLimit: {
      type: Number,
      default: 300, // in seconds (e.g. 5 minutes)
    },
    points: {
      type: Number,
      default: 1, // points per correct answer
    },
    negativePoints: {
      type: Number,
      default: 0.25, // deduction per wrong answer
    },
    technology: {
      type: String,
      required: [true, 'Please add technology'],
      trim: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-populate questions count index
quizSchema.index({ title: 'text', technology: 'text' });

module.exports = mongoose.model('Quiz', quizSchema);
