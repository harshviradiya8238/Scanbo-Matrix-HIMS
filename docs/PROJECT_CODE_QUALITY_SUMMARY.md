# Project Code Quality Summary - Scanbo Matrix HIMS

This document provides a comprehensive analysis of the project's current code health, consistency, and identifies areas for improvement.

## 📊 1. High-Level Overview

The Scanbo Matrix HIMS project is a sophisticated React application built on Next.js. While the application is feature-rich and architecturally sound in its folder structure, there are emerging patterns that could lead to long-term technical debt if not addressed.

---

## 🔍 2. Key Findings

### 🧱 A. Modularity & Decomposition (God Components)

**Observation:** Several page components have grown exceptionally large.

- **Example:** `PatientProfilePage.tsx` is **4,600+ lines long**.
- **Impact:** This makes it extremely difficult to maintain, test, and debug. It contains UI, layout logic, data processing, and internal sub-components (like `Sparkline`) all in one file.
- **Verdict:** 🔴 **Critical Issue**

### 📋 B. Code Duplication

**Observation:** Shared logic is often copy-pasted across different screens instead of being centralized.

- **Example:** Basic utilities like `formatDate`, `formatLongDate`, and `getInitials` are redefined in multiple files (e.g., `DoctorProfilePage.tsx`, `PatientProfilePage.tsx`).
- **Impact:** Any change to the date format would require updates in multiple files, increasing the risk of bugs and inconsistencies.
- **Verdict:** 🟠 **Medium Priority**

### 🎨 C. UI Consistency & Theme Adherence

**Observation:** While a `CONSISTENCY_CHECKLIST.md` exists, it is frequently violated in the screen components.

- **Issue:** Hardcoded Hex colors (e.g., `#0891b2`, `#be123c`) are scattered throughout the codebase instead of using `theme.palette.*` tokens.
- **Observation:** Ad-hoc KPI cards and layouts are used instead of the standardized `StatTile` or `WorkspaceHeaderCard` in some legacy or rapidly developed pages.
- **Verdict:** 🟠 **Medium Priority**

### 🧪 D. Mock Data Management

**Observation:** Screen files contain massive blocks of hardcoded mock data or complex logic to generate it.

- **Impact:** Bloats the component files and makes it harder to transition to real API integrations later.
- **Verdict:** 🟡 **Low-to-Medium Priority**

### ♿ E. Accessibility (A11y)

**Observation:** Minimal usage of ARIA labels and consistent focus management.

- **Verdict:** 🟡 **Low Priority** (depending on requirements)

---

## 🛠️ 3. Recommendations for Improvement

### 1️⃣ Decompose "God Components"

Break down large screens into smaller, focused components:

- Move sub-components (e.g., `Sparkline`, `TabPanel`) to their own files in `src/screens/.../components/`.
- Move complex state logic into custom hooks (e.g., `usePatientProfile.ts`).

### 2️⃣ Centralize Shared Utilities

Create a `src/core/utils/` directory or expand `src/lib/` to house shared formatting and helper functions.

- **Priority:** Centralize `formatDate`, `formatCurrency`, `getInitials`.

### 3️⃣ Enforce Consistency Checklist

- Conduct a "Color Token Audit" to replace all hardcoded hex values with theme tokens.
- Use `CommonDataGrid` and `StatTile` strictly for all data-rich sections.
- Reference the `src/ui/components/CONSISTENCY_CHECKLIST.md` before every new UI task.

### 4️⃣ Decouple Mock Data

Ensure all mock data resides in `src/mocks/` and is accessed via hooks or service layers, rather than being defined locally in the `.tsx` files.

---

## ✅ 4. Final Verdict

The project has a solid foundation with a modern stack (Next.js, MUI, Redux Toolkit). However, it is currently in a state where **refactoring for modularity** is essential to prevent it from becoming unmanageable. Addressing the **4,600-line God Components** should be the #1 priority.

---

_Report generated on Mar 24, 2026_












// "use client";

// import * as React from "react";
// import PageTemplate from "@/src/ui/components/PageTemplate";
// import {
//   Box,
//   Button,
//   Paper,
//   Stack,
//   Typography,
//   TextField,
//   InputAdornment,
//   MenuItem,
//   Select,
//   Chip,
//   Divider,
//   IconButton,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   LinearProgress,
//   CircularProgress,
//   Tooltip,
//   Checkbox,
//   FormControlLabel,
//   Autocomplete,
//   FormGroup,
//   Switch,
//   Snackbar,
//   Alert,
//   Collapse,
//   Grid,
// } from "@/src/ui/components/atoms";
// import {
//   StatTile,
//   CommonTable,
//   CommonDialog,
//   WorkspaceHeaderCard,
// } from "@/src/ui/components/molecules";
// import { alpha, useTheme } from "@mui/material/styles";
// import {
//   ListAlt as ListIcon,
//   Search as SearchIcon,
//   Schedule as ScheduleIcon,
//   History as HistoryIcon,
//   FileDownload as FileDownloadIcon,
//   Print as PrintIcon,
//   Compare as CompareIcon,
//   Add as AddIcon,
//   ArrowDropUp as ArrowDropUpIcon,
//   ArrowDropDown as ArrowDropDownIcon,
//   CalendarToday as CalendarTodayIcon,
//   BarChart as BarChartIcon,
//   Assessment as AssessmentIcon,
//   ViewColumn as ViewColumnIcon,
//   VideoLabel as VideoLabelIcon,
//   Save as SaveIcon,
//   Refresh as RefreshIcon,
//   PlayArrow as PlayArrowIcon,
//   Star as StarIcon,
//   StarBorder as StarBorderIcon,
//   Share as ShareIcon,
//   ArrowRight as ArrowRightIcon,
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Tune as TuneIcon,
//   NotificationsNone as NotificationsNoneIcon,
//   KeyboardArrowDown as KeyboardArrowDownIcon,
//   CheckCircleOutline as CheckCircleOutlineIcon,
//   TrendingUp as TrendingUpIcon,
//   TrendingDown as TrendingDownIcon,
//   InfoOutlined as InfoOutlinedIcon,
//   AccessTime as AccessTimeIcon,
//   Circle as CircleIcon,
//   Link as LinkIcon,
//   ContentCopy as ContentCopyIcon,
//   Email as EmailIcon,
//   Groups as TeamsIcon,
//   WhatsApp as WhatsAppIcon,
//   DragHandle as MenuIcon,
//   Settings as SettingsIcon,
//   FilterList as FilterListIcon,
//   Close as CloseIcon,
//   Visibility as VisibilityIcon,
//   VisibilityOff as VisibilityOffIcon,
// } from "@mui/icons-material";

// // ── Design Tokens ─────────────────────────────────────────────────────────────

// const C = {
//   primary: "#1B6FBE",
//   primaryLight: "#EBF4FF",
//   primaryMid: "#D0E8FF",
//   primaryDark: "#0D4F8E",
//   success: "#0BA360",
//   successLight: "#E6F9EF",
//   warning: "#D4830A",
//   warningLight: "#FEF3E2",
//   danger: "#D63B3B",
//   dangerLight: "#FEECEC",
//   neutral50: "#F8FAFC",
//   neutral100: "#F1F5F9",
//   neutral200: "#E2E8F0",
//   neutral300: "#CBD5E1",
//   neutral400: "#94A3B8",
//   neutral500: "#64748B",
//   neutral600: "#475569",
//   neutral700: "#334155",
//   neutral800: "#1E293B",
//   neutral900: "#0F172A",
//   white: "#FFFFFF",
//   sidebarBg: "#F4F7FB",
// };

// const CARD_SX = {
//   borderRadius: 3,
//   border: "1px solid",
//   borderColor: "rgba(27, 111, 190, 0.12)",
//   bgcolor: "#FFFFFF",
//   boxShadow: "0 2px 8px rgba(27, 111, 190, 0.04)",
//   overflow: "hidden",
// };

// const TABLE_HEADER_SX = {
//   fontSize: "0.72rem",
//   fontWeight: 700,
//   textTransform: "uppercase" as const,
//   color: "text.secondary",
//   bgcolor: "rgba(27, 111, 190, 0.04)",
//   borderBottom: "1px solid",
//   borderColor: "rgba(27, 111, 190, 0.12)",
//   py: 1.5,
// };

// const shadow = {
//   xs: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
//   sm: "0 2px 8px rgba(15,23,42,0.08), 0 1px 3px rgba(15,23,42,0.04)",
//   md: "0 4px 16px rgba(15,23,42,0.10), 0 2px 6px rgba(15,23,42,0.06)",
//   card: "0 0 0 1px rgba(27,111,190,0.08), 0 2px 8px rgba(27,111,190,0.05)",
// };

// // ── Components ────────────────────────────────────────────────────────────────

// const Tag = ({
//   label,
//   color = C.primary,
// }: {
//   label: string;
//   color?: string;
// }) => (
//   <Box
//     sx={{
//       display: "inline-flex",
//       alignItems: "center",
//       px: 1.2,
//       py: 0.35,
//       borderRadius: "6px",
//       bgcolor: alpha(color, 0.08),
//       border: `1px solid ${alpha(color, 0.15)}`,
//     }}
//   >
//     <Typography
//       sx={{
//         fontSize: "0.68rem",
//         fontWeight: 700,
//         color,
//         letterSpacing: "0.02em",
//       }}
//     >
//       {label}
//     </Typography>
//   </Box>
// );

// const DotBadge = ({ color }: { color: string }) => (
//   <Box
//     sx={{
//       width: 8,
//       height: 8,
//       borderRadius: "50%",
//       bgcolor: color,
//       flexShrink: 0,
//     }}
//   />
// );

// const inputSx = {
//   "& .MuiOutlinedInput-root": {
//     borderRadius: "8px",
//     fontSize: "0.85rem",
//     bgcolor: C.white,
//     "& fieldset": { borderColor: C.neutral200 },
//     "&:hover fieldset": { borderColor: C.neutral300 },
//     "&.Mui-focused fieldset": { borderColor: C.primary },
//   },
// };

// const TabBtn = ({
//   label,
//   icon,
//   active,
//   onClick,
// }: {
//   label: string;
//   icon: React.ReactNode;
//   active: boolean;
//   onClick: () => void;
// }) => (
//   <Box
//     onClick={onClick}
//     sx={{
//       display: "flex",
//       alignItems: "center",
//       gap: 0.8,
//       px: 2,
//       py: 1.1,
//       borderRadius: "8px",
//       cursor: "pointer",
//       bgcolor: active ? C.white : "transparent",
//       color: active ? C.primary : C.neutral500,
//       boxShadow: active ? shadow.xs : "none",
//       border: active
//         ? `1px solid ${alpha(C.primary, 0.15)}`
//         : "1px solid transparent",
//       transition: "all 0.15s",
//       flexShrink: 0,
//       "&:hover": {
//         bgcolor: active ? C.white : alpha(C.primary, 0.04),
//         color: active ? C.primary : C.neutral700,
//       },
//     }}
//   >
//     <Box sx={{ display: "flex", alignItems: "center", fontSize: 16 }}>
//       {icon}
//     </Box>
//     <Typography
//       sx={{
//         fontSize: "0.8rem",
//         fontWeight: active ? 700 : 500,
//         whiteSpace: "nowrap",
//       }}
//     >
//       {label}
//     </Typography>
//   </Box>
// );

// interface SidebarItemProps {
//   label: string;
//   icon?: React.ReactNode;
//   active?: boolean;
//   count?: number;
//   indent?: boolean;
//   isFavorite?: boolean;
//   actions?: React.ReactNode;
// }

// const SidebarItem = ({
//   label,
//   icon,
//   active,
//   count,
//   indent,
//   isFavorite,
//   actions,
//   onClick,
// }: SidebarItemProps & { onClick?: () => void }) => {
//   const theme = useTheme();
//   return (
//     <Box
//       onClick={onClick}
//       sx={{
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         py: 0.8,
//         px: 1.5,
//         ml: indent ? 2 : 0,
//         borderRadius: 2,
//         cursor: "pointer",
//         bgcolor: active ? alpha(C.primary, 0.08) : "transparent",
//         color: active ? C.primary : "text.secondary",
//         transition: "all 0.2s",
//         position: "relative",
//         "&:hover": {
//           bgcolor: active ? alpha(C.primary, 0.12) : alpha(C.primary, 0.04),
//         },
//       }}
//     >
//       <Stack direction="row" spacing={1.5} alignItems="center">
//         {indent ? (
//           <Box
//             sx={{
//               width: 6,
//               height: 6,
//               borderRadius: "50%",
//               bgcolor: active ? C.primary : "text.disabled",
//               ml: 1,
//             }}
//           />
//         ) : (
//           icon && (
//             <Box sx={{ fontSize: 20, display: "flex", alignItems: "center" }}>
//               {icon}
//             </Box>
//           )
//         )}
//         <Typography
//           sx={{
//             fontSize: "0.85rem",
//             fontWeight: active ? 700 : 500,
//             color: active ? "#1E293B" : "#64748B",
//           }}
//         >
//           {label}
//         </Typography>
//       </Stack>
//       <Stack direction="row" spacing={0.5} alignItems="center">
//         {isFavorite && <StarIcon sx={{ fontSize: 16, color: "#F59E0B" }} />}
//         {count !== undefined && (
//           <Box
//             sx={{
//               bgcolor: alpha(C.primary, 0.08),
//               px: 0.8,
//               py: 0.2,
//               borderRadius: 3,
//             }}
//           >
//             <Typography
//               sx={{
//                 fontSize: "0.7rem",
//                 fontWeight: 700,
//                 color: C.primary,
//               }}
//             >
//               {count}
//             </Typography>
//           </Box>
//         )}
//         {actions}
//       </Stack>
//     </Box>
//   );
// };

// const ScheduledReportCard = ({
//   title,
//   next,
//   schedule,
//   icon,
// }: {
//   title: string;
//   next: string;
//   schedule: string;
//   icon: React.ReactNode;
// }) => (
//   <Box
//     sx={{
//       p: 1.5,
//       borderRadius: 3,
//       border: "1px solid",
//       borderColor: "rgba(17, 114, 186, 0.08)",
//       bgcolor: "#FFFFFF",
//       "&:hover": {
//         borderColor: alpha(C.primary, 0.2),
//         boxShadow: "0 4px 12px rgba(17, 114, 186, 0.04)",
//       },
//     }}
//   >
//     <Stack direction="row" spacing={1.5} alignItems="flex-start">
//       <Box
//         sx={{
//           width: 32,
//           height: 32,
//           borderRadius: 1.5,
//           bgcolor: alpha(C.primary, 0.04),
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           flexShrink: 0,
//           mt: 0.5,
//         }}
//       >
//         {icon}
//       </Box>
//       <Box sx={{ flexGrow: 1, minWidth: 0 }}>
//         <Typography
//           sx={{
//             fontSize: "0.85rem",
//             fontWeight: 700,
//             color: "#1E293B",
//             mb: 0.2,
//             whiteSpace: "nowrap",
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//           }}
//         >
//           {title}
//         </Typography>
//         <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", mb: 1 }}>
//           Next: <br />
//           {next}
//         </Typography>
//         <Stack
//           direction="row"
//           alignItems="center"
//           justifyContent="space-between"
//         >
//           <Box
//             sx={{
//               px: 1,
//               py: 0.3,
//               borderRadius: 1.5,
//               bgcolor: alpha(C.primary, 0.08),
//               color: C.primary,
//             }}
//           >
//             <Typography sx={{ fontSize: "0.7rem", fontWeight: 700 }}>
//               {schedule}
//             </Typography>
//           </Box>
//           <Stack direction="row" spacing={0.5}>
//             <IconButton size="small" sx={{ p: 0.5, color: "#F59E0B" }}>
//               <EditIcon sx={{ fontSize: 16 }} />
//             </IconButton>
//             <IconButton
//               size="small"
//               sx={{ p: 0.5, color: alpha(C.primary, 0.4) }}
//             >
//               <DeleteIcon sx={{ fontSize: 16 }} />
//             </IconButton>
//           </Stack>
//         </Stack>
//       </Box>
//     </Stack>
//   </Box>
// );

// const SavedReportItem = ({ title, date }: { title: string; date: string }) => (
//   <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
//     <Box
//       sx={{
//         width: 32,
//         height: 32,
//         borderRadius: 1.5,
//         bgcolor: alpha(C.primary, 0.04),
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         flexShrink: 0,
//         color: "text.secondary",
//       }}
//     >
//       <SaveIcon sx={{ fontSize: 18 }} />
//     </Box>
//     <Box sx={{ flexGrow: 1, minWidth: 0 }}>
//       <Typography
//         sx={{
//           fontSize: "0.8rem",
//           fontWeight: 700,
//           color: "#1E293B",
//           whiteSpace: "nowrap",
//           overflow: "hidden",
//           textOverflow: "ellipsis",
//         }}
//       >
//         {title}
//       </Typography>
//       <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8" }}>
//         {date}
//       </Typography>
//     </Box>
//     <Button
//       size="small"
//       variant="outlined"
//       sx={{
//         minWidth: 50,
//         height: 24,
//         fontSize: "0.65rem",
//         fontWeight: 800,
//         textTransform: "none",
//         borderRadius: 1.5,
//         px: 1,
//         borderColor: "rgba(17, 114, 186, 0.2)",
//         color: C.primary,
//         "&:hover": {
//           bgcolor: alpha(C.primary, 0.04),
//           borderColor: C.primary,
//         },
//       }}
//     >
//       Load
//     </Button>
//   </Stack>
// );

// export default function ReportingWorkbenchPage() {
//   const [activeTab, setActiveTab] = React.useState("results");
//   const [reportSearch, setReportSearch] = React.useState("");
//   const [selectedReportId, setSelectedReportId] = React.useState("lab-summary");
//   const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
//   const [kpiExpanded, setKpiExpanded] = React.useState(true);
//   const [isGenerating, setIsGenerating] = React.useState(false);

//   const handleRunReport = () => {
//     setIsGenerating(true);
//     setTimeout(() => {
//       setIsGenerating(false);
//       showNotify("Report generated successfully!", "success");
//     }, 3000);
//   };

//   const [selectedFields, setSelectedFields] = React.useState<string[]>([]);

//   const availableFields = [
//     "MRN",
//     "Patient Name",
//     "Age",
//     "Sex",
//     "Registration Date",
//     "Department",
//     "Doctor",
//     "Visit Type",
//     "Status",
//     "Diagnosis",
//     "Insurance",
//     "Amount",
//     "Ward",
//     "Discharge Date",
//     "Length of Stay",
//     "Test Name",
//     "Result",
//     "Batch No",
//   ];

