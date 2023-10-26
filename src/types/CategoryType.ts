import ArticleType from "./ArticleType";

export default class CategoryType {
    categoryId?: number;
    name?: string;
    imagePath?:string;
    parentCategoryId?: number;
    articles?: ArticleType[]
}