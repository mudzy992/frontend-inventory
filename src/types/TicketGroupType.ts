import HelpdeskTicketsType from "./HelpdeskTicketsType";
import LocationType from "./LocationType";
import ModeratorGroupMappingType from "./ModeratorGroupMappingType";

export default class TicketGroupType {
    groupId?: number;
    groupName?: string;
    locationId?: number;
    parentGroupId?:number;
    parentGroup?: TicketGroupType;
    moderatorGroupMappings?: ModeratorGroupMappingType[];
    helpdeskTickets?: HelpdeskTicketsType[];
    location?: LocationType;
}