//   const toggleField = (field: string) => {
//     setSelectedFields((prev) =>
//       prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
//     );
//   };

//   const [isSavedReportsDialogOpen, setIsSavedReportsDialogOpen] =
//     React.useState(false);
//   const [isScheduleDialogOpen, setIsScheduleDialogOpen] = React.useState(false);

//   const savedReportsData = [
//     {
//       id: 1,
//       name: "OPD Monthly Summary — April",
//       category: "Patient & OPD",
//       date: "25 Apr 2025",
//       params: "Dept: All, Period: Apr",
//       formats: ["PDF", "XLS"],
//     },
//     {
//       id: 2,
//       name: "Revenue Report — Q1 2025",
//       category: "Billing & Revenue",
//       date: "01 Apr 2025",
//       params: "Period: Jan-Mar 2025",
//       formats: ["XLS"],
//     },
//     {
//       id: 3,
//       name: "ICU Bed Census — Week 16",
//       category: "IPD / Admissions",
//       date: "20 Apr 2025",
//       params: "Ward: ICU, Last 7d",
//       formats: ["PDF"],
//     },
//     {
//       id: 4,
//       name: "Pharmacy Expiry Alert — May",
//       category: "Pharmacy",
//       date: "24 Apr 2025",
//       params: "Expiry: Next 60d",
//       formats: ["PDF", "XLS"],
//     },
//   ];

//   const savedReportsColumns = [
//     {
//       id: "name",
//       label: "REPORT NAME",
//       renderCell: (row: any) => (
//         <Typography variant="body2" sx={{ fontWeight: 700 }}>
//           {row.name}
//         </Typography>
//       ),
//     },
//     {
//       id: "category",
//       label: "CATEGORY",
//       renderCell: (row: any) => (
//         <Chip
//           label={row.category}
//           size="small"
//           variant="outlined"
//           sx={{
//             height: 22,
//             fontSize: "0.7rem",
//             color: C.neutral600,
//             borderColor: C.neutral200,
//           }}
//         />
//       ),
//     },
//     {
//       id: "date",
//       label: "SAVED ON",
//       renderCell: (row: any) => (
//         <Typography variant="body2" sx={{ color: C.neutral500 }}>
//           {row.date}
//         </Typography>
//       ),
//     },
//     {
//       id: "params",
//       label: "PARAMS",
//       renderCell: (row: any) => (
//         <Typography variant="caption" sx={{ color: C.neutral400 }}>
//           {row.params}
//         </Typography>
//       ),
//     },
//     {
//       id: "formats",
//       label: "FORMATS",
//       renderCell: (row: any) => (
//         <Stack direction="row" spacing={1}>
//           {row.formats.includes("PDF") && (
//             <Typography
//               variant="caption"
//               sx={{ fontWeight: 800, color: C.danger }}
//             >
//               PDF
//             </Typography>
//           )}
//           {row.formats.includes("XLS") && (
//             <Typography
//               variant="caption"
//               sx={{ fontWeight: 800, color: C.success }}
//             >
//               XLS
//             </Typography>
//           )}
//         </Stack>
//       ),
//     },
//     {
//       id: "actions",
//       label: "ACTIONS",
//       align: "right" as const,
//       renderCell: () => (
//         <Stack direction="row" spacing={1} justifyContent="flex-end">
//           <Button
//             size="small"
//             sx={{
//               textTransform: "none",
//               fontWeight: 700,
//               px: 1,
//               minWidth: 0,
//               height: 26,
//               color: C.neutral800,
//               bgcolor: C.neutral50,
//               border: `1px solid ${C.neutral200}`,
//             }}
//           >
//             Load
//           </Button>
//           <IconButton size="small" sx={{ color: C.warning }}>
//             <SaveIcon sx={{ fontSize: 16 }} />
//           </IconButton>
//           <IconButton size="small" sx={{ color: alpha(C.danger, 0.6) }}>
//             <DeleteIcon sx={{ fontSize: 16 }} />
//           </IconButton>
//         </Stack>
//       ),
//     },
//   ];

//   const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
//   const [isColumnChooserOpen, setIsColumnChooserOpen] = React.useState(false);
//   const [isComparePeriodsOpen, setIsComparePeriodsOpen] = React.useState(false);
//   const [isDrillDownOpen, setIsDrillDownOpen] = React.useState(false);
//   const [selectedFrequency, setSelectedFrequency] = React.useState("Daily");

//   const [visibleColumns, setVisibleColumns] = React.useState<string[]>([
//     "id",
//     "name",
//     "registrationDate",
//     "department",
//     "doctor",
//     "amount",
//     "status",
//     "format",
//   ]);

//   const [comparisonPeriods, setComparisonPeriods] = React.useState({
//     periodA: "MAR 2025",
//     periodB: "FEB 2025",
//   });

//   const [snackbar, setSnackbar] = React.useState<{
//     open: boolean;
//     message: string;
//     severity: "success" | "info" | "warning" | "error";
//   }>({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   const showNotify = (
//     message: string,
//     severity: "success" | "info" | "warning" | "error" = "success",
//   ) => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const [expandedCategories, setExpandedCategories] = React.useState<string[]>([
//     "Patient & OPD",
//     "IPD / Admissions",
//     "Billing & Revenue",
//     "Lab & Diagnostics",
//   ]);

//   const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] =
//     React.useState<boolean>(false);
//   const [filterStartDate, setFilterStartDate] =
//     React.useState<string>("2025-04-01");
//   const [filterEndDate, setFilterEndDate] =
//     React.useState<string>("2025-04-30");
//   const [selectedDepts, setSelectedDepts] = React.useState<string[]>([
//     "Surgery",
//   ]);
//   const [selectedStaff, setSelectedStaff] = React.useState<string[]>([
//     "Dr. S. Iyer",
//   ]);
//   const [filterStatus, setFilterStatus] = React.useState<string>("All");
//   const [filterVisitType, setFilterVisitType] = React.useState<string>("All");
//   const [filterAgeGroup, setFilterAgeGroup] = React.useState<string>("All");
//   const [customField, setCustomField] = React.useState<string>("MRN");
//   const [customOperator, setCustomOperator] = React.useState<string>("equals");
//   const [customValue, setCustomValue] = React.useState<string>("");

//   const [customConditions, setCustomConditions] = React.useState([
//     {
//       id: Date.now(),
//       logic: "AND",
//       field: "MRN",
//       operator: "equals",
//       value: "",
//     },
//   ]);

//   const reportTabs = [
//     { id: "results", label: "Results", icon: <ListIcon /> },
//     { id: "charts", label: "Chart View", icon: <BarChartIcon /> },
//     { id: "summary", label: "Summary", icon: <AssessmentIcon /> },
//     { id: "comparison", label: "Comparison", icon: <CompareIcon /> },
//     { id: "history", label: "Run History", icon: <HistoryIcon /> },
//   ];

//   const [favoriteReportIds, setFavoriteReportIds] = React.useState<string[]>([
//     "reg-summary",
//     "revenue-collection",
//     "staff-attendance",
//   ]);
//   const [showOnlyFavorites, setShowOnlyFavorites] = React.useState(false);

//   const toggleFavorite = (id: string) => {
//     setFavoriteReportIds((prev) =>
//       prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
//     );
//   };

//   const reportCategories: any[] = [
//     {
//       id: "Patient & OPD",
//       label: "Patient & OPD",
//       icon: "👧",
//       reports: [
//         {
//           id: "reg-summary",
//           label: "Patient Registration Summary",
//           isFavorite: true,
//         },
//         { id: "opd-census", label: "OPD Daily Census" },
//         { id: "revisit-followup", label: "Revisit & Follow-up" },
//         { id: "waiting-time", label: "Outpatient Waiting Time" },
//         { id: "new-return-ratio", label: "New vs Return Patient Ratio" },
//       ],
//     },
//     {
//       id: "IPD / Admissions",
//       label: "IPD / Admissions",
//       icon: "🛌",
//       reports: [
//         { id: "admission-discharge", label: "Admission & Discharge" },
//         { id: "bed-occupancy", label: "Bed Occupancy Report" },
//         { id: "alos", label: "Avg. Length of Stay (ALOS)" },
//         { id: "ward-census", label: "Ward-wise Census" },
//         { id: "icu-tracker", label: "ICU Patient Tracker" },
//       ],
//     },
//     {
//       id: "Billing & Revenue",
//       label: "Billing & Revenue",
//       icon: "💰",
//       reports: [
//         {
//           id: "revenue-collection",
//           label: "Daily Revenue Collection",
//           isFavorite: true,
//         },
//         { id: "outstanding-dues", label: "Outstanding & Dues" },
//         { id: "tpa-claims", label: "Insurance / TPA Claims" },
//         { id: "proc-revenue", label: "Procedure-wise Revenue" },
//         { id: "discount-waiver", label: "Discount & Waiver Report" },
//       ],
//     },
//     {
//       id: "Lab & Diagnostics",
//       label: "Lab & Diagnostics",
//       icon: "🧪",
//       reports: [
//         { id: "lab-summary", label: "Lab Test Summary" },
//         { id: "critical-alert", label: "Critical Value Alert Log" },
//         { id: "diag-revenue", label: "Diagnostic Revenue" },
//         { id: "tat-analysis", label: "TAT Analysis" },
//       ],
//     },
//     {
//       id: "Pharmacy",
//       label: "Pharmacy (Willow)",
//       icon: "💊",
//       reports: [
//         { id: "drug-dispensing", label: "Drug Dispensing Report" },
//         { id: "inventory-stock", label: "Inventory & Stock" },
//         { id: "expiry-near", label: "Expiry / Near-Expiry" },
//         { id: "high-value-drug", label: "High-Value Drug Tracker" },
//       ],
//     },
//     {
//       id: "Radiology",
//       label: "Radiology (Radiant)",
//       icon: "🩻",
//       reports: [
//         { id: "imaging-order", label: "Imaging Order Summary" },
//         { id: "radiologist-workload", label: "Radiologist Workload" },
//       ],
//     },
//     {
//       id: "Surgery",
//       label: "Surgery (OpTime)",
//       icon: "🔪",
//       reports: [
//         { id: "or-utilisation", label: "OR Utilisation Report" },
//         { id: "surgery-case", label: "Surgery Case Summary" },
//       ],
//     },
//     {
//       id: "Inventory",
//       label: "Inventory / Stores",
//       icon: "📦",
//       reports: [
//         { id: "store-issue", label: "Store Issue & Receipt" },
//         { id: "dead-stock", label: "Dead Stock Report" },
//       ],
//     },
//     {
//       id: "HR",
//       label: "HR & Staff",
//       icon: "👥",
//       reports: [
//         { id: "staff-attendance", label: "Staff Attendance", isFavorite: true },
//         { id: "duty-roster", label: "Duty Roster Report" },
//         { id: "dr-productivity", label: "Doctor Productivity" },
//       ],
//     },
//     {
//       id: "Population",
//       label: "Population Health",
//       icon: "🌐",
//       reports: [
//         { id: "chronic-disease", label: "Chronic Disease Registry" },
//         { id: "preventive-care", label: "Preventive Care Gaps" },
//       ],
//     },
//   ];

//   const toggleCategory = (id: string) => {
//     setExpandedCategories((prev) =>
//       prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
//     );
//   };

//   const filteredCategories = reportCategories
//     .map((cat) => ({
//       ...cat,
//       reports: cat.reports.filter((r: any) => {
//         const matchesSearch = r.label
//           .toLowerCase()
//           .includes(reportSearch.toLowerCase());
//         const matchesFavorite =
//           !showOnlyFavorites || favoriteReportIds.includes(r.id);
//         return matchesSearch && matchesFavorite;
//       }),
//     }))
//     .filter((cat) => cat.reports.length > 0);

//   const selectedReport = reportCategories
//     .flatMap((c) => c.reports)
//     .find((r) => r.id === selectedReportId);

//   const selectedReportCategory = reportCategories.find((c: any) =>
//     c.reports.some((r: any) => r.id === selectedReportId),
//   );

//   let parameterFields: any[] = [];
//   const commonDates = [
//     { label: "DATE FROM", value: "2025-03-01", type: "date", width: 2 },
//     { label: "DATE TO", value: "2025-03-31", type: "date", width: 2 },
//   ];

//   switch (selectedReportCategory?.id) {
//     case "Patient & OPD":
//       parameterFields = [
//         ...commonDates,
//         {
//           type: "select",
//           label: "DEPARTMENT",
//           options: [
//             "All Departments",
//             "Cardiology",
//             "Orthopedics",
//             "Neurology",
//           ],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "VISIT TYPE",
//           options: ["All", "New", "Follow-up"],
//           width: 2,
//         },
//         {
//           type: "select",
//           label: "DOCTOR / STAFF",
//           options: ["All Staff"],
//           width: 3,
//         },
//       ];
//       break;
//     case "IPD / Admissions":
//       parameterFields = [
//         ...commonDates,
//         {
//           type: "select",
//           label: "WARD / UNIT",
//           options: ["All Wards", "ICU", "General", "Private", "NICU"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "ADMISSION STATUS",
//           options: ["All", "Admitted", "Discharged", "Transferred"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "ATTENDING DOCTOR",
//           options: ["All Doctors"],
//           width: 2,
//         },
//       ];
//       break;
//     case "Billing & Revenue":
//       parameterFields = [
//         ...commonDates,
//         {
//           type: "select",
//           label: "BILL STATUS",
//           options: ["All", "Paid", "Pending", "Partially Paid"],
//           width: 2,
//         },
//         {
//           type: "select",
//           label: "PAYER TYPE",
//           options: ["All", "Self Pay", "Insurance", "Corporate"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "DEPARTMENT",
//           options: ["All Departments", "OPD", "IPD", "Pharmacy"],
//           width: 3,
//         },
//       ];
//       break;
//     case "Lab & Diagnostics":
//       parameterFields = [
//         ...commonDates,
//         {
//           type: "select",
//           label: "TEST CATEGORY",
//           options: ["All Tests", "Hematology", "Biochemistry", "Microbiology"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "RESULT STATUS",
//           options: ["All", "Pending", "Completed", "Critical"],
//           width: 2,
//         },
//         {
//           type: "select",
//           label: "PRIORITY",
//           options: ["All", "Routine", "STAT"],
//           width: 3,
//         },
//       ];
//       break;
//     case "Pharmacy":
//       parameterFields = [
//         ...commonDates,
//         {
//           type: "select",
//           label: "DISPENSE TYPE",
//           options: ["All", "OPD", "IPD Discharge"],
//           width: 2,
//         },
//         {
//           type: "select",
//           label: "DRUG CATEGORY",
//           options: ["All", "Antibiotics", "Narcotics", "Consumables"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "INVENTORY STATUS",
//           options: ["All", "In Stock", "Low Stock", "Out of Stock"],
//           width: 3,
//         },
//       ];
//       break;
//     case "Radiology":
//       parameterFields = [
//         ...commonDates,
//         {
//           type: "select",
//           label: "MODALITY",
//           options: ["All", "X-Ray", "CT Scan", "MRI", "Ultrasound"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "REPORT STATUS",
//           options: ["All", "Requested", "Scheduled", "Reported"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "RADIOLOGIST",
//           options: ["All Radiologists"],
//           width: 2,
//         },
//       ];
//       break;
//     case "Surgery":
//       parameterFields = [
//         ...commonDates,
//         {
//           type: "select",
//           label: "OPERATION THEATER",
//           options: ["All OTs", "OT-1", "OT-2", "OT-3"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "SURGERY TYPE",
//           options: ["All", "Elective", "Emergency"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "SURGEON",
//           options: ["All Surgeons"],
//           width: 2,
//         },
//       ];
//       break;
//     case "Inventory":
//       parameterFields = [
//         ...commonDates,
//         {
//           type: "select",
//           label: "STORE CATEGORY",
//           options: ["All Stores", "Main Store", "Sub Store"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "ITEM TYPE",
//           options: ["All Items", "Consumables", "Equipment", "Reagents"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "TRANSACTION TYPE",
//           options: ["All", "Issue", "Receipt", "Return"],
//           width: 2,
//         },
//       ];
//       break;
//     case "HR":
//       parameterFields = [
//         ...commonDates,
//         {
//           type: "select",
//           label: "DEPARTMENT",
//           options: ["All Departments", "Clinical", "Admin", "Nursing"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "STAFF TYPE",
//           options: ["All", "Permanent", "Contract", "Consultant"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "ATTENDANCE STATUS",
//           options: ["All", "Present", "Absent", "On Leave"],
//           width: 2,
//         },
//       ];
//       break;
//     case "Population":
//       parameterFields = [
//         {
//           type: "select",
//           label: "DISEASE REGISTRY",
//           options: ["All", "Diabetes", "Hypertension", "Asthma"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "RISK LEVEL",
//           options: ["All", "High", "Medium", "Low"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "AGE GROUP",
//           options: ["All", "0-18", "19-45", "46-60", ">60"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "FOLLOW-UP STATUS",
//           options: ["All", "Due", "Completed", "Overdue"],
//           width: 3,
//         },
//       ];
//       break;
//     default:
//       parameterFields = [
//         ...commonDates,
//         {
//           type: "select",
//           label: "DEPARTMENT",
//           options: [
//             "All Departments",
//             "Cardiology",
//             "Orthopedics",
//             "Neurology",
//           ],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "DOCTOR / STAFF",
//           options: ["All Staff"],
//           width: 3,
//         },
//         {
//           type: "select",
//           label: "VISIT TYPE",
//           options: ["All", "OPD", "IPD"],
//           width: 2,
//         },
//         {
//           type: "select",
//           label: "STATUS",
//           options: ["All", "Registered", "Discharged", "Pending"],
//           width: 2,
//         },
//       ];
//       break;
//   }

//   const comparisonData = [
//     {
//       metric: "Total Patients",
//       periodA: "4,821",
//       periodB: "4,312",
//       change: "+11.8%",
//       up: true,
//     },
//     {
//       metric: "OPD Visits",
//       periodA: "3,234",
//       periodB: "2,853",
//       change: "+13.3%",
//       up: true,
//     },
//     {
//       metric: "IPD Admissions",
//       periodA: "618",
//       periodB: "587",
//       change: "+5.3%",
//       up: true,
//     },
//     {
//       metric: "Revenue (₹)",
//       periodA: "₹48.6L",
//       periodB: "₹44.9L",
//       change: "+8.2%",
//       up: true,
//     },
//     {
//       metric: "Avg LOS (days)",
//       periodA: "3.4",
//       periodB: "3.7",
//       change: "-8.1%",
//       up: false,
//     },
//     {
//       metric: "Pending Bills",
//       periodA: "124",
//       periodB: "85",
//       change: "+45.8%",
//       up: true,
//       danger: true,
//     },
//   ];

