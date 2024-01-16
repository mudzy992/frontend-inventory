import CategoryType from "./CategoryType";
import HelpdeskTicketsType from "./HelpdeskTicketsType";
import LocationType from "./LocationType";
import ModeratorGroupMappingType from "./ModeratorGroupMappingType";

export default class TicketGroupType {
    groupId?: number;
    groupName?: string;
    locationId?: number;
    parentGroupId?:number;
    categories?: CategoryType[];
    parentGroup?: TicketGroupType;
    ticketGroups?: TicketGroupType[];
    moderatorGroupMappings?: ModeratorGroupMappingType[];
    helpdeskTickets?: HelpdeskTicketsType[];
    helpdeskTickets2?: HelpdeskTicketsType[];
    location?: LocationType;
}