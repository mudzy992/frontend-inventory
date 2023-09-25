export default class ArticleType {
    articleId?: number;
    name?: string;
    excerpt?: string;
    description?: string;
    comment?: string;
    concract?: string;
    sapNumber?: string;
    categoryId?: number;
    category?: {
        name: string;
        imagePath: string;
    };
    articleFeature?: {
        articleFeatureId: number;
        featureId: number;
        value: string;
    }[];
    features?: {
        featureId: number;
        name: string;
    }[];
    userArticles?:{
        userArticleId: number;
        articleId: number;
        documentId: number;
        userId: number;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
        comment: string;
    }[];
    userDetails?:{
        userId: number;
        surname: string;
        forname: string;
        email: string;
        jobTitle: string;
        department: string;
        location: string;
        fullname: string;
    }[];
    articlesInStock?:{
        stockId: number;
        timestamp: string;
        articleId: number;
        valueOnConcract: number;
        valueAvailable: number;
        sapNumber: string;
    }[];
    destroyeds?:{
        destroyedId: number;
        articleId: number;
        userId: number;
        value: string;
        comment: string;
        timestamp: string;
        serialNumber: string;
        status: 'otpisano';
    }[];
    debtItems?:{
        debtItemsId: number;
        articleId: number;
        userId: number;
        value: string;
        comment: string;
        serialNumber: string;
        timestamp: string;
        status: 'razduženo';
    }[];
    responsibilities?:{
        responsibilityId: number;
        articleId: number;
        userId: number;
        value: string;
        serialNumber: string;
        timestamp: string;
        status: 'zaduženo';
    }[];
    documents?:{
        documentsId: number;
        articleId: number;
        path: string;
        documentNumber: number;
    }[];
}