//   // ── Mock Data for Results ──────────────────────────────────────────────────
//   const resultsData = [
//     {
//       id: "001",
//       name: "Daily OPD Census",
//       registrationDate: "2025-04-25",
//       department: "General Medicine",
//       doctor: "Dr. R. Shah",
//       amount: "—",
//       status: "Completed",
//       format: "PDF",
//     },
//     {
//       id: "002",
//       name: "Revenue Collection",
//       registrationDate: "2025-04-25",
//       department: "Billing",
//       doctor: "Finance",
//       amount: "₹3.2L",
//       status: "Completed",
//       format: "XLS",
//     },
//     {
//       id: "003",
//       name: "Bed Occupancy",
//       registrationDate: "2025-04-24",
//       department: "All Wards",
//       doctor: "Admin",
//       amount: "—",
//       status: "Completed",
//       format: "PDF",
//     },
//     {
//       id: "004",
//       name: "Lab Test Summary",
//       registrationDate: "2025-04-24",
//       department: "Lab",
//       doctor: "Pathologist",
//       amount: "—",
//       status: "Pending",
//       format: "PDF",
//     },
//     {
//       id: "005",
//       name: "Drug Dispensing",
//       registrationDate: "2025-04-23",
//       department: "Pharmacy",
//       doctor: "Pharmacist",
//       amount: "—",
//       status: "Completed",
//       format: "XLS",
//     },
//     {
//       id: "006",
//       name: "Insurance Claims",
//       registrationDate: "2025-04-23",
//       department: "Billing",
//       doctor: "Finance",
//       amount: "₹18.4L",
//       status: "Processing",
//       format: "PDF",
//     },
//     {
//       id: "007",
//       name: "Staff Attendance",
//       registrationDate: "2025-04-22",
//       department: "HR",
//       doctor: "HR Admin",
//       amount: "—",
//       status: "Completed",
//       format: "XLS",
//     },
//     {
//       id: "008",
//       name: "Expiry Alert",
//       registrationDate: "2025-04-22",
//       department: "Pharmacy",
//       doctor: "Pharmacist",
//       amount: "—",
//       status: "Warning",
//       format: "PDF",
//     },
//   ];

//   const resultsColumns = [
//     {
//       id: "id",
//       label: "ID",
//       renderCell: (row: any) => (
//         <Typography variant="body2" sx={{ color: C.neutral500 }}>
//           {row.id}
//         </Typography>
//       ),
//     },
//     {
//       id: "name",
//       label: "NAME",
//       renderCell: (row: any) => (
//         <Typography
//           variant="body2"
//           sx={{ fontWeight: 800, color: C.neutral800 }}
//         >
//           {row.name}
//         </Typography>
//       ),
//     },
//     {
//       id: "registrationDate",
//       label: "DATE",
//       renderCell: (row: any) => (
//         <Typography variant="body2" sx={{ color: C.neutral500 }}>
//           {row.registrationDate}
//         </Typography>
//       ),
//     },
//     {
//       id: "department",
//       label: "DEPARTMENT",
//       renderCell: (row: any) => (
//         <Typography
//           variant="body2"
//           sx={{ color: C.neutral600, fontWeight: 500 }}
//         >
//           {row.department}
//         </Typography>
//       ),
//     },
//     {
//       id: "doctor",
//       label: "DOCTOR",
//       renderCell: (row: any) => (
//         <Typography
//           variant="body2"
//           sx={{ color: C.neutral600, fontWeight: 500 }}
//         >
//           {row.doctor}
//         </Typography>
//       ),
//     },
//     {
//       id: "amount",
//       label: "AMOUNT",
//       renderCell: (row: any) => (
//         <Typography
//           variant="body2"
//           sx={{ color: C.neutral700, fontWeight: 700 }}
//         >
//           {row.amount}
//         </Typography>
//       ),
//     },
//     {
//       id: "status",
//       label: "STATUS",
//       renderCell: (row: any) => {
//         const colors: any = {
//           Completed: C.success,
//           Pending: "#F59E0B",
//           Processing: "#3B82F6",
//           Warning: C.danger,
//         };
//         const color = colors[row.status] || C.neutral400;
//         return (
//           <Chip
//             label={row.status}
//             size="small"
//             sx={{
//               bgcolor: alpha(color, 0.1),
//               color: color,
//               fontWeight: 700,
//               fontSize: "0.68rem",
//               borderRadius: "12px",
//               height: 22,
//             }}
//           />
//         );
//       },
//     },
//     {
//       id: "format",
//       label: "FORMAT",
//       renderCell: (row: any) => (
//         <Typography
//           variant="body2"
//           sx={{ color: C.neutral500, fontWeight: 600 }}
//         >
//           {row.format}
//         </Typography>
//       ),
//     },
//     {
//       id: "actions",
//       label: "ACTIONS",
//       align: "right" as const,
//       renderCell: () => (
//         <Stack direction="row" spacing={1} justifyContent="flex-end">
//           <IconButton size="small">
//             <RefreshIcon sx={{ fontSize: 16, color: C.warning }} />
//           </IconButton>
//           <IconButton size="small">
//             <SaveIcon sx={{ fontSize: 16 }} />
//           </IconButton>
//         </Stack>
//       ),
//     },
//   ];

//   const filteredResultsColumns = resultsColumns.filter((c) =>
//     visibleColumns.includes(c.id),
//   );

//   // ── Mock Data for Run History ──────────────────────────────────────────────
//   const historyData = [
//     {
//       id: 1,
//       date: "25 Apr 2025 • 09:14 AM",
//       user: "Dr. R. Shah",
//       role: "Admin",
//       params: "Dept: All | Period: This Month",
//       duration: "1.2s",
//       status: "Success",
//       output: "PDF",
//     },
//     {
//       id: 2,
//       date: "25 Apr 2025 • 08:50 AM",
//       user: "Accounts",
//       role: "Billing",
//       params: "Period: Today | Ward: All",
//       duration: "0.8s",
//       status: "Success",
//       output: "XLS",
//     },
//     {
//       id: 3,
//       date: "24 Apr 2025 • 17:32 PM",
//       user: "Dr. M. Patel",
//       role: "Doctor",
//       params: "Dept: Lab | Period: Last 7d",
//       duration: "2.1s",
//       status: "Success",
//       output: "PDF",
//     },
//     {
//       id: 4,
//       date: "24 Apr 2025 • 14:10 PM",
//       user: "Nurse Priya",
//       role: "Nurse",
//       params: "Ward: ICU | Period: Today",
//       duration: "0.6s",
//       status: "Success",
//       output: "PDF",
//     },
//     {
//       id: 5,
//       date: "23 Apr 2025 • 11:20 AM",
//       user: "Accounts",
//       role: "Billing",
//       params: "Period: Last Month",
//       duration: "3.4s",
//       status: "Success",
//       output: "XLS",
//     },
//     {
//       id: 6,
//       date: "22 Apr 2025 • 09:05 AM",
//       user: "Dr. N. Joshi",
//       role: "Doctor",
//       params: "Dept: Cardiology | Period: Q1",
//       duration: "4.1s",
//       status: "Success",
//       output: "XLS",
//     },
//   ];

//   const historyColumns = [
//     {
//       id: "date",
//       label: "RUN DATE & TIME",
//       renderCell: (row: any) => (
//         <Typography variant="body2">{row.date}</Typography>
//       ),
//     },
//     {
//       id: "user",
//       label: "USER",
//       renderCell: (row: any) => (
//         <Typography variant="body2" sx={{ fontWeight: 700 }}>
//           {row.user}
//         </Typography>
//       ),
//     },
//     {
//       id: "role",
//       label: "ROLE",
//       renderCell: (row: any) => (
//         <Chip
//           label={row.role}
//           size="small"
//           variant="outlined"
//           sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
//         />
//       ),
//     },
//     {
//       id: "params",
//       label: "PARAMETERS",
//       renderCell: (row: any) => (
//         <Typography variant="body2" color="text.secondary">
//           {row.params}
//         </Typography>
//       ),
//     },
//     {
//       id: "duration",
//       label: "DURATION",
//       renderCell: (row: any) => (
//         <Typography variant="body2">{row.duration}</Typography>
//       ),
//     },
//     {
//       id: "status",
//       label: "STATUS",
//       renderCell: (row: any) => (
//         <Chip
//           label={row.status}
//           size="small"
//           sx={{
//             height: 20,
//             fontSize: "0.65rem",
//             fontWeight: 700,
//             bgcolor: alpha(C.success, 0.1),
//             color: C.success,
//           }}
//         />
//       ),
//     },
//     {
//       id: "output",
//       label: "OUTPUT",
//       renderCell: (row: any) => (
//         <Chip
//           label={row.output}
//           size="small"
//           sx={{
//             height: 20,
//             fontSize: "0.65rem",
//             fontWeight: 700,
//             bgcolor: alpha(row.output === "PDF" ? C.danger : C.success, 0.1),
//             color: row.output === "PDF" ? C.danger : C.success,
//           }}
//         />
//       ),
//     },
//     {
//       id: "actions",
//       label: "ACTIONS",
//       align: "right" as const,
//       renderCell: () => (
//         <Stack direction="row" spacing={1} justifyContent="flex-end">
//           <IconButton size="small">
//             <RefreshIcon sx={{ fontSize: 16, color: C.warning }} />
//           </IconButton>
//           <IconButton size="small">
//             <SaveIcon sx={{ fontSize: 16 }} />
//           </IconButton>
//         </Stack>
//       ),
//     },
//   ];

//   return (
//     <PageTemplate
//       title="Reporting Workbench"
//       subtitle="Advanced diagnostic console for hospital-level data aggregation"
//       currentPageTitle="Reporting"
//     >
//       <WorkspaceHeaderCard sx={{ mb: 3 }}>
//         <Stack
//           direction="row"
//           justifyContent="space-between"
//           alignItems="center"
//         >
//           <Box>
//             <Typography
//               variant="h5"
//               sx={{ fontWeight: 900, color: C.primary, mb: 0.5 }}
//             >
//               Reporting Workbench
//             </Typography>
//             <Typography
//               variant="body2"
//               sx={{ color: C.neutral500, fontWeight: 500 }}
//             >
//               Access{" "}
//               {reportCategories.reduce((s, c) => s + c.reports.length, 0)}{" "}
//               automated reports and data diagnostics.
//             </Typography>
//           </Box>
//           <Stack direction="row" spacing={2} alignItems="center">
//             <Button
//               variant="text"
//               startIcon={
//                 kpiExpanded ? (
//                   <VisibilityOffIcon sx={{ fontSize: 18 }} />
//                 ) : (
//                   <VisibilityIcon sx={{ fontSize: 18 }} />
//                 )
//               }
//               onClick={() => setKpiExpanded(!kpiExpanded)}
//               sx={{
//                 borderRadius: 2.5,
//                 textTransform: "none",
//                 fontWeight: 700,
//                 color: C.neutral600,
//                 px: 2,
//                 "&:hover": { bgcolor: alpha(C.primary, 0.04) },
//               }}
//             >
//               {kpiExpanded ? "Hide KPIs" : "Show KPIs"}
//             </Button>

//             <Button
//               variant="contained"
//               startIcon={<AddIcon />}
//               onClick={() => setIsCreateDialogOpen(true)}
//               sx={{
//                 borderRadius: 2.5,
//                 textTransform: "none",
//                 fontWeight: 800,
//                 px: 3,
//                 boxShadow: `0 8px 16px ${alpha(C.primary, 0.1)}`,
//                 bgcolor: C.primary,
//                 "&:hover": { bgcolor: C.primaryDark },
//               }}
//             >
//               New Report Creation
//             </Button>
//           </Stack>
//         </Stack>
//       </WorkspaceHeaderCard>

//       <Box sx={{ display: "flex", gap: 3, minHeight: "calc(100vh - 200px)" }}>
//         {/* ── Left Sidebar ── */}
//         <Box sx={{ width: 320, flexShrink: 0 }}>
//           <Stack spacing={2}>
//             {/* Report Library Section */}
//             <Paper
//               elevation={0}
//               sx={{
//                 ...CARD_SX,
//                 p: 2,
//                 maxHeight: "50vh",
//                 overflow: "hidden",
//                 display: "flex",
//                 flexDirection: "column",
//               }}
//             >
//               <Stack
//                 direction="row"
//                 justifyContent="space-between"
//                 alignItems="center"
//                 sx={{ mb: 2 }}
//               >
//                 <Stack direction="row" spacing={1} alignItems="center">
//                   <Box sx={{ fontSize: 20 }}>📚</Box>
//                   <Typography
//                     variant="subtitle2"
//                     sx={{ fontWeight: 800, color: "#1E293B" }}
//                   >
//                     Report Library
//                   </Typography>
//                 </Stack>
//                 <Button
//                   size="small"
//                   variant={showOnlyFavorites ? "soft" : ("text" as any)}
//                   onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
//                   startIcon={
//                     showOnlyFavorites ? (
//                       <StarIcon sx={{ fontSize: 16 }} />
//                     ) : (
//                       <StarBorderIcon sx={{ fontSize: 16 }} />
//                     )
//                   }
//                   sx={{
//                     textTransform: "none",
//                     fontWeight: 700,
//                     color: showOnlyFavorites ? "#F59E0B" : C.primary,
//                     bgcolor: showOnlyFavorites
//                       ? alpha("#F59E0B", 0.08)
//                       : "transparent",
//                     "&:hover": {
//                       bgcolor: showOnlyFavorites
//                         ? alpha("#F59E0B", 0.12)
//                         : alpha(C.primary, 0.04),
//                     },
//                   }}
//                 >
//                   {showOnlyFavorites ? "Showing Favourites" : "Favourites"}
//                 </Button>
//               </Stack>

//               <TextField
//                 fullWidth
//                 size="small"
//                 placeholder="Filter reports..."
//                 value={reportSearch}
//                 onChange={(e) => setReportSearch(e.target.value)}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <SearchIcon
//                         sx={{ fontSize: 18, color: "text.disabled" }}
//                       />
//                     </InputAdornment>
//                   ),
//                   sx: { borderRadius: 2, bgcolor: alpha(C.primary, 0.02) },
//                 }}
//                 sx={{ mb: 2 }}
//               />

//               <Box sx={{ flexGrow: 1, overflowY: "auto", mx: -1, px: 1 }}>
//                 <Stack spacing={0.5}>
//                   {filteredCategories.map((category) => {
//                     const isExpanded = expandedCategories.includes(category.id);
//                     return (
//                       <Box key={category.id} sx={{ mb: 1 }}>
//                         <Stack
//                           direction="row"
//                           alignItems="center"
//                           spacing={1}
//                           sx={{
//                             px: 1,
//                             py: 1,
//                             cursor: "pointer",
//                             "&:hover": { bgcolor: alpha(C.primary, 0.02) },
//                             borderRadius: 2,
//                           }}
//                           onClick={() => toggleCategory(category.id)}
//                         >
//                           <IconButton size="small" sx={{ p: 0, mr: 0.5 }}>
//                             {isExpanded ? (
//                               <ArrowDropDownIcon sx={{ fontSize: 18 }} />
//                             ) : (
//                               <ArrowRightIcon sx={{ fontSize: 18 }} />
//                             )}
//                           </IconButton>
//                           <Typography
//                             sx={{
//                               fontSize: "0.9rem",
//                               fontWeight: 700,
//                               color: "#475569",
//                               flexGrow: 1,
//                             }}
//                           >
//                             {category.icon} {category.label}
//                           </Typography>
//                           <Typography
//                             sx={{
//                               fontSize: "0.75rem",
//                               fontWeight: 700,
//                               color: C.primary,
//                               bgcolor: alpha(C.primary, 0.1),
//                               px: 0.8,
//                               borderRadius: 3,
//                             }}
//                           >
//                             {
//                               category.reports.filter(
//                                 (r: any) =>
//                                   !showOnlyFavorites ||
//                                   favoriteReportIds.includes(r.id),
//                               ).length
//                             }
//                           </Typography>
//                         </Stack>
//                         {isExpanded && (
//                           <Stack spacing={0.5} sx={{ mt: 0.5 }}>
//                             {category.reports
//                               .filter(
//                                 (r: any) =>
//                                   !showOnlyFavorites ||
//                                   favoriteReportIds.includes(r.id),
//                               )
//                               .map((report: any) => (
//                                 <SidebarItem
//                                   key={report.id}
//                                   label={report.label}
//                                   active={selectedReportId === report.id}
//                                   isFavorite={favoriteReportIds.includes(
//                                     report.id,
//                                   )}
//                                   indent
//                                   onClick={() => setSelectedReportId(report.id)}
//                                   actions={
//                                     <IconButton
//                                       size="small"
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         setIsScheduleDialogOpen(true);
//                                       }}
//                                     >
//                                       <AccessTimeIcon
//                                         sx={{
//                                           fontSize: 14,
//                                           color: C.neutral400,
//                                         }}
//                                       />
//                                     </IconButton>
//                                   }
//                                 />
//                               ))}
//                           </Stack>
//                         )}
//                       </Box>
//                     );
//                   })}
//                 </Stack>
//               </Box>
//             </Paper>

//             {/* My Saved Reports Section */}
//             <Paper
//               elevation={0}
//               sx={{
//                 ...CARD_SX,
//                 p: 2,
//                 display: "flex",
//                 flexDirection: "column",
//               }}
//             >
//               <Stack
//                 direction="row"
//                 justifyContent="space-between"
//                 alignItems="center"
//                 sx={{ mb: 1 }}
//               >
//                 <Stack direction="row" spacing={1} alignItems="center">
//                   <Box
//                     sx={{
//                       width: 32,
//                       height: 32,
//                       borderRadius: "50%",
//                       bgcolor: alpha(C.primary, 0.04),
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       color: C.primary,
//                     }}
//                   >
//                     <SaveIcon sx={{ fontSize: 20 }} />
//                   </Box>
//                   <Typography
//                     variant="subtitle2"
//                     sx={{ fontWeight: 800, color: "#1E293B" }}
//                   >
//                     My Saved Reports
//                   </Typography>
//                 </Stack>
//                 <Button
//                   size="small"
//                   onClick={() => setIsSavedReportsDialogOpen(true)}
//                   sx={{
//                     textTransform: "none",
//                     fontWeight: 700,
//                     color: C.primary,
//                   }}
//                 >
//                   View All
//                 </Button>
//               </Stack>

//               <Divider sx={{ mb: 1, borderColor: alpha(C.primary, 0.05) }} />

