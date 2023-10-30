import ArticleType from "./ArticleType";
import FeaturesType from "./FeaturesType";

export default class CategoryType {
    categoryId?: number;
    name?: string;
    imagePath?:string;
    parentCategoryId?: number;
    articles?: ArticleType[]
    features?: FeaturesType[];
}