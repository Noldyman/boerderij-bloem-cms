import { Button, Card, TextField, Typography } from "@mui/material";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth";
import { ChangeEvent, useState } from "react";
import { useSetRecoilState } from "recoil";
import { auth } from "../app/firebase";
import { Page } from "../components/common/Page";
import { notificationState } from "../services/notifications";
import { validateNewPassword } from "../validation/validateNewPassword";

const initialInput = { oldPassword: "", newPassword: "", confirmPassword: "" };

export const Account = () => {
  const setNotification = useSetRecoilState(notificationState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [input, setInput] = useState(initialInput);
  const [changePwdLoading, setChangePwdLoading] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput((prevValue) => ({ ...prevValue, [e.target.name]: e.target.value }));
  };

  const handleChangePassword = async () => {
    setErrors({});
    let errors: { [key: string]: string } = {};
    const yupError = await validateNewPassword({
      oldPassword: input.oldPassword,
      password: input.newPassword,
    });
    if (yupError) errors = { ...yupError };
    if (input["confirmPassword"] !== input["newPassword"]) {
      errors["confirmPassword"] = "Wachtwoorden komen niet overeen";
    }
    if (Object.keys(errors).length) return setErrors(errors);

    const user = auth.currentUser;
    if (user) {
      try {
        setChangePwdLoading(true);
        await reauthenticateWithCredential(
          user,
          EmailAuthProvider.credential(user.email!, input.oldPassword)
        );
        await updatePassword(user, input.newPassword);
        setNotification({
          message: "Het wachtwoord is aangepast",
          severity: "success",
        });
      } catch (err) {
        console.log(err);
        setNotification({
          message: "Er is iet misgegaan. Heb je het juiste wachtwoord ingevuld?",
          severity: "error",
        });
      }
      setChangePwdLoading(false);
      setInput((prevValue) => ({
        ...prevValue,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }
  };

  return (
    <Page title="Account">
      <Card className="card" variant="outlined">
        <div className="card-content">
          <Typography variant="h5">Uitloggen</Typography>
          <div className="small-card-content">
            <Button fullWidth onClick={handleLogout} variant="contained">
              Uitloggen
            </Button>
          </div>
        </div>
      </Card>
      <Card className="card" variant="outlined">
        <div className="card-content">
          <Typography variant="h5">Wachtwoord veranderen</Typography>
          <div className="small-card-content">
            <TextField
              fullWidth
              name="oldPassword"
              label="Oud wachtwoord"
              size="small"
              type="password"
              value={input.oldPassword}
              onChange={handleInputChange}
              error={Boolean(errors["oldPassword"])}
              helperText={errors["oldPassword"]}
            />
            <TextField
              fullWidth
              name="newPassword"
              label="Nieuw wachtwoord"
              size="small"
              type="password"
              value={input.newPassword}
              onChange={handleInputChange}
              error={Boolean(errors["password"])}
              helperText={errors["password"]}
            />
            <TextField
              fullWidth
              name="confirmPassword"
              label="Herhaling nieuw wachtwoord"
              size="small"
              type="password"
              value={input.confirmPassword}
              onChange={handleInputChange}
              error={Boolean(errors["confirmPassword"])}
              helperText={errors["confirmPassword"]}
            />
            <div className="card-actions">
              <Button
                onClick={handleChangePassword}
                disabled={changePwdLoading}
                variant="contained"
              >
                Aanpassen
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Page>
  );
};
