import React, { useEffect, useState } from "react";
import { Input, Select, SelectItem } from "@nextui-org/react";
import DepartmentType from "../../../../types/DepartmentType";
import JobType from "../../../../types/JobType";
import LocationType from "../../../../types/LocationType";
import OrganizationType from "../../../../types/OrganizationType";
import UserType from "../../../../types/UserType";
import api, { ApiResponse } from "../../../../API/api";
import { useUserContext } from "../../../UserContext/UserContext";
import { UserRole } from "../../../../types/UserRoleType";

type EditUserFormProps = {
  setEditUserStringFieldState: Function;
  setEditUserNumberFieldState: Function;
};

interface EdistUserStateProps {
    forname: string;
    surname: string;
    email: string;
    localNumber: string;
    telephone: string;
    departmentId: number;
    jobId: number;
    locationId: number;
    organizationId: number;
    status: string;
    passwordHash: string;
    code: number;
    gender: string;
  }

const EditUserForm: React.FC<EditUserFormProps> = ({
  setEditUserStringFieldState,
  setEditUserNumberFieldState,
}) => {
    const { role } = useUserContext();
    const [data, setUserData] = useState<UserType[]>([]);
    const [departmentData, setDepartmentData] = useState<DepartmentType[]>([]);
    const [jobData, setJobData] = useState<JobType[]>([]);
    const [locationData, setLocationData] = useState<LocationType[]>([]);
    const [organizationData, setOrganizationData] = useState<OrganizationType[]>([]);
    const [editUserState, setEditUserState] = React.useState<EdistUserStateProps>(
        {
          forname: "",
          surname: "",
          email: "",
          localNumber: "",
          telephone: "",
          departmentId: Number(),
          jobId: Number(),
          locationId: Number(),
          organizationId: Number(),
          status: "",
          passwordHash: "",
          code: Number(),
          gender: "",
        },
      );

      useEffect(()=> {
        getDepartmentData()
        getLocationData()
        getOrganizationsData()
      }, [])
      const getLocationData = async () => {
        try {
          const res: ApiResponse = await api(
            "api/location?sort=name,ASC",
            "get",
            {},
            role as UserRole,
          );
          setLocationData(res.data);
          return res.data;
        } catch (error) {
          throw error;
        }
      };
    
      const getDepartmentData = async () => {
        try {
          const res: ApiResponse = await api(
            "api/department?sort=title,ASC",
            "get",
            {},
            role as UserRole,
          );
          const data = res.data;
          setDepartmentData(data);
          return data;
        } catch (error) {
          throw error;
        }
      };
    
      const getOrganizationsData = async () => {
        try {
          const res: ApiResponse = await api(
            "api/organization",
            "get",
            {},
            role as UserRole,
          );
          const data = res.data;
          setOrganizationData(data);
          return data;
        } catch (error) {
          throw error;
        }
      };
    
      const getJobsByDepartmentId = async (
        departmentId: number,
      ): Promise<JobType[]> => {
        return new Promise((resolve) => {
          api(
            `api/job/department/${departmentId}`,
            "get",
            {},
            role as UserRole,
          ).then((res: ApiResponse) => {
            const jobs: JobType[] = res.data.map((item: any) => ({
              jobId: item.jobId,
              title: item.title,
              jobCode: item.jobCode,
            }));
            resolve(jobs);
          });
        });
      };

  return (
    <div className="col-span-2 md:col-span-2 lg:col-span-4 lg:pl-4">
      <div className="grid-cols mb-3 grid gap-3 lg:grid-cols-3">
        <Input value={editUserState.surname} label="Ime" onValueChange={(value) => setEditUserStringFieldState("surname", value)} />
        <Input value={editUserState.forname} label="Prezime" onValueChange={(value) => setEditUserStringFieldState("forname", value)} />
        <Input value={editUserState.code.toString()} label="Kadrovski broj" onValueChange={(value) => setEditUserStringFieldState("code", value)} />
      </div>
      <div className="grid-cols mb-3 grid gap-3 lg:grid-cols-3">
        <Input value={editUserState.email} label="Email" onValueChange={(value) => setEditUserStringFieldState("email", value)} />
        <Input value={editUserState.telephone} label="Telefon" onValueChange={(value) => setEditUserStringFieldState("telephone", value)} />
        <Input value={editUserState.localNumber} label="Telefon/lokal" onValueChange={(value) => setEditUserStringFieldState("localNumber", value)} />
      </div>
      <div className="grid-cols mb-3 grid gap-3 lg:grid-cols-2">
        <Select label="Sektor/odjeljenje" selectedKeys={[editUserState.departmentId?.toString()]} onChange={(e) => setEditUserNumberFieldState("departmentId", e.target.value)}>
          {departmentData.map((department) => (
            <SelectItem key={department.departmentId!} textValue={department.title} value={department.departmentId}>
              {department.title}
            </SelectItem>
          ))}
        </Select>
        <Select label="Radno mjesto" selectedKeys={[editUserState.jobId?.toString()]} onChange={(e) => setEditUserNumberFieldState("jobId", e.target.value)}>
          {jobData.map((job) => (
            <SelectItem key={job.jobId!} textValue={job.title} value={job.jobId}>
              {job.title}
            </SelectItem>
          ))}
        </Select>
      </div>
      <div className="grid-cols mb-3 grid gap-3 lg:grid-cols-3">
        <Select label="Lokacija" selectedKeys={[editUserState.locationId?.toString()]} onChange={(e) => setEditUserNumberFieldState("locationId", e.target.value)}>
          {locationData.map((location) => (
            <SelectItem key={location.locationId!} textValue={location.name} value={location.locationId}>
              {location.name}
            </SelectItem>
          ))}
        </Select>
        <Select label="Organizacija" selectedKeys={[editUserState.organizationId?.toString()]} onChange={(e) => setEditUserNumberFieldState("organizationId", e.target.value)}>
          {organizationData.map((organization) => (
            <SelectItem key={organization.organizationId!} textValue={organization.name} value={organization.organizationId}>
              {organization.name}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default EditUserForm;
