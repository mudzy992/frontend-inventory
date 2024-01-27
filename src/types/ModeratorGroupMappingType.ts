import TicketGroupType from "./TicketGroupType";
import UserType from "./UserType";

export default class ModeratorGroupMappingType {
  mappingId?: number;
  userId?: number;
  groupId?: number;
  parentGroupId?: number | null;
  group?: TicketGroupType;
  user?: UserType;
}
