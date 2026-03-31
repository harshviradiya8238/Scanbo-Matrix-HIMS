// "use client";

// import * as React from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import PageTemplate from "@/src/ui/components/PageTemplate";
// import {
//   Alert,
//   Box,
//   Button,
//   Chip,
//   FormControl,
//   InputLabel,
//   LinearProgress,
//   MenuItem,
//   Select,
//   Snackbar,
//   Stack,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   Tabs,
//   Tab,
//   Typography,
// } from "@/src/ui/components/atoms";
// import { useTheme, alpha } from "@mui/material";
// import { useLabTheme } from "../lab-theme";
// import {
//   Add as AddIcon,
//   ArrowBack as ArrowBackIcon,
// } from "@mui/icons-material";
// import CommonDataGrid, {
//   type CommonColumn,
// } from "@/src/components/table/CommonDataGrid";
// import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
// import {
//   addSample,
//   addResults,
//   assignAnalyst,
//   updateSampleStatus,
//   verifyAllPendingForSample,
//   publishSample as publishSampleAction,
//   appendAudit,
//   refFromLowHigh,
// } from "@/src/store/slices/limsSlice";
// import type {
//   LabSample,
//   LabResultRow,
//   LabAuditLogEntry,
//   LabTestCatalogItem,
// } from "../lab-types";
// import { useLabStatusConfig, getFlagColor } from "../lab-status-config";
// import { WORKFLOW_STEPS, ANALYSTS } from "../lab-types";
// import AddSampleModal from "../modals/AddSampleModal";
// import EnterResultsModal from "../modals/EnterResultsModal";
// import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
// // import LabWorkspaceCard from "../components/LabWorkspaceCard";

// const SAMPLE_STATUSES: LabSample["status"][] = [
//   "registered",
//   "received",
//   "assigned",
//   "analysed",
//   "verified",
//   "published",
// ];

// function SampleDetailView({
//   sample,
//   clientName,
//   results,
//   auditLog,
//   tests,
//   onBack,
//   onAssignAnalyst,
//   onMarkReceived,
//   onEnterResults,
//   onVerify,
//   onPublish,
//   detailResultColumns,
// }: {
//   sample: LabSample;
//   clientName: string;
//   results: LabResultRow[];
//   auditLog: LabAuditLogEntry[];
//   tests: LabTestCatalogItem[];
//   onBack: () => void;
//   onAssignAnalyst: (analyst: string) => void;
//   onMarkReceived: () => void;
//   onEnterResults: (testCode: string) => void;
//   onVerify: () => void;
//   onPublish: () => void;
//   detailResultColumns: CommonColumn<LabResultRow>[];
// }) {
//   const theme = useTheme();
//   const lab = useLabTheme(theme);
//   const { sampleStatus } = useLabStatusConfig();
//   const [tab, setTab] = React.useState(0);
//   const [analystSelect, setAnalystSelect] = React.useState(
//     sample.analyst || "",
//   );
//   const sampleResults = results.filter((r) => r.sampleId === sample.id);
//   const sampleAudit = auditLog.filter((e) => e.sampleId === sample.id);
//   const cfg = sampleStatus[sample.status];
//   const stepIndex = WORKFLOW_STEPS.indexOf(sample.status);

//   return (
//     <Box>
//       <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
//         <Button
//           startIcon={<ArrowBackIcon />}
//           onClick={onBack}
//           size="small"
//           variant="outlined"
//         >
//           Back
//         </Button>
//         <Box sx={{ flex: 1 }}>
//           <Typography variant="h6" sx={{ fontWeight: 700 }}>
//             {sample.id}
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             {sample.patient} · {sample.type} · {clientName}
//           </Typography>
//         </Box>
//         <Chip label={cfg.label} sx={lab.chipSx(cfg.color)} />
//       </Stack>

