import { useSetRecoilState } from "recoil";
import { userState } from "../services/user";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { Layout } from "../components/layout/Layout";
import { Outlet } from "react-router-dom";

function App() {
  const setUser = useSetRecoilState(userState);

  onAuthStateChanged(auth, (newUser) => {
    if (newUser) {
      const userCopy = JSON.parse(JSON.stringify(newUser)); //Due to bug in recoil
      setUser(userCopy);
    } else {
      setUser(null);
    }
  });

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default App;
