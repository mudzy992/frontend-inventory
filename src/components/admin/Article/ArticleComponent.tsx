import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Row, Col, Tag, Tabs, Button, Divider, Collapse, Descriptions, Table, Alert } from 'antd';
import { ApiResponse, useApi } from '../../../API/api';
import { useUserContext } from '../../Contexts/UserContext/UserContext';
import { useNotificationContext } from '../../Contexts/Notification/NotificationContext';
import ArticleType from '../../../types/ArticleType';
import { EyeOutlined, SaveOutlined, UserOutlined, MailOutlined, BuildOutlined, AppstoreAddOutlined,
  IdcardOutlined, InfoCircleOutlined, CalendarOutlined, FileTextOutlined, ContainerOutlined, FileSearchOutlined, HistoryOutlined, BellOutlined  } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ApiConfig } from '../../../config/api.config';
import saveAs from 'file-saver';
import ViewSingleTicketModal from '../HelpDesk/view/ViewSingleTicket';
import StatusChangeModal from './models/ChangeStatusModal';
import UpgradeFeaturesType from '../../../types/UpgradeFeaturesType';
import { useCanEdit } from '../../../config/permissions';
import TechnicalSpecifications from './models/TechnicalSpecifications';
import AdditionalSpecifications from './models/AdditionalSpecifications';
import AdditionSettingsModal from './models/AdditionalSpecificationModal';
import UpgradeFeaturesModal from './models/UpgradeFeaturesModal';
import UpgradeFeatures from './models/UpgradeFeatures';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const ArticleComponent: React.FC = () => {
  const { api } = useApi();
  const { role } = useUserContext();
  const canEdit = useCanEdit();
  const { serial } = useParams<{ serial: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const { warning, error } = useNotificationContext();
  const [article, setArticle] = useState<ArticleType>();
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [changeStatusModalVisible, setChangeStatusModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleType | null>(null);
  const [additionalSettingModalVisible, setAdditionModalVisible] = useState(false);
  const [upgradeFeatures, setUpgradeFeatures] = useState<UpgradeFeaturesType[]>([])
  const [upgradeFeaturesModalVisible, setUpgradeFeaturesModalVisible] = useState(false);
  const [activeKey, setActiveKey] = useState<string | string[]>('1');

  useEffect(() => {
    if (serial) {
      getArticleData();
      getUpgradeFeature()
    }
  }, [serial]);

  const getArticleData = useCallback(async () => {
    try {
      setLoading(true);
      const res: ApiResponse = await api(`api/article/sb/${serial}`, 'get', {}, role);
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
  }, [api, role, serial, warning, error]);

  const getUpgradeFeature = useCallback(async () => {
    try {
      const res: ApiResponse = await api(`api/upgradeFeature/get/${serial}`, "get", {}, role);
      setUpgradeFeatures(res.data);
    } catch (err) {
      error.notification("Greška prilikom dohvaćanja dodataka (ArticleComponent).");
    }
  }, [api, role, serial, error]);

  const handleShowViewModal = () => setShowViewModal(true);
  const handleHideViewModal = () => setShowViewModal(false);
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

  const handleOpenAdditionalSettingModal = (article: ArticleType) => {
    setSelectedArticle(article);
    setAdditionModalVisible(true);
  };
  const handleCloseAdditionalSettingModal = () => {
    setAdditionModalVisible(false);
    setSelectedArticle(null);
  };

  const refreshDataAfterChange = () => getArticleData();

  if (!serial) {
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

  const genExtraIcon = (iconClass: string, onClick?: () => void) => (
    <i
      className={iconClass}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
    />
  );

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card loading={loading} >
          <Row justify="space-between" align="middle" className='mb-4'>
            <Col>
              <Text>
                <i className={`${article?.category?.imagePath} mr-2 text-lg`}></i>
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
              <i className={`${article?.category?.imagePath}`} style={{ fontSize: 150 }}></i>
            </Col>
            <Col xs={24} md={16} className='flex flex-col'>
              <Collapse accordion activeKey={activeKey} onChange={(key) => setActiveKey(key)}>
                <Panel header="Tehničke karakteristike" extra={genExtraIcon("bi bi-cpu text-primary text-lg")} key="1">
                  <TechnicalSpecifications article={article} />
                </Panel>
                <Panel header="Dodatne specifikacije" extra={genExtraIcon("bi bi-gear text-warning text-lg", canEdit ? () => handleOpenAdditionalSettingModal(article!) : undefined)} key="2">
                  <AdditionalSpecifications article={article!} />
                  {additionalSettingModalVisible && (
                    <AdditionSettingsModal
                      visible={additionalSettingModalVisible}
                      onClose={handleCloseAdditionalSettingModal}
                      data={selectedArticle!}
                      refreshData={refreshDataAfterChange}
                    />
                  )}
                </Panel>
                <Panel header="Nadogradnje" extra={genExtraIcon("bi bi-wrench-adjustable-circle text-success text-lg", canEdit ? () => setUpgradeFeaturesModalVisible(true) : undefined)} key="3">
                  <UpgradeFeatures upgradeFeatures={upgradeFeatures} />
                  {upgradeFeaturesModalVisible && (
                    <UpgradeFeaturesModal
                      serial={serial}
                      articleId={article?.articleId!}
                      visible={upgradeFeaturesModalVisible}
                      onClose={() => setUpgradeFeaturesModalVisible(false)}
                      data={upgradeFeatures!}
                      refreshData={refreshDataAfterChange}
                    />
                  )}
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Divider />
          <Title level={5}><FileTextOutlined /> Opis</Title>
          <Text>{article?.stock?.description}</Text>
          <Divider />
          <Tabs defaultActiveKey="1" style={{ marginTop: 20 }}>
            <TabPane tab={<><HistoryOutlined /> Kretanje opreme</>} key="1">
              <Table
                dataSource={article?.articleTimelines}
                rowKey="id"
                scroll={{ x: "max-content" }}
                size='small'
                pagination={{ pageSize: 5 }}
                columns={[
                  {
                    title: 'Korisnik',
                    key: 'korisnik',
                    render: (text, record) => record.user?.fullname,
                    width: 200
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
                        {record}
                      </Tag>
                    ),
                    width: 80
                  },
                  {
                    title: 'Datum akcije',
                    dataIndex: 'timestamp',
                    key: 'timestamp',
                    width: 130,
                    render: (text: string) => dayjs(text).format('DD.MM.YYYY - HH:mm')
                  },
                  {
                    title: 'Dokument',
                    key: 'document',
                    width: 80,
                    render: (text, record) => (
                      <div className='flex items-center justify-center'>
                        <Button size='large' icon={<SaveOutlined className='text-primary' />} type="text"
                          onClick={() => handleDownload(record.document?.path!, record.document?.path || 'dokument.pdf')} />
                      </div>
                    ),
                  },
                ]}
              />
            </TabPane>
            <TabPane tab={<><BellOutlined /> Helpdesk</>} key="2">
              <Table
                dataSource={article?.helpdeskTickets}
                rowKey="ticketId"
                pagination={{ pageSize: 5 }}
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
              {showViewModal &&
                <ViewSingleTicketModal
                  show={showViewModal}
                  onHide={handleHideViewModal}
                  ticketId={selectedTicketId!}
                  data={article?.helpdeskTickets!}
                />
              }
            </TabPane>
          </Tabs>
        </Card>
      </Col>
      {!loading &&
        <Col xs={24} lg={8} className='flex flex-col gap-4'>
          {article?.status === "razduženo" && (
            <Alert message="Detalji o korisniku nedostupni, oprema razdužena." showIcon type="warning" />
          )}
          {article?.status === "otpisano" && (
            <Alert message="Detalji o korisniku nedostupni, oprema otpisana." showIcon type="error" />
          )}
          {article?.status === "zaduženo" && (
            <Descriptions title="Detalji korisnika" bordered size='small' column={1}>
              <Descriptions.Item label={<><UserOutlined /> Korisnik</>}>
                {article?.user?.fullname}
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {article?.user?.email}
              </Descriptions.Item>
              <Descriptions.Item label={<><BuildOutlined /> Organizacija</>}>
                {article?.user?.organization?.name}
              </Descriptions.Item>
              <Descriptions.Item label={<><AppstoreAddOutlined /> Sektor/služba/odjeljenje</>}>
                {article?.user?.department?.title}
              </Descriptions.Item>
              <Descriptions.Item label={<><IdcardOutlined /> Radno mjesto</>}>
                {article?.user?.job?.title}
              </Descriptions.Item>
            </Descriptions>
          )}
          <Descriptions
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Status</span>
                {canEdit && <Button size="small" type="link" onClick={() => handleOpenChangeStatusModal(article!)}>
                  Promjeni status
                </Button>}
              </div>
            }
            bordered
            size="small"
            column={1}
          >
            <Descriptions.Item label={<><InfoCircleOutlined /> Status</>}>
              {article?.status}
            </Descriptions.Item>
            <Descriptions.Item label={<><CalendarOutlined /> Datum posljednje izmjene</>}>
              {dayjs(article?.timestamp).format('DD.MM.YYYY - HH:mm')}
            </Descriptions.Item>
          </Descriptions>
          {changeStatusModalVisible &&
            <StatusChangeModal
              data={selectedArticle!}
              type='article'
              visible={changeStatusModalVisible}
              onClose={handleCloseChangeStatusModal}
              refreshData={refreshDataAfterChange}
            />
          }
          <Descriptions title="Skladište" bordered size="small" column={1}>
            <Descriptions.Item label={<><FileTextOutlined /> Stanje po ugovoru</>}>
              {article?.stock?.valueOnContract}
            </Descriptions.Item>
            <Descriptions.Item label={<><ContainerOutlined /> Trenutno stanje</>}>
              {article?.stock?.valueAvailable}
            </Descriptions.Item>
            <Descriptions.Item label={<><FileSearchOutlined /> Ugovor</>}>
              {article?.stock?.contract}
            </Descriptions.Item>
            <Descriptions.Item label={<><CalendarOutlined /> Datum posljednje izmjene</>}>
              {dayjs(article?.stock?.timestamp).format('DD.MM.YYYY - HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        </Col>
      }
    </Row>
  );
};

export default ArticleComponent;