//       <Box sx={{ mb: 2 }}>
//         <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
//           {WORKFLOW_STEPS.map((s, i) => (
//             <React.Fragment key={s}>
//               <Chip
//                 size="small"
//                 label={sampleStatus[s].label}
//                 sx={{
//                   bgcolor: i <= stepIndex ? lab.softSurface : "action.hover",
//                   color:
//                     i <= stepIndex ? sampleStatus[s].color : "text.secondary",
//                 }}
//               />
//               {i < WORKFLOW_STEPS.length - 1 && (
//                 <Typography variant="caption" color="text.secondary">
//                   →
//                 </Typography>
//               )}
//             </React.Fragment>
//           ))}
//         </Stack>
//         <LinearProgress
//           variant="determinate"
//           value={((stepIndex + 1) / WORKFLOW_STEPS.length) * 100}
//           sx={{ height: 4, borderRadius: 2 }}
//         />
//       </Box>

//       <Tabs
//         value={tab}
//         onChange={(_, v) => setTab(v)}
//         sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
//       >
//         <Tab label="Info" />
//         <Tab label="Analyses" />
//         <Tab label="Results" />
//         <Tab label="Log" />
//       </Tabs>

//       {tab === 0 && (
//         <Box
//           sx={{
//             display: "grid",
//             gap: 2,
//             gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
//           }}
//         >
//           <Box sx={{ ...lab.cardSx, p: 2 }}>
//             <Typography
//               variant="overline"
//               sx={{
//                 color: "primary.main",
//                 letterSpacing: 1.5,
//                 mb: 1.5,
//                 display: "block",
//               }}
//             >
//               Sample Details
//             </Typography>
//             {[
//               ["Sample ID", sample.id],
//               ["Sample Type", sample.type],
//               ["Collection Date", sample.date],
//               ["Priority", sample.priority],
//               ["Client", clientName],
//               ["Status", sample.status],
//             ].map(([k, v]) => (
//               <Stack
//                 key={String(k)}
//                 direction="row"
//                 justifyContent="space-between"
//                 sx={{
//                   py: 0.75,
//                   borderBottom: "1px solid",
//                   borderColor: "divider",
//                 }}
//               >
//                 <Typography variant="caption" color="text.secondary">
//                   {k}
//                 </Typography>
//                 <Typography variant="body2" fontWeight={600}>
//                   {String(v)}
//                 </Typography>
//               </Stack>
//             ))}
//           </Box>
//           <Box sx={{ ...lab.cardSx, p: 2 }}>
//             <Typography
//               variant="overline"
//               sx={{
//                 color: "primary.main",
//                 letterSpacing: 1.5,
//                 mb: 1.5,
//                 display: "block",
//               }}
//             >
//               Patient / Client
//             </Typography>
//             {[
//               ["Patient Name", sample.patient],
//               ["Client", clientName],
//               ["Requested Tests", sample.tests.join(", ")],
//             ].map(([k, v]) => (
//               <Stack
//                 key={String(k)}
//                 direction="row"
//                 justifyContent="space-between"
//                 sx={{
//                   py: 0.75,
//                   borderBottom: "1px solid",
//                   borderColor: "divider",
//                 }}
//               >
//                 <Typography variant="caption" color="text.secondary">
//                   {k}
//                 </Typography>
//                 <Typography variant="body2" fontWeight={600}>
//                   {String(v)}
//                 </Typography>
//               </Stack>
//             ))}
//             <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
//               <FormControl size="small" sx={{ minWidth: 160 }}>
//                 <InputLabel>Analyst</InputLabel>
//                 <Select
//                   value={analystSelect}
//                   label="Analyst"
//                   onChange={(e) => setAnalystSelect(e.target.value as string)}
//                 >
//                   {ANALYSTS.map((a) => (
//                     <MenuItem key={a} value={a}>
//                       {a}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//               <Button
//                 variant="contained"
//                 size="small"
//                 onClick={() => analystSelect && onAssignAnalyst(analystSelect)}
//                 disabled={!analystSelect}
//               >
//                 Assign
//               </Button>
//               <Button
//                 variant="outlined"
//                 color="info"
//                 size="small"
//                 onClick={onMarkReceived}
//                 disabled={sample.status !== "registered"}
//               >
//                 Mark Received
//               </Button>
//               <Button
//                 variant="outlined"
//                 color="success"
//                 size="small"
//                 onClick={onVerify}
//                 disabled={
//                   sample.status === "published" ||
//                   sampleResults.length === 0 ||
//                   sampleResults.every((r) => r.status === "verified")
//                 }
//               >
//                 Verify
//               </Button>
//               <Button
//                 variant="outlined"
//                 color="info"
//                 size="small"
//                 onClick={onPublish}
//                 disabled={sample.status !== "verified"}
//               >
//                 Publish
//               </Button>
//             </Stack>
//           </Box>
//         </Box>
//       )}

