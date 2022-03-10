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
    }
    articleFeature?: {
        articleFeatureId: number;
        featureId: number;
        value: string;
    }[];
    features?: {
        featureId: number;
        name: string;
    }[];
    userArticle?:{
        userArticleId: number;
        responsibilityId: number;
        debtId: number;
        destroyId: number;
        userId: number;
        articleId: number;
        status:string;
        timestamp: string;
        serialNumber: string;
    }[];
    userDetails?:{
        userId: number;
        surname: string;
        forname: string;
        email: string;
        jobTitle: string;
        department: string;
        location: string;
    }[];
    articlesInStock?:{
        stockId: number;
        timestamp: string;
        articleId: number;
        valueOnConcract: number;
        valueAvailable: number;
        sapNumber: string;
    }[];
    responsibility?:{
        responsibilityId: number;
        articleId: number;
        userId: number;
        value: string;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
    }[];
    destroyed?:{
        destroyedId: number;
        articleId: number;
        value: string;
        comment: string;
        timestamp: string;
        serialNumber: string;
        status: 'otpisano';
    }[];
    debtItems?:{
        debtItemsId: number;
        articleId: number;
        value: string;
        comment: string;
        serialNumber: string;
        timestamp: string;
        status: 'razduženo';
    }[];
}