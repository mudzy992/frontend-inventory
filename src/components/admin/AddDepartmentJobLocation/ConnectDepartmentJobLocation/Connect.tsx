import React, { useEffect, useState } from "react";
import { ApiResponse, useApi } from "../../../../API/api";
import { Button, Form, Select, Spin, notification } from "antd";
import { useUserContext } from "../../../Contexts/UserContext/UserContext";
import { useNotificationContext } from "../../../Contexts/Notification/NotificationContext";

interface DepartmentType {
  departmentId: number;
  title: string;
  description: string;
  departmentCode: string;
  parentDepartmentId: number;
}

interface JobType {
  jobId: number;
  title: string;
  description: string;
  jobCode: string;
}

interface LocationType {
  locationId: number;
  name: string;
  code: string;
  parentLocationId: number;
}

interface AddDepartmentAndJobState {
  departmentId: number;
  jobId: number;
  locationId: number;
}

const ConnectDepartmentJobLocation: React.FC = () => {
  const { api } = useApi();
  const { role } = useUserContext();
  const [form] = Form.useForm();
  const { warning, error, success, info } = useNotificationContext();
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<DepartmentType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobType[]>([]);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationType[]>([]);

  const [state, setState] = useState<AddDepartmentAndJobState>();

  const [departmentLoading, setDepartmentLoading] = useState<boolean>(false);
  const [jobsLoading, setJobsLoading] = useState<boolean>(false);
  const [locationsLoading, setLocationsLoading] = useState<boolean>(false);

  const getDepartments = async () => {
    setDepartmentLoading(true)
    try {
      const departments = await api("api/department?sort=title,ASC", "get", {}, role);
      if (departments.status === "error") {
        warning.notification("Greška pri učitavanju sektora.");
        return;
      }
      setDepartments(departments.data);
      setFilteredDepartments(departments.data);
    } catch (err: any) {
      error.notification(err.data.message);
    } finally {
      setDepartmentLoading(false)
    }
  };

  const handleDepartmentSearch = (value: string) => {
    if (!value) {
      setFilteredDepartments(departments);
    } else {
      const filtered = departments.filter((department) =>
        department.title.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDepartments(filtered);
    }
  };

  const handleDepartmentClear = () => {
    setFilteredDepartments(departments);
  };

  const handleDropdownDepartmentVisibleChange = (open: boolean) => {
    if (open && departments.length === 0) {
      getDepartments();
    }
  };

  const getJobs = async () => {
    setJobsLoading(true);
    try {
      
      const jobs = await api("api/job?sort=title,ASC", "get", {}, role);
      if (jobs.status === "error") {
        warning.notification("Greška pri učitavanju radnih mjesta.");
        return;
      }
      setJobs(jobs.data);
      setFilteredJobs(jobs.data)
    } catch (err: any) {
      error.notification(err.data.message);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleJobSearch = (value: string) => {
    if (!value) {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter((job) =>
        job.title.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  };

  const handleJobClear = () => {
    setFilteredJobs(jobs);
  };

  const handleDropdownJobsVisibleChange = (open: boolean) => {
    if (open && jobs.length === 0) {
      getJobs();
    }
  };

  const getLocations = async () => {
    setLocationsLoading(true)
    try {
      setLocationsLoading(true);
      const locations = await api("api/location?sort=name,ASC", "get", {}, "administrator");
      if (locations.status === "error") {
        warning.notification("Greška pri učitavanju lokacija.");
        return;
      }
      setLocations(locations.data);
      setFilteredLocations(locations.data)
    } catch (err: any) {
      error.notification(err.data.message);
    } finally {
      setLocationsLoading(false)
    }
  };

  const handleLocationSearch = (value: string) => {
    if (!value) {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter((loc) =>
        loc.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  };

  const handleLocationClear = () => {
    setFilteredLocations(locations);
  };

  const handleDropdownLocationsVisibleChange = (open: boolean) => {
    if (open && locations.length === 0) {
      getLocations();
    }
  };

  

  const handleSubmit = (values: any) => {
    const departmentJobLocation = {
      departmentId: values.departmentId,
      jobId: values.jobId,
      locationId: values.locationId,
    };
    setState(departmentJobLocation);
    doAddDepartmentJobLocation(departmentJobLocation);
  };

  const doAddDepartmentJobLocation = (departmentJobLocation: {
    departmentId: number;
    jobId: number;
    locationId: number;
  }) => {
    api("api/departmentJob/", "post", departmentJobLocation, role).then(
      (res: ApiResponse) => {
        if (res.status === "error") {
          warning.notification(
            "Greška prilikom dodavanja sektora/službe/odjeljenja, pripadajućeg radnog mjesta te lokacije."
          );
          return;
        }
        success.notification(
          "Uspješno dodan sektor/služba/odjeljenje, pripadajuće radno mjesto te lokacija."
        );
      }
    );
  };

  return (
    <div>
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={state}
          form={form}
          onFinishFailed={() =>
            info.notification("Polja sa oznakom * su obavezna")
          }
        >
          <Form.Item
            label="Sektor/služba/odjeljenje"
            name="departmentId"
            rules={[{ required: true, message: "Odaberite Sektor/služba/odjeljenje!" }]}
          >
            <Select
              placeholder="Odaberite Sektor/služba/odjeljenje"
              loading={departmentLoading}
              showSearch
              onSearch={handleDepartmentSearch}
              allowClear
              onClear={handleDepartmentClear}
              filterOption={false}
              onDropdownVisibleChange={handleDropdownDepartmentVisibleChange}
              
            >
              {filteredDepartments.map((department) => (
                <Select.Option key={department.departmentId} value={department.departmentId} label={department.title}>
                  {department.departmentId} - {department.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Naziv radnog mjesta"
            name="jobId"
            rules={[{ required: true, message: "Odaberite radno mjesto!" }]}
          >
            <Select
              placeholder="Odaberite radno mjesto"
              loading={jobsLoading}
              showSearch
              onSearch={handleJobSearch}
              allowClear
              onClear={handleJobClear}
              filterOption={false}
              onDropdownVisibleChange={handleDropdownJobsVisibleChange}
            >
              {filteredJobs.map((job) => (
                <Select.Option key={job.jobId} value={job.jobId} label={job.title}>
                  {job.jobId} - {job.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Lokacija"
            name="locationId"
            rules={[{ required: true, message: "Odaberite lokaciju!" }]}
          >
            <Select
              placeholder="Odaberite lokaciju"
              loading={locationsLoading}
              showSearch
              onSearch={handleLocationSearch}
              allowClear
              onClear={handleLocationClear}
              filterOption={false}
              onDropdownVisibleChange={handleDropdownLocationsVisibleChange}
            >
              {filteredLocations.map((location) => (
                <Select.Option key={location.locationId} value={location.locationId}>
                  {location.locationId} - {location.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<i className="bi bi-plus-circle" />}>
              Poveži
            </Button>
          </Form.Item>
        </Form>
    </div>
  );
};

export default ConnectDepartmentJobLocation;
