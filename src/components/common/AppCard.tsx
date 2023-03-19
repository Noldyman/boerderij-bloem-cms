import { Card, Typography } from "@mui/material";
import { ReactNode } from "react";
import styles from "../../styles/general.module.scss";

interface Props {
  title: string;
  children: ReactNode;
}

export const AppCard = ({ title, children }: Props) => {
  return (
    <Card className={styles.card} variant="outlined">
      <div className={styles.cardContent}>
        <Typography variant="h6">{title}</Typography>
        {children}
      </div>
    </Card>
  );
};
