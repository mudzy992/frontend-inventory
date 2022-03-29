export default class DestroyedType {
    articleId?: number;
    name?: string;
    value?: number;
    comment?: string;
    timestamp?: string;
    serialNumber?: string;
    article?:{
        name: string;
    };
    document?:{
        path: string;
    }
}