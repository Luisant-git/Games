import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerPlayer } from '../api/auth';
import './Register.css';

const Register = ({ onRegister, onSwitchToLogin, onSwitchToAgent, showAgentOption }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    referalCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registerPlayer(formData);
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.player));
        localStorage.setItem('userType', 'player');
        navigate('/');
        if (onRegister) onRegister();
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
        <h2>Player Registration</h2>
        
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
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
          <input
            type="text"
            placeholder="Referral Code (Optional)"
            value={formData.referalCode}
            onChange={(e) => setFormData({...formData, referalCode: e.target.value})}
          />
          <button type="submit">Register</button>
        </form>
        
        <p>
          Already have an account? 
          <button type="button" onClick={() => navigate('/login')} className="link-button">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;