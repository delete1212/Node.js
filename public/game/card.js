const suits = ["♥", "♦", "♠", "♣"]
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

let deck = []
let usedCards = []

// 카드 덱 생성
export function createDeck() {
  deck = []
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value })
    }
  }
  usedCards = []
}

// 덱에서 카드 뽑기
export function drawCard() {
  if (deck.length === 0) {
    throw new Error("No cards left in the deck.")
  }
  const randomIndex = Math.floor(Math.random() * deck.length)
  const card = deck.splice(randomIndex, 1)[0]
  usedCards.push(card)
  return card
}

// 덱에서 선택 뽑기
export function selectCard(suit, value) {
  const card = deck.findIndex(card => card.suit === suit && card.value === value)
  if (card === -1) {
    throw new Error(`Card not found`)
  }
  const [selectedCard] = deck.splice(card, 1)
  usedCards.push(selectedCard)
  return selectedCard
}

export function wait(sec){
  let start = Date.now(), now = start
  while (now - start < sec * 1000) {
    now = Date.now()
  }
}

// 모듈 내보내기
export default  {
  createDeck,
  drawCard,
  selectCard,
  wait,
}