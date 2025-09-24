import React, { useState, useEffect } from "react";
import { getResults } from "../api/result";
import "./Result.css";

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
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format date as DD-MM-YYYY (no time)
  const formatDateWithoutTime = (dateString) => {
    return new Date(dateString)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  };

  // If you want to use this new format in groupResultsByDate, replace formatDate with formatDateWithoutTime below:

  const formatNumber = (number) => {
    return number
      .toString()
      .split("")
      .map((digit) => {
        const emojiMap = {
          0: "0️⃣",
          1: "1️⃣",
          2: "2️⃣",
          3: "3️⃣",
          4: "4️⃣",
          5: "5️⃣",
          6: "6️⃣",
          7: "7️⃣",
          8: "8️⃣",
          9: "9️⃣",
        };
        return emojiMap[digit] || digit;
      })
      .join("");
  };

  const groupResultsByDate = (results) => {
    return results.reduce((groups, result) => {
      const date = formatDateWithoutTime(result.date);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(result);
      return groups;
    }, {});
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
        <h2>🏆 Game Results</h2>
      </div>

      <div className="results-list">
        {results.length > 0 ? (
          Object.entries(groupResultsByDate(results)).map(
            ([date, dateResults]) => (
              <div key={date} className="date-group">
                <div className="date-header">{date}</div>
                {dateResults.map((result) => (
                  <div key={result.id} className="result-row">
                    <span className="time-label">{result.time} =</span>
                    <span className="number-display">
                      {formatNumber(result.numbers)}
                    </span>
                  </div>
                ))}
              </div>
            )
          )
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
