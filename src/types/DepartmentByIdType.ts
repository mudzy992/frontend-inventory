import DepartmentType from "./DepartmentType";
import JobType from "./JobType";
import LocationType from "./LocationType";
import UserType from "./UserType";

export default class DepartmentByIdType {
    departmentJobId?: number;
    departmentId?: number;
    jobId?: number;
    locationId?: number;
    department?: DepartmentType;
    job?: JobType;
    location?: LocationType;
    users?:UserType[]
}