import ArticleTimelineType from "./ArticleTimelineType";
import ArticleType from "./ArticleType";
import DepartmentType from "./DepartmentType";
import JobType from "./JobType";
import LocationType from "./LocationType";

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
    status?: "string";
    code?:number;
    gender?: string;
    articles?: ArticleType[];
    articleTimelines?: ArticleTimelineType[];
    department?: DepartmentType;
    job?: JobType;
    location?: LocationType;
    
}