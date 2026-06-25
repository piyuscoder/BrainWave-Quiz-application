const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const { protect, adminOnly } = require('../middleware/auth');

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed!'), false);
    }
  },
});

// @desc    Get all quizzes with questions count and difficulties
// @route   GET /api/questions/quizzes
// @access  Private
router.get('/quizzes', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({}).populate({
      path: 'questions',
      select: 'difficulty'
    }).sort({ createdAt: -1 });
    res.json({
      success: true,
      quizzes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a quiz metadata and propagate difficulties/technologies to questions
// @route   PUT /api/questions/quizzes/:id
// @access  Private/Admin
router.put('/quizzes/:id', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, difficulty, timeLimit, points, negativePoints, technology } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const prevTitle = quiz.title;
    const prevTech = quiz.technology;

    quiz.title = title || quiz.title;
    quiz.description = description !== undefined ? description : quiz.description;
    quiz.difficulty = difficulty || quiz.difficulty;
    quiz.timeLimit = timeLimit !== undefined ? parseInt(timeLimit, 10) : quiz.timeLimit;
    quiz.points = points !== undefined ? parseFloat(points) : quiz.points;
    quiz.negativePoints = negativePoints !== undefined ? parseFloat(negativePoints) : quiz.negativePoints;
    quiz.technology = technology || quiz.technology || quiz.title;

    await quiz.save();

    // Propagate changes to associated questions
    const updateFields = {};
    if (difficulty) updateFields.difficulty = difficulty;
    updateFields.technology = quiz.technology;

    if (quiz.questions && quiz.questions.length > 0) {
      await Question.updateMany(
        { _id: { $in: quiz.questions } },
        { $set: updateFields }
      );
    }

    res.json({
      success: true,
      message: 'Quiz box config and linked questions updated successfully',
      quiz,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete a quiz and its questions
// @route   DELETE /api/questions/quizzes/:id
// @access  Private/Admin
router.delete('/quizzes/:id', protect, adminOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Delete all linked questions
    await Question.deleteMany({ _id: { $in: quiz.questions } });
    
    // Delete the quiz
    await quiz.deleteOne();

    res.json({ success: true, message: 'Quiz and all associated questions deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all questions for admin exploration (with pagination and filter)
// @route   GET /api/questions
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { technology, difficulty, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (technology) {
      query.technology = new RegExp(`^${technology}$`, 'i');
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const count = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      questions,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalQuestions: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a single question
// @route   POST /api/questions
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { text, options, correctAnswer, technology, difficulty, points, timeLimit, quizId } = req.body;

    let finalTech = technology;
    let finalDiff = difficulty;
    let finalPoints = points;
    let finalTime = timeLimit;

    let quiz;
    if (quizId) {
      quiz = await Quiz.findById(quizId);
      if (quiz) {
        finalTech = quiz.technology || quiz.title;
        finalDiff = quiz.difficulty;
        finalPoints = quiz.points;
        finalTime = quiz.timeLimit;
      }
    }

    if (!text || !options || !correctAnswer || !finalTech) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const question = await Question.create({
      text,
      options,
      correctAnswer,
      technology: finalTech,
      difficulty: finalDiff,
      points: finalPoints,
      timeLimit: finalTime,
    });

    if (quiz) {
      quiz.questions.push(question._id);
      await quiz.save();
    }

    res.status(201).json({ success: true, question });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { text, options, correctAnswer, technology, difficulty, points, timeLimit } = req.body;

    let question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    question.text = text || question.text;
    question.options = options || question.options;
    question.correctAnswer = correctAnswer || question.correctAnswer;
    question.technology = technology || question.technology;
    question.difficulty = difficulty || question.difficulty;
    question.points = points !== undefined ? points : question.points;
    question.timeLimit = timeLimit !== undefined ? timeLimit : question.timeLimit;

    await question.save();

    res.json({ success: true, question });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    await question.deleteOne();

    res.json({ success: true, message: 'Question removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Upload questions via CSV file
// @route   POST /api/questions/upload-csv
// @access  Private/Admin
router.post('/upload-csv', protect, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
    }

    const title = req.body.title || req.body.technology || 'Quiz Default';
    const description = req.body.description || '';
    const difficulty = req.body.difficulty || 'Easy';
    const timeLimit = parseInt(req.body.timeLimit || '300', 10);
    const points = parseFloat(req.body.points || '1');
    const negativePoints = parseFloat(req.body.negativePoints || '0.25');
    const technology = req.body.technology || title;

    // Check if Quiz with this title already exists
    let quiz = await Quiz.findOne({ title: new RegExp(`^${title}$`, 'i') });
    if (quiz) {
      // Delete old questions associated with this quiz
      await Question.deleteMany({ _id: { $in: quiz.questions } });
      quiz.questions = [];
      quiz.description = description;
      quiz.difficulty = difficulty;
      quiz.timeLimit = timeLimit;
      quiz.points = points;
      quiz.negativePoints = negativePoints;
      quiz.technology = technology;
      await quiz.save();
    } else {
      quiz = await Quiz.create({
        title,
        description,
        difficulty,
        timeLimit,
        points,
        negativePoints,
        technology,
        questions: [],
      });
    }

    const questions = [];
    const errors = [];
    let rowNumber = 1;

    // Detect file encoding and determine cell separator (comma, semicolon, or tab)
    const csvContent = req.file.buffer.toString('utf8');
    const firstLine = csvContent.split(/\r?\n/)[0] || '';
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;

    let separator = ',';
    if (semicolonCount > commaCount && semicolonCount > tabCount) {
      separator = ';';
    } else if (tabCount > commaCount && tabCount > semicolonCount) {
      separator = '\t';
    }

    // Convert memory buffer to readable stream
    const stream = Readable.from(csvContent);

    stream
      .pipe(csv({ separator: separator }))
      .on('data', (row) => {
        rowNumber++;
        
        let text = '';
        let optionA = '';
        let optionB = '';
        let optionC = '';
        let optionD = '';
        let correctAnswer = '';

        // Loop over row keys dynamically, stripping all spaces and symbols to normalize headings
        for (const key of Object.keys(row)) {
          const cleanKey = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          const val = row[key] ? row[key].trim() : '';

          if (cleanKey === 'question' || cleanKey === 'text') {
            text = val;
          } else if (cleanKey === 'optiona' || cleanKey === 'option1') {
            optionA = val;
          } else if (cleanKey === 'optionb' || cleanKey === 'option2') {
            optionB = val;
          } else if (cleanKey === 'optionc' || cleanKey === 'option3') {
            optionC = val;
          } else if (cleanKey === 'optiond' || cleanKey === 'option4') {
            optionD = val;
          } else if (cleanKey === 'correctanswer' || cleanKey === 'correct') {
            correctAnswer = val;
          }
        }

        // Validation logic
        if (!text) {
          errors.push(`Row ${rowNumber}: Question text is missing`);
          return;
        }
        if (!optionA || !optionB || !optionC || !optionD) {
          errors.push(`Row ${rowNumber}: One or more of the 4 options are missing (Option A, B, C, D)`);
          return;
        }

        const options = [optionA, optionB, optionC, optionD];

        if (!correctAnswer) {
          errors.push(`Row ${rowNumber}: Correct answer is missing`);
          return;
        }

        // Check if correct answer matches one of the options
        if (!options.includes(correctAnswer)) {
          errors.push(`Row ${rowNumber}: Correct answer "${correctAnswer}" must match one of the options: [${options.join(', ')}]`);
          return;
        }

        questions.push({
          text,
          options,
          correctAnswer,
          technology: quiz.technology,
          difficulty: quiz.difficulty,
          points: quiz.points,
          timeLimit: Math.round(quiz.timeLimit / 10), // backup time limit
        });
      })
      .on('end', async () => {
        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed for some rows in the CSV.',
            errors,
          });
        }

        if (questions.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'No valid questions found in the CSV file.',
          });
        }

        // Bulk insert questions
        const insertedQuestions = await Question.insertMany(questions);
        
        // Link to the quiz
        quiz.questions = insertedQuestions.map((q) => q._id);
        await quiz.save();

        res.status(201).json({
          success: true,
          message: `Successfully created/updated quiz "${quiz.title}" with ${insertedQuestions.length} questions!`,
          count: insertedQuestions.length,
          quiz,
        });
      })
      .on('error', (err) => {
        res.status(500).json({ success: false, message: 'Error parsing CSV file', error: err.message });
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
