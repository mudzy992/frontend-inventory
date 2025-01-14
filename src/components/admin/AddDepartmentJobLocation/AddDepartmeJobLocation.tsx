import React, { useEffect, useState } from "react";
import { ApiResponse, useApi } from "../../../API/api";
import { Button, Form, Select, Spin, notification } from "antd";
import { useUserContext } from "../../UserContext/UserContext";
import { useNotificationContext } from "../../Notification/NotificationContext";

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
  add: {
    departmentJobLocation: {
      departmentId: number;
      jobId: number;
      locationId: number;
    };
  };
}

const AddDepartmentJobLocation: React.FC = () => {
  const { api } = useApi();
  const { role } = useUserContext();
  const { warning, error, success } = useNotificationContext();
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [state, setState] = useState<AddDepartmentAndJobState>({
    add: {
      departmentJobLocation: {
        departmentId: 0,
        jobId: 0,
        locationId: 0,
      },
    },
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log(state);
    getData();
  }, [state.add.departmentJobLocation.departmentId, state.add.departmentJobLocation.jobId, state.add.departmentJobLocation.locationId]);

  const getData = async () => {
    try {
      setLoading(true);
      const [departments, jobs, locations] = await Promise.all([
        api("api/department?sort=title,ASC", "get", {}, role),
        api("api/job?sort=title,ASC", "get", {}, role),
        api("api/location?sort=name,ASC", "get", {}, "administrator"),
      ]);

      if (
        departments.status === "error" ||
        jobs.status === "error" ||
        locations.status === "error"
      ) {
        warning.notification("Greška pri učitavanju podataka.");
        return;
      }
      setDepartments(departments.data);
      setJobs(jobs.data);
      setLocations(locations.data);
      setLoading(false);
    } catch (err: any) {
      error.notification(err.data.message);
      setLoading(false);
    }
  };

  const doAddDepartmentJobLocation = () => {
    api("api/departmentJob/", "post", state.add.departmentJobLocation, role).then(
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
        getData();
      }
    );
  };

  const handleSubmit = (values: any) => {
    setState((prevState) => ({
      ...prevState,
      add: {
        departmentJobLocation: values,
      },
    }));
    doAddDepartmentJobLocation();
  };

  const isJobDisabled = state.add.departmentJobLocation.departmentId === 0;
  const isLocationDisabled = state.add.departmentJobLocation.jobId === 0;

  return (
    <div>
      <Spin spinning={loading}>
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={state.add.departmentJobLocation}
        >
          <Form.Item
  label="Sektor/služba/odjeljenje"
  name="departmentId"
  rules={[{ required: true, message: "Odaberite Sektor/služba/odjeljenje!" }]}
  onSelect={(value: number) => {
    setState((prevState) => ({
      ...prevState,
      add: {
        departmentJobLocation: {
          ...prevState.add.departmentJobLocation,
          departmentId: value,
        },
      },
    }));
  }}
>
  <Select
    showSearch
    placeholder="Odaberite Sektor/služba/odjeljenje"
    optionFilterProp="label"
    filterSort={(optionA, optionB) =>
      (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())
    }
  >
    {departments.map((department) => (
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
  onSelect={(value: number) => {
    setState((prevState) => ({
      ...prevState,
      add: {
        departmentJobLocation: {
          ...prevState.add.departmentJobLocation,
          jobId: value,
        },
      },
    }));
  }}
>
  <Select
    showSearch
    placeholder="Odaberite radno mjesto"
    optionFilterProp="label"
    filterSort={(optionA, optionB) =>
      (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())
    }
    disabled={isJobDisabled}
  >
    {jobs.map((job) => (
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
  onSelect={(value: number) => {
    setState((prevState) => ({
      ...prevState,
      add: {
        departmentJobLocation: {
          ...prevState.add.departmentJobLocation,
          locationId: value,
        },
      },
    }));
  }}
>
  <Select
    placeholder="Odaberite lokaciju"
    disabled={isLocationDisabled}
  >
    {locations.map((location) => (
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
      </Spin>
    </div>
  );
};

export default AddDepartmentJobLocation;
