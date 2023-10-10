import React, { FC, useEffect, useMemo, useState } from "react";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Button } from "react-bootstrap";
import api from "../../../API/api";

interface ArticleType {
  articleId: number;
  name: string;
  excerpt: string;
  sapNumber: string;
}

interface TabelaProps {
  categoryId: string;
}

const Tabela: FC<TabelaProps> = ({ categoryId }) => {
  const [data, setData] = useState<ArticleType[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Pozovite funkciju za dohvaćanje podataka o artiklima
    const fetchData = async () => {
      try {
        const response = await api(`api/category/${categoryId}`, 'get', {}, 'administrator');
        if (response.status === 'error') {
          setErrorMessage('Greška prilikom učitavanja artikala. Osvježite stranicu ili pokušajte ponovo kasnije.');
          return;
        }

        // Dobijte podatke o artiklima iz response-a
        const articles = response.data.articles as ArticleType[];
        setData(articles);
      } catch (error) {
        console.error("Greška:", error);
      }
    };

    fetchData();
  }, [categoryId]);

  const columns = useMemo<MRT_ColumnDef[]>(
    () => [
      {
        accessorKey: "articleId",
        header: "articleId",
        size: 0, // Sakrijte ovo polje u prikazu tablice
      },
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
        accessorKey: "articleId",
        id: "articleId",
        header: "Zaduženja",
        Cell: ({ cell }) => (
          <Button
            variant="contained"
            color="primary"
            className="btn-sm"
            onClick={() => {
              const articleId = cell.getValue<number>();
              window.location.href = `/api/userArticle/${articleId}`;
            }}
          >
            Zaduženja
          </Button>
        ),
      },
      {
        accessorKey: "articleId",
        id: "articleId",
        header: "",
        Cell: ({ cell }) => (
          <Button
            variant="contained"
            color="primary"
            className="btn-sm"
            onClick={() => {
              const articleId = cell.getValue<number>();
              window.location.href = `#/article/${articleId}/`;
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
    <MaterialReactTable
      columns={columns}
      data={data}
      // ...
    />
  );
};

export default Tabela;
