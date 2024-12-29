import { useState, useEffect } from 'react';
import { Button, Dropdown, MenuProps, message, Modal, Table, Tag } from 'antd';
import api from '../../../API/api';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import { useNavigate } from 'react-router-dom';
import InvoiceForm from './Invoice.form';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState<InvoiceType[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [isInvoiceEditModalVisible, setIsInvoiceEditModalVisible] = useState<boolean>(false)
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate()

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await api('/api/invoice', 'get', undefined);
            setInvoices(response.data);
        } catch (error) {
            messageApi.open({content:'Greška prilikom dohvaćanja podatak', type:'error'});
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
        { key: "customer", dataIndex: 'customer', title: "Kupac" },
        { key: "type", dataIndex: 'type', title: "Tip" },
        { key: "invoiceNumber", dataIndex: 'invoiceNumber', title: "Broj fakture" },
        {
            key: "status",
            dataIndex: 'status',
            title: "Status",
            render: (text: string) => (
                <Tag color={text === 'plaćeno' ? 'success' : 'warning'}>{text}</Tag>
            ),
        },
        { key: "issueDate", dataIndex: 'issueDate', title: "Datum plaćanja" },
        { key: "totalAmount", dataIndex: 'totalAmount', title: "Vrijednost" },
        {
            key: 'invoiceId',
            dataIndex: 'invoiceId',
            title: 'Akcije',
            render: (number: number, record: { status: string }) => {
                const isPaid = record.status === 'plaćeno';
    
                if (isPaid) {
                    return <Button onClick={() => handleViewDetails(number)}>Pogledaj</Button>;
                }

                const items: MenuProps['items'] = [
                    {
                        key:'1',
                        label: (
                            <a target='_blank' rel='noopener noreferrer' onClick={() => handleViewDetails(number)}>Pogledaj</a>
                        ),
                    },
                    {
                        key:'2',
                        label: (
                            <a target='_blank' rel='noopener noreferrer' onClick={() => handleEditInvoice(number)}>Izmjeni</a>
                        )
                    }
                ]    
                return (
                    <Dropdown menu={{items}} trigger={['click']}>
                        <Button>Opcije</Button>
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div>
            {contextHolder}
            <RoledMainMenu />
        <div className='p-3'>
            <div className="overflow-auto scrollbar-hide bg-white rounded-md">
                <Table loading={loading} size='small' dataSource={invoices} columns={columns}></Table>
            </div>
            {isInvoiceEditModalVisible && (
                <Modal
                    open={isInvoiceEditModalVisible}
                    onCancel={() => handleIsEditModalVisibleClose()}
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
