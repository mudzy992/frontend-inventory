import {  Button, Card, Input, message, Modal, Table, Tag } from "antd";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiResponse, useApi } from "../../../API/api";
import { UserRole } from "../../../types/UserRoleType";
import { useUserContext } from "../../Contexts/UserContext/UserContext";
import {  SearchOutlined } from '@ant-design/icons';
import ArticleListTable from "./ArticleListTable";

interface TabelaProps {
    categoryId?: string;
  }

interface StockType {
    name: string;
    sapNumber: string;
    stockId: number;
    valueAvailable: number;
    valueOnContract: number;
}

const ArticleStockListTable: FC<TabelaProps> = ({categoryId}) => {
    const { api } = useApi();
    const { role } = useUserContext();
    const [articles, setArticles] = useState<StockType[]>([]);
    const [filteredData, setFilteredData] = useState<StockType[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const [selectedStockId, setSelectedStockId ] = useState<number>()
    const [articleTableModalVisible, setArticleTableModalVisible ] = useState<boolean>(false)
    const navigate = useNavigate()

    useEffect(() => {
        fatchArticles();
    }, []);

    useEffect(() => {
        if (searchText === '') {
            setFilteredData(articles);
        } else {
            setFilteredData(
                articles.filter((article) => {
                    return (
                        article.name.toLowerCase().includes(searchText.toLowerCase()) || 
                        article.sapNumber.toLowerCase().includes(searchText.toLowerCase())
                    );
                })
            );
    }}, [searchText, articles]);

    const valueStatus = (valueAvailabele: number) => {
        if (valueAvailabele === 0) {
          return (
            <Tag className="rounded-xl" color="#f50">
              {" "}
              nema na stanju{" "}
            </Tag>
          );
        } else {
          return (
            <Tag className="rounded-xl" color="#108ee9">
              {" "}
              {`Dostupno: ${valueAvailabele}`}
            </Tag>
          );
        }
      };
    
    const handleOpenStockPage = (stockId: number) => (
        navigate(`/admin/stock/${stockId}`)
    )

    const hanleOpenArticleTableModal = (stockId: number) => (
        setSelectedStockId(stockId),
        setArticleTableModalVisible(true)
    )

    const columns = [
        {key:"name", dataIndex:"name", title:"Naziv"},
        {key:"value", dataIndex:"", title:"Stanje opreme", render: (record: StockType) => (
            valueStatus(record.valueAvailable)
        )},
        {key:"sapNumber", dataIndex:"sapNumber", title:"SAP Broj"},
        {key:"responsibility", dataIndex:"", title:"Zaduženje", render: (record: StockType) => (
            <Button variant="outlined" color="primary" onClick={() => hanleOpenArticleTableModal(record.stockId)}> Zaduženja</Button>
        )},
        {key:"stock", dataIndex:"", title:"Skladište", render: (record: StockType) => (
            <Button variant="outlined" color="primary" onClick={() => handleOpenStockPage(record.stockId)}> Skladište</Button>
        )},
    ]

    const fatchArticles = async () => {
        setLoading(true);
        try {
            api(`api/stock/c/${categoryId}`, 'get', undefined, role as UserRole). then(
                async(res: ApiResponse) => {
                    if(res.status === 'forbidden'){
                        message.error('Korisnik nema dovoljno prava za učitavanje podataka')
                        return;
                    }
                    if (res.status === 'error'){
                        message.error('Greška prilikom učitavanja podataka');
                        navigate('/login')
                        return;
                    }
                    if(res.status === 'login'){
                        message.warning('Vaša prijava je istekla, molimo prijavite se ponovo!')
                        navigate('/login')
                        return;
                    }
                    setArticles(res.data)
                },
            );
        } catch (error){
            message.error('Sistemska greška, molim kontaktirajte administratora:' + error)
            navigate('/login')
        } finally {
            setLoading(false);
        }
    };

    const tableHeader = () => {
        return (
            <div className="py-4">
                <Input
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                placeholder="Pretraga po nazivu"
                className="lg:w-1/2"
                />
            </div>
        )
    }

    return (
        <Card loading={loading} title={tableHeader()}>
            <Table
                dataSource={filteredData} 
                columns={columns}
                scroll={{ x: "max-content" }}
                size="small"
            />
        {articleTableModalVisible && (
            <Modal
                closable={false}
                style={{ top: 20 }}
                width={900}
                open={articleTableModalVisible} 
                onCancel={() => setArticleTableModalVisible(false)}
            >
                <ArticleListTable stockId={selectedStockId!} />
            </Modal>
        )}
        </Card>
    );
};

export default ArticleStockListTable;
