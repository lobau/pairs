# Pairs
A game for people to train their ear.
The base idea is that it's very hard to learn a language if your ears cannot distinguish the different sounds that the language uses. A lot of language tools go straight to the syntax, the grammar, the culture, but little is done to train the ear to *just* recognize the sounds. This is the goal of this app. No vocabulary, no lessons, just hearing reinforcement thru short sessions.

## Use cases
The goal of this app is to be used anywhere you have 5 minutes to spare. You don't need to speak our loud, you don't even need to concentrate. Just training your ears. It could be as simple as a screen playing a sound, and 2 different words you can tap on. Then something would tell you if you got it right or wrong.
A mobile app seems logical for the use case, but a wearable app could be a good companion, if not the main experience.

## Research
From [this paper](https://www.semanticscholar.org/paper/Teaching-the-%2Fr%2F%E2%80%93%2Fl%2F-discrimination-to-Japanese-and-McClelland-Fiez/072ff0f0262f092809945f65fd686191a02345cf?p2df):
Several studies have been conducted to address the learning of a nonnative speech contrast in adulthood, using native speakers of Japanese and the English /r/-/l/ contrast. Japanese adults were asked to identify contrasting /r/-/l/ stimuli (e.g., "rock-lock"). An adaptive training regime starting with initially easy stimuli was contrasted with a fixed training regime using difficult stimuli, with some subjects receiving feedback on the correctness of their responses and others receiving no feedback in both conditions. After three and six sessions of training, subjects received tests assessing identification and discrimination of /r/-/l/ stimuli as well as generalization. In all cases except fixed training without feedback, subjects showed clear evidence of learning, and several indicators suggested that training affects speech perception, rather than simply auditory processes. Neuroimaging studies currently underway are examining the neural basis of these findings.

### Links
- https://files.eric.ed.gov/fulltext/EJ1174231.pdf
- An old but good blog post about it https://blog.fluent-forever.com/learning-pronunciation/

## Possible later improvements
- Storing the phonetic pronunciation of each word, so the app learn which phonemes the user has the hardest time with, and focus on those. For example, the app could notice that the user get the `ə` sound wrong often, and focus more on words containing it, like `Kernel`
- The initial list of word is in English, but that could be adapted to many languages, like French, German, or Mandarin.

## How to run
This is totally client side. Just serve the files on an http server (I usually use livereload during developement) and open index.html

## Technology used
This app uses:
- [Vue](https://vuejs.org/) for the UI 
- The [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) to play audio
- The [Notification API](https://notifications.spec.whatwg.org/) to trigger push notifications
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) and [PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) for keeping track of past sessions score.

## Warning
I believe that it's important when learning English to avoid saying curse words when mispronouncing words. For example, at my time at Apple I learnt the hard way to not misspronounce "sheets" when talking about the view that roll down from windows. As such, I believe it's important to train your ears on the differences between bitch and beach, shit and sheet, shart and chart, etc.
If you are offended by this decision, please do not use this software.
