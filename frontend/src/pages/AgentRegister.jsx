import { useState } from 'react';
import toast from 'react-hot-toast';
import { registerAgent } from '../api/auth';
import './Register.css';

const AgentRegister = ({ onRegister, onSwitchToLogin, onSwitchToPlayer }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registerAgent(formData);
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.agent));
        localStorage.setItem('userType', 'agent');
        onRegister();
      } else {
        toast.error('Registration failed!');
      }
    } catch (error) {
      toast.error('Registration error!');
    }
  };

  return (
    <div className="register">
      <div className="register-container">
        <h2>Agent Register</h2>
        
        {onSwitchToPlayer && (
          <div className="user-type-toggle">
            <button onClick={onSwitchToPlayer}>Player</button>
            <button className="active">Agent</button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
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
          <button type="submit">Register</button>
        </form>
        
        <p>
          Already have an account? 
          <button type="button" onClick={onSwitchToLogin} className="link-button">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default AgentRegister;