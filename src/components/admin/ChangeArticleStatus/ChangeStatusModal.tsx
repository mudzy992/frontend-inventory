import { useEffect, useState } from "react";
import { Modal, Form, Select, Input, Button } from "antd";
import { useApi } from "../../../API/api";
import UserType from "../../../types/UserType";
import ArticleType from "../../../types/ArticleType";
import { useWatch } from "antd/es/form/Form";

interface StatusChangeModalProps {
    type: "article" | "stock";
    data: ArticleType;
    stockId?: number;
    visible: boolean;
    onClose: () => void;
    refreshData: () => void;
  }

const StatusChangeModal:React.FC<StatusChangeModalProps> = ({ type, data, stockId, visible, onClose, refreshData }) => {
  const { api } = useApi();
  const [form] = Form.useForm();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api("/api/user/?sort=forname,ASC", "get", {}, "administrator");
        if (res.status !== "login") {
          setUsers(res.data);
        }
      } catch (err) {
        console.error("Greška prilikom dohvaćanja korisnika:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (values:any) => {
    setLoading(true);
    const payload = {
      userId: values.userId,
      comment: values.comment,
      status: values.status,
      invNumber: type === "article" ? data.invNumber : values.invNumber,
      serialNumber: type === "article" ? data.serialNumber : values.serialNumber,
    };

    const endpoint = type === "article" ? `api/article/status/${data.articleId}` : `api/article/${stockId}`;
    const method = type === "article" ? "patch" : "post";

    try {
      const res = await api(endpoint, method, payload, "administrator");
      if (res.status !== "login") {
        onClose();
        refreshData();
      }
    } catch (err) {
      console.error("Greška prilikom izmjene statusa:", err);
    }
    setLoading(false);
  };

  const statusValue = useWatch("status", form);

  return (
    <Modal title="Promjena statusa" open={visible} onCancel={onClose} footer={null}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} 
      initialValues={{
        status: "",
        comment: "",
        invNumber: type === "article" ? data?.invNumber : "",
        serialNumber: type === "article" ? data?.serialNumber : ""
    }}
      >
        <Form.Item name="status" label="Status" rules={[{ required: true, message: "Odaberite status" }]}>
          <Select options={[
            {value:"razduženo", key:"razduženo", label:"Razduženo"},
            {value:"zaduženo", key:"zaduženo", label:"Zaduženo"},
            {value:"otpisano", key:"orpisano", label:"Otpisano"},
          ]}/>
        </Form.Item>

        <Form.Item name="userId" label="Korisnik" 
        rules={[
          {
            required: statusValue && statusValue !== "otpisano" && statusValue !== "razduženo",
            message: "Odaberite korisnika",
          },
        ]}
        >
            <Select
            showSearch
            disabled={!statusValue || statusValue === "otpisano" || statusValue === "razduženo"}
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            options={users.map((user) => ({
                value: user.userId,
                key: user.userId,
                label: user.fullname,
            }))}
            />
        </Form.Item>
        <Form.Item name="serialNumber" label="Serijski broj" rules={[{ required: true }]}> 
            <Input disabled={type === 'article'}/>
        </Form.Item>
        <Form.Item name="invNumber" label="Inventurni broj" rules={[{ required: true }]}> 
            <Input disabled={type === 'article'}/>
        </Form.Item>

        <Form.Item name="comment" label="Opis">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Sačuvaj promjene
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StatusChangeModal;
