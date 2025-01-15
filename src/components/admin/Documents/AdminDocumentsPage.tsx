import { useEffect, useState } from "react";
import { useApi } from "../../../API/api";
import DocumentsType from "../../../types/DocumentsType";
import { Button, Card, Input, Modal, Pagination, Table } from "antd";
import DocumentsDetails from "./moduls/DocumentDetails";
import UnsignedDocumnts from "./moduls/UnsignedDocuments";
import { LinkOutlined } from "@ant-design/icons";

const AdminDocumentsPage = () => {
  const { api } = useApi();
  const [documentsData, setDocumentsData] = useState<DocumentsType[]>([]);
  const [filteredData, setFilteredData] = useState<DocumentsType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedDocument, setSelectedDocument ] = useState<number>()
  const [documentDetailsModalVisible, setDocumentDetailsModalVisible] = useState<boolean>(false)
  const [size, setSize] = useState<{padding:number}>({"padding":24})

  useEffect(() => {
    fatchDocumentsData();
  }, [itemsPerPage, currentPage, searchText]);

  useEffect(() => {
    if (searchText === '') {
        setFilteredData(documentsData);
    } else {
        setFilteredData(
            documentsData.filter((document) => {
                let predao = document.articleTimelines ? (document.articleTimelines[0].subbmited?.fullname) : ("");
                let preuzeo = document.articleTimelines ? (document.articleTimelines[0].user?.fullname) : ("");
                return (
                    document.documentNumber?.toFixed().includes(searchText.toLowerCase()) ||
                    document.article?.serialNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
                    document.article?.invNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
                    predao?.toLowerCase().includes(searchText.toLowerCase()) ||
                    preuzeo?.toLowerCase().includes(searchText.toLowerCase())
                );
            })
        );
}}, [searchText, documentsData]);
useEffect(() => {
    const updateSize = () => {
      setSize(window.innerWidth <= 768 ? {"padding":0} : {"padding":24});
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const fatchDocumentsData = async () => {
    setIsLoading(true);
    try {
      const res = await api(
        `api/document/s?perPage=${itemsPerPage}&page=${currentPage}&query=${searchText}`,
        "get",
        {},
        "administrator",
      );

      if (res.status === "error") {
        console.error(
          "Greška prilikom dohvaćanja dodatnih podataka:",
          res.data,
        );
      } else if (res.status === "login") {
        console.log("Korisnik nije prijavljen.");
      } else {
        setDocumentsData(res.data.results);
        setTotal(res.data.total);
      }
    } catch (error) {
      console.error("Greška pri dohvaćanju podataka:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalVisible = (documentId:number) => {
    setSelectedDocument(documentId)
    setDocumentDetailsModalVisible(true)
  }

  const handleSearch = (e:any) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setCurrentPage(1);
      fatchDocumentsData();
    }
  };

  const columns = [
    { key: "documentNumber", dataIndex: 'documentNumber', title: "#" },
    { key: "naziv-artikal", title: "Naziv artikla", render:(record: DocumentsType) => (
        record.article?.stock?.name
    )},
    { key: "serijski-broj", title: "Serijski broj", render:(record: DocumentsType) => (
      <a href={`#/admin/article/${record.article?.serialNumber}`} ><LinkOutlined /> {record.article?.serialNumber}</a>
    )},
    { key: "inventurni-broj", title: "Inventurni broj", render:(record: DocumentsType) => (
        record.article?.invNumber
    )},
    { key: "predao", title: "Predao", render:(record: DocumentsType) => {
        const predao = record.articleTimelines && record.articleTimelines[0].subbmited
        return (
          <a href={`#/user/profile/${predao?.userId}`}><LinkOutlined /> {predao?.fullname}</a>
        )
    }},
    { key: "preuzeo", title: "Preuzeo", render:(record: DocumentsType) => {
        const preuzeo = record.articleTimelines && record.articleTimelines[0].user
        return (
          <a href={`#/user/profile/${preuzeo?.userId}`}><LinkOutlined /> {preuzeo?.fullname}</a>
        )
    }},
    {
        key: 'documentsId',
        dataIndex: 'documentsId',
        title: 'Akcije',
        render: (number: number) => (<Button onClick={() => handleModalVisible(number)}>Detalji</Button>)
    },
];

const tableHeader = () =>{
    return (
        <Input
            type="search"
            prefix={<i className="bi bi-search text-default-500" />}
            placeholder="Pronađi artikal..."
            onChange={handleSearch}
            onKeyDown={handleKeyPress}
            className="h-12 rounded-xl"
          />
    )
}

const handlePageChange = (page:any, pageSize:any) => {
    setCurrentPage(page);
    setItemsPerPage(pageSize);
  };

const tableFooter = () => {
    return(
        <Pagination
          current={currentPage}
          total={total}
          pageSize={itemsPerPage}
          onChange={handlePageChange}
          size="small"
          hideOnSinglePage
        />
    )
}

  return (
    <div className="flex flex-col gap-3">
    <UnsignedDocumnts />
    <Card className="rounded-xl" bodyStyle={size}>
        <Table
            size="small"
            loading={isLoading}
            dataSource={filteredData}
            columns={columns}
            scroll={{ x: "max-content" }}
            title={tableHeader}
            footer={tableFooter}
            pagination={false}
        />
    </Card>
    {documentDetailsModalVisible && 
    (<Modal
        okText={'Uredu'}
        title="Detalji dokumenta"
        open={documentDetailsModalVisible}
        onCancel={() => setDocumentDetailsModalVisible(false)}
        bodyStyle={{padding:10}}
    >
        <DocumentsDetails documentId={selectedDocument!} documents={documentsData!} />
    </Modal>)
    }
    
    </div>
  );
};

export default AdminDocumentsPage;
