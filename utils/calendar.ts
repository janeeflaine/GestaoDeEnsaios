
import { RehearsalEvent } from '../types';

export const getGoogleCalendarUrl = (event: RehearsalEvent): string => {
  const [hours, minutes] = event.time.replace('h', '').split(':');
  
  const startDate = new Date(event.fullDate);
  startDate.setHours(parseInt(hours), parseInt(minutes));
  
  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 2); // Assume 2 hours duration

  const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');

  const text = encodeURIComponent(`Ensaio ${event.type}: ${event.location}`);
  const dates = `${formatDate(startDate)}/${formatDate(endDate)}`;
  const details = encodeURIComponent(`Encarregado: ${event.conductor}`);
  const location = encodeURIComponent(event.location);

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
};
