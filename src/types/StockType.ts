import ArticleType from "./ArticleType";
import CategoryType from "./CategoryType";
import StockFeatureType from "./StockFeaturesType";

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
    stockFeatures?: StockFeatureType[];
    articles?: ArticleType[];
    category?: CategoryType;
}