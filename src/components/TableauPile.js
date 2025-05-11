import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';
import './TableauPile.css';

const TableauPile = ({ pile, pileIndex, onDragOver, onDrop, onDragStart, onCardDoubleClick }) => {
    return (
        <div
            className="tableau-pile"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, 'tableau', pileIndex)}
        >
            {pile.map((card, cardIndex) => {
                return (
                    <div
                        key={`${card.suit}-${card.rank}-${cardIndex}`}
                        className="card-container"
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: `${cardIndex * 40}px`,
                            zIndex: cardIndex,
                            width: '100%'
                        }}
                    >
                        <Card
                            card={card}
                            pileIndex={pileIndex}
                            cardIndex={cardIndex}
                            onDragStart={onDragStart}
                            isBeingDragged={!!card.isBeingDragged}
                            onCardDoubleClick={onCardDoubleClick}
                        />
                    </div>
                );
            })}
        </div>
    );
};

TableauPile.propTypes = {
    pile: PropTypes.arrayOf(PropTypes.shape({
        suit: PropTypes.string.isRequired,
        rank: PropTypes.string.isRequired,
        faceUp: PropTypes.bool.isRequired,
        isBeingDragged: PropTypes.bool
    })).isRequired,
    pileIndex: PropTypes.number.isRequired,
    onDragOver: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onCardDoubleClick: PropTypes.func
};

export default TableauPile; 