//               <Stack spacing={0.5}>
//                 <SavedReportItem
//                   title="OPD Monthly Summary — April"
//                   date="25 Apr 2025"
//                 />
//                 <Divider sx={{ borderColor: alpha(C.primary, 0.02) }} />
//                 <SavedReportItem
//                   title="Revenue Report — Q1 2025"
//                   date="01 Apr 2025"
//                 />
//                 <Divider sx={{ borderColor: alpha(C.primary, 0.02) }} />
//                 <SavedReportItem
//                   title="ICU Bed Census — Week 16"
//                   date="20 Apr 2025"
//                 />
//               </Stack>
//             </Paper>
//             {/* Scheduled Reports Section */}
//             <Paper
//               elevation={0}
//               sx={{
//                 ...CARD_SX,
//                 p: 2,
//                 display: "flex",
//                 maxHeight: "50vh",
//                 overflowY: "auto",
//                 flexDirection: "column",
//               }}
//             >
//               <Stack
//                 direction="row"
//                 justifyContent="space-between"
//                 alignItems="center"
//                 sx={{ mb: 2 }}
//               >
//                 <Stack direction="row" spacing={1} alignItems="center">
//                   <Box
//                     sx={{
//                       width: 32,
//                       height: 32,
//                       borderRadius: "50%",
//                       bgcolor: alpha(C.primary, 0.04),
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       color: C.primary,
//                     }}
//                   >
//                     <ScheduleIcon sx={{ fontSize: 20 }} />
//                   </Box>
//                   <Typography
//                     variant="subtitle2"
//                     sx={{ fontWeight: 800, color: "#1E293B" }}
//                   >
//                     Scheduled Reports
//                   </Typography>
//                 </Stack>
//                 <Button
//                   size="small"
//                   startIcon={<AddIcon sx={{ fontSize: 16 }} />}
//                   onClick={() => setIsScheduleDialogOpen(true)}
//                   sx={{
//                     textTransform: "none",
//                     fontWeight: 700,
//                     color: C.primary,
//                   }}
//                 >
//                   Add
//                 </Button>
//               </Stack>

//               <Stack spacing={1.5}>
//                 <ScheduledReportCard
//                   title="Daily R..."
//                   next="Tomorrow 07:00"
//                   schedule="Daily - 07:00"
//                   icon={
//                     <BarChartIcon sx={{ fontSize: 18, color: C.primary }} />
//                   }
//                 />
//                 <ScheduledReportCard
//                   title="Bed Oc..."
//                   next="Tomorrow 08:30"
//                   schedule="Daily - 08:30"
//                   icon={<Box sx={{ fontSize: 18 }}>🛌</Box>}
//                 />
//                 <ScheduledReportCard
//                   title="Low St..."
//                   next="Tomorrow 06:30"
//                   schedule="Daily - 06:30"
//                   icon={<Box sx={{ fontSize: 18 }}>💊</Box>}
//                 />
//                 <ScheduledReportCard
//                   title="OP..."
//                   next="28 Apr 08:00"
//                   schedule="Every Mon - 08:00"
//                   icon={<Box sx={{ fontSize: 18 }}>📋</Box>}
//                 />
//               </Stack>
//             </Paper>
//           </Stack>
//         </Box>

//         <Box sx={{ flexGrow: 1 }}>
//           {/* KPI Stats */}
//           <Collapse in={kpiExpanded}>
//             <Box
//               sx={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(4, 1fr)",
//                 gap: 1.5,
//                 mb: 3,
//               }}
//             >
//               <StatTile
//                 label="Total Patients"
//                 value="4,821"
//                 subtitle="+6.2% vs last period"
//                 tone="primary"
//                 icon={<AssessmentIcon sx={{ fontSize: 24 }} />}
//               />
//               <StatTile
//                 label="Bed Occupancy"
//                 value="84%"
//                 subtitle="+2.1% improvement"
//                 tone="success"
//                 icon={<CheckCircleOutlineIcon sx={{ fontSize: 24 }} />}
//               />
//               <StatTile
//                 label="Revenue"
//                 value="₹48.6L"
//                 subtitle="+8.2% growth"
//                 tone="warning"
//                 icon={<BarChartIcon sx={{ fontSize: 24 }} />}
//               />
//               <StatTile
//                 label="Pending Bills"
//                 value="124"
//                 subtitle="High priority alert"
//                 tone="error"
//                 icon={<InfoOutlinedIcon sx={{ fontSize: 24 }} />}
//               />
//             </Box>
//           </Collapse>

//           <Stack spacing={3}>
//             {/* Report Header Card */}
//             <Paper
//               elevation={0}
//               sx={{
//                 borderRadius: "14px",
//                 border: `1px solid ${C.neutral200}`,
//                 bgcolor: C.white,
//                 boxShadow: shadow.card,
//                 overflow: "hidden",
//               }}
//             >
//               {/* Top color strip */}
//               <Box
//                 sx={{
//                   height: 3,
//                   bgcolor: `linear-gradient(90deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
//                   background: `linear-gradient(90deg, ${C.primary}, ${C.primaryDark})`,
//                 }}
//               />

//               <Box sx={{ p: 2 }}>
//                 <Stack direction="row" gap={2.5} alignItems="flex-start">
//                   <Box
//                     sx={{
//                       width: 56,
//                       height: 56,
//                       borderRadius: "12px",
//                       bgcolor: C.primaryLight,
//                       border: `1px solid ${C.primaryMid}`,
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       color: C.primary,
//                       flexShrink: 0,
//                     }}
//                   >
//                     <AssessmentIcon sx={{ fontSize: 28 }} />
//                   </Box>

//                   <Box sx={{ flexGrow: 1 }}>
//                     <Stack
//                       direction="row"
//                       alignItems="flex-start"
//                       justifyContent="space-between"
//                     >
//                       <Box>
//                         <Typography
//                           sx={{
//                             fontSize: "1.25rem",
//                             fontWeight: 900,
//                             color: C.neutral900,
//                             letterSpacing: "-0.02em",
//                           }}
//                         >
//                           {selectedReport?.label || "Select a Report"}
//                         </Typography>
//                         {/* <Typography
//                           sx={{
//                             fontSize: "0.8rem",
//                             color: C.neutral400,
//                             mt: 0.4,
//                           }}
//                         >
//                           Detailed analysis for{" "}
//                           {selectedReport?.label?.toLowerCase() ??
//                             "the selected report"}
//                         </Typography> */}

//                         <Stack
//                           direction="row"
//                           gap={0.8}
//                           sx={{ flexWrap: "wrap" }}
//                         >
//                           {[
//                             "POP",
//                             "CLS",
//                             "Patient & OPD",
//                             "admin",
//                             "doctor",
//                             "nurse",
//                           ].map((tag) => (
//                             <Tag key={tag} label={tag} />
//                           ))}
//                         </Stack>
//                       </Box>
//                       <Stack direction="row" gap={1} alignItems="center">
//                         <Tooltip
//                           title={
//                             favoriteReportIds.includes(selectedReportId)
//                               ? "Remove favourite"
//                               : "Add to favourites"
//                           }
//                         >
//                           <IconButton
//                             size="small"
//                             onClick={() => toggleFavorite(selectedReportId)}
//                             sx={{
//                               color: favoriteReportIds.includes(
//                                 selectedReportId,
//                               )
//                                 ? "#F59E0B"
//                                 : C.neutral300,
//                               bgcolor: favoriteReportIds.includes(
//                                 selectedReportId,
//                               )
//                                 ? alpha("#F59E0B", 0.08)
//                                 : C.neutral100,
//                               borderRadius: "8px",
//                               p: 0.8,
//                               "&:hover": { bgcolor: alpha("#F59E0B", 0.12) },
//                             }}
//                           >
//                             {favoriteReportIds.includes(selectedReportId) ? (
//                               <StarIcon sx={{ fontSize: 18 }} />
//                             ) : (
//                               <StarBorderIcon sx={{ fontSize: 18 }} />
//                             )}
//                           </IconButton>
//                         </Tooltip>
//                         <Tooltip title="Share">
//                           <IconButton
//                             size="small"
//                             onClick={() => setIsShareDialogOpen(true)}
//                             sx={{
//                               color: C.neutral400,
//                               bgcolor: C.neutral100,
//                               borderRadius: "8px",
//                               p: 0.8,
//                               "&:hover": { bgcolor: C.neutral200 },
//                             }}
//                           >
//                             <ShareIcon sx={{ fontSize: 18 }} />
//                           </IconButton>
//                         </Tooltip>
//                         <Button
//                           variant="contained"
//                           disableElevation
//                           onClick={handleRunReport}
//                           disabled={isGenerating}
//                           startIcon={
//                             isGenerating ? (
//                               <CircularProgress size={16} color="inherit" />
//                             ) : (
//                               <PlayArrowIcon sx={{ fontSize: 18 }} />
//                             )
//                           }
//                           sx={{
//                             borderRadius: "9px",
//                             textTransform: "none",
//                             fontWeight: 700,
//                             fontSize: "0.82rem",
//                             px: 2.5,
//                             bgcolor: isGenerating
//                               ? alpha(C.success, 0.7)
//                               : C.success,
//                             boxShadow: `0 4px 12px ${alpha(C.success, 0.3)}`,
//                             "&:hover": {
//                               bgcolor: "#089050",
//                               boxShadow: `0 6px 16px ${alpha(C.success, 0.35)}`,
//                             },
//                           }}
//                         >
//                           {isGenerating ? "Running..." : "Run Report"}
//                         </Button>
//                       </Stack>
//                     </Stack>
//                   </Box>
//                 </Stack>
//               </Box>

//               <Divider sx={{ borderColor: C.neutral100 }} />

//               {/* Toolbar */}
//               <Box sx={{ px: 3, py: 1.5, bgcolor: C.neutral50 }}>
//                 <Stack
//                   direction="row"
//                   gap={0.8}
//                   alignItems="center"
//                   flexWrap="wrap"
//                 >
//                   {[
//                     {
//                       icon: <ViewColumnIcon sx={{ fontSize: 15 }} />,
//                       label: "Columns",
//                       onClick: () => setIsColumnChooserOpen(true),
//                     },
//                     {
//                       icon: <CompareIcon sx={{ fontSize: 15 }} />,
//                       label: "Compare Periods",
//                       highlighted: true,
//                       onClick: () => setIsComparePeriodsOpen(true),
//                     },
//                     {
//                       icon: <ScheduleIcon sx={{ fontSize: 15 }} />,
//                       label: "Schedule",
//                       onClick: () => setIsScheduleDialogOpen(true),
//                     },
//                     {
//                       icon: <AssessmentIcon sx={{ fontSize: 15 }} />,
//                       label: "Drill down",
//                       onClick: () => setIsDrillDownOpen(true),
//                     },
//                   ].map(({ icon, label, highlighted, onClick }) => (
//                     <Button
//                       key={label}
//                       size="small"
//                       variant="outlined"
//                       startIcon={icon}
//                       onClick={onClick}
//                       sx={{
//                         borderRadius: "8px",
//                         textTransform: "none",
//                         fontSize: "0.75rem",
//                         fontWeight: 600,
//                         borderColor: highlighted
//                           ? alpha(C.primary, 0.3)
//                           : C.neutral200,
//                         color: highlighted ? C.primary : C.neutral600,
//                         bgcolor: highlighted ? C.primaryLight : C.white,
//                         px: 1.5,
//                         "&:hover": {
//                           borderColor: C.primary,
//                           bgcolor: alpha(C.primary, 0.05),
//                           color: C.primary,
//                         },
//                       }}
//                     >
//                       {label}
//                     </Button>
//                   ))}

//                   <Box
//                     sx={{
//                       width: "1px",
//                       height: 20,
//                       bgcolor: C.neutral200,
//                       mx: 0.5,
//                     }}
//                   />

//                   {["PDF", "Excel", "CSV"].map((fmt) => (
//                     <Button
//                       key={fmt}
//                       size="small"
//                       startIcon={<FileDownloadIcon sx={{ fontSize: 14 }} />}
//                       sx={{
//                         borderRadius: "8px",
//                         textTransform: "none",
//                         fontSize: "0.74rem",
//                         fontWeight: 600,
//                         color: C.neutral500,
//                         bgcolor: C.white,
//                         border: `1px solid ${C.neutral200}`,
//                         px: 1.3,
//                         "&:hover": {
//                           bgcolor: C.neutral100,
//                           borderColor: C.neutral300,
//                         },
//                       }}
//                     >
//                       {fmt}
//                     </Button>
//                   ))}

//                   <Button
//                     size="small"
//                     startIcon={<PrintIcon sx={{ fontSize: 14 }} />}
//                     sx={{
//                       borderRadius: "8px",
//                       textTransform: "none",
//                       fontSize: "0.74rem",
//                       fontWeight: 600,
//                       color: C.neutral500,
//                       bgcolor: C.white,
//                       border: `1px solid ${C.neutral200}`,
//                       px: 1.3,
//                       "&:hover": {
//                         bgcolor: C.neutral100,
//                         borderColor: C.neutral300,
//                       },
//                     }}
//                   >
//                     Print
//                   </Button>
//                 </Stack>
//               </Box>

//               {/* <Divider sx={{ borderColor: C.neutral100 }} /> */}

//               {/* Parameters section inside the same card */}
//               <Stack
//                 direction="row"
//                 alignItems="center"
//                 gap={1}
//                 sx={{ px: 3, py: 2, borderBottom: `1px solid ${C.neutral100}` }}
//               >
//                 <TuneIcon sx={{ fontSize: 18, color: C.primary }} />
//                 <Typography
//                   sx={{
//                     fontSize: "0.82rem",
//                     fontWeight: 800,
//                     color: C.neutral700,
//                     textTransform: "uppercase",
//                     letterSpacing: "0.06em",
//                   }}
//                 >
//                   Parameters
//                 </Typography>
//               </Stack>

//               <Box sx={{ p: 2 }}>
//                 <Grid container spacing={2}>
//                   {parameterFields.map((field, idx) => (
//                     <Grid
//                       item
//                       xs={12}
//                       sm={6}
//                       md={field.width}
//                       lg={field.width}
//                       key={`${field.label}-${idx}`}
//                     >
//                       <Stack spacing={0.6}>
//                         <Typography
//                           sx={{
//                             fontSize: "0.68rem",
//                             fontWeight: 800,
//                             color: C.neutral400,
//                             textTransform: "uppercase",
//                             letterSpacing: "0.07em",
//                           }}
//                         >
//                           {field.label}
//                         </Typography>
//                         {field.type === "date" ? (
//                           <TextField
//                             fullWidth
//                             size="small"
//                             type="date"
//                             defaultValue={field.value}
//                             sx={inputSx}
//                           />
//                         ) : (
//                           <Select
//                             fullWidth
//                             size="small"
//                             defaultValue={field.options[0]}
//                             sx={{
//                               borderRadius: "8px",
//                               fontSize: "0.85rem",
//                               bgcolor: C.white,
//                               "& .MuiOutlinedInput-notchedOutline": {
//                                 borderColor: C.neutral200,
//                               },
//                               "&:hover .MuiOutlinedInput-notchedOutline": {
//                                 borderColor: C.neutral300,
//                               },
//                               "&.Mui-focused .MuiOutlinedInput-notchedOutline":
//                                 {
//                                   borderColor: C.primary,
//                                 },
//                             }}
//                           >
//                             {field.options.map((o: string) => (
//                               <MenuItem
//                                 key={o}
//                                 value={o}
//                                 sx={{ fontSize: "0.85rem" }}
//                               >
//                                 {o}
//                               </MenuItem>
//                             ))}
//                           </Select>
//                         )}
//                       </Stack>
//                     </Grid>
//                   ))}
//                 </Grid>

//                 <Stack direction="row" gap={1.2} sx={{ mt: 3 }}>
//                   <Button
//                     variant="contained"
//                     disableElevation
//                     onClick={handleRunReport}
//                     disabled={isGenerating}
//                     startIcon={
//                       isGenerating ? (
//                         <CircularProgress size={16} color="inherit" />
//                       ) : (
//                         <PlayArrowIcon sx={{ fontSize: 18 }} />
//                       )
//                     }
//                     sx={{
//                       borderRadius: "9px",
//                       textTransform: "none",
//                       fontWeight: 700,
//                       fontSize: "0.85rem",
//                       px: 3,
//                       bgcolor: C.primary,
//                       boxShadow: `0 4px 12px ${alpha(C.primary, 0.3)}`,
//                       "&:hover": { bgcolor: C.primaryDark },
//                     }}
//                   >
//                     {isGenerating ? "Running..." : "Run Report"}
//                   </Button>
//                   <Button
//                     variant="outlined"
//                     startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
//                     sx={{
//                       borderRadius: "9px",
//                       textTransform: "none",
//                       fontWeight: 700,
//                       fontSize: "0.82rem",
//                       px: 2,
//                       borderColor: C.neutral200,
//                       color: C.neutral700,
//                       "&:hover": {
//                         borderColor: C.neutral300,
//                         bgcolor: C.neutral50,
//                       },
//                     }}
//                   >
//                     Save Report
//                   </Button>
//                   <Button
//                     variant="outlined"
//                     startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
//                     sx={{
//                       borderRadius: "9px",
//                       textTransform: "none",
//                       fontWeight: 700,
//                       fontSize: "0.82rem",
//                       px: 2,
//                       borderColor: C.neutral200,
//                       color: C.neutral700,
//                       "&:hover": {
//                         borderColor: C.neutral300,
//                         bgcolor: C.neutral50,
//                       },
//                     }}
//                   >
//                     Reset
//                   </Button>
//                 </Stack>
//               </Box>
//             </Paper>

//             {/* Results Tabs + Table */}
//             <Paper
//               elevation={0}
//               sx={{
//                 borderRadius: "14px",
//                 border: `1px solid ${C.neutral200}`,
//                 bgcolor: C.white,
//                 boxShadow: shadow.card,
//                 overflow: "hidden",
//                 position: "relative",
//               }}
//             >
//               {isGenerating && (
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     bgcolor: "rgba(255, 255, 255, 0.82)",
//                     zIndex: 2000,
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     backdropFilter: "blur(4px)",
//                   }}
//                 >
//                   <Stack spacing={2} alignItems="center">
//                     <CircularProgress
//                       size={48}
//                       thickness={4}
//                       sx={{ color: C.primary }}
//                     />
//                     <Typography
//                       sx={{
//                         fontWeight: 900,
//                         color: C.neutral900,
//                         fontSize: "1.1rem",
//                         letterSpacing: "-0.01em",
//                       }}
//                     >
//                       Running Report...
//                     </Typography>

