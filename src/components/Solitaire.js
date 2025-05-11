import React from 'react';
import './Solitaire.css';
import TableauPile from './TableauPile';
import FoundationPile from './FoundationPile';
import StockPile from './StockPile';
import TopBar from './TopBar';
import { useGameState } from '../hooks/useGameState';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

const Solitaire = () => {
    const {
        tableau, setTableau,
        foundation, setFoundation,
        stock,
        waste,
        setWaste,
        onStockClick,
        isGameWon,
        setIsGameWon,
        noMovesPossible,
        setNoMovesPossible,
        stockRecycleCount,
        STOCK_RECYCLE_LIMIT,
        resetGame,
    } = useGameState();

    const {
        genericOnDragOver,
        onDragStartHandler,
        onDropOnGameElement,
        onDropOnGameArea,
        handleCardDoubleClick,
    } = useDragAndDrop({
        tableau, setTableau,
        foundation, setFoundation,
        waste, setWaste,
        setIsGameWon,
        setNoMovesPossible,
        stock_for_check: stock,
        stockRecycleCount_for_check: stockRecycleCount,
        recycleLimit_for_check: STOCK_RECYCLE_LIMIT,
    });

    const recyclesRemaining = STOCK_RECYCLE_LIMIT - stockRecycleCount;

    return (
        <div
            className="solitaire"
            onDragOver={genericOnDragOver}
            onDrop={onDropOnGameArea}
        >
            <TopBar
                onNewGameClick={resetGame}
                recyclesRemaining={recyclesRemaining < 0 ? 0 : recyclesRemaining}
            />
            <div
                className="game-area"
            >
                <div className="top-row">
                    <div className="stock-waste">
                        <StockPile
                            cards={stock}
                            onStockClick={onStockClick}
                            onDrop={onDropOnGameElement}
                            onDragOver={genericOnDragOver}
                            onDragStart={(e, cardData, pIdx, cIdx) => onDragStartHandler(e, cardData, pIdx, cIdx, 'stock')}
                            onCardDoubleClick={(cardData, pIdx, cIdx) => handleCardDoubleClick(cardData, pIdx, cIdx, 'stock')}
                            disabled={stock.length === 0 && waste.length > 0 && stockRecycleCount >= STOCK_RECYCLE_LIMIT}
                        />
                        <StockPile
                            cards={waste}
                            isWaste={true}
                            onDrop={onDropOnGameElement}
                            onDragOver={genericOnDragOver}
                            onDragStart={(e, cardData, pIdx, cIdx) => onDragStartHandler(e, cardData, pIdx, cIdx, 'waste')}
                            onCardDoubleClick={(cardData, pIdx, cIdx) => handleCardDoubleClick(cardData, pIdx, cIdx, 'waste')}
                        />
                    </div>
                    <div className="foundation">
                        {foundation.map((pile, index) => (
                            <FoundationPile
                                key={index}
                                pile={pile}
                                pileIndex={index}
                                onDrop={onDropOnGameElement}
                                onDragOver={genericOnDragOver}
                                onDragStart={(e, cardData, pIdx, cIdx) => onDragStartHandler(e, cardData, pIdx, cIdx, 'foundation')}
                                onCardDoubleClick={(cardData, pIdx, cIdx) => handleCardDoubleClick(cardData, pIdx, cIdx, 'foundation')}
                            />
                        ))}
                    </div>
                </div>
                <div className="tableau">
                    {tableau.map((pile, pileIndex) => (
                        <TableauPile
                            key={pileIndex}
                            pile={pile}
                            pileIndex={pileIndex}
                            onDrop={onDropOnGameElement}
                            onDragOver={genericOnDragOver}
                            onDragStart={(e, cardData, pIdx, cIdx) => onDragStartHandler(e, cardData, pIdx, cIdx, 'tableau')}
                            onCardDoubleClick={(cardData, pIdx, cIdx) => handleCardDoubleClick(cardData, pIdx, cIdx, 'tableau')}
                        />
                    ))}
                </div>
            </div>
            {isGameWon && (
                <div className="game-won-message">
                    <h2>Congratulations! You Won!</h2>
                </div>
            )}
            {noMovesPossible && !isGameWon && (
                <div className="game-over-message">
                    <h2>No More Moves! Game Over.</h2>
                    {stock.length === 0 && waste.length > 0 && stockRecycleCount >= STOCK_RECYCLE_LIMIT &&
                        <p>(Recycle limit reached, no more recycles possible.)</p>}
                </div>
            )}
        </div>
    );
};

export default Solitaire; 