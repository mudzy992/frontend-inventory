import ArticleFeatureType from "./ArticleFeatureType";

export default class FeaturesType {
    articleId?: number;
    name?: string;
    value?: string;
    featureId?: number;
    categoryId?: number;
    articleFeatures?: ArticleFeatureType[];
}