//                     <Box sx={{ width: 280, mt: 1 }}>
//                       <LinearProgress
//                         sx={{
//                           height: 6,
//                           borderRadius: 3,
//                           bgcolor: alpha(C.primary, 0.1),
//                           "& .MuiLinearProgress-bar": {
//                             borderRadius: 3,
//                             bgcolor: C.primary,
//                           },
//                         }}
//                       />
//                       <Typography
//                         variant="caption"
//                         sx={{
//                           display: "block",
//                           textAlign: "center",
//                           mt: 1.5,
//                           color: C.neutral600,
//                           fontWeight: 700,
//                           fontSize: "0.75rem",
//                         }}
//                       >
//                         Fetching data from hospital records...
//                       </Typography>
//                     </Box>
//                   </Stack>
//                 </Box>
//               )}

//               {/* Tab Bar */}
//               <Box
//                 sx={{
//                   px: 2.5,
//                   py: 1.5,
//                   bgcolor: C.neutral50,
//                   borderBottom: `1px solid ${C.neutral200}`,
//                 }}
//               >
//                 <Stack direction="row" gap={0.5}>
//                   {reportTabs.map((tab) => (
//                     <TabBtn
//                       key={tab.id}
//                       label={tab.label}
//                       icon={tab.icon}
//                       active={activeTab === tab.id}
//                       onClick={() => setActiveTab(tab.id)}
//                     />
//                   ))}
//                 </Stack>
//               </Box>

//               <Box sx={{ p: 2 }}>
//                 {activeTab === "results" && (
//                   <Stack spacing={0}>
//                     <Box
//                       sx={{
//                         // px: 2,
//                         paddingBottom: 2,
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                         bgcolor: C.white,
//                         borderBottom: `1px solid ${C.neutral100}`,
//                       }}
//                     >
//                       <Stack direction="row" spacing={1} alignItems="center">
//                         <Typography
//                           sx={{ fontSize: "0.8rem", color: C.neutral500 }}
//                         >
//                           Showing{" "}
//                           <Box
//                             component="span"
//                             sx={{ color: C.neutral900, fontWeight: 800 }}
//                           >
//                             88
//                           </Box>{" "}
//                           records
//                         </Typography>
//                         <Typography
//                           sx={{
//                             fontSize: "1.2rem",
//                             color: C.neutral200,
//                             mt: -0.5,
//                           }}
//                         >
//                           ·
//                         </Typography>
//                         <Stack
//                           direction="row"
//                           spacing={0.5}
//                           alignItems="center"
//                         >
//                           <CheckCircleOutlineIcon
//                             sx={{ fontSize: 14, color: C.success }}
//                           />
//                           <Typography
//                             sx={{
//                               fontSize: "0.75rem",
//                               color: C.success,
//                               fontWeight: 700,
//                             }}
//                           >
//                             Run complete
//                           </Typography>
//                         </Stack>
//                       </Stack>
//                       <Stack direction="row" spacing={1}>
//                         <Button
//                           variant="outlined"
//                           size="small"
//                           startIcon={<TuneIcon sx={{ fontSize: 14 }} />}
//                           onClick={() => setIsAdvancedFilterOpen(true)}
//                           sx={{
//                             borderRadius: 1.5,
//                             textTransform: "none",
//                             fontSize: "0.75rem",
//                             fontWeight: 700,
//                             color: C.neutral600,
//                             borderColor: C.neutral200,
//                           }}
//                         >
//                           Advanced Filter
//                         </Button>
//                         <Button
//                           variant="outlined"
//                           size="small"
//                           startIcon={<ViewColumnIcon sx={{ fontSize: 14 }} />}
//                           onClick={() => setIsColumnChooserOpen(true)}
//                           sx={{
//                             borderRadius: 1.5,
//                             textTransform: "none",
//                             fontSize: "0.75rem",
//                             fontWeight: 700,
//                             color: C.neutral600,
//                             borderColor: C.neutral200,
//                           }}
//                         >
//                           Columns
//                         </Button>
//                         <Button
//                           variant="contained"
//                           size="small"
//                           startIcon={<FileDownloadIcon sx={{ fontSize: 14 }} />}
//                           onClick={() =>
//                             showNotify("Downloading report data...", "info")
//                           }
//                           sx={{
//                             borderRadius: 1.5,
//                             textTransform: "none",
//                             fontSize: "0.75rem",
//                             fontWeight: 700,
//                             bgcolor: C.success,
//                             "&:hover": { bgcolor: "#089050" },
//                           }}
//                         >
//                           Download
//                         </Button>
//                       </Stack>
//                     </Box>
//                     <CommonTable
//                       rows={resultsData}
//                       columns={filteredResultsColumns}
//                       getRowId={(r) => r.id}
//                     />
//                   </Stack>
//                 )}

//                 {activeTab === "charts" && (
//                   <Box
//                     sx={{
//                       display: "grid",
//                       gridTemplateColumns: "1fr 1fr",
//                       gap: 3,
//                     }}
//                   >
//                     <Paper
//                       component={Box}
//                       sx={{
//                         p: 2,
//                         bgcolor: C.white,
//                         border: `1px solid ${C.neutral200}`,
//                         borderRadius: 3,
//                       }}
//                     >
//                       <Typography
//                         variant="subtitle2"
//                         sx={{ fontWeight: 800, mb: 3 }}
//                       >
//                         Monthly Trend
//                       </Typography>
//                       <Box
//                         sx={{
//                           height: 200,
//                           display: "flex",
//                           alignItems: "flex-end",
//                           gap: 1.5,
//                           px: 2,
//                         }}
//                       >
//                         {[310, 420, 480, 400, 510, 560, 580].map((h, i) => (
//                           <Box
//                             key={i}
//                             sx={{
//                               borderTopLeftRadius: 4,
//                               borderTopRightRadius: 4,
//                               flex: 1,
//                               height: h / 3,
//                               background: `linear-gradient(to top, ${alpha(C.primary, 0.4)}, ${C.primary})`,
//                               position: "relative",
//                             }}
//                           >
//                             <Typography
//                               variant="caption"
//                               sx={{
//                                 position: "absolute",
//                                 top: -20,
//                                 left: 0,
//                                 right: 0,
//                                 textAlign: "center",
//                                 fontWeight: 700,
//                               }}
//                             >
//                               {h}
//                             </Typography>
//                           </Box>
//                         ))}
//                       </Box>
//                       <Stack direction="row" sx={{ mt: 1 }}>
//                         {["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"].map(
//                           (m) => (
//                             <Typography
//                               key={m}
//                               variant="caption"
//                               sx={{
//                                 flex: 1,
//                                 textAlign: "center",
//                                 color: "text.disabled",
//                               }}
//                             >
//                               {m}
//                             </Typography>
//                           ),
//                         )}
//                       </Stack>
//                     </Paper>

//                     <Paper
//                       component={Box}
//                       sx={{
//                         p: 2,
//                         bgcolor: C.white,
//                         border: `1px solid ${C.neutral200}`,
//                         borderRadius: 3,
//                       }}
//                     >
//                       <Typography
//                         variant="subtitle2"
//                         sx={{ fontWeight: 800, mb: 3 }}
//                       >
//                         Department Distribution
//                       </Typography>
//                       <Box
//                         sx={{
//                           height: 200,
//                           display: "flex",
//                           alignItems: "flex-end",
//                           gap: 1.5,
//                           px: 2,
//                         }}
//                       >
//                         {[580, 380, 320, 290, 240, 200].map((h, i) => (
//                           <Box
//                             key={i}
//                             sx={{
//                               borderTopLeftRadius: 4,
//                               borderTopRightRadius: 4,
//                               flex: 1,
//                               height: h / 3,
//                               background: `linear-gradient(to top, ${alpha(C.success, 0.4)}, ${C.success})`,
//                               position: "relative",
//                             }}
//                           >
//                             <Typography
//                               variant="caption"
//                               sx={{
//                                 position: "absolute",
//                                 top: -20,
//                                 left: 0,
//                                 right: 0,
//                                 textAlign: "center",
//                                 fontWeight: 700,
//                               }}
//                             >
//                               {h}
//                             </Typography>
//                           </Box>
//                         ))}
//                       </Box>
//                       <Stack direction="row" sx={{ mt: 1 }}>
//                         {["Gen", "Surg", "Paed", "Gyn", "Ortho", "Cardio"].map(
//                           (m) => (
//                             <Typography
//                               key={m}
//                               variant="caption"
//                               sx={{
//                                 flex: 1,
//                                 textAlign: "center",
//                                 color: "text.disabled",
//                               }}
//                             >
//                               {m}
//                             </Typography>
//                           ),
//                         )}
//                       </Stack>
//                     </Paper>

//                     <Paper
//                       component={Box}
//                       sx={{
//                         p: 2,
//                         bgcolor: C.white,
//                         border: `1px solid ${C.neutral200}`,
//                         borderRadius: 3,
//                       }}
//                     >
//                       <Typography
//                         variant="subtitle2"
//                         sx={{ fontWeight: 800, mb: 3 }}
//                       >
//                         Status Breakdown
//                       </Typography>
//                       <Box
//                         sx={{
//                           height: 200,
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                         }}
//                       >
//                         <Box
//                           sx={{
//                             width: 140,
//                             height: 140,
//                             borderRadius: "50%",
//                             border: "20px solid #f0f0f0",
//                             position: "relative",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                           }}
//                         >
//                           <Box
//                             sx={{
//                               width: 140,
//                               height: 140,
//                               borderRadius: "50%",
//                               border: "20px solid transparent",
//                               borderTopColor: C.success,
//                               position: "absolute",
//                               top: -20,
//                               left: -20,
//                             }}
//                           />
//                           <Typography sx={{ fontWeight: 900 }}>100%</Typography>
//                         </Box>
//                         <Stack spacing={0.5} sx={{ ml: 4 }}>
//                           {[
//                             { l: "Active", v: "58%", c: C.success },
//                             { l: "Closed", v: "28%", c: C.neutral500 },
//                             { l: "Critical", v: "4%", c: C.danger },
//                             { l: "Follow-up", v: "10%", c: C.primary },
//                           ].map((st) => (
//                             <Stack
//                               key={st.l}
//                               direction="row"
//                               spacing={1}
//                               alignItems="center"
//                             >
//                               <Box
//                                 sx={{
//                                   width: 8,
//                                   height: 8,
//                                   borderRadius: "50%",
//                                   bgcolor: st.c,
//                                 }}
//                               />
//                               <Typography
//                                 variant="caption"
//                                 sx={{ fontWeight: 700, width: 60 }}
//                               >
//                                 {st.l}
//                               </Typography>
//                               <Typography
//                                 variant="caption"
//                                 sx={{ fontWeight: 800 }}
//                               >
//                                 {st.v}
//                               </Typography>
//                             </Stack>
//                           ))}
//                         </Stack>
//                       </Box>
//                     </Paper>

//                     <Paper
//                       component={Box}
//                       sx={{
//                         p: 2,
//                         bgcolor: C.white,
//                         border: `1px solid ${C.neutral200}`,
//                         borderRadius: 3,
//                       }}
//                     >
//                       <Typography
//                         variant="subtitle2"
//                         sx={{ fontWeight: 800, mb: 3 }}
//                       >
//                         Weekly Pattern
//                       </Typography>
//                       <Box sx={{ height: 200, px: 2, position: "relative" }}>
//                         <svg width="100%" height="100%" viewBox="0 0 700 200">
//                           <path
//                             d="M0,150 L100,120 L200,130 L300,110 L400,90 L500,160 L600,170"
//                             fill="none"
//                             stroke={C.primary}
//                             strokeWidth="3"
//                           />
//                           <path
//                             d="M0,150 L100,120 L200,130 L300,110 L400,90 L500,160 L600,170 L600,200 L0,200 Z"
//                             fill={alpha(C.primary, 0.1)}
//                           />
//                           {[0, 100, 200, 300, 400, 500, 600].map((x, i) => (
//                             <circle
//                               key={i}
//                               cx={x}
//                               cy={[150, 120, 130, 110, 90, 160, 170][i]}
//                               r="4"
//                               fill={C.white}
//                               stroke={C.primary}
//                               strokeWidth="2"
//                             />
//                           ))}
//                         </svg>
//                         <Stack direction="row" sx={{ mt: 1 }}>
//                           {[
//                             "Mon",
//                             "Tue",
//                             "Wed",
//                             "Thu",
//                             "Fri",
//                             "Sat",
//                             "Sun",
//                           ].map((d) => (
//                             <Typography
//                               key={d}
//                               variant="caption"
//                               sx={{
//                                 flex: 1,
//                                 textAlign: "center",
//                                 color: "text.disabled",
//                               }}
//                             >
//                               {d}
//                             </Typography>
//                           ))}
//                         </Stack>
//                       </Box>
//                     </Paper>
//                   </Box>
//                 )}

//                 {activeTab === "summary" && (
//                   <Box>
//                     <Box
//                       sx={{
//                         display: "grid",
//                         gridTemplateColumns: "repeat(3, 1fr)",
//                         gap: 2,
//                         mb: 3,
//                       }}
//                     >
//                       <StatTile
//                         label="Total Reports Run"
//                         value="248"
//                         subtitle="This month"
//                         tone="primary"
//                       />
//                       <StatTile
//                         label="Unique Users"
//                         value="18"
//                         subtitle="Active reporters"
//                         tone="info"
//                       />
//                       <StatTile
//                         label="Avg Run Time"
//                         value="1.4s"
//                         subtitle="Per report"
//                         tone="success"
//                       />
//                       <StatTile
//                         label="PDF Exports"
//                         value="142"
//                         subtitle="57% of total"
//                         tone="warning"
//                       />
//                       <StatTile
//                         label="Excel Exports"
//                         value="89"
//                         subtitle="36% of total"
//                         tone="success"
//                       />
//                       <StatTile
//                         label="Scheduled Jobs"
//                         value="4"
//                         subtitle="Active schedules"
//                         tone="primary"
//                       />
//                     </Box>

//                     <Typography
//                       variant="caption"
//                       sx={{
//                         fontWeight: 800,
//                         color: "text.disabled",
//                         textTransform: "uppercase",
//                         mt: 4,
//                         mb: 2,
//                         display: "block",
//                       }}
//                     >
//                       Top Departments by Volume
//                     </Typography>
//                     <Stack spacing={2}>
//                       {[
//                         { l: "General Medicine", v: 580, p: 95 },
//                         { l: "Surgery", v: 380, p: 65 },
//                         { l: "Paediatrics", v: 320, p: 55 },
//                         { l: "Gynaecology", v: 290, p: 50 },
//                         { l: "Orthopaedics", v: 240, p: 40 },
//                         { l: "Cardiology", v: 200, p: 35 },
//                       ].map((dept) => (
//                         <Box key={dept.l}>
//                           <Stack
//                             direction="row"
//                             justifyContent="space-between"
//                             alignItems="center"
//                             sx={{ mb: 0.5 }}
//                           >
//                             <Typography
//                               variant="body2"
//                               sx={{ fontWeight: 600 }}
//                             >
//                               {dept.l}
//                             </Typography>
//                             <Typography
//                               variant="body2"
//                               sx={{ fontWeight: 700 }}
//                             >
//                               {dept.v}
//                             </Typography>
//                           </Stack>
//                           <LinearProgress
//                             variant="determinate"
//                             value={dept.p}
//                             sx={{
//                               height: 8,
//                               borderRadius: 4,
//                               bgcolor: alpha(C.primary, 0.1),
//                               "& .MuiLinearProgress-bar": {
//                                 bgcolor: C.primary,
//                               },
//                             }}
//                           />
//                         </Box>
//                       ))}
//                     </Stack>
//                   </Box>
//                 )}

//                 {activeTab === "comparison" && (
//                   <Box>
//                     {/* Period Selector */}
//                     <Box
//                       sx={{
//                         p: 2,
//                         borderRadius: "10px",
//                         bgcolor: C.neutral50,
//                         border: `1px solid ${C.neutral200}`,
//                         mb: 3,
//                       }}
//                     >
//                       <Stack
//                         direction="row"
//                         gap={2}
//                         alignItems="center"
//                         flexWrap="wrap"
//                       >
//                         <Stack direction="row" gap={1.5} alignItems="center">
//                           <Box
//                             sx={{
//                               px: 1.2,
//                               py: 0.5,
//                               borderRadius: "6px",
//                               bgcolor: C.primaryLight,
//                             }}
//                           >
//                             <Typography
//                               sx={{
//                                 fontSize: "0.72rem",
//                                 fontWeight: 800,
//                                 color: C.primary,
//                               }}
//                             >
//                               Period A · {comparisonPeriods.periodA}
//                             </Typography>
//                           </Box>
//                           <TextField
//                             fullWidth
//                             size="small"
//                             type="date"
//                             defaultValue="2025-04-01"
//                             sx={{
//                               "& .MuiOutlinedInput-root": {
//                                 borderRadius: "8px",
//                               },
//                             }}
//                           />
//                         </Stack>
//                         <Box
//                           sx={{
//                             width: "1px",
//                             height: 32,
//                             bgcolor: C.neutral200,
//                           }}
//                         />
//                         <Stack direction="row" gap={1.5} alignItems="center">
//                           <Box
//                             sx={{
//                               px: 1.2,
//                               py: 0.5,
//                               borderRadius: "6px",
//                               bgcolor: alpha(C.warning, 0.1),
//                             }}
//                           >
//                             <Typography
//                               sx={{
//                                 fontSize: "0.72rem",
//                                 fontWeight: 800,
//                                 color: C.warning,
//                               }}
//                             >
//                               Period B · {comparisonPeriods.periodB}
//                             </Typography>
//                           </Box>
//                           <TextField
//                             size="small"
//                             type="date"
//                             defaultValue="2025-02-01"
//                             sx={{ width: 150, ...inputSx }}
//                           />
//                           <Typography
//                             sx={{
//                               fontSize: "0.8rem",
//                               color: C.neutral400,
//                               fontWeight: 600,
//                             }}
//                           >
//                             →
//                           </Typography>
//                           <TextField
//                             size="small"
//                             type="date"
//                             defaultValue="2025-02-28"
//                             sx={{ width: 150, ...inputSx }}
//                           />
//                         </Stack>
//                         <Button
//                           variant="contained"
//                           disableElevation
//                           size="small"
//                           sx={{
//                             ml: "auto",
//                             borderRadius: "8px",
//                             textTransform: "none",
//                             fontWeight: 700,
//                             fontSize: "0.8rem",
//                             px: 2.5,
//                             bgcolor: C.primary,
//                             "&:hover": { bgcolor: C.primaryDark },
//                           }}
//                         >
//                           Run Comparison
//                         </Button>
//                       </Stack>
//                     </Box>

