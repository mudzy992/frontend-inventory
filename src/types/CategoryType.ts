<<<<<<< Updated upstream
=======
import ArticleType from "./ArticleType";
import FeaturesType from "./FeaturesType";

>>>>>>> Stashed changes
export default class CategoryType {
    categoryId?: number;
    name?: string;
    imagePath?:string;
<<<<<<< Updated upstream
    articles?: {
        articleId: number;
        name: string;
        excerpt: string;
        description: string;
        concract: string;
        categoryId: number;
        comment: string;
        sapNumber: string;
      }[]
=======
    parentCategoryId?: number;
    articles?: ArticleType[];
    features?: FeaturesType[]
>>>>>>> Stashed changes
}