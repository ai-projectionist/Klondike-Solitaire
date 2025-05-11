export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const RANK_VALUES = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
};

export const createDeck = () => {
    const newDeck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            newDeck.push({
                suit,
                rank,
                color: suit === '♥' || suit === '♦' ? 'red' : 'black',
                faceUp: false
            });
        }
    }
    return newDeck;
};

export const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const canMoveToTableau = (card, targetPile) => {
    if (targetPile.length === 0) {
        return card.rank === 'K';
    }
    const topCard = targetPile[targetPile.length - 1];
    return (
        topCard.faceUp &&
        card.color !== topCard.color &&
        RANK_VALUES[card.rank] === RANK_VALUES[topCard.rank] - 1
    );
};

export const canMoveToFoundation = (card, targetPile) => {
    if (targetPile.length === 0) {
        return card.rank === 'A';
    }
    const topCard = targetPile[targetPile.length - 1];
    return (
        card.suit === topCard.suit &&
        RANK_VALUES[card.rank] === RANK_VALUES[topCard.rank] + 1
    );
}; 