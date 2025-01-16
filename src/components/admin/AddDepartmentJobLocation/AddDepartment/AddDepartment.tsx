import React, { useEffect, useState } from "react";
import { useApi } from "../../../../API/api";
import { Button, Form, Input, Modal, Select } from "antd";
import { useNotificationContext } from "../../../Notification/NotificationContext";
const { TextArea } = Input;
const { Option } = Select;

interface DepartmentType {
  departmentId: number;
  title: string;
  description: string;
  departmentCode: string;
  parentDepartmentId: number;
}

const AddDepartment: React.FC = () => {
  const { api } = useApi();
  const { warning, error, success } = useNotificationContext();
  const [departmentBase, setDepartmentBase] = useState<DepartmentType[]>([]);
  const [selectedParentDepartmentId, setSelectedParentDepartmentId] = useState<number | undefined>(undefined);
  const [form] = Form.useForm();

  useEffect(() => {
    getDepartments();
  }, []);

  const getDepartments = async () => {
    try {
      const res = await api("api/department?sort=title,ASC", "get", {}, "administrator");
      if (res.status === "error") {
        warning.notification("Greška prilikom učitavanja sektora/službi/odjeljenja");
        return;
      }
      setDepartmentBase(res.data);
    } catch (err: any) {
      error.notification(err.data.message);
    }
  };

  const handleSubmit = async (values: any) => {
    const data = {
      title: values.title,
      departmentCode: values.departmentCode,
      description: values.description,
      parentDepartmentId: values.parentDepartmentId,
    };
    try {
      const res = await api("api/department/", "post", data, "administrator");
      if (res.status === "error") {
        error.notification('Greška prilikom dodavanja sektora, službe ili odjeljenja.');
        return;
      }
      success.notification('Sektor, služba ili odjeljeno uspješno kreirano.');
      getDepartments();
    } catch (err: any) {
      error.notification(err.data.message);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
        label="Pripada sektoru/službi"
        name="parentDepartmentId"
        rules={[{ required: false, message: "Molimo odaberite sektorsku jedinicu ako je potrebno." }]}
      >
        <Select
          showSearch
          placeholder="Odaberite glavnu službu/odjeljenje"
          optionFilterProp="label"
          filterSort={(optionA, optionB) =>
            (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())
          }
          allowClear
          value={selectedParentDepartmentId} // Prikazuje trenutno selektovani ID
          onChange={(value: number | undefined) => {
            setSelectedParentDepartmentId(value); // Ažurira selektovani sektor
          }}
        >
          {Array.isArray(departmentBase) && departmentBase.map((department) => (
            <Option key={department.departmentId} value={department.departmentId} label={department.title}>
              {`${department.departmentId} - ${department.title}`}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          disabled={!form.isFieldsTouched(true) || form.getFieldsError().filter(({ errors }) => errors.length).length > 0}
        >
          Dodaj sektor/službu/odjeljenje
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddDepartment;
