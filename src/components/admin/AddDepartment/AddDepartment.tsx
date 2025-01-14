import React, { useEffect, useState } from "react";
import { useApi } from "../../../API/api";
import { Button, Form, Input, Modal, Select } from "antd";
import { useNotificationContext } from "../../Notification/NotificationContext";
const { TextArea } = Input;
const { Option } = Select;

interface DepartmentType {
  departmentId: number;
  title: string;
  description: string;
  departmentCode: string;
  parentDepartmentId?: number;
}

const AddDepartment: React.FC = () => {
  const { api } = useApi();
  const {warning, error, success} = useNotificationContext();
  const [departmentBase, setDepartmentBase] = useState<DepartmentType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(true);

  useEffect(() => {
    getDepartments();
  }, []);

  const getDepartments = async () => {
    setLoading(true);
    try {
      const res = await api("api/department?sort=title,ASC", "get", {}, "administrator");
      if (res.status === "error") {
        warning.notification('Greška prilikom učitavanja sektora/službi/odjeljenja');
        return;
      }
      setDepartmentBase(res.data);
    } catch (err:any) {
      error.notification(err.data.message)
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const res = await api("api/department/", "post", values, "administrator");
      if (res.status === "error") {
        error.notification('Greška prilikom dodavanja sektora, službe ili odjeljenja.');
        return;
      }
      success.notification('Sektor, služba ili odjeljeno uspješno kreirano.');
      getDepartments();
      setModalVisible(false);
    } catch (err:any) {
      error.notification(err.data.message);
    }
  };

  return (
        <Form layout="vertical" onFinish={handleSubmit}>
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

          <Form.Item label="Pripada sektoru/službi" name="parentDepartmentId">
            <Select
              placeholder="Odaberite glavnu službu/odjeljenje"
              allowClear
            >
              {departmentBase.map((department) => (
                <Option key={department.departmentId} value={department.departmentId}>
                  {`${department.departmentId} - ${department.title}`}
                </Option>
              ))}
            </Select>
            <p className="text-xs mt-2 pl-4">U slučaju da se kreira sektor nije potrebno popuniti polje ispod. Polje se popunjava
                                isključivo ako se dodaje služba/odjeljenje koje pripada nekom sektoru/službi.</p>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Dodaj
            </Button>
          </Form.Item>
        </Form>
  );
};

export default AddDepartment;
