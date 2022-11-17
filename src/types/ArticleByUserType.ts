export default interface ArticleByUserType {
    articleId?: number;
    name?: string;
    excerpt?: string;
    description?: string;
    concract?: string;
    sapNumber?: string;
    categoryId?: number;
    category: {
        name: string;
        imagePath: string;
        parentCategoryId:number;
    };
    articleFeature: {
        articleId: number;
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
    };
    userDetails:{
        userId: number;
        surname: string;
        forname: string;
        fullname: string;
        localNumber: string;
        telephone: string;
        email: string;
        jobId: number;
        departmentId: number;
        locationId: number;
        jobTitle: string;
        department: string;
        location: string;
    }[];
    destroyeds:{
        destroyedId:number;
        articleId: number;
        value:number;
        comment: string;
        timestamp: string;
        userId: string;
        serialNumber: string;
        status: 'otpisano';
    }[];
    debtItems:{
        debtItemsId:number;
        articleId:number;
        userId:number;
        value: number;
        comment:string;
        serialNumber:string;
        timestamp:string;
        status: 'razduženo';
    }[];
    responsibilities:{
        responsibilityId: number;
        articleId: number;
        userId: number;
        value: string;
        serialNumber: string;
        timestamp: string;
        status: 'zaduženo';
    }[];
}