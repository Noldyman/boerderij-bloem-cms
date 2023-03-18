import { ReactNode } from "react";
import { Card, Typography } from "@mui/material";
import styles from "./common.module.scss";

interface Props {
  title: string;
  children: ReactNode;
}

export const Page = ({ title, children }: Props) => {
  return (
    <div className={styles.page}>
      <Card className={styles.pageTitleCard} variant="outlined">
        <Typography padding={0} variant="h4">
          {title}
        </Typography>
      </Card>

      {children}
    </div>
  );
};
