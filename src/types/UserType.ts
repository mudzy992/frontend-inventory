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
    email?: string;
    jobId?: number;
    departmentId?: number;
    locationId?: number;
    registrationDate?: string;
    lastLoginDate?: string;
    status?: "string"
    department?: DepartmentType;
    job?: JobType;
    location?: LocationType;
    articles?: ArticleType[];
}