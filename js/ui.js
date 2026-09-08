/* ============================================
   QUIZ UI CONTROLLER
   ============================================ */

class QuizUIController {
    constructor() {
        this.elements = {
            // Quiz Page Elements
            quizContainer: document.getElementById('quizContainer'),
            questionNumber: document.getElementById('questionNumber'),
            progressBar: document.getElementById('progressBar'),
            progressPercentage: document.getElementById('progressPercentage'),
            questionText: document.getElementById('questionText'),
            optionsContainer: document.getElementById('optionsContainer'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            submitBtn: document.getElementById('submitBtn'),
            timer: document.getElementById('timer'),
            timerDisplay: document.getElementById('timerDisplay'),
            questionIndicator: document.getElementById('questionIndicator'),
            backBtn: document.getElementById('backBtn'),

            // Result Page Elements
            resultContainer: document.getElementById('resultContainer'),
            scoreNumber: document.getElementById('scoreNumber'),
            scoreLabel: document.getElementById('scoreLabel'),
            percentageDisplay: document.getElementById('percentageDisplay'),
            correctCount: document.getElementById('correctCount'),
            incorrectCount: document.getElementById('incorrectCount'),
            unansweredCount: document.getElementById('unansweredCount'),
            timeTakenDisplay: document.getElementById('timeTakenDisplay'),
            reviewList: document.getElementById('reviewList'),
            toggleReviewBtn: document.getElementById('toggleReviewBtn'),
            answerReview: document.getElementById('answerReview'),
            retakeBtn: document.getElementById('retakeBtn'),
            homeBtn: document.getElementById('homeBtn')
        };
    }

    /**
     * Load and display quiz question
     */
    displayQuestion() {
        const question = quizManager.getCurrentQuestion();
        const questionIndex = quizManager.currentQuestion;

        // Update question number
        this.elements.questionNumber.textContent = 
            `Question ${questionIndex + 1} of ${quizManager.questions.length}`;

        // Update progress bar
        const progress = ((questionIndex + 1) / quizManager.questions.length) * 100;
        this.elements.progressBar.style.width = progress + '%';
        this.elements.progressPercentage.textContent = Math.round(progress) + '%';

        // Display question text
        this.elements.questionText.textContent = question.question;

        // Get shuffled options
        const shuffledOptions = shuffleQuestionOptions(question);

        // Clear previous options
        this.elements.optionsContainer.innerHTML = '';

        // Display options
        shuffledOptions.forEach((option, index) => {
            const optionCard = document.createElement('label');
            optionCard.className = 'option-card';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'answer';
            radio.value = option.originalIndex;

            // Check if this option was previously selected
            if (quizManager.getAnswer(questionIndex) === option.originalIndex) {
                radio.checked = true;
                optionCard.classList.add('selected');
            }

            const optionText = document.createElement('span');
            optionText.className = 'option-text';
            optionText.textContent = option.text;

            radio.addEventListener('change', (e) => {
                // Remove selected class from all options
                document.querySelectorAll('.option-card').forEach(card => {
                    card.classList.remove('selected');
                });

                // Add selected class to current option
                e.target.closest('.option-card').classList.add('selected');

                // Save answer
                quizManager.setAnswer(parseInt(e.target.value));
                quizManager.saveProgress();
            });

            optionCard.appendChild(radio);
            optionCard.appendChild(optionText);
            this.elements.optionsContainer.appendChild(optionCard);
        });

        // Update button states
        this.updateNavigationButtons();
        this.updateQuestionIndicator();
    }

    /**
     * Update navigation button states
     */
    updateNavigationButtons() {
        const questionIndex = quizManager.currentQuestion;
        const isFirstQuestion = questionIndex === 0;
        const isLastQuestion = questionIndex === quizManager.questions.length - 1;

        // Previous button
        this.elements.prevBtn.disabled = isFirstQuestion;
        this.elements.prevBtn.style.opacity = isFirstQuestion ? '0.5' : '1';

        // Next button
        if (isLastQuestion) {
            this.elements.nextBtn.style.display = 'none';
            this.elements.submitBtn.style.display = 'block';
        } else {
            this.elements.nextBtn.style.display = 'block';
            this.elements.submitBtn.style.display = 'none';
        }
    }

    /**
     * Update question indicator dots
     */
    updateQuestionIndicator() {
        if (!quizConfig.showQuestionIndicator) return;

        const dots = this.elements.questionIndicator.querySelectorAll('.question-dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('current', 'answered', 'unanswered');

            if (index === quizManager.currentQuestion) {
                dot.classList.add('current');
            } else if (quizManager.getAnswer(index) !== null) {
                dot.classList.add('answered');
            } else {
                dot.classList.add('unanswered');
            }
        });
    }

