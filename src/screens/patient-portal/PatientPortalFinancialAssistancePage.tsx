// "use client";

// import * as React from "react";
// import {
//   Box,
//   Button,
//   Stack,
//   Typography,
//   TextField,
//   MenuItem,
//   Stepper,
//   Step,
//   StepLabel,
//   StepConnector,
//   stepConnectorClasses,
//   Chip,
// } from "@mui/material";
// import { styled } from "@mui/material/styles";
// import {
//   Info as InfoIcon,
//   ArrowForward as ArrowForwardIcon,
//   CheckCircle as CheckCircleIcon,
//   VerifiedUser as VerifiedUserIcon,
//   LocalHospital as LocalHospitalIcon,
//   AccountBalance as AccountBalanceIcon,
//   Favorite as FavoriteIcon,
//   AssignmentInd as AssignmentIndIcon,
//   CloudUpload as CloudUploadIcon,
//   Description as DescriptionIcon,
//   History as HistoryIcon,
//   ArrowBack as ArrowBackIcon,
//   MonetizationOn as MonetizationOnIcon,
//   VolunteerActivism as VolunteerActivismIcon,
//   Business as BusinessIcon,
// } from "@mui/icons-material";
// import { alpha } from "@mui/material/styles";
// import { Divider, Grid } from "@mui/material";

// // ── DESIGN TOKENS ───────────────────────────────────────────────────
// const COLORS = {
//   bg: "#F0F4F8",
//   surface: "#FFFFFF",
//   border: "#E2E8F0",
//   borderStrong: "#CBD5E1",
//   accent: "#1172BA",
//   accentDark: "#0284C7",
//   accentMuted: "#E0F2FE",
//   pending: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
//   accepted: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
//   rejected: { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
//   textPrimary: "#0F172A",
//   textSecondary: "#64748B",
//   textMuted: "#94A3B8",
//   rxOrange: "#F97316",
//   rxOrangeMuted: "#FFF7ED",
// };

// // ─── Stepper Customization ────────────────────────────────────────────────────

// const BlueConnector = styled(StepConnector)(() => ({
//   [`&.${stepConnectorClasses.alternativeLabel}`]: {
//     top: 20,
//     left: "calc(-50% + 20px)",
//     right: "calc(50% + 20px)",
//   },
//   [`& .${stepConnectorClasses.line}`]: {
//     borderColor: COLORS.accentMuted,
//     borderTopWidth: 2,
//   },
//   [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
//     borderColor: COLORS.accent,
//   },
//   [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
//     borderColor: COLORS.accent,
//   },
// }));

// const StepIconRoot = styled("div")<{
//   ownerState: { active?: boolean; completed?: boolean };
// }>(({ ownerState }) => ({
//   width: 40,
//   height: 40,
//   borderRadius: "50%",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   fontSize: 13,
//   fontWeight: 700,
//   fontFamily: "'DM Sans', sans-serif",
//   border: "2px solid",
//   transition: "all 0.2s ease",
//   ...(ownerState.completed
//     ? {
//         backgroundColor: COLORS.accent,
//         borderColor: COLORS.accent,
//         color: "#fff",
//       }
//     : ownerState.active
//       ? {
//           backgroundColor: COLORS.accentMuted,
//           borderColor: COLORS.accent,
//           color: COLORS.accent,
//           boxShadow: `0 0 0 4px ${alpha(COLORS.accent, 0.1)}`,
//         }
//       : {
//           backgroundColor: COLORS.bg,
//           borderColor: COLORS.borderStrong,
//           color: COLORS.textMuted,
//         }),
// }));

