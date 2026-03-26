// "use client";

// import * as React from "react";
// import {
//   Box,
//   Button,
//   Stack,
//   Typography,
//   Chip,
//   Grid,
//   Divider,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   IconButton,
//   alpha,
// } from "@mui/material";
// import {
//   CheckCircle as CheckCircleIcon,
//   Cancel as CancelIcon,
//   Info as InfoIcon,
//   Close as CloseIcon,
//   AccountBalance as AccountBalanceIcon,
//   AssignmentInd as AssignmentIndIcon,
//   Description as DescriptionIcon,
//   PriorityHigh as PriorityHighIcon,
//   ArrowForward as ArrowForwardIcon,
//   MoreHoriz as MoreHorizIcon,
//   Add as AddIcon,
//   HourglassEmpty as HourglassIcon,
//   LocalHospital as LocalHospitalIcon,
//   HourglassEmpty as HourglassEmptyIcon,
// } from "@mui/icons-material";

// // Components
// import { WorkspaceHeaderCard, StatTile } from "@/src/ui/components/molecules";
// import PageTemplate from "@/src/ui/components/PageTemplate";
// import CommonTabs from "@/src/ui/components/molecules/CommonTabs";
// import CommonDataGrid, {
//   CommonColumn,
// } from "@/src/components/table/CommonDataGrid";

// // ── DESIGN TOKENS ───────────────────────────────────────────────────
// const COLORS = {
//   bg: "#F8FAFC", // Clean, minimal hospital white-smoke
//   surface: "#FFFFFF",
//   border: "#E2E8F0",
//   borderStrong: "#CBD5E1",
//   accentBright: "#0284C7", // Bright Sky Blue for primary focus
//   accentSoft: "#F0F9FF", // Very light blue for subtle backgrounds
//   pending: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" }, // Warm Amber
//   accepted: { bg: "#ECFDF5", text: "#065F46", border: "#D1FAE5" }, // Clean Teal/Emerald
//   rejected: { bg: "#FFF1F2", text: "#9F1239", border: "#FFE4E6" }, // Soft Rose/Crimson
//   textPrimary: "#0F172A", // Deep Slate for max readability
//   textSecondary: "#475569", // Medium Slate
//   textMuted: "#94A3B8", // Light Slate for details
// };

// // ─── Mock Data ────────────────────────────────────────────────────────

// const REQUESTS = [
//   {
//     id: "FAR-009",
//     patientName: "Rahul Sharma",
//     patientId: "P-20241101",
//     department: "Oncology",
//     doctor: "Dr. Arjun Mehta",
//     billAmount: 85000,
//     requestedAmount: 60000,
//     scheme: "Ayushman Bharat",
//     priority: "High",
//     docs: "3 verified",
//     doctorNote:
//       "Patient is a genuine case. Stage 3 diagnosis confirmed. Family is financially distressed. I strongly recommend approval of the PM-JAY scheme assistance.",
//     status: "Doctor Approved",
//     type: "Govt. Scheme",
//   },
//   {
//     id: "FAR-007",
//     patientName: "Sunita Patel",
//     patientId: "P-20241088",
//     department: "Oncology",
//     doctor: "Dr. Arjun Mehta",
//     billAmount: 120000,
//     requestedAmount: 80000,
//     patientPays: 40000,
//     status: "Doctor Approved",
//     type: "Charity",
//   },
// ];

// // ─── Sub-Components ───────────────────────────────────────────────────

// export default function FinancialAssistanceFinanceDeskPage() {
//   const [activeTab, setActiveTab] = React.useState("pending");
//   const [reviewOpen, setReviewOpen] = React.useState(false);
//   const [selectedRequest, setSelectedRequest] = React.useState<any>(null);

//   const handleReview = (req: any) => {
//     setSelectedRequest(req);
//     setReviewOpen(true);
//   };

//   const tabs = [
//     { id: "pending", label: "Pending Approval", icon: <HourglassIcon /> },
//     { id: "all", label: "All Requests" },
//     { id: "audit", label: "Audit Log" },
//   ];

