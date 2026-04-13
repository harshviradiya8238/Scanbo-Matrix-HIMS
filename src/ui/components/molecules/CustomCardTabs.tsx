"use client";
import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import CommonTabs, {
  CommonTabItem,
} from "@/src/ui/components/molecules/CommonTabs";

// ✅ Types
interface TabItem {
  label: React.ReactNode;
  icon?: React.ReactElement;
  child: React.ReactNode;
  disabled?: boolean;
  cardAction?: React.ReactNode;
}

interface CustomCardTabsProps {
  items: TabItem[];
  title?: string;
  defaultValue?: number;
  header?: React.ReactNode;
  sx?: any;
  tabsSx?: any;
  orientation?: "horizontal" | "vertical";
  sticky?: boolean;
  showBackground?: boolean;
  onChange?: (index: number) => void;
  scrollable?: boolean;
}

// ✅ Tab Panel
interface CustomTabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const CustomTabPanel: React.FC<CustomTabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{
        display: value === index ? "flex" : "none",
        flexDirection: "column",
        flex: 1,
        height: "100%",
        minHeight: 0,
      }}
      {...other}
    >
      {value === index && (
        <Box
          sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
};

const CustomCardTabs: React.FC<CustomCardTabsProps> = ({
  items = [],
  defaultValue = 0,
  header,
  sx,
  tabsSx,
  orientation = "horizontal",
  sticky = true,
  showBackground = true,
  onChange,
  scrollable = false,
  title
}) => {
  const [tabValue, setTabValue] = useState<number>(defaultValue);

  useEffect(() => {
    setTabValue(defaultValue ?? 0);
  }, [defaultValue]);

  if (!items || items.length === 0) return null;

  const tabs: CommonTabItem<string>[] = items.map((t, i) => ({
    id: i.toString(),
    label: t.label,
    icon: t.icon,
    disabled: t.disabled,
  }));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        ...sx,
      }}
    >
      <Box
        sx={{
          position: sticky ? "sticky" : "relative",
          top: 0,
          zIndex: 10,
          p: 1,
          borderRadius: 2,
          backgroundColor: showBackground ? "background.paper" : "transparent",
          borderColor: showBackground ? "divider" : "transparent",
          boxShadow: showBackground ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
          display: "flex",
          alignItems: "center",
          gap: 2,
          ...tabsSx,
        }}
      >

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CommonTabs
            tabs={tabs}
            value={tabValue.toString()}
            onChange={(val) => {
              const newValue = Number(val);
              setTabValue(newValue);
              if (onChange) onChange(newValue);
            }}
            variant="scrollable"
          />
        </Box>
        {header && <Box sx={{ flexShrink: 0 }}>{header}</Box>}
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflowY: scrollable ? "auto" : "hidden",
          overflowX: "hidden",
          pt: orientation === "horizontal" ? 2 : 0,
        }}
      >
        {items.map((t, i) => (
          <CustomTabPanel key={i} value={tabValue} index={i}>
            {t.child}
          </CustomTabPanel>
        ))}
      </Box>
    </Box>
  );
};

export default CustomCardTabs;
