import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./register.css";

const Register = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [validationError, setValidationError] = useState(null);
  const [verificationToken, setVerificationToken] = useState("");
  const [isVerificationStep, setIsVerificationStep] = useState(false);

  const { loading, error, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleTokenChange = (e) => {
    setVerificationToken(e.target.value);
  };

  const validateInputs = () => {
    const { username, email, password } = credentials;

    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

    if (!usernameRegex.test(username)) {
      return "Username must be 3-15 characters long and can only contain letters, numbers, and underscores.";
    }

    if (!emailRegex.test(email)) {
      return "Invalid email format.";
    }

    if (!passwordRegex.test(password)) {
      return "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.";
    }

    return null;
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setValidationError(null);

    const validationError = validateInputs();
    if (validationError) {
      setValidationError(validationError);
      return;
    }

    dispatch({ type: "REGISTER_START" });
    try {
      const res = await axios.post(
        "http://localhost:8800/api/auth/register",
        credentials
      );

      dispatch({ type: "REGISTER_SUCCESS", payload: res.data });
      setIsVerificationStep(true); // Move to verification step
    } catch (err) {
      dispatch({ type: "REGISTER_FAILURE", payload: err.response.data });
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8800/api/auth/verify-email",
        { token: verificationToken }
      );

      alert(res.data); // Show success message
      navigate("/login");
    } catch (err) {
      alert("Error verifying email: " + err.response.data);
    }
  };

  const handleLoginNavigation = () => {
    navigate("/login");
  };

  return (
    <div className="register">
      <div className="rContainer">
        {!isVerificationStep ? (
          <form onSubmit={handleClick}>
            <input
              type="text"
              placeholder="username"
              id="username"
              onChange={handleChange}
              className="rInput"
              value={credentials.username}
              autoComplete="username"
            />
            <input
              type="email"
              placeholder="email"
              id="email"
              onChange={handleChange}
              className="rInput"
              value={credentials.email}
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="password"
              id="password"
              onChange={handleChange}
              className="rInput"
              value={credentials.password}
              autoComplete="new-password"
            />
            <button disabled={loading} type="submit" className="rButton">
              Register
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerification}>
            <input
              type="text"
              placeholder="Verification Code"
              onChange={handleTokenChange}
              className="rInput"
              value={verificationToken}
            />
            <button disabled={loading} type="submit" className="rButton">
              Verify
            </button>
          </form>
        )}
        {validationError && <span className="error">{validationError}</span>}
        {error && <span className="error">{error.message}</span>}
        <div className="loginOption">
          <span>Already have an account? </span>
          <button className="loginButton" onClick={handleLoginNavigation}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
