import React, { useState } from "react";
import axios from "axios";
import "./mailList.css";

const MailList = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  // Function to validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error before submission

    // Validate email format
    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8800/api/subscribe", {
        email,
      });
      setSubscribed(true);
      setEmail(""); // Clear input field after successful subscription
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="mail">
      <h1 className="mailTitle">Save time, save money!</h1>
      <span className="mailDesc">
        Sign up and we'll send the best deals to you
      </span>
      <form className="mailInputContainer" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Subscribe</button>
      </form>
      {subscribed && (
        <p className="successMessage">Thank you for subscribing!</p>
      )}
      {error && <p className="errorMessage">Error: {error}</p>}
    </div>
  );
};

export default MailList;