//   /* ── Table Columns (Using project's standard CommonColumn) ── */
//   const columns: CommonColumn<any>[] = [
//     {
//       field: "id",
//       headerName: "ID",
//       width: 100,
//       renderCell: (row) => (
//         <Typography
//           sx={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}
//         >
//           {row.id}
//         </Typography>
//       ),
//     },
//     {
//       field: "patientName",
//       headerName: "PATIENT",
//       width: 200,
//       renderCell: (row) => (
//         <Box>
//           <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
//             {row.patientName}
//           </Typography>
//           <Typography sx={{ fontSize: 11, color: COLORS.textMuted }}>
//             {row.patientId}
//           </Typography>
//         </Box>
//       ),
//     },
//     {
//       field: "billAmount",
//       headerName: "BILL",
//       width: 120,
//       renderCell: (row) => (
//         <Typography sx={{ fontSize: 13 }}>
//           ₹{row.billAmount.toLocaleString()}
//         </Typography>
//       ),
//     },
//     {
//       field: "requestedAmount",
//       headerName: "ASSISTANCE",
//       width: 120,
//       renderCell: (row) => (
//         <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#BE123C" }}>
//           ₹{row.requestedAmount.toLocaleString()}
//         </Typography>
//       ),
//     },
//     {
//       field: "type",
//       headerName: "TYPE",
//       width: 120,
//       renderCell: (row) => (
//         <Chip
//           label={row.type}
//           size="small"
//           sx={{
//             height: 20,
//             fontSize: 10,
//             fontWeight: 700,
//             bgcolor:
//               row.type === "Govt. Scheme"
//                 ? "#E0F2FE"
//                 : row.type === "Charity"
//                   ? "#FCE7F3"
//                   : "#F3E8FF",
//             color:
//               row.type === "Govt. Scheme"
//                 ? "#0369A1"
//                 : row.type === "Charity"
//                   ? "#BE185D"
//                   : "#7E22CE",
//             borderRadius: "4px",
//           }}
//         />
//       ),
//     },
//     {
//       field: "status",
//       headerName: "STATUS",
//       width: 150,
//       renderCell: (row) => (
//         <Chip
//           label={row.status}
//           size="small"
//           sx={{
//             height: 20,
//             fontSize: 10,
//             fontWeight: 700,
//             bgcolor: row.status === "Doctor Approved" ? "#FFF7ED" : "#F0FDF4",
//             color: row.status === "Doctor Approved" ? "#C2410C" : "#166534",
//             borderRadius: "4px",
//           }}
//         />
//       ),
//     },
//     {
//       field: "action",
//       headerName: "ACTION",
//       width: 120,
//       renderCell: (row) => (
//         <Button
//           size="small"
//           variant="contained"
//           onClick={() => handleReview(row)}
//           sx={{
//             bgcolor: "success.main",
//             textTransform: "none",
//             fontSize: 11,
//             py: 0.5,
//             px: 2,
//             borderRadius: "6px",
//             "&:hover": { bgcolor: "#065F46" },
//           }}
//         >
//           Approve
//         </Button>
//       ),
//     },
//   ];

//   const auditLogs = [
//     {
//       id: 1,
//       text: "FAR-009 submitted by patient Rahul Sharma — Govt. scheme ₹60,000 requested",
//       time: "just now",
//       icon: "arrow",
//     },
//     {
//       id: 2,
//       text: "FAR-008 approved by Finance Head — ₹15,000 discount granted to Vijay Kumar",
//       time: "2 hrs ago",
//       icon: "check",
//     },
//     {
//       id: 3,
//       text: "FAR-007 recommended by Dr. Arjun Mehta — forwarded to Finance",
//       time: "3 hrs ago",
//       icon: "recommend",
//     },
//     {
//       id: 4,
//       text: "FAR-006 rejected — Insurance claim incomplete documents",
//       time: "Yesterday",
//       icon: "close",
//     },
//   ];

//   return (
//     <PageTemplate
//       title="Financial Assistance"
//       subtitle="Final approval, rejection & disbursement tracking for medical assistance requests."
//       currentPageTitle="Finance Desk"
//     >
//       <WorkspaceHeaderCard sx={{ mb: 4 }}>
//         <Stack
//           direction="row"
//           spacing={2}
//           justifyContent="space-between"
//           alignItems="center"
//         >
//           <Box>
//             <Typography
//               variant="h5"
//               sx={{ fontWeight: 900, color: "primary.main", mb: 0.5 }}
//             >
//               Finance Desk
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Reviewing 5 pending recommendation cases for final disbursement
//               approval.
//             </Typography>
//           </Box>
//           <Button
//             variant="contained"
//             size="small"
//             startIcon={<AddIcon />}
//             sx={{
//               textTransform: "none",
//               borderRadius: "8px",
//               fontSize: 12,
//               px: 3,
//               fontWeight: 700,
//               "&:hover": { bgcolor: "#065F46" },
//               boxShadow: (t: any) => `0 4px 12px ${alpha("#064E3B", 0.2)}`,
//             }}
//           >
//             New Request
//           </Button>
//         </Stack>
//       </WorkspaceHeaderCard>

