export default class ResponsibilityType {
  responsibilityId?: number;
  userId?: number;
  articleId?: number;
  value?: number;
  status?: string;
  timestamp?: string;
  serialNumber?: string;
  user?: {
    userId: number;
    surname: string;
    forname: string;
    email: string;
    jobTitle: string;
    department: string;
    location: string;
  };
  article?: {
    articleId: number;
    name: string;
    excerpt: string;
    description: string;
    comment: string;
    concract: string;
    categoryId: number;
    sapNumber: string;
  };
  features?: {
    featureId: number;
    categoryId: number;
    name: string;
  }[];
  articleFeature?: {
    articleFeatureId: number;
    articleId: number;
    featureId: number;
    value: string;
  }[];
  document?: {
    path: string;
  };
}