//                     {/* Comparison Table */}
//                     <TableContainer>
//                       <Table size="small">
//                         <TableHead>
//                           <TableRow sx={{ "& td, & th": { border: 0 } }}>
//                             <TableCell
//                               sx={{
//                                 fontSize: "0.7rem",
//                                 fontWeight: 800,
//                                 textTransform: "uppercase",
//                                 letterSpacing: "0.07em",
//                                 color: C.neutral400,
//                                 bgcolor: C.neutral50,
//                                 borderRadius: "8px 0 0 8px",
//                                 py: 1.5,
//                                 pl: 2,
//                                 borderBottom: `1px solid ${C.neutral200}`,
//                               }}
//                             >
//                               Metric
//                             </TableCell>
//                             <TableCell
//                               align="right"
//                               sx={{
//                                 fontSize: "0.7rem",
//                                 fontWeight: 800,
//                                 textTransform: "uppercase",
//                                 letterSpacing: "0.07em",
//                                 color: C.primary,
//                                 bgcolor: C.neutral50,
//                                 py: 1.5,
//                                 borderBottom: `1px solid ${C.neutral200}`,
//                               }}
//                             >
//                               Period A · {comparisonPeriods.periodA}
//                             </TableCell>
//                             <TableCell
//                               align="right"
//                               sx={{
//                                 fontSize: "0.7rem",
//                                 fontWeight: 800,
//                                 textTransform: "uppercase",
//                                 letterSpacing: "0.07em",
//                                 color: C.warning,
//                                 bgcolor: C.neutral50,
//                                 py: 1.5,
//                                 borderBottom: `1px solid ${C.neutral200}`,
//                               }}
//                             >
//                               Period B · {comparisonPeriods.periodB}
//                             </TableCell>
//                             <TableCell
//                               align="right"
//                               sx={{
//                                 fontSize: "0.7rem",
//                                 fontWeight: 800,
//                                 textTransform: "uppercase",
//                                 letterSpacing: "0.07em",
//                                 color: C.neutral400,
//                                 bgcolor: C.neutral50,
//                                 borderRadius: "0 8px 8px 0",
//                                 py: 1.5,
//                                 pr: 2,
//                                 borderBottom: `1px solid ${C.neutral200}`,
//                               }}
//                             >
//                               Change
//                             </TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {comparisonData.map((row, idx) => (
//                             <TableRow
//                               key={row.metric}
//                               sx={{
//                                 "&:hover": { bgcolor: alpha(C.primary, 0.015) },
//                                 "& td": {
//                                   borderBottom:
//                                     idx === comparisonData.length - 1
//                                       ? "none"
//                                       : `1px solid ${C.neutral100}`,
//                                 },
//                               }}
//                             >
//                               <TableCell
//                                 sx={{
//                                   py: 2,
//                                   pl: 2,
//                                   fontWeight: 700,
//                                   fontSize: "0.85rem",
//                                   color: C.neutral800,
//                                 }}
//                               >
//                                 <Stack
//                                   direction="row"
//                                   alignItems="center"
//                                   gap={1.2}
//                                 >
//                                   <DotBadge
//                                     color={
//                                       row.danger
//                                         ? C.danger
//                                         : row.up
//                                           ? C.success
//                                           : C.warning
//                                     }
//                                   />
//                                   {row.metric}
//                                 </Stack>
//                               </TableCell>
//                               <TableCell align="right" sx={{ py: 2 }}>
//                                 <Typography
//                                   sx={{
//                                     fontSize: "0.88rem",
//                                     fontWeight: 700,
//                                     color: C.neutral800,
//                                   }}
//                                 >
//                                   {row.periodA}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell align="right" sx={{ py: 2 }}>
//                                 <Typography
//                                   sx={{
//                                     fontSize: "0.88rem",
//                                     fontWeight: 600,
//                                     color: C.neutral500,
//                                   }}
//                                 >
//                                   {row.periodB}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell align="right" sx={{ py: 2, pr: 2 }}>
//                                 <Box
//                                   sx={{
//                                     display: "inline-flex",
//                                     alignItems: "center",
//                                     gap: 0.4,
//                                     px: 1.2,
//                                     py: 0.5,
//                                     borderRadius: "7px",
//                                     bgcolor: alpha(
//                                       row.danger
//                                         ? C.danger
//                                         : row.up
//                                           ? C.success
//                                           : C.warning,
//                                       0.08,
//                                     ),
//                                   }}
//                                 >
//                                   {row.up ? (
//                                     <ArrowDropUpIcon
//                                       sx={{
//                                         fontSize: 16,
//                                         color: row.danger
//                                           ? C.danger
//                                           : C.success,
//                                         ml: -0.5,
//                                       }}
//                                     />
//                                   ) : (
//                                     <ArrowDropDownIcon
//                                       sx={{
//                                         fontSize: 16,
//                                         color: C.warning,
//                                         ml: -0.5,
//                                       }}
//                                     />
//                                   )}
//                                   <Typography
//                                     sx={{
//                                       fontSize: "0.78rem",
//                                       fontWeight: 800,
//                                       color: row.danger
//                                         ? C.danger
//                                         : row.up
//                                           ? C.success
//                                           : C.warning,
//                                     }}
//                                   >
//                                     {row.change}
//                                   </Typography>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </Box>
//                 )}

//                 {activeTab === "history" && (
//                   <CommonTable
//                     rows={historyData}
//                     columns={historyColumns}
//                     getRowId={(r) => r.id.toString()}
//                     searchBy={(r) => r.user}
//                     searchPlaceholder="Filter run history by user..."
//                   />
//                 )}
//               </Box>
//             </Paper>
//           </Stack>
//         </Box>
//       </Box>

//       {/* ── Create New Report Dialog ── */}
//       <CommonDialog
//         open={isCreateDialogOpen}
//         onClose={() => setIsCreateDialogOpen(false)}
//         title="Create New Report"
//         maxWidth="md"
//         confirmLabel="Create Report"
//         onConfirm={() => setIsCreateDialogOpen(false)}
//         actions={
//           <Stack
//             direction="row"
//             spacing={1.5}
//             sx={{ width: "100%", px: 2, pb: 2 }}
//           >
//             <Button
//               variant="outlined"
//               onClick={() => setIsCreateDialogOpen(false)}
//               sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
//             >
//               Cancel
//             </Button>
//             <Box sx={{ flexGrow: 1 }} />
//             <Button
//               variant="outlined"
//               onClick={() => {
//                 setIsCreateDialogOpen(false);
//                 showNotify("Report saved as draft!", "info");
//               }}
//               sx={{
//                 borderRadius: 1.5,
//                 textTransform: "none",
//                 fontWeight: 700,
//                 borderColor: C.neutral200,
//               }}
//             >
//               Save as Draft
//             </Button>
//             <Button
//               variant="contained"
//               onClick={() => setIsCreateDialogOpen(false)}
//               sx={{
//                 borderRadius: 1.5,
//                 textTransform: "none",
//                 fontWeight: 700,
//                 bgcolor: C.primary,
//               }}
//             >
//               Create Report
//             </Button>
//           </Stack>
//         }
//       >
//         <Stack spacing={3}>
//           {/* Form Fields */}
//           <Stack spacing={0.6}>
//             <Typography
//               sx={{ fontSize: "0.75rem", fontWeight: 700, color: C.neutral700 }}
//             >
//               Report Name{" "}
//               <Box component="span" sx={{ color: C.danger }}>
//                 *
//               </Box>
//             </Typography>
//             <TextField
//               fullWidth
//               size="small"
//               placeholder="e.g. OPD Daily Census — Custom"
//               sx={{
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: 1.5,
//                   bgcolor: alpha(C.primary, 0.02),
//                 },
//               }}
//             />
//           </Stack>

//           <Stack direction="row" spacing={2}>
//             <Stack spacing={0.6} sx={{ flex: 1 }}>
//               <Typography
//                 sx={{
//                   fontSize: "0.75rem",
//                   fontWeight: 700,
//                   color: C.neutral700,
//                 }}
//               >
//                 Category
//               </Typography>
//               <Select
//                 fullWidth
//                 size="small"
//                 defaultValue="Patient & OPD"
//                 sx={{ borderRadius: 1.5 }}
//               >
//                 <MenuItem value="Patient & OPD">Patient & OPD</MenuItem>
//                 <MenuItem value="IPD / Admissions">IPD / Admissions</MenuItem>
//                 <MenuItem value="Billing & Revenue">Billing & Revenue</MenuItem>
//               </Select>
//             </Stack>
//             <Stack spacing={0.6} sx={{ flex: 1 }}>
//               <Typography
//                 sx={{
//                   fontSize: "0.75rem",
//                   fontWeight: 700,
//                   color: C.neutral700,
//                 }}
//               >
//                 Module / Source
//               </Typography>
//               <Select
//                 fullWidth
//                 size="small"
//                 defaultValue="EpicCare Ambulatory (OPD)"
//                 sx={{ borderRadius: 1.5 }}
//               >
//                 <MenuItem value="EpicCare Ambulatory (OPD)">
//                   EpicCare Ambulatory (OPD)
//                 </MenuItem>
//                 <MenuItem value="Inpatient Module">Inpatient Module</MenuItem>
//                 <MenuItem value="Laboratory Information System">
//                   Laboratory Information System
//                 </MenuItem>
//               </Select>
//             </Stack>
//           </Stack>

//           <Stack spacing={0.6}>
//             <Typography
//               sx={{ fontSize: "0.75rem", fontWeight: 700, color: C.neutral700 }}
//             >
//               Description
//             </Typography>
//             <TextField
//               fullWidth
//               multiline
//               rows={3}
//               placeholder="What does this report show?"
//               sx={{
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: 1.5,
//                   bgcolor: alpha(C.primary, 0.02),
//                 },
//               }}
//             />
//           </Stack>

//           <Divider />

//           {/* Fields Selection */}
//           <Box>
//             <Typography
//               sx={{
//                 fontSize: "0.7rem",
//                 fontWeight: 800,
//                 color: C.neutral400,
//                 textTransform: "uppercase",
//                 letterSpacing: "0.05em",
//                 mb: 1.5,
//               }}
//             >
//               Select Fields to Include
//             </Typography>
//             <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//               {availableFields.map((field) => (
//                 <Chip
//                   key={field}
//                   label={field}
//                   onClick={() => toggleField(field)}
//                   variant={
//                     selectedFields.includes(field) ? "filled" : "outlined"
//                   }
//                   sx={{
//                     borderRadius: 1.5,
//                     height: 32,
//                     fontSize: "0.78rem",
//                     fontWeight: 600,
//                     bgcolor: selectedFields.includes(field)
//                       ? alpha(C.primary, 0.1)
//                       : "transparent",
//                     color: selectedFields.includes(field)
//                       ? C.primary
//                       : C.neutral500,
//                     borderColor: selectedFields.includes(field)
//                       ? C.primary
//                       : C.neutral200,
//                     "&:hover": {
//                       bgcolor: selectedFields.includes(field)
//                         ? alpha(C.primary, 0.15)
//                         : alpha(C.primary, 0.05),
//                     },
//                   }}
//                 />
//               ))}
//             </Box>
//           </Box>

//           {/* Report Canvas */}
//           <Box>
//             <Typography
//               sx={{
//                 fontSize: "0.7rem",
//                 fontWeight: 800,
//                 color: C.neutral400,
//                 textTransform: "uppercase",
//                 letterSpacing: "0.05em",
//                 mb: 1.5,
//               }}
//             >
//               Report Canvas
//             </Typography>
//             <Box
//               sx={{
//                 width: "100%",
//                 height: 140,
//                 borderRadius: 2,
//                 border: `2px dashed ${C.neutral200}`,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 bgcolor: alpha(C.neutral100, 0.5),
//               }}
//             >
//               {selectedFields.length === 0 ? (
//                 <Typography
//                   variant="body2"
//                   sx={{ color: C.neutral400, fontWeight: 500 }}
//                 >
//                   Click fields above to add them to your report
//                 </Typography>
//               ) : (
//                 <Stack
//                   direction="row"
//                   spacing={1}
//                   sx={{ flexWrap: "wrap", p: 2 }}
//                 >
//                   {selectedFields.map((f) => (
//                     <Chip
//                       key={f}
//                       label={f}
//                       size="small"
//                       onDelete={() => toggleField(f)}
//                       sx={{
//                         bgcolor: C.white,
//                         border: `1px solid ${C.neutral200}`,
//                       }}
//                     />
//                   ))}
//                 </Stack>
//               )}
//             </Box>
//           </Box>

//           {/* Bottom Controls */}
//           <Stack direction="row" spacing={2} alignItems="flex-start">
//             <Stack spacing={0.6} sx={{ flex: 1 }}>
//               <Typography
//                 sx={{
//                   fontSize: "0.75rem",
//                   fontWeight: 700,
//                   color: C.neutral700,
//                 }}
//               >
//                 Access Roles
//               </Typography>
//               <Autocomplete
//                 multiple
//                 options={["Admin", "Doctor", "Nurse", "Billing", "Reception"]}
//                 defaultValue={["Admin"]}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
//                   />
//                 )}
//                 renderTags={(value, getTagProps) =>
//                   value.map((option, index) => (
//                     <Chip
//                       label={option as string}
//                       size="small"
//                       {...getTagProps({ index })}
//                       sx={{
//                         bgcolor: C.primaryLight,
//                         color: C.primary,
//                         fontWeight: 700,
//                         borderRadius: 1,
//                       }}
//                     />
//                   ))
//                 }
//               />
//             </Stack>
//             <Stack spacing={0.6}>
//               <Typography
//                 sx={{
//                   fontSize: "0.75rem",
//                   fontWeight: 700,
//                   color: C.neutral700,
//                 }}
//               >
//                 Output Formats
//               </Typography>
//               <FormGroup row>
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       size="small"
//                       defaultChecked
//                       sx={{
//                         color: C.primary,
//                         "&.Mui-checked": { color: C.primary },
//                       }}
//                     />
//                   }
//                   label={
//                     <Typography variant="caption" sx={{ fontWeight: 700 }}>
//                       PDF
//                     </Typography>
//                   }
//                 />
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       size="small"
//                       defaultChecked
//                       sx={{
//                         color: C.primary,
//                         "&.Mui-checked": { color: C.primary },
//                       }}
//                     />
//                   }
//                   label={
//                     <Typography variant="caption" sx={{ fontWeight: 700 }}>
//                       Excel
//                     </Typography>
//                   }
//                 />
//                 <FormControlLabel
//                   control={
//                     <Checkbox size="small" sx={{ color: C.neutral300 }} />
//                   }
//                   label={
//                     <Typography variant="caption" sx={{ fontWeight: 500 }}>
//                       CSV
//                     </Typography>
//                   }
//                 />
//               </FormGroup>
//             </Stack>
//           </Stack>
//         </Stack>
//       </CommonDialog>

//       {/* ── Saved Reports Dialog ── */}
//       <CommonDialog
//         open={isSavedReportsDialogOpen}
//         onClose={() => setIsSavedReportsDialogOpen(false)}
//         title="My Saved Reports"
//         maxWidth="md"
//         icon={<SaveIcon />}
//         hideActions
//       >
//         <Box sx={{ p: 1 }}>
//           <CommonTable
//             rows={savedReportsData}
//             columns={savedReportsColumns}
//             getRowId={(r) => r.id.toString()}
//             searchBy={(r) => r.name + r.category + r.params}
//             searchPlaceholder="Search saved reports..."
//           />
//           <Stack
//             direction="row"
//             justifyContent="flex-end"
//             sx={{ mt: 3, pt: 2, borderTop: `1px solid ${C.neutral100}` }}
//           >
//             <Button
//               variant="outlined"
//               onClick={() => setIsSavedReportsDialogOpen(false)}
//               sx={{
//                 borderRadius: 1.5,
//                 textTransform: "none",
//                 fontWeight: 700,
//                 px: 3,
//               }}
//             >
//               Close
//             </Button>
//           </Stack>
//         </Box>
//       </CommonDialog>

//       {/* ── Schedule Report Dialog ── */}
//       <CommonDialog
//         open={isScheduleDialogOpen}
//         onClose={() => setIsScheduleDialogOpen(false)}
//         title="Schedule Report"
//         maxWidth="sm"
//         icon={<AccessTimeIcon sx={{ color: C.danger }} />}
//         confirmLabel="Save Schedule"
//         onConfirm={() => setIsScheduleDialogOpen(false)}
//         confirmButtonProps={{
//           sx: {
//             bgcolor: "#1E40AF",
//             borderRadius: 1.5,
//             textTransform: "none",
//             fontWeight: 700,
//             px: 3,
//           },
//         }}
//       >
//         <Stack spacing={3}>
//           <Stack spacing={0.6}>
//             <Typography
//               sx={{ fontSize: "0.75rem", fontWeight: 700, color: C.neutral700 }}
//             >
//               Report
//             </Typography>
//             <Select
//               fullWidth
//               size="small"
//               defaultValue="Patient Registration Summary"
//               sx={{ borderRadius: 1.5 }}
//             >
//               <MenuItem value="Patient Registration Summary">
//                 Patient Registration Summary
//               </MenuItem>
//               <MenuItem value="OPD Daily Census">OPD Daily Census</MenuItem>
//               <MenuItem value="Revenue Collection">Revenue Collection</MenuItem>
//             </Select>
//           </Stack>

//           <Box>
//             <Typography
//               sx={{
//                 fontSize: "0.7rem",
//                 fontWeight: 800,
//                 color: C.neutral400,
//                 textTransform: "uppercase",
//                 mb: 1.5,
//               }}
//             >
//               Frequency
//             </Typography>
//             <Box
//               sx={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(3, 1fr)",
//                 gap: 1.5,
//               }}
//             >
//               {[
//                 "Daily",
//                 "Weekly",
//                 "Monthly",
//                 "Quarterly",
//                 "Custom",
//                 "On Demand",
//               ].map((freq) => (
//                 <Button
//                   key={freq}
//                   variant={
//                     freq === selectedFrequency ? "contained" : "outlined"
//                   }
//                   onClick={() => setSelectedFrequency(freq)}
//                   sx={{
//                     borderRadius: 1.5,
//                     textTransform: "none",
//                     fontWeight: 700,
//                     fontSize: "0.82rem",
//                     bgcolor:
//                       freq === selectedFrequency
//                         ? alpha("#1E40AF", 0.05)
//                         : "transparent",
//                     color:
//                       freq === selectedFrequency ? "#1E40AF" : C.neutral500,
//                     borderColor:
//                       freq === selectedFrequency ? "#1E40AF" : C.neutral200,
//                     borderWidth: freq === selectedFrequency ? 2 : 1,
//                     "&:hover": {
//                       bgcolor: alpha("#1E40AF", 0.08),
//                       borderColor: "#1E40AF",
//                     },
//                   }}
//                 >
//                   {freq}
//                 </Button>
//               ))}
//             </Box>
//           </Box>

