import React, { useEffect, useState } from "react";
import {  Input, Select, Modal, Form, Checkbox, message, Spin, Flex, notification } from "antd";
import DepartmentType from "../../../../types/DepartmentType";
import JobType from "../../../../types/JobType";
import LocationType from "../../../../types/LocationType";
import { UserRole } from "../../../../types/UserRoleType";
import { useUserContext } from "../../../UserContext/UserContext";
import { useApi } from "../../../../API/api";

type EditUserFormProps = {
  userId: number;
  onClose: () => void;
  onSuccess?: () => void;
};

const EditUserForm: React.FC<EditUserFormProps> = ({ userId, onClose, onSuccess = () => {} }) => {
  const { api } = useApi();
  const { role } = useUserContext();
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [messageApi, contextHolder] = notification.useNotification();

  const [formData, setFormData] = useState({
    forname: "",
    surname: "",
    email: "",
    localNumber: "",
    telephone: "",
    departmentId: 0,
    jobId: 0,
    locationId: 0,
    organizationId: 0,
    status: "",
    code: 0,
    gender: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [userRes, departmentsRes, locationsRes] = await Promise.all([
          api(`api/user/${userId}`, "get", {}, role as UserRole),
          api("api/department", "get", {}, role as UserRole),
          api("api/location", "get", {}, role as UserRole),
        ]);

        const userData = userRes.data;

        setFormData(userRes.data);
        setDepartments(departmentsRes.data);
        setLocations(locationsRes.data);

        if (userData && userData.departmentId) {
          const jobs = await getJobsByDepartmentId(userData.departmentId);
          setJobs(jobs);
        }
      } catch (error) {
        messageApi.error({message:"Greška", description:'Greška prilikom dohvaćanja podataka: ' + error})
      } finally {
        setLoading(false)
      }
    };

    fetchData();
  }, [userId, role]);

  useEffect(() => {
    if (formData) {
      form.setFieldsValue(formData);
    }
  }, [formData, form]);

  const getJobsByDepartmentId = async (departmentId: number): Promise<JobType[]> => {
    return new Promise((resolve) => {
      api(`api/job/department/${departmentId}`, "get", {}, role as UserRole).then((res) => {
        const jobs: JobType[] = res.data.map((item: any) => ({
          jobId: item.jobId,
          title: item.title,
          jobCode: item.jobCode,
        }));
        resolve(jobs);
      });
    });
  };

  const addJobDepartmentChange = async (selectedValue: any) => {
    try {
      setFormData({ ...formData, departmentId: selectedValue, jobId: 0 });
      const jobs = await getJobsByDepartmentId(selectedValue);
      setJobs(jobs);
    } catch (error) {
      messageApi.error({message:"Greška", description:'Greška prilikom mapiranja radnih mjesta za sektor: ' + error})
    }
  };

  const handleSave = async (values: any) => {
    const payload = { ...values, code: Number(values.code)};
    if (!showPasswordFields || !values.password) {
      delete payload.password;
      delete payload.confirmPassword;
    }

    try {
      setLoading(true);
      
      const res = await api(`api/user/edit/${userId}`, "patch", payload, role as UserRole);
      if (onSuccess) onSuccess();
      if(res.status === 'ok'){
        messageApi.success({message:"Podaci uspješno izmjenjeni!"})
      }

      if(res.status === 'error'){
        messageApi.error({message:"Greška", description:(res.data.response.data.message)})
      }
    } catch (error:any) {
        messageApi.error({message:"Greška", description:(error.message)})
    } finally {
      setLoading(false);
    }
  };

  return (
<div>
{contextHolder}
    <Modal
      title="Izmijeni korisničke podatke"
      open={true}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
      okText={"Snimi"}
      style={{ top: 20 }}
    >
      {loading ? (
        <div className="flex justify-center" >
          <Spin />
        </div>
        
      ) :(
      <Form
        form={form}
        layout="vertical"
        initialValues={formData}
        onFinish={handleSave}
      >
        <Form.Item label="Ime" name="forname" rules={[{ required: true, message: "Ime je obavezno" }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Prezime" name="surname" rules={[{ required: true, message: "Prezime je obavezno" }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Email" name="email" rules={[{ type: "email", required: true, message: "Molimo unesite validnu email adresu" }]}>
          <Input type="email" />
        </Form.Item>

        <Form.Item label="Telefon" name="telephone">
          <Input />
        </Form.Item>

        <Form.Item label="Telefon/lokal" name="localNumber">
          <Input />
        </Form.Item>

        <Form.Item label="Kadrovski broj" name="code" rules={[{ required: true, message: 'Kadrovski broj je obavezan' }]}>
          <Input type="number"/>
        </Form.Item>

        <Form.Item label="Pol" name="gender" rules={[{ required: true, message: 'Molimo odaberite pol' }]}>
          <Select>
            <Select.Option value="muško">Muško</Select.Option>
            <Select.Option value="žensko">Žensko</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Sektor" name="departmentId" rules={[{ required: true, message: 'Sektor je obavezan' }]}>
          <Select onChange={addJobDepartmentChange}>
            {departments.map((dept) => (
              <Select.Option key={dept.departmentId} value={dept.departmentId}>
                {dept.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Radno mjesto" name="jobId" rules={[{ required: true, message: 'Radno mjesto je obavezno' }]}>
          <Select disabled={!formData.departmentId || jobs.length === 0}>
            {jobs.map((job) => (
              <Select.Option key={job.jobId} value={job.jobId}>
                {job.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Lokacija" name="locationId" rules={[{ required: true, message: 'Lokacija je obavezna' }]}>
          <Select>
            {locations.map((location) => (
              <Select.Option key={location.locationId} value={location.locationId}>
                {location.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Status je obavezan' }]}>
          <Select>
            <Select.Option value="aktivan">Aktivan</Select.Option>
            <Select.Option value="neaktivan">Neaktivan</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Organizacija" name="organizationId" rules={[{ required: true, message: 'Status je obavezan' }]}>
          <Select>
            <Select.Option value={1}>Distribucija</Select.Option>
            <Select.Option value={2}>Snabdjevanje</Select.Option>
          </Select>
        </Form.Item>

        <Checkbox
          checked={showPasswordFields}
          onChange={(e) => setShowPasswordFields(e.target.checked)}
        >
          Želim promijeniti lozinku
        </Checkbox>

        {showPasswordFields && (
          <>
            <Form.Item
              label="Nova Lozinka"
              name="password"
              rules={[{ required: true, message: "Molimo unesite novu lozinku" }]}
            >
              <Input.Password/>
            </Form.Item>

            <Form.Item
              label="Potvrdi Lozinku"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Molimo potvrdite novu lozinku" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Lozinke se ne podudaraju!"));
                  },
                }),
              ]}
            >
              <Input.Password/>
            </Form.Item>
          </>
        )}
      </Form>
    )}
    </Modal>
    </div>
  );
};

export default EditUserForm;