//       {tab === 1 && (
//         <Box sx={{ ...lab.cardSx, p: 2 }}>
//           <Typography
//             variant="overline"
//             sx={{
//               color: "primary.main",
//               letterSpacing: 1.5,
//               mb: 1.5,
//               display: "block",
//             }}
//           >
//             Requested Analyses
//           </Typography>
//           {sample.tests.map((t) => {
//             const testDef = tests.find((x) => x.code === t);
//             const hasResults = sampleResults.some((r) => r.test === t);
//             return (
//               <Stack
//                 key={t}
//                 direction="row"
//                 justifyContent="space-between"
//                 alignItems="center"
//                 sx={{
//                   py: 1.25,
//                   borderBottom: "1px solid",
//                   borderColor: "divider",
//                 }}
//               >
//                 <Typography variant="body2">{testDef?.name ?? t}</Typography>
//                 <Stack direction="row" spacing={1}>
//                   <Chip
//                     size="small"
//                     label={hasResults ? "Analysed" : "Pending"}
//                     color={hasResults ? "success" : "default"}
//                   />
//                   <Button
//                     variant="outlined"
//                     size="small"
//                     onClick={() => onEnterResults(t)}
//                   >
//                     Enter Results
//                   </Button>
//                 </Stack>
//               </Stack>
//             );
//           })}
//         </Box>
//       )}

//       {tab === 2 && (
//         <Box sx={lab.cardSx}>
//           <CommonDataGrid<LabResultRow>
//             rows={sampleResults}
//             columns={detailResultColumns}
//             getRowId={(row) => row.id}
//             emptyTitle="No results entered yet for this sample."
//           />
//         </Box>
//       )}

//       {tab === 3 && (
//         <Box sx={{ ...lab.cardSx, p: 2 }}>
//           <Typography
//             variant="overline"
//             sx={{
//               color: "primary.main",
//               letterSpacing: 1.5,
//               mb: 1.5,
//               display: "block",
//             }}
//           >
//             Audit Log
//           </Typography>
//           {sampleAudit.length === 0 ? (
//             <Typography color="text.secondary">
//               No audit entries for this sample.
//             </Typography>
//           ) : (
//             sampleAudit.map((log, i) => (
//               <Stack
//                 key={i}
//                 direction="row"
//                 alignItems="center"
//                 spacing={2}
//                 sx={{
//                   py: 1,
//                   borderBottom: "1px solid",
//                   borderColor: "divider",
//                 }}
//               >
//                 <Typography
//                   variant="body2"
//                   sx={{ color: "primary.main", minWidth: 140 }}
//                 >
//                   {log.ts}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {log.event}
//                 </Typography>
//                 <Typography
//                   variant="caption"
//                   color="text.secondary"
//                   sx={{ ml: "auto" }}
//                 >
//                   {log.user}
//                 </Typography>
//               </Stack>
//             ))
//           )}
//         </Box>
//       )}
//     </Box>
//   );
// }

// export default function LabSamplesPage() {
//   const theme = useTheme();
//   const lab = useLabTheme(theme);
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const dispatch = useAppDispatch();
//   const { sampleStatus } = useLabStatusConfig();
//   const { samples, clients, tests, results, auditLog } = useAppSelector(
//     (state) => state.lims,
//   );

//   const [search, setSearch] = React.useState("");
//   const [statusFilter, setStatusFilter] = React.useState<string>("all");
//   const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
//   const [typeFilter, setTypeFilter] = React.useState<string>("all");
//   const [selected, setSelected] = React.useState<LabSample | null>(null);
//   const [addSampleOpen, setAddSampleOpen] = React.useState(false);
//   const [enterResultsTestCode, setEnterResultsTestCode] = React.useState<
//     string | null
//   >(null);
//   const [snackbar, setSnackbar] = React.useState<{
//     open: boolean;
//     message: string;
//     severity: "success" | "error" | "info";
//   }>({ open: false, message: "", severity: "success" });

