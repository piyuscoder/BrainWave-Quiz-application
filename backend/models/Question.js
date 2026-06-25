const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Please add the question text'],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, 'Please add 4 options'],
      validate: {
        validator: function (val) {
          return val.length === 4;
        },
        message: 'A question must have exactly 4 options.',
      },
    },
    correctAnswer: {
      type: String,
      required: [true, 'Please specify the correct answer'],
      validate: {
        validator: function (val) {
          return this.options.includes(val);
        },
        message: 'Correct answer must match one of the options.',
      },
    },
    technology: {
      type: String,
      required: [true, 'Please add the technology name (e.g., JavaScript, React)'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Please specify difficulty'],
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    points: {
      type: Number,
      default: 10,
    },
    timeLimit: {
      type: Number,
      required: [true, 'Please specify a time limit in seconds'],
      default: 30, // in seconds
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for easier querying/searching by admin
questionSchema.index({ text: 'text', technology: 'text' });

module.exports = mongoose.model('Question', questionSchema);
