import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, Card, Divider, Steps, Typography } from "antd";
import { useApi } from "../../../API/api";
import { useNotificationContext } from "../../Contexts/Notification/NotificationContext";
import { useUserContext } from "../../Contexts/UserContext/UserContext";
import LocationType from "../../../types/LocationType";
import DepartmentType from "../../../types/DepartmentType";
import JobType from "../../../types/JobType";

const { Option } = Select;
const { Step } = Steps;
const { Title, Paragraph } = Typography;

interface UserDTO {
  surname: string;
  forname: string;
  email: string;
  password: string;
  confirmPassword: string;
  telephone: string;
  localNumber: string;
  departmentId?: number;
  jobId?: number;
  gender?: string;
  locationId?: number;
  organizationId?: number;
  status: string;
  code: number;
}

const AddUserPage: React.FC = () => {
  const { api } = useApi();
  const { role } = useUserContext();
  const { warning, error, success } = useNotificationContext();

  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const [userData, setUserData] = useState<UserDTO>({
    surname: '',
    forname: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    localNumber: '',
    status: 'neaktivan',
    code: 0,
    gender: "",
    organizationId: undefined,
    departmentId: undefined,
    jobId: undefined,
    locationId: undefined,
  });

  const [locations, setLocations] = useState<LocationType[]>([]);
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<DepartmentType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);

  const [loading, setLoading] = useState({
    location: false,
    department: false,
    job: false,
  });

  useEffect(() => {
    form.setFieldsValue(userData);
  }, [userData]);
  

  const onLocationDropdownVisibleChange = async (visible: boolean) => {
    if (visible && locations.length === 0) {
      setLoading((prev) => ({ ...prev, location: true }));
      try {
        const res = await api("api/location?sort=name,ASC", "get", {}, role);
        setLocations(res.data);
      } catch {
        warning.notification("Neuspješno dohvaćanje lokacija!");
      } finally {
        setLoading((prev) => ({ ...prev, location: false }));
      }
    }
  };

  const onDepartmentDropdownVisibleChange = async (visible: boolean) => {
    if (visible && departments.length === 0) {
      setLoading((prev) => ({ ...prev, department: true }));
      try {
        const res = await api("api/department?sort=title,ASC", "get", {}, role);
        setDepartments(res.data);
        setFilteredDepartments(res.data);
      } catch {
        warning.notification("Neuspješno dohvaćanje sektora!");
      } finally {
        setLoading((prev) => ({ ...prev, department: false }));
      }
    }
  };

  const handleDepartmentSearch = (value: string) => {
    if(!value){
      setFilteredDepartments(departments)
    } else {
      const filtered = departments.filter((department) =>
      department.title?.toLowerCase().includes(value.toLowerCase())
    );
      setFilteredDepartments(filtered);
    }
  };

  const handleClear = () => {
    setFilteredDepartments(departments);
  };

  const onDepartmentChange = async (value: number) => {
    setLoading((prev) => ({ ...prev, job: true }));
    try {
      const res = await api(`api/job/department/${value}`, "get", {}, role);
      setJobs(res.data);
      form.setFieldsValue({ jobId: undefined });
    } catch {
      warning.notification("Neuspješno dohvaćanje radnih mjesta!");
    } finally {
      setLoading((prev) => ({ ...prev, job: false }));
    }
  };

  const doAddUser = async (userData: UserDTO) => {
    try {
      const res = await api("api/user/add/", "post", userData, role);
      if (res.status === "ok") {
        success.notification("Novi radnik uspješno dodan!");
        form.resetFields()
        setCurrentStep(0)
      }
    } catch {
      error.notification("Neuspješno dodavanje novog radnika!");
    }
  };

  const handleNext = () => {
    form
      .validateFields()
      .then((values) => {
        setUserData((prevData) => ({
          ...prevData,
          ...values,
        }));
        setCurrentStep((prevStep) => prevStep + 1);
      })
      .catch((error) => {
        console.log('Validation failed:', error);
      });
  };

  const onFinish = () => {
    const formData = form.getFieldsValue();
    const finalData = {...userData, ...formData, code: Number(userData.code)}
    doAddUser(finalData);
  };

  const steps = [
    {
      title: "Osnovni podaci",
      content: (
        <>
          <Title level={4}>Unesite osnovne podatke korisnika</Title>
          <Paragraph>Molimo vas da unesete osnovne informacije kao što su ime, prezime, email i kontakt informacije.</Paragraph>
            <div className="min-h-fit grid grid-cols-1 gap-3 md:grid-cols-2">
              <Form.Item label="Ime" name="surname" rules={[{ required: true, message: "Unesite ime!" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Prezime" name="forname" rules={[{ required: true, message: "Unesite prezime!" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Email" name="email" rules={[{required:true, type: "email", message: "Unesite validan email!" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Telefon" name="telephone">
                <Input />
              </Form.Item>
              <Form.Item label="Broj u lokalu" name="localNumber">
                <Input type="number" />
              </Form.Item>
              <Form.Item label="Spol" name="gender" rules={[{ required: true, message: "Molimo odaberite spol!" }]}>
                <Select placeholder="Odaberite spol">
                  <Option value="muško">Muško</Option>
                  <Option value="žensko">Žensko</Option>
                </Select>
              </Form.Item>
            </div>
        </>
      ),
    },
    {
      title: "Poslovni podaci",
      content: (
        <>
          <Title level={4}>Unesite poslovne podatke korisnika</Title>
          <Paragraph>Odaberite poslovne podatke kao što su kadrovski broj, sektor, organizacija i radno mjesto.</Paragraph>
          <div className="min-h-fit grid grid-cols-1 gap-3 md:grid-cols-2">
          <Form.Item label="Kadrovski broj" name="code">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Select placeholder="Odaberite status">
              <Option value="aktivan">Aktivan</Option>
              <Option value="neaktivan">Neaktivan</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Organizacija" name="organizationId" rules={[{ required: true, message: "Molimo odaberite odgovarajuću organizaciju!" }]}>
            <Select placeholder="Odaberite organizaciju">
              <Option value={1}>Distribucija</Option>
              <Option value={2}>Snabdjevanje</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Sektor/odjeljenje" name="departmentId" rules={[{ required: true, message: "Molimo odaberite odgovarajući sektor/odjeljenje/službu!" }]}>
            <Select
              placeholder="Odaberite sektor"
              onChange={onDepartmentChange}
              onDropdownVisibleChange={onDepartmentDropdownVisibleChange}
              showSearch
              onSearch={handleDepartmentSearch}
              filterOption={false}
              onClear={handleClear}
              loading={loading.department}
            >
              {filteredDepartments.map((dep) => (
                <Option key={dep.departmentId} value={dep.departmentId}>
                  {dep.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Radno mjesto" name="jobId" rules={[{ required: true, message: "Molimo odaberite odgovarajuće radno mjesto" }]}>
            <Select placeholder="Odaberite radno mjesto" loading={loading.job} disabled={!jobs.length}>
              {jobs.map((job) => (
                <Option key={job.jobId} value={job.jobId}>
                  {job.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Lokacija" name="locationId" rules={[{ required: true, message: "Molimo odberite lokaciju zaposlenika!" }]}>
            <Select placeholder="Odaberite lokaciju" onDropdownVisibleChange={onLocationDropdownVisibleChange} loading={loading.location}>
              {locations.map((loc) => (
                <Option key={loc.locationId} value={loc.locationId}>
                  {loc.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          </div>
        </>
      ),
    },
    {
      title: "Lozinka",
      content: (
        <>
          <Title level={4}>Unesite lozinku</Title>
          <Paragraph>Unesite lozinku za korisnički račun i potvrdite je.</Paragraph>
          <Form.Item
            label="Lozinka"
            name="password"
            rules={[{ required: true, message: "Unesite lozinku!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Potvrda lozinke"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[{ required: true, message: "Potvrdite lozinku!" }, {
                validator: (_, value) =>
                  value && value !== form.getFieldValue("password")
                    ? Promise.reject("Lozinke se ne podudaraju!")
                    : Promise.resolve(),
              }]}
          >
            <Input.Password />
          </Form.Item>
        </>
      ),
    },
  ];

  const handleStepChange = (newStep: number) => {
    form
      .validateFields()
      .then((values) => {
        setUserData((prevData) => ({ ...prevData, ...values }));
        setCurrentStep(newStep);
      })
      .catch((error) => console.log(error));
  };

  return (
    <Card title="Dodavanje novog korisnika">
      <div className="hidden md:block">
      <Steps current={currentStep} onChange={handleStepChange} >
        {steps.map((item, index) => (
          <Step key={index} title={item.title} />
        ))}
      </Steps></div>
      <Form form={form} layout="vertical" >
        <div style={{ marginTop: "20px" }}>
          {steps[currentStep].content}
        </div>
        <Divider />
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mt-6">
          <Button
            className="w-full md:w-auto"
            type="default"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
          >
            Prethodni
          </Button>
          <Button
            className="w-full md:w-auto"
            type="default"
            onClick={() => form.resetFields()}
            danger
          >
            Resetuj
          </Button>
          <Button
            className="w-full md:w-auto"
            type="primary"
            onClick={() => {
              if (currentStep === steps.length - 1) {
                onFinish();
              } else {
                handleNext();
              }
            }}
            loading={loading.location || loading.department || loading.job}
          >
            {currentStep === steps.length - 1 ? "Završi" : "Sljedeći"}
          </Button>
        </div>

      </Form>
    </Card>
  );
};

export default AddUserPage
