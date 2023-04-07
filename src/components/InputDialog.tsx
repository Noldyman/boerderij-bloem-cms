import { Dialog, LinearProgress, Typography } from "@mui/material";
import { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions: ReactNode;
  loading?: boolean;
}

export const InputDialog = ({ open, onClose, title, children, actions, loading }: Props) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <div className="input-dialog">
        <Typography variant="h5">{title}</Typography>
        {children}
        <div className="dialog-actions">{actions}</div>
        {loading ? <LinearProgress /> : <div className="loader-placeholder" />}
      </div>
    </Dialog>
  );
};
