import { Pairs } from "../data_words.js";
import * as voice from "./tts.js";

const QUESTION_COUNT = 15;
const CORRECT_DELAY = 1000;
const ANSWER_GAP = 400;
const NEXT_DELAY = 1000;
const PLAY_TIMEOUT = 20000;

const ICON_CORRECT =
    '<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M1,5L5,9L11,2" fill="none" stroke="var(--color-correct)" stroke-width="2" stroke-linecap="round"/></svg>';
const ICON_WRONG =
    '<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M2,2L10,10M2,10L10,2" fill="none" stroke="var(--color-incorrect)" stroke-width="2" stroke-linecap="round"/></svg>';

const screens = {
    loading: document.getElementById("screen-loading"),
    intro: document.getElementById("screen-intro"),
    quiz: document.getElementById("screen-quiz"),
    results: document.getElementById("screen-results")
};

const ui = {
    loadStatus: document.getElementById("loadStatus"),
    loadBar: document.getElementById("loadBar"),
    loadError: document.getElementById("loadError"),
    start: document.getElementById("startButton"),
    counter: document.getElementById("quizCounter"),
    answers: document.getElementById("answers"),
    replay: document.getElementById("replayButton"),
    resultsTitle: document.getElementById("resultsTitle"),
    history: document.getElementById("historyBody"),
    newSession: document.getElementById("newSessionButton"),
    clearHistory: document.getElementById("clearHistoryButton")
};

const state = {
    idx: -1,
    questions: [],
    labels: [],
    selected: null,
    locked: true,
    correctAnswers: 0,
    wrongAnswers: 0,
    currentSession: Date.now(),
    history: readHistory(),
    // Bumped whenever the session is restarted so in-flight read-outs stop.
    round: 0
};

const audio = new Audio();

function readHistory() {
    try {
        return JSON.parse(localStorage.getItem("history")) || [];
    } catch (e) {
        return [];
    }
}

function show(name) {
    Object.keys(screens).forEach(function(key) {
        screens[key].hidden = key !== name;
    });
}

function generateQuestions(count) {
    const quiz = Pairs.slice();
    const questions = [];

    while (questions.length < count && quiz.length) {
        const answers = quiz.splice(Math.floor(Math.random() * quiz.length), 1)[0];
        questions.push({
            answers: answers,
            correctAnswer: Math.floor(Math.random() * answers.length)
        });
    }

    return questions;
}

function currentQuestion() {
    return state.questions[state.idx];
}

function wordToPlay() {
    const question = currentQuestion();
    return question.answers[question.correctAnswer].word;
}

function playUrl(url) {
    return new Promise(function(resolve) {
        let finished = false;
        let timer = null;

        const done = function() {
            if (finished) return;
            finished = true;
            audio.removeEventListener("ended", done);
            audio.removeEventListener("error", done);
            clearTimeout(timer);
            resolve();
        };

        audio.addEventListener("ended", done);
        audio.addEventListener("error", done);
        audio.src = url;
        audio.play().catch(done);
        // Guards against a stalled element leaving the quiz stuck.
        timer = setTimeout(done, PLAY_TIMEOUT);
    });
}

function synthesizing(on) {
    ui.replay.disabled = on;
    ui.replay.textContent = on ? "…" : "Replay audio";
}

// Speaks the word of the current question; the distractors are warmed in the background.
async function speakCurrent() {
    const round = state.round;
    try {
        synthesizing(true);
        const url = await voice.speak(wordToPlay());
        if (round !== state.round) return;
        synthesizing(false);
        playUrl(url);
    } catch (e) {
        synthesizing(false);
        showError(e);
    }
}

function warmUpDistractors() {
    const question = currentQuestion();
    const upcoming = question.answers
        .filter(function(answer, index) {
            return index !== question.correctAnswer;
        })
        .map(function(answer) {
            return answer.word;
        });

    const next = state.questions[state.idx + 1];
    if (next) {
        next.answers.forEach(function(answer) {
            upcoming.push(answer.word);
        });
    }

    voice.prefetch(upcoming);
}

function answerLabel(answer, index) {
    const label = document.createElement("label");
    label.className = "answerButton";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.className = "hidden";
    input.value = String(index);

    label.appendChild(input);
    label.appendChild(document.createTextNode(answer.word));

    const hint = document.createElement("small");
    hint.textContent = "'" + answer.phonetic + "\\";
    label.appendChild(hint);

    label.addEventListener("change", function() {
        answered(index);
    });

    return label;
}

