/* ============================================
   HOME PAGE FUNCTIONALITY
   ============================================ */

/**
 * Initialize Home Page
 */
function initializeHomePage() {
    // Display total questions
    document.getElementById('totalQuestions').textContent = quizConfig.totalQuestions;

    // Display quiz duration
    const minutes = Math.floor(quizConfig.timeLimit / 60);
    document.getElementById('quizDuration').textContent = minutes + ' min';

    // Load and display statistics
    loadStatistics();

    // Setup event listeners for buttons
    setupHomePageListeners();
}

/**
 * Load statistics from localStorage
 */
function loadStatistics() {
    const stats = getQuizStatistics();

    document.getElementById('totalAttempts').textContent = stats.totalAttempts;
    document.getElementById('bestScore').textContent = stats.bestScore + '%';
}

/**
 * Setup event listeners for home page buttons
 */
function setupHomePageListeners() {
    const startQuizBtn = document.getElementById('startQuizBtn');
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');

    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', () => {
            window.location.href = 'quiz.html';
        });
    }

    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', () => {
            window.location.href = 'history.html';
        });
    }
}

/* ============================================
   QUIZ PAGE FUNCTIONALITY
   ============================================ */

/**
 * Initialize Quiz Application
 */
function initializeQuiz() {
    // Validate quiz data
    if (!validateQuizData()) {
        alert('Error: Quiz data validation failed!');
        return;
    }

    // Initialize quiz manager
    if (!quizManager.initialize()) {
        alert('Error: Failed to initialize quiz!');
        return;
    }

    // Create question indicator dots
    uiController.createQuestionIndicator();

    // Display first question
    uiController.displayQuestion();

    // Start timer
    quizManager.startTimer(
        (timeRemaining) => {
            uiController.updateTimer(timeRemaining);
        },
        () => {
            alert('Time is up! Your quiz has been submitted.');
            submitQuiz();
        }
    );

    // Setup event listeners
    setupEventListeners();

    console.log('Quiz started successfully');
}

/**
 * Setup event listeners for quiz buttons
 */
function setupEventListeners() {
    // Previous button
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (quizManager.previousQuestion()) {
                uiController.displayQuestion();
            }
        });
    }

    // Next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (quizManager.nextQuestion()) {
                uiController.displayQuestion();
            }
        });
    }

    // Submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            showSubmitConfirmation();
        });
    }

    // Back button (from quiz page)
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (quizManager.quizStarted && !quizManager.quizSubmitted) {
                quizManager.showConfirmModal(
                    'Leave Quiz',
                    'Your progress will be saved. Continue?',
                    () => {
                        quizManager.saveProgress();
                        window.location.href = 'index.html';
                    },
                    null
                );
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    // Retake button
    const retakeBtn = document.getElementById('retakeBtn');
    if (retakeBtn) {
        retakeBtn.addEventListener('click', () => {
            retakeQuiz();
        });
    }

    // Home button
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Toggle review button
    const toggleReviewBtn = document.getElementById('toggleReviewBtn');
    if (toggleReviewBtn) {
        toggleReviewBtn.addEventListener('click', () => {
            toggleAnswerReview();
        });
    }
}

/**
 * Show submit confirmation dialog
 */
function showSubmitConfirmation() {
    const unansweredCount = quizManager.getUnansweredCount();

    const confirmDialog = confirm(
        unansweredCount > 0
            ? `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`
            : 'Are you sure you want to submit your quiz? You cannot change your answers after submission.'
    );

    if (confirmDialog) {
        submitQuiz();
    }
}

/**
 * Submit the quiz
 */
function submitQuiz() {
    // Stop timer
    quizManager.stopTimer();

    // Calculate results
    const results = quizManager.calculateResults();

    // Mark quiz as submitted
    quizManager.quizSubmitted = true;

    // Save results to history
    saveQuizResults(results);

    // Clear saved progress
    quizManager.clearSavedProgress();

    // Display results
    if (typeof uiController !== 'undefined' && uiController.displayResults) {
        uiController.displayResults(results);
    }

    console.log('Quiz submitted with results:', results);
}

/**
 * Toggle answer review visibility
 */
function toggleAnswerReview() {
    const reviewSection = document.getElementById('answerReview');
    const button = document.getElementById('toggleReviewBtn');

    if (!reviewSection || !button) return;

    if (reviewSection.classList.contains('active')) {
        reviewSection.classList.remove('active');
        button.textContent = 'View Answer Review';
    } else {
        reviewSection.classList.add('active');
        button.textContent = 'Hide Answer Review';
    }
}

/**
 * Retake the quiz
 */
function retakeQuiz() {
    const confirmDialog = confirm('Starting a new quiz will reset all your answers. Continue?');

    if (confirmDialog) {
        quizManager.reset();
        quizManager.clearSavedProgress();
        
        // Reset UI
        const resultContainer = document.getElementById('resultContainer');
        const quizContainer = document.getElementById('quizContainer');
        
        if (resultContainer) resultContainer.style.display = 'none';
        if (quizContainer) quizContainer.style.display = 'flex';
        
        initializeQuiz();
    }
}

/**
 * Check for saved progress on quiz page load
 */
function checkSavedProgress() {
    const saved = localStorage.getItem('quizProgress');

    if (saved) {
        const resumeDialog = confirm('You have a quiz in progress. Would you like to resume it?');

        if (resumeDialog) {
            quizManager.initialize();
            quizManager.loadProgress();
            
            // Recreate question indicator
            uiController.createQuestionIndicator();
            uiController.displayQuestion();

            // Restart timer with remaining time
            quizManager.startTimer(
                (timeRemaining) => {
                    uiController.updateTimer(timeRemaining);
                },
                () => {
                    alert('Time is up! Your quiz has been submitted.');
                    submitQuiz();
                }
            );

            setupEventListeners();
            console.log('Quiz resumed');
        } else {
            quizManager.clearSavedProgress();
            initializeQuiz();
        }
    } else {
        initializeQuiz();
    }
}

/* ============================================
   PAGE INITIALIZATION
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded');

    // Determine which page we're on
    const quizContainer = document.getElementById('quizContainer');
    const startQuizBtn = document.getElementById('startQuizBtn');

    if (quizContainer) {
        // This is the quiz page
        console.log('Quiz page detected');
        checkSavedProgress();
    } else if (startQuizBtn) {
        // This is the home page
        console.log('Home page detected');
        initializeHomePage();
    }
});

/**
 * Export functions for use in other modules
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeHomePage,
        loadStatistics,
        setupHomePageListeners,
        initializeQuiz,
        setupEventListeners,
        showSubmitConfirmation,
        submitQuiz,
        toggleAnswerReview,
        retakeQuiz,
        checkSavedProgress
    };
}
