import ArticleType from "./ArticleType";
import FeaturesType from "./FeaturesType";

export default class ArticleFeatureType {
    articleFeatureId?: number;
    articleId?: number;
    featureId?: number;
    featureValue?: string;
    article?:ArticleType;
    feature?: FeaturesType;
    use?: number;
  }

export interface FeatureBaseType {
    featureId?: number;
    name: string;
    articleFeatureId: number;
    value: string;
  };
