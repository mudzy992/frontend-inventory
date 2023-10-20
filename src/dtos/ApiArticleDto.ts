export default interface ApiArticleDto {
    articleId: number;
    name: string;
    excerpt: string;
    description: string;
    comment: string;
    concract: string;
    sapNumber: string;
    categoryId: number;
    category?: {
        name: string;
        imagePath: string;
    };
    articleFeature: {
        articleFeatureId: number;
        featureId: number;
        value: string;
    }[];
    features: {
        featureId: number;
        name: string;
    }[];
    userArticles:{
        userArticleId: number;
        articleId: number;
        documentId: number;
        userId: number;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
        comment: string;
    }[];
    userDetails:{
        userId: number;
        surname: string;
        forname: string;
        email: string;
        jobTitle: string;
        department: string;
        location: string;
    }[];
    articlesInStock:{
        stockId: number;
        timestamp: string;
        articleId: number;
        valueOnConcract: number;
        valueAvailable: number;
        sapNumber: string;
    };
    documents:{
        documentsId: number;
        articleId: number;
        path: string;
        documentNumber: number;
    }[];
}