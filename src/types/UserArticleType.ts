export default class UserArticleType {
    userArticleId?: number;
    articleId?: number;
    documentId?: number;
    userId?: number;
    serialNumber?: string;
    status?: 'zaduženo' | 'razduženo' | 'otpisano';
    timestamp?: string;
    comment?: string;
    invBroj?: string;
    user?: {
        userId: number;
        surname: string;
        forname: string;
        fullname: string
        localNumber: string;
        telephone: string;
        email: string;
        jobId: number;
        departmentId: number;
        locationId: number;
    };
    article?: {
        articleId: number;
        name: string;
        excerpt: string;
        description: string;
        concract: string;
        categoryId: number;
        sapNumber: string;
    };
    document?: {
        documentId: number;
        articleId: number;
        path: string;
        documentNumber: number;
    }
}