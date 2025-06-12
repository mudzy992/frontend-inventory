import React, { useEffect, useState } from "react";
import { Input, Button, Select, Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../Contexts/UserContext/UserContext";
import { useApi } from "../../../API/api";
import { useNotificationContext } from "../../Contexts/Notification/NotificationContext";

interface InvoiceFormProps {
  invoiceId: number;
}

type Status = "izvršenje" | "plaćeno" | null;

interface FormData {
  issueDate: string;
  customer: string;
  status: Status;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceId }) => {
  const { api } = useApi();
  const { role } = useUserContext();
  const navigate = useNavigate();
  const {error, success} = useNotificationContext();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInvoice = async () => {
    try {
      const response = await api(`/api/invoice/${invoiceId}`, "get", undefined, role);
      if (response.status === "login") {
        return navigate("/");
      }
      const invoice = response.data;
      form.setFieldsValue({
        issueDate: invoice.issueDate,
        customer: invoice.customer,
        status: invoice.status,
      });
    } catch (err:any) {
        error.notification("Greška prilikom učitavanja fakture: " + err.message);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await api(`api/invoice/${invoiceId}`, "patch", values, role);
      if (response.status === "ok") {
        success.notification("Izmjene fakture su uspješno spremljene.");
      } else {
        error.notification("Došlo je do greške prilikom izmjene fakture.");
      }
    } catch (err:any) {
      error.notification("Greška prilikom izmjene fakture.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      className="max-w-md p-4 space-y-6"
    >
      <Form.Item
        label="Datum plaćanja fakture"
        name="issueDate"
        rules={[{ required: true, message: "Unesite datum plaćanja fakture" }]}
      >
        <Input type="date" />
      </Form.Item>

      <Form.Item
        label="Naziv kupca"
        name="customer"
        rules={[{ required: true, message: "Polje naziv kupca ne može biti prazno!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Status"
        name="status"
        rules={[{ required: true, message: "Odaberite važeći status" }]}
      >
        <Select placeholder="Odaberite status">
          <Select.Option value="izvršenje">Izvršenje</Select.Option>
          <Select.Option value="plaćeno">Plaćeno</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Ažuriranje..." : "Izmjeni fakturu"}
        </Button>
      </Form.Item>
    </Form>
    </div>
  );
};

export default InvoiceForm;
