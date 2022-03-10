export default interface ArticleByUserType {
    articleId?: number;
    name?: string;
    excerpt?: string;
    description?: string;
    comment?: string;
    concract?: string;
    sapNumber?: string;
    categoryId?: number;
    category: {
        name: string;
        imagePath: string;
        parentCategoryId:number;
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
    userArticle:{
        userArticleId: number;
        responsibilityId: number;
        debtId: number;
        destroyId: number;
        articleId: number;
        userId: number;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
    }[];
    articlesInStock:{
        stockId: number;
        timestamp: string;
        articleId: number;
        valueOnConcract: number;
        valueAvailable: number;
        sapNumber: string;
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
    destroyed:{
        destroyedId:number;
        articleId: number;
        value:number;
        comment: string;
        timestamp: string;
        userId: string;
        serialNumber: string;
    }[];
    debtItems:{
        debtItemsId:number;
        articleId:number;
        userId:number;
        value: number;
        comment:string;
        serialNumber:string;
        timestamp:string;
    }[];
    responsibility:{
        responsibilityId: number;
        articleId: number;
        userId: number;
        value: string;
        serialNumber: string;
        timestamp: string;
        status: 'razduženo';
    }[];
}