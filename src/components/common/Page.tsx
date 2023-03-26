import { ReactNode } from "react";
import { Card, Typography } from "@mui/material";

interface Props {
  title: string;
  children: ReactNode;
}

export const Page = ({ title, children }: Props) => {
  return (
    <div className="page">
      <Card className="page-title-card" variant="outlined">
        <Typography padding={0} variant="h4">
          {title}
        </Typography>
      </Card>

      {children}
    </div>
  );
};
