import Comments from "./CommentsType";
import HelpdeskTicketsType from "./HelpdeskTicketsType";

export default class CommentHelpdeksTicketsType {
    commentTicketsId?: number;
    commentId?: number;
    ticketId?: number;
  
    ticket?: HelpdeskTicketsType;
    comment?: Comments;
  }
  