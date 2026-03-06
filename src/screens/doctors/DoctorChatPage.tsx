"use client";

import * as React from "react";
import { Box, Typography, Stack, Container } from "@/src/ui/components/atoms";
import { CommonChat } from "@/src/ui/components/organisms";
import {
  DOCTOR_CHAT_CONTACTS,
  DOCTOR_CHAT_MESSAGES,
} from "./doctor-chat-mock-data";
import PatientPortalWorkspaceCard from "../patient-portal/components/PatientPortalWorkspaceCard";

export default function DoctorChatPage() {
  return (
    <PatientPortalWorkspaceCard current="chat" hidePatientBar>
      <Stack spacing={2}>
        <CommonChat
          contacts={DOCTOR_CHAT_CONTACTS}
          initialMessages={DOCTOR_CHAT_MESSAGES}
          title="Doctor-Staff Chat"
          height="calc(100vh - 178px)"
        />
      </Stack>
    </PatientPortalWorkspaceCard>
  );
}