//   // Get unique sample types and priorities
//   const sampleTypes = React.useMemo(
//     () => Array.from(new Set(samples.map((s) => s.type))).sort(),
//     [samples],
//   );
//   const priorities = React.useMemo(
//     () => Array.from(new Set(samples.map((s) => s.priority))).sort(),
//     [samples],
//   );

//   const selectedId = searchParams.get("id");
//   const selectedSample =
//     selected || (selectedId ? samples.find((s) => s.id === selectedId) : null);
//   const clientNameFor = (clientId: string) =>
//     clients.find((c) => c.id === clientId)?.name ?? clientId;
//   const timestamp = () =>
//     new Date().toISOString().slice(0, 19).replace("T", " ");

//   React.useEffect(() => {
//     if (selectedId && !selected) {
//       const s = samples.find((s) => s.id === selectedId);
//       if (s) setSelected(s);
//     }
//   }, [selectedId, samples, selected]);

//   const filtered = React.useMemo(() => {
//     return samples.filter((s) => {
//       const name = clientNameFor(s.client);
//       const matchSearch =
//         s.id.toLowerCase().includes(search.toLowerCase()) ||
//         s.patient.toLowerCase().includes(search.toLowerCase()) ||
//         name.toLowerCase().includes(search.toLowerCase());
//       const matchStatus = statusFilter === "all" || s.status === statusFilter;
//       const matchPriority =
//         priorityFilter === "all" || s.priority === priorityFilter;
//       const matchType = typeFilter === "all" || s.type === typeFilter;
//       return matchSearch && matchStatus && matchPriority && matchType;
//     });
//   }, [samples, search, statusFilter, priorityFilter, typeFilter, clients]);

//   const handleAddSample = (
//     form: Omit<LabSample, "id" | "status" | "analyst" | "worksheetId">,
//   ) => {
//     dispatch(addSample(form));
//     dispatch(
//       appendAudit({
//         ts: timestamp(),
//         event: "New sample received",
//         user: "Lab Tech",
//       }),
//     );
//     setSnackbar({
//       open: true,
//       message: "Sample added and received.",
//       severity: "success",
//     });
//   };

//   const handleAssignAnalyst = (analyst: string) => {
//     if (!selectedSample) return;
//     dispatch(assignAnalyst({ sampleId: selectedSample.id, analyst }));
//     dispatch(
//       appendAudit({
//         ts: timestamp(),
//         event: `Sample ${selectedSample.id} assigned to ${analyst}`,
//         user: analyst,
//         sampleId: selectedSample.id,
//       }),
//     );
//     setSnackbar({
//       open: true,
//       message: "Analyst assigned.",
//       severity: "success",
//     });
//   };

//   const handleMarkReceived = () => {
//     if (!selectedSample) return;
//     dispatch(
//       updateSampleStatus({ sampleId: selectedSample.id, status: "received" }),
//     );
//     dispatch(
//       appendAudit({
//         ts: timestamp(),
//         event: `Sample ${selectedSample.id} marked received`,
//         user: "Lab Tech",
//         sampleId: selectedSample.id,
//       }),
//     );
//     setSnackbar({
//       open: true,
//       message: "Sample marked received.",
//       severity: "success",
//     });
//   };

//   const handleEnterResults = (testCode: string) =>
//     setEnterResultsTestCode(testCode);

//   const handleResultsSubmit = (rows: LabResultRow[]) => {
//     if (!selectedSample) return;
//     dispatch(addResults(rows));
//     dispatch(
//       appendAudit({
//         ts: timestamp(),
//         event: `Results entered for ${enterResultsTestCode}`,
//         user: selectedSample.analyst || "User",
//         sampleId: selectedSample.id,
//       }),
//     );
//     setEnterResultsTestCode(null);
//     setSnackbar({ open: true, message: "Results saved.", severity: "success" });
//   };

