import { useState, useEffect, useCallback, useRef } from 'react';
import { handleDragStart, handleDrop, checkWinCondition, areNoMovesLeft } from '../utils/gameUtils';

export const useDragAndDrop = ({
    tableau, setTableau,
    foundation, setFoundation,
    waste, setWaste,
    setIsGameWon,
    setNoMovesPossible,
    stock_for_check,
    stockRecycleCount_for_check,
    recycleLimit_for_check,
}) => {
    const [draggedCards, setDraggedCards] = useState(null);
    const [sourcePileInfo, setSourcePileInfo] = useState(null);
    const dragOpActiveRef = useRef(false);

    // Helper function to update pile state and remove isBeingDragged flag
    const updatePileState = useCallback((pile, updateFn) => {
        return pile.map(card => {
            if (card.isBeingDragged) {
                const { isBeingDragged, ...rest } = card;
                return rest;
            }
            return card;
        });
    }, []);

    const clearVisualDragState = useCallback(() => {
        dragOpActiveRef.current = false;
        setTableau(prev => prev.map(pile => updatePileState(pile)));
        setFoundation(prev => prev.map(pile => updatePileState(pile)));
        setWaste(prev => updatePileState(prev));
    }, [setTableau, setFoundation, setWaste, updatePileState]);

    const checkAndUpdateGameState = useCallback((nextTableau, nextFoundation, nextWaste) => {
        if (checkWinCondition(nextFoundation)) {
            setIsGameWon(true);
        }

        setNoMovesPossible(areNoMovesLeft(
            nextTableau,
            nextFoundation,
            stock_for_check,
            nextWaste,
            stockRecycleCount_for_check,
            recycleLimit_for_check
        ));
    }, [setIsGameWon, setNoMovesPossible, stock_for_check, stockRecycleCount_for_check, recycleLimit_for_check]);

    const handleDragStateUpdate = useCallback((sourceType, dragData) => {
        if (sourceType === 'tableau') {
            setTableau(currentTableau => {
                const { index: sourceIdx, cardIndex, draggedCards } = dragData;
                return currentTableau.map((pile, idx) =>
                    idx === sourceIdx
                        ? pile.map((card, cIdx) =>
                            cIdx >= cardIndex && cIdx < cardIndex + draggedCards.length
                                ? { ...card, isBeingDragged: true }
                                : card
                        )
                        : pile
                );
            });
        } else if (sourceType === 'foundation') {
            setFoundation(current =>
                current.map((pile, idx) =>
                    idx === dragData.index && pile.length
                        ? [...pile.slice(0, -1), { ...pile[pile.length - 1], isBeingDragged: true }]
                        : pile
                )
            );
        } else if (sourceType === 'waste') {
            const draggedCard = dragData.card;
            setWaste(current =>
                current.map(card =>
                    card.suit === draggedCard.suit && card.rank === draggedCard.rank
                        ? { ...card, isBeingDragged: true }
                        : card
                )
            );
        }
    }, [setTableau, setFoundation, setWaste]);

    const genericOnDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    useEffect(() => {
        const handleGlobalDragEnd = () => {
            if (dragOpActiveRef.current) {
                clearVisualDragState();
                setDraggedCards(null);
                setSourcePileInfo(null);
            }
        };

        window.addEventListener('dragend', handleGlobalDragEnd);
        return () => window.removeEventListener('dragend', handleGlobalDragEnd);
    }, [clearVisualDragState]);

    const handleCardDoubleClick = useCallback((cardToMove, sourcePileIdx, sourceCardIdx, fromSourceType) => {
        if (!cardToMove) return;

        const sourceDetails = {
            type: fromSourceType,
            index: sourcePileIdx,
            cardIndex: fromSourceType === 'tableau' ? sourceCardIdx : undefined
        };

        for (let i = 0; i < foundation.length; i++) {
            const result = handleDrop(null, 'foundation', i, [cardToMove], sourceDetails, tableau, foundation, waste);

            if (result) {
                const { newTableau = tableau, newFoundation = foundation, newWaste = waste } = result;

                setTableau(newTableau);
                setFoundation(newFoundation);
                setWaste(newWaste);

                checkAndUpdateGameState(newTableau, newFoundation, newWaste);

                if (dragOpActiveRef.current) {
                    clearVisualDragState();
                    setDraggedCards(null);
                    setSourcePileInfo(null);
                }
                return;
            }
        }
    }, [tableau, foundation, waste, setTableau, setFoundation, setWaste, clearVisualDragState, checkAndUpdateGameState]);

    const onDragStartHandler = useCallback((e, card, pileIndex, cardIndex, sourceType) => {
        clearVisualDragState();

        const sourcePiles = {
            tableau,
            foundation,
            waste
        };

        const dragData = handleDragStart(e, card, pileIndex, cardIndex, sourceType, sourcePiles[sourceType]);

        if (dragData) {
            dragOpActiveRef.current = true;
            setDraggedCards(dragData.draggedCards);
            setSourcePileInfo({
                type: dragData.sourcePile.type,
                index: dragData.sourcePile.index,
                cardIndex: sourceType === 'tableau' ? cardIndex : undefined
            });

            setTimeout(() => handleDragStateUpdate(sourceType, {
                index: dragData.sourcePile.index,
                cardIndex,
                draggedCards: dragData.draggedCards,
                card
            }), 0);
        }
    }, [tableau, foundation, waste, clearVisualDragState, handleDragStateUpdate]);

    const onDropOnGameElement = useCallback((e, targetType, targetIndex) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedCards || !sourcePileInfo) {
            clearVisualDragState();
            setDraggedCards(null);
            setSourcePileInfo(null);
            return;
        }

        const result = handleDrop(e, targetType, targetIndex, draggedCards, sourcePileInfo, tableau, foundation, waste);

        if (result) {
            const { newTableau = tableau, newFoundation = foundation, newWaste = waste } = result;

            setTableau(newTableau);
            setFoundation(newFoundation);
            setWaste(newWaste);

            checkAndUpdateGameState(newTableau, newFoundation, newWaste);
        }

        clearVisualDragState();
        setDraggedCards(null);
        setSourcePileInfo(null);
    }, [draggedCards, sourcePileInfo, tableau, foundation, waste, clearVisualDragState, setTableau, setFoundation, setWaste, checkAndUpdateGameState]);

    const onDropOnGameArea = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        if (dragOpActiveRef.current) {
            clearVisualDragState();
            setDraggedCards(null);
            setSourcePileInfo(null);
        }
    }, [clearVisualDragState]);

    return {
        dragOpActiveRef,
        draggedCards,
        sourcePileInfo,
        genericOnDragOver,
        onDragStartHandler,
        onDropOnGameElement,
        onDropOnGameArea,
        handleCardDoubleClick,
    };
};