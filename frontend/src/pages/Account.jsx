import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../api/config";
import "./Account.css";

const getProfile = async () => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  const endpoint = userType === 'agent' ? '/agent/profile' : '/player/profile';
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
        const data = await getProfile();
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
          <span className="amount">{Math.round((profile.wallet?.balance || 0) * 100) / 100}</span>
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

        {localStorage.getItem('userType') === 'agent' ? (
          <>
            <label className="field-label" htmlFor="referCode">Referral Code</label>
            <input
              id="referCode"
              className="input"
              type="text"
              defaultValue={profile.referCode}
              disabled
            />
          </>
        ) : (
          <>
            <label className="field-label" htmlFor="mobile">Mobile Number</label>
            <input
              id="mobile"
              className="input"
              type="tel"
              defaultValue={profile.phone}
              disabled
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Account;
