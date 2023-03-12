import { ReactNode } from "react";
import { Card, Typography, Divider } from "@mui/material";
import styles from "./common.module.scss";

interface Props {
  title: string;
  children: ReactNode;
}

export const PageCard = ({ title, children }: Props) => {
  return (
    <Card elevation={4} className={styles.pageCard}>
      <Typography variant="h4">{title}</Typography>
      <Divider />
      {children}
    </Card>
  );
};
