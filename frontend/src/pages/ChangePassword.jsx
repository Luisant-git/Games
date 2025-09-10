import React, { useState } from "react";
import { changePassword } from "../api/player";
import "./ChangePassword.css";
import toast from "react-hot-toast";

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const response = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      if (response.success) {
        toast.success('Password changed successfully');
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error(error.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-screen">
      <div className="password-card">
        <div className="password-title">Change Password</div>

        <form className="form-vertical" onSubmit={submit}>
          <label className="field-label" htmlFor="currentPassword">
            Current Password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            className="input"
            type="password"
            placeholder="Enter current password"
            value={form.currentPassword}
            onChange={handleChange}
            required
          />

          <label className="field-label" htmlFor="newPassword">
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            className="input"
            type="password"
            placeholder="Enter new password"
            value={form.newPassword}
            onChange={handleChange}
            required
          />

          <label className="field-label" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            className="input"
            type="password"
            placeholder="Re-enter new password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'CHANGING...' : 'CHANGE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
