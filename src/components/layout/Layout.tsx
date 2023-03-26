import { ReactNode } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "../../styles/theme";
import { Footer } from "./Footer";
import { NavBar } from "./NavBar";

interface Props {
  children: ReactNode;
}

export const Layout = ({ children }: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NavBar />
      <main className="content">{children}</main>
      <Footer />
    </ThemeProvider>
  );
};
