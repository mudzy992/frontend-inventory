import ArticleType from "./ArticleType";
import CategoryType from "./CategoryType";

export default class StockType {
    stockId?: number;
    name?: string;
    excerpt?: string;
    description?: string;
    contract?: string;
    categoryId?: number;
    sapNumber?: string;
    valueOnContract?: number;
    valueAvailable?: number;
    timestamp?: string;
    articles?: ArticleType[];
    category?: CategoryType;
}