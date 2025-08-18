
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { Contact } from '@/types/contact';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  contacts: Contact[];
}

export const ExportButton = ({ contacts }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const formatContactForCSV = (contact: Contact) => {
    return {
      Name: contact.name || '',
      Phone: contact.phone || '',
      Email: contact.email || '',
      Instagram: contact.instagram || '',
      LinkedIn: contact.linkedin || '',
      Website: contact.website || '',
      'Location From': contact.location_from || '',
      'Location Met': contact.location_met || '',
      Context: contact.context || '',
      'Date Met': contact.date_met || '',
      Birthday: contact.birthday || '',
      'Created At': new Date(contact.created_at).toLocaleDateString(),
      'Is Hidden': contact.is_hidden ? 'Yes' : 'No',
    };
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes in CSV values
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const csvData = contacts.map(formatContactForCSV);
      const csvContent = convertToCSV(csvData);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `contacts-export-${timestamp}.csv`;
      
      downloadCSV(csvContent, filename);
      
      toast({
        title: "Export successful",
        description: `${contacts.length} contacts exported to ${filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your contacts.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      variant="outline"
      disabled={isExporting || contacts.length === 0}
      className="flex items-center space-x-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span>Export CSV</span>
    </Button>
  );
};
