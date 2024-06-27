import ArticleTimelineType from "./ArticleTimelineType";
import CategoryType from "./CategoryType";
import DocumentsType from "./DocumentsType";
import StockType from "./UserArticleType";
import UserType from "./UserType";
import HelpdeskTicketsType from "./HelpdeskTicketsType";
import UpgradeFeaturesType from "./UpgradeFeaturesType";
import ArticleFeatureType from "./ArticleFeatureType";
import PrinterOidType from "./PrinterOidType";

export default class ArticleType {
  articleId?: number;
  serialNumber?: string;
  invNumber?: string;
  userId?: number;
  documentNumber?: number;
  status?: string | undefined;
  timestamp?: string;
  stockId?: number;
  comment?: string;
  categoryId?: number;
  category?: CategoryType;
  articleFeatures?: ArticleFeatureType[];
  user?: UserType;
  stock?: StockType;
  articleTimelines?: ArticleTimelineType[];
  documents?: DocumentsType[];
  helpdeskTickets?: HelpdeskTicketsType[];
  upgradeFeatures?: UpgradeFeaturesType[];
  printerOs?:PrinterOidType[];
}