//       {/* Stats Row */}
//       <Grid container spacing={2} sx={{ mb: 4 }}>
//         <Grid item xs={12} sm={6} md={3}>
//           <StatTile
//             label="APPROVED THIS MONTH"
//             value="₹4.2L"
//             subtitle="38 cases approved"
//             tone="success"
//             icon={<CheckCircleIcon />}
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <StatTile
//             label="PENDING FINAL APPROVAL"
//             value="5"
//             subtitle="Recommended by Doctors"
//             tone="warning"
//             icon={<HourglassIcon />}
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <StatTile
//             label="REJECTED"
//             value="5"
//             subtitle="This month"
//             tone="error"
//             icon={<CancelIcon />}
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <StatTile
//             label="GOVT. SCHEME CASES"
//             value="21"
//             subtitle="Ayushman + others"
//             tone="info"
//             icon={<AccountBalanceIcon />}
//           />
//         </Grid>
//       </Grid>

//       {/* Tabs */}
//       <Box sx={{ mb: 3 }}>
//         <CommonTabs tabs={tabs} value={activeTab} onChange={setActiveTab} />
//       </Box>

//       {/* Info Bar */}
//       <Box
//         sx={{
//           p: 1.5,
//           bgcolor: COLORS.accentSoft,
//           border: `1px solid ${alpha(COLORS.accentBright, 0.2)}`,
//           borderRadius: "8px",
//           display: "flex",
//           alignItems: "center",
//           gap: 1.5,
//           mb: 3,
//         }}
//       >
//         <InfoIcon sx={{ color: COLORS.accentBright, fontSize: 18 }} />
//         <Typography
//           sx={{ fontSize: 13, color: COLORS.accentBright, fontWeight: 500 }}
//         >
//           Those requests have been{" "}
//           <strong style={{ fontWeight: 700 }}>
//             recommended by the treating Doctor/HOD
//           </strong>{" "}
//           and are awaiting your final approval.
//         </Typography>
//       </Box>

//       {/* Content based on Tabs */}
//       <Box>
//         {activeTab === "pending" && (
//           <Stack spacing={2}>
//             {REQUESTS.map((req) => (
//               <Box
//                 key={req.id}
//                 sx={{
//                   bgcolor: COLORS.surface,
//                   borderRadius: "12px",
//                   border: `1px solid ${COLORS.border}`,
//                   p: 3,
//                   position: "relative",
//                   boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
//                 }}
//               >
//                 {/* Status Badge */}
//                 <Chip
//                   label={req.status}
//                   size="small"
//                   sx={{
//                     position: "absolute",
//                     top: 16,
//                     right: 16,
//                     bgcolor: "#FFF7ED",
//                     color: "#C2410C",
//                     fontSize: 10,
//                     fontWeight: 700,
//                     borderRadius: "4px",
//                   }}
//                 />

//                 <Box sx={{ mb: 2 }}>
//                   <Typography
//                     sx={{
//                       fontSize: 16,
//                       fontWeight: 800,
//                       color: COLORS.textPrimary,
//                     }}
//                   >
//                     {req.patientName}{" "}
//                     <span
//                       style={{
//                         color: COLORS.textMuted,
//                         fontWeight: 500,
//                         fontSize: 12,
//                       }}
//                     >
//                       {req.patientId}
//                     </span>
//                   </Typography>
//                   <Typography
//                     sx={{ fontSize: 12, color: COLORS.textSecondary }}
//                   >
//                     {req.id} • {req.department} •{" "}
//                     <span style={{ color: COLORS.accentBright }}>
//                       Recommended by {req.doctor}
//                     </span>
//                   </Typography>
//                 </Box>

