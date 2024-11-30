import { ref, computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

export default {
  name: 'Quiz',
  props: {
    facts: {
      type: Array,
      required: true
    }
  },

  emits: ['return-to-scores'],

  setup(props, { emit }) {
    const userAnswers = ref({})
    const showResults = ref(false)
    
    props.facts.forEach(fact => {
      userAnswers.value[fact.timestamp] = null
    })

    const results = computed(() => {
        return props.facts.map(fact => ({
          fact: fact.text || fact.phrase,
          correctNumber: fact.number,
          userGuess: userAnswers.value[fact.timestamp],
          isCorrect: parseInt(userAnswers.value[fact.timestamp]) === fact.number
        }))
      })

    const score = computed(() => {
      return results.value.filter(r => r.isCorrect).length
    })

    const submitQuiz = () => {
      showResults.value = true
    }

    return {
      userAnswers,
      showResults,
      results,
      score,
      submitQuiz
    }
  },

  template: `
  <div>
    <h2>Quiz Time!</h2>
    <p>Do you remember the number from the previous facts? 
        Enter them below under the corresponding facts:</p>

    <div v-if="!showResults">
      <div v-for="fact in facts" :key="fact.timestamp" class="quiz-question">
        <p class="fact-text">"{{ fact.text }}"</p>
        <div class="input-group">
          <label>What number is this fact about?</label>
          <input 
            type="number" 
            v-model="userAnswers[fact.timestamp]"
            placeholder="Enter the number"
          >
        </div>
      </div>
      
      <button 
        v-on:click="submitQuiz"
        :disabled="Object.values(userAnswers).includes(null)"
      >
        Check Answers
      </button>
    </div>

    <div v-else>
      <h3>Your Results:</h3>
      <p>You got {{ score }} out of {{ facts.length }} correct!</p>
      
      <div v-for="result in results" :key="result.fact">
        <p class="fact-text">"{{ result.fact }}"</p>
        <p>Correct number: {{ result.correctNumber }}</p>
        <p>Your answer: 
          <span :class="result.isCorrect ? 'correct' : 'incorrect'">
            {{ result.userGuess }}
            {{ result.isCorrect ? '✓' : '✗' }}
          </span>
        </p>
      </div>

      <button v-on:click="$emit('return-to-scores')">Back to Scores</button>
    </div>
  </div>
`
}