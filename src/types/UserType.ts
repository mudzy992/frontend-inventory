/* export default class UserType {
    userId?: number;
    surname?: string;
    forname?: string;
    email?: string;
    jobTitle?: string;
    department?: string;
    location?: string;
} */

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
    responsibilityArticles?: {
        userArticleId: number;
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