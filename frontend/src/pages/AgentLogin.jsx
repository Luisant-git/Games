import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginAgent } from '../api/auth';
import './Login.css';

const AgentLogin = ({ onLogin, onSwitchToRegister, onSwitchToPlayer }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginAgent(formData);
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.agent));
        localStorage.setItem('userType', 'agent');
        navigate('/agent-profile');
        if (onLogin) onLogin();
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
        <h2>Agent Login</h2>
        
        {onSwitchToPlayer && (
          <div className="user-type-toggle">
            <button onClick={onSwitchToPlayer}>Player</button>
            <button className="active">Agent</button>
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
          <button type="button" onClick={() => navigate('/agent-register')} className="link-button">
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default AgentLogin;