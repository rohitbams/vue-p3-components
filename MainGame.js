import { ref, computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import Scoreboard from './Scoreboard.js'
import Quiz from './Quiz.js'

export default {
  name: 'MainGame',
  components: {
    Scoreboard,
    Quiz
  },

  setup() {
    const currentQuestion = ref(null);
    const guessedLetters = ref([]);
    const currentScore = ref(26);
    const userGuesses = ref({
      phrase: '',
      number: null
    });
    const sessionScores = ref([]);
    const gameMode = ref('welcome');
    const isLoading = ref(false);

    const getRandomMathLocal = async function() {
      try {
        const response = await fetch('./mathfacts.json');
        if (!response.ok) {
          throw new Error('Failed to load local cache')
        }
        const facts = await response.json();
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        
        return randomFact;
      } catch (err) {
        console.error('Failed to load local cache:', err)
        return {
          text: "is the number of degrees in a circle",
          number: 360
        }
      }
    }

    const maskedFact = computed(() => {
      if (!currentQuestion.value) {
        return '';
      } else { 
        return currentQuestion.value.text.split('').map(char => {
        if (!/[a-zA-Z]/.test(char)) return char
        if (guessedLetters.value.includes(char.toLowerCase())) return char
        return '_';
      }).join('')}
    })

    const fetchQuestion = async () => {
      isLoading.value = true
      try {
        const response = await fetch('http://numbersapi.com/random/math?json')
        if (!response.ok) throw new Error('API request failed')
        const data = await response.json()
        currentQuestion.value = {
          text: data.text.replace(`${data.number} `, '').replace('.', '').trim(),
          number: data.number
        }
      } catch (error) {
        console.error('Failed to fetch from API, trying local file:', error)
        try {
          const localCacheData = await getRandomMathLocal()
          currentQuestion.value = {
            text: localCacheData.text.replace(`${localCacheData.number} `, '').replace('.', '').trim(),
            number: localCacheData.number
          }
        } catch (localError) {
          console.error('All fetching attempts failed:', localError)
          currentQuestion.value = {
            text: "is the number of degrees in a circle",
            number: 360
          }
        }
      } finally {
        isLoading.value = false
      }
    }

    const startNewGame = async () => {
      currentScore.value = 26
      guessedLetters.value = []
      userGuesses.value = { phrase: '', number: null }
      gameMode.value = 'main'
      await fetchQuestion()
    }

    const makeGuess = (letter) => {
      if (!guessedLetters.value.includes(letter)) {
        guessedLetters.value.push(letter)

        if (!currentQuestion.value.text.toLowerCase().includes(letter)) {
          const nonMatchingLetters = 26 - new Set(currentQuestion.value.text.toLowerCase().match(/[a-z]/g)).size
          currentScore.value = Math.max(0, Math.round(currentScore.value - (26 / nonMatchingLetters)))
        }
        if (guessedLetters.size === 26) {
          currentScore.value = 0;
        }
      }
    }

    const submitAnswer = () => {
      const result = {
        score: currentScore.value,
        phrase: currentQuestion.value.text,
        text: currentQuestion.value.text,
        number: currentQuestion.value.number,
        playerPhrase: userGuesses.value.phrase.replace('.', '').trim(),
        playerNumber: parseInt(userGuesses.value.number),
        timestamp: new Date().getTime()
      }
    
      sessionScores.value.push(result)
      gameMode.value = 'scores'
    }

    const getLetterStatus = (letter) => {
      if (!guessedLetters.value.includes(letter)) return ''
      return currentQuestion.value.text.toLowerCase().includes(letter) ? 'correct' : 'incorrect'
    }

    return {
      currentQuestion,
      guessedLetters,
      currentScore,
      userGuesses,
      sessionScores,
      gameMode,
      isLoading,
      maskedFact,
      makeGuess,
      submitAnswer,
      startNewGame,
      getLetterStatus
    }
  },

  template: `



    <div class="game-layout">
     <div class="game-navbar">
     <h4>Navigation</h4>
        <ul>
        <li><a href="">Home</a></li>
        <li><a href="">About us</a></li>
        <li><a href="">More games</a></li>
        <li><a href="">Newsletter</a></li>
        <li><a href="">Contact us</a></li>
        </ul>
      </div>
      <div class="game-content">
      

        <div v-if="gameMode === 'welcome'" class="welcome-screen">
                <h2>Guess the Maths Fact</h2>

          <h3>Test your maths knowledge!</h3>
          <p>Guess the hidden fact and then work out the number it describes!</p>
          <button class="start-button" v-on:click="startNewGame">Start Game</button>
        </div>

        <template v-else>
          <div v-if="gameMode === 'main'">
            <div v-if="isLoading">Loading...</div>
            
            <template v-else>
              <div>Current Score: {{ currentScore }}</div>
              
              <div class="question">
                <h3>Hidden Fact:</h3>
                <p>{{ maskedFact }}</p>
              </div>
              
              <div class="letter-grid">
                <button 
                  v-for="letter in 'abcdefghijklmnopqrstuvwxyz'"
                  :key="letter"
                  :disabled="guessedLetters.includes(letter)"
                  :class="getLetterStatus(letter)"
                  v-on:click="makeGuess(letter)"
                >
                  {{ letter.toUpperCase() }}
                </button>
              </div>
              
              <div class="input-group">
                <label for="phraseGuess">Your phrase guess:</label>
                <input 
                  id="phraseGuess"
                  v-model="userGuesses.phrase"
                  type="text"
                >
              </div>
              
              <div class="input-group">
                <label for="numberGuess">Your number guess:</label>
                <input 
                  id="numberGuess"
                  v-model="userGuesses.number"
                  type="number"
                >
              </div>
              
              <button 
                v-on:click="submitAnswer"
                :disabled="!userGuesses.phrase || !userGuesses.number"
              >
                Submit Final Answer
              </button>
            </template>
          </div>

          <Scoreboard
            v-if="gameMode === 'scores'"
            :scores="sessionScores"
            v-on:start-new-game="startNewGame"
            v-on:start-quiz="gameMode = 'quiz'"
          />

          <Quiz
            v-if="gameMode === 'quiz'"
            :facts="sessionScores"
            v-on:return-to-scores="gameMode = 'scores'"
          />
        </template>
      </div>

      <div class="game-sidebar">
        <div class="aim-section">
          <h2>Game Aim</h2>
            <ul>
              <li>Work out the hidden maths fact</li>
              <li>Then work out which number the fact describes</li>
              <li>Then test your memory by playing the Quiz</li>
            </ul>
        </div> 
        <div class="rules-section">
          <h2>Game Rules</h2>
          <ul>
            <li>You start with 26 points (one for each letter)</li>
            <li>Click letters to reveal the hidden math fact</li>
            <li>Each incorrect letter guess reduces your score</li>
            <li>Try to guess both the phrase and the number</li>
            <li>Submit your answer when you're ready</li>
          </ul>
        </div>

        <div class="scoring-section">
          <h2>Scoring System</h2>
          <ul>
            <li>You start each round with 26 points</li>
            <li>Points are deducted for every wrong letter you guess</li>
            <li>If you click every letter button, your score turns to 0!</li>
            <li>If you correctly guess both phrase and number correct, you get +4 points</li>
            <li>If you only guess one correct (phrase or number), you get +2 points</li>
            <li>If you get both guesses wrong, you get no extra points</li>
            <li>Maximum possible score: 30 points</li>
          </ul>
        </div>

        </div>

      </div>

   
  `
}