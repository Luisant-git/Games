import { useState, useEffect } from "react";
import { getPlayerWallet, getAgentWallet } from "../api/wallet";
import { createWithdraw, getWithdrawHistory } from "../api/withdraw";
import { uploadFile } from "../api/upload";
import toast from "react-hot-toast";
import "./Withdraw.css";

// Helper function to decode JWT token
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const Withdraw = () => {
  const [balance, setBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferType, setTransferType] = useState("UPI_TRANSFER");
  const [amount, setAmount] = useState("");
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  
  // Bank Transfer fields
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  
  // UPI Transfer fields
  const [upiId, setUpiId] = useState("");
  const [upiAppName, setUpiAppName] = useState("");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBalance();
    getAllWithdrawHistory();
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = decodeToken(token);
      const userType = decodedToken?.type;
      
      const response = userType === 'agent' ? await getAgentWallet() : await getPlayerWallet();
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (!amount || amount <= 0) {
        toast.error("Enter a valid amount");
        return;
      }
      if (parseFloat(amount) > balance) {
        toast.error("Insufficient balance");
        return;
      }

      let screenshotUrl = null;
      
      if (screenshotFile) {
        setUploading(true);
        try {
          const uploadResponse = await uploadFile(screenshotFile);
          screenshotUrl = uploadResponse.filename;
        } catch (uploadError) {
          toast.error('Failed to upload screenshot');
          return;
        } finally {
          setUploading(false);
        }
      }

      let transferDetails = {};
      
      if (transferType === "BANK_TRANSFER") {
        if (!accountNumber || !ifscCode || !bankName || !accountHolderName) {
          toast.error("Please fill all bank details");
          return;
        }
        transferDetails = {
          accountNumber,
          ifscCode,
          bankName,
          accountHolderName
        };
      } else {
        if (!upiId || !upiAppName) {
          toast.error("Please fill all UPI details");
          return;
        }
        transferDetails = {
          upiId,
          upiAppName
        };
      }

      const data = {
        transferType,
        transferDetails,
        amount: parseFloat(amount),
        ...(screenshotUrl && { screenshot: screenshotUrl }),
      };
      
      const response = await createWithdraw(data);

      if (response.success) {
        toast.success("Withdrawal request submitted successfully!");
        resetForm();
        fetchBalance();
        getAllWithdrawHistory();
      } else {
        toast.error(response.message || "Withdrawal request failed");
      }
    } catch (err) {
      console.error("Error submitting withdrawal:", err);
      toast.error("Withdrawal request failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setAccountNumber("");
    setIfscCode("");
    setBankName("");
    setAccountHolderName("");
    setUpiId("");
    setUpiAppName("");
    setScreenshotFile(null);
  };

  const getAllWithdrawHistory = async () => {
    try {
      const response = await getWithdrawHistory();
      if (response.success) {
        setWithdrawHistory(response.data);
      } else {
        toast.error("Failed to fetch withdrawal history.");
      }
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
    }
  };

  return (
    <div className="withdraw-page">
      <div className="app-header">
        <h2>WITHDRAW FUNDS</h2>
      </div>

      <div className="withdraw-content">
        <div className="card balance-card">
          <p>Your Current Balance</p>
          <h1>₹{balance.toFixed(2)}</h1>
        </div>

        <div className="card withdraw-form-card">
          <h3 className="card-title">Withdraw Funds</h3>
          
          <form className="withdraw-form" onSubmit={handleWithdraw}>
            <div className="form-group">
              <label>Transfer Type</label>
              <select
                value={transferType}
                onChange={(e) => setTransferType(e.target.value)}
                className="transfer-type-select"
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UPI_TRANSFER">UPI Transfer</option>
              </select>
            </div>

            {transferType === "BANK_TRANSFER" ? (
              <>
                <div className="form-group">
                  <label>Account Number</label>
                  <input
                    type="text"
                    placeholder="Enter bank account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    placeholder="Enter IFSC code"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    placeholder="Enter bank name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Account Holder Name</label>
                  <input
                    type="text"
                    placeholder="Enter account holder name"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>UPI ID</label>
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g., user@gpay)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>UPI App Name</label>
                  <select
                    value={upiAppName}
                    onChange={(e) => setUpiAppName(e.target.value)}
                    className="transfer-type-select"
                    required
                  >
                    <option value="">Select UPI App</option>
                    <option value="GOOGLE_PAY">Google Pay</option>
                    <option value="PHONE_PE">PhonePe</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                placeholder="Enter withdrawal amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Screenshot (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshotFile(e.target.files[0])}
              />
              {screenshotFile && <p>Selected: {screenshotFile.name}</p>}
            </div>

            <button
              type="submit"
              className="withdraw-button"
              disabled={isProcessing || uploading}
            >
              {uploading ? "Uploading..." : isProcessing ? "Processing..." : "WITHDRAW"}
            </button>
          </form>
        </div>

        <div className="card withdraw-history-card">
          <h3 className="card-title">Withdrawal History</h3>
          {withdrawHistory.length === 0 ? (
            <p className="no-history">No withdrawal history found</p>
          ) : (
            <div className="history-list">
              {withdrawHistory.map((withdraw) => (
                <div key={withdraw.id} className="history-item">
                  <div className="history-details">
                    <p><strong>Type:</strong> {withdraw.transferType === 'BANK_TRANSFER' ? 'Bank Transfer' : 'UPI Transfer'}</p>
                    <p><strong>Amount:</strong> ₹{withdraw.amount}</p>
                    {withdraw.transferType === 'BANK_TRANSFER' && (
                      <>
                        <p><strong>Account:</strong> {withdraw.transferDetails?.accountNumber}</p>
                        <p><strong>Bank:</strong> {withdraw.transferDetails?.bankName}</p>
                      </>
                    )}
                    {withdraw.transferType === 'UPI_TRANSFER' && (
                      <>
                        <p><strong>UPI ID:</strong> {withdraw.transferDetails?.upiId}</p>
                        <p><strong>UPI App:</strong> {withdraw.transferDetails?.upiAppName === 'GOOGLE_PAY' ? 'Google Pay' : 'PhonePe'}</p>
                      </>
                    )}
                    <p><strong>Status:</strong> <span className={`status-${withdraw.status.toLowerCase()}`}>{withdraw.status}</span></p>
                    <p><strong>Date:</strong> {new Date(withdraw.createdAt).toLocaleDateString()}</p>
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

export default Withdraw;
