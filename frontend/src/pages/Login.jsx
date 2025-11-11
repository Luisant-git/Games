import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginPlayer, loginAgent } from "../api/auth";
import "./Login.css";
import { getCategories } from "../api/category";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Try player login first
      let response = await loginPlayer(formData);
      let data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.player));
        localStorage.setItem("userType", "player");
        toast.success("Login successful!");
        navigate("/");
        if (onLogin) onLogin();
        return;
      }

      // If player login fails, try agent login
      response = await loginAgent(formData);
      data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.agent));
        localStorage.setItem("userType", "agent");
        toast.success("Login successful!");
        navigate("/");
        if (onLogin) onLogin();
      } else {
        toast.error(data.message || "Login failed!");
      }
    } catch (error) {
      toast.error("Login error!");
    } finally {
      setIsLoading(false);
    }
  };

  const getAllCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response?.categories.slice(0, 2) || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    getAllCategories();
    
    // Auto-fill from URL parameters
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');
    const password = params.get('password');
    
    if (username || password) {
      setFormData({
        username: username || '',
        password: password || ''
      });
    }
  }, []);

  return (
    <div className="login">
      <div className="header-top">UDHAYAM LOTTERY BOOKING</div>
      {/* Disclaimer Box
      <div style={{
        position: 'fixed',
        top: '60px',
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
      </div> */}

      <div className="category-banner">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <img
              src={category.image || "https://via.placeholder.com/150"}
              alt={category.name}
            />
          </div>
        ))}
      </div>

      <div
        className="login-container"
        style={{ marginTop: "0px", marginBottom: "20px" }}
      >
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🫥" : "👁️"}
            </button>
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="loader-container">
                <span className="spinner"></span>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p>
          Don't have an account?
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="link-button"
          >
            Register here
          </button>
        </p>
      </div>

      <div className="feature-cards">
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Instant Withdrawal</h3>
          <p>Quick and hassle-free withdrawals</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Secure Platform</h3>
          <p>100% safe and encrypted transactions</p>
        </div>
      </div>

      {/* Dynamic copyright footer */}
      <div className="header-bottom">{`Udhayam©${new Date().getFullYear()}`}</div>
    </div>
  );
};

export default Login;
