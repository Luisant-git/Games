import { useState, useEffect } from "react";
import "./Deposit.css";
import QRCODE from "../assets/scan_me_qr_code.jpg";
import { getPlayerWallet, getAgentWallet } from "../api/wallet";
import { createDeposit, getDepositHistory } from "../api/deposit";
import { uploadFile } from "../api/upload";
import { getSettings } from "../api/settings";
import toast from "react-hot-toast";

const Deposit = () => {
  const [balance, setBalance] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState(null);
  const [transferType, setTransferType] = useState("UPI_TRANSFER");
  const [amount, setAmount] = useState("");
  const [depositHistory, setDepositHistory] = useState([]);
  const [depositSettings, setDepositSettings] = useState(null);

  // Bank Transfer fields
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankTransactionId, setBankTransactionId] = useState("");

  // UPI Transfer fields
  const [upiId, setUpiId] = useState("");
  const [upiTransactionId, setUpiTransactionId] = useState("");
  const [upiAppName, setUpiAppName] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [transactionSlipFile, setTransactionSlipFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBalance();
    getAllDepositHistory();
    fetchDepositSettings();
  }, []);

  const fetchBalance = async () => {
    try {
      const userType = localStorage.getItem("userType");
      const response =
        userType === "agent" ? await getAgentWallet() : await getPlayerWallet();
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
      if (!name.trim()) {
        toast.error("Name is required");
        setIsVerifying(false);
        return;
      }
      if (!phone.trim()) {
        toast.error("Phone number is required");
        setIsVerifying(false);
        return;
      }
      if (!screenshotFile) {
        toast.error("Screenshot is required");
        setIsVerifying(false);
        return;
      }
      if (transferType === "BANK_TRANSFER" && !transactionSlipFile) {
        toast.error("Transaction slip is required for bank transfers");
        setIsVerifying(false);
        return;
      }

      let screenshotUrl = null;
      let transactionSlipUrl = null;

      setUploading(true);
      
      try {
        if (screenshotFile) {
          const uploadResponse = await uploadFile(screenshotFile);
          screenshotUrl = uploadResponse.filename;
        }
        
        if (transactionSlipFile) {
          const uploadResponse = await uploadFile(transactionSlipFile);
          transactionSlipUrl = uploadResponse.filename;
        }
      } catch (uploadError) {
        toast.error("Failed to upload files");
        return;
      } finally {
        setUploading(false);
      }
      let transferDetails = {};

      if (transferType === "BANK_TRANSFER") {
        transferDetails = {
          accountNumber,
          ifscCode,
          bankName,
          accountHolderName,
          transactionId: bankTransactionId,
        };
      } else {
        transferDetails = {
          upiId,
          transactionId: upiTransactionId,
          upiAppName,
        };
      }

      const data = {
        transferType,
        transferDetails,
        amount: parseFloat(amount),
        ...(name && { name }),
        ...(phone && { phone }),
        ...(screenshotUrl && { screenshot: screenshotUrl }),
        ...(transactionSlipUrl && { transactionSlip: transactionSlipUrl }),
      };

      const response = await createDeposit(data);

      if (response.success) {
        toast.success("Payment verified successfully!");
        setStatus("success");
        resetForm();
        getAllDepositHistory();
      } else {
        setStatus("error");
        toast.error(response.message || "Payment verification failed");
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      setStatus("error");
      toast.error("Payment verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setName("");
    setPhone("");
    setAccountNumber("");
    setIfscCode("");
    setBankName("");
    setAccountHolderName("");
    setBankTransactionId("");
    setUpiId("");
    setUpiTransactionId("");
    setUpiAppName("");
    setScreenshotFile(null);
    setTransactionSlipFile(null);
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

  const fetchDepositSettings = async () => {
    try {
      const response = await getSettings();
      if (response.success) {
        setDepositSettings(response.data);
      }
    } catch (error) {
      console.error("Error fetching deposit settings:", error);
    }
  };

  const formatTimeToAMPM = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
          <h3 className="card-title">Deposit Funds</h3>
          {depositSettings && (
            <div className="deposit-info">
              <p><strong>Deposit Timing:</strong> {formatTimeToAMPM(depositSettings.depositStartTime)} - {formatTimeToAMPM(depositSettings.depositEndTime)}</p>
              <p><strong>Minimum Amount:</strong> ₹{depositSettings.minimumDepositAmount}</p>
            </div>
          )}
          <div className="qr-section">
            <img src={QRCODE} alt="Scan Me to Pay" className="qr-image" />
            <button 
              className="download-qr-btn"
              onClick={() => {
                const link = document.createElement('a');
                link.href = QRCODE;
                link.download = 'payment-qr-code.jpg';
                link.click();
              }}
            >
              📥 Download QR Code
            </button>
            <div className="upi-id-section">
              <p className="upi-label">UPI ID:</p>
              <div className="upi-id-container">
                <span className="upi-id">gamehub@paytm</span>
                <button 
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText('gamehub@paytm');
                    toast.success('UPI ID copied to clipboard!');
                  }}
                >
                  📋 Copy
                </button>
              </div>
            </div>
            <p className="upi-note">
              Scan QR for UPI payments or use bank transfer details below
            </p>
          </div>

          <form className="verify-form" onSubmit={handleVerifyPayment}>
            <h3 className="card-title">Verify Your Payment</h3>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

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
                <div className="form-group">
                  <label>Transaction ID / Reference Number</label>
                  <input
                    type="text"
                    placeholder="Enter bank transaction ID or reference number"
                    value={bankTransactionId}
                    onChange={(e) => setBankTransactionId(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Transaction Slip (Required)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setTransactionSlipFile(e.target.files[0])}
                    required
                  />
                  {transactionSlipFile && <p>Selected: {transactionSlipFile.name}</p>}
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
                <div className="form-group">
                  <label>Transaction ID</label>
                  <input
                    type="text"
                    placeholder="Enter UPI transaction ID"
                    value={upiTransactionId}
                    onChange={(e) => setUpiTransactionId(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                placeholder={`Enter amount deposited (Min: ₹${depositSettings?.minimumDepositAmount || 0})`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={depositSettings?.minimumDepositAmount || 0}
                required
              />
            </div>

            <div className="form-group">
              <label>Screenshot</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshotFile(e.target.files[0])}
                required
              />
              {screenshotFile && <p>Selected: {screenshotFile.name}</p>}
            </div>

            <button
              type="submit"
              className="verify-button"
              disabled={isVerifying || uploading}
            >
              {uploading
                ? "Uploading..."
                : isVerifying
                ? "Verifying..."
                : "DEPOSIT"}
            </button>

            {status === "success" && (
              <p className="status success">
                ✅ Payment Request has been received, <span className="status error">please wait for approval</span>
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
                    <p>
                      <strong>Type:</strong>{" "}
                      {deposit.transferType === "BANK_TRANSFER"
                        ? "Bank Transfer"
                        : "UPI Transfer"}
                    </p>
                    <p>
                      <strong>Amount:</strong> ₹{deposit.amount}
                    </p>
                    <p>
                      <strong>Transaction ID:</strong>{" "}
                      {deposit.transferDetails?.transactionId}
                    </p>
                    {deposit.transferType === "BANK_TRANSFER" && (
                      <p>
                        <strong>Bank:</strong>{" "}
                        {deposit.transferDetails?.bankName}
                      </p>
                    )}
                    {deposit.transferType === "UPI_TRANSFER" && (
                      <>
                        <p>
                          <strong>UPI ID:</strong>{" "}
                          {deposit.transferDetails?.upiId}
                        </p>
                        <p>
                          <strong>UPI App:</strong>{" "}
                          {deposit.transferDetails?.upiAppName === "GOOGLE_PAY"
                            ? "Google Pay"
                            : "PhonePe"}
                        </p>
                      </>
                    )}
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`status-${deposit.status.toLowerCase()}`}
                      >
                        {deposit.status === "PENDING"
                          ? "Waiting for admin approval"
                          : deposit.status === "COMPLETED"
                          ? "Amount added to wallet"
                          : deposit.status === "MISMATCH"
                          ? "Amount mismatch — please check and retry"
                          : deposit.status}
                      </span>
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(deposit.createdAt).toLocaleDateString()}
                    </p>
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
