import { Card, Typography } from "@mui/material";
import { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  hasLoader?: boolean;
}

export const AppCard = ({ title, children, hasLoader }: Props) => {
  return (
    <Card className={`card ${hasLoader && "card-with-loader"}`} variant="outlined">
      <div className="card-content">
        <Typography variant="h6">{title}</Typography>
        {children}
      </div>
    </Card>
  );
};