//   const handleVerify = () => {
//     if (!selectedSample) return;
//     const sampleResults = results.filter(
//       (r) => r.sampleId === selectedSample.id,
//     );
//     if (sampleResults.length === 0) {
//       setSnackbar({
//         open: true,
//         message: "No results found for this sample.",
//         severity: "error",
//       });
//       return;
//     }
//     dispatch(
//       verifyAllPendingForSample({
//         sampleId: selectedSample.id,
//         verifiedBy: "Supervisor",
//       }),
//     );
//     dispatch(
//       appendAudit({
//         ts: timestamp(),
//         event: `Sample ${selectedSample.id} verified`,
//         user: "Supervisor",
//         sampleId: selectedSample.id,
//       }),
//     );
//     setSnackbar({
//       open: true,
//       message: "Sample verified.",
//       severity: "success",
//     });
//   };

//   const handlePublish = () => {
//     if (!selectedSample) return;
//     if (selectedSample.status !== "verified") {
//       setSnackbar({
//         open: true,
//         message: "Only verified samples can be published.",
//         severity: "error",
//       });
//       return;
//     }
//     dispatch(publishSampleAction({ sampleId: selectedSample.id }));
//     dispatch(
//       appendAudit({
//         ts: timestamp(),
//         event: `Sample ${selectedSample.id} published`,
//         user: "Lab Manager",
//         sampleId: selectedSample.id,
//       }),
//     );
//     setSnackbar({
//       open: true,
//       message: "Sample published.",
//       severity: "success",
//     });
//   };

//   const handleReceiveQueue = () => {
//     const registered = samples.filter((s) => s.status === "registered");
//     if (registered.length === 0) {
//       setSnackbar({
//         open: true,
//         message: "No registered samples pending receipt.",
//         severity: "info",
//       });
//       return;
//     }
//     registered.forEach((sample) => {
//       dispatch(updateSampleStatus({ sampleId: sample.id, status: "received" }));
//       dispatch(
//         appendAudit({
//           ts: timestamp(),
//           event: `Sample ${sample.id} marked received`,
//           user: "Lab Tech",
//           sampleId: sample.id,
//         }),
//       );
//     });
//     setSnackbar({
//       open: true,
//       message: `${registered.length} sample(s) moved to received.`,
//       severity: "success",
//     });
//   };

//   const handleQuickReceive = (sample: LabSample) => {
//     dispatch(updateSampleStatus({ sampleId: sample.id, status: "received" }));
//     dispatch(
//       appendAudit({
//         ts: timestamp(),
//         event: `Sample ${sample.id} marked received`,
//         user: "Lab Tech",
//         sampleId: sample.id,
//       }),
//     );
//     setSnackbar({
//       open: true,
//       message: `Sample ${sample.id} received.`,
//       severity: "success",
//     });
//   };

//   const handleQuickVerify = (sample: LabSample) => {
//     const sampleRows = results.filter((r) => r.sampleId === sample.id);
//     if (sampleRows.length === 0) {
//       setSnackbar({
//         open: true,
//         message: `No results to verify for ${sample.id}.`,
//         severity: "error",
//       });
//       return;
//     }
//     dispatch(
//       verifyAllPendingForSample({
//         sampleId: sample.id,
//         verifiedBy: "Supervisor",
//       }),
//     );
//     dispatch(
//       appendAudit({
//         ts: timestamp(),
//         event: `Sample ${sample.id} verified`,
//         user: "Supervisor",
//         sampleId: sample.id,
//       }),
//     );
//     setSnackbar({
//       open: true,
//       message: `Sample ${sample.id} verified.`,
//       severity: "success",
//     });
//   };

//   const handleQuickPublish = (sample: LabSample) => {
//     if (sample.status !== "verified") {
//       setSnackbar({
//         open: true,
//         message: `Sample ${sample.id} is not verified yet.`,
//         severity: "error",
//       });
//       return;
//     }
//     dispatch(publishSampleAction({ sampleId: sample.id }));
//     dispatch(
//       appendAudit({
//         ts: timestamp(),
//         event: `Sample ${sample.id} published`,
//         user: "Lab Manager",
//         sampleId: sample.id,
//       }),
//     );
//     setSnackbar({
//       open: true,
//       message: `Sample ${sample.id} published.`,
//       severity: "success",
//     });
//   };

