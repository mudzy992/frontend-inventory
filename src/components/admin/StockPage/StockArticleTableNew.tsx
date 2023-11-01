import React, { FC, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import api from "../../../API/api"; 
import Moment from 'moment';
import { TableContainer, TextField, Table, TableBody, TableCell, TableHead, TableRow, Alert, CircularProgress, Card } from '@mui/material';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ApiConfig } from '../../../config/api.config';
import saveAs from 'file-saver';

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
  }[]
}

const ArticleInStockTable: FC<StockTableProps> = ({ stockId }) => {
  const [userArticleData, setUserArticleData] = useState<ResponsibilityArticleBaseType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    api(`api/article/s/${stockId}?perPage=${itemsPerPage}&page=${currentPage}&query=${searchQuery}`, 'get', {}, 'administrator')
      .then((res) => {
        if (res.status === 'error') {
          console.error('Greška prilikom dohvaćanja dodatnih podataka:', res.data);
        } else {
          setUserArticleData(res.data.results as ResponsibilityArticleBaseType[]);
          setTotalResults(res.data.total); // Postavite ukupan broj rezultata
          console.log(res.data.results)
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Greška pri dohvaćanju podataka:', error);
        setIsLoading(false);
      });
  }, [stockId, itemsPerPage, currentPage, searchQuery]);

  const handleSearch = () => {
    setIsLoading(true);
    api(`api/article/s/${stockId}?perPage=${itemsPerPage}&page=${currentPage}&query=${searchQuery}`, 'get', {}, 'administrator')
      .then((res) => {
        if (res.status === 'error') {
          console.error('Greška prilikom pretrage:', res.data);
        } else {
          setUserArticleData(res.data.results as ResponsibilityArticleBaseType[]);
          setTotalResults(res.data.total); // Postavite ukupan broj rezultata
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Greška pri dohvaćanju podataka:', error);
        setIsLoading(false);
      });
  };
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const saveFile = (path: string) => {
    saveAs(ApiConfig.TEMPLATE_PATH + path, path);
  };

  return (
    <Card>
      <div className='search-box-modal'>
        <TextField 
          id="outlined-search" 
          label="Pretraga" 
          type="search" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <Button className='important-button' variant="secondary" onClick={handleSearch}>
          <i style={{ fontSize: "20px" }} className="bi bi-search" />
        </Button>
      </div>
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      ) : userArticleData && userArticleData.length > 0 ? (
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="caption table">
            <TableHead>
              <TableRow>
                <TableCell>Korisnik</TableCell>
                <TableCell>Serijski broj</TableCell>
                <TableCell>Inv. Broj</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Dokument</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userArticleData.map((article, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {article.user ? (
                      <Link to={`/admin/userProfile/${article.user.userId}`}>
                        {article.user.fullname}
                      </Link>
                    ) : <span className='status-razduženo'>Skladište</span>}
                  </TableCell>
                  <TableCell>
                    <Link to={`/admin/user/${article.serialNumber}`}>
                      {article.serialNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{article.invNumber}</TableCell>
                  <TableCell className={`status-${article.status}`}>{article.status}</TableCell>
                  <TableCell>{Moment(article.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                  <TableCell>
                    
                  {article.documents && article.documents.length > 0 ? (
                  <Link to="#" onClick={() => article.documents && article.documents.length > 0 && saveFile(article.documents[0]?.path)}>
                    <i className="bi bi-file-earmark-text" style={{ fontSize: 22, color: "#008b02", cursor: "pointer" }} />
                  </Link>
                  
                  ) : (
                    <div>
                      <Link to="#">
                        <OverlayTrigger
                          placement="top"
                          delay={{ show: 250, hide: 400 }}
                          overlay={
                            <Tooltip id="tooltip-prenosnica">Prenosnica nije generisana</Tooltip>
                          }
                        >
                          <i className="bi bi-file-earmark-text" style={{ fontSize: 22, color: "red" }} />
                        </OverlayTrigger>
                      </Link>
                    </div>
                  )}



                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <div style={{ marginTop: "10px" }}>
          <Alert severity='info'>Artikal nema zaduženja.</Alert>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
        <Button size="sm" style={{ marginRight: "3px" }} variant="secondary" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          <i className="bi bi-caret-left-fill" />
        </Button>
        {currentPage} od {Math.ceil(totalResults / itemsPerPage)}
        <Button size="sm" style={{ marginLeft: "3px" }} variant="secondary" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage * itemsPerPage >= totalResults}>
          <i className="bi bi-caret-right-fill" />
        </Button>
      </div>
    </Card>
  );
};

export default ArticleInStockTable;
