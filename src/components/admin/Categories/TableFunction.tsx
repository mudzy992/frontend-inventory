import { FC, useEffect, useMemo, useState } from "react";
import api from "../../../API/api";
import ArticleModal from "./ArticleModal";
import {  Button, Chip, Link, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";


interface ArticleType {
  stockId: number;
  name: string;
  excerpt: string;
  sapNumber: string;
  valueAvailable: number;
  articles?: []
}

interface TabelaProps {
  categoryId?: string;
}

const Tabela: FC<TabelaProps> = ({ categoryId }) => {
  const [data, setData] = useState<ArticleType[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); 
  const [selectedStockId, setSelectedStockId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const pages = Math.ceil(data.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return data.slice(start, end);
  }, [page, data]);

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleHideModal = () => {
    setShowModal(false);
  };

  const openModalWithArticle = (stockId: number) => {
    setSelectedStockId(stockId);
    handleShowModal();
  };

  const valueStatus = (valueAvailabele: number) => {
    if(valueAvailabele === 0) {
      return <Chip variant="shadow" color="danger" size="sm" > nema na stanju </Chip>
    } else {
      return <Chip variant="shadow" color="warning" size="sm"> {`Dostupno: ${valueAvailabele}`}</Chip>
    }
  }

  useEffect(() => {
    // Pozovite funkciju za dohvaćanje podataka o artiklima
    const fetchData = async () => {
      try {
        const response = await api(`api/stock/c/${categoryId}`, 'get', {}, 'administrator');
        if (response.status === 'error') {
          setErrorMessage('Greška prilikom učitavanja artikala. Osvježite stranicu ili pokušajte ponovo kasnije.');
          return;
        }

        if(response.status === 'login') {
          setIsLoggedIn(false);
          return;
        }

        // Dobijte podatke o artiklima iz response-a
        const stocks = response.data as ArticleType[];
        setData(stocks);
      } catch (error) {
        console.error("Greška:", error);
      }
    };

    fetchData();
  }, [categoryId]);


  if (errorMessage) {
    return <div>{errorMessage}</div>;
  }
    
  return (
    <>
    
    <Table 
    aria-label="Tabela korisnika zaduženja"
    className="mb-3"
    bottomContent={
    <div className="flex w-full justify-center">
      <Pagination
        isCompact
        showControls
        showShadow
        color="secondary"
        page={page}
        total={pages}
        onChange={(page) => setPage(page)}
      />
    </div>
  }
  classNames={{
    wrapper: "min-h-[222px]",
  }}
>
  <TableHeader>
    <TableColumn key="name">Naziv opreme</TableColumn>
    <TableColumn key="valueAvailable">Stanje opreme</TableColumn>
    <TableColumn key="sapNumber">SAP broj</TableColumn>
    <TableColumn key="zaduzenja">Zaduženja</TableColumn>
    <TableColumn key="skladiste">Skladište</TableColumn>
  </TableHeader>
  <TableBody items={items}>
    {(item) => (
      <TableRow key={item.stockId}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{valueStatus(item.valueAvailable)}</TableCell>
        <TableCell>{item.sapNumber}</TableCell>
        <TableCell>
          <Button
            color="warning"
            variant="flat"
            size="sm"
            onClick={() => {
              openModalWithArticle(item.stockId); 
            }}
          >
            Zaduženja
          </Button>
        </TableCell>
        <TableCell>
          <Button
            color="warning"
            variant="shadow"
            size="sm"
            as={Link}
            href={`#/admin/stock/${item.stockId}/`}
          >
            <i className="bi bi-boxes"  style={{fontSize:"15px"}} /> Skladište
          </Button>
        </TableCell>
      </TableRow>
    )}
  </TableBody>
</Table>  
    
      <ArticleModal
        show={showModal}
        onHide={handleHideModal}
        stockId={selectedStockId!} 
      />
    </>
  );
};

export default Tabela;
