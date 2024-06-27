import ArticleType from "./ArticleType";
import OidType from "./OidType";

export default class PrinterOidType {
    articleId?: number;
    oidId?: number;
    value?: string;
    invoiceId?: number;
    invoice?:InvoiceType;
    article?: ArticleType;
    oid?: OidType;
  }
  