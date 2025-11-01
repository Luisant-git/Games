import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { registerPlayer } from "../api/auth";
import { getCategories } from "../api/category";
import "./Register.css";

const Register = ({
  onRegister,
  onSwitchToLogin,
  onSwitchToAgent,
  showAgentOption,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
    password: "",
    referalCode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number
    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerPlayer(formData);
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.player));
        localStorage.setItem("userType", "player");
        toast.success("Registration successful!");
        navigate("/");
        if (onRegister) onRegister();
      } else {
        toast.error(data?.message || "Registration failed!");
      }
    } catch (error) {
      toast.error("Registration error!");
    } finally {
      setIsLoading(false);
    }
  };

  const getAllCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res?.categories?.slice(0, 2) || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    getAllCategories();

    // Auto-populate referral code from URL
    const refCode = searchParams.get("ref");
    if (refCode) {
      setFormData((prev) => ({ ...prev, referalCode: refCode }));
    }
  }, [searchParams]);

  return (
    <div className="register">
      {/* Top fixed header — same as Login */}
      <div className="header-top">UDHAYAM LOTTERY BOOKING</div>

      {/* Category banner — same as Login */}
      <div className="category-banner">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="category-card"
            role="button"
            tabIndex={0}
          >
            <img
              src={cat.image || "https://via.placeholder.com/150"}
              alt={cat.name}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Main form container */}
      <div
        className="register-container"
        style={{ marginTop: "0px", marginBottom: "20px" }}
      >
        <h2>Registration</h2>

        <form onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            aria-label="Full Name"
          />
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
            aria-label="Username"
            autoComplete="username"
          />
          <input
            type="tel"
            placeholder="Phone (10 digits)"
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
              setFormData({ ...formData, phone: value });
            }}
            required
            aria-label="Phone"
            autoComplete="tel"
            maxLength="10"
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
              aria-label="Password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🫥" : "👁️"}
            </button>
          </div>
          <input
            type="text"
            placeholder="Referral Code (Optional)"
            value={formData.referalCode}
            onChange={(e) =>
              setFormData({ ...formData, referalCode: e.target.value })
            }
            aria-label="Referral Code"
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="loader-container">
                <span className="spinner"></span>
                Registering...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p>
          Already have an account?{" "}
          <button
            type="button"
            onClick={() =>
              onSwitchToLogin ? onSwitchToLogin() : navigate("/login")
            }
            className="link-button"
          >
            Login here
          </button>
        </p>
      </div>

      {/* Feature cards — same as Login */}
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

      {/* Bottom fixed footer — same as Login */}
      <div className="header-bottom">{`Udhayam©${new Date().getFullYear()}`}</div>
    </div>
  );
};

export default Register;
