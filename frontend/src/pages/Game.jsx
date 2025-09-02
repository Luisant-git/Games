import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { playGame } from "../api/games";
import "./Game.css";

const Game = ({ category, games, onNavigateToHistory }) => {
  const [bets, setBets] = useState([]);
  console.log('GAME BETS', bets);
  const [selectedShow, setSelectedShow] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [quantities, setQuantities] = useState({});
  console.log('GAME GAMES', games);

  const updateQuantity = (gameId, change) => {
    setQuantities(prev => ({
      ...prev,
      [gameId]: Math.max(0, (prev[gameId] || 0) + change)
    }));
  };

  useEffect(() => {
    if (category?.timing?.[0]?.showTimes?.length > 0) {
      setSelectedShow(category.timing[0].showTimes[0]);
    }
  }, [category]);

  useEffect(() => {
    if (!selectedShow) return;

    const interval = setInterval(() => {
      const now = new Date();
      const playStart = new Date(selectedShow.playStart);
      const playEnd = new Date(selectedShow.playEnd);

      if (now >= playStart && now <= playEnd) {
        const remaining = playEnd - now;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft("");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedShow]);

  const addBet = (game, numbers) => {
    const currentQty = quantities[game.id] || 0;
    if (currentQty === 0) return;
    
    const existingBetIndex = bets.findIndex(bet => bet.gameId === game.id);
    
    if (existingBetIndex !== -1) {
      const updatedBets = [...bets];
      updatedBets[existingBetIndex].qty = currentQty;
      updatedBets[existingBetIndex].amount = game.ticket * currentQty;
      updatedBets[existingBetIndex].numbers = numbers;
      setBets(updatedBets);
    } else {
      const newBet = {
        gameId: game.id,
        board: game.board,
        betType: game.betType,
        numbers,
        qty: currentQty,
        amount: game.ticket * currentQty,
        winAmount: game.winningAmount,
      };
      setBets([...bets, newBet]);
    }
  };

  const totalAmount = bets.reduce((sum, b) => sum + b.amount, 0);

  const submitBets = async () => {
    if (bets.length === 0) return;
    
    try {
      const response = await playGame({
        categoryId: category.id,
        category: category.name,
        showtimeId: selectedShow?.id,
        showTime: selectedShow?.showTime,
        playStart: selectedShow?.playStart,
        playEnd: selectedShow?.playEnd,
        gameplay: bets
      });
      console.log('Submit response:', response);

      if (response.ok) {
        setBets([]);
        setQuantities({});
        toast.success('Bets submitted successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to submit bets');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <div className="lottery">
      {/* Game Timings */}
      {category?.timing?.[0]?.showTimes && (
        <div className="timings">
          <div>
            {category.timing[0].showTimes.map((t) => (
              <button 
                key={t.id} 
                className={`time-btn ${selectedShow?.id === t.id ? 'selected' : ''}`}
                onClick={() => setSelectedShow(t)}
              >
                {new Date(t.showTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </button>
            ))}
          </div>
          {selectedShow && (
            <div className="show-info">
              <div className="info-card">
                <div className="info-item">
                  <span className="info-label">🎮 Play Time</span>
                  <span className="info-value">
                    {new Date(selectedShow.playStart).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} - {new Date(selectedShow.playEnd).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {timeLeft && (
                  <div className="info-item countdown-item">
                    <span className="info-label">
                      <span className="sand-clock">⏳</span> Time Left
                    </span>
                    <span className="info-value countdown-value">{timeLeft}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SINGLE DIGIT */}
      <div className="section">
        {games.filter((g) => g.betType === "SINGLE").length > 0 && (
          <h3>
            Single Digit{" "}
            <span className="ticket">
              ₹{games.find((g) => g.betType === "SINGLE")?.ticket}
            </span>{" "}
            <span className="win">
              Win ₹{games.find((g) => g.betType === "SINGLE")?.winningAmount}
            </span>
          </h3>
        )}
        {games
          .filter((g) => g.betType === "SINGLE")
          .map((game) => (
            <div key={game.id} className="bet-row">
              <span className={`board ${game.board}`}>{game.board}</span>
              <input type="number" min="0" max="9" placeholder="0-9" />
              <div className="qty">
                <button onClick={() => updateQuantity(game.id, -1)}>-</button>
                <span>{quantities[game.id] || 0}</span>
                <button onClick={() => updateQuantity(game.id, 1)}>+</button>
              </div>
              <button className="add-btn" onClick={(e) => {
                const input = e.target.parentElement.querySelector('input');
                const number = parseInt(input.value) || 0;
                addBet(game, number);
              }}>
                Add
              </button>
            </div>
          ))}
      </div>

      {/* DOUBLE DIGITS */}
      <div className="section">
        {games.filter((g) => g.betType === "DOUBLE").length > 0 && (
          <h3>
            Double Digits{" "}
            <span className="ticket">
              ₹{games.find((g) => g.betType === "DOUBLE")?.ticket}
            </span>{" "}
            <span className="win">
              Win ₹{games.find((g) => g.betType === "DOUBLE")?.winningAmount}
            </span>
          </h3>
        )}
        {games
          .filter((g) => g.betType === "DOUBLE")
          .map((game) => (
            <div key={game.id} className="bet-row">
              <span className={`board ${game.board}`}>{game.board}</span>
              <input type="number" min="0" max="99" placeholder="00-99" />
              <div className="qty">
                <button onClick={() => updateQuantity(game.id, -1)}>-</button>
                <span>{quantities[game.id] || 0}</span>
                <button onClick={() => updateQuantity(game.id, 1)}>+</button>
              </div>
              <button className="add-btn" onClick={(e) => {
                const input = e.target.parentElement.querySelector('input');
                const number = parseInt(input.value) || 0;
                addBet(game, number);
              }}>
                Add
              </button>
            </div>
          ))}
      </div>

      {/* THREE DIGITS */}
      <div className="section">
        {games.filter((g) => g.betType === "TRIPLE_DIGIT").length > 0 && (
          <h3>
            Three Digits{" "}
            <span className="ticket">
              ₹{games.find((g) => g.betType === "TRIPLE_DIGIT")?.ticket}
            </span>{" "}
            <span className="win">
              Win ₹
              {games.find((g) => g.betType === "TRIPLE_DIGIT")?.winningAmount}
            </span>
          </h3>
        )}
        {games
          .filter((g) => g.betType === "TRIPLE_DIGIT")
          .map((game) => (
            <div key={game.id} className="bet-row triple-digit">
              <div className="top-row">
                <span className={`board ${game.board}`}>{game.board}</span>
                <input type="number" min="0" max="9" placeholder="0" />
                <input type="number" min="0" max="9" placeholder="0" />
                <input type="number" min="0" max="9" placeholder="0" />
              </div>
              <div className="controls-section">
                <div className="qty">
                  <button onClick={() => updateQuantity(game.id, -1)}>-</button>
                  <span>{quantities[game.id] || 0}</span>
                  <button onClick={() => updateQuantity(game.id, 1)}>+</button>
                </div>
                <button
                  className="add-btn"
                  onClick={(e) => {
                    const inputs = e.target.closest('.bet-row').querySelectorAll('input');
                    const numbers = Array.from(inputs).map(input => parseInt(input.value) || 0);
                    addBet(game, numbers);
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* 4DS DIGITS */}
      <div className="section">
        {games.filter((g) => g.betType === "FOUR_DIGIT").length > 0 && (
          <h3>
            4DS Digits{" "}
            <span className="ticket">
              ₹{games.find((g) => g.betType === "FOUR_DIGIT")?.ticket}
            </span>{" "}
            <span className="win">
              Win ₹
              {games.find((g) => g.betType === "FOUR_DIGIT")?.winningAmount}
            </span>
          </h3>
        )}
        {games
          .filter((g) => g.betType === "FOUR_DIGIT")
          .map((game) => (
            <div key={game.id} className="bet-row four-digit">
              <div className="top-row">
                <span className={`board ${game.board}`}>{game.board}</span>
                <input type="number" min="0" max="9" placeholder="0" />
                <input type="number" min="0" max="9" placeholder="0" />
                <input type="number" min="0" max="9" placeholder="0" />
                <input type="number" min="0" max="9" placeholder="0" />
              </div>
              <div className="controls-section">
                <div className="qty">
                  <button onClick={() => updateQuantity(game.id, -1)}>-</button>
                  <span>{quantities[game.id] || 0}</span>
                  <button onClick={() => updateQuantity(game.id, 1)}>+</button>
                </div>
                <button
                  className="add-btn"
                  onClick={(e) => {
                    const inputs = e.target.closest('.bet-row').querySelectorAll('input');
                    const numbers = Array.from(inputs).map(input => parseInt(input.value) || 0);
                    addBet(game, numbers);
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* FOOTER */}
      <div className="footer">
        <span>
          ₹{totalAmount} ({bets.length} numbers)
        </span>
        <button className="view-btn" onClick={onNavigateToHistory}>View Bets</button>
        <button className="history-btn" onClick={onNavigateToHistory}>Bet History</button>
        <button className="pay-btn" onClick={submitBets}>Pay Now</button>
      </div>
    </div>
  );
};

export default Game;