//   const enterResultsTest = enterResultsTestCode
//     ? tests.find((t) => t.code === enterResultsTestCode)
//     : null;

//   const sampleColumns = React.useMemo<CommonColumn<LabSample>[]>(
//     () => [
//       {
//         headerName: "Sample ID",
//         field: "id",
//         width: 120,
//         renderCell: (row) => (
//           <Typography
//             variant="body2"
//             sx={{ fontWeight: 700, color: "primary.main", cursor: "pointer" }}
//           >
//             {row.id}
//           </Typography>
//         ),
//       },
//       {
//         headerName: "Patient / Client",
//         field: "patient",
//         width: 200,
//         renderCell: (row) => (
//           <Box>
//             <Typography variant="body2" sx={{ fontWeight: 600 }}>
//               {row.patient}
//             </Typography>
//             <Typography variant="caption" color="text.secondary">
//               {clientNameFor(row.client)}
//             </Typography>
//           </Box>
//         ),
//       },
//       {
//         headerName: "Ward",
//         field: "dob",
//         width: 100,
//         renderCell: () => (
//           <Typography variant="body2" color="text.secondary">
//             ICU
//           </Typography>
//         ),
//       },
//       {
//         headerName: "Sample Type",
//         field: "type",
//         width: 120,
//         renderCell: (row) => (
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: 0.5,
//             }}
//           >
//             <Box
//               sx={{
//                 width: 8,
//                 height: 8,
//                 borderRadius: "50%",
//                 bgcolor: "error.main",
//               }}
//             />
//             <Typography variant="body2">{row.type}</Typography>
//           </Box>
//         ),
//       },
//       {
//         headerName: "Container",
//         field: "gender",
//         width: 120,
//         renderCell: () => (
//           <Typography variant="body2" color="text.secondary">
//             EDTA
//           </Typography>
//         ),
//       },
//       {
//         headerName: "Profile / Tests",
//         field: "tests",
//         width: 160,
//         renderCell: (row) => (
//           <Stack direction="row" spacing={0.5} flexWrap="wrap">
//             {row.tests.slice(0, 2).map((t) => (
//               <Chip
//                 key={t}
//                 size="small"
//                 label={t}
//                 sx={{
//                   height: 20,
//                   fontSize: "0.7rem",
//                   backgroundColor: alpha(theme.palette.primary.main, 0.12),
//                   color: "primary.main",
//                 }}
//               />
//             ))}
//             {row.tests.length > 2 && (
//               <Typography variant="caption" color="text.secondary">
//                 +{row.tests.length - 2}
//               </Typography>
//             )}
//           </Stack>
//         ),
//       },
//       {
//         headerName: "Partitions",
//         field: "phone",
//         width: 100,
//         renderCell: () => (
//           <Typography variant="body2" color="text.secondary">
//             —
//           </Typography>
//         ),
//       },
//       {
//         headerName: "Priority",
//         field: "priority",
//         width: 110,
//         renderCell: (row) => (
//           <Chip
//             size="small"
//             label={row.priority}
//             color={
//               row.priority === "STAT" || row.priority === "URGENT"
//                 ? "error"
//                 : row.priority === "ROUTINE"
//                   ? "default"
//                   : "warning"
//             }
//             sx={{
//               height: 20,
//               fontSize: "0.7rem",
//               fontWeight: 700,
//             }}
//           />
//         ),
//       },
//       {
//         headerName: "Due Date",
//         field: "date",
//         width: 110,
//         renderCell: (row) => (
//           <Typography variant="body2" color="text.secondary">
//             —
//           </Typography>
//         ),
//       },
//       {
//         headerName: "Status",
//         field: "status",
//         width: 130,
//         renderCell: (row) => {
//           const cfg = sampleStatus[row.status];
//           return (
//             <Chip
//               size="small"
//               label={cfg.label}
//               sx={{
//                 backgroundColor: alpha(cfg.color, 0.12),
//                 color: cfg.color,
//                 fontWeight: 700,
//                 fontSize: "0.7rem",
//                 height: 20,
//               }}
//             />
//           );
//         },
//       },
//       {
//         headerName: "Action",
//         field: "id",
//         width: 120,
//         align: "center",
//         headerAlign: "center",
//         renderCell: (row) => (
//           <Button
//             size="small"
//             variant="text"
//             onClick={(e) => {
//               e.stopPropagation();
//               router.push(`/lab/samples?id=${row.id}`);
//             }}
//             sx={{ textTransform: "none", fontWeight: 700 }}
//           >
//             → Next
//           </Button>
//         ),
//       },
//     ],
//     [theme, lab, sampleStatus, router],
//   );

