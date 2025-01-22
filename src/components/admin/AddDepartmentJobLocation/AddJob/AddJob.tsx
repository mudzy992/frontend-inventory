import React, { useState } from "react";
import { useApi } from "../../../../API/api";
import { Button, Input, Form, notification } from "antd";
import { useNotificationContext } from "../../../Contexts/Notification/NotificationContext";
import { useUserContext } from "../../../Contexts/UserContext/UserContext";
import JobType from "../../../../types/JobType";

const AddJob: React.FC = () => {
  const { api } = useApi();
  const { role } = useUserContext();
  const [form] = Form.useForm();
  const { success, error, info } = useNotificationContext();

  const [loading, setLoading] = useState<boolean>(false);

  const doAddJob = async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const res = await api("api/job/", "post", values, role);
      if (res.status === "error") throw new Error("Greška prilikom dodavanja radnog mjesta.");
      success.notification("Uspješno dodano radno mjesto");
    } catch (err: any) {
      error.notification(err?.data?.message || "Došlo je do greške.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form
        layout="vertical"
        onFinish={doAddJob}
        form={form}
        onFinishFailed={() =>
          info.notification("Polja sa oznakom * su obavezna")
        }
      >
        <Form.Item
          label="Naziv radnog mjesta"
          name="title"
          rules={[{ required: true, message: "Naziv radnog mjesta je obavezan" }]}
        >
          <Input placeholder="Naziv radnog mjesta"/>
        </Form.Item>

        <Form.Item
          label="Opis"
          name="description"
          rules={[{ required: true, message: "Opis je obavezan" }]}
        >
          <Input.TextArea
            placeholder="Opis"
            rows={4}
          />
        </Form.Item>

        <Form.Item
          label="Šifra radnog mjesta"
          name="jobCode"
          rules={[{ required: true, message: "Šifra radnog mjesta je obavezna" }]}
        >
          <Input placeholder="Šifra radnog mjesta"/>
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
        >
          Dodaj radno mjesto
        </Button>
      </Form>
    </div>
  );
};

export default AddJob;
