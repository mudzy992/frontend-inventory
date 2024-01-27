import HelpdeskTicketsType from "./HelpdeskTicketsType";
import UserType from "./UserType";

export default class Comments {
  commentId?: number;
  text?: string;
  userId?: number;
  createdAt?: Date;
  parentCommentId?: number | null;
  ticketId?: number;

  ticket?: HelpdeskTicketsType;
  parentComment?: Comments;
  comments?: Comments[];
  user?: UserType;
}