//                 <Grid
//                   container
//                   spacing={4}
//                   sx={{ mb: Number(req.doctorNote ? 2 : 3) }}
//                 >
//                   <Grid item xs={3}>
//                     <Typography
//                       sx={{
//                         fontSize: 10,
//                         color: COLORS.textMuted,
//                         fontWeight: 700,
//                         mb: 0.5,
//                       }}
//                     >
//                       BILL AMOUNT
//                     </Typography>
//                     <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
//                       ₹{req.billAmount.toLocaleString()}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={3}>
//                     <Typography
//                       sx={{
//                         fontSize: 10,
//                         color: COLORS.textMuted,
//                         fontWeight: 700,
//                         mb: 0.5,
//                       }}
//                     >
//                       REQUESTED
//                     </Typography>
//                     <Typography
//                       sx={{ fontSize: 14, fontWeight: 700, color: "#BE123C" }}
//                     >
//                       ₹{req.requestedAmount.toLocaleString()}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={3}>
//                     <Typography
//                       sx={{
//                         fontSize: 10,
//                         color: COLORS.textMuted,
//                         fontWeight: 700,
//                         mb: 0.5,
//                       }}
//                     >
//                       TYPE
//                     </Typography>
//                     <Chip
//                       label={req.type}
//                       size="small"
//                       sx={{
//                         height: 20,
//                         fontSize: 10,
//                         fontWeight: 700,
//                         bgcolor:
//                           req.type === "Govt. Scheme" ? "#E0F2FE" : "#FCE7F3",
//                         color:
//                           req.type === "Govt. Scheme" ? "#0369A1" : "#BE185D",
//                         borderRadius: "4px",
//                       }}
//                     />
//                   </Grid>

//                   {req.scheme && (
//                     <Grid item xs={3}>
//                       <Typography
//                         sx={{
//                           fontSize: 10,
//                           color: COLORS.textMuted,
//                           fontWeight: 700,
//                           mb: 0.5,
//                         }}
//                       >
//                         SCHEME
//                       </Typography>
//                       <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
//                         {req.scheme}
//                       </Typography>
//                     </Grid>
//                   )}
//                 </Grid>

//                 {req.doctorNote && (
//                   <Box
//                     sx={{
//                       p: 2,
//                       bgcolor: "#F0FDF4",
//                       border: "1px solid #BBF7D0",
//                       borderRadius: "8px",
//                       mb: 3,
//                     }}
//                   >
//                     <Typography
//                       sx={{ fontSize: 12, color: "#166534", lineHeight: 1.5 }}
//                     >
//                       <strong style={{ fontWeight: 800 }}>
//                         Doctor’s Note:
//                       </strong>{" "}
//                       "{req.doctorNote}"
//                     </Typography>
//                   </Box>
//                 )}

//                 <Stack direction="row" spacing={1}>
//                   <Button
//                     size="small"
//                     variant="outlined"
//                     sx={{
//                       border: `1px solid ${COLORS.border}`,
//                       color: COLORS.textPrimary,
//                       textTransform: "none",
//                       borderRadius: "8px",
//                       fontWeight: 700,
//                       fontSize: 12,
//                     }}
//                   >
//                     Full Details
//                   </Button>
//                   <Button
//                     size="small"
//                     variant="contained"
//                     sx={{
//                       bgcolor: alpha("#F97316", 0.1),
//                       color: "#C2410C",
//                       textTransform: "none",
//                       borderRadius: "8px",
//                       fontWeight: 700,
//                       fontSize: 12,
//                       boxShadow: "none",
//                       "&:hover": { bgcolor: alpha("#F97316", 0.2) },
//                     }}
//                   >
//                     Partial Approve
//                   </Button>
//                   <Button
//                     size="small"
//                     variant="contained"
//                     sx={{
//                       bgcolor: COLORS.rejected.bg,
//                       color: COLORS.rejected.text,
//                       textTransform: "none",
//                       borderRadius: "8px",
//                       fontWeight: 700,
//                       fontSize: 12,
//                       boxShadow: "none",
//                       "&:hover": { bgcolor: alpha(COLORS.rejected.bg, 0.8) },
//                     }}
//                   >
//                     Reject
//                   </Button>
//                   <Button
//                     size="small"
//                     variant="contained"
//                     onClick={() => handleReview(req)}
//                     sx={{
//                       bgcolor: "success.main",
//                       color: "#fff",
//                       textTransform: "none",
//                       borderRadius: "8px",
//                       fontWeight: 700,
//                       fontSize: 12,
//                       boxShadow: "none",
//                       "&:hover": { bgcolor: "success.main" },
//                     }}
//                   >
//                     Final Approve
//                   </Button>
//                 </Stack>
//               </Box>
//             ))}
//           </Stack>
//         )}

