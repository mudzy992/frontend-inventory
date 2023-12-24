import ArticleTimelineType from "./ArticleTimelineType";
import ArticleType from "./ArticleType";
import DepartmentType from "./DepartmentType";
import HelpdeskTicketsType from "./HelpdeskTicketsType";
import JobType from "./JobType";
import LocationType from "./LocationType";
import ModeratorGroupMappingType from "./ModeratorGroupMappingType";
import RoleType from "./RoleType";

export default class UserType {
    userId?: number;
    surname?: string;
    forname?: string;
    fullname?: string;
    localNumber?: string;
    telephone?: string;
    passwordHash?: string;
    email?: string;
    jobId?: number;
    departmentId?: number;
    locationId?: number;
    registrationDate?: string;
    lastLoginDate?: string;
    status?: string;
    code?:number;
    gender?: string;
    roleId?: number;
    role?: RoleType;
    articles?: ArticleType[];
    articleTimelines?: ArticleTimelineType[];
    articleTimelines2?: ArticleTimelineType[];
    helpdeskTickets?: HelpdeskTicketsType[];
    helpdeskTickets2?: HelpdeskTicketsType[];
    moderatorGroupMappings?: ModeratorGroupMappingType[];
    department?: DepartmentType;
    job?: JobType;
    location?: LocationType;
}