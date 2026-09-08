/* ============================================
   MAIN APPLICATION LOGIC
   ============================================ */

/**
 * Initialize Quiz Application
 */
function initializeQuiz() {
    // Validate quiz data
    if (!validateQuizData()) {
        uiController.showAlert('Error: Quiz data validation failed!', 'error');
        return;
    }

    // Initialize quiz manager
    if (!quizManager.initialize()) {
        uiController.showAlert('Error: Failed to initialize quiz!', 'error');
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
            uiController.showAlert('Time is up! Your quiz has been submitted.', 'warning');
            submitQuiz();
        }
    );

    // Setup event listeners
    setupEventListeners();

    uiController.showAlert('Quiz started! Good luck!', 'success');
}

/**
 * Setup event listeners for buttons
 */
function setupEventListeners() {
    // Previous button
    uiController.elements.prevBtn.addEventListener('click', () => {
        if (quizManager.previousQuestion()) {
            uiController.displayQuestion();
        }
    });

    // Next button
    uiController.elements.nextBtn.addEventListener('click', () => {
        if (quizManager.nextQuestion()) {
            uiController.displayQuestion();
        }
    });

    // Submit button
    uiController.elements.submitBtn.addEventListener('click', () => {
        showSubmitConfirmation();
    });

    // Back button (from result page)
    if (uiController.elements.backBtn) {
        uiController.elements.backBtn.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Retake button
    if (uiController.elements.retakeBtn) {
        uiController.elements.retakeBtn.addEventListener('click', () => {
            retakeQuiz();
        });
    }

    // Home button
    if (uiController.elements.homeBtn) {
        uiController.elements.homeBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Toggle review button
    if (uiController.elements.toggleReviewBtn) {
        uiController.elements.toggleReviewBtn.addEventListener('click', () => {
            toggleAnswerReview();
        });
    }
}

/**
 * Show submit confirmation dialog
 */
function showSubmitConfirmation() {
    const unansweredCount = quizManager.getUnansweredCount();

    if (unansweredCount > 0) {
        uiController.showConfirmModal(
            'Unanswered Questions',
            `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`,
            submitQuiz,
            null
        );
    } else {
        uiController.showConfirmModal(
            'Submit Quiz',
            'Are you sure you want to submit your quiz? You cannot change your answers after submission.',
            submitQuiz,
            null
        );
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
    uiController.displayResults(results);

    // Show success message
    if (results.passed) {
        uiController.showAlert(
            `Congratulations! You passed with ${results.percentage}%`,
            'success'
        );
    } else {
        uiController.showAlert(
            `You scored ${results.percentage}%. Passing score is ${quizConfig.passingScore}%.`,
            'warning'
        );
    }
}

/**
 * Toggle answer review visibility
 */
function toggleAnswerReview() {
    const reviewSection = uiController.elements.answerReview;
    const button = uiController.elements.toggleReviewBtn;

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
    uiController.showConfirmModal(
        'Retake Quiz',
        'Starting a new quiz will reset all your answers. Continue?',
        () => {
            quizManager.reset();
            quizManager.clearSavedProgress();
            uiController.resetUI();
            initializeQuiz();
        },
        null
    );
}

/**
 * Check for saved progress on page load
 */
function checkSavedProgress() {
    const saved = localStorage.getItem('quizProgress');

    if (saved) {
        uiController.showConfirmModal(
            'Resume Quiz',
            'You have a quiz in progress. Would you like to resume it?',
            () => {
                quizManager.initialize();
                quizManager.loadProgress();
                uiController.createQuestionIndicator();
                uiController.displayQuestion();

                // Restart timer with remaining time
                quizManager.startTimer(
                    (timeRemaining) => {
                        uiController.updateTimer(timeRemaining);
                    },
                    () => {
                        uiController.showAlert('Time is up! Your quiz has been submitted.', 'warning');
                        submitQuiz();
                    }
                );

                setupEventListeners();
                uiController.showAlert('Quiz resumed!', 'info');
            },
            () => {
                quizManager.clearSavedProgress();
                initializeQuiz();
            }
        );
    } else {
        initializeQuiz();
    }
}

/**
 * Export functions for use in other modules
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeQuiz,
        setupEventListeners,
        showSubmitConfirmation,
        submitQuiz,
        toggleAnswerReview,
        retakeQuiz,
        checkSavedProgress
    };
}

/* ============================================
   PAGE LOAD EVENT
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Quiz application loaded');
    
    // Check if quiz page or result page
    const quizContainer = document.getElementById('quizContainer');
    
    if (quizContainer) {
        // This is the quiz page
        checkSavedProgress();
    }
});
