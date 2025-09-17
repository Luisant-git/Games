import { useState, useEffect } from "react";
import { getPlayerWallet } from "../api/wallet";
import "./Withdraw.css";

const Withdraw = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const userType = localStorage.getItem('userType');
      const response = userType === 'agent' ? await getAgentWallet() : await getPlayerWallet();
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleWithdraw = () => {
    if (!amount || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }
    if (amount > balance) {
      alert("Insufficient balance");
      return;
    }
    alert(`Withdrawal request of ₹${amount} submitted!`);
    // Here you will call API for withdraw
  };

  return (
    <div className="withdraw">
      <div className="withdraw-header">
        <h2>Withdraw Funds</h2>
      </div>

      <div className="withdraw-balance">
        <p>Your Current Balance</p>
        <h1>₹{balance}</h1>
      </div>

      <div className="withdraw-form">
        <label>Enter Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="₹ Amount"
        />

        <label>UPI / Bank Details</label>
        <input type="text" placeholder="Enter UPI ID or Bank Account" />

        <button onClick={handleWithdraw}>Withdraw</button>
      </div>
    </div>
  );
};

export default Withdraw;
