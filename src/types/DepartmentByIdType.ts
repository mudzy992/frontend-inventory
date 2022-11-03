export default class DepartmentByIdType {
    departmentJobId?: number;
    departmentId?: number;
    jobId?: number;
    locationId?: number;
    department?: {
        departmentId: number;
        title: string;
        description: string;
        departmendCode: number;
        parentDepartmentId: number;
    };
    job?: {
        jobId: number;
        title: string;
        description: string;
        jobCode: number;
    };
    location?: {
        locationId: number;
        name: string;
        code: number;
        parentLocationId: string
    };
    users?:
        {
            userId: number;
            departmentJobId: number;
            surname: string;
            forname: string;
            fullname: string;
            localNumber: number;
            telephone: string;
            email: string;
        }[]
}