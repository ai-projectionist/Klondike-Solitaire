import { canMoveToTableau, canMoveToFoundation } from './cardUtils';

// Game initialization
export const initializeGame = (deck) => {
    if (!deck || deck.length !== 52) {
        // console.error('Invalid deck: expected 52 cards, got', deck?.length);
        return { tableau: [[], [], [], [], [], [], []], stock: [] };
    }

    const newTableau = [[], [], [], [], [], [], []];
    let deckIndex = 0;

    // Deal cards to tableau piles
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            if (deckIndex >= deck.length) break;

            const card = {
                ...deck[deckIndex],
                faceUp: j === i // Only top card face up
            };
            newTableau[i].push(card);
            deckIndex++;
        }
    }

    return {
        tableau: newTableau,
        stock: deck.slice(deckIndex) // Remaining cards to stock
    };
};

// Stock pile management
export const handleStockClick = (stock, waste) => {
    if (stock.length === 0) {
        if (waste.length === 0) return { newStock: [], newWaste: [] };

        // Recycle waste pile
        return {
            newStock: waste.map(card => ({ ...card, faceUp: false })),
            newWaste: []
        };
    }

    // Draw up to 3 cards
    const numCardsToDraw = Math.min(3, stock.length);
    return {
        newStock: stock.slice(numCardsToDraw),
        newWaste: [
            ...waste,
            ...stock.slice(0, numCardsToDraw).map(card => ({ ...card, faceUp: true }))
        ]
    };
};

// Create drag preview image
const createDragPreview = (draggedElements, cardsToDrag) => {
    const dragContainer = document.createElement('div');
    dragContainer.style.position = 'absolute';
    dragContainer.style.top = '-1000px';
    dragContainer.style.left = '-1000px';
    dragContainer.style.width = '140px';
    dragContainer.style.height = `${196 + (cardsToDrag.length - 1) * 20}px`;
    dragContainer.style.background = 'transparent';
    document.body.appendChild(dragContainer);

    if (draggedElements.length > 0) {
        draggedElements.forEach((cardEl, index) => {
            const clone = cardEl.cloneNode(true);
            Object.assign(clone.style, {
                position: 'absolute',
                top: `${index * 20}px`,
                left: '0',
                margin: '0',
                transform: 'none',
                opacity: '1',
                visibility: 'visible'
            });
            clone.classList.remove('dragging');
            dragContainer.appendChild(clone);
        });
    } else {
        // Fallback preview
        cardsToDrag.forEach((card, index) => {
            const dummyCard = document.createElement('div');
            Object.assign(dummyCard.style, {
                width: '140px',
                height: '196px',
                background: card.color === 'red' ? 'lightpink' : 'lightgray',
                border: '1px solid black',
                position: 'absolute',
                top: `${index * 20}px`
            });
            dummyCard.textContent = `${card.rank} ${card.suit}`;
            dragContainer.appendChild(dummyCard);
        });
    }

    return dragContainer;
};

// Get draggable cards based on source type
const getDraggableCards = (sourceType, dataSource, pileIndex, cardIndex) => {
    switch (sourceType) {
        case 'tableau':
            if (!dataSource?.[pileIndex]) return null;
            const cards = dataSource[pileIndex].slice(cardIndex);
            return cards.every(c => c.faceUp) ? cards : null;

        case 'foundation':
            if (!dataSource?.[pileIndex]?.length) return null;
            const topCard = dataSource[pileIndex][dataSource[pileIndex].length - 1];
            return topCard.faceUp ? [topCard] : null;

        case 'waste':
            if (!dataSource?.length) return null;
            return [dataSource[dataSource.length - 1]];

        default:
            return null;
    }
};

// Drag and drop handlers
export const handleDragStart = (e, card, pileIndex, cardIndex, sourceType, dataSource) => {
    if (!card || (sourceType !== 'stock' && !card.faceUp)) return null;

    const cardsToDrag = getDraggableCards(sourceType, dataSource, pileIndex, cardIndex);
    if (!cardsToDrag) return null;

    const targetPileClass = {
        tableau: '.tableau-pile',
        foundation: '.foundation-pile',
        waste: '.waste'
    }[sourceType];

    let draggedElements = [];
    if (targetPileClass && e.target) {
        const cardElement = e.target.closest('.card');
        const pileElement = cardElement?.closest(targetPileClass);

        if (pileElement) {
            const allCards = Array.from(pileElement.querySelectorAll('.card'));
            draggedElements = sourceType === 'tableau'
                ? allCards.slice(cardIndex, cardIndex + cardsToDrag.length)
                : [cardElement];
        }
    }

    const dragPreview = createDragPreview(draggedElements, cardsToDrag);

    try {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData('text/plain', 'card');
        e.dataTransfer.setDragImage(
            dragPreview,
            e.nativeEvent?.offsetX,
            e.nativeEvent?.offsetY
        );
    } catch (error) {
        // console.error('Drag operation failed:', error);
        document.body.removeChild(dragPreview);
        return null;
    }

    setTimeout(() => document.body.removeChild(dragPreview), 0);

    return {
        draggedCards: cardsToDrag,
        sourcePile: { type: sourceType, index: pileIndex }
    };
};

