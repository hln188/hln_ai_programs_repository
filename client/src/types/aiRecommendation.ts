export interface CustomerProfile {
  id: string;
  name: string;
  industry: string;
  recentBehavior: string;
  assetTier: 'high' | 'medium' | 'low';
  products: string[];
  activityScore: number;
}

export interface AIRecommendationResponse {
  recommendedCustomerIds: string[];
  reason: string;
  suggestAction: string;
}

export interface RecommendRequest {
  customers: CustomerProfile[];
  topN?: number;
}
