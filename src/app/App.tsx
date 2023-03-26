import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "../services/user";
import { notificationState } from "../services/notifications";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { Layout } from "../components/layout/Layout";
import { Outlet } from "react-router-dom";
import { Alert, Snackbar } from "@mui/material";
import "../styles/general.scss";

function App() {
  const setUser = useSetRecoilState(userState);
  const notification = useRecoilValue(notificationState);
  const [notificationIsOpen, setNotificationIsOpen] = useState(false);

  onAuthStateChanged(auth, (newUser) => {
    if (newUser) {
      const userCopy = JSON.parse(JSON.stringify(newUser)); //Due to bug in recoil
      setUser(userCopy);
    } else {
      setUser(null);
    }
  });

  useEffect(() => {
    if (notification.message) {
      setNotificationIsOpen(true);
    }
  }, [notification]);

  return (
    <Layout>
      <Outlet />
      <Snackbar
        open={notificationIsOpen}
        autoHideDuration={5000}
        onClose={() => setNotificationIsOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
          onClose={() => setNotificationIsOpen(false)}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}

export default App;
