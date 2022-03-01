export default interface ApiUserProfileDto {
    userId: number;
    surname: string;
    forname: string;
    email: string;
    jobTitle: string;
    department: string;
    location: string;
    articles: {
        articleId: number;
        name: string;
        excerpt: string;
        description: string;
        comment: string;
        concract: string;
        categoryId: number;
        sapNumber: string;
    }[];
    responsibilityArticles: {
        userArticleId: number;
        articleId: number;
        value: number;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
    }[];
    debtItems:{
        debtItemsId: number;
        articleId: number;
        value: number;
        comment: string;
        timestamp: string;
        serialNumber: string;
    }[];
    destroyeds: {
        destroyedId: number;
        articleId: number;
        value: number;
        comment: string;
        timestamp: string
        serialNumber: string;
    }[];
}