//           <Stack direction="row" spacing={2}>
//             <Stack spacing={0.6} sx={{ flex: 1 }}>
//               <Typography
//                 sx={{
//                   fontSize: "0.75rem",
//                   fontWeight: 700,
//                   color: C.neutral700,
//                 }}
//               >
//                 Time
//               </Typography>
//               <TextField
//                 fullWidth
//                 size="small"
//                 defaultValue="07 : 00 am"
//                 sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
//               />
//             </Stack>
//             <Stack spacing={0.6} sx={{ flex: 1 }}>
//               <Typography
//                 sx={{
//                   fontSize: "0.75rem",
//                   fontWeight: 700,
//                   color: C.neutral700,
//                 }}
//               >
//                 Timezone
//               </Typography>
//               <Select
//                 fullWidth
//                 size="small"
//                 defaultValue="IST (UTC+5:30)"
//                 sx={{ borderRadius: 1.5 }}
//               >
//                 <MenuItem value="IST (UTC+5:30)">IST (UTC+5:30)</MenuItem>
//                 <MenuItem value="UTC">UTC</MenuItem>
//               </Select>
//             </Stack>
//           </Stack>

//           <Box>
//             <Typography
//               sx={{
//                 fontSize: "0.7rem",
//                 fontWeight: 800,
//                 color: C.neutral400,
//                 textTransform: "uppercase",
//                 mb: 1.5,
//               }}
//             >
//               Delivery
//             </Typography>
//             <Stack spacing={2}>
//               <Stack spacing={0.6}>
//                 <Typography
//                   sx={{
//                     fontSize: "0.75rem",
//                     fontWeight: 700,
//                     color: C.neutral700,
//                   }}
//                 >
//                   Email Recipients
//                 </Typography>
//                 <Autocomplete
//                   multiple
//                   options={["admin@hospital.com", "reports@hospital.com"]}
//                   defaultValue={["admin@hospital.com"]}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       size="small"
//                       // placeholder="Add email..."
//                       sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
//                     />
//                   )}
//                   renderTags={(value, getTagProps) =>
//                     value.map((option, index) => (
//                       <Chip
//                         label={option as string}
//                         size="small"
//                         {...getTagProps({ index })}
//                         sx={{
//                           bgcolor: alpha(C.primary, 0.1),
//                           color: C.primary,
//                           fontWeight: 700,
//                           borderRadius: 1,
//                         }}
//                       />
//                     ))
//                   }
//                 />
//               </Stack>
//               <Stack direction="row" spacing={2}>
//                 <Stack spacing={0.6} sx={{ flex: 1 }}>
//                   <Typography
//                     sx={{
//                       fontSize: "0.75rem",
//                       fontWeight: 700,
//                       color: C.neutral700,
//                     }}
//                   >
//                     Output Format
//                   </Typography>
//                   <Select
//                     fullWidth
//                     size="small"
//                     defaultValue="PDF"
//                     sx={{ borderRadius: 1.5 }}
//                   >
//                     <MenuItem value="PDF">PDF</MenuItem>
//                     <MenuItem value="Excel">Excel</MenuItem>
//                   </Select>
//                 </Stack>
//                 <Stack spacing={0.6} sx={{ flex: 1 }}>
//                   <Typography
//                     sx={{
//                       fontSize: "0.75rem",
//                       fontWeight: 700,
//                       color: C.neutral700,
//                     }}
//                   >
//                     Start Date
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     size="small"
//                     type="date"
//                     defaultValue="2025-05-01"
//                     sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
//                   />
//                 </Stack>
//               </Stack>
//             </Stack>
//           </Box>

//           <FormControlLabel
//             control={
//               <Switch
//                 defaultChecked
//                 sx={{
//                   "& .MuiSwitch-switchBase.Mui-checked": { color: C.success },
//                   "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
//                     bgcolor: C.success,
//                   },
//                 }}
//               />
//             }
//             label={
//               <Typography
//                 variant="body2"
//                 sx={{ fontWeight: 600, color: C.neutral600 }}
//               >
//                 Active — Schedule is enabled
//               </Typography>
//             }
//           />
//         </Stack>
//       </CommonDialog>

//       {/* ── Share Report Dialog ── */}
//       <CommonDialog
//         open={isShareDialogOpen}
//         onClose={() => setIsShareDialogOpen(false)}
//         title="Share Report"
//         maxWidth="sm"
//         icon={<LinkIcon />}
//         hideActions
//       >
//         <Stack spacing={3}>
//           <Box>
//             <Typography
//               sx={{
//                 fontSize: "0.7rem",
//                 fontWeight: 800,
//                 color: C.neutral400,
//                 textTransform: "uppercase",
//                 mb: 1.5,
//               }}
//             >
//               Report Link
//             </Typography>
//             <Stack direction="row" spacing={1}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 defaultValue="https://hims.hospital.org/reports/view?id=r1&token=xyz1pgpn"
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     borderRadius: 1.5,
//                     bgcolor: C.neutral50,
//                   },
//                 }}
//               />
//               <Button
//                 variant="contained"
//                 sx={{
//                   textTransform: "none",
//                   fontWeight: 700,
//                   borderRadius: 1.5,
//                   bgcolor: "#1E40AF",
//                 }}
//               >
//                 Copy
//               </Button>
//             </Stack>
//           </Box>

//           <Stack direction="row" spacing={2}>
//             <Stack spacing={0.6} sx={{ flex: 1 }}>
//               <Typography
//                 sx={{
//                   fontSize: "0.75rem",
//                   fontWeight: 700,
//                   color: C.neutral700,
//                 }}
//               >
//                 Expiry
//               </Typography>
//               <Select
//                 fullWidth
//                 size="small"
//                 defaultValue="24 hours"
//                 sx={{ borderRadius: 1.5 }}
//               >
//                 <MenuItem value="24 hours">24 hours</MenuItem>
//                 <MenuItem value="7 days">7 days</MenuItem>
//                 <MenuItem value="30 days">30 days</MenuItem>
//                 <MenuItem value="Never">Never</MenuItem>
//               </Select>
//             </Stack>
//             <Stack spacing={0.6} sx={{ flex: 1 }}>
//               <Typography
//                 sx={{
//                   fontSize: "0.75rem",
//                   fontWeight: 700,
//                   color: C.neutral700,
//                 }}
//               >
//                 Access
//               </Typography>
//               <Select
//                 fullWidth
//                 size="small"
//                 defaultValue="View Only"
//                 sx={{ borderRadius: 1.5 }}
//               >
//                 <MenuItem value="View Only">View Only</MenuItem>
//                 <MenuItem value="Edit / Annotate">Edit / Annotate</MenuItem>
//               </Select>
//             </Stack>
//           </Stack>

//           <Divider />

//           <Box>
//             <Typography
//               sx={{
//                 fontSize: "0.7rem",
//                 fontWeight: 800,
//                 color: C.neutral400,
//                 textTransform: "uppercase",
//                 mb: 1.5,
//               }}
//             >
//               Share Via
//             </Typography>
//             <Box
//               sx={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(3, 1fr)",
//                 gap: 1.5,
//               }}
//             >
//               {[
//                 {
//                   label: "Email",
//                   icon: <EmailIcon sx={{ color: C.primary, fontSize: 24 }} />,
//                 },
//                 {
//                   label: "Teams",
//                   icon: <TeamsIcon sx={{ color: "#6264A7", fontSize: 24 }} />,
//                 },
//                 {
//                   label: "WhatsApp",
//                   icon: (
//                     <WhatsAppIcon sx={{ color: "#25D366", fontSize: 24 }} />
//                   ),
//                 },
//               ].map((item) => (
//                 <Paper
//                   key={item.label}
//                   variant="outlined"
//                   sx={{
//                     p: 2,
//                     borderRadius: 2,
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                     gap: 1,
//                     cursor: "pointer",
//                     border: `1px solid ${C.neutral200}`,
//                     transition: "all 0.15s",
//                     "&:hover": {
//                       bgcolor: alpha(C.primary, 0.04),
//                       borderColor: C.primary,
//                     },
//                   }}
//                 >
//                   {item.icon}
//                   <Typography
//                     variant="caption"
//                     sx={{ fontWeight: 700, color: C.neutral600 }}
//                   >
//                     {item.label}
//                   </Typography>
//                 </Paper>
//               ))}
//             </Box>
//           </Box>

//           <Box>
//             <Typography
//               sx={{
//                 fontSize: "0.7rem",
//                 fontWeight: 800,
//                 color: C.neutral400,
//                 textTransform: "uppercase",
//                 mb: 1.5,
//               }}
//             >
//               Embed Code
//             </Typography>
//             <TextField
//               fullWidth
//               multiline
//               rows={3}
//               defaultValue='<iframe src="https://hims.hospital.org/reports/embed?id=r1" width="100%" height="600"></iframe>'
//               sx={{
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: 1.5,
//                   fontSize: "0.8rem",
//                   fontFamily: "monospace",
//                   color: C.neutral500,
//                 },
//               }}
//             />
//           </Box>

//           <Stack
//             direction="row"
//             justifyContent="flex-end"
//             sx={{ mt: 2, pt: 2, borderTop: `1px solid ${C.neutral100}` }}
//           >
//             <Button
//               variant="outlined"
//               onClick={() => setIsShareDialogOpen(false)}
//               sx={{
//                 borderRadius: 1.5,
//                 textTransform: "none",
//                 fontWeight: 700,
//                 px: 3,
//               }}
//             >
//               Close
//             </Button>
//           </Stack>
//         </Stack>
//       </CommonDialog>

//       {/* ── Advanced Filters Dialog ── */}
//       <CommonDialog
//         open={isAdvancedFilterOpen}
//         onClose={() => setIsAdvancedFilterOpen(false)}
//         title="Advanced Filters"
//         maxWidth="md"
//         icon={<SettingsIcon />}
//         actions={
//           <Stack
//             direction="row"
//             justifyContent="space-between"
//             alignItems="center"
//             sx={{ width: "100%", px: 1 }}
//           >
//             <Button
//               variant="text"
//               onClick={() => {
//                 setSelectedDepts([]);
//                 setSelectedStaff(["All"]);
//                 setCustomConditions([
//                   {
//                     id: Date.now(),
//                     logic: "AND",
//                     field: "MRN",
//                     operator: "equals",
//                     value: "",
//                   },
//                 ]);
//                 showNotify("Filters cleared");
//               }}
//               sx={{
//                 textTransform: "none",
//                 fontWeight: 700,
//                 fontSize: "0.82rem",
//                 color: C.neutral400,
//                 "&:hover": { bgcolor: alpha(C.danger, 0.06), color: C.danger },
//               }}
//             >
//               Clear All Filters
//             </Button>
//             <Stack direction="row" spacing={1.5}>
//               <Button
//                 variant="outlined"
//                 onClick={() => setIsAdvancedFilterOpen(false)}
//                 sx={{
//                   borderRadius: "10px",
//                   textTransform: "none",
//                   fontWeight: 700,
//                   px: 3,
//                   borderColor: C.neutral400,
//                   color: C.neutral700,
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="contained"
//                 onClick={() => {
//                   setIsAdvancedFilterOpen(false);
//                   showNotify("Applying advanced filters...", "success");
//                 }}
//                 sx={{
//                   borderRadius: "10px",
//                   textTransform: "none",
//                   fontWeight: 700,
//                   px: 3,
//                   bgcolor: C.primary,
//                   "&:hover": { bgcolor: C.primaryDark },
//                 }}
//               >
//                 Apply Filters
//               </Button>
//             </Stack>
//           </Stack>
//         }
//       >
//         <Stack spacing={3} sx={{ py: 1 }}>
//           {/* ── Date Range ── */}
//           <Box>
//             <Typography
//               sx={{
//                 fontSize: "0.68rem",
//                 fontWeight: 800,
//                 color: C.neutral400,
//                 textTransform: "uppercase",
//                 letterSpacing: "0.07em",
//                 mb: 1.5,
//               }}
//             >
//               Date Range
//             </Typography>
//             <Stack direction="row" spacing={2}>
//               <Stack spacing={0.6} sx={{ flex: 1.5 }}>
//                 <Typography
//                   variant="caption"
//                   sx={{ fontWeight: 700, color: C.neutral500 }}
//                 >
//                   Preset
//                 </Typography>
//                 <Select
//                   fullWidth
//                   size="small"
//                   defaultValue="Custom"
//                   sx={{
//                     borderRadius: "8px",
//                     fontSize: "0.85rem",
//                     "& .MuiOutlinedInput-notchedOutline": {
//                       borderColor: C.neutral200,
//                     },
//                   }}
//                 >
//                   <MenuItem value="Custom">Custom</MenuItem>
//                   <MenuItem value="Today">Today</MenuItem>
//                   <MenuItem value="Yesterday">Yesterday</MenuItem>
//                   <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
//                 </Select>
//               </Stack>
//               <Stack spacing={0.6} sx={{ flex: 1 }}>
//                 <Typography
//                   variant="caption"
//                   sx={{ fontWeight: 700, color: C.neutral500 }}
//                 >
//                   From
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   type="date"
//                   value={filterStartDate}
//                   onChange={(e) => setFilterStartDate(e.target.value)}
//                   sx={{
//                     "& .MuiOutlinedInput-root": {
//                       borderRadius: "8px",
//                       "& fieldset": { borderColor: C.neutral200 },
//                     },
//                   }}
//                 />
//               </Stack>
//               <Stack spacing={0.6} sx={{ flex: 1 }}>
//                 <Typography
//                   variant="caption"
//                   sx={{ fontWeight: 700, color: C.neutral500 }}
//                 >
//                   To
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   type="date"
//                   value={filterEndDate}
//                   onChange={(e) => setFilterEndDate(e.target.value)}
//                   sx={{
//                     "& .MuiOutlinedInput-root": {
//                       borderRadius: "8px",
//                       "& fieldset": { borderColor: C.neutral200 },
//                     },
//                   }}
//                 />
//               </Stack>
//             </Stack>
//           </Box>

//           {/* ── Department & Staff ── */}
//           <Stack direction="row" spacing={2}>
//             {[
//               {
//                 label: "Department",
//                 items: [
//                   "Surgery",
//                   "Cardiology",
//                   "Paediatrics",
//                   "Orthopaedics",
//                   "Gynaecology",
//                 ],
//                 selected: selectedDepts,
//                 onToggle: (item: string) =>
//                   setSelectedDepts((prev) =>
//                     prev.includes(item)
//                       ? prev.filter((d) => d !== item)
//                       : [...prev, item],
//                   ),
//               },
//               {
//                 label: "Doctor / Staff",
//                 items: [
//                   "All",
//                   "Dr. R. Shah",
//                   "Dr. S. Iyer",
//                   "Dr. N. Joshi",
//                   "Dr. M. Kapoor",
//                 ],
//                 selected: selectedStaff,
//                 onToggle: (item: string) =>
//                   setSelectedStaff((prev) =>
//                     item === "All"
//                       ? ["All"]
//                       : prev.includes(item)
//                         ? prev.filter((s) => s !== item)
//                         : [...prev.filter((s) => s !== "All"), item],
//                   ),
//               },
//             ].map(({ label, items, selected, onToggle }) => (
//               <Stack key={label} spacing={0.6} sx={{ flex: 1 }}>
//                 <Typography
//                   variant="caption"
//                   sx={{ fontWeight: 700, color: C.neutral500 }}
//                 >
//                   {label}
//                 </Typography>
//                 <Box
//                   sx={{
//                     maxHeight: 130,
//                     overflowY: "auto",
//                     borderRadius: "8px",
//                     border: `1px solid ${C.neutral200}`,
//                     bgcolor: "#FAFBFC",
//                     "&::-webkit-scrollbar": { width: 4 },
//                     "&::-webkit-scrollbar-thumb": {
//                       bgcolor: C.neutral200,
//                       borderRadius: 2,
//                     },
//                   }}
//                 >
//                   {items.map((item, idx) => (
//                     <Box
//                       key={item}
//                       onClick={() => onToggle(item)}
//                       sx={{
//                         px: 1.8,
//                         py: 0.9,
//                         fontSize: "0.83rem",
//                         cursor: "pointer",
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 1.2,
//                         bgcolor: selected.includes(item)
//                           ? alpha(C.primary, 0.07)
//                           : "transparent",
//                         color: selected.includes(item)
//                           ? C.primary
//                           : C.neutral700,
//                         fontWeight: selected.includes(item) ? 700 : 500,
//                         borderBottom:
//                           idx < items.length - 1
//                             ? `1px solid ${C.neutral100}`
//                             : "none",
//                         transition: "all 0.12s",
//                         "&:hover": {
//                           bgcolor: selected.includes(item)
//                             ? alpha(C.primary, 0.1)
//                             : alpha(C.primary, 0.03),
//                         },
//                       }}
//                     >
//                       <Box
//                         sx={{
//                           width: 14,
//                           height: 14,
//                           borderRadius: "4px",
//                           border: `2px solid ${selected.includes(item) ? C.primary : C.neutral300}`,
//                           bgcolor: selected.includes(item)
//                             ? C.primary
//                             : "transparent",
//                           flexShrink: 0,
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           transition: "all 0.12s",
//                         }}
//                       >
//                         {selected.includes(item) && (
//                           <Box
//                             component="span"
//                             sx={{
//                               color: "#fff",
//                               fontSize: "0.55rem",
//                               fontWeight: 900,
//                               lineHeight: 1,
//                             }}
//                           >
//                             ✓
//                           </Box>
//                         )}
//                       </Box>
//                       {item}
//                     </Box>
//                   ))}
//                 </Box>
//               </Stack>
//             ))}
//           </Stack>

