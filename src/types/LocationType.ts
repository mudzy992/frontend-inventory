import TicketGroupType from "./TicketGroupType";

export default class LocationType {
    locationId?: number;
    name?: string;
    code?: string;
    parentLocationId?: number;
    ticketGroups?: TicketGroupType[];
}