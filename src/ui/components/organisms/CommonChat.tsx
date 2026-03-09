"use client";

import * as React from "react";
import { Box, Button, Stack, Typography } from "@/src/ui/components/atoms";
import { Card } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Send from "@mui/icons-material/Send";
import AttachFile from "@mui/icons-material/AttachFile";
import DoneAll from "@mui/icons-material/DoneAll";
import EmojiEmotions from "@mui/icons-material/EmojiEmotions";
import Search from "@mui/icons-material/Search";
import MoreVert from "@mui/icons-material/MoreVert";
import { Chat as ChatIcon } from "@mui/icons-material";
import { ChatContact, ChatMessage } from "@/src/core/chat/types";

const EMOJIS = ["👍", "❤️", "😊", "🙏", "✅", "👌"];

interface CommonChatProps {
  contacts: ChatContact[];
  initialMessages: Record<string, ChatMessage[]>;
  title?: string;
  height?: string | number;
}

export default function CommonChat({
  contacts,
  initialMessages,
  title = "Chat",
  height = "calc(100vh - 180px)",
}: CommonChatProps) {
  const theme = useTheme();
  const [activeContactId, setActiveContactId] = React.useState(
    contacts[0]?.id || "",
  );
  const [messages, setMessages] = React.useState<Record<string, ChatMessage[]>>(
    () => JSON.parse(JSON.stringify(initialMessages)),
  );
  const [inputText, setInputText] = React.useState("");
  const [contactSearch, setContactSearch] = React.useState("");
  const [showEmoji, setShowEmoji] = React.useState(false);
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set());
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  const activeContact = contacts.find((c) => c.id === activeContactId);
  const activeMessages = messages[activeContactId] ?? [];

  const scrollToBottom = React.useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, []);

  React.useEffect(() => {
    scrollToBottom();
    if (activeContactId) {
      setReadIds((prev) => {
        const next = new Set(prev);
        (messages[activeContactId] ?? [])
          .filter((m) => m.direction === "in")
          .forEach((m) => next.add(m.id));
        return next;
      });
    }
  }, [activeContactId, activeMessages.length, scrollToBottom, messages]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !activeContactId) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const outgoing: ChatMessage = {
      id: `msg-${Date.now()}`,
      contactId: activeContactId,
      text: trimmed,
      time: timeStr,
      direction: "out",
    };
    setMessages((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] ?? []), outgoing],
    }));
    setInputText("");
    setShowEmoji(false);

    // Simulated reply
    setTimeout(() => {
      const replyTimeStr = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const reply: ChatMessage = {
        id: `msg-${Date.now()}-reply`,
        contactId: activeContactId,
        text: "Thank you for your message. I will get back to you shortly.",
        time: replyTimeStr,
        direction: "in",
      };
      setMessages((prev) => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] ?? []), reply],
      }));
    }, 1000);
  };

  const handleEmojiInsert = (emoji: string) => {
    setInputText((p) => p + emoji);
    setShowEmoji(false);
  };

  const totalUnread = contacts.reduce((sum, c) => sum + c.unreadCount, 0);

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.department.toLowerCase().includes(contactSearch.toLowerCase()),
  );

  if (!activeContact) {
    return (
      <Card elevation={0} sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">No contacts available</Typography>
      </Card>
    );
  }

  return (
    <Card
      //   elevation={0}
      sx={{
        height,
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        p: 0,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "rgba(17, 114, 186, 0.14)",
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "rgba(17, 114, 186, 0.14)",
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <ChatIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {totalUnread > 0 && (
              <Chip
                size="small"
                label={totalUnread}
                sx={{
                  height: 20,
                  fontWeight: 700,
                  fontSize: 11,
                  bgcolor: alpha(theme.palette.error.main, 0.12),
                  color: "error.main",
                  "& .MuiChip-label": { px: 0.9 },
                }}
              />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {contacts.filter((c) => c.online).length} online
          </Typography>
        </Stack>
      </Box>

      {/* ── Main Layout ── */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Left sidebar: Contact list */}
        <Box
          sx={{
            width: 280,
            minWidth: 280,
            borderRight: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Search contacts…"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search
                    sx={{ fontSize: 18, color: "text.disabled", mr: 1 }}
                  />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13.5 },
              }}
            />
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {filteredContacts.map((contact) => {
              const isActive = contact.id === activeContactId;
              const msgs = messages[contact.id] ?? [];
              const lastMsg = msgs[msgs.length - 1];
              return (
                <Box
                  key={contact.id}
                  onClick={() => setActiveContactId(contact.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    cursor: "pointer",
                    borderLeft: isActive
                      ? `4px solid ${theme.palette.primary.main}`
                      : "4px solid transparent",
                    bgcolor: isActive
                      ? alpha(theme.palette.primary.main, 0.08)
                      : "transparent",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                    transition: "all 0.2s",
                  }}
                >
                  <Box sx={{ position: "relative", flexShrink: 0 }}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: contact.color,
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {contact.initials}
                    </Avatar>
                    {contact.online && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 2,
                          right: 2,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: "success.main",
                          border: "2px solid",
                          borderColor: "background.paper",
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: contact.unreadCount > 0 ? 800 : 600,
                          fontSize: 13.5,
                        }}
                        noWrap
                      >
                        {contact.name}
                      </Typography>
                      {lastMsg && (
                        <Typography
                          variant="caption"
                          sx={{ fontSize: 10, color: "text.disabled" }}
                        >
                          {lastMsg.time}
                        </Typography>
                      )}
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{
                          display: "block",
                          flex: 1,
                          minWidth: 0,
                          fontSize: 12,
                        }}
                      >
                        {lastMsg?.text ?? contact.lastMessage}
                      </Typography>
                      {contact.unreadCount > 0 && (
                        <Box
                          sx={{
                            bgcolor: "primary.main",
                            color: "#fff",
                            borderRadius: "10px",
                            px: 0.8,
                            minWidth: 20,
                            height: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 800,
                            ml: 1,
                          }}
                        >
                          {contact.unreadCount}
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Right Area: Messages */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            bgcolor: alpha(theme.palette.primary.main, 0.01),
          }}
        >
          {/* Active Contact Header */}
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: activeContact.color,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {activeContact.initials}
                </Avatar>
                {activeContact.online && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 1,
                      right: 1,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: "success.main",
                      border: "2px solid",
                      borderColor: "background.paper",
                    }}
                  />
                )}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {activeContact.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activeContact.department}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Clear chat">
                <Button
                  size="small"
                  variant="text"
                  sx={{ width: 50, height: 50, borderRadius: "50%" }}
                >
                  <MoreVert sx={{ fontSize: 20, color: "text.secondary" }} />
                </Button>
              </Tooltip>
            </Stack>
          </Box>

          {/* Messages List */}
          <Box
            ref={messagesContainerRef}
            sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5 }}
          >
            {activeMessages.map((msg) => {
              const isOut = msg.direction === "out";
              const isRead = isOut
                ? readIds.has(`${msg.id}-read`) || true
                : true; // Mocking all as read for now
              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: "flex",
                    justifyContent: isOut ? "flex-end" : "flex-start",
                    mb: 2,
                    alignItems: "flex-end",
                    gap: 1,
                  }}
                >
                  {!isOut && (
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: activeContact.color,
                        fontSize: 11,
                        fontWeight: 800,
                        mb: 0.5,
                      }}
                    >
                      {activeContact.initials}
                    </Avatar>
                  )}
                  <Box sx={{ maxWidth: "75%" }}>
                    <Box
                      sx={{
                        px: 2,
                        py: 1.25,
                        borderRadius: isOut
                          ? "18px 18px 2px 18px"
                          : "2px 18px 18px 18px",
                        bgcolor: isOut
                          ? theme.palette.primary.main
                          : theme.palette.background.paper,
                        color: isOut ? "#fff" : "text.primary",
                        border: isOut ? "none" : "1px solid",
                        borderColor: "divider",
                        boxShadow: isOut
                          ? "0 4px 12px " +
                            alpha(theme.palette.primary.main, 0.2)
                          : "0 2px 8px rgba(0,0,0,0.04)",
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      {msg.text}
                    </Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      sx={{
                        mt: 0.5,
                        px: 0.5,
                        justifyContent: isOut ? "flex-end" : "flex-start",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "text.disabled", fontSize: 10 }}
                      >
                        {msg.time}
                      </Typography>
                      {isOut && (
                        <DoneAll
                          sx={{ fontSize: 12, color: theme.palette.info.main }}
                        />
                      )}
                    </Stack>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Emoji row */}
          {showEmoji && (
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor: theme.palette.background.paper,
                borderTop: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {EMOJIS.map((e) => (
                <Button
                  key={e}
                  onClick={() => handleEmojiInsert(e)}
                  sx={{ minWidth: 40, height: 40, fontSize: 20 }}
                >
                  {e}
                </Button>
              ))}
              <Box sx={{ flex: 1 }} />
              <Tooltip title="Close">
                <Button
                  variant="text"
                  onClick={() => setShowEmoji(false)}
                  sx={{
                    minWidth: 36,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    color: "text.secondary",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.error.main, 0.08),
                      color: "error.main",
                    },
                  }}
                >
                  ✕
                </Button>
              </Tooltip>
            </Box>
          )}

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              bgcolor: theme.palette.background.paper,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Attach File">
                <Button
                  variant="text"
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    color: "text.secondary",
                  }}
                >
                  <AttachFile sx={{ fontSize: 20 }} />
                </Button>
              </Tooltip>
              <Tooltip title="Emojis">
                <Button
                  variant="text"
                  onClick={() => setShowEmoji(!showEmoji)}
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    color: showEmoji ? "primary.main" : "text.secondary",
                  }}
                >
                  <EmojiEmotions sx={{ fontSize: 20 }} />
                </Button>
              </Tooltip>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 6,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  },
                }}
              />
              <Button
                variant="contained"
                disableElevation
                disabled={!inputText.trim()}
                onClick={handleSend}
                sx={{
                  minWidth: 44,
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  p: 0,
                }}
              >
                <Send sx={{ fontSize: 20 }} />
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
