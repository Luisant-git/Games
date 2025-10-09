import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../api/settings';
import toast from 'react-hot-toast';
import './PaymentSettings.css';

const PaymentSettings = () => {
  const [settings, setSettings] = useState({
    depositStartTime: '',
    depositEndTime: '',
    withdrawStartTime: '',
    withdrawEndTime: '',
    minimumDepositAmount: '',
    minimumWithdrawAmount: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await getSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch settings');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await updateSettings({
        depositStartTime: settings.depositStartTime,
        depositEndTime: settings.depositEndTime,
        withdrawStartTime: settings.withdrawStartTime,
        withdrawEndTime: settings.withdrawEndTime,
        minimumDepositAmount: parseFloat(settings.minimumDepositAmount),
        minimumWithdrawAmount: parseFloat(settings.minimumWithdrawAmount)
      });
      
      if (response.success) {
        toast.success('Settings updated successfully');
      } else {
        toast.error(response.message || 'Failed to update settings');
      }
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="payment-settings">
      <h2>Payment Settings</h2>
      
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-section">
          <h3>Deposit Settings</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                name="depositStartTime"
                value={settings.depositStartTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                name="depositEndTime"
                value={settings.depositEndTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Minimum Amount</label>
            <input
              type="number"
              name="minimumDepositAmount"
              value={settings.minimumDepositAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Withdraw Settings</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                name="withdrawStartTime"
                value={settings.withdrawStartTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                name="withdrawEndTime"
                value={settings.withdrawEndTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Minimum Amount</label>
            <input
              type="number"
              name="minimumWithdrawAmount"
              value={settings.minimumWithdrawAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Updating...' : 'Update Settings'}
        </button>
      </form>
    </div>
  );
};

export default PaymentSettings;