//         {activeTab === "all" && (
//           <CommonDataGrid
//             showSerialNo
//             rows={Array(8)
//               .fill(0)
//               .map((_, i) => ({
//                 ...REQUESTS[0],
//                 id: `FAR-00${9 - i}`,
//                 patientName:
//                   [
//                     "Rahul Sharma",
//                     "Vijay Kumar",
//                     "Sunita Patel",
//                     "Ananya Singh",
//                     "Mahesh Yadav",
//                     "Kiran Devi",
//                     "Om Prakash",
//                     "Aarti Pal",
//                   ][i] || "Rahul Sharma",
//                 status:
//                   i % 3 === 0
//                     ? "Doctor Approved"
//                     : i % 3 === 1
//                       ? "Approved"
//                       : "Rejected",
//               }))}
//             columns={columns}
//             searchPlaceholder="Search by patient, ID, bill..."
//           />
//         )}

//         {activeTab === "audit" && (
//           <Box
//             sx={{
//               bgcolor: COLORS.surface,
//               borderRadius: "12px",
//               border: `1px solid ${COLORS.border}`,
//               overflow: "hidden",
//             }}
//           >
//             <Box
//               sx={{
//                 p: 2,
//                 borderBottom: `1px solid ${COLORS.border}`,
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 1,
//               }}
//             >
//               <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
//                 Audit Log
//               </Typography>
//             </Box>
//             <Stack sx={{ p: 2 }}>
//               {auditLogs.map((log) => (
//                 <Box
//                   key={log.id}
//                   sx={{
//                     py: 1.5,
//                     borderBottom:
//                       log.id !== 4 ? `1px solid ${COLORS.border}` : "none",
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                   }}
//                 >
//                   <Stack direction="row" spacing={2} alignItems="center">
//                     {log.icon === "arrow" && (
//                       <PriorityHighIcon
//                         sx={{ color: "#F97316", fontSize: 18 }}
//                       />
//                     )}
//                     {log.icon === "check" && (
//                       <CheckCircleIcon
//                         sx={{ color: "#16A34A", fontSize: 18 }}
//                       />
//                     )}
//                     {log.icon === "recommend" && (
//                       <AssignmentIndIcon
//                         sx={{ color: "#EAB308", fontSize: 18 }}
//                       />
//                     )}
//                     {log.icon === "close" && (
//                       <CancelIcon sx={{ color: "#BE123C", fontSize: 18 }} />
//                     )}
//                     <Typography
//                       sx={{ fontSize: 13, color: COLORS.textPrimary }}
//                     >
//                       <strong style={{ fontWeight: 800 }}>
//                         {log.text.split(" ")[0]}
//                       </strong>{" "}
//                       {log.text.slice(log.text.indexOf(" "))}
//                     </Typography>
//                   </Stack>
//                   <Typography sx={{ fontSize: 11, color: COLORS.textMuted }}>
//                     {log.time}
//                   </Typography>
//                 </Box>
//               ))}
//             </Stack>
//           </Box>
//         )}
//       </Box>

//       {/* Final Review Dialog */}
//       <Dialog
//         open={reviewOpen}
//         onClose={() => setReviewOpen(false)}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: "24px",
//             overflow: "hidden",
//             boxShadow: "0 25px 70px rgba(15,23,42,0.18)",
//             bgcolor: "#F8FAFC",
//           },
//         }}
//       >
//         {/* ── Header ── */}
//         <Box
//           sx={{
//             background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
//             px: 4,
//             py: 3,
//             color: "#fff",
//             position: "relative",
//             overflow: "hidden",
//           }}
//         >
//           {/* Decorative Background Element */}
//           <Box
//             sx={{
//               position: "absolute",
//               top: -50,
//               right: -50,
//               width: 150,
//               height: 150,
//               borderRadius: "50%",
//               background: "rgba(255,255,255,0.05)",
//             }}
//           />

//           <Stack
//             direction="row"
//             alignItems="center"
//             justifyContent="space-between"
//           >
//             <Stack direction="row" alignItems="center" spacing={2}>
//               <Box
//                 sx={{
//                   width: 48,
//                   height: 48,
//                   borderRadius: "14px",
//                   bgcolor: "rgba(255,255,255,0.1)",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   backdropFilter: "blur(8px)",
//                   border: "1px solid rgba(255,255,255,0.1)",
//                 }}
//               >
//                 <LocalHospitalIcon sx={{ color: "#38BDF8", fontSize: 26 }} />
//               </Box>
//               <Box>
//                 <Typography
//                   sx={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}
//                 >
//                   Case Approval
//                 </Typography>
//                 <Typography
//                   sx={{
//                     fontSize: 13,
//                     color: "rgba(255,255,255,0.6)",
//                     fontWeight: 600,
//                   }}
//                 >
//                   Reference No:{" "}
//                   <span style={{ color: "#38BDF8" }}>
//                     {selectedRequest?.id}
//                   </span>
//                 </Typography>
//               </Box>
//             </Stack>
//             <IconButton
//               onClick={() => setReviewOpen(false)}
//               sx={{
//                 color: "rgba(255,255,255,0.6)",
//                 "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
//               }}
//             >
//               <CloseIcon />
//             </IconButton>
//           </Stack>
//         </Box>

