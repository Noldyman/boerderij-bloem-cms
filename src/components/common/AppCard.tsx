import { Card, Typography } from "@mui/material";
import { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export const AppCard = ({ title, children }: Props) => {
  return (
    <Card className="card" variant="outlined">
      <div className="card-content">
        <Typography variant="h6">{title}</Typography>
        {children}
      </div>
    </Card>
  );
};
