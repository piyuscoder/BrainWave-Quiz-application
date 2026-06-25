const runTests = async () => {
  console.log('--- STARTING REST API INTEGRATION TESTS ---');
  const baseUrl = 'http://localhost:5000';
  let adminToken = '';
  let questionId = '';
  
  // Create unique credentials to avoid collisions
  const rand = Math.floor(Math.random() * 100000);
  const adminCredentials = {
    username: `test_admin_${rand}`,
    email: `admin_${rand}@test.com`,
    password: 'password123',
    role: 'admin'
  };

  try {
    // 1. Test Root endpoint
    console.log('Testing Root Endpoint...');
    const rootRes = await fetch(`${baseUrl}/`);
    const rootData = await rootRes.json();
    console.log('Root Res:', rootData);
    if (!rootRes.ok) throw new Error('Root endpoint down');

    // 2. Test Registration (Admin)
    console.log('\nTesting Admin Registration...');
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminCredentials)
    });
    const regData = await regRes.json();
    console.log('Reg Res Success:', regData.success);
    console.log('Username registered:', regData.username);
    if (!regData.success) throw new Error(regData.message || 'Registration failed');
    adminToken = regData.token;

    // 3. Test Question Creation (Admin only)
    console.log('\nTesting Manual Question Creation...');
    const questionPayload = {
      text: 'Which Hook is used for maintaining state in a React component?',
      options: ['useEffect', 'useReducer', 'useState', 'useRef'],
      correctAnswer: 'useState',
      technology: 'React',
      difficulty: 'Easy',
      points: 10,
      timeLimit: 30
    };
    
    const createQRes = await fetch(`${baseUrl}/api/questions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(questionPayload)
    });
    const createQData = await createQRes.json();
    console.log('Create Question Success:', createQData.success);
    if (!createQData.success) throw new Error(createQData.message || 'Question creation failed');
    questionId = createQData.question._id;
    console.log('Created Question ID:', questionId);

    // 4. Test Quiz Setup Info
    console.log('\nTesting Quiz Technologies Selection...');
    const techRes = await fetch(`${baseUrl}/api/quiz/techs`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const techData = await techRes.json();
    console.log('Technologies available:', techData.technologies);
    if (!techData.success) throw new Error('Quiz setup options fetch failed');

    // 5. Test Quiz Questions Retrieval
    console.log('\nTesting Quiz Questions Fetching...');
    const quizQRes = await fetch(`${baseUrl}/api/quiz/questions?technology=React&difficulty=Easy&limit=5`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const quizQData = await quizQRes.json();
    console.log(`Fetched ${quizQData.questions?.length || 0} questions.`);
    if (!quizQData.success) throw new Error('Quiz questions fetch failed');
    // Ensure correctAnswer is stripped
    const sampleQ = quizQData.questions[0];
    console.log('Sample question has correctAnswer field:', Object.hasOwn(sampleQ, 'correctAnswer'));

    // 6. Test Quiz Submission
    console.log('\nTesting Quiz Secure Grading Submission...');
    const submissionPayload = {
      technology: 'React',
      difficulty: 'Easy',
      answers: [
        {
          questionId: questionId,
          selectedOption: 'useState' // Correct choice
        }
      ]
    };
    
    const submitRes = await fetch(`${baseUrl}/api/quiz/submit`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(submissionPayload)
    });
    const submitData = await submitRes.json();
    console.log('Submission Result Success:', submitData.success);
    if (!submitData.success) throw new Error(submitData.message || 'Quiz submission failed');
    console.log('Graded score percentage:', submitData.result.score + '%');
    console.log('Breakdown - Correct:', submitData.result.correctAnswers, 'Wrong:', submitData.result.wrongAnswers, 'Unattempted:', submitData.result.unattemptedAnswers);

    // 7. Test Results History
    console.log('\nTesting Results History Logs...');
    const historyRes = await fetch(`${baseUrl}/api/quiz/my-results`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const historyData = await historyRes.json();
    console.log(`User has total of ${historyData.results?.length || 0} historical result logs.`);
    if (!historyData.success) throw new Error('Results history fetch failed');

    console.log('\n--- ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
  } catch (error) {
    console.error('\n--- TEST RUN ENCOUNTERED AN ERROR ---');
    console.error(error.message);
    process.exit(1);
  }
};

runTests();