// function CustomStepIcon(props: {
//   active?: boolean;
//   completed?: boolean;
//   icon: React.ReactNode;
// }) {
//   const { active, completed, icon } = props;
//   return (
//     <StepIconRoot ownerState={{ active, completed }}>
//       {completed ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : icon}
//     </StepIconRoot>
//   );
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const STEPS = [
//   "Check Eligibility",
//   "Fill Application",
//   "Upload Documents",
//   "Review & Submit",
//   "Track Status",
// ];
// const INCOME_OPTIONS = ["Below ₹50,000", "₹50,000 - ₹1 Lakh", "Above ₹1 Lakh"];
// const CATEGORY_OPTIONS = ["APL", "BPL", "EWS"];
// const BINARY_OPTIONS = ["Yes", "No"];

// const SCHEME_ICONS: Record<string, React.ReactNode> = {
//   "PM-JAY / Ayushman Bharat": <VerifiedUserIcon sx={{ fontSize: 16 }} />,
//   "Hospital Charity Fund": <FavoriteIcon sx={{ fontSize: 16 }} />,
//   "NGO Support": <AssignmentIndIcon sx={{ fontSize: 16 }} />,
//   "Government Subsidy": <AccountBalanceIcon sx={{ fontSize: 16 }} />,
//   "Insurance Facilitation": <LocalHospitalIcon sx={{ fontSize: 16 }} />,
// };

// // ─── Styled Subcomponents ─────────────────────────────────────────────────────

// const GlassCard = styled(Box)(({ theme }) => ({
//   background: COLORS.surface,
//   borderRadius: 16,
//   border: `1px solid ${COLORS.border}`,
//   boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)",
//   overflow: "hidden",
// }));

// // ─── Eligibility Logic ────────────────────────────────────────────────────────

// function getEligibleSchemes(
//   income: string,
//   category: string,
//   hasAyushman: string,
//   hasInsurance: string,
// ) {
//   const schemes: { name: string; note: string }[] = [];

//   if (hasAyushman === "Yes")
//     schemes.push({
//       name: "PM-JAY / Ayushman Bharat",
//       note: "Up to ₹5 Lakh coverage",
//     });
//   if (category === "BPL" || category === "EWS")
//     schemes.push({
//       name: "Government Subsidy",
//       note: "Eligible for state aid",
//     });
//   if (income === "Below ₹50,000")
//     schemes.push({
//       name: "Hospital Charity Fund",
//       note: "Up to 80% discount possible",
//     });
//   if (hasInsurance === "Yes")
//     schemes.push({
//       name: "Insurance Facilitation",
//       note: "Claim assistance available",
//     });
//   schemes.push({ name: "NGO Support", note: "Subject to availability" });

//   return schemes;
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// // ─── Main Component ───────────────────────────────────────────────────────────

// export default function PatientPortalFinancialAssistancePage() {
//   const [activeStep, setActiveStep] = React.useState(0);
//   const [isCalculated, setIsCalculated] = React.useState(false);

//   // Form State
//   const [patientId, setPatientId] = React.useState("P-20241101");
//   const [patientName, setPatientName] = React.useState("Rahul Sharma");
//   const [mobile, setMobile] = React.useState("+91 9876543210");
//   const [department, setDepartment] = React.useState("Oncology");

//   const [billNo, setBillNo] = React.useState("INV-2024-0381");
//   const [billAmount, setBillAmount] = React.useState(85000);
//   const [admissionType, setAdmissionType] = React.useState("IPD");

//   const [assistanceType, setAssistanceType] =
//     React.useState("Government Scheme");
//   const [schemeName, setSchemeName] = React.useState(
//     "Ayushman Bharat (PM-JAY)",
//   );
//   const [requestedAmount, setRequestedAmount] = React.useState(60000);
//   const [priority, setPriority] = React.useState("High");
//   const [reason, setReason] = React.useState(
//     "Patient is suffering from Stage 3 cancer. Family income is below ₹20,000/month. Unable to afford full treatment cost. Requesting financial assistance under PM-JAY scheme.",
//   );

//   const [income, setIncome] = React.useState("Above ₹1 Lakh");
//   const [category, setCategory] = React.useState("APL");
//   const [hasAyushman, setHasAyushman] = React.useState("No");
//   const [hasInsurance, setHasInsurance] = React.useState("Yes");

//   const eligibleSchemes = React.useMemo(
//     () => getEligibleSchemes(income, category, hasAyushman, hasInsurance),
//     [income, category, hasAyushman, hasInsurance],
//   );

//   const handleNext = () => setActiveStep((prev) => prev + 1);
//   const handleBack = () => setActiveStep((prev) => prev - 1);

//   const renderStepContent = (step: number) => {
//     switch (step) {
//       case 0:
//         return (
//           <Stack spacing={3}>
//             {/* ── Info Banner ── */}
//             <Box
//               sx={{
//                 p: 2,
//                 borderRadius: "12px",
//                 display: "flex",
//                 gap: 1.5,
//                 alignItems: "flex-start",
//                 background: `linear-gradient(135deg, ${COLORS.accentMuted} 0%, ${alpha(COLORS.accent, 0.05)} 100%)`,
//                 border: `1px solid ${alpha(COLORS.accent, 0.2)}`,
//               }}
//             >
//               <InfoIcon
//                 sx={{
//                   color: COLORS.accent,
//                   mt: 0.1,
//                   flexShrink: 0,
//                   fontSize: 20,
//                 }}
//               />
//               <Typography
//                 sx={{
//                   fontSize: 13,
//                   color: COLORS.accentDark,
//                   fontWeight: 500,
//                   fontFamily: "'DM Sans', sans-serif",
//                   lineHeight: 1.6,
//                 }}
//               >
//                 Financial assistance is available for patients facing economic
//                 hardship. Apply for{" "}
//                 <strong style={{ fontWeight: 700 }}>
//                   Discount, Ayushman Bharat / PM-JAY, Charity Fund, Insurance
//                   Support, or NGO Aid.
//                 </strong>
//               </Typography>
//             </Box>

//             {/* ── Step 1 — Eligibility Form ── */}
//             <GlassCard>
//               <Box
//                 sx={{
//                   px: 3,
//                   py: 2,
//                   borderBottom: `1px solid ${COLORS.border}`,
//                   background: `linear-gradient(90deg, ${COLORS.bg} 0%, ${COLORS.accentMuted} 100%)`,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 1,
//                 }}
//               >
//                 <Typography
//                   sx={{
//                     fontSize: 14,
//                     fontWeight: 700,
//                     color: COLORS.accentDark,
//                   }}
//                 >
//                   Step 1 — Eligibility Checker
//                 </Typography>
//                 <Chip
//                   label="Required"
//                   size="small"
//                   sx={{
//                     ml: "auto",
//                     fontSize: 11,
//                     bgcolor: COLORS.accentMuted,
//                     color: COLORS.accent,
//                     fontWeight: 600,
//                   }}
//                 />
//               </Box>

//               <Box sx={{ p: 3 }}>
//                 <Grid container spacing={2.5} mb={3}>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       label="Patient ID *"
//                       value={patientId}
//                       onChange={(e) => setPatientId(e.target.value)}
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       label="Full Name *"
//                       value={patientName}
//                       onChange={(e) => setPatientName(e.target.value)}
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       label="Monthly Family Income (₹)"
//                       value={income}
//                       onChange={(e) => setIncome(e.target.value)}
//                     >
//                       {INCOME_OPTIONS.map((opt) => (
//                         <MenuItem key={opt} value={opt}>
//                           {opt}
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       label="Category"
//                       value={category}
//                       onChange={(e) => setCategory(e.target.value)}
//                     >
//                       {CATEGORY_OPTIONS.map((opt) => (
//                         <MenuItem key={opt} value={opt}>
//                           {opt}
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       label="Ayushman Bharat / PM-JAY Card?"
//                       value={hasAyushman}
//                       onChange={(e) => setHasAyushman(e.target.value)}
//                     >
//                       {BINARY_OPTIONS.map((opt) => (
//                         <MenuItem key={opt} value={opt}>
//                           {opt}
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       label="Health Insurance?"
//                       value={hasInsurance}
//                       onChange={(e) => setHasInsurance(e.target.value)}
//                     >
//                       {BINARY_OPTIONS.map((opt) => (
//                         <MenuItem key={opt} value={opt}>
//                           {opt}
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                   </Grid>
//                 </Grid>

//                 <Button
//                   variant="contained"
//                   onClick={() => setIsCalculated(true)}
//                   endIcon={<ArrowForwardIcon />}
//                   sx={{
//                     borderRadius: "10px",
//                     px: 3.5,
//                     py: 1.2,
//                     fontWeight: 700,
//                     textTransform: "none",
//                   }}
//                 >
//                   Check Eligibility
//                 </Button>
//               </Box>
//             </GlassCard>

//             {isCalculated && (
//               <GlassCard
//                 sx={{
//                   border: `1px solid ${alpha(COLORS.accent, 0.3)}`,
//                   background: `linear-gradient(135deg, ${COLORS.bg} 0%, ${COLORS.accentMuted} 100%)`,
//                 }}
//               >
//                 <Box
//                   sx={{
//                     px: 3,
//                     py: 2,
//                     borderBottom: `1px solid ${alpha(COLORS.accent, 0.2)}`,
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 1,
//                   }}
//                 >
//                   <CheckCircleIcon
//                     sx={{ color: COLORS.accent, fontSize: 20 }}
//                   />
//                   <Typography
//                     sx={{
//                       fontSize: 14,
//                       fontWeight: 700,
//                       color: COLORS.accentDark,
//                     }}
//                   >
//                     Eligibility Result
//                   </Typography>
//                   <Chip
//                     label={`${eligibleSchemes.length} Schemes Found`}
//                     size="small"
//                     sx={{
//                       ml: "auto",
//                       bgcolor: COLORS.accent,
//                       color: "#fff",
//                       fontWeight: 700,
//                     }}
//                   />
//                 </Box>
//                 <Box sx={{ p: 3 }}>
//                   <Typography
//                     sx={{ fontSize: 13, color: COLORS.accent, mb: 2 }}
//                   >
//                     Based on the information provided, you are eligible for:
//                   </Typography>
//                   <Stack spacing={1.5}>
//                     {eligibleSchemes.map((scheme) => (
//                       <Box
//                         key={scheme.name}
//                         sx={{
//                           display: "flex",
//                           alignItems: "center",
//                           gap: 1.5,
//                           p: 1.5,
//                           borderRadius: "10px",
//                           background: COLORS.surface,
//                           border: `1px solid ${COLORS.accentMuted}`,
//                           boxShadow: `0 1px 3px ${alpha(COLORS.accent, 0.06)}`,
//                         }}
//                       >
//                         <Box
//                           sx={{
//                             width: 32,
//                             height: 32,
//                             borderRadius: "8px",
//                             bgcolor: COLORS.bg,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             color: COLORS.accent,
//                             flexShrink: 0,
//                           }}
//                         >
//                           {SCHEME_ICONS[scheme.name] ?? (
//                             <CheckCircleIcon sx={{ fontSize: 16 }} />
//                           )}
//                         </Box>
//                         <Box>
//                           <Typography
//                             sx={{
//                               fontSize: 13,
//                               fontWeight: 700,
//                               color: COLORS.accentDark,
//                             }}
//                           >
//                             {scheme.name}
//                           </Typography>
//                           <Typography
//                             sx={{ fontSize: 12, color: COLORS.textSecondary }}
//                           >
//                             {scheme.note}
//                           </Typography>
//                         </Box>
//                         <Chip
//                           label="Eligible"
//                           size="small"
//                           sx={{
//                             ml: "auto",
//                             fontSize: 11,
//                             bgcolor: COLORS.accentMuted,
//                             color: COLORS.accent,
//                             fontWeight: 700,
//                           }}
//                         />
//                       </Box>
//                     ))}
//                   </Stack>
//                 </Box>
//               </GlassCard>
//             )}

//             {isCalculated && (
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "flex-end",
//                   pt: 1,
//                   pb: 4,
//                 }}
//               >
//                 <Button
//                   variant="contained"
//                   onClick={handleNext}
//                   endIcon={<ArrowForwardIcon />}
//                   sx={{
//                     borderRadius: "10px",
//                     px: 4,
//                     py: 1.3,
//                     fontWeight: 700,
//                     textTransform: "none",
//                   }}
//                 >
//                   Continue → Fill Application
//                 </Button>
//               </Box>
//             )}
//           </Stack>
//         );

//       case 1:
//         return (
//           <Stack spacing={3}>
//             <GlassCard>
//               <Box
//                 sx={{
//                   px: 3,
//                   py: 2,
//                   borderBottom: `1px solid ${COLORS.border}`,
//                   background: `linear-gradient(90deg, ${COLORS.bg} 0%, ${COLORS.accentMuted} 100%)`,
//                 }}
//               >
//                 <Typography
//                   sx={{
//                     fontSize: 14,
//                     fontWeight: 700,
//                     color: COLORS.accentDark,
//                   }}
//                 >
//                   Step 2 — Patient & Bill Details
//                 </Typography>
//               </Box>
//               <Box sx={{ p: 3 }}>
//                 <Typography
//                   sx={{
//                     fontSize: 11,
//                     fontWeight: 800,
//                     color: COLORS.textMuted,
//                     mb: 2,
//                     letterSpacing: 1,
//                   }}
//                 >
//                   PATIENT INFORMATION
//                 </Typography>
//                 <Grid container spacing={2} mb={3}>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       label="Patient Name *"
//                       value={patientName}
//                       onChange={(e) => setPatientName(e.target.value)}
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       label="Patient ID *"
//                       value={patientId}
//                       onChange={(e) => setPatientId(e.target.value)}
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       label="Mobile Number *"
//                       value={mobile}
//                       onChange={(e) => setMobile(e.target.value)}
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       label="Ward / Department"
//                       value={department}
//                       onChange={(e) => setDepartment(e.target.value)}
//                     >
//                       <MenuItem value="Oncology">Oncology</MenuItem>
//                       <MenuItem value="Cardiology">Cardiology</MenuItem>
//                     </TextField>
//                   </Grid>
//                 </Grid>

//                 <Typography
//                   sx={{
//                     fontSize: 11,
//                     fontWeight: 800,
//                     color: COLORS.textMuted,
//                     mb: 2,
//                     letterSpacing: 1,
//                   }}
//                 >
//                   BILL INFORMATION
//                 </Typography>
//                 <Grid container spacing={2} mb={3}>
//                   <Grid item xs={12} sm={4}>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       label="Bill Reference No. *"
//                       value={billNo}
//                       onChange={(e) => setBillNo(e.target.value)}
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={4}>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       type="number"
//                       label="Total Bill Amount (₹) *"
//                       value={billAmount}
//                       onChange={(e) => setBillAmount(Number(e.target.value))}
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={4}>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       label="Admission Type"
//                       value={admissionType}
//                       onChange={(e) => setAdmissionType(e.target.value)}
//                     >
//                       <MenuItem value="IPD">IPD</MenuItem>
//                       <MenuItem value="OPD">OPD</MenuItem>
//                     </TextField>
//                   </Grid>
//                 </Grid>

//                 <Typography
//                   sx={{
//                     fontSize: 11,
//                     fontWeight: 800,
//                     color: COLORS.textMuted,
//                     mb: 2,
//                     letterSpacing: 1,
//                   }}
//                 >
//                   ASSISTANCE REQUEST
//                 </Typography>
//                 <Grid container spacing={2} mb={3}>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       label="Type of Assistance *"
//                       value={assistanceType}
//                       onChange={(e) => setAssistanceType(e.target.value)}
//                     >
//                       <MenuItem value="Government Scheme">
//                         <Stack direction="row" spacing={1} alignItems="center">
//                           <AccountBalanceIcon
//                             sx={{ fontSize: 18, color: COLORS.accent }}
//                           />
//                           <Typography sx={{ fontSize: 13 }}>
//                             Government Scheme
//                           </Typography>
//                         </Stack>
//                       </MenuItem>
//                       <MenuItem value="Charity Fund">
//                         <Stack direction="row" spacing={1} alignItems="center">
//                           <BusinessIcon
//                             sx={{ fontSize: 18, color: COLORS.accent }}
//                           />
//                           <Typography sx={{ fontSize: 13 }}>
//                             Charity Fund
//                           </Typography>
//                         </Stack>
//                       </MenuItem>
//                       <MenuItem value="Discount Request">
//                         <Stack direction="row" spacing={1} alignItems="center">
//                           <MonetizationOnIcon
//                             sx={{ fontSize: 18, color: COLORS.accent }}
//                           />
//                           <Typography sx={{ fontSize: 13 }}>
//                             Discount Request
//                           </Typography>
//                         </Stack>
//                       </MenuItem>
//                       <MenuItem value="NGO Support">
//                         <Stack direction="row" spacing={1} alignItems="center">
//                           <VolunteerActivismIcon
//                             sx={{ fontSize: 18, color: COLORS.accent }}
//                           />
//                           <Typography sx={{ fontSize: 13 }}>
//                             NGO Support
//                           </Typography>
//                         </Stack>
//                       </MenuItem>
//                       <MenuItem value="Insurance Claim">
//                         <Stack direction="row" spacing={1} alignItems="center">
//                           <DescriptionIcon
//                             sx={{ fontSize: 18, color: COLORS.accent }}
//                           />
//                           <Typography sx={{ fontSize: 13 }}>
//                             Insurance Claim
//                           </Typography>
//                         </Stack>
//                       </MenuItem>
//                     </TextField>
//                   </Grid>

//                   {assistanceType === "Government Scheme" && (
//                     <Grid item xs={12} sm={6}>
//                       <TextField
//                         select
//                         fullWidth
//                         size="small"
//                         label="Government Scheme"
//                         value={schemeName}
//                         onChange={(e) => setSchemeName(e.target.value)}
//                       >
//                         <MenuItem value="Ayushman Bharat (PM-JAY)">
//                           Ayushman Bharat (PM-JAY)
//                         </MenuItem>
//                         <MenuItem value="State Health Scheme">
//                           State Health Scheme
//                         </MenuItem>
//                       </TextField>
//                     </Grid>
//                   )}
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       type="number"
//                       label="Requested Assistance Amount (₹) *"
//                       value={requestedAmount}
//                       onChange={(e) =>
//                         setRequestedAmount(Number(e.target.value))
//                       }
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       label="Priority"
//                       value={priority}
//                       onChange={(e) => setPriority(e.target.value)}
//                     >
//                       <MenuItem value="High">High</MenuItem>
//                       <MenuItem value="Normal">Normal</MenuItem>
//                     </TextField>
//                   </Grid>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       multiline
//                       rows={3}
//                       label="Reason for Request *"
//                       value={reason}
//                       onChange={(e) => setReason(e.target.value)}
//                     />
//                   </Grid>
//                 </Grid>

//                 <Box
//                   sx={{
//                     bgcolor: COLORS.bg,
//                     p: 2,
//                     borderRadius: 2,
//                     border: `1px solid ${alpha(COLORS.accent, 0.1)}`,
//                   }}
//                 >
//                   <Stack spacing={1}>
//                     <Box
//                       sx={{ display: "flex", justifyContent: "space-between" }}
//                     >
//                       <Typography
//                         sx={{ fontSize: 13, color: COLORS.textSecondary }}
//                       >
//                         Total Bill Amount
//                       </Typography>
//                       <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
//                         ₹{billAmount.toLocaleString()}
//                       </Typography>
//                     </Box>
//                     <Box
//                       sx={{ display: "flex", justifyContent: "space-between" }}
//                     >
//                       <Typography
//                         sx={{ fontSize: 13, color: COLORS.textSecondary }}
//                       >
//                         Requested Assistance
//                       </Typography>
//                       <Typography
//                         sx={{
//                           fontSize: 13,
//                           fontWeight: 700,
//                           color: "error.main",
//                         }}
//                       >
//                         - ₹{requestedAmount.toLocaleString()}
//                       </Typography>
//                     </Box>
//                     <Divider sx={{ my: 0.5 }} />
//                     <Box
//                       sx={{ display: "flex", justifyContent: "space-between" }}
//                     >
//                       <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
//                         You Would Pay
//                       </Typography>
//                       <Typography
//                         sx={{
//                           fontSize: 18,
//                           fontWeight: 900,
//                           color: COLORS.accent,
//                         }}
//                       >
//                         ₹{(billAmount - requestedAmount).toLocaleString()}
//                       </Typography>
//                     </Box>
//                   </Stack>
//                 </Box>
//               </Box>
//             </GlassCard>
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "flex-end",
//                 gap: 2,
//                 pb: 4,
//               }}
//             >
//               <Button
//                 onClick={handleBack}
//                 startIcon={<ArrowBackIcon />}
//                 sx={{ textTransform: "none", color: COLORS.textSecondary }}
//               >
//                 Back
//               </Button>
//               <Button
//                 variant="contained"
//                 onClick={handleNext}
//                 sx={{
//                   textTransform: "none",
//                   borderRadius: 2,
//                 }}
//               >
//                 Next → Upload Documents
//               </Button>
//             </Box>
//           </Stack>
//         );

//       case 2:
//         return (
//           <Stack spacing={3}>
//             <GlassCard>
//               <Box
//                 sx={{
//                   px: 3,
//                   py: 2,
//                   borderBottom: `1px solid ${COLORS.border}`,
//                   background: `linear-gradient(90deg, ${COLORS.bg} 0%, ${COLORS.accentMuted} 100%)`,
//                 }}
//               >
//                 <Typography
//                   sx={{
//                     fontSize: 14,
//                     fontWeight: 700,
//                     color: COLORS.accentDark,
//                   }}
//                 >
//                   Step 3 — Upload Documents
//                 </Typography>
//               </Box>
//               <Box sx={{ p: 3 }}>
//                 <Box
//                   sx={{
//                     p: 2,
//                     bgcolor: "#FFFBEB",
//                     border: "1px solid #FDE68A",
//                     borderRadius: 2,
//                     display: "flex",
//                     gap: 1,
//                     mb: 3,
//                   }}
//                 >
//                   <InfoIcon sx={{ color: "#D97706", fontSize: 18 }} />
//                   <Typography sx={{ fontSize: 12, color: "#92400E" }}>
//                     Upload clear, readable copies. Accepted formats: PDF, JPG,
//                     PNG. Max 5MB each.
//                   </Typography>
//                 </Box>

//                 <Stack spacing={2.5}>
//                   {[
//                     "Aadhar Card / ID Proof *",
//                     "Ayushman / Govt. Scheme Card",
//                     "Income Certificate / BPL Card",
//                   ].map((label, idx) => (
//                     <Box key={label}>
//                       <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1 }}>
//                         {label}
//                       </Typography>
//                       <Box
//                         sx={{
//                           display: "flex",
//                           alignItems: "center",
//                           gap: 2,
//                           p: 1.5,
//                           border: "1px dashed #CBD5E1",
//                           borderRadius: 2,
//                           bgcolor: COLORS.bg,
//                         }}
//                       >
//                         <Button
//                           size="small"
//                           variant="outlined"
//                           sx={{ textTransform: "none" }}
//                         >
//                           Browse...
//                         </Button>
//                         <Typography
//                           sx={{ fontSize: 12, color: COLORS.textSecondary }}
//                         >
//                           No file selected.
//                         </Typography>
//                       </Box>
//                       {idx === 0 && (
//                         <Box
//                           sx={{
//                             mt: 1,
//                             p: 1,
//                             px: 2,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "space-between",
//                             bgcolor: COLORS.surface,
//                             border: `1px solid ${COLORS.border}`,
//                             borderRadius: 1.5,
//                           }}
//                         >
//                           <Stack
//                             direction="row"
//                             spacing={1}
//                             alignItems="center"
//                           >
//                             <DescriptionIcon
//                               sx={{ fontSize: 16, color: COLORS.accent }}
//                             />
//                             <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
//                               aadhar_rahul.pdf
//                             </Typography>
//                           </Stack>
//                           <Stack
//                             direction="row"
//                             spacing={1}
//                             alignItems="center"
//                           >
//                             <Typography
//                               sx={{ fontSize: 11, color: COLORS.textMuted }}
//                             >
//                               320 KB
//                             </Typography>
//                             <Chip
//                               label="Uploaded"
//                               size="small"
//                               sx={{
//                                 height: 20,
//                                 fontSize: 10,
//                                 bgcolor: alpha(COLORS.accent, 0.1),
//                                 color: COLORS.accent,
//                                 fontWeight: 700,
//                               }}
//                             />
//                           </Stack>
//                         </Box>
//                       )}
//                     </Box>
//                   ))}

//                   <Box>
//                     <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1 }}>
//                       Medical Reports / Discharge Summary (optional)
//                     </Typography>
//                     <Box
//                       sx={{
//                         height: 120,
//                         border: `2px dashed ${alpha(COLORS.accent, 0.2)}`,
//                         borderRadius: 2,
//                         bgcolor: alpha(COLORS.accent, 0.02),
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         cursor: "pointer",
//                         "&:hover": { bgcolor: alpha(COLORS.accent, 0.04) },
//                       }}
//                     >
//                       <CloudUploadIcon
//                         sx={{
//                           fontSize: 32,
//                           color: alpha(COLORS.accent, 0.4),
//                           mb: 1,
//                         }}
//                       />
//                       <Typography
//                         sx={{
//                           fontSize: 13,
//                           color: COLORS.accent,
//                           fontWeight: 600,
//                         }}
//                       >
//                         Click to upload or drag files here
//                       </Typography>
//                       <Typography
//                         sx={{ fontSize: 11, color: COLORS.textMuted }}
//                       >
//                         PDF, JPG, PNG up to 5MB
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </Stack>
//               </Box>
//             </GlassCard>
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "flex-end",
//                 gap: 2,
//                 pb: 4,
//               }}
//             >
//               <Button
//                 onClick={handleBack}
//                 startIcon={<ArrowBackIcon />}
//                 sx={{ textTransform: "none", color: COLORS.textSecondary }}
//               >
//                 Back
//               </Button>
//               <Button
//                 variant="contained"
//                 onClick={handleNext}
//                 sx={{
//                   textTransform: "none",
//                   borderRadius: 2,
//                 }}
//               >
//                 Next → Review Application
//               </Button>
//             </Box>
//           </Stack>
//         );

//       case 3:
//         return (
//           <Stack spacing={3}>
//             <GlassCard>
//               <Box
//                 sx={{
//                   px: 3,
//                   py: 2,
//                   borderBottom: `1px solid ${COLORS.border}`,
//                   background: `linear-gradient(90deg, ${COLORS.bg} 0%, ${COLORS.accentMuted} 100%)`,
//                 }}
//               >
//                 <Typography
//                   sx={{
//                     fontSize: 14,
//                     fontWeight: 700,
//                     color: COLORS.accentDark,
//                   }}
//                 >
//                   Step 4 — Review & Submit
//                 </Typography>
//               </Box>
//               <Box sx={{ p: 3 }}>
//                 <Typography
//                   sx={{
//                     fontSize: 11,
//                     fontWeight: 800,
//                     color: COLORS.textMuted,
//                     mb: 2,
//                     letterSpacing: 1,
//                   }}
//                 >
//                   APPLICATION SUMMARY
//                 </Typography>
//                 <Grid container spacing={4} sx={{ mb: 4 }}>
//                   <Grid item xs={12} sm={6}>
//                     <Stack spacing={1.5}>
//                       <Box>
//                         <Typography
//                           sx={{ fontSize: 11, color: COLORS.textMuted }}
//                         >
//                           NAME
//                         </Typography>
//                         <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
//                           {patientName}
//                         </Typography>
//                       </Box>
//                       <Box>
//                         <Typography
//                           sx={{ fontSize: 11, color: COLORS.textMuted }}
//                         >
//                           DEPARTMENT
//                         </Typography>
//                         <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
//                           {department}
//                         </Typography>
//                       </Box>
//                       <Box>
//                         <Typography
//                           sx={{ fontSize: 11, color: COLORS.textMuted }}
//                         >
//                           BILL NO.
//                         </Typography>
//                         <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
//                           {billNo}
//                         </Typography>
//                       </Box>
//                     </Stack>
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <Stack spacing={1.5}>
//                       <Box>
//                         <Typography
//                           sx={{ fontSize: 11, color: COLORS.textMuted }}
//                         >
//                           PATIENT ID
//                         </Typography>
//                         <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
//                           {patientId}
//                         </Typography>
//                       </Box>
//                       <Box>
//                         <Typography
//                           sx={{ fontSize: 11, color: COLORS.textMuted }}
//                         >
//                           MOBILE
//                         </Typography>
//                         <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
//                           {mobile}
//                         </Typography>
//                       </Box>
//                       <Box>
//                         <Typography
//                           sx={{ fontSize: 11, color: COLORS.textMuted }}
//                         >
//                           BILL AMOUNT
//                         </Typography>
//                         <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
//                           ₹{billAmount.toLocaleString()}
//                         </Typography>
//                       </Box>
//                     </Stack>
//                   </Grid>
//                 </Grid>

//                 <Grid container spacing={4} sx={{ mb: 4 }}>
//                   <Grid item xs={12} sm={6}>
//                     <Stack spacing={1.5}>
//                       <Box>
//                         <Typography
//                           sx={{ fontSize: 11, color: COLORS.textMuted }}
//                         >
//                           ASSISTANCE TYPE
//                         </Typography>
//                         <Chip
//                           size="small"
//                           label={assistanceType}
//                           sx={{
//                             bgcolor: alpha(COLORS.accent, 0.1),
//                             color: COLORS.accent,
//                             fontWeight: 700,
//                             height: 22,
//                           }}
//                         />
//                       </Box>
//                       <Box>
//                         <Typography
//                           sx={{ fontSize: 11, color: COLORS.textMuted }}
//                         >
//                           REQUESTED AMOUNT
//                         </Typography>
//                         <Typography
//                           sx={{
//                             fontSize: 14,
//                             fontWeight: 800,
//                             color: "error.main",
//                           }}
//                         >
//                           ₹{requestedAmount.toLocaleString()}
//                         </Typography>
//                       </Box>
//                     </Stack>
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <Stack spacing={1.5}>
//                       <Box>
//                         <Typography
//                           sx={{ fontSize: 11, color: COLORS.textMuted }}
//                         >
//                           SCHEME
//                         </Typography>
//                         <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
//                           {schemeName}
//                         </Typography>
//                       </Box>
//                       <Box>
//                         <Typography
//                           sx={{ fontSize: 11, color: COLORS.textMuted }}
//                         >
//                           YOU PAY
//                         </Typography>
//                         <Typography
//                           sx={{
//                             fontSize: 16,
//                             fontWeight: 900,
//                             color: COLORS.accent,
//                           }}
//                         >
//                           ₹{(billAmount - requestedAmount).toLocaleString()}
//                         </Typography>
//                       </Box>
//                     </Stack>
//                   </Grid>
//                 </Grid>

//                 <Box
//                   sx={{
//                     p: 2,
//                     bgcolor: COLORS.bg,
//                     borderRadius: 2,
//                     border: `1px solid ${COLORS.border}`,
//                     mb: 4,
//                   }}
//                 >
//                   <Typography
//                     sx={{ fontSize: 11, color: COLORS.textMuted, mb: 1 }}
//                   >
//                     REASON
//                   </Typography>
//                   <Typography
//                     sx={{ fontSize: 12, lineHeight: 1.6, fontStyle: "italic" }}
//                   >
//                     "{reason}"
//                   </Typography>
//                 </Box>

//                 <Typography
//                   sx={{
//                     fontSize: 11,
//                     fontWeight: 800,
//                     color: COLORS.textMuted,
//                     mb: 2,
//                     letterSpacing: 1,
//                   }}
//                 >
//                   DOCUMENTS (3 UPLOADED)
//                 </Typography>
//                 <Stack spacing={1} mb={4}>
//                   {[
//                     "aadhar_rahul.pdf",
//                     "ayushman_card.jpg",
//                     "income_cert.pdf",
//                   ].map((file) => (
//                     <Box
//                       key={file}
//                       sx={{
//                         p: 1,
//                         px: 2,
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "space-between",
//                         bgcolor: COLORS.surface,
//                         border: `1px solid ${COLORS.border}`,
//                         borderRadius: 1.5,
//                       }}
//                     >
//                       <Stack direction="row" spacing={1} alignItems="center">
//                         <DescriptionIcon
//                           sx={{ fontSize: 16, color: COLORS.accentMuted }}
//                         />
//                         <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
//                           {file}
//                         </Typography>
//                       </Stack>
//                       <Typography
//                         sx={{
//                           fontSize: 10,
//                           color: "#15803D",
//                           fontWeight: 700,
//                         }}
//                       >
//                         ✓ Ready
//                       </Typography>
//                     </Box>
//                   ))}
//                 </Stack>

//                 <Typography
//                   sx={{
//                     fontSize: 11,
//                     fontWeight: 800,
//                     color: COLORS.textMuted,
//                     mb: 2,
//                     letterSpacing: 1,
//                   }}
//                 >
//                   APPROVAL FLOW AFTER SUBMISSION
//                 </Typography>
//                 <Stack spacing={2} sx={{ pl: 2, position: "relative" }}>
//                   {[
//                     {
//                       label: "Application Submitted",
//                       sub: "By you — now",
//                       icon: <CheckCircleIcon />,
//                       color: "#15803D",
//                     },
//                     {
//                       label: "Doctor / HOD Review",
//                       sub: "Oncology Department — within 24 hrs",
//                       icon: <AssignmentIndIcon />,
//                       color: COLORS.textMuted,
//                     },
//                     {
//                       label: "Finance Team Review",
//                       sub: "Hospital Finance Dept.",
//                       icon: <AccountBalanceIcon />,
//                       color: COLORS.textMuted,
//                     },
//                     {
//                       label: "Final Approval & Discount Applied",
//                       sub: "Admin / Finance Head",
//                       icon: <VerifiedUserIcon />,
//                       color: COLORS.textMuted,
//                     },
//                   ].map((item, i) => (
//                     <Stack
//                       key={item.label}
//                       direction="row"
//                       spacing={2}
//                       alignItems="center"
//                     >
//                       <Box
//                         sx={{
//                           width: 32,
//                           height: 32,
//                           borderRadius: "50%",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           bgcolor:
//                             i === 0
//                               ? alpha(item.color as string, 0.1)
//                               : COLORS.bg,
//                           color: i === 0 ? item.color : COLORS.textMuted,
//                           border: `1px solid ${i === 0 ? item.color : COLORS.border}`,
//                         }}
//                       >
//                         {React.cloneElement(item.icon as React.ReactElement, {
//                           sx: { fontSize: 18 },
//                         })}
//                       </Box>
//                       <Box>
//                         <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
//                           {item.label}
//                         </Typography>
//                         <Typography
//                           sx={{ fontSize: 11, color: COLORS.textMuted }}
//                         >
//                           {item.sub}
//                         </Typography>
//                       </Box>
//                     </Stack>
//                   ))}
//                 </Stack>
//               </Box>
//             </GlassCard>
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "flex-end",
//                 gap: 2,
//                 pb: 4,
//               }}
//             >
//               <Button
//                 onClick={handleBack}
//                 startIcon={<ArrowBackIcon />}
//                 sx={{ textTransform: "none", color: COLORS.textSecondary }}
//               >
//                 Back
//               </Button>
//               <Button
//                 variant="contained"
//                 onClick={handleNext}
//                 sx={{
//                   // background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
//                   textTransform: "none",
//                   borderRadius: 2,
//                 }}
//               >
//                 ✓ Submit Application
//               </Button>
//             </Box>
//           </Stack>
//         );

//       case 4:
//         return (
//           <Stack spacing={3}>
//             <GlassCard
//               sx={{
//                 p: 4,
//                 textAlign: "center",
//                 borderTop: `4px solid ${alpha(COLORS.accent, 0.5)}`,
//               }}
//             >
//               <Typography
//                 sx={{
//                   fontSize: 24,
//                   fontWeight: 900,
//                   color: COLORS.textPrimary,
//                 }}
//               >
//                 Application Submitted!
//               </Typography>
//               <Typography sx={{ fontSize: 13, color: COLORS.textSecondary }}>
//                 Track your financial assistance request live
//               </Typography>
//               <Box
//                 sx={{
//                   mt: 3,
//                   p: 2,
//                   bgcolor: "#F0FDF4",
//                   border: "1px solid #BBF7D0",
//                   borderRadius: 2,
//                   display: "flex",
//                   gap: 1.5,
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <CheckCircleIcon sx={{ color: "#16A34A", fontSize: 18 }} />
//                 <Typography sx={{ fontSize: 12, color: "#166534" }}>
//                   FAR-009 submitted successfully! You will receive SMS/WhatsApp
//                   updates on +91 9876543210 as your application progresses.
//                 </Typography>
//               </Box>
//             </GlassCard>

//             <Grid container spacing={2}>
//               {[
//                 { label: "REQUEST ID", value: "FAR-009" },
//                 { label: "BILL AMOUNT", value: "₹85,000" },
//                 { label: "REQUESTED", value: "₹60,000", color: "error.main" },
//                 {
//                   label: "YOU PAY (IF APPROVED)",
//                   value: "₹25,000",
//                   color: COLORS.accent,
//                 },
//               ].map((item) => (
//                 <Grid item xs={3} key={item.label}>
//                   <Box
//                     sx={{
//                       p: 2,
//                       bgcolor: COLORS.surface,
//                       border: `1px solid ${COLORS.border}`,
//                       borderRadius: 2,
//                     }}
//                   >
//                     <Typography
//                       sx={{
//                         fontSize: 10,
//                         color: COLORS.textMuted,
//                         fontWeight: 800,
//                         mb: 0.5,
//                       }}
//                     >
//                       {item.label}
//                     </Typography>
//                     <Typography
//                       sx={{ fontSize: 16, fontWeight: 800, color: item.color }}
//                     >
//                       {item.value}
//                     </Typography>
//                   </Box>
//                 </Grid>
//               ))}
//             </Grid>

//             <GlassCard p={3}>
//               <Box sx={{ p: 3 }}>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     mb: 4,
//                   }}
//                 >
//                   <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
//                     Live Application Tracker
//                   </Typography>
//                   <Chip
//                     label="⌛ Under Review"
//                     size="small"
//                     sx={{
//                       bgcolor: "#FEF3C7",
//                       color: "#92400E",
//                       fontSize: 11,
//                       fontWeight: 700,
//                     }}
//                   />
//                 </Box>

//                 <Box sx={{ position: "relative", px: 4, mb: 4 }}>
//                   <Box
//                     sx={{
//                       position: "absolute",
//                       top: 16,
//                       left: 40,
//                       right: 40,
//                       height: 2,
//                       bgcolor: COLORS.border,
//                     }}
//                   />
//                   <Stack
//                     direction="row"
//                     justifyContent="space-between"
//                     sx={{ position: "relative" }}
//                   >
//                     {[
//                       {
//                         label: "Submitted",
//                         date: "15 Mar 2025",
//                         status: "completed",
//                       },
//                       {
//                         label: "Doctor Review",
//                         status: "active",
//                         sub: "In Progress",
//                       },
//                       {
//                         label: "Finance Review",
//                         status: "pending",
//                         sub: "Pending",
//                       },
//                       {
//                         label: "Final Approval",
//                         status: "pending",
//                         sub: "Pending",
//                       },
//                       {
//                         label: "Discount Applied",
//                         status: "pending",
//                         sub: "Pending",
//                       },
//                     ].map((step, idx) => (
//                       <Stack
//                         key={step.label}
//                         alignItems="center"
//                         spacing={1.5}
//                         sx={{ minWidth: 80 }}
//                       >
//                         <Box
//                           sx={{
//                             width: 32,
//                             height: 32,
//                             borderRadius: "50%",
//                             bgcolor:
//                               step.status === "completed"
//                                 ? "#15803D"
//                                 : step.status === "active"
//                                   ? "#D97706"
//                                   : COLORS.surface,
//                             border: `2px solid ${step.status === "pending" ? COLORS.border : "transparent"}`,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             color: "#fff",
//                             boxShadow:
//                               step.status === "active"
//                                 ? "0 0 0 4px #FEF3C7"
//                                 : "none",
//                           }}
//                         >
//                           {step.status === "completed" ? (
//                             <CheckCircleIcon sx={{ fontSize: 18 }} />
//                           ) : step.status === "active" ? (
//                             <AssignmentIndIcon sx={{ fontSize: 18 }} />
//                           ) : (
//                             <Box
//                               sx={{
//                                 width: 8,
//                                 height: 8,
//                                 borderRadius: "50%",
//                                 bgcolor: COLORS.border,
//                               }}
//                             />
//                           )}
//                         </Box>
//                         <Box textAlign="center">
//                           <Typography sx={{ fontSize: 11, fontWeight: 700 }}>
//                             {step.label}
//                           </Typography>
//                           <Typography
//                             sx={{ fontSize: 10, color: COLORS.textMuted }}
//                           >
//                             {step.date || step.sub}
//                           </Typography>
//                         </Box>
//                       </Stack>
//                     ))}
//                   </Stack>
//                 </Box>

//                 <Box
//                   sx={{
//                     p: 1.5,
//                     bgcolor: alpha(COLORS.accent, 0.05),
//                     border: `1px solid ${alpha(COLORS.accent, 0.1)}`,
//                     borderRadius: 1.5,
//                     display: "flex",
//                     gap: 1.5,
//                     alignItems: "center",
//                   }}
//                 >
//                   <InfoIcon sx={{ fontSize: 16, color: COLORS.accent }} />
//                   <Typography sx={{ fontSize: 12 }}>
//                     You can check status anytime using your Patient ID
//                     P-20241101 or Request ID FAR-009. Expected response within
//                     2-3 working days.
//                   </Typography>
//                 </Box>
//               </Box>
//             </GlassCard>

//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "flex-end",
//                 gap: 2,
//                 pb: 4,
//               }}
//             >
//               <Button
//                 size="small"
//                 variant="outlined"
//                 sx={{ textTransform: "none" }}
//               >
//                 Apply Another
//               </Button>
//             </Box>
//           </Stack>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <Box
//       sx={{
//         fontFamily: "'DM Sans', sans-serif",
//         py: 4,
//         px: { xs: 2, md: 3 },
//         // bgcolor: COLORS.bg,
//         minHeight: "100vh",
//       }}
//     >
//       {/* ── Page Header ── */}
//       <Box sx={{ mb: 4 }}>
//         <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
//           <Box
//             sx={{
//               width: 40,
//               height: 40,
//               borderRadius: "10px",
//               background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <LocalHospitalIcon sx={{ color: "#fff", fontSize: 20 }} />
//           </Box>
//           <Box>
//             <Typography
//               sx={{
//                 fontSize: 22,
//                 fontWeight: 800,
//                 color: COLORS.textPrimary,
//                 letterSpacing: "-0.5px",
//                 lineHeight: 1.2,
//               }}
//             >
//               Financial Assistance
//             </Typography>
//             <Typography sx={{ fontSize: 13, color: COLORS.textSecondary }}>
//               {STEPS[activeStep]}
//             </Typography>
//           </Box>
//         </Stack>
//       </Box>

//       <Stack spacing={3}>
//         {/* ── Stepper ── */}
//         <GlassCard sx={{ p: 3 }}>
//           <Stepper
//             activeStep={activeStep}
//             alternativeLabel
//             connector={<BlueConnector />}
//           >
//             {STEPS.map((label, idx) => (
//               <Step key={label}>
//                 <StepLabel
//                   StepIconComponent={(props) => (
//                     <CustomStepIcon {...props} icon={idx + 1} />
//                   )}
//                 >
//                   <Typography
//                     sx={{
//                       fontSize: 11,
//                       fontWeight: activeStep === idx ? 700 : 500,
//                       color:
//                         activeStep === idx ? COLORS.accent : COLORS.textMuted,
//                       mt: 0.5,
//                     }}
//                   >
//                     {label}
//                   </Typography>
//                 </StepLabel>
//               </Step>
//             ))}
//           </Stepper>
//         </GlassCard>

//         {renderStepContent(activeStep)}
//       </Stack>
//     </Box>
//   );
// }
