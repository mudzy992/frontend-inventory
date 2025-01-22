import React, { useState } from "react";
import { useApi } from "../../../../API/api";
import { Button, Form, Input, Select, Typography } from "antd";
import { useNotificationContext } from "../../../Contexts/Notification/NotificationContext";
const { TextArea } = Input;
const { Option } = Select;
const { Text, Link } = Typography;

interface DepartmentType {
  departmentId: number;
  title: string;
  description: string;
  departmentCode: string;
  parentDepartmentId: number;
}

const AddDepartment: React.FC = () => {
  const { api } = useApi();
  const { warning, error, success, info } = useNotificationContext();
  const [departmentBase, setDepartmentBase] = useState<DepartmentType[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<DepartmentType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectLoading, setSelectLoading] = useState<boolean>(false);
  const [selectedParentDepartmentId, setSelectedParentDepartmentId] = useState<number | undefined>(undefined);
  const [form] = Form.useForm();

  const fetchDepartments = async () => {
    setSelectLoading(true);
    try {
      const res = await api("api/department?sort=title,ASC", "get", {}, "administrator");
      if (res.status === "error") {
        warning.notification("Greška prilikom učitavanja sektora/službi/odjeljenja.");
        return;
      }
      setDepartmentBase(res.data);
      setFilteredDepartments(res.data);
    } catch (err: any) {
      error.notification(err.data.message);
    } finally {
      setSelectLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    if (!value) {
      setFilteredDepartments(departmentBase);
    } else {
      const filtered = departmentBase.filter((dept) =>
        dept.title.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDepartments(filtered);
    }
  };

  const handleDropdownVisibleChange = (open: boolean) => {
    if (open && departmentBase.length === 0) {
      fetchDepartments();
    }
  };

  const handleClear = () => {
    setFilteredDepartments(departmentBase);
  };

  const handleSubmit = async (values: any) => {
    const data = {
      title: values.title,
      departmentCode: values.departmentCode,
      description: values.description,
      parentDepartmentId: values.parentDepartmentId,
    };
    setLoading(true);
    try {
      const res = await api("api/department/", "post", data, "administrator");
      if (res.status === "error") {
        error.notification("Greška prilikom dodavanja sektora, službe ili odjeljenja.");
        return;
      }
      success.notification("Sektor, služba ili odjeljenje uspješno kreirano.");
      setDepartmentBase([]);
      setFilteredDepartments([]);
      form.resetFields();
    } catch (err: any) {
      error.notification(err.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form 
      form={form} 
      layout="vertical" 
      onFinish={handleSubmit}
      onFinishFailed={() =>
        info.notification("Polja sa oznakom * su obavezna")
      }
    >
      <Form.Item
        label="Naziv sektora/službe/odjeljenja"
        name="title"
        rules={[{ required: true, message: "Molimo unesite naziv." }]}
      >
        <Input placeholder="Naziv sektora/službe/odjeljenja" />
      </Form.Item>

      <Form.Item
        label="Opis"
        name="description"
        rules={[{ required: true, message: "Molimo unesite opis." }]}
      >
        <TextArea placeholder="Opis" />
      </Form.Item>

      <Form.Item
        label="Šifra organizacione jedinice"
        name="departmentCode"
        rules={[{ required: true, message: "Molimo unesite šifru." }]}
      >
        <Input type="number" placeholder="Šifra organizacione jedinice" />
      </Form.Item>

      <Form.Item
      className="border-1 p-2 border-dashed rounded-xl border-red-700"
        label="Pripada sektoru/službi"
        name="parentDepartmentId"
        rules={[{ required: false, message: "Molimo odaberite sektorsku jedinicu ako je potrebno." }]}
      >
        <Select
          placeholder="Odaberite glavnu službu/odjeljenje"
          showSearch
          loading={selectLoading}
          onSearch={handleSearch}
          onDropdownVisibleChange={handleDropdownVisibleChange}
          filterOption={false}
          allowClear
          onClear={handleClear}
          onChange={(value: number | undefined) => setSelectedParentDepartmentId(value)}
          value={selectedParentDepartmentId}
        >
          {filteredDepartments.map((department) => (
            <Option
              key={department.departmentId}
              value={department.departmentId}
              label={department.title}
            >
              {`${department.departmentId} - ${department.title}`}
            </Option>
          ))}
        </Select>
        <Text type="secondary">
          Ako služba ili odjeljenje pripadaju nekom sektoru, odaberite odgovarajući sektor u polju "Pripada sektoru/službi".
        </Text>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Dodaj sektor/službu/odjeljenje
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddDepartment;
