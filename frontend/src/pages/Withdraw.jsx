import { useState, useEffect } from "react";
import { getPlayerWallet, getAgentWallet } from "../api/wallet";
import { createWithdraw, getWithdrawHistory } from "../api/withdraw";
import { uploadFile } from "../api/upload";
import { getSettings } from "../api/settings";
import { getBankAccounts, createBankAccount, setDefaultBankAccount, deleteBankAccount } from "../api/bankAccount";
import toast from "react-hot-toast";
import "./Withdraw.css";

// Helper function to decode JWT token
const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const Withdraw = () => {
  const [balance, setBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferType, setTransferType] = useState("UPI_TRANSFER");
  const [amount, setAmount] = useState("");
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [withdrawSettings, setWithdrawSettings] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState("");
  const [showAddBankForm, setShowAddBankForm] = useState(false);

  // Bank Transfer fields
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");

  // UPI Transfer fields
  const [upiId, setUpiId] = useState("");
  const [upiAppName, setUpiAppName] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBalance();
    getAllWithdrawHistory();
    fetchWithdrawSettings();
    fetchBankAccounts();
  }, []);

  useEffect(() => {
    if (transferType === "BANK_TRANSFER" && bankAccounts.length > 0) {
      const defaultAccount = bankAccounts.find(acc => acc.isDefault);
      if (defaultAccount) {
        setSelectedBankAccount(defaultAccount.id.toString());
      }
    }
  }, [transferType, bankAccounts]);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = decodeToken(token);
      const userType = decodedToken?.type;

      const response =
        userType === "agent" ? await getAgentWallet() : await getPlayerWallet();
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
      if (!phone.trim()) {
        toast.error("Phone number is required");
        return;
      }
      if (!amount || amount <= 0) {
        toast.error("Amount is required");
        return;
      }
      if (!screenshotFile) {
        toast.error("Screenshot is required");
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
          toast.error("Failed to upload screenshot");
          return;
        } finally {
          setUploading(false);
        }
      }

      let transferDetails = {};

      if (transferType === "BANK_TRANSFER") {
        if (selectedBankAccount) {
          const selectedAccount = bankAccounts.find(acc => acc.id.toString() === selectedBankAccount);
          transferDetails = {
            accountNumber: selectedAccount.accountNumber,
            ifscCode: selectedAccount.ifscCode,
            bankName: selectedAccount.bankName,
            accountHolderName: selectedAccount.accountHolderName,
          };
        } else if (accountNumber || ifscCode || bankName || accountHolderName) {
          transferDetails = {
            accountNumber,
            ifscCode,
            bankName,
            accountHolderName,
          };
        }
      } else {
        if (upiId || upiAppName) {
          transferDetails = {
            upiId,
            upiAppName,
          };
        }
      }

      const data = {
        transferType,
        transferDetails,
        amount: parseFloat(amount),
        ...(name && { name }),
        ...(phone && { phone }),
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
    setName("");
    setPhone("");
    setSelectedBankAccount("");
    setShowAddBankForm(false);
    resetBankForm();
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

  const fetchWithdrawSettings = async () => {
    try {
      const response = await getSettings();
      if (response.success) {
        setWithdrawSettings(response.data);
      }
    } catch (error) {
      console.error("Error fetching withdraw settings:", error);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const response = await getBankAccounts();
      if (response.success) {
        setBankAccounts(response.data);
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  const handleAddBankAccount = async (e) => {
    e.preventDefault();
    try {
      if (!accountNumber || !ifscCode || !bankName || !accountHolderName) {
        toast.error("Please fill all bank details");
        return;
      }

      const bankAccountData = {
        accountNumber,
        ifscCode,
        bankName,
        accountHolderName,
        isDefault: bankAccounts.length === 0,
      };

      const response = await createBankAccount(bankAccountData);
      if (response.success) {
        toast.success("Bank account added successfully!");
        setShowAddBankForm(false);
        resetBankForm();
        fetchBankAccounts();
      } else {
        toast.error(response.message || "Failed to add bank account");
      }
    } catch (error) {
      console.error("Error adding bank account:", error);
      toast.error("Failed to add bank account");
    }
  };

  const resetBankForm = () => {
    setAccountNumber("");
    setIfscCode("");
    setBankName("");
    setAccountHolderName("");
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
          {withdrawSettings && (
            <div className="withdraw-info">
              <p><strong>Withdraw Timing:</strong> {formatTimeToAMPM(withdrawSettings.withdrawStartTime)} - {formatTimeToAMPM(withdrawSettings.withdrawEndTime)}</p>
              <p><strong>Minimum Amount:</strong> ₹{withdrawSettings.minimumWithdrawAmount}</p>
            </div>
          )}

          <form className="withdraw-form" onSubmit={handleWithdraw}>
            <div className="form-group">
              <label>Name (Optional)</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Phone Number <span style={{color: 'red'}}>*</span></label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Transfer Type (Optional)</label>
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
                {bankAccounts.length > 0 && (
                  <div className="form-group">
                    <label>Select Bank Account</label>
                    <select
                      value={selectedBankAccount}
                      onChange={(e) => {
                        setSelectedBankAccount(e.target.value);
                        if (e.target.value) {
                          setShowAddBankForm(false);
                        }
                      }}
                      className="transfer-type-select"
                    >
                      <option value="">Select existing account</option>
                      {bankAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.bankName} - ****{account.accountNumber.slice(-4)} {account.isDefault ? '(Default)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="form-group">
                  <button
                    type="button"
                    className="add-account-btn"
                    onClick={() => {
                      setShowAddBankForm(!showAddBankForm);
                      setSelectedBankAccount("");
                    }}
                  >
                    {showAddBankForm ? "Cancel" : "Add New Bank Account"}
                  </button>
                </div>

                {showAddBankForm && (
                  <>
                    <div className="form-group">
                      <label>Account Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="Enter bank account number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>IFSC Code (Optional)</label>
                      <input
                        type="text"
                        placeholder="Enter IFSC code"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Bank Name (Optional)</label>
                      <input
                        type="text"
                        placeholder="Enter bank name"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Account Holder Name (Optional)</label>
                      <input
                        type="text"
                        placeholder="Enter account holder name"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <button
                        type="button"
                        className="save-account-btn"
                        onClick={handleAddBankAccount}
                      >
                        Save Bank Account
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>UPI ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g., user@gpay)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>UPI App Name (Optional)</label>
                  <select
                    value={upiAppName}
                    onChange={(e) => setUpiAppName(e.target.value)}
                    className="transfer-type-select"
                  >
                    <option value="">Select UPI App</option>
                    <option value="GOOGLE_PAY">Google Pay</option>
                    <option value="PHONE_PE">PhonePe</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Amount (₹) <span style={{color: 'red'}}>*</span></label>
              <input
                type="number"
                placeholder={`Enter withdrawal amount (Min: ₹${withdrawSettings?.minimumWithdrawAmount || 0})`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={withdrawSettings?.minimumWithdrawAmount || 0}
                required
              />
            </div>

            <div className="form-group">
              <label>Screenshot <span style={{color: 'red'}}>*</span></label>
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
              className="withdraw-button"
              disabled={isProcessing || uploading}
            >
              {uploading
                ? "Uploading..."
                : isProcessing
                ? "Processing..."
                : "WITHDRAW"}
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
                    <p>
                      <strong>Type:</strong>{" "}
                      {withdraw.transferType === "BANK_TRANSFER"
                        ? "Bank Transfer"
                        : "UPI Transfer"}
                    </p>
                    <p>
                      <strong>Amount:</strong> ₹{withdraw.amount}
                    </p>
                    {withdraw.transferType === "BANK_TRANSFER" && (
                      <>
                        <p>
                          <strong>Account:</strong>{" "}
                          {withdraw.transferDetails?.accountNumber}
                        </p>
                        <p>
                          <strong>Bank:</strong>{" "}
                          {withdraw.transferDetails?.bankName}
                        </p>
                      </>
                    )}
                    {withdraw.transferType === "UPI_TRANSFER" && (
                      <>
                        <p>
                          <strong>UPI ID:</strong>{" "}
                          {withdraw.transferDetails?.upiId}
                        </p>
                        <p>
                          <strong>UPI App:</strong>{" "}
                          {withdraw.transferDetails?.upiAppName
                            ? (withdraw.transferDetails.upiAppName === "GOOGLE_PAY"
                              ? "Google Pay"
                              : "PhonePe")
                            : "N/A"}
                        </p>
                      </>
                    )}
                    {withdraw.referenceNumber && (
                      <p>
                        <strong>Reference:</strong> {withdraw.referenceNumber}
                      </p>
                    )}
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`status-${withdraw.status.toLowerCase()}`}
                      >
                        {withdraw.status === "PENDING"
                          ? "Waiting for admin approval"
                          : withdraw.status === "COMPLETED"
                          ? "Amount withdrawn successfully"
                          : withdraw.status === "MISMATCH"
                          ? "Withdrawal amount mismatch — please check and retry"
                          : withdraw.status}
                      </span>
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(withdraw.createdAt).toLocaleDateString()}
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

export default Withdraw;
