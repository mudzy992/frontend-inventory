export default interface UserArticleDto {
    userArticleId?: number;
    responsibilityId?: number | null;
    debtId?: number | null;
    destroyId?: number | null;
    userId?: number;
    articleId?: number;
    status?: 'zaduženo' | 'razduženo' | 'otpisano';
    timestamp?: string;
    serialNumber?: string;
    comment?: string;
    debt?:{
        debtItemsId: number;
        userId: number;
        articleId: number;
        value: number;
        comment: string;
        status: 'razduženo'
        timestampe: string;
        serialNumber: string;
    } | null;
    destroy?:{
        destroyedId: number;
        userId: number;
        articleId: number;
        value: number;
        comment: string;
        status: 'otpisano'
        timestampe: string;
        serialNumber: string;
    } | null;
    responsibility?:{
        responsibilityId: number;
        userId: number;
        articleId: number;
        value: number;
        status: 'zaduženo';
        timestamp: string;
        serialNumber: string;
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
}