    /**
     * Create question indicator dots
     */
    createQuestionIndicator() {
        if (!quizConfig.showQuestionIndicator) return;

        this.elements.questionIndicator.innerHTML = '';
        this.elements.questionIndicator.classList.add('show');

        for (let i = 0; i < quizManager.questions.length; i++) {
            const dot = document.createElement('button');
            dot.className = 'question-dot';
            dot.textContent = i + 1;
            dot.type = 'button';

            dot.addEventListener('click', () => {
                quizManager.goToQuestion(i);
                this.displayQuestion();
            });

            this.elements.questionIndicator.appendChild(dot);
        }

        this.updateQuestionIndicator();
    }

    /**
     * Update timer display
     */
    updateTimer(seconds) {
        this.elements.timerDisplay.textContent = formatTime(seconds);

        // Add warning styles
        if (seconds <= 60) {
            this.elements.timer.classList.add('critical');
            this.elements.timer.classList.remove('warning');
        } else if (seconds <= 300) {
            this.elements.timer.classList.add('warning');
            this.elements.timer.classList.remove('critical');
        } else {
            this.elements.timer.classList.remove('warning', 'critical');
        }
    }

    /**
     * Display quiz results
     */
    displayResults(results) {
        // Hide quiz container, show result container
        this.elements.quizContainer.style.display = 'none';
        this.elements.resultContainer.style.display = 'flex';

        // Display score
        this.elements.scoreNumber.textContent = results.correct;
        this.elements.scoreLabel.textContent = `out of ${results.total}`;
        this.elements.percentageDisplay.textContent = results.percentage + '%';

        // Display statistics
        this.elements.correctCount.textContent = results.correct;
        this.elements.incorrectCount.textContent = results.incorrect;
        this.elements.unansweredCount.textContent = results.unanswered;
        this.elements.timeTakenDisplay.textContent = formatTime(results.timeTaken);

        // Display grade
        const gradeElement = document.querySelector('.result-subtitle');
        if (gradeElement) {
            gradeElement.textContent = `Grade: ${results.grade.grade} - ${results.grade.label}`;
            gradeElement.style.color = results.grade.color;
        }

        // Display review
        if (quizConfig.allowReview) {
            this.displayAnswerReview(quizManager.getDetailedReview());
        } else {
            this.elements.answerReview.style.display = 'none';
            this.elements.toggleReviewBtn.style.display = 'none';
        }
    }

    /**
     * Display detailed answer review
     */
    displayAnswerReview(review) {
        this.elements.reviewList.innerHTML = '';

        review.forEach(item => {
            const reviewItem = document.createElement('div');
            reviewItem.className = `review-item ${item.isCorrect ? 'correct' : item.isAnswered ? 'incorrect' : 'unanswered'}`;

            let statusText = item.isCorrect ? '✓ Correct' : item.isAnswered ? '✗ Incorrect' : '○ Unanswered';
            let statusClass = item.isCorrect ? 'correct' : item.isAnswered ? 'incorrect' : 'unanswered';

            reviewItem.innerHTML = `
                <div class="review-question">Q${item.questionNumber}: ${item.question}</div>
                <div class="review-details">
                    <div class="review-detail-item">
                        <span class="review-detail-label">Your Answer:</span>
                        <span class="review-detail-value">${item.userAnswer}</span>
                    </div>
                    <div class="review-detail-item">
                        <span class="review-detail-label">Correct Answer:</span>
                        <span class="review-detail-value">${item.correctAnswer}</span>
                    </div>
                    <div class="review-detail-item">
                        <span class="review-status ${statusClass}">${statusText}</span>
                    </div>
                </div>
                <div class="review-explanation">
                    <strong>Explanation:</strong> ${item.explanation}
                </div>
            `;

            this.elements.reviewList.appendChild(reviewItem);
        });
    }

    /**
     * Show confirmation modal
     */
    showConfirmModal(title, message, onConfirm, onCancel) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-warning">
                    <h2>${title}</h2>
                    <p>${message}</p>
                </div>
                <div class="modal-buttons">
                    <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
                    <button class="btn btn-danger" id="confirmBtn">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const confirmBtn = modal.querySelector('#confirmBtn');
        const cancelBtn = modal.querySelector('#cancelBtn');

        confirmBtn.addEventListener('click', () => {
            modal.remove();
            if (typeof onConfirm === 'function') onConfirm();
        });

        cancelBtn.addEventListener('click', () => {
            modal.remove();
            if (typeof onCancel === 'function') onCancel();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                if (typeof onCancel === 'function') onCancel();
            }
        });
    }

    /**
     * Show alert
     */
    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);

        setTimeout(() => alert.remove(), 3000);
    }

    /**
     * Reset UI for new quiz
     */
    resetUI() {
        this.elements.resultContainer.style.display = 'none';
        this.elements.quizContainer.style.display = 'flex';
        this.elements.answerReview.classList.remove('active');
    }
}

/**
 * Create global UI controller instance
 */
const uiController = new QuizUIController();
