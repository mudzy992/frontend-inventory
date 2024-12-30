import React, { useEffect, useState } from "react";
import { Input, Button, Select, Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../UserContext/UserContext";
import { useApi } from "../../../API/api";

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
  const [messageApi, contextHolder] = message.useMessage();
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
    } catch (error) {
      console.error("Error loading invoice:", error);
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
        messageApi.success("Faktura je uspješno ažurirana!");
      } else {
        messageApi.error("Došlo je do greške prilikom ažuriranja fakture.");
      }
    } catch (error) {
      messageApi.error("Greška prilikom ažuriranja fakture.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {contextHolder}
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      className="max-w-md p-4 space-y-6"
    >
      <Form.Item
        label="Datum izdavanja"
        name="issueDate"
        rules={[{ required: true, message: "Unesite datum izdavanja" }]}
      >
        <Input type="date" />
      </Form.Item>

      <Form.Item
        label="Kupac"
        name="customer"
        rules={[{ required: true, message: "Unesite naziv kupca" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Status"
        name="status"
        rules={[{ required: true, message: "Odaberite status" }]}
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
          {isSubmitting ? "Ažuriranje..." : "Ažuriraj fakturu"}
        </Button>
      </Form.Item>
    </Form>
    </div>
  );
};

export default InvoiceForm;
