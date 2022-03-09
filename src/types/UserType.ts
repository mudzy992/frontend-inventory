export default class UserType {
    userId?: number;
    surname?: string;
    forname?: string;
    email?: string;
    jobTitle?: string;
    department?: string;
    location?: string;
    articles?: {
        articleId: number;
        name: string;
        excerpt: string;
        description: string;
        comment: string;
        concract: string;
        categoryId: number;
        sapNumber: string;
    }[];
    userArticle?: {
        userArticleId: number;
        responsibilityId: number;
        debtId: number;
        destroyId: number;
        userId: number;
        articleId: number;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
    }[];
    responsibilityArticles?: {
        responsibilityId: number;
        value: number;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
    }[];
    debtItems?:{
        debtItemsId: number;
        value: number;
        comment: string;
        timestamp: string;
        serialNumber: string;
    }[];
    destroyeds?: {
        destroyedId: number;
        value: number;
        comment: string;
        timestamp: string
        serialNumber: string;
    }[];
}