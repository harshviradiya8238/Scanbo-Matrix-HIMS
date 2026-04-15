"use client";

import * as React from "react";
import { AppLoaderOverlay } from "@/src/ui/components/loaders/LoaderPrimitives";

interface HimsLoaderProps {
  open: boolean;
  message?: string;
  dimBackground?: boolean;
  pointerEvents?: "auto" | "none";
}

const HimsLoader: React.FC<HimsLoaderProps> = ({
  open,
  message = "Loading...",
  dimBackground = true,
  pointerEvents = "auto",
}) => {
  return (
    <AppLoaderOverlay
      open={open}
      message={message}
      scope="fullscreen"
      dimBackground={dimBackground}
      pointerEvents={pointerEvents}
    />
  );
};

export default HimsLoader;
