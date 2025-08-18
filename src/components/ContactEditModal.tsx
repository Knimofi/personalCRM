import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Contact } from '@/types/contact';
import { ImageUpload } from './ImageUpload';
import { validateEmail, validateUrl, validatePhoneNumber, sanitizeContactName, validateDateString } from '@/utils/security';

const contactSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .refine((name) => sanitizeContactName(name).length > 0, 'Name contains invalid characters'),
  phone: z.string()
    .optional()
    .refine((phone) => !phone || validatePhoneNumber(phone), 'Invalid phone number format'),
  location_met: z.string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  location_from: z.string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  context: z.string()
    .max(500, 'Context must be less than 500 characters')
    .optional(),
  email: z.string()
    .optional()
    .refine((email) => !email || email === '' || validateEmail(email), 'Invalid email format'),
  instagram: z.string()
    .max(100, 'Instagram handle must be less than 100 characters')
    .optional(),
  linkedin: z.string()
    .optional()
    .refine((url) => !url || url === '' || validateUrl(url), 'Invalid LinkedIn URL'),
  website: z.string()
    .optional()
    .refine((url) => !url || url === '' || validateUrl(url), 'Invalid website URL'),
  date_met: z.string()
    .optional()
    .refine((date) => !date || validateDateString(date), 'Invalid date format'),
  birthday: z.string()
    .optional()
    .refine((date) => !date || validateDateString(date), 'Invalid date format'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactEditModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Contact>) => Promise<void>;
  isLoading?: boolean;
}

export const ContactEditModal = ({
  contact,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: ContactEditModalProps) => {
  const [dateMetOpen, setDateMetOpen] = useState(false);
  const [birthdayOpen, setBirthdayOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phone: '',
      location_met: '',
      location_from: '',
      context: '',
      email: '',
      instagram: '',
      linkedin: '',
      website: '',
      date_met: '',
      birthday: '',
    },
  });

  useEffect(() => {
    if (contact && isOpen) {
      form.reset({
        name: contact.name || '',
        phone: contact.phone || '',
        location_met: contact.location_met || '',
        location_from: contact.location_from || '',
        context: contact.context || '',
        email: contact.email || '',
        instagram: contact.instagram || '',
        linkedin: contact.linkedin || '',
        website: contact.website || '',
        date_met: contact.date_met || '',
        birthday: contact.birthday || '',
      });
      setProfileImageUrl(contact.profile_picture_url || null);
    }
  }, [contact, isOpen, form]);

  const handleImageUpload = (url: string | null) => {
    console.log('Image upload callback received:', url);
    setProfileImageUrl(url);
  };

  const onSubmit = async (data: ContactFormData) => {
    if (!contact) return;
    
    console.log('Saving contact with profile image URL:', profileImageUrl);
    
    // Sanitize all text inputs
    const sanitizedData = {
      ...data,
      name: sanitizeContactName(data.name),
      phone: data.phone?.trim() || undefined,
      location_met: data.location_met?.trim() || undefined,
      location_from: data.location_from?.trim() || undefined,
      context: data.context?.trim() || undefined,
      email: data.email?.toLowerCase().trim() || undefined,
      instagram: data.instagram?.trim() || undefined,
      linkedin: data.linkedin?.trim() || undefined,
      website: data.website?.trim() || undefined,
      date_met: data.date_met || undefined,
      birthday: data.birthday || undefined,
      profile_picture_url: profileImageUrl || undefined,
    };

    console.log('Final sanitized data being saved:', sanitizedData);
    await onSave(sanitizedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex justify-center">
              <ImageUpload
                contactName={form.watch('name')}
                currentImageUrl={profileImageUrl}
                onImageUpload={handleImageUpload}
                disabled={isLoading}
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={100} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder="+1 (555) 123-4567" maxLength={20} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lives In</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City, Country" maxLength={200} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location_met"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Met At</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City, Country" maxLength={200} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Highlights</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Key highlights, important details, things to remember..." maxLength={500} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" maxLength={254} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="@username" maxLength={100} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://linkedin.com/in/..." maxLength={2048} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." maxLength={2048} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date_met"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date Met</FormLabel>
                    <Popover open={dateMetOpen} onOpenChange={setDateMetOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            field.onChange(date ? date.toISOString().split('T')[0] : '');
                            setDateMetOpen(false);
                          }}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthday"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Birthday</FormLabel>
                    <Popover open={birthdayOpen} onOpenChange={setBirthdayOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            field.onChange(date ? date.toISOString().split('T')[0] : '');
                            setBirthdayOpen(false);
                          }}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
