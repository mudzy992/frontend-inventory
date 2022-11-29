import { useMemo, useRef, useState, useEffect} from 'react';
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Button, TableCell, TableHead, TableRow, TableBody, Table, Card } from "@mui/material";
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
    }[];
    userDetails?: {
      userId: number;
      fullname: string;
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
    <>
    <Card>
    <MaterialReactTable
          columns={columns}
          data={props.data}         
          enablePagination={true} //disable a default feature
          onRowSelectionChange={setRowSelection} //hoist internal state to your own state (optional)
          state={{ rowSelection }} //manage your own state, pass it back to the table (optional)
          tableInstanceRef={tableInstanceRef} //get a reference to the underlying table instance (optional)
          renderDetailPanel={({row}) => (
            <Card variant="outlined" style={{backgroundColor:"#3E4149"}}>
              <Table>
              <TableHead>
                <TableRow style={{}}>
                <TableCell style={{color:"white", borderColor:"#444F5A"}}>
                  Serijski broj
                  </TableCell>
                  <TableCell style={{color:"white", borderColor:"#444F5A"}}>
                  Inventurni broj
                  </TableCell>
                  <TableCell style={{color:"white", borderColor:"#444F5A"}}>
                  Status
                  </TableCell>
                  <TableCell style={{color:"white", borderColor:"#444F5A"}}>
                  Datum i vrijeme akcije
                  </TableCell>
                  <TableCell style={{color:"white", borderColor:"#444F5A"}}>
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
                  <TableCell component="th" scope="row" style={{borderColor:"#444F5A"}}>
                  <Button
                      size="small"
                      style={{ marginLeft: 5, color:"#9ED5C5"}}
                      href={`#/admin/userArticle/${row.original.userArticles?.find(s => s.serialNumber === serialNumber)?.userId}/${row.original.articleId}/${serialNumber}`} 
                    >
                      {serialNumber}
                    </Button>
                    </TableCell>
                  <TableCell style={{color:"white", borderColor:"#444F5A"}}>{row.original.userArticles?.find(s => s.serialNumber === serialNumber)?.invBroj}</TableCell>
                  <TableCell style={{color:"white", borderColor:"#444F5A"}}>{row.original.userArticles?.find(s => s.serialNumber === serialNumber)?.status}</TableCell>
                  <TableCell style={{color:"white", borderColor:"#444F5A"}}>{Moment(row.original.userArticles?.find(s => s.serialNumber === serialNumber)?.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                  <TableCell style={{borderColor:"#444F5A"}}>
                  <Button
                      size="small"
                      style={{ marginLeft: 5, color:"#9ED5C5"}}
                      className={row.original.userArticles?.find(s => s.serialNumber === serialNumber && s.status === "zaduženo")?.userId ? '': 'd-none'}
                      href={`#/admin/userProfile/${row.original.userArticles?.find(s => s.serialNumber === serialNumber)?.userId}`} 
                    >
                      
                      <i className="bi bi-person-fill" style={{fontSize:20}}/> Profil
                    </Button>
                  </TableCell>
                  <TableCell style={{borderColor:"#444F5A"}}>
                  <Button
                      size="small"
                      style={{ marginLeft: 5, color:"#9ED5C5"}}
                      /* className={row.original.userArticles?.find(s => s.serialNumber === serialNumber && s.status === "zaduženo")?.userId ? '': 'd-none'} */
                      href={`#/admin/userProfile/${row.original.userDetails?.find(s => s.userId === s.userId)?.fullname}`} 
                    >
                      
                      <i className="bi bi-person-fill" style={{fontSize:20}}/> Profil
                    </Button>
                  </TableCell>
                  
                  </TableRow>
                  </>
                )
              })
              }
              {row.original.userDetails?.map(sa => {
                    return (<p>{sa.fullname} ssad</p>)
                  })}
              </TableBody>
              </Table>
              </Card>
      )}
      positionExpandColumn="last"
    /></Card></>
  );
};
