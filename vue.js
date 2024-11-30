// import { ref, computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

// // fetch data locally
// async function getRandomMathLocal() {
//     try {
//         const response = await fetch('mathfacts.json');
//         if (!response.ok) {
//             throw new Error('Failed to load local cache');
//         }
//         const facts = await response.json();
//         // Get a random fact from the array
//         const randomFact = facts[Math.floor(Math.random() * facts.length)];
//         return {
//             text: randomFact.text,
//             number: randomFact.number
//         };
//     } catch (err) {
//         console.error('Failed to load local cache:', err);
//         // If even local cache fails, return a basic fact as last resort
//         return {
//             text: "is the number of degrees in a circle",
//             number: 360
//         };
//     }
// }


// const setup = function () {
//     const data = ref(null)
//     const guessedLetters = ref([])
//     const numberGuess = ref('')
//     const phraseGuess = ref('')
//     const gameStarted = ref(false)
//     const gameEnded = ref(false)
//     const phraseCorrect = ref(false)
//     const numberCorrect = ref(false)
//     const currentScore = ref(26)
//     const sessionScores = ref([])
//     const sortKey = ref('score') // for sorting
//     const sortDirection = ref('desc') // 'asc' or 'desc'

//     const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')

//     // mask letters in the fact phrase 
//     const maskedFact = computed(() => {
//         if (!data.value) return '';

//         return data.value.text.split('').map(char => {
//             if (!/[a-zA-Z]/.test(char)) {
//                 return char;
//             }
//             if (guessedLetters.value.includes(char.toLowerCase())) {
//                 return char;
//             }
//             return '_';
//         }).join('');
//     });

//     // sort scores
//     const sortedScores = computed(() => {
//         return [...sessionScores.value].sort((a, b) => {
//             let compareA = a[sortKey.value]
//             let compareB = b[sortKey.value]

//             // Handle string comparison for phrases
//             if (typeof compareA === 'string') {
//                 compareA = compareA.toLowerCase()
//                 compareB = compareB.toLowerCase()
//             }

//             // apply sort direction
//             const modifier = sortDirection.value === 'desc' ? -1 : 1

//             return modifier * (compareA < compareB ? -1 : compareA > compareB ? 1 : 0)
//         })
//     })

//     function makeGuess(letter) {
//         if (!guessedLetters.value.includes(letter)) {
//             guessedLetters.value.push(letter);
//             // Reduce score if letter isn't in the phrase
//             if (!data.value.text.toLowerCase().includes(letter)) {
//                 const nonMatchingLetters = 26 - new Set(data.value.text.toLowerCase().match(/[a-z]/g)).size;
//                 currentScore.value = Math.max(0, Math.round(currentScore.value - (26 / nonMatchingLetters)));
//             }
//         }
//     }

//     function submitAnswer() {
//         gameEnded.value = true;

//         phraseCorrect.value = phraseGuess.value.toLowerCase().trim() === data.value.text.toLowerCase();
//         numberCorrect.value = parseInt(numberGuess.value) === data.value.number;

//         // Update score based on correct answers
//         if (phraseCorrect.value && numberCorrect.value) {
//             currentScore.value += 4; // +2 for each correct answer
//         } else if (phraseCorrect.value || numberCorrect.value) {
//             currentScore.value = currentScore.value / 2;
//         } else {
//             currentScore.value = 0;
//         }

//         // Cap score at 30
//         currentScore.value = Math.min(30, Math.max(0, Math.round(currentScore.value)));

//         // Add to current session scores
//         sessionScores.value.push({
//             score: currentScore.value,
//             phrase: data.value.text,
//             number: data.value.number,
//             playerPhrase: phraseGuess.value,
//             playerNumber: numberGuess.value
//         });
//     }
//     // fetch data from numbersapi
//     function fetchData() {
//         // Reset game state
//         guessedLetters.value = [];
//         currentScore.value = 26;
//         gameEnded.value = false;
//         phraseCorrect.value = false;
//         numberCorrect.value = false;

//         fetch('http://numbersapi.com/random/math')
//             .then(resp => {
//                 if (!resp.ok) {
//                     throw new Error('API request failed');
//                 }
//                 console.log('Successfully fetched from API');
//                 return resp.json();
//             })
//             .catch(err => {
//                 console.log('API fetch failed:', err);
//                 console.log('Falling back to local cache');
//                 return getRandomMathLocal();
//             })
//             .then(jsonData => {
//                 data.value = {
//                     text: jsonData.text,
//                     number: jsonData.number
//                 };
//                 gameStarted.value = true;
//             })
//             .catch(err => {
//                 console.error('Complete failure (both API and local):', err);
//                 alert('Failed to fetch data. Please try again.');
//             });
//     }

//     return {
//         data,
//         maskedFact,
//         fetchData,
//         guessedLetters,
//         makeGuess,
//         alphabet,
//         numberGuess,
//         phraseGuess,
//         submitAnswer,
//         gameStarted,
//         gameEnded,
//         phraseCorrect,
//         numberCorrect,
//         currentScore,
//         sessionScores,
//         sortKey,
//         sortDirection,
//         sortedScores

//     }
// }
// export default { setup }