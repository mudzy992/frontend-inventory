import ArticleType from "./ArticleType";
import FeaturesType from "./FeaturesType";
import TicketGroupType from "./TicketGroupType";

export default class CategoryType {
    categoryId?: number;
    name?: string;
    imagePath?:string;
    parentCategoryId?: number;
    articles?: ArticleType[]
    features?: FeaturesType[];
    group?: TicketGroupType;
}