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
export function selectCard(a) {
  const card = deck.splice(a, 1)[0]
  usedCards.push(card)
  return card
}

// 모듈 내보내기
export default  {
  createDeck,
  drawCard,
  selectCard,
}