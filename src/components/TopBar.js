import React from 'react';
import './TopBar.css'; // We'll create this CSS file next

const TopBar = ({ onNewGameClick, recyclesRemaining }) => {
    return (
        <div className="top-bar-container">
            <div className="top-bar-decoration top-bar-decoration-left">
                <span className="suit-icon">♠</span>
                <span className="suit-icon">♥</span>
            </div>
            <div className="top-bar-content">
                <h1 className="game-title">Klondike Solitaire</h1>
                <div className="game-controls">
                    <button onClick={onNewGameClick} className="top-bar-button new-game-btn">
                        New Game
                    </button>
                    <p className="top-bar-text recycles-info">
                        Recycles Left: {recyclesRemaining}
                    </p>
                </div>
            </div>
            <div className="top-bar-decoration top-bar-decoration-right">
                <span className="suit-icon">♦</span>
                <span className="suit-icon">♣</span>
            </div>
        </div>
    );
};

export default TopBar; 