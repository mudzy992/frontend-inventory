export default class UserType {
    userId?: number;
    surname?: string;
    forname?: string;
    fullName?: string;
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
    userArticles?: {
        userArticleId: number;
        articleId: number;
        documentId: number;
        userId: number;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
        invBroj: string;
    }[];
    responsibilities?: {
        responsibilityId: number;
        userArticleId: number;
        userId: number;
        articleId: number;
        documentId: number;
        value: number;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
        invBroj: string;
    }[];
    debtItems?:{
        debtItemsId: number;
        userArticleId: number;
        userId: number;
        articleId: number;
        documentId: number;
        value: number;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
        invBroj: string;
    }[];
    destroyeds?: {
        destroyedId: number;
        userArticleId: number;
        userId: number;
        articleId: number;
        documentId: number;
        value: number;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
        invBroj: string;
    }[];
}