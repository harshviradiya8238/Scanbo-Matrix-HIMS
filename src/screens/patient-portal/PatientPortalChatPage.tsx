'use client';

import * as React from 'react';
import { Box, Button, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Send from '@mui/icons-material/Send';
import FiberManualRecord from '@mui/icons-material/FiberManualRecord';
import AttachFile from '@mui/icons-material/AttachFile';
import DoneAll from '@mui/icons-material/DoneAll';
import EmojiEmotions from '@mui/icons-material/EmojiEmotions';
import Search from '@mui/icons-material/Search';
import MoreVert from '@mui/icons-material/MoreVert';
import { Chat as ChatIcon } from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { CHAT_CONTACTS, CHAT_MESSAGES } from './patient-portal-mock-data';
import type { ChatMessage } from './patient-portal-types';
import { ppSectionCard, ppSectionHeader } from './patient-portal-styles';

const EMOJIS = ['👍', '❤️', '😊', '🙏', '✅', '👌'];

export default function PatientPortalChatPage() {
  const theme = useTheme();
  const [activeContactId, setActiveContactId] = React.useState(CHAT_CONTACTS[0].id);
  const [messages, setMessages] = React.useState<Record<string, ChatMessage[]>>(() =>
    JSON.parse(JSON.stringify(CHAT_MESSAGES)),
  );
  const [inputText, setInputText] = React.useState('');
  const [contactSearch, setContactSearch] = React.useState('');
  const [showEmoji, setShowEmoji] = React.useState(false);
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set());
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const activeContact = CHAT_CONTACTS.find((c) => c.id === activeContactId)!;
  const activeMessages = messages[activeContactId] ?? [];

  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  React.useEffect(() => {
    scrollToBottom();
    // Mark incoming messages as read when contact is opened
    setReadIds((prev) => {
      const next = new Set(prev);
      (messages[activeContactId] ?? []).filter((m) => m.direction === 'in').forEach((m) => next.add(m.id));
      return next;
    });
  }, [activeContactId, activeMessages.length, scrollToBottom, messages]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const outgoing: ChatMessage = {
      id: `msg-${Date.now()}`,
      contactId: activeContactId,
      text: trimmed,
      time: timeStr,
      direction: 'out',
    };
    setMessages((prev) => ({ ...prev, [activeContactId]: [...(prev[activeContactId] ?? []), outgoing] }));
    setInputText('');
    setShowEmoji(false);

    setTimeout(() => {
      const replyTimeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const reply: ChatMessage = {
        id: `msg-${Date.now()}-reply`,
        contactId: activeContactId,
        text: 'Thank you for your message. I will get back to you shortly.',
        time: replyTimeStr,
        direction: 'in',
      };
      setMessages((prev) => ({ ...prev, [activeContactId]: [...(prev[activeContactId] ?? []), reply] }));
    }, 900);
  };

  const handleEmojiInsert = (emoji: string) => {
    setInputText((p) => p + emoji);
    setShowEmoji(false);
  };

  const sectionCard = ppSectionCard(theme);
  const sectionHeader = ppSectionHeader(theme);
  const totalUnread = CHAT_CONTACTS.reduce((sum, c) => sum + c.unreadCount, 0);

  const filteredContacts = CHAT_CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.department.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <PatientPortalWorkspaceCard current="chat" hidePatientBar>
      <Card elevation={0} sx={{ ...sectionCard, height: 'calc(100vh - 178px)', display: 'flex', flexDirection: 'column' }}>
        {/* ── Section header ── */}
        <Box sx={sectionHeader}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <ChatIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Chat</Typography>
              {totalUnread > 0 && (
                <Chip size="small" label={totalUnread}
                  sx={{ height: 20, fontWeight: 700, fontSize: 11,
                    bgcolor: alpha(theme.palette.error.main, 0.12), color: 'error.main',
                    '& .MuiChip-label': { px: 0.9 } }} />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {CHAT_CONTACTS.filter((c) => c.online).length} online
            </Typography>
          </Stack>
        </Box>

        {/* ── Chat layout ── */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

          {/* Left sidebar */}
          <Box sx={{ width: 260, minWidth: 260, borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            {/* Search */}
            <Box sx={{ p: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
              <TextField
                size="small" fullWidth placeholder="Search contacts…"
                value={contactSearch} onChange={(e) => setContactSearch(e.target.value)}
                InputProps={{ startAdornment: <Search sx={{ fontSize: 16, color: 'text.disabled', mr: 0.75 }} /> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
              />
            </Box>

            {/* Contact list */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {filteredContacts.map((contact) => {
                const isActive = contact.id === activeContactId;
                const msgs = messages[contact.id] ?? [];
                const lastMsg = msgs[msgs.length - 1];
                return (
                  <Box key={contact.id} onClick={() => setActiveContactId(contact.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1.25,
                      cursor: 'pointer',
                      borderLeft: isActive ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                      bgcolor: isActive ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                      transition: 'background 0.15s',
                    }}>
                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: contact.color, fontWeight: 700, fontSize: 13 }}>
                        {contact.initials}
                      </Avatar>
                      {contact.online && (
                        <Box sx={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main', border: '2px solid', borderColor: 'background.paper' }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: contact.unreadCount > 0 ? 800 : 600, lineHeight: 1.3 }} noWrap>
                          {contact.name}
                        </Typography>
                        {lastMsg && (
                          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled', flexShrink: 0 }}>
                            {lastMsg.time}
                          </Typography>
                        )}
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', flex: 1, minWidth: 0, fontSize: 12 }}>
                          {lastMsg?.text ?? contact.lastMessage}
                        </Typography>
                        {contact.unreadCount > 0 && (
                          <Box sx={{ bgcolor: 'primary.main', color: '#fff', borderRadius: '10px', px: 0.6, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, ml: 0.5 }}>
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

          {/* Right message area */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Active contact header */}
            <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar sx={{ width: 38, height: 38, bgcolor: activeContact.color, fontWeight: 700, fontSize: 13 }}>
                    {activeContact.initials}
                  </Avatar>
                  {activeContact.online && (
                    <Box sx={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', bgcolor: 'success.main', border: '2px solid', borderColor: 'background.paper' }} />
                  )}
                </Box>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activeContact.name}</Typography>
                    {activeContact.online && (
                      <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>Online</Typography>
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">{activeContact.department}</Typography>
                </Box>
              </Stack>
              <Tooltip title="More options">
                <Button variant="text" size="small" sx={{ minWidth: 36, width: 36, height: 36, borderRadius: '50%', p: 0 }}>
                  <MoreVert sx={{ fontSize: 18, color: 'text.secondary' }} />
                </Button>
              </Tooltip>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: alpha(theme.palette.primary.main, 0.015), px: 2, py: 2 }}>
              {/* Date separator */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
                <Typography variant="caption" color="text.disabled" sx={{ px: 1.5, fontWeight: 600, fontSize: 11 }}>Today</Typography>
                <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
              </Box>

              {activeMessages.map((msg) => {
                const isOut = msg.direction === 'out';
                const isRead = isOut ? readIds.has(`${msg.id}-read`) : true;
                return (
                  <Box key={msg.id} sx={{ display: 'flex', justifyContent: isOut ? 'flex-end' : 'flex-start', mb: 1.5, alignItems: 'flex-end', gap: 0.75 }}>
                    {!isOut && (
                      <Avatar sx={{ width: 28, height: 28, bgcolor: activeContact.color, fontSize: 11, fontWeight: 700, flexShrink: 0, mb: 0.25 }}>
                        {activeContact.initials}
                      </Avatar>
                    )}
                    <Box sx={{ maxWidth: '68%' }}>
                      <Box sx={{
                        px: 1.75, py: 1,
                        borderRadius: isOut ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                        bgcolor: isOut ? theme.palette.primary.main : theme.palette.background.paper,
                        color: isOut ? '#fff' : 'text.primary',
                        border: isOut ? 'none' : '1px solid',
                        borderColor: isOut ? undefined : alpha(theme.palette.divider, 0.6),
                        boxShadow: isOut ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                        fontSize: 13.5, lineHeight: 1.55,
                      }}>
                        {msg.text}
                      </Box>
                      <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mt: 0.3, px: 0.5, justifyContent: isOut ? 'flex-end' : 'flex-start' }}>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10.5 }}>{msg.time}</Typography>
                        {isOut && (
                          <DoneAll sx={{ fontSize: 12, color: isRead ? theme.palette.info.main : 'text.disabled' }} />
                        )}
                      </Stack>
                    </Box>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

            {/* Emoji picker */}
            {showEmoji && (
              <Box sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 0.75 }}>
                {EMOJIS.map((e) => (
                  <Button key={e} variant="text" onClick={() => handleEmojiInsert(e)}
                    sx={{ minWidth: 36, width: 36, height: 36, p: 0, fontSize: 18, borderRadius: 1 }}>
                    {e}
                  </Button>
                ))}
              </Box>
            )}

            {/* Input row */}
            <Box sx={{ px: 1.5, py: 1.25, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Tooltip title="Attach file">
                <Button variant="text" size="small" sx={{ minWidth: 36, width: 36, height: 36, borderRadius: '50%', p: 0, color: 'text.secondary' }}>
                  <AttachFile sx={{ fontSize: 18 }} />
                </Button>
              </Tooltip>
              <Tooltip title="Emoji">
                <Button variant="text" size="small" onClick={() => setShowEmoji((p) => !p)}
                  sx={{ minWidth: 36, width: 36, height: 36, borderRadius: '50%', p: 0, color: showEmoji ? 'primary.main' : 'text.secondary' }}>
                  <EmojiEmotions sx={{ fontSize: 18 }} />
                </Button>
              </Tooltip>
              <TextField
                fullWidth size="small" placeholder="Type a message…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px', fontSize: 13.5 } }}
              />
              <Button variant="contained" disableElevation onClick={handleSend} disabled={!inputText.trim()}
                sx={{ minWidth: 40, width: 40, height: 40, borderRadius: '50%', p: 0, flexShrink: 0 }}>
                <Send sx={{ fontSize: 18 }} />
              </Button>
            </Box>
          </Box>
        </Box>
      </Card>
    </PatientPortalWorkspaceCard>
  );
}
