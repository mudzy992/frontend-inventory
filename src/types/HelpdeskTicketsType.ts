import ArticleType from "./ArticleType";
import TicketGroupType from "./TicketGroupType";
import UserType from "./UserType";

export default class HelpdeskTicketsType {
    ticketId?: number;
    userId?: number;
    articleId?: number;
    groupId?: number;
    groupPartentId?: number;
    description?: string;
    resolveDescription?: string;
    resolveDate?: Date;
    resolveTimespand?: string;
    createdAt?: Date;
    duoDate?: Date;
    clientDuoDate?: Date;
    status?: "otvoren" | "izvršenje" | "zatvoren";
    assignedTo?: number;
    priority?: "Problem veće hitnosti ili VIP korisnik"
    | "Problem u radu servisa (za sve korisnike u firmi)"
    | "Poteškoće u radu grupe korisnika"
    | "Povremene poteškoće u radu grupe korisnika"
    | "Poteškoće u radu korisnika"
    | "Potrebna pomoć korisniku"
    | "Zahtjevi za izmjenu/doradu manje složenosti"
    | "Zahtjevi za izmjenu/doradu veće složenosti";
    resolveResolution?:  "Nemoguće riješiti ili je u koliziji sa standardom ili politikom"
    | "Riješen - nije potrebna analiza uzroka"
    | "Uzrok problema nije otklonjen - privremeno rješenje"
    | "Zahtjev je povučen od strane korisnika";
    article?: ArticleType;
    assignedTo2?: UserType;
    group?: TicketGroupType;
    groupPartent?: TicketGroupType;
    user?: UserType;   
}