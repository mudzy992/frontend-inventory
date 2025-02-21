import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import moment from "moment";
import { Button, Card, Col, Row, Input, Table, Pagination, Tooltip, Tag, Space, Typography, Popover } from "antd";
import { SearchOutlined, FileExcelOutlined, LinkOutlined } from "@ant-design/icons";
import { useApi } from "../../../../API/api";
import ArticleType from "../../../../types/ArticleType";
import { useNotificationContext } from "../../../Contexts/Notification/NotificationContext";

interface CategoryCount {
  [key: string]: number;
}

interface OrganizationCount {
  [key: string]: number;
}

const { Title, Text } = Typography;

const ArticlePage: React.FC = () => {
  const { api } = useApi();
  const {warning, error} = useNotificationContext();
  const [loading, setLoading] = useState<boolean>(false)
  const [totalArticles, setTotalArticles] = useState(0);
  const [categoryCount, setCategoryCount] = useState<CategoryCount>({});
  const [organizationCount, setOrganizationCount] = useState<OrganizationCount>({});
  const [paginedArticleData, setPaginedArticle] = useState<any[]>([]);
  const [articleCurrentPage, setArticleCurrentPage] = useState<number>(1);
  const [articleItemsPerPage] = useState<number>(10);
  const [articleTotalPage, setArticleTotalPage] = useState<number>(0);
  const [articlePaginationTableQuery, setArticlePaginationTableQuery] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllArticles();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const apiUrl = `/api/admin/dashboard/articles/s?perPage=${articleItemsPerPage}&page=${articleCurrentPage}&query=${encodeURIComponent(articlePaginationTableQuery)}`;
        const paginatedArticleResponse = await api(apiUrl, "get", {}, "administrator");

        if (paginatedArticleResponse.status === "error") {
          warning.notification('Greška prilikom dohvaćanja posljednjeg artika na skladištu')
          return;
        }

        setPaginedArticle(paginatedArticleResponse.data.results);
        const totalCount: number = paginatedArticleResponse.data.total;
        const totalPages: number = Math.ceil(totalCount / articleItemsPerPage);
        setArticleTotalPage(totalPages);
      } catch (err:any) {
        error.notification(err.data.message)
      } finally {
        setLoading(false)
      }
    };

    fetchData();
  }, [articleCurrentPage, articleItemsPerPage, articlePaginationTableQuery]);

  const fetchAllArticles = async () => {
    try {
      setLoading(true)
      const apiUrl = `/api/admin/dashboard/articles`;
      const response = await api(apiUrl, "get", {}, "administrator");

      if (response.status === "error") {
        warning.notification('Greška prilikom dohvaćanja artikala.')
        return [];
      }

      const totalArticles = response.data.length;

      const categoryCount: CategoryCount = {};
      const organizationCount: OrganizationCount = {};

      response.data.forEach((article: any) => {
        const category = article.category.name;
        if (categoryCount[category]) {
          categoryCount[category]++;
        } else {
          categoryCount[category] = 1;
        }

        const organization = article.user.organization.name;
        if (organizationCount[organization]) {
          organizationCount[organization]++;
        } else {
          organizationCount[organization] = 1;
        }
      });

      setTotalArticles(totalArticles);
      setCategoryCount(categoryCount);
      setOrganizationCount(organizationCount);

      return response.data || [];
    } catch (err:any) {
      error.notification(err.data.message)
      return [];
    } finally{
      setLoading(false)
    }
  };

  const handleSearchChange = (query: string) => {
    setArticleCurrentPage(1);
    setArticlePaginationTableQuery(query);
  };

  const exportToExcel = async () => {
    const allArticles = await fetchAllArticles();
    const dataToExport = allArticles.map((article: any) => ({
      ID: article.articleId,
      Naziv: article.stock?.name || "",
      Serijski_broj: article.serialNumber || "",
      Inventurni_broj: article.invNumber || "",
      Korisnik: article.user?.fullname || "",
      Kategorija: article.category?.name || "",
      Organizacija: article.user.organization.name || "",
      Status: article.status || "",
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    const headerRow = worksheet.addRow(Object.keys(dataToExport[0] || {}));
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
    });

    dataToExport.forEach((data: any) => {
      worksheet.addRow(Object.values(data));
    });

    const excelBuffer = await workbook.xlsx.writeBuffer();
    const currentDate = moment();
    const formattedDate = currentDate.format("DD.MM.YYYY");
    saveAs(new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" }), `Oprema-${formattedDate}.xlsx`);
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card title="Broj artikala po kategorijama" className="flex flex-col h-full">
            {Object.keys(categoryCount).map((category) => (
              <p key={category}>
                {category}: <strong>{categoryCount[category]}</strong>
              </p>
            ))}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="Broj artikala po organizacijama" className="flex flex-col h-full">
            {Object.keys(organizationCount).map((organization) => (
              <p key={organization}>
                {organization}: <strong>{organizationCount[organization]}</strong>
              </p>
            ))}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="flex flex-col h-full justify-center">
            <div style={{ textAlign: "center" }}>
              <Title level={3}>Ukupan broj opreme</Title>
              <Text type="secondary">u svim kategorijama</Text>
              <Title level={2}>{totalArticles}</Title>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="flex flex-col h-full justify-center">
            <Button type="primary" block onClick={() => navigate("add")}>
              Dodaj novi artikal
            </Button>
          </Card>
        </Col>
      </Row>

      <Card title="Svi artikli" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={24} className="flex flex-row gap-3 flex-nowrap">
            <Input
              placeholder="Pronađi artikal..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
            <Popover
              content="Exportuj u Excel"
              trigger="hover"
              placement="top"
            >
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={exportToExcel}
                className="flex items-center"
              >
                <span className="hidden sm:inline">Export to Excel</span>
              </Button>
            </Popover>
          </Col>
        </Row>

        <div style={{ overflowX: 'auto' }}>
          <Table
            dataSource={paginedArticleData}
            rowKey="articleId"
            pagination={false}
            loading={loading}
            columns={[
              { title: "Naziv", key: "name", render: (record: ArticleType) => record.stock?.name },
              { title: "Serijski broj", dataIndex: "serialNumber", key: "serialNumber",
                render: (serialNumber: string) => (
                <a href={`#/article/${serialNumber}`} ><LinkOutlined /> {serialNumber}</a>
              ), },
              { title: "Inventurni broj", dataIndex: "invNumber", key: "invNumber" },
              { title: "Nadogradnja", dataIndex: "upgradeFeatures", key: "upgradeFeatures", render: (features) => (
                <Space size="small">
                  {features?.map((upgrade: any, index: number) => (
                    <Tooltip key={index} title={upgrade.comment}>
                      <Tag color="green">{upgrade.name}</Tag>
                    </Tooltip>
                  ))}
                </Space>
              )},
              { title: "Kategorija", key: "category", render: (record: ArticleType) => record.category?.name },
              { title: "Korisnik", key: "user", render: (record: ArticleType) => (
                <a href={`#/profile/${record.user?.userId}`}><LinkOutlined /> {record.user?.fullname}</a>
              )},
              { title: "Organizacija", key: "organization", render: (record: ArticleType) => record.user?.organization?.name },
              { title: "Status", dataIndex: "status", key: "status" },
            ]}
          />
        </div>

        <Pagination
          current={articleCurrentPage}
          total={articleTotalPage}
          pageSize={articleItemsPerPage}
          onChange={(page) => setArticleCurrentPage(page)}
          style={{ marginTop: 16, textAlign: "center" }}
        />
      </Card>
    </div>
  );
};

export default ArticlePage;
