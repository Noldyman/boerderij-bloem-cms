import { ReactNode } from "react";
import { CssBaseline } from "@mui/material";
import { Footer } from "./Footer";
import { NavBar } from "./NavBar";
import styles from "./styles.module.scss";

interface Props {
  children: ReactNode;
}

export const Layout = ({ children }: Props) => {
  return (
    <>
      <CssBaseline />
      <NavBar />
      <main className={styles.content}>{children}</main>
      <Footer />
    </>
  );
};
