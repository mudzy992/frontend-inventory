export default interface UserArticleDto {
    userArticleId?: number;
    articleId?: number;
    documentId?: number;
    userId?: number;
    serialNumber?: string;
    status?: string;
    timestamp?: string;
    comment?: string;
    invBroj?: string;
    debtItems?: {
        debtItemsId: number;
        userId: number;
        articleId: number;
        value: number;
        comment: string;
        status: 'razduženo';
        timestampe: string;
        serialNumber: string;
        invBroj: string;
    }[];
    destroyeds?: {
        destroyedId: number;
        userId: number;
        articleId: number;
        value: number;
        comment: string;
        status: 'otpisano';
        timestampe: string;
        serialNumber: string;
    }[];
    responsibilities?:{
        responsibilityId: number;
        userArticleId: number,
        userId: number;
        articleId: number;
        documentId: number;
        value: number;
        status: 'zaduženo';
        timestamp: string;
        serialNumber: string;
        invBroj: string;
    }[];
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
        export: string;
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