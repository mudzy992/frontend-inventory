import React, { FC, useMemo } from "react";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Box, Typography } from "@mui/material";
import ArticleType from '../../../types/ArticleType';
import './TableFunction.css';
import { Button } from "react-bootstrap";


interface UserArticleBaseType {
    articleId?: number;
    name?: string;
    excerpt?: string;
    sapNumber?: string;
    userArticles?: {
        /* invBroj?: string; */
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




const Tabela: FC<{ data: ArticleType[] }> = ({ data }) => {
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
    <MaterialReactTable
      columns={columns}
      data={data}
      displayColumnDefOptions={{
        "mrt-row-expand": {
          muiTableHeadCellProps: {
            align: "left"
          },
          muiTableBodyCellProps: {
            align: "left"
          }
        }
      }}
     
      renderDetailPanel={({ row }) => {
        const original = row.original as UserArticleBaseType | undefined;
      
        if (!original || (!original.userArticles) || (original.userArticles?.length === 0)) {
          return (
            <Typography className="alert alert-warning user-article-typography">
                Nema dostupnih artikala ili informacija o korisniku za proširenje.
            </Typography>
          );
        }
      
        return (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: 'repeat(3, 1fr)',
            }}
          >
            {original.userArticles.map((userArticle: any) => {
              // Pronađi odgovarajući userDetails objekat koji ima isti userId kao trenutni userArticle
              const userDetails = original.userDetails?.find(
                (details: any) => details.userId === userArticle.userId
              );

              return (
                <div key={userArticle.serialNumber} className="user-article-box">
                  <Typography className="user-article-typography">Serijski broj: {userArticle.serialNumber}</Typography>
                  <Typography className="user-article-typography">Inventurni broj: {userArticle.invBroj}</Typography>
                  <Typography className="user-article-typography">Korisnik: {userDetails ? userDetails.fullname : "N/A"}</Typography>
                  <Typography className="user-article-typography">Status: <div className= {"status-" + userArticle.status}> {userArticle.status}</div></Typography>
                  <div className="button-container">
                    <Button
                        variant="contained"
                        color="primary"
                        className="btn-sm"
                        style={{

                        }}
                        onClick={() => {
                          window.location.href = `#/admin/userArticle/${userArticle.userId}/${userArticle.articleId}/${userArticle.serialNumber}`;
                        }}
                      >
                        Pogledaj detalje
                    </Button>
                </div>
                </div>
              );
            })}
          </Box>

        );
      }}
      
      positionExpandColumn="last"
    />
  );
};

export default Tabela;
