
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
import { ContactAvatar } from './ContactAvatar';
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
  Gift,
  Phone
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

  const getSocialLink = (type: 'email' | 'instagram' | 'linkedin' | 'website' | 'phone') => {
    switch (type) {
      case 'email': return contact.email ? `mailto:${contact.email}` : null;
      case 'phone': return contact.phone ? `tel:${contact.phone}` : null;
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

  const formatStructuredMessage = (rawContent?: string) => {
    if (!rawContent) return null;
    
    // Split by common delimiters and create bullet points
    const lines = rawContent
      .split(/[.!?]/)
      .map(line => line.trim())
      .filter(line => line.length > 10)
      .slice(0, 5); // Limit to 5 key points
    
    return lines.map((line, index) => (
      <li key={index} className="text-sm text-gray-600">
        {line}
      </li>
    ));
  };

  const QuickActionButton = ({ type, icon, label, value }: {
    type: 'email' | 'instagram' | 'linkedin' | 'website' | 'phone';
    icon: React.ReactNode;
    label: string;
    value?: string;
  }) => {
    if (!value) return null;
    
    const link = getSocialLink(type);
    
    // Social media brand colors
    const getButtonStyle = () => {
      switch (type) {
        case 'linkedin':
          return 'border-[#0077B5] text-[#0077B5] hover:bg-[#0077B5] hover:text-white';
        case 'instagram':
          return 'border-[#E4405F] text-[#E4405F] hover:bg-[#E4405F] hover:text-white';
        case 'email':
          return 'border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white';
        case 'website':
          return 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white';
        case 'phone':
          return 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white';
        default:
          return 'border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white';
      }
    };
    
    return (
      <Button
        variant="outline"
        size="sm"
        className={`justify-start h-8 transition-colors ${getButtonStyle()}`}
        onClick={() => link && window.open(link, '_blank')}
      >
        {icon}
        <span className="ml-2 text-xs">{type === 'phone' ? value : label}</span>
      </Button>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center space-x-3 text-xl">
                <ContactAvatar 
                  name={contact.name}
                  profilePictureUrl={contact.profile_picture_url}
                  size="md"
                />
                <div>
                  <span>{contact.name}</span>
                  {contact.is_hidden && (
                    <Badge variant="secondary" className="ml-2">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hidden
                    </Badge>
                  )}
                </div>
              </DialogTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleHidden}
                  disabled={updateContact.isPending}
                >
                  {contact.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Quick Actions - Phone, LinkedIn, Instagram at the top */}
            <div className="flex flex-wrap gap-2">
              <QuickActionButton
                type="phone"
                icon={<Phone className="h-4 w-4" />}
                label="Call"
                value={contact.phone}
              />
              <QuickActionButton
                type="linkedin"
                icon={<Linkedin className="h-4 w-4" />}
                label="LinkedIn"
                value={contact.linkedin}
              />
              <QuickActionButton
                type="instagram"
                icon={<Instagram className="h-4 w-4" />}
                label="Instagram"
                value={contact.instagram}
              />
              <QuickActionButton
                type="email"
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={contact.email}
              />
              <QuickActionButton
                type="website"
                icon={<Globe className="h-4 w-4" />}
                label="Website"
                value={contact.website}
              />
            </div>

            {/* Location Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {contact.location_from && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Lives in:</span>
                    <span className="text-sm">{contact.location_from}</span>
                  </div>
                )}
                
                {contact.location_met && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Met at:</span>
                    <span className="text-sm">{contact.location_met}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Date Met:</span>
                  <span className="text-sm">{formatDate(contact.date_met)}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {contact.birthday && (
                  <div className="flex items-center space-x-2">
                    <Gift className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Birthday:</span>
                    <span className="text-sm">{formatDate(contact.birthday)}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Added:</span>
                  <span className="text-sm">{formatDateTime(contact.created_at)}</span>
                </div>
                
                {contact.telegram_message_id && (
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <Badge variant="secondary" className="text-xs">
                      From Telegram
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Highlights */}
            {contact.context && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Highlights</h3>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{contact.context}</p>
                </div>
              </div>
            )}

            {/* Structured Original Message */}
            {contact.raw_content && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Key Points from Original Message</h3>
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                  <ul className="list-disc list-inside space-y-1">
                    {formatStructuredMessage(contact.raw_content)}
                  </ul>
                </div>
              </div>
            )}

            {/* Location Coordinates (for debugging) */}
            {((contact.location_from_latitude && contact.location_from_longitude) || 
              (contact.location_met_latitude && contact.location_met_longitude)) && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Geographic Data</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  {contact.location_from_latitude && contact.location_from_longitude && (
                    <div>Lives: {contact.location_from_latitude.toFixed(4)}, {contact.location_from_longitude.toFixed(4)}</div>
                  )}
                  {contact.location_met_latitude && contact.location_met_longitude && (
                    <div>Met: {contact.location_met_latitude.toFixed(4)}, {contact.location_met_longitude.toFixed(4)}</div>
                  )}
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
