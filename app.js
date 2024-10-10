const readline = require('readline');
const notifier = require('node-notifier');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let workDuration = 25 * 60;  
let shortBreakDuration = 5 * 60; 
let longBreakDuration = 15 * 60; 
let workSessionsCompleted = 0;
let isRunning = false;
let isPaused = false;
let timerId;
let remainingTime;

const sendNotification = (title, message) => {
    notifier.notify({
        title: title,
        message: message
    });
}

function askForSettings() {
    rl.question('Would you like to use default values ( Work 25 minutes | Short Break 5 minutes | Long Break 15 minutes )? (y/n):', (answer) => {
        if (answer.toLowerCase() === 'n') {
            setCustomDurations();
        } else {
            console.log('Using default values. Starting the timer...');
            startTimer(workDuration, 'work');
        }
    });
}

function setCustomDurations() {
    rl.question('Enter work duration in minutes: ', (input) => {
        workDuration = (parseInt(input) || 25) * 60;
        rl.question('Enter short break duration in minutes: ', (input) => {
            shortBreakDuration = (parseInt(input) || 5) * 60;
            rl.question('Enter long break duration in minutes : ', (input) => {
                longBreakDuration = (parseInt(input) || 15) * 60;
                console.log('Custom durations set. Starting the timer...');
                startTimer(workDuration, 'work');
            });
        });
    });
}

function clearConsole() {
    process.stdout.write('\x1Bc');
}

function displayTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Time left: ${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`);
}

function startTimer(duration, type) {
    clearConsole();
    remainingTime = duration;
    console.log(`Starting ${type} timer for ${duration / 60} minutes...`);
    isRunning = true;
    isPaused = false;
    sendNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} Timer`, `Starting ${type} for ${duration / 60} minutes`);

    timerId = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(timerId);
            isRunning = false;
            console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} is over!`);
            sendNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} Complete`, `${type.charAt(0).toUpperCase() + type.slice(1)} is done!`);
            if (type === 'work') {
                workSessionsCompleted++;
                if (workSessionsCompleted % 2 === 0) {
                    startTimer(longBreakDuration, 'long break');
                } else {
                    startTimer(shortBreakDuration, 'short break');
                }
            } else {
                startTimer(workDuration, 'work');
            }
            return;
        }
        remainingTime--;
        displayTime(remainingTime);
    }, 1000);
}

function startPomodoro() {
    if (isRunning) {
        console.log('Timer is already running. Please wait until it finishes.');
    } else {
        workSessionsCompleted = 0;
        startTimer(workDuration, 'work');
    }
}

function pauseTimer() {
    if (isRunning && !isPaused) {
        clearInterval(timerId);
        isPaused = true;
        console.log('Timer paused.');
        sendNotification('Timer Paused', 'The timer has been paused.');
    } else if (isPaused) {
        console.log('Timer is already paused.');
    } else {
        console.log('No timer is currently running.');
    }
}

function resumeTimer() {
    if (isPaused) {
        console.log('Resuming timer...');
        sendNotification('Timer Resumed', 'The timer has been resumed.');
        startTimer(remainingTime, 'work');
    } else {
        console.log('Timer is not paused.');
    }
}

function resetTimer() {
    if (isRunning || isPaused) {
        clearInterval(timerId);
        isRunning = false;
        isPaused = false;
        console.log('Timer reset.');
        sendNotification('Timer Reset', 'The timer has been reset.');
    } else {
        console.log('No timer is currently running.');
    }
}

function stopTimer() {
    if (isRunning || isPaused) {
        clearInterval(timerId);
        isRunning = false;
        isPaused = false;
        console.log('Timer stopped.');
        sendNotification('Timer Stopped', 'The timer has been stopped.');
    } else {
        console.log('No timer is currently running.');
    }
}

function showOptions() {
    console.log(`Available commands: s - start | p - pause | r - resume | x - reset | t - stop | h - show options | e - exit`);
}

function main() {
    console.log('------------------------------------------------- Welcome to Pomodoro Timer App ---------------------------------------');

    askForSettings();

    rl.on('line', (input) => {
        const command = input.trim().toLowerCase();

        switch (command) {
            case 's':
                startPomodoro();
                break;
            case 'p':
                pauseTimer();
                break;
            case 'r':
                resumeTimer();
                break;
            case 'x':
                resetTimer();
                break;
            case 't':
                stopTimer();
                break;
            case 'h':
                showOptions();
                break;
            case 'e':
                stopTimer();
                console.log('Exiting Timer. Goodbye!');
                rl.close();
                return; 
            default:
                console.log('Unknown command. Use "h" to show available options.');
        }
    });
}

main();
