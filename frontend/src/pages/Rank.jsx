import './Rank.css';

const Rank = () => {
  const rankings = [
    { id: 1, rank: 1, name: 'ProGamer123', score: 2450, avatar: '👑' },
    { id: 2, rank: 2, name: 'GameMaster', score: 2380, avatar: '🥈' },
    { id: 3, rank: 3, name: 'ElitePlayer', score: 2290, avatar: '🥉' },
    { id: 4, rank: 4, name: 'SkillShot', score: 2150, avatar: '🎯' },
    { id: 5, rank: 5, name: 'FastFingers', score: 2080, avatar: '⚡' },
    { id: 6, rank: 6, name: 'CyberNinja', score: 1950, avatar: '🥷' },
    { id: 7, rank: 7, name: 'GameChamp', score: 1890, avatar: '🏆' },
    { id: 8, rank: 8, name: 'PixelHero', score: 1820, avatar: '🦸' }
  ];

  return (
    <div className="rank">
      <div className="rank-header">
        <h2>🏆 Leaderboard</h2>
        <p>Top players this season</p>
      </div>

      <div className="top-three">
        {rankings.slice(0, 3).map(player => (
          <div key={player.id} className={`podium-item rank-${player.rank}`}>
            <div className="podium-avatar">{player.avatar}</div>
            <div className="podium-info">
              <h4>{player.name}</h4>
              <p>{player.score} pts</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rankings-list">
        {rankings.slice(3).map(player => (
          <div key={player.id} className="rank-item">
            <div className="rank-position">#{player.rank}</div>
            <div className="player-avatar">{player.avatar}</div>
            <div className="player-info">
              <h4>{player.name}</h4>
              <p>{player.score} points</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rank;