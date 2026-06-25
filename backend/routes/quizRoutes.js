const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const { protect } = require('../middleware/auth');

// @desc    Get all distinct technologies and difficulties available
// @route   GET /api/quiz/techs
// @access  Private
router.get('/techs', protect, async (req, res) => {
  try {
    const technologies = await Question.distinct('technology');
    res.json({
      success: true,
      technologies,
      difficulties: ['Easy', 'Medium', 'Hard'],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get questions and config for a selected Quiz (without answers)
// @route   GET /api/quiz/questions
// @access  Private
router.get('/questions', protect, async (req, res) => {
  try {
    const { quizId, limit = 50 } = req.query;

    if (!quizId) {
      return res.status(400).json({ success: false, message: 'Please provide a quizId' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Find all questions associated with this quiz, excluding correctAnswer
    const questionsPool = await Question.find({ _id: { $in: quiz.questions } }).select('-correctAnswer');

    // Return the questions in random order
    const shuffledQuestions = questionsPool.sort(() => 0.5 - Math.random()).slice(0, Math.min(Number(limit), questionsPool.length));

    res.json({
      success: true,
      questions: shuffledQuestions,
      quiz,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Submit quiz answers and calculate results with negative marking securely on the server
// @route   POST /api/quiz/submit
// @access  Private
router.post('/submit', protect, async (req, res) => {
  try {
    const { quizId, answers } = req.body; // answers: [{ questionId, selectedOption }]

    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Invalid submission data' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const questionIds = answers.map((ans) => ans.questionId);

    // Fetch actual questions with answers
    const questions = await Question.find({ _id: { $in: questionIds } });

    let correctAnswersCount = 0;
    let wrongAnswersCount = 0;
    let unattemptedAnswersCount = 0;
    const answersBreakdown = [];

    questions.forEach((question) => {
      // Find user's response for this question
      const userResponse = answers.find((ans) => ans.questionId.toString() === question._id.toString());
      const selectedOption = userResponse ? userResponse.selectedOption : null;

      let isCorrect = false;
      if (!selectedOption) {
        unattemptedAnswersCount++;
      } else if (selectedOption.trim() === question.correctAnswer.trim()) {
        correctAnswersCount++;
        isCorrect = true;
      } else {
        wrongAnswersCount++;
      }

      answersBreakdown.push({
        questionId: question._id,
        questionText: question.text,
        selectedOption: selectedOption,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
      });
    });

    const totalQuestions = questions.length;
    
    // Calculate total score using quiz points weights and negative markings
    let rawScore = (correctAnswersCount * quiz.points) - (wrongAnswersCount * quiz.negativePoints);
    rawScore = Math.max(0, parseFloat(rawScore.toFixed(2))); // minimum score is 0

    // Percentage of score obtained relative to maximum possible score
    const maxScorePossible = totalQuestions * quiz.points;
    const scorePercentage = maxScorePossible > 0 ? Math.round((rawScore / maxScorePossible) * 100) : 0;

    // Create result log
    const result = await Result.create({
      userId: req.user._id,
      technology: quiz.title, // Store the specific quiz title
      difficulty: quiz.difficulty,
      score: scorePercentage,
      totalQuestions,
      correctAnswers: correctAnswersCount,
      wrongAnswers: wrongAnswersCount,
      unattemptedAnswers: unattemptedAnswersCount,
      answers: answersBreakdown,
    });

    res.status(201).json({
      success: true,
      result,
      rawScore,
      maxScorePossible,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get user's historical quiz results
// @route   GET /api/quiz/my-results
// @access  Private
router.get('/my-results', protect, async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get a specific user's historical quiz results (Admin only)
// @route   GET /api/quiz/user-results/:userId
// @access  Private/Admin
router.get('/user-results/:userId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const results = await Result.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
