import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';
import './StockPile.css';

const StockPile = ({ cards, isWaste, onStockClick, onDragOver, onDrop, onDragStart, onCardDoubleClick, disabled }) => {
    const handleClick = () => {
        if (!isWaste && onStockClick && !disabled) {
            onStockClick();
        }
    };

    // For waste pile, show up to the last 3 cards with offset
    // For stock pile, show only the top card (or placeholder/logo if empty)
    const displayCards = isWaste ? cards.slice(-3) : (cards.length > 0 ? cards.slice(-1) : []);

    return (
        <div
            className={`${isWaste ? 'waste' : 'stock'} ${(!isWaste && disabled && cards.length === 0) ? 'stock-no-recycles' : ''}`}
            onClick={handleClick}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, isWaste ? 'waste' : 'stock', 0)}
        >
            {!isWaste && cards.length === 0 ? (
                disabled ? (
                    <div className="stock-disabled-logo">🚫</div>
                ) : (
                    <div className="stock-empty-placeholder">🔄</div>
                )
            ) : (
                displayCards.map((card, index) => (
                    <div
                        key={`${card.suit}-${card.rank}-${index}`}
                        className="card-container"
                        style={{
                            zIndex: index,
                            transform: isWaste ? `translateX(${40 * index}px)` : 'none'
                        }}
                    >
                        <Card
                            card={card}
                            pileIndex={isWaste ? -1 : 0}
                            cardIndex={cards.indexOf(card)}
                            onDragStart={onDragStart}
                            allowDrag={
                                isWaste
                                    ? (cards.length > 0 && card === cards[cards.length - 1])
                                    : (cards.length > 0)
                            }
                            isBeingDragged={!!card.isBeingDragged}
                            onCardDoubleClick={isWaste
                                ? ((cards.length > 0 && card === cards[cards.length - 1]) ? onCardDoubleClick : null)
                                : null
                            }
                        />
                    </div>
                ))
            )}
        </div>
    );
};

StockPile.propTypes = {
    cards: PropTypes.arrayOf(PropTypes.shape({
        suit: PropTypes.string.isRequired,
        rank: PropTypes.string.isRequired,
        faceUp: PropTypes.bool.isRequired
    })).isRequired,
    isWaste: PropTypes.bool,
    onStockClick: PropTypes.func,
    onDragOver: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onCardDoubleClick: PropTypes.func,
    disabled: PropTypes.bool
};

StockPile.defaultProps = {
    isWaste: false,
    onStockClick: null,
    onCardDoubleClick: null,
    disabled: false
};

export default StockPile; 