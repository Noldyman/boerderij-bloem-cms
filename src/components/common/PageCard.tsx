import { ReactNode } from "react";
import { Card, Typography, Divider } from "@mui/material";
import styles from "./styles.module.scss";

interface Props {
  title: string;
  children: ReactNode;
}

export const PageCard = ({ title, children }: Props) => {
  return (
    <Card className={styles.pageCard}>
      <Typography variant="h4">{title}</Typography>
      <Divider />
      {children}
    </Card>
  );
};
