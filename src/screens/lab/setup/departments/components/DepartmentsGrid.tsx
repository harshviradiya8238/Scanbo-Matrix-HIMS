"use client";

import * as React from "react";
import { Grid } from "@/src/ui/components/atoms";
import type { Department } from "../types";
import { DeptCard } from "./DeptCard";

interface DepartmentsGridProps {
  departments: Department[];
  onEdit: (department: Department) => void;
}

function DepartmentsGridBase({ departments, onEdit }: DepartmentsGridProps) {
  return (
    <Grid container spacing={2}>
      {departments.map((dept) => (
        <Grid item xs={12} md={6} lg={4} key={dept.id}>
          <DeptCard dept={dept} onEdit={onEdit} />
        </Grid>
      ))}
    </Grid>
  );
}

export const DepartmentsGrid = React.memo(DepartmentsGridBase);
