import React, { FC, useMemo } from "react";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Box, Typography } from "@mui/material";


interface UserArticleBaseType {
    articleId?: number;
    name?: string;
    excerpt?: string;
    sapNumber?: string;
    articles?: {
        invBroj?: string;
        serialNumber?: string;
        status?: string;
        timestamp?: string;
        userId?: number;
    }[]
}

const data: UserArticleBaseType[] = [
        {articleId: 2,
        name: "string",
        excerpt: "string",
        sapNumber: "string",
        articles: [{
            invBroj: "dfsd",
            serialNumber: "string",
            status: "string",
            timestamp: "string",
            userId: 1,
    }]}
];

const Tabela: FC = () => {
  const columns = useMemo<MRT_ColumnDef[]>(
    () => [
      {
        accessorKey: "articleId",
        header: "ID",
        size: 50
      },
      {
        accessorKey: "name",
        header: "First Namde"
      },
      {
        accessorKey: "excerpt",
        header: "Middle Name"
      },
      {
        accessorKey: "sapNumber",
        header: "Last Name"
      }
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
      initialState={{ expanded: true }}
      renderDetailPanel={({ row }) => (
        <Box
          sx={{
            display: "grid",
            margin: "auto",
            gridTemplateColumns: "1fr 1fr",
            width: "100%"
          }}
        >
           {/*  {row.original.articles?.map(cc => (
                <Typography>Address: {rc.}</Typography>
            ))} */}
          
        </Box>
      )}
      positionExpandColumn="last"
    />
  );
};

export default Tabela;