
import { Contact } from '@/types/contact';
import { parseISO, format, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from 'date-fns';

export interface WeeklyStats {
  week: string;
  contacts: number;
}

export interface CountryStats {
  country: string;
  contacts: number;
  percentage: number;
}

export const getWeeklyContactStats = (contacts: Contact[], weeksBack: number = 12): WeeklyStats[] => {
  const now = new Date();
  const weeks: WeeklyStats[] = [];

  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(now, i));
    const weekEnd = endOfWeek(subWeeks(now, i));
    
    const contactsInWeek = contacts.filter(contact => {
      const createdAt = parseISO(contact.created_at);
      return isWithinInterval(createdAt, { start: weekStart, end: weekEnd });
    });

    weeks.push({
      week: format(weekStart, 'MMM d'),
      contacts: contactsInWeek.length,
    });
  }

  return weeks;
};

export const getCountryStats = (contacts: Contact[]): CountryStats[] => {
  const countryMap = new Map<string, number>();
  
  contacts.forEach(contact => {
    if (contact.location_from) {
      // Simple country extraction - split by comma and take the last part
      const parts = contact.location_from.split(',').map(part => part.trim());
      const country = parts[parts.length - 1] || 'Unknown';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    } else {
      countryMap.set('Unknown', (countryMap.get('Unknown') || 0) + 1);
    }
  });

  const total = contacts.length;
  return Array.from(countryMap.entries())
    .map(([country, count]) => ({
      country,
      contacts: count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.contacts - a.contacts);
};
