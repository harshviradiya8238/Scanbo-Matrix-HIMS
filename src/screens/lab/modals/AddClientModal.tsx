'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@/src/ui/components/atoms';
import type { LabClient } from '../lab-types';

type Props = { open: boolean; onClose: () => void; onSubmit: (form: Omit<LabClient, 'id'>) => void };

export default function AddClientModal({ open, onClose, onSubmit }: Props) {
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState('Clinic');
  const [contact, setContact] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [city, setCity] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const handleClose = () => {
    setName('');
    setType('Clinic');
    setContact('');
    setEmail('');
    setPhone('');
    setCity('');
    setAddress('');
    setNotes('');
    onClose();
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      type,
      contact: contact.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim() || undefined,
      active: true,
      notes: notes.trim() || undefined,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Client</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth size="small" />
          <FormControl size="small" fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={type} label="Type" onChange={(e) => setType(e.target.value as string)}>
              <MenuItem value="Hospital">Hospital</MenuItem>
              <MenuItem value="Clinic">Clinic</MenuItem>
              <MenuItem value="Lab">Lab</MenuItem>
              <MenuItem value="Specialist">Specialist</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Contact Person" value={contact} onChange={(e) => setContact(e.target.value)} size="small" fullWidth />
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} size="small" fullWidth />
          <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} size="small" fullWidth />
          <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} size="small" fullWidth />
          <TextField label="Address" value={address} onChange={(e) => setAddress(e.target.value)} multiline size="small" fullWidth />
          <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} multiline rows={2} size="small" fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!name.trim()}>Add Client</Button>
      </DialogActions>
    </Dialog>
  );
}
