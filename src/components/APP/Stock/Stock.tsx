import { Row, Col, Card, Tag, Descriptions, Divider, Button, Typography, Modal } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StatusChangeModal from '../../admin/Article/models/ChangeStatusModal';
import { ApiResponse, useApi } from '../../../API/api';
import { useNotificationContext } from '../../Contexts/Notification/NotificationContext';
import { InfoCircleOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import StockType from '../../../types/UserArticleType';
import { useUserContext } from '../../Contexts/UserContext/UserContext';
import { useCanEdit } from '../../../config/permissions';
import ArticleForm from '../../admin/Article/AddArticle/ArticleForm';
import ArticleInStockTable from './StockArticleTableNew';

const { Title, Text } = Typography;

const Stock: React.FC = () => {
    const { api } = useApi();
    const { role } = useUserContext();
    const canEdit = useCanEdit();
    const [stockData, setStockData] = useState<StockType>();
    const {error, warning, success } = useNotificationContext();
    const { stockId } = useParams<{ stockId: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const [changeStatusModalVisible, setChangeStatusModalVisible] = useState(false);
    const [editStockModalVisible, setEditModalVisible] = useState(false);

    useEffect(() => {
        getStockData();
    }, []);

    const getStockData = () => {
        setLoading(true);
        try {
        api("api/stock/" + stockId, "get", {}, role)
            .then((res: ApiResponse) => {
            if (res.status === "error") {
                error.notification("Greška prilikom učitavanja podataka skladišta artikla");
                return;
            }
            const data: StockType = res.data;
            setStockData(data);
            })
            .finally(() => setLoading(false));
        } catch (error) {}
    };

    const getStatusTag = (valueAvailable: number) => {
        return valueAvailable > 0 ? (
          <Tag color="green">dostupno</Tag>
        ) : (
          <Tag color="volcano">nema na stanju</Tag>
        );
      };

       const handleOpenChangeStatusModal = () => {
          setChangeStatusModalVisible(true);
        };

        const handleCloseChangeStatusModal = () => {
          setChangeStatusModalVisible(false);
        };

        const handleOpenEditStockModal = () => {
            setEditModalVisible(true);
          };

        const handleCloseEditStockModal = () => {
            setEditModalVisible(false);
            getStockData();
        };

        const handleEditArticle = async (data: any) => {
            setLoading(true);
            const requestBody = {
              ...data,
              valueAvailable: Number(data.valueAvailable),
              valueOnContract: Number(data.valueOnContract),
              features: data.features.filter((feature: any) => feature.use === true).map((feature: any) => ({
                featureId: feature.featureId,
                value: feature.value,
              })),
            };

            try {
              const res: ApiResponse = await api(`/api/stock/${stockId}`, "put", requestBody, role);
              if (res.status === "ok") {
                success.notification("Artikal je uspješno izmjenjen");
                handleCloseEditStockModal()
              }
            } catch (err: any) {
              warning.notification("Greška prilikom izmjene artikla");
            } finally {
              setLoading(false);
            }
          };

        const refreshDataAfterChangeStatus = () => {
            getStockData()
        };

    return (
        <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card loading={loading} >
          <Row justify="space-between" align="middle" className='mb-4'>
            <Col>
              <Text>
              <i
                className={`${stockData?.category?.imagePath} mr-2 text-lg`}
              ></i>
                <span className='font-bold text-lg'>{stockData?.name}</span>
              </Text>
            </Col>
            <Col>
              {getStatusTag(stockData?.valueAvailable!)}
              {canEdit && <Button size="small" onClick={() => handleOpenEditStockModal()}>
                Izmjeni
            </Button>}
            </Col>
          </Row>
          <Row gutter={[16, 16]} justify="space-between">
            <Col xs={24} md={7} className='justify-center items-center flex'>
            <i
                className={`${stockData?.category?.imagePath}`}
                style={{ fontSize: 150 }}
              ></i>
            </Col>
            <Col xs={24} md={16} className='flex flex-col'>
                <Descriptions column={1} className="max-h-[200px] overflow-y-auto overflow-hidden">
                  {stockData?.stockFeatures!.map((feature, index) => (
                    <Descriptions.Item key={index} label={feature.feature?.name}>
                      {feature.value}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
            </Col>
          </Row>
          <Divider />

          <Title level={5}><FileTextOutlined /> Opis</Title>
          <Text>{stockData?.description}</Text>
          <Divider />
          <ArticleInStockTable stockId={parseInt(stockId!, 10)} />
        </Card>
      </Col>
      {!loading &&
      <Col xs={24} lg={8} className='flex flex-col gap-4'>
      <Descriptions
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Status</span>
            {canEdit && <Button size="small" onClick={() => handleOpenChangeStatusModal()}>
              Promjeni status
            </Button>}
          </div>
        }
        bordered
        size="small"
        column={1}
      >
        <Descriptions.Item
          label="Stanje po ugovoru">
          {stockData?.valueOnContract}
        </Descriptions.Item>
        <Descriptions.Item
          label="Trenutno stanje">
          {stockData?.valueAvailable}
        </Descriptions.Item>
        <Descriptions.Item
          label="SAP broj">
          {stockData?.sapNumber}
        </Descriptions.Item>
        <Descriptions.Item
          label={<><CalendarOutlined /> Datum posljednje izmjene</>}
        >
          {dayjs(stockData?.timestamp).format('DD.MM.YYYY - HH:mm')}
        </Descriptions.Item>
      </Descriptions>
        {changeStatusModalVisible &&
          <StatusChangeModal
            stockId={stockId ? parseInt(stockId, 10) : undefined}
            type='stock'
            visible={changeStatusModalVisible}
            onClose={handleCloseChangeStatusModal}
            refreshData={refreshDataAfterChangeStatus}
          />
        }

        {editStockModalVisible &&
        <Modal width="640px" title="Promjena statusa" open={editStockModalVisible} onCancel={handleCloseEditStockModal} footer={null}>
             <ArticleForm initialData={stockData} onSubmit={handleEditArticle} loading={loading} />
        </Modal>
        }
      </Col>
      }
    </Row>
    );
};
export default Stock;
