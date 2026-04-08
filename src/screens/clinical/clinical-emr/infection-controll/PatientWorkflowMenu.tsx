import * as React from "react";
import { Menu, MenuItem, Typography } from "@/src/ui/components/atoms";
import { useRouter } from "next/navigation";
import {
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  BugReport as BugReportIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Person as PersonIcon,
  Science as ScienceIcon,
} from "@mui/icons-material";

interface PatientWorkflowMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  mrn: string | null;
  onClose: () => void;
  router: ReturnType<typeof useRouter>;
  canNavigate: (route: string) => boolean;
}

const PATIENT_WORKFLOW_MENU_ITEMS = [
  {
    icon: <PersonIcon sx={{ fontSize: 18 }} />,
    label: "Patient Profile",
    path: "/patients/profile",
  },
  {
    icon: <ScienceIcon sx={{ fontSize: 18 }} />,
    label: "Lab Results",
    path: "/lab/analysis-results",
  },
  {
    icon: <HealthAndSafetyIcon sx={{ fontSize: 18 }} />,
    label: "IPD Bed Board",
    path: "/ipd/beds",
  },
  {
    icon: <AssignmentTurnedInIcon sx={{ fontSize: 18 }} />,
    label: "IPD Rounds",
    path: "/ipd/rounds",
  },
  {
    icon: <BugReportIcon sx={{ fontSize: 18 }} />,
    label: "Microbiology",
    path: "/ipd/orders-tests/lab",
  },
];

export default function PatientWorkflowMenu({
  anchorEl,
  open,
  mrn,
  onClose,
  router,
  canNavigate,
}: PatientWorkflowMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
    >
      <Typography
        sx={{
          px: 2,
          mb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          letterSpacing: "0.05em",
          fontSize: "0.65rem",
        }}
      >
        Patient Workflows
      </Typography>
      {PATIENT_WORKFLOW_MENU_ITEMS.map((item) => (
        <MenuItem
          key={item.label}
          onClick={() => {
            if (mrn) {
              router.push(`${item.path}?mrn=${mrn}`);
            }
            onClose();
          }}
          disabled={!canNavigate(item.path) || !mrn}
        >
          {item.icon}
          <Typography>{item.label}</Typography>
        </MenuItem>
      ))}
    </Menu>
  );
}
