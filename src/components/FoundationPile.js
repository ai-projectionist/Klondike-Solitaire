import React from 'react';
import Card from './Card';

const FoundationPile = ({ pile, pileIndex, onDragOver, onDrop, onDragStart }) => {
    return (
        <div
            className="foundation-pile"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, 'foundation', pileIndex)}
        >
            {pile.length > 0 && (
                <Card
                    card={pile[pile.length - 1]}
                    pileIndex={pileIndex}
                    cardIndex={0}
                    onDragStart={onDragStart}
                    isBeingDragged={!!(pile[pile.length - 1] && pile[pile.length - 1].isBeingDragged)}
                />
            )}
        </div>
    );
};

export default FoundationPile; 