function renderQuestion() {
    const question = currentQuestion();

    ui.counter.textContent = state.idx + 1 + " / " + state.questions.length;
    ui.answers.textContent = "";
    state.labels = question.answers.map(function(answer, index) {
        const label = answerLabel(answer, index);
        ui.answers.appendChild(label);
        return label;
    });
}

function markAnswered() {
    const question = currentQuestion();

    state.labels.forEach(function(label, index) {
        const hint = label.querySelector("small");
        const input = label.querySelector("input");
        input.disabled = true;

        if (index === question.correctAnswer) {
            label.classList.add("answer_correct");
            hint.innerHTML = ICON_CORRECT + "&nbsp;Correct answer";
        } else if (index === state.selected) {
            label.classList.add("answer_wrong");
            hint.innerHTML = ICON_WRONG + "&nbsp;Incorrect!";
        }
    });
}

function answered(index) {
    if (state.locked) return;
    state.locked = true;
    state.selected = index;
    markAnswered();

    if (index === currentQuestion().correctAnswer) {
        state.correctAnswers++;
        setTimeout(advance, CORRECT_DELAY);
        return;
    }

    state.wrongAnswers++;
    readAnswers();
}

// A wrong answer plays every option out loud, marking the one being spoken.
async function readAnswers() {
    const round = state.round;
    const question = currentQuestion();

    for (let index = 0; index < question.answers.length; index++) {
        if (round !== state.round) return;
        state.labels[index].classList.add("answer_play");
        try {
            playUrl(await voice.speak(question.answers[index].word));
        } catch (e) {
            showError(e);
            return;
        }
        if (round !== state.round) return;
        state.labels[index].classList.remove("answer_play");
        await wait(ANSWER_GAP);
    }

    if (round !== state.round) return;
    await wait(NEXT_DELAY);
    if (round !== state.round) return;
    advance();
}

function advance() {
    if (state.idx < state.questions.length - 1) {
        state.idx++;
        askCurrent();
    } else {
        showResults();
    }
}

function askCurrent() {
    state.selected = null;
    state.locked = false;
    renderQuestion();
    speakCurrent();
    warmUpDistractors();
}

function startSession() {
    state.round++;
    state.questions = generateQuestions(QUESTION_COUNT);
    state.idx = 0;
    state.selected = null;
    state.correctAnswers = 0;
    state.wrongAnswers = 0;
    state.currentSession = Date.now();
    show("quiz");
    askCurrent();
}

function showResults() {
    state.round++;
    state.locked = true;

    state.history.push({
        session: state.currentSession,
        correctAnswers: state.correctAnswers,
        wrongAnswers: state.wrongAnswers
    });
    localStorage.setItem("history", JSON.stringify(state.history));

    ui.resultsTitle.textContent = state.correctAnswers >= state.questions.length / 2 ? "Well done!" : "Well…";
    renderHistory();
    show("results");
}

function renderHistory() {
    ui.history.textContent = "";

    state.history
        .slice()
        .reverse()
        .forEach(function(entry) {
            const row = document.createElement("tr");
            if (entry.session === state.currentSession) row.className = "answer_correct";
            [formatDate(entry.session), entry.correctAnswers, entry.wrongAnswers].forEach(function(value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });
            ui.history.appendChild(row);
        });
}

function formatDate(rawDate) {
    const date = new Date(rawDate);
    return (
        date.getMonth() +
        "/" +
        date.getDate() +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes()
    );
}

function wait(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
}

function formatBytes(bytes) {
    return (bytes / 1000000).toFixed(1) + " MB";
}

function onProgress(update) {
    ui.loadStatus.textContent = update.stage;

    if (update.received && update.total) {
        ui.loadBar.value = Math.round((update.received / update.total) * 100);
        ui.loadStatus.textContent =
            update.stage + " (" + formatBytes(update.received) + " of " + formatBytes(update.total) + ")";
    } else {
        ui.loadBar.value = update.ratio === null ? 0 : Math.round(update.ratio * 100);
    }
}

function showError(error) {
    console.error(error);
    screens.loading.hidden = false;
    ui.loadError.hidden = false;
    ui.loadError.textContent = error && error.message ? error.message : String(error);
}

ui.replay.addEventListener("click", speakCurrent);
ui.start.addEventListener("click", startSession);
ui.newSession.addEventListener("click", startSession);
ui.clearHistory.addEventListener("click", function() {
    localStorage.setItem("history", JSON.stringify([]));
    state.history = [];
    show("intro");
});

voice
    .init(onProgress)
    .then(function() {
        show("intro");
    })
    .catch(showError);

show("loading");
