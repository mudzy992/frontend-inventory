import React, { FC, useEffect, useMemo, useState } from "react";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Button } from "react-bootstrap";
import api from "../../../API/api";

interface UserArticleBaseType {
  articleId?: number;
  name?: string;
  excerpt?: string;
  sapNumber?: string;
  userArticles?: {
    invBroj?: string;
    serialNumber?: string;
    status?: 'zaduženo' | 'razduženo' | 'otpisano';
    timestamp?: string;
    userId?: number;
  }[],
  userDetails?: {
    userId: number;
    surname: string;
    forname: string;
    fullname: string;
  }[]
}

const Tabela: FC<{ categoryID: number }> = ({ categoryID }) => {
  const [data, setData] = useState<UserArticleBaseType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Simulacija čekanja od 1 sekunde
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulacija poziva API-ja za dohvat novih podataka
      // Ovdje možete zamijeniti ovaj dio stvarnim pozivom prema vašem API-ju
      try {
        const response = await api(
          'api/article/?filter=categoryId||$eq||' + categoryID,
          'get',
          {},
          'administrator'
        );
        if (response.status === 'error') {
          throw new Error('Greška prilikom dohvaćanja podataka');
        }
        setData(response.data);
      } catch (error) {
        console.error('Greška pri dohvaćanju podataka:', error);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [categoryID]);

  const columns = useMemo<MRT_ColumnDef[]>(
    () => [
      {
        accessorKey: "name",
        header: "Naziv opreme"
      },
      {
        accessorKey: "excerpt",
        header: "Opis opreme"
      },
      {
        accessorKey: "sapNumber",
        header: "SAP broj"
      },
      {
        accessorKey: "articlesInStock.valueAvailable",
        header: "Dostupno",
        size: 150,
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          const cellStyle = {
            color: value === 0 ? "red" : "green",
            fontWeight: "bold",
          };

          return (
            <div style={cellStyle}>
              {value}
            </div>
          );
        },
      },
      {
        accessorKey: "articleId",
        id: 'articleId',
        header: '',
        Cell: ({ cell }) => <>
        <Button
          variant="contained"
          color="primary"
          className="btn-sm"
          onClick={() => {
            window.location.href = `#/article/${cell.getValue<string>()}/`;
          }}
        >
          Detalji opreme
        </Button>
        </>, 
      },
    ],
    []
  );

  return (
    <div>
      <MaterialReactTable
        columns={columns}
        data={data}
        initialState={{ pagination: { pageSize: 5, pageIndex: 1 } }}
        displayColumnDefOptions={{
          "mrt-row-drag": {
            muiTableHeadCellProps: {
              align: "left"
            },
            muiTableBodyCellProps: {
              align: "left"
            }
          }
        }}
      />
      {isLoading && <div>Loading...</div>}
    </div>
  );
};

export default Tabela;
