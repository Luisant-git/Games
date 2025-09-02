import { useEffect, useState } from "react";
import { getCategories } from "../api/category";
import Game from "./Game";
import "./Home.css";

const Home = ({ onGameStateChange, onCategoryChange, selectedCategory, onNavigateToHistory }) => {
  const [categories, setCategories] = useState([]);
  const [games, setGames] = useState([]);
  console.log(games);

  useEffect(() => {
    if (onGameStateChange) {
      onGameStateChange(!!selectedCategory);
    }
  }, [selectedCategory, onGameStateChange]);

  useEffect(() => {
    const fetchData = async () => {
      const categoryData = await getCategories();
      setCategories(categoryData?.categories || []);
      setGames(categoryData?.games || []);
    };
    fetchData();
  }, []);

  return (
    <div className="home">
      {selectedCategory ? (
        <Game category={selectedCategory} games={games} onNavigateToHistory={onNavigateToHistory} />
      ) : (
        <>
          {/* <div className="search-bar">
            <input type="text" placeholder="Search for games ..." />
            <button className="search-btn">🔍</button>
          </div> */}
          {categories.map((category) => (
            <div className="banner" key={category.id}>
              <img
                className="banner-image"
                src={category.image}
                alt={category.name}
                onClick={() => {
                  onCategoryChange(category);
                }}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Home;
