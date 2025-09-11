import React, { useState, useEffect } from 'react';
import { getResults } from '../api/result';
import './Result.css';

const Result = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const data = await getResults();
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="result-container">
        <div className="loading">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="result-container">
      <div className="result-header">
        <h2>🏆 Dear Results</h2>
      </div>

      <div className="results-list">
        {results.length > 0 ? (
          results.map((result) => (
            <div key={result.id} className="result-card">
              <div className="result-date">
                {formatDate(result.date)}
              </div>
              <div className="result-time">
                {result.time}
              </div>
              <div className="result-numbers">
                {result.numbers.split('').map((num, index) => (
                  <span key={index} className="number-digit">
                    {num}️⃣
                  </span>
                ))}
              </div>
              <div className="board-results">
                <div className="board-row">
                  <span className="board-item">A: {result.boards?.A}</span>
                  <span className="board-item">B: {result.boards?.B}</span>
                  <span className="board-item">C: {result.boards?.C}</span>
                </div>
                <div className="board-row">
                  <span className="board-item">AB: {result.boards?.AB}</span>
                  <span className="board-item">AC: {result.boards?.AC}</span>
                    <span className="board-item">BC: {result.boards?.BC}</span>
                </div>
                <div className="board-row">
                  <span className="board-item">ABC: {result.boards?.ABC}</span>
                </div>
                <div className="board-row">
                  <span className="board-item">ABCD: {result.boards?.ABCD}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No results available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Result;