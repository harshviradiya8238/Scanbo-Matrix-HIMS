'use client';

import * as React from 'react';
import { Box, Button, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Send from '@mui/icons-material/Send';
import FiberManualRecord from '@mui/icons-material/FiberManualRecord';
import AttachFile from '@mui/icons-material/AttachFile';
import DoneAll from '@mui/icons-material/DoneAll';
import EmojiEmotions from '@mui/icons-material/EmojiEmotions';
import Search from '@mui/icons-material/Search';
import MoreVert from '@mui/icons-material/MoreVert';
import SmartToy from '@mui/icons-material/SmartToy';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import { Chat as ChatIcon } from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { CHAT_CONTACTS, CHAT_MESSAGES } from './patient-portal-mock-data';
import type { ChatMessage } from './patient-portal-types';
import { ppSectionCard, ppSectionHeader } from './patient-portal-styles';

const EMOJIS = ['👍', '❤️', '😊', '🙏', '✅', '👌'];

/* ─── Chatbot quick replies & logic ─────────────────────────────────────── */
const QUICK_REPLIES = [
  'What is my next appointment?',
  'Show my latest lab results',
  'What medications am I on?',
  'When is my next medication due?',
  'Help me understand my HbA1c',
  'I have a headache',
];

const BOT_REPLIES: Record<string, string> = {
  'appointment': 'Your next appointment is with Dr. Priya Sharma on March 3rd at 10:30 AM (Cardiology, Apollo Clinic).',
  'lab': 'Your latest lab results from Feb 20, 2026: HbA1c 7.1% (Elevated), Blood Glucose 108 mg/dL (High), Vitamin D 18 ng/mL (Low). Would you like details on any specific test?',
  'medication': 'You are currently on: Metoprolol 50mg (morning), Metformin 500mg (after meals ×2), Atorvastatin 20mg (night), Vitamin D3 60,000 IU (weekly). Always follow your doctor\'s prescription.',
  'hba1c': 'HbA1c (Glycated Hemoglobin) measures your average blood sugar over the last 3 months. Your reading of 7.1% indicates diabetes is not optimally controlled (target <7%). Please follow up with Dr. Arvind Mehta.',
  'headache': 'I\'m sorry to hear that. If your headache is severe or persistent, please contact your doctor or visit the emergency room. For mild headaches, you may rest and stay hydrated. Do you want to book an appointment?',
  'default': 'I can help you with appointments, medications, lab results, and health queries. Please type your question or choose a quick reply below.',
};

function getBotReply(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('appointment') || lower.includes('next appointment')) return BOT_REPLIES['appointment'];
  if (lower.includes('lab') || lower.includes('result') || lower.includes('hba1c') && lower.includes('latest')) return BOT_REPLIES['lab'];
  if (lower.includes('medication') || lower.includes('medicine') || lower.includes('drug')) return BOT_REPLIES['medication'];
  if (lower.includes('hba1c') || lower.includes('a1c')) return BOT_REPLIES['hba1c'];
  if (lower.includes('headache') || lower.includes('pain') || lower.includes('fever')) return BOT_REPLIES['headache'];
  return BOT_REPLIES['default'];
}

/* ─── initial bot messages ─────────────────────────────────────────────── */
const INITIAL_BOT_MSGS: ChatMessage[] = [
  { id: 'bot-0', contactId: 'bot', direction: 'in', time: '—', text: 'Hello Ravi! I\'m Scanbo AI, your personal health assistant. I can help with appointments, medications, lab results and general health queries.' },
];