//           {/* ── Status / Visit Type / Age Group ── */}
//           <Stack direction="row" spacing={2}>
//             {[
//               {
//                 label: "Status",
//                 value: filterStatus,
//                 onChange: (v: string) => setFilterStatus(v),
//                 options: ["All", "Completed", "Pending"],
//               },
//               {
//                 label: "Visit Type",
//                 value: filterVisitType,
//                 onChange: (v: string) => setFilterVisitType(v),
//                 options: ["All", "OPD", "IPD"],
//               },
//               {
//                 label: "Age Group",
//                 value: filterAgeGroup,
//                 onChange: (v: string) => setFilterAgeGroup(v),
//                 options: ["All", "Adult", "Paediatrics"],
//               },
//             ].map(({ label, value, onChange, options }) => (
//               <Stack key={label} spacing={0.6} sx={{ flex: 1 }}>
//                 <Typography
//                   variant="caption"
//                   sx={{ fontWeight: 700, color: C.neutral500 }}
//                 >
//                   {label}
//                 </Typography>
//                 <Select
//                   fullWidth
//                   size="small"
//                   value={value}
//                   onChange={(e) => onChange(e.target.value as string)}
//                   sx={{
//                     borderRadius: "8px",
//                     fontSize: "0.85rem",
//                     "& .MuiOutlinedInput-notchedOutline": {
//                       borderColor: C.neutral200,
//                     },
//                   }}
//                 >
//                   {options.map((o) => (
//                     <MenuItem key={o} value={o} sx={{ fontSize: "0.85rem" }}>
//                       {o}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </Stack>
//             ))}
//           </Stack>

//           <Divider sx={{ borderColor: C.neutral100 }} />

//           {/* ── Custom Conditions ── */}
//           <Box>
//             <Stack
//               direction="row"
//               alignItems="center"
//               justifyContent="space-between"
//               sx={{ mb: 1.5 }}
//             >
//               <Typography
//                 sx={{
//                   fontSize: "0.68rem",
//                   fontWeight: 800,
//                   color: C.neutral400,
//                   textTransform: "uppercase",
//                   letterSpacing: "0.07em",
//                 }}
//               >
//                 Custom Conditions
//               </Typography>
//               <Box
//                 sx={{
//                   px: 1,
//                   py: 0.3,
//                   borderRadius: "5px",
//                   bgcolor: alpha(C.primary, 0.08),
//                 }}
//               >
//                 <Typography
//                   sx={{
//                     fontSize: "0.65rem",
//                     fontWeight: 800,
//                     color: C.primary,
//                   }}
//                 >
//                   Optional
//                 </Typography>
//               </Box>
//             </Stack>

//             <Stack spacing={2}>
//               {customConditions.map((condition, index) => (
//                 <Box
//                   key={condition.id}
//                   sx={{
//                     p: 2,
//                     borderRadius: "10px",
//                     border: `1px solid ${C.neutral200}`,
//                     bgcolor: "#FAFBFC",
//                   }}
//                 >
//                   <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
//                     <Stack spacing={0.6} sx={{ flex: 1 }}>
//                       <Typography
//                         variant="caption"
//                         sx={{ fontWeight: 700, color: C.neutral500 }}
//                       >
//                         AND / OR
//                       </Typography>
//                       <Select
//                         fullWidth
//                         size="small"
//                         value={condition.logic}
//                         onChange={(e) => {
//                           const newConditions = [...customConditions];
//                           newConditions[index].logic = e.target.value as string;
//                           setCustomConditions(newConditions);
//                         }}
//                         sx={{
//                           borderRadius: "8px",
//                           fontSize: "0.85rem",
//                           bgcolor: C.white,
//                           "& .MuiOutlinedInput-notchedOutline": {
//                             borderColor: C.neutral200,
//                           },
//                         }}
//                       >
//                         <MenuItem value="AND">AND</MenuItem>
//                         <MenuItem value="OR">OR</MenuItem>
//                       </Select>
//                     </Stack>
//                     <Stack spacing={0.6} sx={{ flex: 1 }}>
//                       <Typography
//                         variant="caption"
//                         sx={{ fontWeight: 700, color: C.neutral500 }}
//                       >
//                         Field
//                       </Typography>
//                       <Select
//                         fullWidth
//                         size="small"
//                         value={condition.field}
//                         onChange={(e) => {
//                           const newConditions = [...customConditions];
//                           newConditions[index].field = e.target.value as string;
//                           setCustomConditions(newConditions);
//                         }}
//                         sx={{
//                           borderRadius: "8px",
//                           fontSize: "0.85rem",
//                           bgcolor: C.white,
//                           "& .MuiOutlinedInput-notchedOutline": {
//                             borderColor: C.neutral200,
//                           },
//                         }}
//                       >
//                         <MenuItem value="MRN">MRN</MenuItem>
//                         <MenuItem value="Patient Name">Patient Name</MenuItem>
//                         <MenuItem value="Amount">Amount</MenuItem>
//                       </Select>
//                     </Stack>
//                   </Stack>
//                   <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
//                     <Stack spacing={0.6} sx={{ flex: 1 }}>
//                       <Typography
//                         variant="caption"
//                         sx={{ fontWeight: 700, color: C.neutral500 }}
//                       >
//                         Operator
//                       </Typography>
//                       <Select
//                         fullWidth
//                         size="small"
//                         value={condition.operator}
//                         onChange={(e) => {
//                           const newConditions = [...customConditions];
//                           newConditions[index].operator = e.target
//                             .value as string;
//                           setCustomConditions(newConditions);
//                         }}
//                         sx={{
//                           borderRadius: "8px",
//                           fontSize: "0.85rem",
//                           bgcolor: C.white,
//                           "& .MuiOutlinedInput-notchedOutline": {
//                             borderColor: C.neutral200,
//                           },
//                         }}
//                       >
//                         <MenuItem value="equals">equals</MenuItem>
//                         <MenuItem value="contains">contains</MenuItem>
//                         <MenuItem value="greater than">greater than</MenuItem>
//                       </Select>
//                     </Stack>
//                     <Stack spacing={0.6} sx={{ flex: 1 }}>
//                       <Typography
//                         variant="caption"
//                         sx={{ fontWeight: 700, color: C.neutral500 }}
//                       >
//                         Value
//                       </Typography>
//                       <TextField
//                         fullWidth
//                         size="small"
//                         placeholder="Enter value..."
//                         value={condition.value}
//                         onChange={(e) => {
//                           const newConditions = [...customConditions];
//                           newConditions[index].value = e.target.value;
//                           setCustomConditions(newConditions);
//                         }}
//                         sx={{
//                           "& .MuiOutlinedInput-root": {
//                             borderRadius: "8px",
//                             bgcolor: C.white,
//                             "& fieldset": { borderColor: C.neutral200 },
//                           },
//                         }}
//                       />
//                     </Stack>
//                   </Stack>

//                   {customConditions.length > 1 && (
//                     <Box
//                       sx={{
//                         display: "flex",
//                         alignItems: "flex-end",
//                         justifyContent: "flex-end",
//                       }}
//                     >
//                       <Button
//                         onClick={() =>
//                           setCustomConditions(
//                             customConditions.filter((_, i) => i !== index),
//                           )
//                         }
//                         sx={{
//                           // width: "100%",
//                           height: 24,
//                           bgcolor: "#C63728",
//                           borderRadius: "4px",

//                           cursor: "pointer",
//                           mt: 1,
//                           "&:hover": { bgcolor: "#A12A1E" },
//                         }}
//                       >
//                         <CloseIcon sx={{ color: "white", fontSize: 16 }} />
//                       </Button>
//                     </Box>
//                   )}
//                 </Box>
//               ))}
//             </Stack>

//             <Button
//               size="small"
//               onClick={() =>
//                 setCustomConditions([
//                   ...customConditions,
//                   {
//                     id: Date.now(),
//                     logic: "AND",
//                     field: "MRN",
//                     operator: "equals",
//                     value: "",
//                   },
//                 ])
//               }
//               startIcon={<AddIcon sx={{ fontSize: 15 }} />}
//               sx={{
//                 mt: 2,
//                 borderRadius: "8px",
//                 textTransform: "none",
//                 fontWeight: 700,
//                 fontSize: "0.78rem",
//                 px: 2,
//                 height: 38,
//                 border: `1px dashed ${alpha(C.primary, 0.35)}`,
//                 color: C.primary,
//                 bgcolor: alpha(C.primary, 0.03),
//                 "&:hover": {
//                   bgcolor: alpha(C.primary, 0.07),
//                   borderColor: alpha(C.primary, 0.5),
//                 },
//               }}
//             >
//               Add Filter Condition
//             </Button>
//           </Box>
//         </Stack>
//       </CommonDialog>

//       {/* ── Column Chooser Dialog ── */}
//       <CommonDialog
//         open={isColumnChooserOpen}
//         onClose={() => setIsColumnChooserOpen(false)}
//         title="Column Chooser"
//         maxWidth="xs"
//         icon={<VideoLabelIcon />}
//         confirmLabel="Apply"
//         onConfirm={() => {
//           setIsColumnChooserOpen(false);
//           showNotify("Table columns updated!");
//         }}
//       >
//         <Stack spacing={2}>
//           <Stack
//             direction="row"
//             justifyContent="space-between"
//             alignItems="center"
//           >
//             <Typography
//               variant="caption"
//               sx={{ color: C.neutral400, fontWeight: 500 }}
//             >
//               Toggle to show/hide columns
//             </Typography>
//             <Button
//               size="small"
//               onClick={() =>
//                 setVisibleColumns([
//                   "id",
//                   "name",
//                   "registrationDate",
//                   "department",
//                   "doctor",
//                   "amount",
//                   "status",
//                   "format",
//                 ])
//               }
//               sx={{
//                 textTransform: "none",
//                 color: C.neutral600,
//                 fontWeight: 700,
//                 p: 0,
//               }}
//             >
//               Reset Default
//             </Button>
//           </Stack>
//           <Stack spacing={1}>
//             {[
//               { id: "id", label: "ID" },
//               { id: "name", label: "Name" },
//               { id: "registrationDate", label: "Date" },
//               { id: "department", label: "Department" },
//               { id: "doctor", label: "Doctor" },
//               { id: "amount", label: "Amount" },
//               { id: "status", label: "Status" },
//               { id: "format", label: "Format" },
//             ].map((col) => (
//               <Paper
//                 key={col.id}
//                 variant="outlined"
//                 sx={{
//                   px: 2,
//                   py: 1.5,
//                   borderRadius: 1.5,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 1.5,
//                   bgcolor: !visibleColumns.includes(col.id)
//                     ? alpha(C.neutral100, 0.5)
//                     : C.white,
//                   borderColor: C.neutral200,
//                 }}
//               >
//                 <Box
//                   sx={{
//                     color: C.neutral300,
//                     display: "flex",
//                     alignItems: "center",
//                   }}
//                 >
//                   <MenuIcon sx={{ fontSize: 18, transform: "rotate(90deg)" }} />
//                 </Box>
//                 <Typography
//                   variant="body2"
//                   sx={{
//                     fontWeight: 700,
//                     flexGrow: 1,
//                     color: !visibleColumns.includes(col.id)
//                       ? C.neutral400
//                       : C.neutral700,
//                   }}
//                 >
//                   {col.label}
//                 </Typography>
//                 <Stack direction="row" alignItems="center" spacing={1}>
//                   <Switch
//                     size="small"
//                     checked={visibleColumns.includes(col.id)}
//                     onChange={(e) => {
//                       const checked = e.target.checked;
//                       setVisibleColumns((prev) =>
//                         checked
//                           ? [...prev, col.id]
//                           : prev.filter((p) => p !== col.id),
//                       );
//                     }}
//                     sx={{
//                       "& .MuiSwitch-switchBase.Mui-checked": {
//                         color: C.success,
//                       },
//                       "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
//                         { bgcolor: C.success },
//                     }}
//                   />
//                   <Typography
//                     variant="caption"
//                     sx={{
//                       fontWeight: 600,
//                       color: !visibleColumns.includes(col.id)
//                         ? C.neutral300
//                         : C.neutral400,
//                       minWidth: 28,
//                     }}
//                   >
//                     {visibleColumns.includes(col.id) ? "Show" : "Hide"}
//                   </Typography>
//                 </Stack>
//               </Paper>
//             ))}
//           </Stack>
//         </Stack>
//       </CommonDialog>

//       {/* ── Compare Periods Dialog ── */}
//       <CommonDialog
//         open={isComparePeriodsOpen}
//         onClose={() => setIsComparePeriodsOpen(false)}
//         title="Compare Periods"
//         maxWidth="sm"
//         icon={<CompareIcon />}
//         confirmLabel="Run Comparison"
//         onConfirm={() => {
//           setIsComparePeriodsOpen(false);
//           setComparisonPeriods({ periodA: "APR 2025", periodB: "MAR 2025" }); // Example: Update with actual selected periods
//           setActiveTab("comparison");
//           showNotify("Comparison report generated!");
//         }}
//       >
//         <Stack spacing={3}>
//           <Box
//             sx={{ bgcolor: alpha(C.primary, 0.08), p: 2, borderRadius: 1.5 }}
//           >
//             <Typography
//               variant="body2"
//               sx={{ color: C.primary, fontWeight: 500 }}
//             >
//               Compare the same report across two time periods to see changes and
//               trends.
//             </Typography>
//           </Box>

//           <Box>
//             <Typography
//               sx={{
//                 fontSize: "0.7rem",
//                 fontWeight: 800,
//                 color: C.neutral400,
//                 textTransform: "uppercase",
//                 mb: 1.5,
//               }}
//             >
//               Period A
//             </Typography>
//             <Stack direction="row" spacing={2}>
//               <Stack spacing={0.6} sx={{ flex: 1 }}>
//                 <Typography
//                   variant="caption"
//                   sx={{ fontWeight: 700, color: C.neutral600 }}
//                 >
//                   From
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   type="date"
//                   defaultValue="2025-04-01"
//                   sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
//                 />
//               </Stack>
//               <Stack spacing={0.6} sx={{ flex: 1 }}>
//                 <Typography
//                   variant="caption"
//                   sx={{ fontWeight: 700, color: C.neutral600 }}
//                 >
//                   To
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   type="date"
//                   defaultValue="2025-04-30"
//                   sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
//                 />
//               </Stack>
//             </Stack>
//           </Box>

//           <Box>
//             <Typography
//               sx={{
//                 fontSize: "0.7rem",
//                 fontWeight: 800,
//                 color: C.neutral400,
//                 textTransform: "uppercase",
//                 mb: 1.5,
//               }}
//             >
//               Period B
//             </Typography>
//             <Stack direction="row" spacing={2}>
//               <Stack spacing={0.6} sx={{ flex: 1 }}>
//                 <Typography
//                   variant="caption"
//                   sx={{ fontWeight: 700, color: C.neutral600 }}
//                 >
//                   From
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   type="date"
//                   defaultValue="2025-03-01"
//                   sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
//                 />
//               </Stack>
//               <Stack spacing={0.6} sx={{ flex: 1 }}>
//                 <Typography
//                   variant="caption"
//                   sx={{ fontWeight: 700, color: C.neutral600 }}
//                 >
//                   To
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   type="date"
//                   defaultValue="2025-03-04"
//                   sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
//                 />
//               </Stack>
//             </Stack>
//           </Box>

//           <Divider />

//           <Stack spacing={0.6}>
//             <Typography
//               variant="caption"
//               sx={{ fontWeight: 700, color: C.neutral600 }}
//             >
//               Comparison Metric
//             </Typography>
//             <Select
//               fullWidth
//               size="small"
//               defaultValue="Count"
//               sx={{ borderRadius: 1.5 }}
//             >
//               <MenuItem value="Count">Count</MenuItem>
//               <MenuItem value="Revenue">Revenue</MenuItem>
//             </Select>
//           </Stack>
//         </Stack>
//       </CommonDialog>

//       {/* ── Drill-Down Analysis Dialog ── */}
//       <CommonDialog
//         open={isDrillDownOpen}
//         onClose={() => setIsDrillDownOpen(false)}
//         title="Drill-Down Analysis"
//         maxWidth="md"
//         icon={<SearchIcon />}
//         confirmLabel="Export"
//         onConfirm={() => {
//           setIsDrillDownOpen(false);
//           showNotify("Exporting drill-down analysis...", "info");
//         }}
//       >
//         <Stack spacing={4}>
//           <Stack direction="row" spacing={2}>
//             <Stack spacing={0.6} sx={{ flex: 1 }}>
//               <Typography
//                 variant="caption"
//                 sx={{ fontWeight: 700, color: C.neutral600 }}
//               >
//                 Drill by
//               </Typography>
//               <Select
//                 fullWidth
//                 size="small"
//                 defaultValue="Department"
//                 sx={{ borderRadius: 1.5 }}
//               >
//                 <MenuItem value="Department">Department</MenuItem>
//                 <MenuItem value="Doctor">Doctor</MenuItem>
//               </Select>
//             </Stack>
//             <Stack spacing={0.6} sx={{ flex: 1 }}>
//               <Typography
//                 variant="caption"
//                 sx={{ fontWeight: 700, color: C.neutral600 }}
//               >
//                 Metric
//               </Typography>
//               <Select
//                 fullWidth
//                 size="small"
//                 defaultValue="Count"
//                 sx={{ borderRadius: 1.5 }}
//               >
//                 <MenuItem value="Count">Count</MenuItem>
//                 <MenuItem value="Ratio">Ratio</MenuItem>
//               </Select>
//             </Stack>
//           </Stack>

//           <Stack spacing={2}>
//             {[
//               { label: "General Medicine", value: 580, max: 600 },
//               { label: "Surgery", value: 380, max: 600 },
//               { label: "Paediatrics", value: 320, max: 600 },
//               { label: "Gynaecology", value: 290, max: 600 },
//               { label: "Orthopaedics", value: 240, max: 600 },
//               { label: "Cardiology", value: 200, max: 600 },
//             ].map((item) => (
//               <Stack
//                 key={item.label}
//                 direction="row"
//                 alignItems="center"
//                 spacing={3}
//               >
//                 <Typography
//                   variant="body2"
//                   sx={{ fontWeight: 700, color: C.neutral700, width: 140 }}
//                 >
//                   {item.label}
//                 </Typography>
//                 <Box
//                   sx={{
//                     flexGrow: 1,
//                     position: "relative",
//                     height: 26,
//                     bgcolor: C.neutral100,
//                     borderRadius: 1,
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       width: `${(item.value / item.max) * 100}%`,
//                       height: "100%",
//                       bgcolor: C.primaryDark,
//                       borderRadius: 1,
//                     }}
//                   />
//                 </Box>
//                 <Typography
//                   variant="body2"
//                   sx={{
//                     fontWeight: 600,
//                     color: C.neutral500,
//                     width: 40,
//                     textAlign: "right",
//                   }}
//                 >
//                   {item.value}
//                 </Typography>
//               </Stack>
//             ))}
//           </Stack>
//         </Stack>
//       </CommonDialog>

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={4000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//       >
//         <Alert
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           severity={snackbar.severity}
//           variant="filled"
//           sx={{ width: "100%", borderRadius: 2, fontWeight: 600 }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </PageTemplate>
//   );
// }
