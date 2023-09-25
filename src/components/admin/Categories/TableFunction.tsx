import React, { FC, useMemo } from "react";
import { Link } from "react-router-dom";
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
        //simple accessorFn that works the same way as an `accessorKey`
        accessorKey: "articleId",
        id: 'articleId',
        header: '',
        Cell: ({ cell }) => <>
        <Button
          variant="contained"
          color="primary" 
          onClick={() => {
            window.location.href = `#/article/${cell.getValue<string>()}/`;
          }}
        >
          Pogledaj detalje
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
            <Typography>
              Nema dostupnih artikala ili informacija o korisniku za proširenje.
            </Typography>
          );
        }
      
        return (
          <Box
            sx={{
              display: "grid",
              margin: "auto",
              gridTemplateColumns: "1fr 1fr",
              width: "100%",
              padding: "2px"
            }}
          >
            {original.userArticles?.map((userArticle: any) => (
              <div
                key={userArticle.serialNumber}
                className="user-article-box"
              >
                <Typography>Serijski broj: {userArticle.serialNumber}</Typography>
                <Typography>Inventurni broj: {userArticle.invBroj}</Typography>
                <Typography className={`status-${userArticle.status}`}>
                  Status: {userArticle.status}
                </Typography>
                <Link
                  to={`/admin/userArticle/${userArticle.userId}/${userArticle.articleId}/${userArticle.serialNumber}`}
                  className="user-article-link"
                >
                  Pogledaj detalje
                </Link>
              </div>
            ))}
          </Box>
        );
      }}
      
      positionExpandColumn="last"
    />
  );
};

export default Tabela;
