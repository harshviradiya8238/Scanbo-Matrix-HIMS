import { useMemo } from 'react';
import { toMinutes, rangesOverlap, addMinutesToTime } from '../utils/opd-calendar.utils';

export function useCalendarEvents({ 
  appointments, 
  availability, 
  providerFilter, 
  availabilityProvider, 
  calendarRange, 
  calendarView, 
  slotDurationMinutes, 
  selectedEvent, 
  directDepartment, 
  providerDepartmentMap, 
  bookingDepartment, 
  hasOverlappingAppointment 
}: any) {
  const appointmentEvents = useMemo(() => {
    const filtered = appointments.filter(
      (a: any) => (providerFilter === 'All' || a.provider === providerFilter) && a.status !== 'Cancelled'
    );
    
    const sorted = [...filtered].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      const timeDiff = toMinutes(a.time) - toMinutes(b.time);
      if (timeDiff !== 0) return timeDiff;
      return a.id.localeCompare(b.id);
    });

    const intervalsByDate = new Map<string, Array<[number, number]>>();
    const nonOverlapping = sorted.filter((a) => {
      const startMinutes = toMinutes(a.time);
      const endMinutes = startMinutes + slotDurationMinutes;
      const intervals = intervalsByDate.get(a.date) ?? [];
      
      if (intervals.some(([s, e]) => rangesOverlap(startMinutes, endMinutes, s, e))) return false;
      
      intervals.push([startMinutes, endMinutes]);
      intervalsByDate.set(a.date, intervals);
      return true;
    });

    return nonOverlapping.map((a) => ({
      id: a.id,
      title: a.patientName,
      start: `${a.date}T${a.time}:00`,
      end: `${a.date}T${addMinutesToTime(a.time, slotDurationMinutes)}:00`,
      classNames: selectedEvent && selectedEvent.id === a.id ? ['fc-event-selected'] : [],
      extendedProps: {
        kind: 'appointment',
        appointment: a
      }
    }));
  }, [appointments, providerFilter, selectedEvent, slotDurationMinutes]);

  const availabilityEvents = useMemo(() => {
    if (!availabilityProvider || !calendarRange || calendarView === 'dayGridMonth') return [];
    
    const start = calendarRange.start;
    const end = calendarRange.end;

    return availability
      .filter((entry: any) => entry.provider === availabilityProvider)
      .filter((entry: any) => {
        const dateValue = new Date(`${entry.date}T00:00:00`);
        return dateValue >= start && dateValue < end;
      })
      .flatMap((entry: any) => 
        entry.slots
          .filter((slot: any) => slot.status === 'Available')
          .filter((slot: any) => !hasOverlappingAppointment(entry.date, slot.time))
          .map((slot: any) => ({
            id: `avail-${availabilityProvider}-${entry.date}-${slot.time}`,
            title: 'Available',
            start: `${entry.date}T${slot.time}:00`,
            end: `${entry.date}T${addMinutesToTime(slot.time, slotDurationMinutes)}:00`,
            classNames: ['fc-availability-event'],
            extendedProps: {
              kind: 'availability',
              slot,
              provider: availabilityProvider,
              date: entry.date,
              department: providerDepartmentMap.get(availabilityProvider) || directDepartment || bookingDepartment
            }
          }))
      );
  }, [
    availabilityProvider, 
    calendarRange, 
    calendarView, 
    availability, 
    slotDurationMinutes, 
    hasOverlappingAppointment, 
    providerDepartmentMap, 
    directDepartment, 
    bookingDepartment
  ]);

  const events = useMemo(() => [...appointmentEvents, ...availabilityEvents], [appointmentEvents, availabilityEvents]);

  return { events };
}
