import { useMemo, useRef, useState, useEffect} from 'react';
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Button, TableCell, TableContainer, TableHead, TableRow, TableBody, Paper, Table } from "@mui/material";
import Moment from 'moment';

interface UserArticleBaseType {
    articleId?: number;
    name?: string;
    concract?: string;
    sapNumber?: string;
    articlesInStock?: {
      valueOnConcract: number;
      valueAvailable: number;
    };
    userArticles?: {
        invBroj?: string;
        serialNumber?: string;
        status?: string;
        timestamp?: string;
        userId?: number;
    }[] 
}

export default function TableFunction(props:any) {
  
  const columns = useMemo(
    () => [
      {
        accessorKey: "articleId",
        header: "ID",
        size: 10,
        Cell:({cell}) => (
          <Button
          size="small"
          style={{ marginLeft: 5 }}
          href={`#/article/${cell.getValue()}`} 
        >
          <i className="bi bi-info-circle" style={{fontSize:20}}/>
        </Button>
        )
      },
      {
        accessorKey: "name",
        header: "Naziv opreme"
      },
      {
        accessorKey: "concract",
        header: "Ugovor",
        size: 50
      },
      {
        accessorKey: "sapNumber",
        header: "SAP broj"
      },
      {
        accessorKey: "articlesInStock.valueAvailable",
        header: "Dostupno",
        size: 20,
        Cell:({cell}) => {
          if(cell.getValue() === 0) {
            return (<div style={{color:"red", fontWeight:"bold"}}> <i className="bi bi-exclamation-circle"/> {cell.getValue()}</div>)
          } else {
            return (<div style={{color:"green", fontWeight:"bold"}}><i className="bi bi-check-circle"/> {cell.getValue()}</div>)
          }
        }
      },
    ] as MRT_ColumnDef<UserArticleBaseType>[],
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
          data={props.data}         
          enablePagination={true} //disable a default feature
          onRowSelectionChange={setRowSelection} //hoist internal state to your own state (optional)
          state={{ rowSelection }} //manage your own state, pass it back to the table (optional)
          tableInstanceRef={tableInstanceRef} //get a reference to the underlying table instance (optional)
          renderDetailPanel={({row}) => (
            <>
            <TableContainer component={Paper}>
              <Table>
              <TableHead>
                <TableRow>
                <TableCell>
                  Serijski broj
                  </TableCell>
                  <TableCell>
                  Inventurni broj
                  </TableCell>
                  <TableCell>
                  Status
                  </TableCell>
                  <TableCell>
                  Datum i vrijeme akcije
                  </TableCell>
                  <TableCell>
                  Korisnik
                  </TableCell>
                </TableRow>
              </TableHead>
            
            <TableBody>
              {Array.from(new Set(row.original.userArticles?.map(s => s.serialNumber)))
              .sort()
              .map(serialNumber => {
                return (
                  <>
                  <TableRow key={serialNumber}>
                  <TableCell component="th" scope="row">
                  <Button
                      size="small"
                      style={{ marginLeft: 5 }}
                      href={`#/admin/userArticle/${row.original.userArticles?.find(s => s.serialNumber === serialNumber)?.userId}/${row.original.articleId}/${serialNumber}`} 
                    >
                      {serialNumber}
                    </Button>
                    </TableCell>
                  <TableCell>{row.original.userArticles?.find(s => s.serialNumber === serialNumber)?.invBroj}</TableCell>
                  <TableCell>{row.original.userArticles?.find(s => s.serialNumber === serialNumber)?.status}</TableCell>
                  <TableCell>{Moment(row.original.userArticles?.find(s => s.serialNumber === serialNumber)?.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                  <TableCell>
                  <Button
                      size="small"
                      style={{ marginLeft: 5 }}
                      href={`#/admin/userProfile/${row.original.userArticles?.find(s => s.serialNumber === serialNumber)?.userId}`} 
                    >
                      <i className="bi bi-person-fill" style={{fontSize:20}}/> Profil
                    </Button>
                  </TableCell>
                  </TableRow>
                  </>
                )
              })
              }
              </TableBody>
              </Table>
              </TableContainer>
              </>
      )}
      positionExpandColumn="last"
    />
  );
};
