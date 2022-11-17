import React, { useMemo, useRef, useState, useEffect, FC } from 'react';
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



export default function TableFunction(dataUser:UserArticleBaseType[]) {
  const data: UserArticleBaseType[] = dataUser;
  /* const data:UserArticleBaseType[] = [
    {
    articleId: 2,
    name: "Naziv2",
    excerpt: "Opis",
    sapNumber: "string",
    articles: [{
        invBroj: "dfsd",
        serialNumber: "s23131",
        status: "string",
        timestamp: "string",
        userId: 1,
        }]
    },
  ]; */

  const columns = useMemo<MRT_ColumnDef<UserArticleBaseType>[]>(
    () => [
      {
        accessorKey: "name",
        header: "ID",
        size: 50
      },
      {
        accessorKey: "excerpt",
        header: "First Namde"
      },
      {
        accessorKey: "sapNumber",
        header: "Middle Name"
      },
      {
        accessorKey: "articleId",
        header: "Last Name"
      }
    ],
    []
  );

   //optionally, you can manage any/all of the table state yourself
   const [rowSelection, setRowSelection] = useState({});

   useEffect(() => {
     //do something when the row selection changes
   }, [rowSelection]);
 
   //Or, optionally, you can get a reference to the underlying table instance
   const tableInstanceRef = useRef(null);

  return (
    <MaterialReactTable
          columns={columns} 
          data={data} 
          enableColumnOrdering //enable some features
          enableRowSelection 
          enablePagination={false} //disable a default feature
          onRowSelectionChange={setRowSelection} //hoist internal state to your own state (optional)
          state={{ rowSelection }} //manage your own state, pass it back to the table (optional)
          tableInstanceRef={tableInstanceRef} //get a reference to the underlying table instance (optional)
          
          renderDetailPanel={({ row }) => (
        <Box
          sx={{
            display: "grid",
            margin: "auto",
            gridTemplateColumns: "1fr 1fr",
            width: "100%"
          }}
        >
          {row.original.articles?.map(expand => (
            <Typography>Address: {expand.serialNumber}</Typography>
          ))}
          
           {/* {row.original.map(cc => (
                <Typography>Address: {cc.serialNumber}</Typography>
            ))} */}
          
        </Box>
      )}
      positionExpandColumn="last"
    />
  );
};