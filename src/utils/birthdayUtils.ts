
import { Contact } from '@/types/contact';
import { parseISO, format, isValid, addYears, isAfter, isBefore } from 'date-fns';

export const getNextBirthday = (contacts: Contact[]): Contact | null => {
  const today = new Date();
  const contactsWithBirthdays = contacts.filter(contact => contact.birthday);

  if (contactsWithBirthdays.length === 0) return null;

  let nextBirthdayContact: Contact | null = null;
  let closestDate: Date | null = null;

  for (const contact of contactsWithBirthdays) {
    if (!contact.birthday) continue;

    const birthdayDate = parseISO(contact.birthday);
    if (!isValid(birthdayDate)) continue;

    // Get this year's birthday
    const thisYearBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
    
    // If this year's birthday has passed, use next year's
    const upcomingBirthday = isAfter(thisYearBirthday, today) || 
      (thisYearBirthday.toDateString() === today.toDateString()) 
      ? thisYearBirthday 
      : addYears(thisYearBirthday, 1);

    if (!closestDate || isBefore(upcomingBirthday, closestDate)) {
      closestDate = upcomingBirthday;
      nextBirthdayContact = contact;
    }
  }

  return nextBirthdayContact;
};

export const formatBirthdayDate = (birthday: string): string => {
  const date = parseISO(birthday);
  if (!isValid(date)) return '';
  return format(date, 'MMM d');
};
