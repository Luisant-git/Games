import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { playGame, getPlayerGameHistory, playAgentGame, getAgentGameHistory } from "../api/games";
import { getPlayerWallet, getAgentWallet } from "../api/wallet";
import "./Game.css";

const Game = ({ category, games }) => {
  const navigate = useNavigate();
  const [bets, setBets] = useState([]);
  console.log('GAME BETS', bets);
  const [selectedShow, setSelectedShow] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [quantities, setQuantities] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [showBets, setShowBets] = useState(false);
  const [historyBets, setHistoryBets] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  console.log('GAME GAMES', games);
  console.log('view bets', historyBets);
  

  const updateQuantity = (gameId, change) => {
    setQuantities(prev => ({
      ...prev,
      [gameId]: Math.max(1, (parseInt(prev[gameId]) || 1) + change)
    }));
  };

  useEffect(() => {
    if (category?.timing?.[0]?.showTimes?.length > 0) {
      setSelectedShow(category.timing[0].showTimes[0]);
    }
  }, [category]);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const userType = localStorage.getItem('userType');
        const response = userType === 'agent' ? await getAgentWallet() : await getPlayerWallet();
        if (response.ok) {
          const data = await response.json();
          setWalletBalance(data.balance || 0);
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    };
    fetchWalletBalance();
  }, []);

  useEffect(() => {
    if (!selectedShow) return;

    const interval = setInterval(() => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const playStart = new Date(`${today}T${selectedShow.playStart}:00`);
      const playEnd = new Date(`${today}T${selectedShow.playEnd}:00`);

      if (now < playStart) {
        setTimeLeft("Game not started yet");
      } else if (now >= playStart && now <= playEnd) {
        const remaining = playEnd - now;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft("Game ended");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedShow]);

  const isGameActive = () => {
    if (!selectedShow) return false;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const playStart = new Date(`${today}T${selectedShow.playStart}:00`);
    const playEnd = new Date(`${today}T${selectedShow.playEnd}:00`);
    return now >= playStart && now <= playEnd;
  };

  const addBet = (game, numbers) => {
    if (!isGameActive()) return;
    const currentQty = quantities[game.id] === '' || quantities[game.id] === undefined ? 1 : parseInt(quantities[game.id]) || 1;
    if (currentQty === 0 || currentQty < 1) {
      toast.error('Not valid quantity');
      return;
    }
    
    const betAmount = game.ticket * currentQty;
    const currentTotalAmount = bets.reduce((sum, b) => sum + b.amount, 0);
    const newTotalAmount = currentTotalAmount + betAmount;
    
    if (newTotalAmount > walletBalance) {
      toast.error(`Insufficient balance! Available: ₹${walletBalance}, Required: ₹${newTotalAmount}`);
      return;
    }
    
    const newBet = {
      gameId: game.id,
      board: game.board,
      betType: game.betType,
      numbers,
      qty: currentQty,
      amount: betAmount,
      winAmount: game.winningAmount,
    };
    setBets([...bets, newBet]);
    
    // Clear inputs after adding bet
    setInputValues(prev => ({...prev, [game.id]: ''}));
    setQuantities(prev => ({...prev, [game.id]: 1}));
  };

  const totalAmount = bets.reduce((sum, b) => sum + b.amount, 0);

  const submitBets = async () => {
    if (bets.length === 0) {
      toast.error('No bets to submit.');
      return;
    }
    
    try {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(now.getTime() + istOffset);
      const today = istDate.toISOString().split('T')[0];
      
      const userType = localStorage.getItem('userType');
      const gameData = {
        categoryId: category.id,
        category: category.name,
        showtimeId: selectedShow?.id,
        showTime: `${today}T${selectedShow?.showTime}:00+05:30`,
        playStart: `${today}T${selectedShow?.playStart}:00+05:30`,
        playEnd: `${today}T${selectedShow?.playEnd}:00+05:30`,
        gameplay: bets
      };
      
      const response = userType === 'agent' ? 
        await playAgentGame(gameData) : 
        await playGame(gameData);
      console.log('Submit response:', response);

      if (response.ok) {
        // Reset state first
        setBets([]);
        setQuantities({});
        setInputValues({});
        setShowConfirm(false);
        // Then show success message
        toast.success('Bets submitted successfully!');
      } else {
        try {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to submit bets');
        } catch {
          toast.error('Failed to submit bets');
        }
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
          {category?.name && (
            <div className="category-name">
              {category.name}
            </div>
          )}
          <div>
            {category.timing[0].showTimes.map((t) => (
              <div key={t.id} className="show-times">
                <button
                  className={`time-btn ${selectedShow?.id === t.id ? 'selected' : ''}`}
                  onClick={() => setSelectedShow(t)}
                >
                  {new Date(`2000-01-01T${t.showTime}:00`).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                </button>
              </div>
            ))}
          </div>
          {selectedShow && (
            <div className="show-info">
              <div className="info-card">
                {/* <div className="info-item">
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
                </div> */}
                <div className="info-item countdown-item full-width">
                  <span className="info-label">
                    <span className="sand-clock">⏳</span> {timeLeft === "Game not started yet" ? "Game Status" : timeLeft === "Game ended" ? "Game Status" : "Time Left"}
                  </span>
                  <span className="info-value countdown-value">{timeLeft}</span>
                </div>
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
              <input 
                type="number" 
                min="0" 
                max="9" 
                placeholder="0-9" 
                value={inputValues[game.id] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 9)) {
                    setInputValues(prev => ({...prev, [game.id]: value}));
                  }
                }}
                disabled={!isGameActive()} 
              />
              <div className="qty">
                <button onClick={() => updateQuantity(game.id, -1)} disabled={!isGameActive()}>-</button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantities[game.id] === undefined ? 1 : quantities[game.id]}
                  onChange={(e) => {
                    setQuantities(prev => ({...prev, [game.id]: e.target.value}));
                  }}
                  disabled={!isGameActive()}
                />
                <button onClick={() => updateQuantity(game.id, 1)} disabled={!isGameActive()}>+</button>
              </div>
              <button className="add-btn" onClick={() => {
                const number = parseInt(inputValues[game.id]) || 0;
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
              <input 
                type="number" 
                min="0" 
                max="99" 
                placeholder="00-99" 
                value={inputValues[game.id] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 99)) {
                    setInputValues(prev => ({...prev, [game.id]: value}));
                  }
                }}
                disabled={!isGameActive()} 
              />
              <div className="qty">
                <button onClick={() => updateQuantity(game.id, -1)} disabled={!isGameActive()}>-</button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantities[game.id] === undefined ? 1 : quantities[game.id]}
                  onChange={(e) => {
                    setQuantities(prev => ({...prev, [game.id]: e.target.value}));
                  }}
                  disabled={!isGameActive()}
                />
                <button onClick={() => updateQuantity(game.id, 1)} disabled={!isGameActive()}>+</button>
              </div>
              <button className="add-btn" onClick={() => {
                const number = parseInt(inputValues[game.id]) || 0;
                addBet(game, number);
              }} disabled={!isGameActive()}>
                Add
              </button>
            </div>
          ))}
      </div>

      {/* THREE DIGITS */}
      <div className={`section ${!isGameActive() ? 'disabled' : ''}`}>
        {games
          .filter((g) => g.betType === "TRIPLE_DIGIT")
          .map((game) => (
            <div key={game.id}>
              <h3>
                Three Digits
                <span className="ticket">₹{game.ticket}</span>{" "}
                <span className="win">Win ₹{game.winningAmount}</span>
              </h3>
              <div className="bet-row triple-digit">
                <div className="top-row">
                  <span className={`board ${game.board}`}>{game.board}</span>
                <input type="number" min="0" max="9" placeholder="0" disabled={!isGameActive()} onChange={(e) => {
                  const value = e.target.value;
                  if (value !== '' && (parseInt(value) < 0 || parseInt(value) > 9)) {
                    e.target.value = '';
                  }
                }} />
                <input type="number" min="0" max="9" placeholder="0" disabled={!isGameActive()} onChange={(e) => {
                  const value = e.target.value;
                  if (value !== '' && (parseInt(value) < 0 || parseInt(value) > 9)) {
                    e.target.value = '';
                  }
                }} />
                <input type="number" min="0" max="9" placeholder="0" disabled={!isGameActive()} onChange={(e) => {
                  const value = e.target.value;
                  if (value !== '' && (parseInt(value) < 0 || parseInt(value) > 9)) {
                    e.target.value = '';
                  }
                }} />
              </div>
              <div className="controls-section">
                <div className="qty">
                  <button onClick={() => updateQuantity(game.id, -1)} disabled={!isGameActive()}>-</button>
                  <input 
                    type="number" 
                    min="1" 
                    value={quantities[game.id] === undefined ? 1 : quantities[game.id]}
                    onChange={(e) => {
                      setQuantities(prev => ({...prev, [game.id]: e.target.value}));
                    }}
                    disabled={!isGameActive()}
                  />
                  <button onClick={() => updateQuantity(game.id, 1)} disabled={!isGameActive()}>+</button>
                </div>
                <button
                  className="add-btn"
                  onClick={(e) => {
                    const inputs = e.target.closest('.bet-row').querySelectorAll('.top-row input');
                    const numbers = Array.from(inputs).map(input => parseInt(input.value) || 0);
                    addBet(game, numbers);
                    inputs.forEach(input => input.value = '');
                  }}
                  disabled={!isGameActive()}
                >
                  Add
                </button>
              </div>
              </div>
            </div>
          ))}
      </div>

      {/* 4DS DIGITS */}
      <div className={`section ${!isGameActive() ? 'disabled' : ''}`}>
        {games
          .filter((g) => g.betType === "FOUR_DIGIT")
          .map((game) => (
            <div key={game.id}>
              <h3>
                4DS Digits
                <span className="ticket">₹{game.ticket}</span>{" "}
                <span className="win">Win ₹{game.winningAmount}</span>
              </h3>
              <div className="bet-row four-digit">
                <div className="top-row">
                  <span className={`board ${game.board}`}>{game.board}</span>
                <input type="number" min="0" max="9" placeholder="0" disabled={!isGameActive()} onChange={(e) => {
                  const value = e.target.value;
                  if (value !== '' && (parseInt(value) < 0 || parseInt(value) > 9)) {
                    e.target.value = '';
                  }
                }} />
                <input type="number" min="0" max="9" placeholder="0" disabled={!isGameActive()} onChange={(e) => {
                  const value = e.target.value;
                  if (value !== '' && (parseInt(value) < 0 || parseInt(value) > 9)) {
                    e.target.value = '';
                  }
                }} />
                <input type="number" min="0" max="9" placeholder="0" disabled={!isGameActive()} onChange={(e) => {
                  const value = e.target.value;
                  if (value !== '' && (parseInt(value) < 0 || parseInt(value) > 9)) {
                    e.target.value = '';
                  }
                }} />
                <input type="number" min="0" max="9" placeholder="0" disabled={!isGameActive()} onChange={(e) => {
                  const value = e.target.value;
                  if (value !== '' && (parseInt(value) < 0 || parseInt(value) > 9)) {
                    e.target.value = '';
                  }
                }} />
              </div>
              <div className="controls-section">
                <div className="qty">
                  <button onClick={() => updateQuantity(game.id, -1)} disabled={!isGameActive()}>-</button>
                  <input 
                    type="number" 
                    min="1" 
                    value={quantities[game.id] === undefined ? 1 : quantities[game.id]}
                    onChange={(e) => {
                      setQuantities(prev => ({...prev, [game.id]: e.target.value}));
                    }}
                    disabled={!isGameActive()}
                  />
                  <button onClick={() => updateQuantity(game.id, 1)} disabled={!isGameActive()}>+</button>
                </div>
                <button
                  className="add-btn"
                  onClick={(e) => {
                    const inputs = e.target.closest('.bet-row').querySelectorAll('.top-row input');
                    const numbers = Array.from(inputs).map(input => parseInt(input.value) || 0);
                    addBet(game, numbers);
                    inputs.forEach(input => input.value = '');
                  }}
                  disabled={!isGameActive()}
                >
                  Add
                </button>
              </div>
              </div>
            </div>
          ))}
      </div>

      {/* VIEW BETS MODAL */}
      {showBets && (
        <div className="bets-modal" onClick={() => setShowBets(false)}>
          <div className="bets-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Today Bets</h3>
              <button className="close-x" onClick={() => setShowBets(false)}>×</button>
            </div>
            {loadingHistory ? (
              <div className="empty-bets">
                <p>Loading bets...</p>
              </div>
            ) : historyBets.length === 0 || historyBets.every(history => !history.gameplay || history.gameplay.length === 0) ? (
              <div className="empty-bets">
                <p>No bets have been placed for the chosen show time</p>
              </div>
            ) : (
              <div className="bets-list">
                {historyBets.map((history, index) => {
                  const betsByBoard = history.gameplay?.reduce((acc, bet) => {
                    const board = bet.board || 'UNKNOWN';
                    if (!acc[board]) acc[board] = [];
                    acc[board].push(bet);
                    return acc;
                  }, {}) || {};
                  
                  return (
                    <div key={index} className="history-item">
                      <div className="history-header">
                        <span className="show-time">{history?.categoryName || ''}</span>
                        <span className="show-time">Show Time: {new Date(history.showTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                      </div>
                      {Object.entries(betsByBoard).map(([board, bets]) => (
                        <div key={board} className="board-group">
                          <div className="board-title">{board}</div>
                          {bets.map((bet, betIndex) => (
                            <div key={betIndex} className="bet-item">
                              <span className="qty">{['TRIPLE_DIGIT', 'FOUR_DIGIT'].includes(bet.betType) ? JSON.parse(bet.numbers).join('') : bet.numbers}</span>
                              <span className="qty">x</span>
                              <span className="qty">{bet.qty}</span>
                              <span className="amount">₹{bet.amount}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                      <div className="history-total">
                        <span>Total: ₹{history.totalBetAmount}</span>
                        {history.isWon && <span className="win-amount">Won: ₹{history.totalWinAmount}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button className="view-close-btn" onClick={() => setShowBets(false)}>Close</button>
          </div>
        </div>
      )}

      {/* CONFIRM BETS MODAL */}
      {showConfirm && (
        <div className="bets-modal" onClick={() => setShowConfirm(false)}>
          <div className="bets-content confirm-modal" onClick={(e) => e.stopPropagation()}>
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
                {Object.entries(bets.reduce((acc, bet, index) => {
                  if (!acc[bet.board]) acc[bet.board] = [];
                  acc[bet.board].push({...bet, originalIndex: index});
                  return acc;
                }, {})).map(([board, boardBets]) => (
                  <div key={board} className="board-group">
                    <div className="board-title">{board}</div>
                    {boardBets.map((bet) => (
                      <div key={bet.originalIndex} className="confirm-bet-item">
                        <span className="qty">{['TRIPLE_DIGIT', 'FOUR_DIGIT'].includes(bet.betType) ? bet.numbers.join('') : bet.numbers}</span>
                        <span className="qty">×</span>
                        <span className="qty">{bet.qty}</span>
                        <button className="remove-bet" onClick={() => {
                          const newBets = bets.filter((_, i) => i !== bet.originalIndex);
                          setBets(newBets);
                        }}>×</button>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="confirm-total">
                  <div className="confirm-total-label">Total Amount</div>
                  <div className="confirm-total-amount">₹{totalAmount}</div>
                  <div className="confirm-total-count">{bets.length} bet{bets.length !== 1 ? 's' : ''}</div>
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
          ₹{totalAmount} ({bets.length})
        </span>
        <button className="view-btn" onClick={async () => {
          setLoadingHistory(true);
          setShowBets(true);
          try {
            const userType = localStorage.getItem('userType');
            console.log('userType',userType);
            
            const response = userType === 'agent' ? 
              await getAgentGameHistory(JSON.parse(localStorage.getItem('user') || '{}').id) : 
              await getPlayerGameHistory();
            if (response.ok) {
              const data = await response.json();
              console.log('-------',data);
              const gameData = userType === 'agent' ? data.data : data;
              
              // Filter to show only today's bets
              const today = new Date().toISOString().split('T')[0];
              const todayBets = (gameData || []).filter(history => {
                const betDate = new Date(history.createdAt).toISOString().split('T')[0];
                return betDate === today;
              });
              
              setHistoryBets(todayBets);
            }
          } catch (error) {
            console.error('Error fetching game history:', error);
            setHistoryBets([]);
          } finally {
            setLoadingHistory(false);
          }
        }}>View Bets</button>
        <button className="history-btn" onClick={()=>navigate('/results')}>Bet Results</button>
        <button className="pay-btn" onClick={() => setShowConfirm(true)}>Pay Now</button>
      </div>
    </div>
  );
};

export default Game;
