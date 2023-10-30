import StockFeatureType from "./StockFeaturesType";
export default class FeaturesType {
    articleId?: number;
    name?: string;
    value?: string;
    featureId?: number;
    categoryId?: number;
    stockFeatures?: StockFeatureType[];
}