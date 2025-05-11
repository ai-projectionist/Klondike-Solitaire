import { useState, useEffect, useCallback } from 'react';
import { createDeck, shuffleDeck } from '../utils/cardUtils';
import { initializeGame, handleStockClick as originalHandleStockClick, areNoMovesLeft } from '../utils/gameUtils';

export const useGameState = () => {
    const [deck, setDeck] = useState([]);
    const [tableau, setTableau] = useState([[], [], [], [], [], [], []]);
    const [foundation, setFoundation] = useState([[], [], [], []]);
    const [stock, setStock] = useState([]);
    const [waste, setWaste] = useState([]);
    const [isGameWon, setIsGameWon] = useState(false);
    const [noMovesPossible, setNoMovesPossible] = useState(false);
    const [stockRecycleCount, setStockRecycleCount] = useState(0);

    const STOCK_RECYCLE_LIMIT = 2;

    const initialDeal = useCallback(() => {
        const newDeck = createDeck();
        const shuffledDeck = shuffleDeck(newDeck);
        // Set deck first to trigger the useEffect for dealing (if deck was empty before)
        // Or, directly set tableau and stock here if that useEffect is problematic for reset
        const { tableau: newTableau, stock: newStock } = initializeGame(shuffledDeck);
        setTableau(newTableau);
        setStock(newStock);
        setWaste([]);
        setFoundation([[], [], [], []]);
        setIsGameWon(false);
        setNoMovesPossible(false);
        setStockRecycleCount(0);
        // setDeck(shuffledDeck); // Setting deck might trigger the other useEffect if not careful
        // Let's ensure deck state is also reset if it's used elsewhere or for completeness
        setDeck(shuffledDeck); // Actually, this is fine, initializeGame takes the deck
    }, []); // No dependencies, it's a full reset based on new deck

    // Initialize the deck and deal on mount
    useEffect(() => {
        // This effect now only runs once on initial mount to set up the first game.
        // Subsequent new games are handled by resetGame calling initialDeal.
        if (deck.length === 0 && tableau.every(p => p.length === 0)) { // Only if truly uninitialized
            initialDeal();
        }
    }, [initialDeal, deck, tableau]); // deck & tableau added to prevent potential loops if initialDeal changes them before full init

    // Original useEffect for dealing when deck changes, might need adjustment or removal if initialDeal handles it all
    // useEffect(() => {
    //     if (deck.length === 0) return;
    //     const isTableauEmpty = tableau.every(pile => pile.length === 0);
    //     const isStockEmpty = stock.length === 0;
    //     if (isTableauEmpty && isStockEmpty) {
    //         const { tableau: newTableau, stock: newStock } = initializeGame(deck);
    //         setTableau(newTableau);
    //         setStock(newStock);
    //     }
    // }, [deck, tableau, stock]); 
    // Commenting out the above useEffect as initialDeal should handle the full setup correctly.
    // And the mount effect now calls initialDeal.

    const resetGame = useCallback(() => {
        initialDeal();
    }, [initialDeal]);

    const onStockClick = useCallback(() => {
        let newStock = [...stock];
        let newWaste = [...waste];
        let currentRecycleCount = stockRecycleCount;

        if (stock.length === 0) { // Attempting to draw or recycle
            if (waste.length > 0) { // Attempting to recycle waste
                if (stockRecycleCount < STOCK_RECYCLE_LIMIT) {
                    const recycled = originalHandleStockClick(stock, waste); // stock is empty, waste is not
                    newStock = recycled.newStock;
                    newWaste = recycled.newWaste;
                    currentRecycleCount = stockRecycleCount + 1;
                    setStockRecycleCount(currentRecycleCount);
                } else {
                    // Limit reached, no change to stock/waste, currentRecycleCount remains the same (at limit)
                    // console.log("Stock recycle limit reached. No more recycles allowed.");
                }
            } else {
                // Stock and waste are both empty, no action.
            }
        } else { // Drawing from stock
            const drawn = originalHandleStockClick(stock, waste);
            newStock = drawn.newStock;
            newWaste = drawn.newWaste;
        }

        setStock(newStock);
        setWaste(newWaste);

        // Check for no moves after stock click, using the potentially updated recycle count
        setNoMovesPossible(areNoMovesLeft(tableau, foundation, newStock, newWaste, currentRecycleCount, STOCK_RECYCLE_LIMIT));
    }, [stock, waste, tableau, foundation, stockRecycleCount]);

    return {
        deck, // Though not directly used by Solitaire component after init, might be useful
        tableau, setTableau,
        foundation, setFoundation,
        stock, setStock,
        waste, setWaste,
        onStockClick,
        isGameWon,
        setIsGameWon,
        noMovesPossible,
        setNoMovesPossible,
        stockRecycleCount, // Export for display or other logic if needed
        STOCK_RECYCLE_LIMIT, // Export if Solitaire.js needs to pass it
        resetGame, // Export resetGame
    };
}; 