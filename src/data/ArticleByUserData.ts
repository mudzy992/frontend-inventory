export default interface ArticleByUserData {
  articleId: number;
  name: string;
  excerpt: string;
  description: string;
  comment: string;
  concract: string;
  sapNumber: string;
  categoryId: number;
  category: {
    name: string;
    imagePath: string;
    parentCategoryId: number;
  };
  articleFeature: {
    articleFeatureId: number;
    featureId: number;
    value: string;
  }[];
  features: {
    featureId: number;
    name: string;
  }[];
  userArticles: {
    userArticleId: number;
    value: string;
    status: "zaduženo" | "razduženo" | "otpisano";
    timestamp: string;
    serialNumber: string;
  }[];
  userDetails: {
    userId: number;
    surname: string;
    forname: string;
    email: string;
    jobTitle: string;
    department: string;
    location: string;
  }[];
  destroyed: {
    destroyedId: number;
    articleId: number;
    value: number;
    comment: string;
    timestamp: string;
    userId: string;
    serialNumber: string;
  }[];
  debtItems: {
    debtItemsId: number;
    articleId: number;
    userId: number;
    value: number;
    comment: string;
    serialNumber: string;
    timestamp: string;
  }[];
}