//   const detailResultColumns = React.useMemo<CommonColumn<LabResultRow>[]>(
//     () => [
//       {
//         headerName: "Test",
//         field: "test",
//         width: 150,
//       },
//       {
//         headerName: "Analyte",
//         field: "analyte",
//         width: 150,
//       },
//       {
//         headerName: "Result",
//         field: "result",
//         width: 100,
//         renderCell: (row) => (
//           <Typography
//             variant="body2"
//             sx={{
//               fontWeight: 700,
//               color: row.flag !== "NORMAL" ? "error.main" : "success.main",
//             }}
//           >
//             {row.result}
//           </Typography>
//         ),
//       },
//       {
//         headerName: "Unit",
//         field: "unit",
//         width: 100,
//         renderCell: (row) => row.unit || "—",
//       },
//       {
//         headerName: "Ref Range",
//         field: "id",
//         width: 150,
//         renderCell: (row) => refFromLowHigh(row.refLow, row.refHigh),
//       },
//       {
//         headerName: "Flag",
//         field: "flag",
//         width: 120,
//         renderCell: (row) => (
//           <Chip
//             size="small"
//             label={row.flag}
//             sx={lab.chipSx(getFlagColor(row.flag, theme))}
//           />
//         ),
//       },
//       {
//         headerName: "Analyst",
//         field: "analyst",
//         width: 150,
//       },
//     ],
//     [theme, lab],
//   );

//   if (selectedSample) {
//     return (
//       <PageTemplate title="Samples" currentPageTitle="Sample Detail">
//         <Stack spacing={2}>
//           <SampleDetailView
//             sample={selectedSample}
//             clientName={clientNameFor(selectedSample.client)}
//             results={results}
//             auditLog={auditLog}
//             tests={tests}
//             onBack={() => {
//               setSelected(null);
//               router.push("/lab/samples");
//             }}
//             onAssignAnalyst={handleAssignAnalyst}
//             onMarkReceived={handleMarkReceived}
//             onEnterResults={handleEnterResults}
//             onVerify={handleVerify}
//             onPublish={handlePublish}
//             detailResultColumns={detailResultColumns}
//           />
//           {enterResultsTest && (
//             <EnterResultsModal
//               open={!!enterResultsTestCode}
//               onClose={() => setEnterResultsTestCode(null)}
//               onSubmit={handleResultsSubmit}
//               sampleId={selectedSample.id}
//               testCode={enterResultsTest.code}
//               testName={enterResultsTest.name}
//               analytes={enterResultsTest.analytes}
//               analyst={selectedSample.analyst || ANALYSTS[0]}
//             />
//           )}
//         </Stack>
//       </PageTemplate>
//     );
//   }

