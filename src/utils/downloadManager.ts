import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DownloadPermissions {
  canDownload: boolean;
  allowedFormats: string[];
  requiresApproval: boolean;
  maxFileSize?: number;
}

export interface UserRole {
  role: 'user' | 'employee' | 'admin';
  permissions: DownloadPermissions;
}

// Define role-based permissions
export const ROLE_PERMISSIONS: Record<string, DownloadPermissions> = {
  user: {
    canDownload: true,
    allowedFormats: ['pdf', 'docx', 'jpg', 'png'],
    requiresApproval: false,
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },
  employee: {
    canDownload: true,
    allowedFormats: ['pdf', 'docx', 'jpg', 'png', 'xlsx', 'txt', 'zip'],
    requiresApproval: false,
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  admin: {
    canDownload: true,
    allowedFormats: ['*'], // All formats
    requiresApproval: false,
    maxFileSize: undefined // No limit
  }
};

export class DownloadManager {
  private userRole: string;
  private permissions: DownloadPermissions;

  constructor(userRole: string) {
    this.userRole = userRole;
    this.permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.user;
  }

  /**
   * Check if user can download a specific file
   */
  canDownloadFile(fileType: string, fileSize?: number): boolean {
    // Check if user has download permissions
    if (!this.permissions.canDownload) {
      return false;
    }

    // Check file format permissions
    if (this.permissions.allowedFormats.includes('*')) {
      // Admin can download all formats
      return true;
    }

    const fileExtension = fileType.toLowerCase().replace('.', '');
    if (!this.permissions.allowedFormats.includes(fileExtension)) {
      return false;
    }

    // Check file size limits
    if (this.permissions.maxFileSize && fileSize && fileSize > this.permissions.maxFileSize) {
      return false;
    }

    return true;
  }

  /**
   * Download a document with proper permissions check
   */
  async downloadDocument(documentId: string, fileName?: string): Promise<void> {
    try {
      // First, get document info
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (docError || !document) {
        throw new Error('Document not found');
      }

      // Check permissions
      if (!this.canDownloadFile(document.type, document.file_size)) {
        throw new Error(`You don't have permission to download ${document.type} files`);
      }

      // If it's a Google Drive link, open in new tab
      if (document.drive_link) {
        window.open(document.drive_link, '_blank');
        return;
      }

      // If it's a stored file, download it
      if (document.file_path) {
        await this.downloadStoredFile(document.file_path, fileName || document.file_name || document.title);
        return;
      }

      // Fallback to file_url if available
      if (document.file_url) {
        window.open(document.file_url, '_blank');
        return;
      }

      throw new Error('No downloadable content found');
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download document',
        variant: 'destructive'
      });
    }
  }

  /**
   * Download a file from Supabase storage
   */
  private async downloadStoredFile(filePath: string, fileName: string): Promise<void> {
    try {
      // Create a signed URL for secure download
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (urlError || !signedUrlData?.signedUrl) {
        // Fallback to direct download if signed URL fails
        const { data, error } = await supabase.storage
          .from('documents')
          .download(filePath);

        if (error) throw error;

        const url = URL.createObjectURL(data);
        this.triggerDownload(url, fileName);
        URL.revokeObjectURL(url);
      } else {
        // Use signed URL for secure download
        this.triggerDownload(signedUrlData.signedUrl, fileName);
      }
    } catch (error: any) {
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Trigger browser download
   */
  private triggerDownload(url: string, fileName: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Bulk download multiple documents (Employee/Admin only)
   */
  async bulkDownload(documentIds: string[]): Promise<void> {
    if (this.userRole === 'user') {
      throw new Error('Bulk download is not available for regular users');
    }

    try {
      for (const docId of documentIds) {
        await this.downloadDocument(docId);
        // Add small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast({
        title: 'Bulk Download Complete',
        description: `Downloaded ${documentIds.length} documents`,
      });
    } catch (error: any) {
      console.error('Bulk download error:', error);
      toast({
        title: 'Bulk Download Failed',
        description: error.message || 'Failed to download some documents',
        variant: 'destructive'
      });
    }
  }

  /**
   * Get download statistics for admin/employee
   */
  async getDownloadStats(userId?: string): Promise<any> {
    if (this.userRole === 'user') {
      throw new Error('Download statistics are not available for regular users');
    }

    try {
      let query = supabase
        .from('documents')
        .select('type, file_size, created_at');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate statistics
      const stats = {
        totalDocuments: data?.length || 0,
        totalSize: data?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0,
        byType: data?.reduce((acc, doc) => {
          acc[doc.type] = (acc[doc.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
        recentUploads: data?.filter(doc => {
          const uploadDate = new Date(doc.created_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return uploadDate > sevenDaysAgo;
        }).length || 0
      };

      return stats;
    } catch (error: any) {
      console.error('Stats error:', error);
      throw new Error(`Failed to get download statistics: ${error.message}`);
    }
  }

  /**
   * Export user data (Employee/Admin only)
   */
  async exportUserData(userId: string, format: 'pdf' | 'csv' | 'json' = 'pdf'): Promise<void> {
    if (this.userRole === 'user') {
      throw new Error('Data export is not available for regular users');
    }

    if (!this.canDownloadFile(format)) {
      throw new Error(`You don't have permission to export in ${format} format`);
    }

    try {
      // Fetch comprehensive user data
      const [profileData, universitiesData, sopsData, lorsData, documentsData, enquiriesData] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).single(),
        supabase.from('shortlisted_universities').select('*').eq('user_id', userId),
        supabase.from('sops').select('*').eq('user_id', userId),
        supabase.from('lors').select('*').eq('user_id', userId),
        supabase.from('documents').select('*').eq('user_id', userId),
        supabase.from('enquiries').select('*').eq('user_id', userId)
      ]);

      const userData = {
        profile: profileData.data,
        universities: universitiesData.data || [],
        sops: sopsData.data || [],
        lors: lorsData.data || [],
        documents: documentsData.data || [],
        enquiries: enquiriesData.data || [],
        exportedAt: new Date().toISOString(),
        exportedBy: this.userRole
      };

      // Export based on format
      switch (format) {
        case 'json':
          this.exportAsJson(userData, `user_data_${profileData.data?.full_name || userId}`);
          break;
        case 'csv':
          this.exportAsCsv(userData, `user_data_${profileData.data?.full_name || userId}`);
          break;
        case 'pdf':
          await this.exportAsPdf(userData, `user_data_${profileData.data?.full_name || userId}`);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      toast({
        title: 'Export Successful',
        description: `User data exported as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export user data',
        variant: 'destructive'
      });
    }
  }

  private exportAsJson(data: any, fileName: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    this.triggerDownload(url, `${fileName}.json`);
    URL.revokeObjectURL(url);
  }

  private exportAsCsv(data: any, fileName: string): void {
    // Convert complex data structure to CSV format
    const csvData = [
      ['Section', 'Field', 'Value'],
      ['Profile', 'Name', data.profile?.full_name || ''],
      ['Profile', 'Email', data.profile?.email || ''],
      ['Profile', 'Phone', data.profile?.phone || ''],
      ['Profile', 'Role', data.profile?.role || ''],
      ['Universities', 'Count', data.universities.length.toString()],
      ['SOPs', 'Count', data.sops.length.toString()],
      ['LORs', 'Count', data.lors.length.toString()],
      ['Documents', 'Count', data.documents.length.toString()],
      ['Enquiries', 'Count', data.enquiries.length.toString()]
    ];

    const csvString = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    this.triggerDownload(url, `${fileName}.csv`);
    URL.revokeObjectURL(url);
  }

  private async exportAsPdf(data: any, fileName: string): Promise<void> {
    // For PDF generation, we'd typically use a library like jsPDF or Puppeteer
    // For now, we'll create a simple HTML version and trigger print
    const htmlContent = this.generateHtmlReport(data);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Trigger print after content loads
      printWindow.onload = () => {
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
      };
    }
  }

  private generateHtmlReport(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>User Data Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .section { margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>User Data Export Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Student:</strong> ${data.profile?.full_name || 'Unknown'}</p>
        
        <div class="section">
          <h2>Profile Information</h2>
          <table>
            <tr><th>Field</th><th>Value</th></tr>
            <tr><td>Full Name</td><td>${data.profile?.full_name || 'N/A'}</td></tr>
            <tr><td>Phone</td><td>${data.profile?.phone || 'N/A'}</td></tr>
            <tr><td>Target Program</td><td>${data.profile?.target_program || 'N/A'}</td></tr>
            <tr><td>Target University</td><td>${data.profile?.target_university || 'N/A'}</td></tr>
          </table>
        </div>

        <div class="section">
          <h2>Summary Statistics</h2>
          <table>
            <tr><th>Category</th><th>Count</th></tr>
            <tr><td>Universities Applied</td><td>${data.universities.length}</td></tr>
            <tr><td>SOPs Created</td><td>${data.sops.length}</td></tr>
            <tr><td>LORs Created</td><td>${data.lors.length}</td></tr>
            <tr><td>Documents Uploaded</td><td>${data.documents.length}</td></tr>
            <tr><td>Enquiries Submitted</td><td>${data.enquiries.length}</td></tr>
          </table>
        </div>

        ${data.universities.length > 0 ? `
        <div class="section">
          <h2>University Applications</h2>
          <table>
            <tr><th>University</th><th>Program</th><th>Status</th></tr>
            ${data.universities.map((uni: any) => 
              `<tr><td>${uni.university_name}</td><td>${uni.program_name}</td><td>${uni.application_status}</td></tr>`
            ).join('')}
          </table>
        </div>
        ` : ''}

        <div class="section">
          <p><em>This report was generated by the German Pathways Advisor system.</em></p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get user's permissions info
   */
  getPermissions(): DownloadPermissions {
    return this.permissions;
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default DownloadManager;

