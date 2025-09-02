import { useState } from 'react';
import './Search.css';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const recentSearches = ['Gaming laptop', 'RGB mouse', 'Mechanical keyboard', 'Wireless headset'];
  const trendingSearches = ['RTX 4090', 'Gaming chair', 'Stream deck', 'VR headset'];

  return (
    <div className="search">
      <div className="search-header">
        <div className="search-input-container">
          <input 
            type="text" 
            placeholder="Search for gaming products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>
      </div>

      {!searchQuery && (
        <>
          <section className="search-section">
            <h3>Recent Searches</h3>
            <div className="search-tags">
              {recentSearches.map((search, index) => (
                <button key={index} className="search-tag recent">
                  🕒 {search}
                </button>
              ))}
            </div>
          </section>

          <section className="search-section">
            <h3>Trending Searches</h3>
            <div className="search-tags">
              {trendingSearches.map((search, index) => (
                <button key={index} className="search-tag trending">
                  🔥 {search}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {searchQuery && (
        <div className="search-results">
          <p>Searching for "{searchQuery}"...</p>
        </div>
      )}
    </div>
  );
};

export default Search;