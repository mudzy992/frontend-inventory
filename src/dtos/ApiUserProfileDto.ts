export default interface ApiUserProfileDto {
    userId: number;
    surname: string;
    forname: string;
    fullname: string;
    telephone: string;
    localNumber: string;
    email: string;
    jobId: number;
    departmentId: number;
    locationId: number;
    department: {
        departmentCode: string;
        description: string;
        parentDepartmentId: number;
        title: string;
    };
    job: {
        description: string;
        jobCode: string;
        title: string;
    };
    location: {
        name: string;
        code: string;
        parentLocationId: number;
    }
    articles: {
        articleId: number;
        name: string;
        excerpt: string;
        description: string;
        concract: string;
        categoryId: number;
        sapNumber: string;
    }[];
    responsibilities: {
        userArticleId: number;
        articleId: number;
        value: number;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        serialNumber: string;
        invBroj: string;
        documentId: number;
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
    userArticles: {
        articleId: number;
        comment: string;
        documentId: number;
        invBroj: string;
        serialNumber: string;
        status: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp: string;
        userArticleId: number;
    }[]
}