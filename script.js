/* function say(message) {} */

const app = Vue.createApp({
  data() {
    this.Pairs = [
      ["Lock", "Rock"],
      ["Wash", "Wish"],
      ["Lose", "Loose"],
      ["Advice", "Advise"],
      ["Affect", "Effect"],
      ["Compliment", "Complement"],
      ["Hang", "Hung"],
      ["Price", "Prize"],
      ["Bed", "Bad"],
      ["Sing", "Thing"],
      ["Sick", "Thick"],
      ["She", "Sea"],
      ["Best", "Vest"],
      ["Sue", "Shoe"],
      ["Glass", "Grass"],
      ["Hat", "Fat", "Rat"],
      ["Lip", "Rip"],
      ["Lice", "Rice"],
      ["Right", "Light", "Late"],
      ["Long", "Wrong"],
      ["Walk", "Work"],
      ["Very", "Berry"],
      ["Fan", "Van"],
      ["Paper", "Pepper"],
      ["Ship", "Sheep"],
      ["Shit", "Sheet"],
      ["Bitch", "Beach", "Peach"],
      ["Button", "Bottom"],
      ["Feel", "Fill"],
      ["Bold", "Bald"],
      ["Trader", "Traitor"],
      ["Diary", "Dairy"],
      ["Chew", "Shoe"],
      ["To", "Too"],
      ["Break", "Brake"],
      ["Illusion", "Allusion"],
      ["Intention", "Attention"],
      ["Bill", "Bell"],
      ["Fill", "Fell", "Feel"],
      ["Hill", "Hell"],
      ["Eerie", "Erie"],
      ["Incite", "Inside"],
      ["Decease", "Disease"],
      ["Seem", "Seam", "Sim"],
      ["Scene", "Seen", "Sin"],
      ["Mayor", "Major"],
      ["Green", "Grain", "Grin"],
      ["Groan", "Grown"],
      ["Star", "Stair", "Stare"], // Same?
      ["Will", "Well"],
      ["Bliss", "Bless"],
      ["Hid", "Head"],
      ["Win", "When"],
      ["Size", "Sides"],
      ["Vote", "What"],
      ["Golf", "Gulf", "Gulp"],
      ["Do", "Dough"],
      ["Pushy", "Pussy"],
      ["Breast", "Breath"],
      ["Thief", "Teeth"],
      ["Course", "Curse"],
      ["Fat", "Fart", "Vat"],
      ["That", "Vat"],
      ["Pawn", "Porn"],
      ["West", "Waste", "Waist"], //same?
      ["Sheet", "Shit"],
      ["Seat", "Sit"],
      ["Soup", "Soap"],
      ["Plan", "Plane"],
      ["Road", "Rod"],
      ["Latter", "Ladder", "Later"],
      ["Leader", "Liter"],
      ["Letter", "Litter"],
      ["Ketchup", "Catch up"],
      ["Desert", "Dessert"],
      ["Conform", "Confirm"],
      ["Ask", "Axe"],
      ["Fire", "Fired"],
      ["Older", "Order"],
      ["Man", "Men"],
      ["Woman", "Women"],
      ["Fill", "Feel"],
      ["Breath", "Brief"],
      ["Rid", "Raid"],
      ["Doll", "Dull"],
      ["Ant", "Aunt"],
      ["Fast", "First"],
      ["Coal", "Cool", "Call"],
      ["Meadow", "Medal"],
      ["Show", "Saw"],
      ["So", "Soul"],
      ["No", "Now", "Know"], // Same?
      ["Gone", "Gun"],
      ["Toes", "Those"],
      ["Mess", "Meth"],
      ["Ass", "As"],
      ["Pose", "Pause", "Paws"],
      ["Bag", "Beg"],
      ["Rent", "Rant"],
      ["Does", "Those"],
      ["Chris", "Crease"],
      ["Third", "Turd"],
      ["Ball", "Bowl"],
      ["Broke", "Brooke"],
      ["Broke", "Block"],
      ["Ion", "Iron"],
      ["Eat", "Heat"],
      ["Filling", "Filing"],
      ["Air", "Hair"],
      ["Heal", "Hill"],
      ["Poll", "Paul"],
      ["Sock", "Suck"],
      ["Fox", "Fucks", "Forks"],
      ["Source", "Sauce"],
      ["Chique", "Cheek"],
      ["Discussed", "Disgusted"],
      ["Switch", "Swish"],
      ["Close", "Claws", "Clause", "Clothes"],
      ["Tall", "Toll"],
      ["Atom", "Adam"],
      ["Savor", "Saver"],
      ["meteor", "meatier"],
      ["Russian", "Ration"],
      ["Route", "Root"],
      ["Raider", "Radar"],
      ["Martyr", "Murder"],
      ["Trust", "Thrust"],
      ["List", "Least"],
      ["Take", "Tech"],
      ["Annal", "Anal"],
      ["Sink", "Think"],
      ["Prism", "Prison"],
      ["Cot", "Caught"],
      ["Laugh", "Loaf"],
      ["Knotty", "Naughty"],
      ["Claire", "Clear"],
    ];

    return {
      hasStarted: false,
      idx: 0,
      selectedAnswer: "",
      correctAnswers: 0,
      wrongAnswers: 0,
      count: 10,
      questions: this.generateQuestions(),
    };
  },
  methods: {
    generateQuestions() {
      let Questions = [];
      let Quiz = this.Pairs;
      let randomPair, Question, correctAnswer;
      while (Questions.length < 10) {
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
      this.hasStarted = true;
      this.idx = 0;
      this.selectedAnswer = "";
      this.correctAnswers = 0;
      this.wrongAnswers = 0;
      this.questions = this.generateQuestions();
      this.speakCurrentQuestion();
    },
    talk(message) {
      if ("speechSynthesis" in window) {
        var utterance = new SpeechSynthesisUtterance();
        utterance.volume = 1; // 0 to 1
        utterance.rate = 0.8; // 0.1 to 10
        utterance.pitch = 1; //0 to 2
        utterance.text = message;
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
      }
    },
    speakCurrentQuestion() {
      this.talk(
        this.questions[this.idx]["answers"][
          this.questions[this.idx]["correctAnswer"]
        ]
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
  }
});

app.mount("#app");
