// Data Storage
let userData = {
    steps: 0,
    stepCalories: 0,
    exerciseCalories: 0,
    exercises: []
};

let currentExercise = null;
let timerInterval = null;
let timerSeconds = 0;
const STEP_GOAL = 10000;
const CALORIES_PER_STEP = 0.04; // Approximate calories burned per step

// Load data from localStorage
function loadData() {
    const stored = localStorage.getItem('fittrackData');
    if (stored) {
        userData = JSON.parse(stored);
    }
    updateDashboard();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('fittrackData', JSON.stringify(userData));
}

// Update Steps
function updateSteps() {
    const input = document.getElementById('stepInput');
    const steps = parseInt(input.value) || 0;

    if (steps < 0) {
        alert('Please enter a valid number of steps');
        return;
    }

    userData.steps = steps;
    userData.stepCalories = Math.round(steps * CALORIES_PER_STEP);

    updateDashboard();
    saveData();
    input.value = '';

    // Show celebration if goal reached
    if (steps >= STEP_GOAL) {
        showCelebration('🎉 Goal Reached! Great job!');
    }
}

// Update Dashboard Display
function updateDashboard() {
    // Update steps
    document.getElementById('steps').textContent = userData.steps.toLocaleString();

    // Update step calories
    document.getElementById('stepCalories').textContent = userData.stepCalories + ' kcal';

    // Update exercise calories
    const totalExerciseCalories = userData.exercises.reduce((sum, ex) => sum + ex.calories, 0);
    userData.exerciseCalories = totalExerciseCalories;
    document.getElementById('exerciseCalories').textContent = userData.exerciseCalories + ' kcal';

    // Update total calories
    const totalCalories = userData.stepCalories + userData.exerciseCalories;
    document.getElementById('totalCalories').textContent = totalCalories + ' kcal';

    // Update progress bar
    const progressPercent = Math.min((userData.steps / STEP_GOAL) * 100, 100);
    const progressBar = document.getElementById('stepProgress');
    progressBar.style.width = progressPercent + '%';

    // Update step goal text
    document.getElementById('stepGoalText').textContent = 
        userData.steps.toLocaleString() + ' / ' + STEP_GOAL.toLocaleString() + ' steps';

    // Update progress bar text
    if (progressPercent > 10) {
        progressBar.textContent = Math.round(progressPercent) + '%';
    }
}

// Start Exercise
function startExercise(exerciseName, calorieRate) {
    // Reset previous timer if any
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    currentExercise = {
        name: exerciseName,
        calorieRate: calorieRate, // Calories per minute
        startTime: Date.now()
    };

    timerSeconds = 0;
    document.getElementById('currentExercise').textContent = 'Currently doing: ' + exerciseName;
    document.getElementById('timer').textContent = '00:00';

    // Start timer
    timerInterval = setInterval(() => {
        timerSeconds++;
        updateTimer();
    }, 1000);
}

// Update Timer Display
function updateTimer() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;

    const displayMins = String(minutes).padStart(2, '0');
    const displaySecs = String(seconds).padStart(2, '0');

    document.getElementById('timer').textContent = displayMins + ':' + displaySecs;
}

// Stop Exercise
function stopExercise() {
    if (!currentExercise) {
        alert('No exercise in progress');
        return;
    }

    clearInterval(timerInterval);

    // Calculate calories burned
    const minutes = timerSeconds / 60;
    const caloriesBurned = Math.round(minutes * currentExercise.calorieRate);

    // Store exercise data
    userData.exercises.push({
        name: currentExercise.name,
        duration: timerSeconds,
        calories: caloriesBurned,
        date: new Date().toLocaleDateString()
    });

    // Display results
    displayResults(currentExercise.name, timerSeconds, caloriesBurned);

    // Update dashboard
    updateDashboard();
    saveData();

    // Reset
    currentExercise = null;
    timerSeconds = 0;
    document.getElementById('currentExercise').textContent = 'Select an exercise to begin';
    document.getElementById('timer').textContent = '00:00';
}

// Display Exercise Results
function displayResults(exerciseName, duration, calories) {
    document.getElementById('resultExercise').textContent = exerciseName;

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const timeString = minutes > 0 
        ? minutes + ' min ' + seconds + ' sec' 
        : seconds + ' seconds';

    document.getElementById('resultTime').textContent = timeString;
    document.getElementById('resultCalories').textContent = calories + ' kcal';

    // Show celebration
    showCelebration('💪 Great work! Exercise completed!');
}

// Show Celebration Message
function showCelebration(message) {
    const celebration = document.createElement('div');
    celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px 50px;
        border-radius: 15px;
        font-size: 1.5em;
        font-weight: bold;
        z-index: 1000;
        animation: popIn 0.5s ease-out;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    `;
    celebration.textContent = message;

    document.body.appendChild(celebration);

    setTimeout(() => {
        celebration.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => celebration.remove(), 500);
    }, 2000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes popIn {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadData);