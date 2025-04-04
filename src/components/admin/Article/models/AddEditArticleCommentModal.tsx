import React, { useState, useEffect } from "react";
import { Form, Modal, Table, Input, Button } from "antd";
import { ApiResponse, useApi } from "../../../../API/api";
import { useUserContext } from "../../../Contexts/UserContext/UserContext";
import { useNotificationContext } from "../../../Contexts/Notification/NotificationContext";
import UpgradeFeaturesType from "../../../../types/UpgradeFeaturesType";
import { DeleteOutlined } from "@ant-design/icons";

interface AddEditArticleCommentModalProps {
  articleId: number;
  comment: string;
  visible: boolean;
  onClose: () => void;
  refreshData: () => void;
}

const AddEditArticleCommentModal: React.FC<AddEditArticleCommentModalProps> = ({
  articleId,
  comment,
  visible,
  onClose,
  refreshData,
}) => {
  const [form] = Form.useForm();
  const { api } = useApi();
  const { role } = useUserContext();
  const { error, warning, success } = useNotificationContext();

  // API za dodavanje nove nadogradnje
  const addComment = async (values: any) => {
    console.log(values.comment)
    try {
      const res = await api(
        `api/article/edit/comment/${articleId}`,
        "patch",
        {
          comment: values.comment,
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

  return (
    <Modal
      title="Dodaj komentar"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      closable
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={addComment}
        style={{ marginTop: 20 }}
      >
        <Form.Item
          label="Komentar"
          name="comment"
        >
            {comment} {articleId}
          <Input.TextArea placeholder="Unesite komentar" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Dodaj komentar
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditArticleCommentModal;