export default function PatientPortalChatPage() {
  const theme = useTheme();
  const [chatMode, setChatMode] = React.useState<'doctors' | 'chatbot'>('doctors');
  const [activeContactId, setActiveContactId] = React.useState(CHAT_CONTACTS[0].id);
  const [messages, setMessages] = React.useState<Record<string, ChatMessage[]>>(() =>
    JSON.parse(JSON.stringify(CHAT_MESSAGES)),
  );
  const [botMessages, setBotMessages] = React.useState<ChatMessage[]>(INITIAL_BOT_MSGS);
  const [inputText, setInputText] = React.useState('');
  const [contactSearch, setContactSearch] = React.useState('');
  const [showEmoji, setShowEmoji] = React.useState(false);
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set());
  const [botTyping, setBotTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const botEndRef = React.useRef<HTMLDivElement>(null);

  const activeContact = CHAT_CONTACTS.find((c) => c.id === activeContactId)!;
  const activeMessages = messages[activeContactId] ?? [];

  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollBotToBottom = React.useCallback(() => {
    botEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  React.useEffect(() => {
    scrollToBottom();
    setReadIds((prev) => {
      const next = new Set(prev);
      (messages[activeContactId] ?? []).filter((m) => m.direction === 'in').forEach((m) => next.add(m.id));
      return next;
    });
  }, [activeContactId, activeMessages.length, scrollToBottom, messages]);

  React.useEffect(() => { scrollBotToBottom(); }, [botMessages.length, scrollBotToBottom]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (chatMode === 'chatbot') {
      const userMsg: ChatMessage = { id: `bot-msg-${Date.now()}`, contactId: 'bot', text: trimmed, time: timeStr, direction: 'out' };
      setBotMessages(prev => [...prev, userMsg]);
      setInputText('');
      setBotTyping(true);
      setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const reply: ChatMessage = { id: `bot-reply-${Date.now()}`, contactId: 'bot', text: getBotReply(trimmed), time: replyTime, direction: 'in' };
        setBotMessages(prev => [...prev, reply]);
        setBotTyping(false);
      }, 1100);
      return;
    }

    const outgoing: ChatMessage = { id: `msg-${Date.now()}`, contactId: activeContactId, text: trimmed, time: timeStr, direction: 'out' };
    setMessages((prev) => ({ ...prev, [activeContactId]: [...(prev[activeContactId] ?? []), outgoing] }));
    setInputText('');
    setShowEmoji(false);
    setTimeout(() => {
      const replyTimeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const reply: ChatMessage = { id: `msg-${Date.now()}-reply`, contactId: activeContactId, text: 'Thank you for your message. I will get back to you shortly.', time: replyTimeStr, direction: 'in' };
      setMessages((prev) => ({ ...prev, [activeContactId]: [...(prev[activeContactId] ?? []), reply] }));
    }, 900);
  };

  const handleQuickReply = (text: string) => {
    setInputText(text);
    setTimeout(() => handleSendText(text), 50);
  };

  const handleSendText = (text: string) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const userMsg: ChatMessage = { id: `bot-msg-${Date.now()}`, contactId: 'bot', text, time: timeStr, direction: 'out' };
    setBotMessages(prev => [...prev, userMsg]);
    setInputText('');
    setBotTyping(true);
    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const reply: ChatMessage = { id: `bot-reply-${Date.now()}`, contactId: 'bot', text: getBotReply(text), time: replyTime, direction: 'in' };
      setBotMessages(prev => [...prev, reply]);
      setBotTyping(false);
    }, 1100);
  };

  const handleEmojiInsert = (emoji: string) => { setInputText((p) => p + emoji); setShowEmoji(false); };

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
        {/* ── Section header with mode tabs ── */}
        <Box sx={sectionHeader}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <ChatIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Chat</Typography>
              {totalUnread > 0 && (
                <Chip size="small" label={totalUnread} sx={{ height: 20, fontWeight: 700, fontSize: 11, bgcolor: alpha(theme.palette.error.main, 0.12), color: 'error.main', '& .MuiChip-label': { px: 0.9 } }} />
              )}
            </Stack>
            <Tabs value={chatMode} onChange={(_, v) => { setChatMode(v); setInputText(''); }}
              sx={{ minHeight: 32, '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 12, minHeight: 32, px: 1.5 }, '& .MuiTabs-indicator': { height: 2.5, borderRadius: '2px 2px 0 0' } }}>
              <Tab value="doctors" icon={<ChatIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Doctors" />
              <Tab value="chatbot" icon={<SmartToy sx={{ fontSize: 15 }} />} iconPosition="start" label="AI Assistant"
                sx={{ '& .MuiTab-iconWrapper': { color: chatMode === 'chatbot' ? theme.palette.primary.main : 'text.secondary' } }} />
            </Tabs>
          </Stack>
        </Box>

        {/* ── Chat layout ── */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

          {/* ══ DOCTOR CHAT MODE ══ */}
          {chatMode === 'doctors' && (
            <>
              {/* Left sidebar */}
              <Box sx={{ width: 260, minWidth: 260, borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <TextField size="small" fullWidth placeholder="Search contacts…" value={contactSearch} onChange={(e) => setContactSearch(e.target.value)}
                    InputProps={{ startAdornment: <Search sx={{ fontSize: 16, color: 'text.disabled', mr: 0.75 }} /> }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }} />
                </Box>
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                  {filteredContacts.map((contact) => {
                    const isActive = contact.id === activeContactId;
                    const msgs = messages[contact.id] ?? [];
                    const lastMsg = msgs[msgs.length - 1];
                    return (
                      <Box key={contact.id} onClick={() => setActiveContactId(contact.id)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1.25, cursor: 'pointer', borderLeft: isActive ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent', bgcolor: isActive ? alpha(theme.palette.primary.main, 0.06) : 'transparent', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }, transition: 'background 0.15s' }}>
                        <Box sx={{ position: 'relative', flexShrink: 0 }}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: contact.color, fontWeight: 700, fontSize: 13 }}>{contact.initials}</Avatar>
                          {contact.online && <Box sx={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main', border: '2px solid', borderColor: 'background.paper' }} />}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: contact.unreadCount > 0 ? 800 : 600, lineHeight: 1.3 }} noWrap>{contact.name}</Typography>
                            {lastMsg && <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled', flexShrink: 0 }}>{lastMsg.time}</Typography>}
                          </Stack>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', flex: 1, minWidth: 0, fontSize: 12 }}>{lastMsg?.text ?? contact.lastMessage}</Typography>
                            {contact.unreadCount > 0 && <Box sx={{ bgcolor: 'primary.main', color: '#fff', borderRadius: '10px', px: 0.6, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, ml: 0.5 }}>{contact.unreadCount}</Box>}
                          </Stack>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* Right message area */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <Stack direction="row" alignItems="center" spacing={1.25}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar sx={{ width: 38, height: 38, bgcolor: activeContact.color, fontWeight: 700, fontSize: 13 }}>{activeContact.initials}</Avatar>
                      {activeContact.online && <Box sx={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', bgcolor: 'success.main', border: '2px solid', borderColor: 'background.paper' }} />}
                    </Box>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activeContact.name}</Typography>
                        {activeContact.online && <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>Online</Typography>}
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
                <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: alpha(theme.palette.primary.main, 0.015), px: 2, py: 2 }}>
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
                        {!isOut && <Avatar sx={{ width: 28, height: 28, bgcolor: activeContact.color, fontSize: 11, fontWeight: 700, flexShrink: 0, mb: 0.25 }}>{activeContact.initials}</Avatar>}
                        <Box sx={{ maxWidth: '68%' }}>
                          <Box sx={{ px: 1.75, py: 1, borderRadius: isOut ? '14px 14px 4px 14px' : '4px 14px 14px 14px', bgcolor: isOut ? theme.palette.primary.main : theme.palette.background.paper, color: isOut ? '#fff' : 'text.primary', border: isOut ? 'none' : '1px solid', borderColor: isOut ? undefined : alpha(theme.palette.divider, 0.6), boxShadow: isOut ? 'none' : '0 1px 3px rgba(0,0,0,0.06)', fontSize: 13.5, lineHeight: 1.55 }}>
                            {msg.text}
                          </Box>
                          <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mt: 0.3, px: 0.5, justifyContent: isOut ? 'flex-end' : 'flex-start' }}>
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10.5 }}>{msg.time}</Typography>
                            {isOut && <DoneAll sx={{ fontSize: 12, color: isRead ? theme.palette.info.main : 'text.disabled' }} />}
                          </Stack>
                        </Box>
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Box>
                {showEmoji && (
                  <Box sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 0.75 }}>
                    {EMOJIS.map((e) => <Button key={e} variant="text" onClick={() => handleEmojiInsert(e)} sx={{ minWidth: 36, width: 36, height: 36, p: 0, fontSize: 18, borderRadius: 1 }}>{e}</Button>)}
                  </Box>
                )}
                <Box sx={{ px: 1.5, py: 1.25, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Tooltip title="Attach file"><Button variant="text" size="small" sx={{ minWidth: 36, width: 36, height: 36, borderRadius: '50%', p: 0, color: 'text.secondary' }}><AttachFile sx={{ fontSize: 18 }} /></Button></Tooltip>
                  <Tooltip title="Emoji"><Button variant="text" size="small" onClick={() => setShowEmoji((p) => !p)} sx={{ minWidth: 36, width: 36, height: 36, borderRadius: '50%', p: 0, color: showEmoji ? 'primary.main' : 'text.secondary' }}><EmojiEmotions sx={{ fontSize: 18 }} /></Button></Tooltip>
                  <TextField fullWidth size="small" placeholder="Type a message…" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px', fontSize: 13.5 } }} />
                  <Button variant="contained" disableElevation onClick={handleSend} disabled={!inputText.trim()} sx={{ minWidth: 40, width: 40, height: 40, borderRadius: '50%', p: 0, flexShrink: 0 }}><Send sx={{ fontSize: 18 }} /></Button>
                </Box>
              </Box>
            </>
          )}

          {/* ══ CHATBOT MODE ══ */}
          {chatMode === 'chatbot' && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {/* Bot header */}
              <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <Box sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: theme.palette.primary.main, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <SmartToy sx={{ fontSize: 20, color: '#fff' }} />
                </Box>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Scanbo AI Assistant</Typography>
                    <Chip size="small" label="AI" icon={<AutoAwesome sx={{ fontSize: 11 }} />} sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.dark', '& .MuiChip-icon': { color: 'primary.dark' } }} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">Powered by Scanbo Health AI · Always active</Typography>
                </Box>
              </Box>

              {/* Bot messages */}
              <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: alpha(theme.palette.primary.main, 0.015), px: 2, py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
                  <Typography variant="caption" color="text.disabled" sx={{ px: 1.5, fontWeight: 600, fontSize: 11 }}>Today</Typography>
                  <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
                </Box>

                {botMessages.map((msg) => {
                  const isOut = msg.direction === 'out';
                  return (
                    <Box key={msg.id} sx={{ display: 'flex', justifyContent: isOut ? 'flex-end' : 'flex-start', mb: 1.5, alignItems: 'flex-end', gap: 0.75 }}>
                      {!isOut && (
                        <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: theme.palette.primary.main, display: 'grid', placeItems: 'center', flexShrink: 0, mb: 0.25 }}>
                          <SmartToy sx={{ fontSize: 14, color: '#fff' }} />
                        </Box>
                      )}
                      <Box sx={{ maxWidth: '72%' }}>
                        <Box sx={{ px: 1.75, py: 1.1, borderRadius: isOut ? '14px 14px 4px 14px' : '4px 14px 14px 14px', bgcolor: isOut ? theme.palette.primary.main : theme.palette.background.paper, color: isOut ? '#fff' : 'text.primary', border: isOut ? 'none' : '1px solid', borderColor: isOut ? undefined : alpha(theme.palette.divider, 0.6), boxShadow: isOut ? 'none' : '0 1px 3px rgba(0,0,0,0.06)', fontSize: 13.5, lineHeight: 1.6 }}>
                          {msg.text}
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10.5, display: 'block', mt: 0.3, px: 0.5, textAlign: isOut ? 'right' : 'left' }}>{msg.time}</Typography>
                      </Box>
                    </Box>
                  );
                })}

                {botTyping && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, mb: 1.5 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: theme.palette.primary.main, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <SmartToy sx={{ fontSize: 14, color: '#fff' }} />
                    </Box>
                    <Box sx={{ px: 1.75, py: 1.1, borderRadius: '4px 14px 14px 14px', bgcolor: 'background.paper', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.6), display: 'flex', gap: 0.4, alignItems: 'center' }}>
                      {[0, 1, 2].map(i => (
                        <Box key={i} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: theme.palette.primary.main, animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s`, '@keyframes bounce': { '0%,80%,100%': { transform: 'scale(0.7)', opacity: 0.5 }, '40%': { transform: 'scale(1)', opacity: 1 } } }} />
                      ))}
                    </Box>
                  </Box>
                )}
                <div ref={botEndRef} />
              </Box>

              {/* Quick replies */}
              <Box sx={{ px: 1.5, py: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.75, display: 'block' }}>Quick questions:</Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {QUICK_REPLIES.map(q => (
                    <Chip key={q} label={q} size="small" onClick={() => handleQuickReply(q)} variant="outlined"
                      sx={{ cursor: 'pointer', fontSize: 11, fontWeight: 600, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) } }} />
                  ))}
                </Box>
              </Box>

              {/* Input */}
              <Box sx={{ px: 1.5, py: 1.25, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <TextField fullWidth size="small" placeholder="Ask Scanbo AI anything about your health…" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px', fontSize: 13.5 } }} />
                <Button variant="contained" disableElevation onClick={handleSend} disabled={!inputText.trim() || botTyping} sx={{ minWidth: 40, width: 40, height: 40, borderRadius: '50%', p: 0, flexShrink: 0 }}><Send sx={{ fontSize: 18 }} /></Button>
              </Box>
            </Box>
          )}

        </Box>
      </Card>
    </PatientPortalWorkspaceCard>
  );
}
