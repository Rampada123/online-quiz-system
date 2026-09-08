/* ============================================
   QUIZ LOGIC AND STATE MANAGEMENT
   ============================================ */

class QuizManager {
    constructor() {
        this.currentQuestion = 0;
        this.questions = [];
        this.answers = [];
        this.timeRemaining = quizConfig.timeLimit;
        this.timerId = null;
        this.quizStarted = false;
        this.quizSubmitted = false;
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * Initialize the quiz
     */
    initialize() {
        if (!validateQuizData()) {
            alert('Error: Invalid quiz data. Please refresh the page.');
            return false;
        }

        this.questions = getQuestionsInOrder();
        this.answers = new Array(this.questions.length).fill(null);
        this.currentQuestion = 0;
        this.timeRemaining = quizConfig.timeLimit;
        this.quizStarted = true;
        this.quizSubmitted = false;
        this.startTime = new Date();

        return true;
    }

    /**
     * Get current question
     */
    getCurrentQuestion() {
        return this.questions[this.currentQuestion];
    }

    /**
     * Get question by index
     */
    getQuestion(index) {
        return this.questions[index];
    }

    /**
     * Set answer for current question
     */
    setAnswer(optionIndex) {
        this.answers[this.currentQuestion] = optionIndex;
    }

    /**
     * Get answer for specific question
     */
    getAnswer(questionIndex) {
        return this.answers[questionIndex];
    }

    /**
     * Move to next question
     */
    nextQuestion() {
        if (this.currentQuestion < this.questions.length - 1) {
            this.currentQuestion++;
            return true;
        }
        return false;
    }

    /**
     * Move to previous question
     */
    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            return true;
        }
        return false;
    }

    /**
     * Jump to specific question
     */
    goToQuestion(index) {
        if (index >= 0 && index < this.questions.length) {
            this.currentQuestion = index;
            return true;
        }
        return false;
    }

    /**
     * Check if all questions are answered
     */
    allQuestionsAnswered() {
        return this.answers.every(answer => answer !== null);
    }

    /**
     * Get unanswered questions count
     */
    getUnansweredCount() {
        return this.answers.filter(answer => answer === null).length;
    }

    /**
     * Calculate quiz results
     */
    calculateResults() {
        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;

        for (let i = 0; i < this.questions.length; i++) {
            if (this.answers[i] === null) {
                unanswered++;
            } else if (this.answers[i] === this.questions[i].correctAnswer) {
                correct++;
            } else {
                incorrect++;
            }
        }

        this.endTime = new Date();
        const timeTaken = Math.floor((this.endTime - this.startTime) / 1000);

        return {
            correct,
            incorrect,
            unanswered,
            total: this.questions.length,
            percentage: calculatePercentage(correct, this.questions.length),
            timeTaken,
            grade: getScoreGrade(calculatePercentage(correct, this.questions.length)),
            passed: calculatePercentage(correct, this.questions.length) >= quizConfig.passingScore
        };
    }

    /**
     * Get detailed answer review
     */
    getDetailedReview() {
        const review = [];

        for (let i = 0; i < this.questions.length; i++) {
            const question = this.questions[i];
            const userAnswer = this.answers[i];
            const isCorrect = userAnswer === question.correctAnswer;
            const isAnswered = userAnswer !== null;

            review.push({
                questionNumber: i + 1,
                question: question.question,
                userAnswer: isAnswered ? question.options[userAnswer] : 'Not answered',
                correctAnswer: question.options[question.correctAnswer],
                explanation: question.explanation,
                isCorrect,
                isAnswered
            });
        }

        return review;
    }

    /**
     * Start timer
     */
    startTimer(onTick, onTimeUp) {
        this.timerId = setInterval(() => {
            this.timeRemaining--;

            if (typeof onTick === 'function') {
                onTick(this.timeRemaining);
            }

            if (this.timeRemaining <= 0) {
                this.stopTimer();
                if (typeof onTimeUp === 'function') {
                    onTimeUp();
                }
            }
        }, 1000);
    }

    /**
     * Stop timer
     */
    stopTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    /**
     * Reset quiz
     */
    reset() {
        this.currentQuestion = 0;
        this.answers = new Array(this.questions.length).fill(null);
        this.timeRemaining = quizConfig.timeLimit;
        this.quizStarted = false;
        this.quizSubmitted = false;
        this.startTime = null;
        this.endTime = null;
        this.stopTimer();
    }

    /**
     * Save quiz progress to localStorage
     */
    saveProgress() {
        const progress = {
            currentQuestion: this.currentQuestion,
            answers: this.answers,
            timeRemaining: this.timeRemaining,
            startTime: this.startTime,
            quizStarted: this.quizStarted
        };

        localStorage.setItem('quizProgress', JSON.stringify(progress));
    }

    /**
     * Load quiz progress from localStorage
     */
    loadProgress() {
        const saved = localStorage.getItem('quizProgress');
        if (saved) {
            try {
                const progress = JSON.parse(saved);
                this.currentQuestion = progress.currentQuestion;
                this.answers = progress.answers;
                this.timeRemaining = progress.timeRemaining;
                this.startTime = new Date(progress.startTime);
                this.quizStarted = progress.quizStarted;
                return true;
            } catch (e) {
                console.error('Error loading quiz progress:', e);
                return false;
            }
        }
        return false;
    }

    /**
     * Clear saved progress
     */
    clearSavedProgress() {
        localStorage.removeItem('quizProgress');
    }
}

/**
 * Create global quiz manager instance
 */
const quizManager = new QuizManager();

/**
 * Save quiz results to localStorage
 */
function saveQuizResults(results) {
    const quizHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];
    
    const resultEntry = {
        date: new Date().toISOString(),
        results: results
    };

    quizHistory.push(resultEntry);
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
}

/**
 * Get quiz history from localStorage
 */
function getQuizHistory() {
    return JSON.parse(localStorage.getItem('quizHistory')) || [];
}

/**
 * Clear quiz history
 */
function clearQuizHistory() {
    localStorage.removeItem('quizHistory');
}

/**
 * Get statistics from quiz history
 */
function getQuizStatistics() {
    const history = getQuizHistory();

    if (history.length === 0) {
        return {
            totalAttempts: 0,
            averageScore: 0,
            bestScore: 0,
            worstScore: 0,
            totalTimeTaken: 0,
            passRate: 0
        };
    }

    let totalScore = 0;
    let bestScore = 0;
    let worstScore = 100;
    let passedAttempts = 0;
    let totalTime = 0;

    history.forEach(entry => {
        const percentage = entry.results.percentage;
        totalScore += percentage;
        bestScore = Math.max(bestScore, percentage);
        worstScore = Math.min(worstScore, percentage);
        totalTime += entry.results.timeTaken;

        if (entry.results.passed) {
            passedAttempts++;
        }
    });

    return {
        totalAttempts: history.length,
        averageScore: Math.round(totalScore / history.length),
        bestScore,
        worstScore,
        totalTimeTaken: totalTime,
        passRate: Math.round((passedAttempts / history.length) * 100)
    };
}

/**
 * Event listener for page unload to save progress
 */
window.addEventListener('beforeunload', function(event) {
    if (quizManager.quizStarted && !quizManager.quizSubmitted) {
        quizManager.saveProgress();
    }
});
