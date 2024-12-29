// InvoiceList.js
import { useState, useEffect } from 'react';
import { Button, message, Table, Tag } from 'antd';
import api from '../../../API/api';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import { Spinner } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState<InvoiceType[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate()

    useEffect(() => {
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
        fetchInvoices();
    }, []);

    const handleViewDetails = (invoiceId: number) => {
        navigate(`/admin/invoices/${invoiceId}/printers`)
    };

    const columns = [
        { key: "customer", dataIndex: 'customer', title: "Kupac" },
        { key: "type", dataIndex: 'type', title: "Tip" },
        { key: "invoiceNumber", dataIndex: 'invoiceNumber', title: "Broj fakture" },
        { key: "status", dataIndex: 'status', title: "Status", render:(text:string) => <Tag color={text === 'plaćeno' ? 'success' : 'warning'}>{text}</Tag>},
        { key: "issueDate", dataIndex: 'issueDate', title: "Datum plaćanja" },
        { key: "totalAmount", dataIndex: 'totalAmount', title: "Vrijednost" },
        { 
            key: 'invoiceId', 
            dataIndex: 'invoiceId', 
            title: 'Akcije', 
            render: (number: number)=> 
            
            <Button onClick={() => handleViewDetails(number)}>Pogledaj</Button>}
    ];

    return (
        <div>
            {contextHolder}
            <RoledMainMenu />
        <div className='p-3'>
            {loading ? (
          <div className="flex items-center justify-center min-h-[70vh]">
            <Spinner
              label="Učitavanje..."
              labelColor="warning"
              color="warning"
            />
          </div>
        ):(
            <div className="overflow-auto scrollbar-hide bg-white rounded-md">
                <Table size='small' dataSource={invoices} columns={columns}></Table>
            </div>
        )}
        </div>
        </div>
    );
};

export default InvoiceList;