//         <DialogContent sx={{ p: 4 }}>
//           <Grid container spacing={4}>
//             {/* ── Left Column: Patient & Case ── */}
//             <Grid item xs={12} md={7}>
//               <Stack spacing={3}>
//                 {/* Patient Profile */}
//                 <Box>
//                   <Typography
//                     sx={{
//                       fontSize: 11,
//                       fontWeight: 800,
//                       color: "#64748B",
//                       letterSpacing: 1,
//                       mb: 2,
//                       textTransform: "uppercase",
//                     }}
//                   >
//                     Patient Profile & Referral
//                   </Typography>
//                   <Box
//                     sx={{
//                       p: 3,
//                       borderRadius: "18px",
//                       bgcolor: "#fff",
//                       border: "1px solid #E2E8F0",
//                       boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
//                     }}
//                   >
//                     <Grid container spacing={2}>
//                       <Grid item xs={6}>
//                         <Typography
//                           sx={{
//                             fontSize: 11,
//                             color: "#94A3B8",
//                             fontWeight: 700,
//                           }}
//                         >
//                           FULL NAME
//                         </Typography>
//                         <Typography
//                           sx={{
//                             fontSize: 15,
//                             fontWeight: 800,
//                             color: "#1E293B",
//                           }}
//                         >
//                           {selectedRequest?.patientName}
//                         </Typography>
//                       </Grid>
//                       <Grid item xs={6}>
//                         <Typography
//                           sx={{
//                             fontSize: 11,
//                             color: "#94A3B8",
//                             fontWeight: 700,
//                           }}
//                         >
//                           PATIENT ID
//                         </Typography>
//                         <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
//                           {selectedRequest?.patientId}
//                         </Typography>
//                       </Grid>
//                       <Grid item xs={6}>
//                         <Typography
//                           sx={{
//                             fontSize: 11,
//                             color: "#94A3B8",
//                             fontWeight: 700,
//                           }}
//                         >
//                           UNIT
//                         </Typography>
//                         <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
//                           {selectedRequest?.department}
//                         </Typography>
//                       </Grid>
//                       <Grid item xs={6}>
//                         <Typography
//                           sx={{
//                             fontSize: 11,
//                             color: "#94A3B8",
//                             fontWeight: 700,
//                           }}
//                         >
//                           REFERRING DOCTOR
//                         </Typography>
//                         <Typography
//                           sx={{
//                             fontSize: 14,
//                             fontWeight: 700,
//                             color: "#0369A1",
//                           }}
//                         >
//                           {selectedRequest?.doctor}
//                         </Typography>
//                       </Grid>
//                     </Grid>
//                   </Box>
//                 </Box>

//                 {/* Recommendation Detail */}
//                 <Box>
//                   <Typography
//                     sx={{
//                       fontSize: 11,
//                       fontWeight: 800,
//                       color: "#64748B",
//                       letterSpacing: 1,
//                       mb: 1,
//                       textTransform: "uppercase",
//                     }}
//                   >
//                     Clinical Justification
//                   </Typography>
//                   <Box
//                     sx={{
//                       p: 2.5,
//                       borderRadius: "16px",
//                       bgcolor: "#F0F9FF",
//                       border: "1px dashed #0284C7",
//                       position: "relative",
//                     }}
//                   >
//                     <Typography
//                       sx={{
//                         fontSize: 13,
//                         color: "#0C4A6E",
//                         fontStyle: "italic",
//                         lineHeight: 1.6,
//                       }}
//                     >
//                       "
//                       {selectedRequest?.doctorNote ||
//                         "Clinical recommendation provided for immediate financial clearance based on patient socio-economic status."}
//                       "
//                     </Typography>
//                   </Box>
//                 </Box>

