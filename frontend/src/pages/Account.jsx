import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../api/config";
import "./Account.css";

const getPlayerProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/player/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};

const Account = () => {
  const [profile, setProfile] = useState({ name: "", username: "", phone: "", wallet: { balance: 0 } });
  console.log(profile, '<--- profile');
  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getPlayerProfile();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);
  return (
    <div className="account-screen">
      <div className="account-card">
        <div className="account-title">Account Information</div>

        <div className="account-balance">
          <span className="currency">₹</span>
          <span className="amount">{Number(profile.wallet?.balance || 0).toFixed(2)}</span>
        </div>

        <label className="field-label" htmlFor="name">Full Name</label>
        <input
          id="name"
          className="input"
          type="text"
          defaultValue={profile.name}
          disabled
        />

        <label className="field-label" htmlFor="username">Username</label>
        <input
          id="username"
          className="input"
          type="text"
          defaultValue={profile.username}
          disabled
        />

        <label className="field-label" htmlFor="mobile">Mobile Number</label>
        <input
          id="mobile"
          className="input"
          type="tel"
          defaultValue={profile.phone}
          disabled
        />
      </div>
    </div>
  );
};

export default Account;
