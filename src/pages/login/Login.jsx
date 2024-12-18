import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [validationError, setValidationError] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [networkError, setNetworkError] = useState(null);

  const { loading, error, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const validateInputs = () => {
    const { username, password } = credentials;

    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

    if (!usernameRegex.test(username)) {
      return "Username must be 3-15 characters long and can only contain letters, numbers, and underscores.";
    }

    if (!passwordRegex.test(password)) {
      return "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.";
    }

    return null;
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);
    setNetworkError(null);

    const validationError = validateInputs();
    if (validationError) {
      setValidationError(validationError);
      return;
    }

    dispatch({ type: "LOGIN_START" });
    try {
      const res = await axios.post(
        "http://localhost:8800/api/auth/login",
        credentials
      );

      // Proceed with login regardless of email verification status
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
      navigate("/");
    } catch (err) {
      if (err.response) {
        // Server responded with a status other than 200 range
        if (err.response.status === 401) {
          setServerError(
            "Invalid credentials. Please check your username and password."
          );
        } else if (err.response.status === 404) {
          setServerError("User not found. Please check your username.");
        } else {
          setServerError(
            err.response.data.message || "An error occurred on the server."
          );
        }
        dispatch({ type: "LOGIN_FAILURE", payload: err.response.data });
      } else if (err.request) {
        // Request was made but no response was received
        setNetworkError(
          "Network error. Please check your connection and try again."
        );
      } else {
        // Something else happened while setting up the request
        setServerError("An unknown error occurred.");
      }
    }
  };

  const handleRegisterNavigation = () => {
    navigate("/register");
  };

  return (
    <div className="login">
      <div className="lContainer">
        <form onSubmit={handleClick}>
          <input
            type="text"
            placeholder="username"
            id="username"
            onChange={handleChange}
            className="lInput"
            value={credentials.username}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="password"
            id="password"
            onChange={handleChange}
            className="lInput"
            value={credentials.password}
            autoComplete="current-password"
          />
          <button disabled={loading} type="submit" className="lButton">
            Login
          </button>
        </form>
        {validationError && <span className="error">{validationError}</span>}
        {serverError && <span className="error">{serverError}</span>}
        {networkError && <span className="error">{networkError}</span>}
        {error && <span className="error">{error.message}</span>}
        <div className="registerOption">
          <span>Don't have an account? </span>
          <button className="registerButton" onClick={handleRegisterNavigation}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
