const app = Vue.createApp({
    data() {
        return {
            name: "Pairs",
            hasStarted: false,
            idx: -1,
            selectedAnswer: "",
            playAnswer: "",
            correctAnswers: 0,
            wrongAnswers: 0,
            count: 15,
            talkIndex: 0,
            isReadingAnswers: false,
            questions: this.generateQuestions(15),
            history: localStorage.getItem("history"),
            currentSession: new Date().valueOf(),
        };
    },
    methods: {
        generateQuestions(count) {
            let Questions = [];
            let Quiz = Pairs.slice();
            let randomPair, Question, correctAnswer;
            while (Questions.length < count) {
                randomPair = Math.floor(Math.random() * Quiz.length);
                Question = Quiz.splice(randomPair, 1)[0];
                correctAnswer = Math.floor(Math.random() * Question.length);

                Questions.push({
                    answers: Question,
                    correctAnswer: correctAnswer,
                });
            }

            return Questions;
        },
        answered(e) {
            this.selectedAnswer = e.target.value;
            if (this.selectedAnswer == this.questions[this.idx].correctAnswer) {
                this.correctAnswers++;
                // go to next question or end
                setTimeout(function() {
                    if (this.idx < this.count - 1) {
                        this.nextQuestion();
                    } else {
                        this.showResults();
                    }
                }.bind(this), 1000);
            } else {
                this.wrongAnswers++;
                this.talkIndex = 0;
                this.isReadingAnswers = true;
                this.talkAnswers();
            }
        },
        talkAnswers() {
            let answers = this.questions[this.idx]["answers"];
            if (this.talkIndex === answers.length) {
                this.isReadingAnswers = false;
                setTimeout(function() {
                    if (this.idx < this.count - 1) {
                        this.nextQuestion();
                    } else {
                        this.showResults();
                    }
                }.bind(this), 1000);
                return;
            } else {
                this.talk(answers[this.talkIndex]["word"]);
                setTimeout(function() {
                    this.talkIndex++;
                    this.talkAnswers();
                }.bind(this), 1000);
            }

        },
        nextQuestion() {
            this.idx++;
            this.selectedAnswer = "";
            this.talkIndex = 0;
            this.switchVoice();
            document.querySelectorAll("input").forEach((el) => (el.checked = false));
        },
        showResults() {
            this.idx++;
            let history = JSON.parse(localStorage.getItem("history")) || [];
            history.push({
                session: this.currentSession,
                correctAnswers: this.correctAnswers,
                wrongAnswers: this.wrongAnswers,
            });
            localStorage.setItem("history", JSON.stringify(history));
            this.history = history;
        },
        resetQuiz() {
            this.questions = this.generateQuestions(this.count);
            this.idx = 0;
            this.selectedAnswer = "";
            this.correctAnswers = 0;
            this.wrongAnswers = 0;
            this.switchVoice();
            this.currentSession = new Date().valueOf();
        },
        startQuizz() {
            this.hasStarted = true;
            this.resetQuiz();
        },
        talk(message) {
            new Audio('audio/' + this.randomVoice + '/' + message.toLowerCase() + '.mp3').play();
        },
        switchVoice() {
            this.randomVoice = Voices[Math.floor(Math.random() * Voices.length)];
        },
        speakCurrentQuestion() {
            this.talk(
                this.questions[this.idx]["answers"][
                    this.questions[this.idx]["correctAnswer"]
                ]["word"]
            );
        },
        formatDate(rawDate) {
            var date = new Date(rawDate);
            return (
                date.getMonth() +
                "/" +
                date.getDate() +
                " " +
                date.getHours() +
                ":" +
                date.getMinutes()
            );
        },
        backHome() {
            this.hasStarted = false;
        },
        clearHistory() {
            localStorage.setItem("history", JSON.stringify([]));
            this.backHome();
        },
        scheduleNotification() {
            if (!("Notification" in window)) {
                alert("Your browser doesn't support the Notification API.");
                return;
            }
            if (!("showTrigger" in Notification.prototype)) {
                alert("Your browser doesn't support the Notification Trigger API.");
                return;
            }

            Notification.requestPermission()
                .then(() => {
                    if (Notification.permission !== "granted") {
                        throw "Notification permission is not granted";
                    }
                })
                .then(() => navigator.serviceWorker.getRegistration())
                .then((reg) => {
                    reg.showNotification("Time to train your ears some more!", {
                        showTrigger: new TimestampTrigger(new Date().getTime() + 10 * 1000),
                        tag: new Date().getTime(), // a unique ID
                        body: "Remember, at least 20 min a day!", // content of the push notification
                        data: {
                            url: window.location.href, // pass the current url to the notification
                        },
                        badge: "images/icon-192x192.png",
                        icon: "images/icon-192x192.png",
                        actions: [{
                                action: 'open',
                                title: 'Open'
                            },
                            {
                                action: 'snooze',
                                title: 'Snooze',
                            }
                        ]
                    });
                })
                .catch((err) => {
                    alert("Notification Trigger API error: " + err);
                });
        },
    },
    computed: {
        currentQuestion() {
            return this.idx;
        },
    },
    watch: {
        currentQuestion(value) {
            if (this.idx < this.count) {
                this.speakCurrentQuestion();
            }
        },
    },
});

app.mount("#app");