// Update game state after successful move
const updateGameState = (sourcePile, targetType, targetIndex, draggedCards, tableau, foundation, waste) => {
    let newTableau = [...tableau];
    let newFoundation = [...foundation];
    let newWaste = [...waste];

    // Remove cards from source
    switch (sourcePile.type) {
        case 'tableau':
            newTableau[sourcePile.index] = tableau[sourcePile.index].slice(0, -draggedCards.length);
            if (newTableau[sourcePile.index].length > 0) {
                newTableau[sourcePile.index][newTableau[sourcePile.index].length - 1].faceUp = true;
            }
            break;
        case 'waste':
            newWaste.pop();
            break;
        case 'foundation':
            newFoundation[sourcePile.index] = foundation[sourcePile.index].slice(0, -1);
            break;
    }

    // Add cards to target
    if (targetType === 'tableau') {
        newTableau[targetIndex] = [...tableau[targetIndex], ...draggedCards];
    } else if (targetType === 'foundation') {
        newFoundation[targetIndex] = [...foundation[targetIndex], draggedCards[0]];
    }

    return { newTableau, newFoundation, newWaste };
};

export const handleDrop = (e, targetType, targetIndex, draggedCards, sourcePile, tableau, foundation, waste) => {
    if (!draggedCards) return null;

    const card = draggedCards[0];
    const isValidMove = targetType === 'tableau'
        ? canMoveToTableau(card, tableau[targetIndex])
        : targetType === 'foundation' && canMoveToFoundation(card, foundation[targetIndex]);

    if (!isValidMove) return null;

    return updateGameState(sourcePile, targetType, targetIndex, draggedCards, tableau, foundation, waste);
};

export const checkWinCondition = (foundation) => {
    if (!foundation || foundation.length !== 4) return false;
    const totalFoundationCards = foundation.reduce((sum, pile) => sum + pile.length, 0);
    return totalFoundationCards === 52;
};

export const areNoMovesLeft = (tableau, foundation, stock, waste, stockRecycleCount, recycleLimit) => {
    // 1. Check moves from Waste pile
    if (waste.length > 0) {
        const numVisibleWaste = Math.min(waste.length, 3);
        const playableWasteCards = waste.slice(-numVisibleWaste);

        for (const wasteCard of playableWasteCards) {
            for (const pile of foundation) {
                if (canMoveToFoundation(wasteCard, pile)) {
                    return false;
                }
            }
            for (const pile of tableau) {
                if (canMoveToTableau(wasteCard, pile)) {
                    return false;
                }
            }
        }
    }

    // 2. Check moves from Tableau piles
    for (let i = 0; i < tableau.length; i++) {
        const sourceTableauPile = tableau[i];
        if (sourceTableauPile.length === 0) continue;

        let firstFaceUpCardIndex = -1;
        for (let j = 0; j < sourceTableauPile.length; j++) {
            if (sourceTableauPile[j].faceUp) {
                firstFaceUpCardIndex = j;
                break;
            }
        }

        if (firstFaceUpCardIndex !== -1) {
            const draggableCardFromTableau = sourceTableauPile[firstFaceUpCardIndex];

            if (firstFaceUpCardIndex === sourceTableauPile.length - 1) {
                for (const foundPile of foundation) {
                    if (canMoveToFoundation(draggableCardFromTableau, foundPile)) {
                        return false;
                    }
                }
            }

            for (let k = 0; k < tableau.length; k++) {
                if (i === k) continue;
                if (canMoveToTableau(draggableCardFromTableau, tableau[k])) {
                    return false;
                }
            }
        }
    }

    // 3. Check stock and waste cycle
    if (stock.length > 0) {
        return false; // Player can draw from stock
    }

    if (waste.length > 0 && stock.length === 0) { // Stock empty, waste has cards
        if (stockRecycleCount < recycleLimit) { // Check if recycle is allowed
            return false; // Player can recycle waste pile
        }
    }

    return true; // No moves left
};