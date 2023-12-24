import ArticleType from "./ArticleType";
import TicketGroupType from "./TicketGroupType";
import UserType from "./UserType";

export default class HelpdeskTicketsType {
    ticketId?: number;
    userId?: number;
    articleId?: number;
    groupId?: number;
    title?: string;
    description?: string;
    resolveDescription?: string;
    createdAt?: Date;
    dueDate?: string;
    status?: "otvoren" | "izvršenje" | "zatvoren";
    assignedTo?: number;
    article?: ArticleType;
    assignedTo2?: UserType;
    group?: TicketGroupType;
    user?: UserType;
}