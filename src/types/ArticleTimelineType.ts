import DocumentsType from "./DocumentsType";
import UserType from "./UserType";

export default class ArticleTimelineType {
  articleTimelineId?: number;
  articleId?: number;
  userId?: number;
  documentId?: number | null;
  serialNumber?: string;
  status?: string;
  timestamp?: string;
  invNumber?: string;
  comment?: string;
  document?: DocumentsType;
  user?: UserType;
  subbmited?: UserType;
}