//                 {/* Timeline Progress */}
//                 <Box>
//                   <Typography
//                     sx={{
//                       fontSize: 11,
//                       fontWeight: 800,
//                       color: "#64748B",
//                       letterSpacing: 1,
//                       mb: 2,
//                       textTransform: "uppercase",
//                     }}
//                   >
//                     Verification Path
//                   </Typography>
//                   <Stack
//                     direction="row"
//                     spacing={3}
//                     sx={{ position: "relative" }}
//                   >
//                     <Box
//                       sx={{
//                         position: "absolute",
//                         left: 16,
//                         top: 0,
//                         bottom: 0,
//                         width: 2,
//                         bgcolor: "#E2E8F0",
//                         zIndex: 0,
//                       }}
//                     />
//                     <Stack spacing={2} sx={{ flex: 1 }}>
//                       {[
//                         {
//                           label: "Case Registered",
//                           time: "15 Mar, 10:30 AM",
//                           status: "complete",
//                         },
//                         {
//                           label: "Doctor Recommendation",
//                           time: "16 Mar, 02:45 PM",
//                           status: "complete",
//                         },
//                         {
//                           label: "Finance Audit",
//                           time: "Processing...",
//                           status: "active",
//                         },
//                       ].map((step, idx) => (
//                         <Stack
//                           key={idx}
//                           direction="row"
//                           spacing={2}
//                           alignItems="center"
//                           sx={{ position: "relative", zIndex: 1 }}
//                         >
//                           <Box
//                             sx={{
//                               width: 32,
//                               height: 32,
//                               borderRadius: "50%",
//                               bgcolor:
//                                 step.status === "complete"
//                                   ? "#059669"
//                                   : step.status === "active"
//                                     ? "#0284C7"
//                                     : "#CBD5E1",
//                               display: "flex",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               color: "#fff",
//                             }}
//                           >
//                             {step.status === "complete" ? (
//                               <CheckCircleIcon sx={{ fontSize: 16 }} />
//                             ) : (
//                               <Typography
//                                 sx={{ fontSize: 12, fontWeight: 900 }}
//                               >
//                                 {idx + 1}
//                               </Typography>
//                             )}
//                           </Box>
//                           <Box>
//                             <Typography
//                               sx={{
//                                 fontSize: 13,
//                                 fontWeight: 700,
//                                 color:
//                                   step.status === "active"
//                                     ? "#0284C7"
//                                     : "#334155",
//                               }}
//                             >
//                               {step.label}
//                             </Typography>
//                             <Typography sx={{ fontSize: 11, color: "#94A3B8" }}>
//                               {step.time}
//                             </Typography>
//                           </Box>
//                         </Stack>
//                       ))}
//                     </Stack>
//                   </Stack>
//                 </Box>
//               </Stack>
//             </Grid>

//             {/* ── Right Column: Financial Calculator ── */}
//             <Grid item xs={12} md={5}>
//               <Stack spacing={3}>
//                 <Box
//                   sx={{
//                     p: 3,
//                     borderRadius: "24px",
//                     bgcolor: "#1E293B",
//                     color: "#fff",
//                     boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
//                   }}
//                 >
//                   <Typography
//                     sx={{
//                       fontSize: 11,
//                       fontWeight: 800,
//                       color: "rgba(255,255,255,0.4)",
//                       mb: 2.5,
//                       letterSpacing: 1,
//                     }}
//                   >
//                     SETTLEMENT PLAN
//                   </Typography>

//                   <Stack spacing={2.5}>
//                     <Box
//                       sx={{ display: "flex", justifyContent: "space-between" }}
//                     >
//                       <Typography
//                         sx={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}
//                       >
//                         Gross Medical Bill
//                       </Typography>
//                       <Typography sx={{ fontSize: 16, fontWeight: 800 }}>
//                         ₹{selectedRequest?.billAmount?.toLocaleString()}
//                       </Typography>
//                     </Box>
//                     <Box
//                       sx={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                       }}
//                     >
//                       <Box>
//                         <Typography
//                           sx={{
//                             fontSize: 13,
//                             color: "#38BDF8",
//                             fontWeight: 600,
//                           }}
//                         >
//                           Assistance Package
//                         </Typography>
//                         <Typography
//                           sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}
//                         >
//                           {selectedRequest?.type || "Standard Assistance"}
//                         </Typography>
//                       </Box>
//                       <Typography
//                         sx={{ fontSize: 18, fontWeight: 900, color: "#F43F5E" }}
//                       >
//                         − ₹{selectedRequest?.requestedAmount?.toLocaleString()}
//                       </Typography>
//                     </Box>

//                     <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

