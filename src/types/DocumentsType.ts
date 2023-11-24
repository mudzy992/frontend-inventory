import ArticleTimelineType from "./ArticleTimelineType";
import ArticleType from "./ArticleType";

export default class DocumentsType {
    documentsId?: number;
    path?: string;
    signed_path?: string;
    createdDate?: string;
    articleId?: number;
    documentNumber?: number;
    articleTimelines?: ArticleTimelineType[];
    article?: ArticleType;
}