import { useState } from 'react';
import toast from 'react-hot-toast';
import { loginPlayer } from '../api/auth';
import './Login.css';

const Login = ({ onLogin, onSwitchToRegister, onSwitchToAgent, showAgentOption }) => {
  const [formData, setFormData] = useState({
    email: '',
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
      <div className="login-container">
        <h2>Player Login</h2>
        
        {showAgentOption && (
          <div className="user-type-toggle">
            <button className="active">Player</button>
            <button onClick={onSwitchToAgent}>Agent</button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
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
    </div>
  );
};

export default Login;