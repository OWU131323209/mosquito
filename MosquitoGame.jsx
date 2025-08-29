import React, { useState, useEffect, useRef } from 'react';
import './MosquitoGame.css';

const MosquitoGame = () => {
  const [gameState, setGameState] = useState('idle'); // idle, playing, gameOver
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [mosquitos, setMosquitos] = useState([]);
  const [gameInterval, setGameInterval] = useState(null);
  const [mosquitoInterval, setMosquitoInterval] = useState(null);
  const gameAreaRef = useRef(null);

  // ゲーム開始
  const startGame = () => {
    setGameState('playing');
    setLives(3);
    setScore(0);
    setTimeLeft(30);
    setMosquitos([]);
    
    // タイマー開始
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setGameInterval(timer);

    // 蚊の生成開始
    const mosquitoGen = setInterval(() => {
      generateMosquito();
    }, 2000);
    setMosquitoInterval(mosquitoGen);
  };

  // ゲーム終了
  const endGame = () => {
    setGameState('gameOver');
    if (gameInterval) clearInterval(gameInterval);
    if (mosquitoInterval) clearInterval(mosquitoInterval);
    setGameInterval(null);
    setMosquitoInterval(null);
  };

  // 蚊の生成
  const generateMosquito = () => {
    if (gameState !== 'playing') return;
    
    const newMosquito = {
      id: Date.now() + Math.random(),
      x: Math.random() * (window.innerWidth - 100),
      y: window.innerHeight - 100,
      isDead: false,
      speed: 0.5 + Math.random() * 0.5,
      targetY: 150 // 腕の位置
    };
    
    setMosquitos(prev => [...prev, newMosquito]);
  };

  // 蚊の移動
  useEffect(() => {
    if (gameState !== 'playing') return;

    const moveInterval = setInterval(() => {
      setMosquitos(prev => 
        prev.map(mosquito => {
          if (mosquito.isDead) {
            // 死んだ蚊は下に落ちる
            return {
              ...mosquito,
              y: mosquito.y + 2
            };
          } else {
            // 生きている蚊は上に移動
            const newY = mosquito.y - mosquito.speed;
            
            // 腕に到達した場合
            if (newY <= mosquito.targetY) {
              setLives(prev => {
                if (prev <= 1) {
                  endGame();
                  return 0;
                }
                return prev - 1;
              });
              return null; // 蚊を削除
            }
            
            return {
              ...mosquito,
              y: newY
            };
          }
        }).filter(mosquito => mosquito && mosquito.y < window.innerHeight + 100)
      );
    }, 50);

    return () => clearInterval(moveInterval);
  }, [gameState]);

  // 蚊を攻撃
  const attackMosquito = (mosquitoId) => {
    if (gameState !== 'playing') return;
    
    setMosquitos(prev => 
      prev.map(mosquito => 
        mosquito.id === mosquitoId 
          ? { ...mosquito, isDead: true }
          : mosquito
      )
    );
    
    setScore(prev => prev + 10);
  };

  // ゲームリセット
  const resetGame = () => {
    setGameState('idle');
    setLives(3);
    setScore(0);
    setTimeLeft(30);
    setMosquitos([]);
    if (gameInterval) clearInterval(gameInterval);
    if (mosquitoInterval) clearInterval(mosquitoInterval);
    setGameInterval(null);
    setMosquitoInterval(null);
  };

  return (
    <div className="mosquito-game">
      <div className="game-header">
        <h1>蚊ゲーム</h1>
        <div className="game-info">
          <div className="lives">
            <span>ライフ: </span>
            {[...Array(3)].map((_, i) => (
              <span 
                key={i} 
                className={`life ${i < lives ? 'active' : 'inactive'}`}
              >
                ❤️
              </span>
            ))}
          </div>
          <div className="score">スコア: {score}</div>
          <div className="timer">時間: {timeLeft}秒</div>
        </div>
      </div>

      <div className="game-controls">
        {gameState === 'idle' && (
          <button className="start-btn" onClick={startGame}>
            ゲーム開始
          </button>
        )}
        {gameState === 'playing' && (
          <button className="end-btn" onClick={endGame}>
            ゲーム終了
          </button>
        )}
        {gameState === 'gameOver' && (
          <div className="game-over">
            <h2>ゲームオーバー</h2>
            <p>最終スコア: {score}</p>
            <button className="reset-btn" onClick={resetGame}>
              もう一度プレイ
            </button>
          </div>
        )}
      </div>

      <div className="game-area" ref={gameAreaRef}>
        {/* 腕のイラスト */}
        <div className="arm-container">
          <img src="arm.png" alt="腕" className="arm" />
        </div>

        {/* 蚊のイラスト */}
        {mosquitos.map(mosquito => (
          <div
            key={mosquito.id}
            className={`mosquito ${mosquito.isDead ? 'dead' : ''}`}
            style={{
              left: `${mosquito.x}px`,
              top: `${mosquito.y}px`
            }}
            onMouseEnter={() => !mosquito.isDead && attackMosquito(mosquito.id)}
          >
            <img 
              src={mosquito.isDead ? "ka_dead.png" : "bug_ka.png"} 
              alt="蚊"
              className="mosquito-img"
            />
          </div>
        ))}
      </div>

      <div className="game-instructions">
        <h3>遊び方</h3>
        <ul>
          <li>蚊にカーソルを合わせて攻撃！</li>
          <li>腕に到達させないように蚊をやっつけよう</li>
          <li>ライフが0になったらゲームオーバー</li>
          <li>30秒でゲーム終了</li>
        </ul>
      </div>
    </div>
  );
};

export default MosquitoGame;
