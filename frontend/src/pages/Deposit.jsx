import { useState, useEffect } from "react";
import "./Deposit.css";
import QRCODE from "../assets/scan_me_qr_code.jpg";
import { getPlayerWallet } from "../api/wallet";
import { createDeposit, getDepositHistory } from "../api/deposit";
import toast from "react-hot-toast";

const Deposit = () => {
  const [balance, setBalance] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [depositHistory, setDepositHistory] = useState([]);
  console.log(depositHistory, "<--- depositHistory");
  

  useEffect(() => {
    fetchBalance();
    getAllDepositHistory();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await getPlayerWallet();
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleVerifyPayment = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setStatus(null);

    try {
      const data = {
        utrNumber,
        amount: parseFloat(amount),
      };
      const response = await createDeposit(data);

      if (response.success) {
        toast.success("Payment verified successfully!");
        setStatus("success");
        setBalance((prev) => prev + parseFloat(amount));
        setUtrNumber("");
        setAmount("");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      setStatus("error");
    } finally {
      setIsVerifying(false);
    }
  };

  const getAllDepositHistory = async () => {
    try {
      const response = await getDepositHistory();
      if (response.success) {
        setDepositHistory(response.data);
      } else {
        toast.error("Failed to fetch deposit history.");
      }
    } catch (error) {
      console.error("Error fetching deposit history:", error);
    }
  };

  return (
    <div className="deposit-page">
      <div className="app-header">
        <h2>DEPOSIT FUNDS</h2>
      </div>

      <div className="deposit-content">
        <div className="card balance-card">
          <p>Your Current Balance</p>
          <h1>₹{balance.toFixed(2)}</h1>
        </div>

        <div className="card deposit-actions-card">
          <h3 className="card-title">Deposit via BharatPe</h3>
          <div className="qr-section">
            <img src={QRCODE} alt="Scan Me to Pay" className="qr-image" />
            <p className="upi-note">
              Accept All UPI Payment Automatic Add Amount In Your Wallet
            </p>
          </div>

          <form className="verify-form" onSubmit={handleVerifyPayment}>
            <h3 className="card-title">Verify Your Payment</h3>
            <div className="form-group">
              <label>UTR Number</label>
              <input
                type="text"
                placeholder="Enter UTR from payment receipt"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                placeholder="Enter amount deposited"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="verify-button"
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "VERIFY DEPOSIT"}
            </button>

            {status === "success" && (
              <p className="status success">
                ✅ Payment verified successfully!
              </p>
            )}
            {status === "error" && (
              <p className="status error">
                ❌ Payment verification failed. Please try again.
              </p>
            )}
          </form>
        </div>

        <div className="card deposit-history-card">
          <h3 className="card-title">Deposit History</h3>
          {depositHistory.length === 0 ? (
            <p className="no-history">No deposit history found</p>
          ) : (
            <div className="history-list">
              {depositHistory.map((deposit) => (
                <div key={deposit.id} className="history-item">
                  <div className="history-details">
                    <p><strong>UTR:</strong> {deposit.utrNumber}</p>
                    <p><strong>Amount:</strong> ₹{deposit.amount}</p>
                    <p><strong>Status:</strong> <span className={`status-${deposit.status.toLowerCase()}`}>{deposit.status}</span></p>
                    <p><strong>Date:</strong> {new Date(deposit.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deposit;
