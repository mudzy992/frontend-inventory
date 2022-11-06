export default interface ApiUserDto {
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
    department: {
        title: string;
        description: string;
        departmentCode: string;
        parentDepartmentId: number;
    };
    job: {
        title: string;
        description: string;
        jobCode: string;
    };
    location: {
        name: string;
        locationCode: string;
        parentLocationId: number;
    };
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
    userArticles: {
        userArticleId: number;
        articleId: number;
        documentId: number;
        userId: number;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
        invBroj: string;
    }[];
    responsibilities: {
        responsibilityId: number;
        userArticleId: number;
        userId: number;
        articleId: number;
        documentId: number;
        value: number;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
        invBroj: string;
    }[];
    debtItems:{
        debtItemsId: number;
        userArticleId: number;
        userId: number;
        articleId: number;
        documentId: number;
        value: number;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
        invBroj: string;
    }[];
    destroyeds: {
        destroyedId: number;
        userArticleId: number;
        userId: number;
        articleId: number;
        documentId: number;
        value: number;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
        invBroj: string;
    }[];
}