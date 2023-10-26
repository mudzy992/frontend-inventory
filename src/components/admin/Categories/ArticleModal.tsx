import { FC, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import api from "../../../API/api"; 
import Moment from 'moment';
import { Link } from 'react-router-dom';
import { TableContainer, TextField, Paper, Table, TableBody, TableCell, TableHead,TableRow, Alert, CircularProgress} from '@mui/material';

import './ArticleModal.css';

interface ArticleModalProps {
  show: boolean;
  onHide: () => void;
  stockId: number;
}

interface ResponsibilityArticleBaseType {
  serialNumber: string;
  invNumber: string;
  status: 'zaduženo' | 'razduženo' | 'otpisano';
  timestamp: string;
  articleId: number;
  user:{
    userId: number;
    fullname: string;
  }
}

const ArticleModal: FC<ArticleModalProps> = ({ show, onHide, stockId }) => {
  const [userArticleData, setUserArticleData] = useState<ResponsibilityArticleBaseType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ResponsibilityArticleBaseType[] | null>(null);

  useEffect(() => {
    if (show) {
      setIsLoading(true);
      // Ažurirajte API poziv za korištenje 'page' umjesto 'offset'
      api(`api/article/s/${stockId}?perPage=${itemsPerPage}&page=${currentPage}&query=${searchQuery}`, 'get', {}, 'administrator')
        .then((res) => {
          if (res.status === 'error') {
            console.error('Greška prilikom dohvaćanja dodatnih podataka:');
          } else {
            // Ažurirajte state s novim podacima
            setUserArticleData(res.data.results as ResponsibilityArticleBaseType[]);
            setTotalResults(res.data.total); // Postavite ukupan broj rezultata
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Greška pri dohvaćanju podataka:', error);
          setIsLoading(false);
        });
    }
  }, [show, stockId, itemsPerPage, currentPage]);

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

  return (
    <Modal 
    show={show} 
    onHide={onHide}
    size='lg'
    >
      <Modal.Header closeButton>
        <Modal.Title>Detalji zaduženja</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ overflowX: 'auto' }}>
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

        <i style={{fontSize:"20px"}} className="bi bi-search" />
        </Button>
      </div>
      {isLoading ? (
        <div style={{display:"flex", justifyContent:"center"}}><CircularProgress /></div>
      ) : userArticleData && userArticleData.length > 0 ? (
        <TableContainer >
        <Table sx={{ minWidth: 650 }} aria-label="caption table">
          <TableHead>
            <TableRow>
              <TableCell>Korisnik</TableCell>
              <TableCell>Serijski broj</TableCell>
              <TableCell>Inv. Broj</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Datum</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userArticleData.map((article, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                <Link to={`/admin/userProfile/${article.user.userId}`}>
                {article.user.fullname}
                </Link>
                  
                </TableCell>
                <TableCell >
                  <Link to={`/admin/userArticle/${article.user.userId}/${article.articleId}/${article.serialNumber}`}>
                  {article.serialNumber}
                </Link>
                </TableCell>
                <TableCell >{article.invNumber}</TableCell>
                <TableCell >{article.status}</TableCell>
                <td>{Moment(article.timestamp).format('DD.MM.YYYY. - HH:mm')}</td>
                <TableCell  >
                      <Button
                      variant="contained"
                      color="primary"
                      className="btn-sm"
                      onClick={() => {
                        window.location.href = `#/article/${article.articleId}/`;
                      }}
                    >
                      Detalji opreme
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      ) : (
        <div style={{marginTop:"10px"}}><Alert severity='info'>Artikal nema zaduženja.</Alert></div>
      )}

      <div style={{display:"flex", justifyContent:"center", alignItems:"center", marginTop:"10px"}}>
        <Button style={{marginRight:"3px"}} variant="secondary" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
        <i className="bi bi-caret-left-fill" />
        </Button>
        {currentPage} od {Math.ceil(totalResults / itemsPerPage)}
        <Button style={{marginLeft:"3px"}} variant="secondary" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage * itemsPerPage >= totalResults}>
        <i className="bi bi-caret-right-fill" />
        </Button>
      </div>
</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Zatvori
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ArticleModal;