//   return (
//     <PageTemplate
//       title="Laboratory"
//       subtitle={new Date().toLocaleDateString("en-IN", {
//         weekday: "long",
//         day: "numeric",
//         month: "short",
//         year: "numeric",
//       })}
//       currentPageTitle="Samples"
//     >
//       <Stack spacing={2.5}>
//         <WorkspaceHeaderCard>
//           <Stack
//             direction={{ xs: "column", md: "row" }}
//             justifyContent="space-between"
//             alignItems={{ xs: "flex-start", md: "center" }}
//             spacing={2}
//           >
//             <Box>
//               <Typography
//                 variant="h5"
//                 sx={{ fontWeight: 800, color: "primary.main", mb: 0.5 }}
//               >
//                 Laboratory Samples
//               </Typography>
//               <Typography
//                 variant="body2"
//                 color="text.secondary"
//                 sx={{ fontWeight: 500 }}
//               >
//                 Manage specimen lifecycle from registration and receipt through
//                 analysis and verified publication.
//               </Typography>
//             </Box>
//             <Button
//               variant="contained"
//               startIcon={<AddIcon />}
//               onClick={() => setAddSampleOpen(true)}
//               sx={{ borderRadius: 1.5, px: 2 }}
//             >
//               New Sample
//             </Button>
//           </Stack>
//         </WorkspaceHeaderCard>
//         {/* ══════════════════════════════════════════════════════════════════
//               PRIORITY & SAMPLE TYPE FILTERS
//           ══════════════════════════════════════════════════════════════════ */}
//         <Stack
//           direction={{ xs: "column", sm: "row" }}
//           spacing={1}
//           sx={{
//             px: 2,
//             py: 1.5,
//             bgcolor: "background.paper",
//             borderRadius: 2,
//             border: "1px solid",
//             borderColor: "divider",
//           }}
//         >
//           <Typography
//             variant="caption"
//             sx={{
//               fontWeight: 700,
//               color: "text.secondary",
//               textTransform: "uppercase",
//             }}
//           >
//             Priority:
//           </Typography>
//           <Stack direction="row" spacing={0.75}>
//             {["all", ...priorities].map((p) => (
//               <Chip
//                 key={p}
//                 label={p === "all" ? "All" : p}
//                 size="small"
//                 onClick={() => setPriorityFilter(p)}
//                 sx={{
//                   height: 24,
//                   backgroundColor:
//                     priorityFilter === p
//                       ? p === "STAT" || p === "URGENT"
//                         ? "error.main"
//                         : "primary.main"
//                       : "transparent",
//                   border: priorityFilter === p ? "1px solid" : "1px solid",
//                   borderColor:
//                     priorityFilter === p
//                       ? p === "STAT" || p === "URGENT"
//                         ? "error.main"
//                         : "primary.main"
//                       : "divider",
//                   color: priorityFilter === p ? "white" : "text.secondary",
//                   fontWeight: priorityFilter === p ? 700 : 500,
//                   cursor: "pointer",
//                 }}
//               />
//             ))}
//           </Stack>

//           <Box sx={{ ml: "auto" }} />

//           <Typography
//             variant="caption"
//             sx={{
//               fontWeight: 700,
//               color: "text.secondary",
//               textTransform: "uppercase",
//             }}
//           >
//             Type:
//           </Typography>
//           <Stack direction="row" spacing={0.75}>
//             {["all", ...sampleTypes].map((t) => (
//               <Chip
//                 key={t}
//                 label={t === "all" ? "All" : t}
//                 size="small"
//                 onClick={() => setTypeFilter(t)}
//                 sx={{
//                   height: 24,
//                   backgroundColor:
//                     typeFilter === t ? "primary.main" : "transparent",
//                   border: "1px solid",
//                   borderColor: typeFilter === t ? "primary.main" : "divider",
//                   color: typeFilter === t ? "white" : "text.secondary",
//                   fontWeight: typeFilter === t ? 700 : 500,
//                   cursor: "pointer",
//                 }}
//               />
//             ))}
//           </Stack>
//         </Stack>

//         {/* ══════════════════════════════════════════════════════════════════
//               DATA GRID
//           ══════════════════════════════════════════════════════════════════ */}
//         <CommonDataGrid<LabSample>
//           rows={filtered}
//           columns={sampleColumns}
//           getRowId={(row) => row.id}
//           externalSearchValue={search}
//           onSearchChange={setSearch}
//           searchPlaceholder="Search by Sample ID, Patient, or Client..."
//           onRowClick={(row) => router.push(`/lab/samples?id=${row.id}`)}
//         />
//       </Stack>

//       {/* ══════════════════════════════════════════════════════════════════
//           MODALS
//       ══════════════════════════════════════════════════════════════════ */}
//       {addSampleOpen && (
//         <AddSampleModal
//           open={addSampleOpen}
//           onClose={() => setAddSampleOpen(false)}
//           onSubmit={handleAddSample}
//           clients={clients}
//           tests={tests}
//         />
//       )}

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         message={snackbar.message}
//       />
//     </PageTemplate>
//   );
// }
