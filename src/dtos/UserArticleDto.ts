export default interface UserArticleDto {
    userArticleId?: number;
    articleId?: number;
    documentId?: number;
    userId?: number;
    status?: 'zaduženo' | 'razduženo' | 'otpisano';
    timestamp?: string;
    serialNumber?: string;
    comment?: string;
    invBroj: string;
    debtItems?:{
        debtItemsId: number;
        userId: number;
        articleId: number;
        value: number;
        comment: string;
        status: 'razduženo'
        timestampe: string;
        serialNumber: string;
        invBroj: string;
    } | null;
    destroyeds?:{
        destroyedId: number;
        userId: number;
        articleId: number;
        value: number;
        comment: string;
        status: 'otpisano'
        timestampe: string;
        serialNumber: string;
        invBroj: string;
    } | null;
    responsibilities?:{
        responsibilityId: number;
        userArticleId: number;
        userId: number;
        articleId: number;
        value: number;
        status: 'zaduženo';
        timestamp: string;
        serialNumber: string;
        invBroj: string;
    } | null;
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
        descripion: string;
        comment: string;
        concract: string;
        categoryId: number;
        sapNumber: string;
    };
    document?: {
        documentsId: number;
        path: string;
        documentNumber: number;
    }
}