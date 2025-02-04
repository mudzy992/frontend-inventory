import React, { useState, useEffect } from "react";
import { Form, Modal, Table, Input, Button } from "antd";
import { ApiResponse, useApi } from "../../../../API/api";
import { useUserContext } from "../../../Contexts/UserContext/UserContext";
import { useNotificationContext } from "../../../Contexts/Notification/NotificationContext";
import UpgradeFeaturesType from "../../../../types/UpgradeFeaturesType";
import { DeleteOutlined } from "@ant-design/icons";

interface UpgradeFeaturesModalProps {
  articleId: number;
  data: UpgradeFeaturesType[];
  serial: string;
  visible: boolean;
  onClose: () => void;
  refreshData: () => void;
}

const UpgradeFeaturesModal: React.FC<UpgradeFeaturesModalProps> = ({
  articleId,
  data,
  serial,
  visible,
  onClose,
  refreshData,
}) => {
  const [form] = Form.useForm();
  const { api } = useApi();
  const [tempFeatures, setTempFeatures] = useState<UpgradeFeaturesType[]>(data); 
  const { role } = useUserContext();
  const { error, warning, success } = useNotificationContext();
  
  useEffect(() => {
    setTempFeatures(data);
  }, [data]);

  // API za dodavanje nove nadogradnje
  const addUpgradeFeature = async (values: any) => {
    try {
      const res = await api(
        `api/upgradeFeature/add/${serial}`,
        "post",
        {
          name: values.name,
          value: values.value,
          comment: values.comment,
          articleId,
        },
        role
      );
      if (res.status === "ok") {
        success.notification("Nadogradnja je uspešno dodata");
        refreshData(); // Osvježava podatke
        onClose(); // Zatvori modal
      } else {
        error.notification("Došlo je do greške pri dodavanju nadogradnje");
      }
    } catch (err: any) {
      error.notification("Greška prilikom dodavanja nadogradnje");
    }
  };

  // API za brisanje nadogradnje
  const deleteUpgradeFeature = async (upgradeFeatureId: number) => {
    try {
      const res = await api(
        `api/upgradeFeature/delete/${upgradeFeatureId}`,
        "delete",
        {},
        role
      );
      if (res.status === "ok") {
        success.notification("Nadogradnja je uspešno obrisana");
        refreshData(); // Osvježava podatke
      } else {
        error.notification("Došlo je do greške pri brisanju nadogradnje");
      }
    } catch (err: any) {
      error.notification("Greška prilikom brisanja nadogradnje");
    }
  };

  // Definiši kolone za tabelu
  const columns = [
    {
      title: "Naziv",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Vrednost",
      dataIndex: "value",
      key: "value",
    },
    {
      title: "Komentar",
      dataIndex: "comment",
      key: "comment",
    },
    {
      title: "Akcija",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          icon={<DeleteOutlined />}
          onClick={() => deleteUpgradeFeature(record.upgradeFeatureId)}
          danger
        >
          Obriši
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title="Dodatne specifikacije"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {/* Tabela sa postojećim nadogradnjama */}
      <Table
        columns={columns}
        dataSource={tempFeatures}
        rowKey="upgradeFeatureId"
        scroll={{ x: "max-content" }}
        pagination={false}
        locale={{
          emptyText: "Nema definisanih dodatnih specifikacija",
        }}
      />
      
      {/* Forma za dodavanje nove nadogradnje */}
      <Form
        form={form}
        layout="vertical"
        onFinish={addUpgradeFeature}
        style={{ marginTop: 20 }}
      >
        <Form.Item
          label="Naziv"
          name="name"
          rules={[{ required: true, message: "Naziv je obavezan" }]}
        >
          <Input placeholder="Unesite naziv nadogradnje" />
        </Form.Item>
        <Form.Item
          label="Vrednost"
          name="value"
          rules={[{ required: true, message: "Vrednost je obavezna" }]}
        >
          <Input placeholder="Unesite vrednost" />
        </Form.Item>
        <Form.Item
          label="Komentar"
          name="comment"
        >
          <Input.TextArea placeholder="Unesite komentar" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Dodaj nadogradnju
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpgradeFeaturesModal;
