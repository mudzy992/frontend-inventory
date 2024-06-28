import ArticleType from "./ArticleType";
import FeaturesType from "./FeaturesType";

export default class ArticleFeatureType {
    articleFeatureId?: number;
    articleId?: number;
    featureId?: number;
    featureValue?: string;
    article?:ArticleType;
    feature?: FeaturesType;
  }
  