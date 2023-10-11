export default class CategoryType {
    categoryId?: number;
    name?: string;
    imagePath?:string;
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
}