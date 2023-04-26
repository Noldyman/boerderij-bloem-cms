import React from "react";
import ReactDOM from "react-dom/client";
import { RecoilRoot } from "recoil";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./utils/ProtectedRoute";
import App from "./app/App";
import { Login } from "./pages/Login";
import { ResetPassword } from "./pages/ResetPassword";
import { Home } from "./pages/home/Home";
import { IrishTerriers } from "./pages/irishTerriers/IrishTerriers";
import { Contact } from "./pages/Contact";
import { Account } from "./pages/Account";
import { NotFound } from "./pages/NotFound";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  // <React.StrictMode>
  <RecoilRoot>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route element={<ProtectedRoute userForbidden />}>
            <Route path="login" element={<Login />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>
          <Route element={<ProtectedRoute userRequired />}>
            <Route index element={<Home />} />
            <Route path="/ierse-terriers" element={<IrishTerriers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/account" element={<Account />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </RecoilRoot>
  // </React.StrictMode>
);

reportWebVitals();
