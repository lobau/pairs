const app = Vue.createApp({
  data() {
    return {
      hasStarted: false,
      idx: 0,
      selectedAnswer: "",
      correctAnswers: 0,
      wrongAnswers: 0,
      count: 10,
      questions: this.generateQuestions(10),
    };
  },
  methods: {
    generateQuestions(count) {
      let Questions = [];
      let Quiz = Pairs_new.slice();
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
      } else {
        this.wrongAnswers++;
      }
      setTimeout(
        function () {
          if (this.idx < this.count - 1) {
            this.nextQuestion();
          } else {
            this.showResults();
          }
        }.bind(this),
        1000
      );
    },
    nextQuestion() {
      this.idx++;
      this.selectedAnswer = "";
      document.querySelectorAll("input").forEach((el) => (el.checked = false));
    },
    showResults() {
      this.idx++;
    },
    resetQuiz() {
      this.questions = this.generateQuestions(this.count);
      this.idx = 0;
      this.selectedAnswer = "";
      this.correctAnswers = 0;
      this.wrongAnswers = 0;
    },
    startQuizz() {
      this.hasStarted = true;
      this.speakCurrentQuestion();
    },
    talk(message) {
      if ("speechSynthesis" in window) {
        var utterance = new SpeechSynthesisUtterance();
        utterance.volume = 1;
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.text = message;
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
      }
    },
    speakCurrentQuestion() {
      this.talk(
        this.questions[this.idx]["answers"][
          this.questions[this.idx]["correctAnswer"]
        ]["word"]
      );
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