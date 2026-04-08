import * as React from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/src/ui/components/atoms";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";
import { EnterpriseStatusChip } from "@/src/screens/clinical/components/EnterpriseUi";
import { MonitorHeart as MonitorHeartIcon } from "@mui/icons-material";
import { WorklistCase } from "../../types";
import { statusTone } from "../../utils";

interface OrBoardDialogProps {
  open: boolean;
  onClose: () => void;
  allCases: WorklistCase[];
  onOpenCase: (caseId: string) => void;
}

export const OrBoardDialog = ({
  open,
  onClose,
  allCases,
  onOpenCase,
}: OrBoardDialogProps) => {
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      title="OR Board"
      icon={<MonitorHeartIcon sx={{ fontSize: 18 }} />}
      contentDividers
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Room</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Patient</TableCell>
            <TableCell>Procedure</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Open</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allCases.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>{item.room}</TableCell>
              <TableCell>{item.scheduledAt}</TableCell>
              <TableCell>{item.patientName}</TableCell>
              <TableCell>{item.procedure}</TableCell>
              <TableCell>
                <EnterpriseStatusChip
                  label={item.status}
                  tone={statusTone(item.status)}
                />
              </TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    onOpenCase(item.id);
                    onClose();
                  }}
                >
                  Open
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CommonDialog>
  );
};
