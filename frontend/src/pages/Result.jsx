import React, { useState, useEffect } from "react";
import { getResults } from "../api/result";
import "./Result.css";

const Result = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const data = await getResults();
      setResults(data);
      const uniqueCategories = [...new Set(data.map(r => r.category).filter(Boolean))];
      const sortedCategories = uniqueCategories.sort((a, b) => {
        if (a.toUpperCase() === 'DEAR') return -1;
        if (b.toUpperCase() === 'DEAR') return 1;
        return 0;
      });
      setCategories(sortedCategories);
      if (sortedCategories.length > 0) {
        setSelectedCategory(sortedCategories[0]);
      }
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

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
  };

  const groupResultsByDate = (results) => {
    const groups = results.reduce((groups, result) => {
      const date = formatDateWithoutTime(result.date);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(result);
      return groups;
    }, {});
    
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => {
        const timeA = convertTo24Hour(a.time);
        const timeB = convertTo24Hour(b.time);
        return timeA.localeCompare(timeB);
      });
    });
    
    return groups;
  };

  if (loading) {
    return (
      <div className="result-container">
        <div className="loading">Loading results...</div>
      </div>
    );
  }

  const filteredResults = selectedCategory 
    ? results.filter(r => r.category === selectedCategory)
    : results;

  return (
    <div className="result-container">
      <div className="result-header">
        <h2>🏆 Game Results</h2>
      </div>

      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category}
            className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="results-list">
        {filteredResults.length > 0 ? (
          Object.entries(groupResultsByDate(filteredResults)).map(
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
