"use client";

import {
  Biotech as CytoIcon,
  Bloodtype as BloodIcon,
  BugReport as MicroIcon,
  Memory as MolecIcon,
  Science as BioIcon,
  Storefront as HistoIcon,
  Vaccines as SerologyIcon,
} from "@mui/icons-material";

export const getIconEl = (type: string) => {
  const sx = { fontSize: 17 };
  switch (type) {
    case "blood":
      return <BloodIcon sx={sx} />;
    case "bio":
      return <BioIcon sx={sx} />;
    case "micro":
      return <MicroIcon sx={sx} />;
    case "serology":
      return <SerologyIcon sx={sx} />;
    case "histo":
      return <HistoIcon sx={sx} />;
    case "cyto":
      return <CytoIcon sx={sx} />;
    case "molec":
      return <MolecIcon sx={sx} />;
    default:
      return <BioIcon sx={sx} />;
  }
};
