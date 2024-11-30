import { ref, computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

export default {
  name: 'Scoreboard',
  props: {
    scores: {
      type: Array,
      required: true
    }
  },

  emits: ['start-new-game', 'start-quiz'],

  setup(props) {
    const sortKey = ref('score')
    const sortDirection = ref('desc')

    const sortedScores = computed(() => {
      return [...props.scores].sort((a, b) => {
        let compareA = a[sortKey.value]
        let compareB = b[sortKey.value]

        if (typeof compareA === 'string') {
          compareA = compareA.toLowerCase()
          compareB = compareB.toLowerCase()
        }

        const modifier = sortDirection.value === 'desc' ? -1 : 1
        return modifier * (compareA < compareB ? -1 : compareA > compareB ? 1 : 0)
      })
    })

    const toggleSort = (key) => {
      if (sortKey.value === key) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortKey.value = key
        sortDirection.value = 'desc'
      }
    }

    return {
      sortKey,
      sortDirection,
      sortedScores,
      toggleSort
    }
  },

  template: `
  <div class="scoreboard">
    <h2>Previous Scores</h2>
    
    <div>
      <button v-on:click="$emit('start-new-game')">Play Again</button>
      <button v-on:click="$emit('start-quiz')">Quiz Me!</button>
    </div>

    <table>
      <thead>
        <tr>
          <th v-on:click="toggleSort('score')">
            Score {{ sortKey === 'score' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
          </th>
          <th v-on:click="toggleSort('number')">
            Number {{ sortKey === 'number' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
          </th>
          <th v-on:click="toggleSort('phrase')">
            Phrase {{ sortKey === 'phrase' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
          </th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="score in sortedScores" :key="score.timestamp">
          <td>{{ score.score }}</td>
          <td>{{ score.number }}</td>
          <td>{{ score.phrase }}</td>
          <td>{{ score.playerNumber === score.number && 
                 score.playerPhrase.toLowerCase() === score.phrase.toLowerCase() 
                 ? 'Correct!' : 'Incorrect!' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
`
}