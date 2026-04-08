"use client";

import * as React from "react";
import { Box, Stack } from "@/src/ui/components/atoms";
import { alpha } from "@mui/material";
import { CATEGORIES } from "../data";
import { T } from "../tokens";

interface TestCatalogCategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

function TestCatalogCategoryTabsBase({
  activeCategory,
  onCategoryChange,
}: TestCatalogCategoryTabsProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ px: 0.5 }}>
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <Box
            key={cat}
            onClick={() => onCategoryChange(cat)}
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 700,
              transition: "all 0.15s ease",
              bgcolor: isActive ? T.primary : T.white,
              color: isActive ? T.white : T.textSecondary,
              border: `1px solid ${isActive ? T.primary : T.border}`,
              boxShadow: isActive
                ? `0 4px 12px ${alpha(T.primary, 0.25)}`
                : "none",
              "&:hover": {
                borderColor: isActive ? T.primary : "#94A3B8",
                bgcolor: isActive ? T.primary : T.surfaceHover,
              },
            }}
          >
            {cat}
          </Box>
        );
      })}
    </Stack>
  );
}

export const TestCatalogCategoryTabs = React.memo(TestCatalogCategoryTabsBase);
