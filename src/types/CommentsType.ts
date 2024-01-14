import CommentHelpdeksTicketsType from "./CommentHelpdeksTickets.Type";
import UserType from "./UserType";

export default class Comments {
  commentId?: number;
  text?: string;
  userId?: number;
  createdAt?: Date;
  parentCommentId?: number | null;

  commentHelpdeskTickets?: CommentHelpdeksTicketsType[];
  parentComment?: Comments;
  comments?: Comments[];
  user?: UserType;
}
