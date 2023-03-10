import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userState } from "../services/user";

interface IProps {
  userRequired?: boolean;
  userForbidden?: boolean;
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<IProps> = ({ userRequired, userForbidden, children }): any => {
  const user = useRecoilValue(userState);

  if (!user && userRequired) {
    return <Navigate to="/login" replace />;
  }
  if (user && userForbidden) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export { ProtectedRoute };
