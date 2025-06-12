import { useState, useEffect } from 'react';
import { Button, Card, Dropdown, MenuProps, Modal, Table, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import InvoiceForm from './Invoice.form';
import { useApi } from '../../../API/api';
import { useNotificationContext } from '../../Contexts/Notification/NotificationContext';
import { EyeOutlined, SettingOutlined, EditOutlined} from '@ant-design/icons';

const InvoiceList = () => {
    const { api } = useApi();
    const [invoices, setInvoices] = useState<InvoiceType[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [isInvoiceEditModalVisible, setIsInvoiceEditModalVisible] = useState<boolean>(false)
    const {error} = useNotificationContext()
    const navigate = useNavigate()

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await api('/api/invoice', 'get', undefined);
            if(response.status === 'login'){
                navigate('/login')
            }
            const sortedInvoices = response.data.sort((a: { createdAt: Date; }, b: { createdAt: Date; }) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setInvoices(sortedInvoices);
        } catch (err: any) {
            error.notification('Greška prilikom dohvaćanja faktura: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (invoiceId: number) => {
        navigate(`/admin/invoices/${invoiceId}/printers`)
    };

    const handleEditInvoice = (invoiceId: number) => {
        setSelectedInvoiceId(invoiceId);
        setIsInvoiceEditModalVisible(true)
    };

    const handleIsEditModalVisibleClose = () => {
        setIsInvoiceEditModalVisible(false);
        fetchInvoices()
      }

      const columns = [
        { key: "invoiceNumber", dataIndex: 'invoiceNumber', title: "Broj", width:50 },
        { key: "customer", dataIndex: 'customer', title: "Nalogodavac" },
        { key: "type", dataIndex: 'type', title: "Tip", width: 100, align: 'center',},
        {
            key: "status",
            dataIndex: 'status',
            title: "Status",
            width: 120,
            align: 'center',
            render: (text: string) => (
                <Tag className='rounded-xl px-2 py-1' color={text === 'plaćeno' ? 'green' : 'warning'}>{text}</Tag>
            ),
        },
        { key: "issueDate", dataIndex: 'issueDate', title: "Datum plaćanja", width: 150,
            render: (date: string) => {
                const options: Intl.DateTimeFormatOptions = {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                };
                return new Date(date).toLocaleDateString('hr-HR', options);
            }
         },
        { key: "totalAmount", dataIndex: 'totalAmount', title: "Vrijednost", width: 120,
            render: (value: number) => {
                return new Intl.NumberFormat('hr-HR', {
                    style: 'currency',
                    currency: 'BAM',
                }).format(value);
            }
         },
        {
            key: 'invoiceId',
            dataIndex: 'invoiceId',
            title: 'Akcije',
            width: 200,
            align: 'center',
            render: (number: number, record: { status: string }) => {
                const isPaid = record.status === 'plaćeno';

                if (isPaid) {
                    return <Button onClick={() => handleViewDetails(number)} icon={<EyeOutlined />}>  Pregledaj</Button>;
                }

                const items: MenuProps['items'] = [
                    {
                        key:'1',
                        label: (
                            <a target='_blank' rel='noopener noreferrer' onClick={() => handleViewDetails(number)}> <EyeOutlined /> Lista printera</a>
                        ),
                    },
                    {
                        key:'2',
                        label: (
                            <a target='_blank' rel='noopener noreferrer' onClick={() => handleEditInvoice(number)}> <EditOutlined /> Izmjeni fakturu</a>
                        )
                    }
                ]
                return (
                    <Dropdown menu={{items}} trigger={['click']}>
                        <Button icon={<SettingOutlined />}>Opcije</Button>
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div>
        <div>
            <Card className="overflow-auto scrollbar-hide ">
                <Table loading={loading} size='small' dataSource={invoices} columns={columns} scroll={{ x: "max-content" }} />
            </Card>
            {isInvoiceEditModalVisible && (
                <Modal
                    open={isInvoiceEditModalVisible}
                    footer={[
                        <Button key="cancel" onClick={() => handleIsEditModalVisibleClose()}>
                            Zatvori
                        </Button>
                    ]}
                    title="Izmjena fakture"
                    >
                        <InvoiceForm invoiceId={Number(selectedInvoiceId)} />
                </Modal>
            )}
            </div>
        </div>
    );
};

export default InvoiceList;
