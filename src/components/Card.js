import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Card.css';

const Card = ({ card, pileIndex, cardIndex, onDragStart, isBeingDragged, allowDrag = true, onCardDoubleClick }) => {
    const { suit, rank, faceUp } = card;
    const isRed = suit === '♥' || suit === '♦';

    const handleDragStart = (e) => {
        // console.log(`[Card.js] handleDragStart: pileIndex=${pileIndex}, cardIndex=${cardIndex}, card=${card ? card.rank + card.suit : 'N/A'}, allowDrag=${allowDrag}`);
        if (faceUp && allowDrag && onDragStart) {
            onDragStart(e, card, pileIndex, cardIndex);
        }
    };

    const handleDoubleClick = (e) => {
        // console.log(`[Card.js] handleDoubleClick: card=${card ? card.rank + card.suit : 'N/A'}, allowDrag=${allowDrag}`);
        if (faceUp && allowDrag && onCardDoubleClick) {
            onCardDoubleClick(card, pileIndex, cardIndex);
        }
    };

    const handleDragEnd = (e) => {
        // console.log('[Card.js] NATIVE DRAGEND on Card element fired. Event:', e);
        // alert('[Card.js] NATIVE DRAGEND fired!'); // Removing intrusive test
    };

    const handleDragOverSelf = (e) => {
    };

    if (isBeingDragged) {
        return null;
    }

    if (!faceUp) {
        return (
            <div className="card face-down">
                <div className="card-back">
                    <div className="card-back-pattern" />
                </div>
            </div>
        );
    }

    return (
        <div
            className={`card ${isRed ? 'red' : 'black'}`}
            draggable={faceUp && allowDrag}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDoubleClick={handleDoubleClick}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    zIndex: -1 /* Behind content, but should still get events if content doesn't */
                }}
                onDragOver={handleDragOverSelf}
            />
            <div className="card-content top-left">
                <div className="card-rank">{rank}</div>
                <div className="card-suit">{suit}</div>
            </div>
            <div className="card-content bottom-right">
                <div className="card-rank">{rank}</div>
                <div className="card-suit">{suit}</div>
            </div>
            <div className="card-center">{suit}</div>
        </div>
    );
};

Card.propTypes = {
    card: PropTypes.shape({
        suit: PropTypes.string.isRequired,
        rank: PropTypes.string.isRequired,
        faceUp: PropTypes.bool.isRequired,
        isBeingDragged: PropTypes.bool
    }).isRequired,
    pileIndex: PropTypes.number,
    cardIndex: PropTypes.number,
    onDragStart: PropTypes.func,
    isBeingDragged: PropTypes.bool,
    allowDrag: PropTypes.bool,
    onCardDoubleClick: PropTypes.func
};

Card.defaultProps = {
    isBeingDragged: false,
    allowDrag: true,
    onCardDoubleClick: null
};

export default Card; 