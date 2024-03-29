import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../services/notifications";
import { auth } from "../app/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { validateEmail } from "../validation/validateEmail";
import { Typography, TextField, Button, Card } from "@mui/material";
import { Page } from "../components/common/Page";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setNotification = useSetRecoilState(notificationState);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async () => {
    setError("");
    const error = await validateEmail({ email: input });
    if (error) return setError(error["email"]);
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, input);
      setLoading(false);
      setNotification({ message: "Er is een email verstuurd", severity: "success" });
    } catch (err) {
      console.log(err);
      setLoading(false);
      setNotification({
        message: "Er is iets misgegaan. Is het email adres juist?",
        severity: "error",
      });
    }
  };

  return (
    <Page title="Wachtwoord herstellen">
      <Card className="card" variant="outlined">
        <div className="card-content">
          <Typography variant="h5">Email vereist</Typography>
          <Typography>
            Voer je email adres in. Als dit email adres bekend is, wordt er een email verstuurd
            waarmee je het wachtwoord kunt herstellen. Wees erop bedacht dat deze email de spam map
            terecht kan komen.
          </Typography>
          <div className="small-card-content">
            <TextField
              fullWidth
              size="small"
              name="email"
              label="Email address"
              value={input}
              onChange={handleChange}
              error={Boolean(error)}
              helperText={error}
            />
            <div className="card-actions">
              <Button onClick={() => navigate("/login")} variant="outlined">
                Terug
              </Button>
              <Button disabled={loading} onClick={handleSubmit} variant="contained">
                Email versturen
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Page>
  );
};
