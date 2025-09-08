import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { playGame, getPlayerGameHistory } from "../api/games";
import "./Game.css";

const Game = ({ category, games }) => {
  const navigate = useNavigate();
  const [bets, setBets] = useState([]);
  console.log('GAME BETS', bets);
  const [selectedShow, setSelectedShow] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [quantities, setQuantities] = useState({});
  const [showBets, setShowBets] = useState(false);
  const [historyBets, setHistoryBets] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const isGameActive = () => {
    if (!selectedShow) return false;
    const now = new Date();
    const playStart = new Date(selectedShow.playStart);
    const playEnd = new Date(selectedShow.playEnd);
    return now >= playStart && now <= playEnd;
  };

  const addBet = (game, numbers) => {
    if (!isGameActive()) return;
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
  if (bets.length === 0) {
    toast.error('No bets to submit.');
    return;
  }
    
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
        setShowConfirm(false);
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
      <div className={`section ${!isGameActive() ? 'disabled' : ''}`}>
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
              <input type="number" min="0" max="9" placeholder="0-9" disabled={!isGameActive()} />
              <div className="qty">
                <button onClick={() => updateQuantity(game.id, -1)} disabled={!isGameActive()}>-</button>
                <span>{quantities[game.id] || 0}</span>
                <button onClick={() => updateQuantity(game.id, 1)} disabled={!isGameActive()}>+</button>
              </div>
              <button className="add-btn" onClick={(e) => {
                const input = e.target.parentElement.querySelector('input');
                const number = parseInt(input.value) || 0;
                addBet(game, number);
              }} disabled={!isGameActive()}>
                Add
              </button>
            </div>
          ))}
      </div>

      {/* DOUBLE DIGITS */}
      <div className={`section ${!isGameActive() ? 'disabled' : ''}`}>
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
              <input type="number" min="0" max="99" placeholder="00-99" disabled={!isGameActive()} />
              <div className="qty">
                <button onClick={() => updateQuantity(game.id, -1)} disabled={!isGameActive()}>-</button>
                <span>{quantities[game.id] || 0}</span>
                <button onClick={() => updateQuantity(game.id, 1)} disabled={!isGameActive()}>+</button>
              </div>
              <button className="add-btn" onClick={(e) => {
                const input = e.target.parentElement.querySelector('input');
                const number = parseInt(input.value) || 0;
                addBet(game, number);
              }} disabled={!isGameActive()}>
                Add
              </button>
            </div>
          ))}
      </div>

      {/* THREE DIGITS */}
      <div className={`section ${!isGameActive() ? 'disabled' : ''}`}>
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
                <input type="number" min="0" max="9" placeholder="0" disabled={!isGameActive()} />
                <input type="number" min="0" max="9" placeholder="0" disabled={!isGameActive()} />
                <input type="number" min="0" max="9" placeholder="0" disabled={!isGameActive()} />
              </div>
              <div className="controls-section">
                <div className="qty">
                  <button onClick={() => updateQuantity(game.id, -1)} disabled={!isGameActive()}>-</button>
                  <span>{quantities[game.id] || 0}</span>
                  <button onClick={() => updateQuantity(game.id, 1)} disabled={!isGameActive()}>+</button>
                </div>
                <button
                  className="add-btn"
                  onClick={(e) => {
                    const inputs = e.target.closest('.bet-row').querySelectorAll('input');
                    const numbers = Array.from(inputs).map(input => parseInt(input.value) || 0);
                    addBet(game, numbers);
                  }}
                  disabled={!isGameActive()}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* 4DS DIGITS */}
      <div className={`section ${!isGameActive() ? 'disabled' : ''}`}>
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
                <input type="number" min="0" max="9" placeholder="0" disabled={!isGameActive()} />
                <input type="number" min="0" max="9" placeholder="0" disabled={!isGameActive()} />
                <input type="number" min="0" max="9" placeholder="0" disabled={!isGameActive()} />
                <input type="number" min="0" max="9" placeholder="0" disabled={!isGameActive()} />
              </div>
              <div className="controls-section">
                <div className="qty">
                  <button onClick={() => updateQuantity(game.id, -1)} disabled={!isGameActive()}>-</button>
                  <span>{quantities[game.id] || 0}</span>
                  <button onClick={() => updateQuantity(game.id, 1)} disabled={!isGameActive()}>+</button>
                </div>
                <button
                  className="add-btn"
                  onClick={(e) => {
                    const inputs = e.target.closest('.bet-row').querySelectorAll('input');
                    const numbers = Array.from(inputs).map(input => parseInt(input.value) || 0);
                    addBet(game, numbers);
                  }}
                  disabled={!isGameActive()}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* VIEW BETS MODAL */}
      {showBets && (
        <div className="bets-modal" onClick={() => setShowBets(false)}>
          <div className="bets-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedShow?.showTime ? new Date(selectedShow.showTime).toLocaleString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'Recent'} Bets</h3>
              <button className="close-x" onClick={() => setShowBets(false)}>×</button>
            </div>
            {loadingHistory ? (
              <div className="empty-bets">
                <p>Loading bets...</p>
              </div>
            ) : historyBets.length === 0 ? (
              <div className="empty-bets">
                <p>No bets have been placed for the chosen show time</p>
              </div>
            ) : (
              <div className="bets-list">
                {historyBets.map((history, index) => (
                  <div key={index} className="history-item">
                    <div className="history-header">
                      <span className="game-date">{new Date(history.createdAt).toLocaleDateString()}</span>
                    </div>
                    {history.gameplay?.map((bet, betIndex) => (
                      <div key={betIndex} className="bet-item">
                        <div className={`bet-board ${bet.board}`}>{bet.board}</div>
                        <div className="bet-details">
                          <div className="bet-row-info">
                            <span className="bet-label">Numbers:</span>
                            <span className="bet-numbers">{bet.numbers}</span>
                          </div>
                          <div className="bet-row-info">
                            <span className="bet-label">Quantity:</span>
                            <span className="bet-qty">{bet.qty}</span>
                          </div>
                          <div className="bet-row-info">
                            <span className="bet-label">Amount:</span>
                            <span className="bet-amount">₹{bet.amount}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="history-total">
                      <span>Total: ₹{history.totalBetAmount}</span>
                      {history.isWon && <span className="win-amount">Won: ₹{history.totalWinAmount}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="close-btn" onClick={() => setShowBets(false)}>Close</button>
          </div>
        </div>
      )}

      {/* CONFIRM BETS MODAL */}
      {showConfirm && (
        <div className="bets-modal" onClick={() => setShowConfirm(false)}>
          <div className="bets-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Bets</h3>
              <button className="close-x" onClick={() => setShowConfirm(false)}>×</button>
            </div>
            {bets.length === 0 ? (
              <div className="empty-bets">
                <p>No bets added yet</p>
              </div>
            ) : (
              <div className="bets-list">
                {bets.map((bet, index) => (
                  <div key={index} className="bet-item">
                    <div className={`bet-board ${bet.board}`}>{bet.board}</div>
                    <div className="bet-details">
                      <div className="bet-row-info">
                        <span className="bet-label">Numbers:</span>
                        <span className="bet-numbers">{Array.isArray(bet.numbers) ? bet.numbers.join('') : bet.numbers}</span>
                      </div>
                      <div className="bet-row-info">
                        <span className="bet-label">Quantity:</span>
                        <span className="bet-qty">{bet.qty}</span>
                      </div>
                      <div className="bet-row-info">
                        <span className="bet-label">Amount:</span>
                        <span className="bet-amount">₹{bet.amount}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="total-summary">
                  <div className="total-icon">💰</div>
                  <div className="total-text">
                    <div className="total-amount">₹{totalAmount}</div>
                    <div className="total-count">{bets.length} bet{bets.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
            )}
            <div className="confirm-buttons">
              <button className="cancel-btn" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="confirm-btn" onClick={() => {
                submitBets();
              }}>Confirm & Pay</button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="footer">
        <span>
          ₹{totalAmount} ({bets.length} numbers)
        </span>
        <button className="view-btn" onClick={async () => {
          setLoadingHistory(true);
          setShowBets(true);
          try {
            const response = await getPlayerGameHistory();
            if (response.ok) {
              const data = await response.json();
              const filteredBets = data.filter(history => {
                if (!selectedShow) return false;
                const historyShowTime = new Date(history.showTime).getTime();
                const selectedShowTime = new Date(selectedShow.showTime).getTime();
                return historyShowTime === selectedShowTime;
              });
              setHistoryBets(filteredBets);
            }
          } catch (error) {
            console.error('Error fetching history:', error);
          } finally {
            setLoadingHistory(false);
          }
        }}>View Bets</button>
        <button className="history-btn" onClick={()=>navigate('/history')}>Bet History</button>
        <button className="pay-btn" onClick={() => setShowConfirm(true)}>Pay Now</button>
      </div>
    </div>
  );
};

export default Game;
