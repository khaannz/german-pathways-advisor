export interface Enquiry {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    role?: string;
  };
  comments?: EnquiryComment[];
  comments_count?: number;
}

export interface EnquiryComment {
  id: string;
  enquiry_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    role: string;
  };
}

export interface CreateEnquiryCommentRequest {
  enquiry_id: string;
  comment: string;
  user_id: string;
}