//                     <Box
//                       sx={{
//                         p: 2,
//                         borderRadius: "16px",
//                         bgcolor: "rgba(255,255,255,0.05)",
//                         border: "1px solid rgba(255,255,255,0.1)",
//                       }}
//                     >
//                       <Typography
//                         sx={{
//                           fontSize: 11,
//                           color: "rgba(255,255,255,0.6)",
//                           mb: 0.5,
//                         }}
//                       >
//                         PATIENT RESPONSIBILITY
//                       </Typography>
//                       <Typography
//                         sx={{
//                           fontSize: 32,
//                           fontWeight: 900,
//                           color: "#10B981",
//                           letterSpacing: -1,
//                         }}
//                       >
//                         ₹
//                         {(
//                           (selectedRequest?.billAmount || 0) -
//                           (selectedRequest?.requestedAmount || 0)
//                         ).toLocaleString()}
//                       </Typography>
//                       <Box
//                         sx={{
//                           mt: 1,
//                           display: "flex",
//                           alignItems: "center",
//                           gap: 1,
//                         }}
//                       >
//                         <Chip
//                           size="small"
//                           label={`${Math.round(((selectedRequest?.requestedAmount || 0) / (selectedRequest?.billAmount || 1)) * 100)}% Discounted`}
//                           sx={{
//                             bgcolor: "rgba(16,185,129,0.15)",
//                             color: "#10B981",
//                             fontWeight: 800,
//                             fontSize: 10,
//                             height: 20,
//                           }}
//                         />
//                       </Box>
//                     </Box>
//                   </Stack>
//                 </Box>

//                 <Box>
//                   <Typography
//                     sx={{
//                       fontSize: 11,
//                       fontWeight: 800,
//                       color: "#64748B",
//                       mb: 1,
//                       px: 1,
//                     }}
//                   >
//                     FINAL OVERRIDE
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     label="Approved Amount"
//                     type="number"
//                     defaultValue={selectedRequest?.requestedAmount}
//                     InputProps={{
//                       startAdornment: (
//                         <Typography
//                           sx={{ mr: 1, fontWeight: 700, color: "#64748B" }}
//                         >
//                           ₹
//                         </Typography>
//                       ),
//                     }}
//                     sx={{
//                       "& .MuiOutlinedInput-root": {
//                         borderRadius: "16px",
//                         bgcolor: "#fff",
//                         fontWeight: 700,
//                         fontSize: 15,
//                         "& fieldset": { borderColor: "#E2E8F0" },
//                       },
//                     }}
//                   />
//                 </Box>

//                 <Box>
//                   <Typography
//                     sx={{
//                       fontSize: 11,
//                       fontWeight: 800,
//                       color: "#64748B",
//                       mb: 1,
//                       px: 1,
//                     }}
//                   >
//                     INTERNAL NOTE
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     multiline
//                     rows={4}
//                     placeholder="Verification remarks..."
//                     sx={{
//                       "& .MuiOutlinedInput-root": {
//                         borderRadius: "16px",
//                         bgcolor: "#fff",
//                         fontSize: 13,
//                         "& fieldset": { borderColor: "#E2E8F0" },
//                       },
//                     }}
//                   />
//                 </Box>
//               </Stack>
//             </Grid>
//           </Grid>
//         </DialogContent>

//         <DialogActions sx={{ p: 4, pt: 0 }}>
//           <Button
//             onClick={() => setReviewOpen(false)}
//             sx={{
//               color: "#64748B",
//               fontWeight: 700,
//               textTransform: "none",
//               fontSize: 14,
//             }}
//           >
//             Wait for more info
//           </Button>
//           <Button
//             variant="contained"
//             sx={{
//               bgcolor: "#fff",
//               color: "#E11D48",
//               border: "1px solid #FDA4AF",
//               fontWeight: 700,
//               px: 3,
//               borderRadius: "14px",
//               textTransform: "none",
//               "&:hover": { bgcolor: "#FFF1F2", borderColor: "#F43F5E" },
//             }}
//           >
//             Decline Case
//           </Button>
//           <Button
//             variant="contained"
//             sx={{
//               // bgcolor: "#0284C7",
//               textTransform: "none",
//               fontWeight: 800,
//               fontSize: 15,
//               px: 4,
//               py: 1.25,
//               borderRadius: "14px",
//               // boxShadow: "0 10px 25px rgba(2,132,199,0.3)",
//               // "&:hover": {
//               //   bgcolor: "#0369A1",
//               //   boxShadow: "0 12px 30px rgba(2,132,199,0.4)",
//               // },
//             }}
//           >
//             Authorize Clearance
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </PageTemplate>
//   );
// }



// {/*linear-gradient(135deg, rgba(17, 114, 186, 0.11) 0%, rgba(44, 138, 211, 0.08) 100%)*/}