/* ============================================
   QUIZ QUESTIONS DATABASE
   ============================================ */

const quizQuestions = [
    {
        id: 1,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
        explanation: "Paris is the capital and largest city of France, located in the north-central part of the country."
    },
    {
        id: 2,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        explanation: "Mars is often referred to as the Red Planet because of its reddish appearance due to iron oxide on its surface."
    },
    {
        id: 3,
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Jane Austen", "William Shakespeare", "Charles Dickens", "Mark Twain"],
        correctAnswer: 1,
        explanation: "William Shakespeare wrote 'Romeo and Juliet', one of his most famous tragedies, believed to have been written between 1594 and 1596."
    },
    {
        id: 4,
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correctAnswer: 3,
        explanation: "The Pacific Ocean is the largest and deepest ocean on Earth, covering an area of approximately 165 million square kilometers."
    },
    {
        id: 5,
        question: "In what year did the Titanic sink?",
        options: ["1912", "1905", "1920", "1898"],
        correctAnswer: 0,
        explanation: "The RMS Titanic sank on April 15, 1912, after hitting an iceberg during its maiden voyage across the Atlantic Ocean."
    },
    {
        id: 6,
        question: "Which element has the chemical symbol 'Au'?",
        options: ["Silver", "Aluminum", "Gold", "Argon"],
        correctAnswer: 2,
        explanation: "Gold has the chemical symbol 'Au', derived from its Latin name 'aurum'. It is a precious metal highly valued for jewelry and investments."
    },
    {
        id: 7,
        question: "What is the smallest country in the world by area?",
        options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"],
        correctAnswer: 2,
        explanation: "Vatican City is the smallest country in the world, with an area of approximately 0.44 square kilometers (0.17 square miles)."
    },
    {
        id: 8,
        question: "How many sides does a hexagon have?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 1,
        explanation: "A hexagon is a polygon with six sides and six angles. The prefix 'hex' means six in Greek."
    },
    {
        id: 9,
        question: "What is the speed of light in vacuum?",
        options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "250,000 km/s"],
        correctAnswer: 0,
        explanation: "The speed of light in vacuum is approximately 299,792 kilometers per second, often rounded to 300,000 km/s. It is denoted by the letter 'c'."
    },
    {
        id: 10,
        question: "Which is the longest river in the world?",
        options: ["Amazon River", "Yangtze River", "Nile River", "Mississippi River"],
        correctAnswer: 2,
        explanation: "The Nile River is the longest river in the world, flowing through northeastern Africa for approximately 6,650 kilometers (4,130 miles)."
    }
];

/* ============================================
   QUIZ CONFIGURATION
   ============================================ */

const quizConfig = {
    totalQuestions: quizQuestions.length,
    timeLimit: 600, // 10 minutes in seconds
    passingScore: 50, // 50% or higher
    questionRandomOrder: false,
    optionsRandomOrder: false,
    showProgressBar: true,
    showQuestionIndicator: true,
    allowReview: true
};

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get questions in configured order
 * @returns {Array} - Quiz questions
 */
function getQuestionsInOrder() {
    if (quizConfig.questionRandomOrder) {
        return shuffleArray(quizQuestions);
    }
    return [...quizQuestions];
}

/**
 * Shuffle options for a question
 * @param {Object} question - Question object
 * @returns {Array} - Shuffled options with their original indices
 */
function shuffleQuestionOptions(question) {
    if (quizConfig.optionsRandomOrder) {
        const optionsWithIndex = question.options.map((opt, idx) => ({
            text: opt,
            originalIndex: idx
        }));
        return shuffleArray(optionsWithIndex);
    }
    return question.options.map((opt, idx) => ({
        text: opt,
        originalIndex: idx
    }));
}

/**
 * Format time in MM:SS format
 * @param {number} seconds - Total seconds
 * @returns {string} - Formatted time string
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate score percentage
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total number of questions
 * @returns {number} - Percentage score
 */
function calculatePercentage(correct, total) {
    return Math.round((correct / total) * 100);
}

/**
 * Get score grade based on percentage
 * @param {number} percentage - Score percentage
 * @returns {Object} - Grade object with grade, label, and color
 */
function getScoreGrade(percentage) {
    if (percentage >= 90) {
        return { grade: 'A', label: 'Excellent', color: '#10b981' };
    } else if (percentage >= 80) {
        return { grade: 'B', label: 'Good', color: '#3b82f6' };
    } else if (percentage >= 70) {
        return { grade: 'C', label: 'Satisfactory', color: '#f59e0b' };
    } else if (percentage >= 60) {
        return { grade: 'D', label: 'Needs Improvement', color: '#ef4444' };
    } else {
        return { grade: 'F', label: 'Poor', color: '#dc2626' };
    }
}

/**
 * Validate quiz data
 * @returns {boolean} - True if valid
 */
function validateQuizData() {
    if (!quizQuestions || quizQuestions.length === 0) {
        console.error('No questions found in the quiz database.');
        return false;
    }

    for (let i = 0; i < quizQuestions.length; i++) {
        const q = quizQuestions[i];
        if (!q.question || !q.options || q.options.length < 2) {
            console.error(`Question ${i + 1} is invalid.`);
            return false;
        }
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
            console.error(`Question ${i + 1} has an invalid correct answer index.`);
            return false;
        }
    }

    return true;
}

/**
 * Export functions for use in other scripts
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        quizQuestions,
        quizConfig,
        shuffleArray,
        getQuestionsInOrder,
        shuffleQuestionOptions,
        formatTime,
        calculatePercentage,
        getScoreGrade,
        validateQuizData
    };
}
