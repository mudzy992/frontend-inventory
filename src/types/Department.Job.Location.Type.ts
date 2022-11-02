export default class DepartmentJobLocationType {
    departmentJobId?: number;
        departmentId?: number;
        jobId?: number;
        locationId?: number;
        department?: {
            departmentId: number;
            title: string;
            description: string;
            departmendCode: string;
            parentDepartmentId: number;
        };
        job?: {
            jobId: number;
            title: string;
            description: string;
            jobCode: string;
        };
        location?: {
            locationId: number;
            name: string;
            code: string;
            parentLocationId: null
        };
        users?: {
                userId: number;
                departmentJobId: number;
                surname: string;
                forname: string;
                fullname: string;
                localNumber: string;
                telephone: string;
                email: string;
            }[];
}