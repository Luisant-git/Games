import { useState } from 'react';
import toast from 'react-hot-toast';
import { loginPlayer } from '../api/auth';
import './Login.css';

const Login = ({ onLogin, onSwitchToRegister, onSwitchToAgent, showAgentOption }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginPlayer(formData);
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.player));
        localStorage.setItem('userType', 'player');
        onLogin();
      } else {
        toast.error('Login failed!');
      }
    } catch (error) {
      toast.error('Login error!');
    }
  };

  return (
    <div className="login">
      {/* Disclaimer Box */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        right: '10px',
        height: '80px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '10px',
        overflowY: 'auto',
        fontSize: '12px',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <strong>Disclaimer:</strong> This gaming platform is for entertainment purposes only. Please play responsibly and within your means. Users must be 18+ years old to participate. Gambling can be addictive - seek help if needed from professional counseling services. By using this platform, you agree to our terms and conditions. We are not responsible for any financial losses. This platform operates under applicable gaming regulations. Please verify local laws before participating. Set spending limits and take regular breaks. If you feel you have a gambling problem, contact support immediately for assistance and resources.
      </div>

      <div className="login-container" style={{ marginTop: '100px', marginBottom: '120px' }}>
        <h2>Player Login</h2>
        
        {showAgentOption && (
          <div className="user-type-toggle">
            <button className="active">Player</button>
            <button onClick={onSwitchToAgent}>Agent</button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🫥' : '👁️'}
            </button>
          </div>
          <button type="submit">Login</button>
        </form>
        
        <p>
          Don't have an account? 
          <button type="button" onClick={onSwitchToRegister} className="link-button">
            Register here
          </button>
        </p>
      </div>

      {/* Note Box */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        right: '10px',
        height: '100px',
        backgroundColor: '#d1ecf1',
        border: '1px solid #bee5eb',
        borderRadius: '8px',
        padding: '10px',
        overflowY: 'auto',
        fontSize: '12px',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <strong>Important Notes:</strong><br/>
        • Ensure stable internet connection for smooth gameplay experience<br/>
        • Keep your login credentials secure and confidential at all times<br/>
        • Contact our 24/7 support team for any technical issues or queries<br/>
        • Read and understand all game rules before participating in any games<br/>
        • Withdraw winnings only through verified and secure payment methods<br/>
        • Account verification may be required for withdrawals above certain limits<br/>
        • Bonus terms and conditions apply to all promotional offers<br/>
        • Multiple accounts per user are strictly prohibited<br/>
        • We reserve the right to suspend accounts for suspicious activities<br/>
        • Regular system maintenance may temporarily affect service availability<br/>
        • All transactions are encrypted and secured with latest technology
      </div>
    </div>
  );
};

export default Login;