import { FC, useEffect, useMemo, useState } from "react";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Badge, Button } from "react-bootstrap";
import api from "../../../API/api";
import ArticleModal from "./ArticleModal";
import { Card} from "@mui/material";
import { IoPeopleCircleOutline } from "@react-icons/all-files/io5/IoPeopleCircleOutline";
import { MRT_Localization_SR_LATN_RS } from 'material-react-table/locales/sr-Latn-RS';


interface ArticleType {
  stockId: number;
  name: string;
  excerpt: string;
  sapNumber: string;
  valueOnContract: number;
  valueAvailable: number;
  articles?: [

  ]
}

interface TabelaProps {
  categoryId: string;
}

const Tabela: FC<TabelaProps> = ({ categoryId }) => {
  const [data, setData] = useState<ArticleType[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // Dodajte state za prikaz moda
  const [selectedStockId, setSelectedStockId] = useState<number | null>(null);

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

  const valueStatus = (valueAvailabele: number, valueOnConcract: number) => {
    if(valueAvailabele === 0 || valueAvailabele < valueOnConcract) {
      return <Badge bg="danger"> nema na stanju</Badge>
    } else {
      return <Badge bg="success">Dostupno: {valueAvailabele}</Badge>
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

        // Dobijte podatke o artiklima iz response-a
        const stocks = response.data as ArticleType[];
        setData(stocks);
      } catch (error) {
        console.error("Greška:", error);
      }
    };

    fetchData();
  }, [categoryId]);

  const columns = useMemo<MRT_ColumnDef[]>(
    () => [
      {
        size:350,
        accessorKey: "name",
        header: "Naziv opreme",
        Cell: ({ cell }) => cell.getValue<string>(),
      },
      {
       
        accessorKey: "valueAvailable",
        header: "Stanje",
        Cell: ({ row }) => {
          const { valueAvailable, valueOnContract } = row.original as ArticleType;
          return valueStatus(valueAvailable, valueOnContract);
        },
      },
      {
      
        accessorKey: "sapNumber",
        header: "SAP broj",
        Cell: ({ cell }) => cell.getValue<string>(),
      },
      {
       
        accessorKey: "stockId",
        key: "stockId1",
        header: "Zaduženja",
        Cell: ({ cell }) => (
          <Button
            className="btn-sm"
            onClick={() => {
              const stockId = cell.getValue<number>();
              openModalWithArticle(stockId); // Proslijedite articleId funkciji
            } }
          >
            <IoPeopleCircleOutline style={{fontSize:"19px"}}/> Zaduženja
          </Button>
        ),
      },
       {
        
        accessorKey: "stockId",
        key: "articleId2",
        header: "Detalji opreme",
        Cell: ({ cell }) => (
          <Button
            className="btn-sm"
            onClick={() => {
              const stockId = cell.getValue<number>();
              window.location.href = `#/admin/stock/${stockId}/`;
            }}
          >
            <i className="bi bi-boxes"  style={{fontSize:"15px"}} /> Skladište
          </Button>
        ),
      }, 
    ],
    []
  );

  if (errorMessage) {
    return <div>{errorMessage}</div>;
  }
    
  return (
    <>
    <Card>
      <MaterialReactTable
      columns={columns}
      data={data}
      enableSorting={false}
      enableFilters={false}
      enableColumnActions={false}
      localization={MRT_Localization_SR_LATN_RS}
      initialState={{ density: "compact" }}
      />
     
    </Card>
      
      <ArticleModal
        show={showModal}
        onHide={handleHideModal}
        stockId={selectedStockId!} // Proslijedite articleId
      />
    </>
  );
};

export default Tabela;
