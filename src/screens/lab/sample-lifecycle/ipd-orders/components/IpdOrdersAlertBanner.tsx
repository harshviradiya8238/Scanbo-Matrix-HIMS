import * as React from "react";
import { Alert } from "@/src/ui/components/atoms";
import { LocalHospital as HospitalIcon } from "@mui/icons-material";

export interface IpdOrdersAlertBannerProps {
  statCount: number;
}

export default function IpdOrdersAlertBanner({
  statCount,
}: IpdOrdersAlertBannerProps) {
  if (statCount <= 0) return null;

  return (
    <Alert
      severity="error"
      icon={<HospitalIcon />}
      sx={{
        fontWeight: 600,
        border: "1px solid",
        borderColor: "error.light",
        borderRadius: 2,
      }}
    >
      {statCount} STAT order{statCount > 1 ? "s" : ""} pending immediate
      processing. Review and assign analysts now.
    </Alert>
  );
}
