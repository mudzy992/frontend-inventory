import { FC, useEffect, useState } from "react";
import Moment from "moment";
import { ApiConfig } from "../../../config/api.config";
import saveAs from "file-saver";
import {
  Button,
  Input,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { useApi } from "../../../API/api";
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNotificationContext } from "../../Contexts/Notification/NotificationContext";
import { useUserContext } from "../../Contexts/UserContext/UserContext";

interface StockTableProps {
  stockId: number;
}

interface ResponsibilityArticleBaseType {
  serialNumber: string;
  invNumber: string;
  status: "zaduženo" | "razduženo" | "otpisano";
  timestamp: string;
  articleId: number;
  user?: {
    userId: number;
    fullname: string;
  };
  documents?: {
    path: string;
  }[];
}

const statusColorMap: Record<string, { color: string }> = {
  zaduženo: { color: "green" },
  razduženo: { color: "orange" },
  otpisano: { color: "red" },
};

const ArticleInStockTable: FC<StockTableProps> = ({ stockId }) => {
  const { api } = useApi();
  const {role} = useUserContext();
  const [userArticleData, setUserArticleData] = useState<ResponsibilityArticleBaseType[]>([]);
  const { error } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(false);
  const [itemsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    stockArticleData();
  }, [stockId, itemsPerPage, currentPage, searchQuery]);

  const stockArticleData = async () => {
    setIsLoading(true);
    try {
      const res = await api(
        `api/article/s/${stockId}?perPage=${itemsPerPage}&page=${currentPage}&query=${searchQuery}`,
        "get",
        {},
        role,
      );
        setUserArticleData(res.data.results);
        setTotalResults(Math.max(0, res.data.total));
    } catch (err: any) {
      error.notification("Greška prilikom učitavanja podataka");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setCurrentPage(1);
      stockArticleData();
    }
  };

  const saveFile = (path: string) => {
    saveAs(ApiConfig.TEMPLATE_PATH + path, path);
  };

  const columns = [
    {
      title: "Ime i prezime",
      dataIndex: ["user", "fullname"],
      key: "fullname",
      render: (text: string, record: ResponsibilityArticleBaseType) => (
        <a href={`#/profile/${record.user?.userId}`}>{text}</a>
      ),
    },
    {
      title: "Serijski broj",
      dataIndex: "serialNumber",
      key: "serialNumber",
      render: (text: string) => (
        <a href={`#/article/${text}`}>{text}</a>
      ),
    },
    {
      title: "Inventurni broj",
      dataIndex: "invNumber",
      key: "invNumber",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => (
        <Tag color={statusColorMap[text].color}>{text}</Tag>
      ),
    },
    {
      title: "Datum akcije",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (text: string) => Moment(text).format("DD.MM.YYYY. - HH:mm"),
    },
    {
      title: "Prenosnica",
      key: "documents",
      render: (text: any, record: ResponsibilityArticleBaseType) => (
        <Tooltip title="Preuzmi prenosnicu">
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            disabled={!record.documents || record.documents.length === 0}
            onClick={() => record.documents && record.documents.length > 0 && saveFile(record.documents[0].path)}
          >
            Prenosnica
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-3">
        <Input
          placeholder="Pronađi artikal..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onPressEnter={handleKeyPress}
          allowClear
        />
      </div>
      <Table
        columns={columns}
        dataSource={userArticleData}
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: itemsPerPage,
          total: totalResults,
          onChange: (page) => setCurrentPage(page),
        }}
        rowKey="serialNumber"
        style={{ overflowX: "auto" }}
      />
    </div>
  );
};

export default ArticleInStockTable;
