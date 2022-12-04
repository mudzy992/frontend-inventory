export default class ArticleTimelineType {
    articleTimelineId?: number;
    articleId?: number;
    documentId?: number;
    userId?: number;
    serialNumber?: string;
    status?: string;
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
        comment: string;
    };
    document?: {
        documentId: number;
        articleId: number;
        path: string;
        documentNumber: number;
    }
}