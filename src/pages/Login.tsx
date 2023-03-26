import { useState, ChangeEvent } from "react";
import { Button, Card, TextField, Typography } from "@mui/material";
import { auth } from "../app/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

const initialInput = {
  email: "",
  password: "",
};

export const Login = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState(initialInput);
  const [loginFailed, setLoginFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput((prevValue) => ({ ...prevValue, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      setLoginFailed(false);
      await signInWithEmailAndPassword(auth, input.email, input.password);
      setLoading(false);
      navigate("/");
    } catch (err) {
      setLoginFailed(true);
    }
    setLoading(false);
  };

  return (
    <Card className="login-card">
      <Typography variant="h5" align="center">
        Inloggen
      </Typography>
      <TextField
        size="small"
        label="Email adres"
        placeholder="Email adres"
        name="email"
        value={input.email}
        onChange={handleChange}
        error={loginFailed}
      />
      <TextField
        type="password"
        size="small"
        label="Wachtwoord"
        placeholder="Wachtwoord"
        name="password"
        value={input.password}
        onChange={handleChange}
        error={loginFailed}
      />
      <Button disabled={loading} onClick={handleSubmit} variant="contained">
        Inloggen
      </Button>
      {loginFailed && (
        <Typography color="error" align="center">
          Email adres of wachtwoord onjuist.
        </Typography>
      )}
      <Link to="/reset-password">
        <Typography align="center" color="primary">
          Wachtwoord vergeten
        </Typography>
      </Link>
    </Card>
  );
};
