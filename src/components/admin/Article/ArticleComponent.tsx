import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Row, Col, Tag, Tabs, Button, Divider, Collapse, Descriptions, Table, Alert } from 'antd';
import { ApiResponse, useApi } from '../../../API/api';
import { useUserContext } from '../../Contexts/UserContext/UserContext';
import { useNotificationContext } from '../../Contexts/Notification/NotificationContext';
import ArticleType from '../../../types/ArticleType';
import { EyeOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ApiConfig } from '../../../config/api.config';
import saveAs from 'file-saver';
import ViewSingleTicketModal from '../HelpDesk/view/ViewSingleTicket';
import StatusChangeModal from '../ChangeArticleStatus/ChangeStatusModal';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const ArticleComponent: React.FC = () => {
  const { api } = useApi();
  const { role } = useUserContext();
  const { serialnumber } = useParams<{ serialnumber: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const { warning, error, success } = useNotificationContext();
  const [article, setArticle] = useState<ArticleType>();
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [changeStatusModalVisible, setChangeStatusModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleType | null>(null);

  useEffect(() => {
    if (serialnumber) {
      getArticleData();
    }
  }, [serialnumber]);

  const getArticleData = async () => {
    try {
      setLoading(true);
      const res: ApiResponse = await api(`api/article/sb/${serialnumber}`, 'get', {}, role);
      if (res.status === 'error') {
        warning.notification(res.data.message);
        return;
      }
      setArticle(res.data);
    } catch (err: any) {
      error.notification(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleShowViewModal = () => {
    setShowViewModal(true);
  };

  const handleHideViewModal = () => {
    setShowViewModal(false);
  };

  const openViewModalWithArticle = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    handleShowViewModal();
  };

  const handleOpenChangeStatusModal = (article: ArticleType) => {
    setSelectedArticle(article);
    setChangeStatusModalVisible(true);
  };

  const handleCloseChangeStatusModal = () => {
    setChangeStatusModalVisible(false);
    setSelectedArticle(null);
  };

  const refreshDataAfterChangeStatus = () => {
    getArticleData()
  };

  if (!serialnumber) {
    return <div>Serijski broj nije naveden</div>;
  }

  const statusColors: Record<string, Record<string, string>> = {
    article: {
      zaduženo: '#87d068',
      razduženo: '#2db7f5',
      otpisano: '#f50',
    },
    helpdesk: {
      zatvoren: 'green',
      izvršenje: 'gold',
      otvoren: 'volcano',
    },
  };
  
  const getStatusColor = (status: string, type: 'article' | 'helpdesk') => 
    statusColors[type]?.[status] || 'default';
  
  const handleDownload = (filePath: string, fileName: string) => {
    fetch(`${ApiConfig.TEMPLATE_PATH}/${filePath}`)
      .then(response => response.blob())
      .then(blob => saveAs(blob, fileName))
      .catch(error => console.error("Greška pri preuzimanju fajla:", error));
  };
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card loading={loading}>
          <Row justify="space-between" align="middle" className='mb-4'>
            <Col>
              <Text>
              <i
                className={`${article?.category?.imagePath} mr-2 text-lg`}
              ></i>
                <span className='font-bold text-lg'>{article?.stock?.name}</span>
              </Text>
            </Col>
            <Col>
              <Tag color={getStatusColor(article?.status!, 'article')}>
                {article?.status}
              </Tag>
            </Col>
          </Row>
          <Row gutter={[16, 16]} justify="space-between">
            <Col xs={24} md={7} className='justify-center items-center flex'>
            <i
                className={`${article?.category?.imagePath}`}
                style={{ fontSize: 150 }}
              ></i>
            </Col>
            <Col xs={24} md={16} className='flex flex-col'>
            <Collapse defaultActiveKey={['1']}>
              <Panel header="Tehničke karakteristike" extra={<i className="bi bi-cpu text-primary text-lg" />} key="1" >
                <Descriptions column={1} className="max-h-[200px] overflow-y-auto overflow-hidden">
                  {article?.stock?.stockFeatures!.map((feature, index) => (
                    <Descriptions.Item key={index} label={feature.feature?.name}>
                      {feature.value}
                    </Descriptions.Item>
                  ))}
                  <Descriptions.Item label="Serijski broj">
                    {article?.serialNumber}
                  </Descriptions.Item>
                  <Descriptions.Item label="Inventorni broj">
                    {article?.invNumber}
                  </Descriptions.Item>
                </Descriptions>
              </Panel>
              <Panel header={"Dodatne specifikacije"} extra={<i className="bi bi-gear text-warning text-lg" />} key="2">
                <Text>{article?.stock?.description}</Text>
              </Panel>

              <Panel header="Nadogradnje" extra={<i className="bi bi-wrench-adjustable-circle text-success text-lg" />} key="3">
                <Text>Nema nadogradnji trenutno.</Text>
              </Panel>
            </Collapse>
            </Col>
          </Row>
          <Divider />

          <Title level={5}>Opis</Title>
          <Text>{article?.stock?.description}</Text>

          <Divider />
          <Tabs defaultActiveKey="1" style={{ marginTop: 20 }}>
          <TabPane tab="Article Timelines" key="1">
            <Table
              dataSource={article?.articleTimelines}
              rowKey="id"
              scroll={{ x: "max-content" }}
              size='small'
              pagination={{
                pageSize: 5,
              }}
              columns={[
                {
                  title: 'Korisnik',
                  key: 'korisnik',
                  render: (text, record) => (
                    record.user?.fullname
                  ),
                  width:200
                },
                {
                  title: 'Komentar',
                  dataIndex: 'comment',
                  key: 'comment',
                  ellipsis: true
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (record) => (
                    <Tag color={getStatusColor(record, 'article')}>
                      {article?.status}
                    </Tag>
                    ),
                  width:80
                },
                {
                  title: 'Datum akcije',
                  dataIndex: 'timestamp',
                  key: 'timestamp',
                  width:130,
                  render: (text: string) => dayjs(text).format('DD.MM.YYYY - HH:mm')
                },
                {
                  title: 'Dokument',
                  key: 'document',
                  width:80,
                  render: (text, record) => (
                    <Button size='large' icon={<SaveOutlined className='text-primary' />} type="text"
                    onClick={() => handleDownload(record.document?.path!, record.document?.path || 'dokument.pdf')} />
                  ),
                },
              ]}
            />
          </TabPane>
          <TabPane tab="Helpdesk" key="2">
          <Table
            dataSource={article?.helpdeskTickets}
            rowKey="ticketId"
            pagination={{
              pageSize: 5,
            }}
            size="small"
            columns={[
              {
                title: 'Opis',
                dataIndex: 'description',
                key: 'description',
                ellipsis: true, 
              },
              {
                title: 'Datum prijave',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (text: string) => dayjs(text).format('DD.MM.YYYY - HH:mm'),
                width: 130,
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (record) => (
                  <Tag color={getStatusColor(record, 'helpdesk')}>
                    {record}
                  </Tag>
                  ),
                width: 70,
              },
              {
                title: '#',
                dataIndex: 'ticketId',
                key: 'ticketId',
                render: (text) => <Button icon={<EyeOutlined />} type="text"
                onClick={() => openViewModalWithArticle(text)}
                />,
                width: 55,
              },
            ]}
          />
          <ViewSingleTicketModal
              show={showViewModal}
              onHide={handleHideViewModal}
              ticketId={selectedTicketId!}
              data={article?.helpdeskTickets!}
            />
          </TabPane>
          </Tabs>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
      {article?.status === "razduženo" && (
        <Alert message="Detalji o korisniku nedostupni, oprema razdužena." showIcon type="warning" />
      )}

      {article?.status === "otpisano" && (
        <Alert message="Detalji o korisniku nedostupni, oprema otpisana." showIcon type="error" />
      )}

      {article?.status === "zaduženo" && (
        <Card title="Detalji korisnika">
          <Text><span className="font-bold">Korisnik: </span>{article?.user?.fullname}</Text><br />
          <Text><span className="font-bold">Email: </span>{article?.user?.email}</Text><br />
          <Text><span className="font-bold">Organizacija: </span>{article?.user?.organization?.name}</Text><br />
          <Text><span className="font-bold">Sektor/služba/odjeljenje: </span>{article?.user?.department?.title}</Text><br />
          <Text><span className="font-bold">Radno mjesto: </span>{article?.user?.job?.title}</Text><br />
        </Card>
      )}
        <Card style={{ marginTop: 20 }}>
          <Row justify="space-between" align="middle" className='border-b-2 pb-2'>
              <Col>
                <Text className='font-bold text-md'>Status</Text>
              </Col>
              <Col>
              <Button size='middle' onClick={() => handleOpenChangeStatusModal(article!)}>
                Promjeni status
              </Button>
              </Col>
            </Row>
          <Text><span className='font-bold'>Status: </span>{article?.status}</Text><br />
          <Text><span className='font-bold'>Datum posljednje izmjene: </span>{dayjs(article?.timestamp).format('DD.MM.YYYY - HH:mm')}</Text>
        </Card>

        <StatusChangeModal 
          data={selectedArticle!}
          type='article'
          visible={changeStatusModalVisible}
          onClose={handleCloseChangeStatusModal}
          refreshData={refreshDataAfterChangeStatus}
        />

        <Card title="Skladište" style={{ marginTop: 20 }}>
          <Text><span className='font-bold'>Stanje po ugovoru: </span>{article?.stock?.valueOnContract}</Text><br />
          <Text><span className='font-bold'>Trenutno stanje: </span>{article?.stock?.valueAvailable}</Text><br />
          <Text><span className='font-bold'>Ugovor: </span>{article?.stock?.contract}</Text><br />
          <Text><span className='font-bold'>Datum posljednje izmjene: </span>{dayjs(article?.stock?.timestamp).format('DD.MM.YYYY - HH:mm')}</Text>
        </Card>
      </Col>
    </Row>
  );
};

export default ArticleComponent;
