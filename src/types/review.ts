import type { CloudImage } from './index';

export interface PublicReview {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  authorName: string;
  verified: boolean;
  adminReply: { text: string; at: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
  breakdown: Record<number, number>;
}

export interface ReviewsResponse {
  data: PublicReview[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  summary: ReviewSummary;
}

export interface ReviewEligibility {
  canReview: boolean;
  hasReviewed: boolean;
  reason?: string;
  review?: { _id: string; rating: number; title?: string; comment: string; isHidden: boolean };
}

export interface AdminReview {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  isHidden: boolean;
  hiddenReason?: string;
  adminReply?: { text: string; at: string };
  createdAt: string;
  perfume: { _id: string; name: string; slug: string; images: CloudImage[] } | null;
  user: { _id: string; name: string; email: string } | null;
}