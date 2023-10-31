import { FC, useEffect, useMemo, useState } from "react";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Button } from "react-bootstrap";
import api from "../../../API/api";
import ArticleModal from "./ArticleModal";
import { Card, CardContent } from "@mui/material";

interface ArticleType {
  stockId: number;
  name: string;
  excerpt: string;
  sapNumber: string;
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
        accessorKey: "name",
        header: "Naziv opreme",
        Cell: ({ cell }) => cell.getValue<string>(),
      },
      {
        accessorKey: "excerpt",
        header: "Opis opreme",
        Cell: ({ cell }) => cell.getValue<string>(),
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
            variant="contained"
            color="primary"
            className="btn-sm"
            onClick={() => {
              const stockId = cell.getValue<number>();
              openModalWithArticle(stockId); // Proslijedite articleId funkciji
            } }
          >
            Zaduženja
          </Button>
        ),
      },
       {
        accessorKey: "stockId",
        key: "articleId2",
        header: "",
        Cell: ({ cell }) => (
          <Button
            variant="contained"
            color="primary"
            className="btn-sm"
            onClick={() => {
              const stockId = cell.getValue<number>();
              window.location.href = `#/admin/stock/${stockId}/`;
            }}
          >
            Detalji opreme
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
