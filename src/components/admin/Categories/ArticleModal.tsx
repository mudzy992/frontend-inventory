import { FC, useEffect, useMemo, useState } from 'react';
import api from "../../../API/api"; 
import { Button, ChipProps, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';

interface ResponsibilityArticleBaseType {
  serialNumber: string;
  invNumber: string;
  status: 'zaduženo' | 'razduženo' | 'otpisano';
  timestamp: string;
  articleId: number;
  user?: {
    userId: number;
    fullname: string;
  };
  [key: string]: string | number | { userId: number; fullname: string } | undefined;
}


interface ArticleModalProps {
  show: boolean;
  onHide: () => void;
  stockId: number;
}

const statusColorMap: Record<string, ChipProps["color"]> = {
  zaduženo: "success",
  razduženo: "danger",
  otpisano: "warning",
};

const ArticleModal: FC<ArticleModalProps> = ({ show, onHide, stockId }) => {
  const [articleData, setArticleData] = useState<ResponsibilityArticleBaseType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const itemsPerPage = 5;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const items = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  console.log('articleData inside useMemo:', articleData);

  return articleData.slice(start, end);
}, [currentPage, itemsPerPage, articleData]);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
  
      try {
        const res = await api(`api/article/s/${stockId}?perPage=${itemsPerPage}&page=${currentPage}&query=${searchQuery}`, 'get', {}, 'administrator');
  
        if (res.status === 'error') {
          console.error('Greška prilikom dohvaćanja dodatnih podataka:', res.data);
        } else if (res.status === 'login') {
          console.log('Korisnik nije prijavljen.');
        } else {
          setArticleData(prevData => [...prevData, ...res.data.results]);
          setTotalResults(res.data.total);
          console.log('articleData:', res.data.results);
        }
      } catch (error) {
        console.error('Greška pri dohvaćanju podataka:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (show) {
      fetchData();
    }
  }, [show, stockId, itemsPerPage, currentPage, searchQuery]);
  
  console.log('articleData-vani:', articleData);
  console.log('items:', items);

  const handleSearch = () => {
    setIsLoading(true);
    api(`api/article/s/${stockId}?perPage=${itemsPerPage}&page=${currentPage}&query=${searchQuery}`, 'get', {}, 'administrator')
      .then((res) => {
        if (res.status === 'error') {
          console.error('Greška prilikom pretrage:', res.data);
        } else {
          setArticleData(prevData => [...prevData, ...res.data.results]);
          setTotalResults(res.data.total);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Greška pri dohvaćanju podataka:', error);
        setIsLoading(false);
      });
  };
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <Modal isOpen={show} onClose={onHide} size='4xl' backdrop='blur'>
      <ModalContent>
        <ModalHeader>Detalji zaduženja</ModalHeader>
        <ModalBody style={{ overflowX: 'auto' }}>
          <Table
            aria-label="Article modal tabela"
            isHeaderSticky
            classNames={{
              wrapper: "max-h-[382px]",
            }}
           
          >
            <TableHeader>
              <TableColumn key="fullname">Ime i prezime</TableColumn>
              <TableColumn key="sapNumber">serialNumber</TableColumn>
              <TableColumn key="invNumber">invNumber</TableColumn>
              <TableColumn key="timestamp">Zaduženja</TableColumn>
              <TableColumn key="status">Skladište</TableColumn>
            </TableHeader>
            <TableBody items={items}>
              {(item) => {
                console.log('Rendering item:', item);
                return items.length > 0 ? (
                  <TableRow key={item.serialNumber}>
                    <TableCell key={item.user?.fullname}>{item.user?.fullname}</TableCell>
                    <TableCell key={item.serialNumber}>{item.serialNumber}</TableCell>
                    <TableCell key={item.invNumber}>{item.invNumber}</TableCell>
                    <TableCell key={item.timestamp}>{item.timestamp}</TableCell>
                    <TableCell key={item.status}>{item.status}</TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>Nema artikala</TableCell>
                  </TableRow>
                );
              }}
            </TableBody>
          </Table>
          <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={currentPage}
              total={totalPages}
              onChange={(page) => setCurrentPage(page)}
            />
          <div>
            <Input
              isClearable
              placeholder="Search..."
              value={searchQuery}
              onClear={() => setSearchQuery('')}
              onValueChange={(value) => setSearchQuery(value || '')}
            />
            <Button variant="light" onClick={handleSearch}>Search</Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={onHide}>Zatvori</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ArticleModal;