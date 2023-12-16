import { FC, useEffect, useState } from 'react';
import api from "../../../API/api"; 
import Moment from 'moment';
import { ApiConfig } from '../../../config/api.config';
import saveAs from 'file-saver';
import { Chip, ChipProps, Input,Table, Pagination, Link, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';

interface StockTableProps {
  stockId: number;
}

interface ResponsibilityArticleBaseType {
  serialNumber: string;
  invNumber: string;
  status: 'zaduženo' | 'razduženo' | 'otpisano';
  timestamp: string;
  articleId: number;
  user?: {
    userId: number;
    fullname: string;
  };
  documents?: {
    path: string;
  }[]; 
  // Unija tipova za user i documents
  additionalProperties?: string | number | { userId: number; fullname: string } | { documents?: { path: string }[] };
}

const statusColorMap: Record<string, { color: ChipProps["color"]; startContent: string }> = {
  zaduženo: { color: "success", startContent: "bi bi-check-circle" },
  razduženo: { color: "warning", startContent: "bi bi-exclamation-circle" },
  otpisano: { color: "warning", startContent: "bi bi-x-circle" },
};

const ArticleInStockTable: FC<StockTableProps> = ({ stockId }) => {
  const [userArticleData, setUserArticleData] = useState<ResponsibilityArticleBaseType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn] = useState(true);
  const [itemsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    stockArticleData();
  }, [stockId, itemsPerPage, currentPage]);

  const stockArticleData = async () => {
    setIsLoading(true);
    try {
      const res = await api(`api/article/s/${stockId}?perPage=${itemsPerPage}&page=${currentPage}&query=${searchQuery}`, "get", {}, "administrator");

      if (res.status === "error") {
        console.error("Greška prilikom dohvaćanja dodatnih podataka:", res.data);
      } else if (res.status === "login") {
        console.log("Korisnik nije prijavljen.");
      } else {
        setUserArticleData(res.data.results);
        setTotalResults(Math.max(0, res.data.total));
      }
    } catch (error) {
      console.error("Greška pri dohvaćanju podataka:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setCurrentPage(1)
      stockArticleData();
    }
  };
  
  const saveFile = (path: string) => {
    saveAs(ApiConfig.TEMPLATE_PATH + path, path);
  };

  const totalPages = Math.ceil(totalResults / itemsPerPage);


  return (
    <div> {/* kolona div */}
        <div className='mb-3'>
              <Input
                variant="bordered"
                type="text"
                isClearable
                placeholder="Pronađi artikal..."
                value={searchQuery}
                onClear={() => setSearchQuery("")} 
                onValueChange={(value) => setSearchQuery(value || "")}
                onKeyDown={handleKeyPress}
              />           
          </div>
          <Table
            aria-label="Article modal tabela"
            isHeaderSticky
            className='mb-3'
            classNames={{
              wrapper: "max-h-[382px]",
            }}
           
          >
            <TableHeader>
              <TableColumn key="fullname">Ime i prezime</TableColumn>
              <TableColumn key="sapNumber">Serijski broj</TableColumn>
              <TableColumn key="invNumber">Inventurni broj</TableColumn>
              <TableColumn key="timestamp">Status</TableColumn>
              <TableColumn key="status">Datum akcije</TableColumn>
              <TableColumn key="path">Datum akcije</TableColumn>
            </TableHeader>
            <TableBody items={userArticleData}>
              {(item) => {
                const { color, startContent } = statusColorMap[item.status];
                return userArticleData.length > 0 ? (
                  <TableRow key={item.serialNumber}>
                    <TableCell key={item.user?.fullname}>
                      <Link href={`#/admin/user/${item.user?.userId}`}>
                        {item.user?.fullname}
                      </Link>
                    </TableCell>
                    <TableCell key={item.serialNumber}>
                      <Link href={`#/admin/article/${item.serialNumber}`}>
                        {item.serialNumber}
                      </Link>
                    </TableCell>
                    <TableCell key={item.invNumber}>{item.invNumber}</TableCell>
                    <TableCell key={item.status}><Chip color={color} variant="bordered" startContent={<i className={startContent}></i>}> {item.status}</Chip></TableCell>
                    <TableCell key={item.timestamp}>{Moment(item.timestamp).format("DD.MM.YYYY. - HH:mm")}</TableCell>
                    <TableCell key='path'>
                {item.documents && item.documents.length > 0 ? (
                <Link href="#" onClick={() => item.documents && item.documents.length > 0 && saveFile(item.documents[0]?.path)}>
                  <i className="bi bi-file-earmark-text" style={{ fontSize: 22, color: "#008b02", cursor: "pointer" }} />
                  </Link>
                  
                 ) : (
                   <div>
                    <Tooltip id="tooltip-prenosnica" content={'Prenosnica nije generisana'}>
                      <i className="bi bi-file-earmark-text" style={{ fontSize: 22, color: "red" }} />
                      </Tooltip>
                     </div>
                   )}
                   </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={'nema'}>
                    <TableCell key='artikala' colSpan={5}>Nema artikala</TableCell>
                  </TableRow>
                );
              }}
            </TableBody>
          </Table>
          <div className="flex justify-center">
            <Pagination
              showControls
              showShadow
              page={currentPage}
              total={totalPages}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
    </div>
  )
};

export default ArticleInStockTable;
