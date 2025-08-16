
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Contact } from '@/types/contact';
import { useContacts } from '@/hooks/useContacts';
import { ContactEditModal } from './ContactEditModal';
import { ConfirmationDialog } from './ConfirmationDialog';
import { 
  MapPin, 
  Calendar, 
  Mail, 
  Instagram, 
  Linkedin, 
  Globe,
  MessageSquare,
  Clock,
  User,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Gift
} from 'lucide-react';

interface ContactDetailModalProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
}

export const ContactDetailModal = ({ contact, isOpen, onClose }: ContactDetailModalProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { updateContact, deleteContact } = useContacts();
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSocialLink = (type: 'email' | 'instagram' | 'linkedin' | 'website') => {
    switch (type) {
      case 'email': return contact.email ? `mailto:${contact.email}` : null;
      case 'instagram': return contact.instagram ? `https://instagram.com/${contact.instagram.replace('@', '')}` : null;
      case 'linkedin': return contact.linkedin;
      case 'website': return contact.website;
      default: return null;
    }
  };

  const handleToggleHidden = async () => {
    await updateContact.mutateAsync({
      id: contact.id,
      is_hidden: !contact.is_hidden,
    });
  };

  const handleDelete = async () => {
    await deleteContact.mutateAsync(contact.id);
    setShowDeleteDialog(false);
    onClose();
  };

  const handleEdit = async (data: Partial<Contact>) => {
    await updateContact.mutateAsync({
      id: contact.id,
      ...data,
    });
    setShowEditModal(false);
  };

  const SocialButton = ({ type, icon, label, value }: {
    type: 'email' | 'instagram' | 'linkedin' | 'website';
    icon: React.ReactNode;
    label: string;
    value?: string;
  }) => {
    if (!value) return null;
    
    const link = getSocialLink(type);
    
    if (!link) {
      return (
        <div className="flex items-center space-x-2 text-gray-600">
          {icon}
          <span className="text-sm">{value}</span>
        </div>
      );
    }
    
    return (
      <Button
        variant="outline"
        size="sm"
        className="justify-start"
        onClick={() => window.open(link, '_blank')}
      >
        {icon}
        <span className="ml-2">{label}</span>
      </Button>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center space-x-2 text-xl">
                <User className="h-5 w-5" />
                <span>{contact.name}</span>
                {contact.is_hidden && (
                  <Badge variant="secondary" className="ml-2">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hidden
                  </Badge>
                )}
              </DialogTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleHidden}
                  disabled={updateContact.isPending}
                >
                  {contact.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span className="ml-2">{contact.is_hidden ? 'Show' : 'Hide'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="ml-2">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="ml-2">Delete</span>
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Location:</span>
                  <span className="text-sm">{contact.location || 'Not specified'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Date Met:</span>
                  <span className="text-sm">{formatDate(contact.date_met)}</span>
                </div>

                {contact.birthday && (
                  <div className="flex items-center space-x-2">
                    <Gift className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Birthday:</span>
                    <span className="text-sm">{formatDate(contact.birthday)}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Added:</span>
                  <span className="text-sm">{formatDateTime(contact.created_at)}</span>
                </div>
                
                {contact.telegram_message_id && (
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">From Telegram:</span>
                    <Badge variant="secondary" className="text-xs">
                      Message ID: {contact.telegram_message_id}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Context */}
            {contact.context && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Context</h3>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{contact.context}</p>
                </div>
              </div>
            )}

            {/* Social Links */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <SocialButton
                  type="email"
                  icon={<Mail className="h-4 w-4" />}
                  label="Send Email"
                  value={contact.email}
                />
                <SocialButton
                  type="instagram"
                  icon={<Instagram className="h-4 w-4" />}
                  label="Instagram"
                  value={contact.instagram}
                />
                <SocialButton
                  type="linkedin"
                  icon={<Linkedin className="h-4 w-4" />}
                  label="LinkedIn"
                  value={contact.linkedin}
                />
                <SocialButton
                  type="website"
                  icon={<Globe className="h-4 w-4" />}
                  label="Website"
                  value={contact.website}
                />
              </div>
            </div>

            {/* Raw Content */}
            {contact.raw_content && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Original Message</h3>
                <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-200">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{contact.raw_content}</p>
                </div>
              </div>
            )}

            {/* Location Coordinates */}
            {(contact.latitude && contact.longitude) && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Geographic Coordinates</h3>
                <div className="text-sm text-gray-600">
                  Lat: {contact.latitude.toFixed(6)}, Lng: {contact.longitude.toFixed(6)}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ContactEditModal
        contact={contact}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEdit}
        isLoading={updateContact.isPending}
      />

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Contact"
        description={`Are you sure you want to delete ${contact.name}? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive
      />
    </>
  );
};
