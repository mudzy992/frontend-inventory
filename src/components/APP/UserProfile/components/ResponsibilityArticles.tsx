import React, { useEffect, useState } from "react";
import { Table, Button, Popover, Typography, Spin, Descriptions, Badge } from "antd";
import { SaveOutlined, FileTextOutlined } from "@ant-design/icons";
import { ApiConfig } from "../../../../config/api.config";
import saveAs from "file-saver";
import { useUserContext } from "../../../Contexts/UserContext/UserContext";
import { ApiResponse, useApi } from "../../../../API/api";
import { useNavigate } from "react-router-dom";
import ArticleType from "../../../../types/ArticleType";
import DocumentsType from "../../../../types/DocumentsType";
import { useNotificationContext } from "../../../Contexts/Notification/NotificationContext";
import { comment } from "postcss";

const { Text } = Typography;

interface UserProps {
  userID: number;
}

const ResponsibilityArticles: React.FC<UserProps> = ({ userID }) => {
  const { api } = useApi();
  const [data, setArticles] = useState<ArticleType[]>([]);
  const { role } = useUserContext();
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const {warning} = useNotificationContext();
  const [expandedRowKey, setExpandedRowKey] = useState(null);

  const getArticleData = async () => {
    try {
      setLoading(true);
      const res: ApiResponse = await api(`api/article/user/${userID}`, "get", undefined, role);

      if (res.status === "error" || res.status === "login") {
        return navigate("/login");
      }

      if (res.status === "ok") {
        setArticles(res.data);
      }
    } catch (err:any) {
      warning.notification(err.data.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userID) {
      getArticleData();
    }
  }, [userID]);

  const handleExpand = (expanded:any, record:any) => {
    setExpandedRowKey(expanded ? record.key : null);
  };

  const handleRowClick = (record:any) => {
    setExpandedRowKey((prevKey) => (prevKey === record.key ? null : record.key));
  };

  const columns = [
    {
      title: "Naziv",
      dataIndex: "stockName",
      key: "stockName",
      render: (_: any, record:any) => {
        const hasComment = !!record.comment;
        return(<div>
            {hasComment && (
                    <Badge className="mr-2" status="processing" />)}
                <Text strong>{record.stockName}</Text>
            </div>
        )
      },
    },
    {
      title: "Serijski broj",
      dataIndex: "serialNumber",
      key: "serialNumber",
      render: (serialNumber: string) => (
        <a href={`#/article/${serialNumber}`}>{serialNumber}</a>
      ),
    },
    {
      title: "Inventurni broj",
      dataIndex: "invNumber",
      key: "invNumber",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Kategorija",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Dokument",
      dataIndex: "documents",
      key: "documents",
      render: (documents: DocumentsType[]) => saveFile(documents),
    },
  ];

  if (loading) {
    return <Spin tip="Učitavanje..." />;
  }

  return (
    <Table
      columns={columns}
      dataSource={data.map((article) => ({
        comment: article.comment,
        key: article.articleId,
        stockName: article.stock?.name,
        serialNumber: article.serialNumber,
        invNumber: article.invNumber,
        categoryName: article.category?.name,
        documents: article.documents,
        stock:article.stock,
      }))}
      expandedRowRender={(record) => (
        <div>
          <Text strong>Detalji za {record.stockName}:</Text>
          <Descriptions bordered column={1} style={{ marginTop: 16 }}>
            {record.stock?.stockFeatures?.map((feature) => (
              <Descriptions.Item label={feature.feature?.name} key={feature.stockFeatureId}>
                {feature.value}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </div>
      )}
      expandable={{
        expandedRowKeys: expandedRowKey ? [expandedRowKey] : [],
        onExpand: handleExpand,
      }}
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
      })}
      scroll={{ x: "max-content" }}
    />
  );
};

function saveFile(documents: DocumentsType[]) {
  if (!documents || documents.length === 0) {
    return (
      <Popover content={<Text>Prenosnica nije generisana</Text>} trigger="hover">
        <Button size="small" danger icon={<FileTextOutlined />} />
      </Popover>
    );
  }

  const pdfDocument = documents[0]?.signed_path;
  const docxDocument = documents[0]?.path;
  const handleSave = (docPath: string) => {
    saveAs(ApiConfig.TEMPLATE_PATH + docPath, docPath);
  };

  if (pdfDocument) {
    return (
      <Button
        variant="dashed"
        color="danger"
        icon={<SaveOutlined />}
        onClick={() => handleSave(pdfDocument)}
      />
    );
  } else {
    return (
      <Button
        variant="dashed"
        color="primary"
        icon={<SaveOutlined />}
        onClick={() => handleSave(docxDocument!)}
      />
    );
  }
}

export default ResponsibilityArticles;
