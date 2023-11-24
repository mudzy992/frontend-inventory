import { FC, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import api from "../../../API/api"; 
import Moment from 'moment';
import { Link } from 'react-router-dom';
import { TableContainer, Table, TableBody, TableCell, TableHead,TableRow, Alert, CircularProgress, IconButton, InputBase, TextField, FormControl, InputLabel, OutlinedInput, InputAdornment} from '@mui/material';
import { ArrowForwardIos, ArrowBackIos, Search } from '@mui/icons-material';
import { CgMoreO } from "@react-icons/all-files/cg/CgMoreO";
import './ArticleModal.css';
import { Pagination } from 'react-bootstrap';

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
  user?:{
    userId: number;
    fullname: string;
  }
}

const ArticleModal: FC<ArticleModalProps> = ({ show, onHide, stockId }) => {
  const [userArticleData, setUserArticleData] = useState<ResponsibilityArticleBaseType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
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

  const totalPages = Math.ceil(totalResults / itemsPerPage);
  
  return (
    <Modal 
    show={show} 
    onHide={onHide}
    size='xl'
    >
      <Modal.Header closeButton>
        <Modal.Title>Detalji zaduženja</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ overflowX: 'auto' }}>
      <FormControl className='search-box-modal'>
            <InputLabel htmlFor="pretraga-outlined">Pretraga</InputLabel>
            <OutlinedInput
              id="pretraga-outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              endAdornment={
              <InputAdornment position="end">
                <IconButton
                onClick={handleSearch}
                >
                  <Search />
                </IconButton>
              </InputAdornment>
            }
            label="Pretraga"
            />
          </FormControl>
      {isLoading ? (
        <div style={{display:"flex", justifyContent:"center"}}><CircularProgress /></div>
      ) : userArticleData && userArticleData.length > 0 ? (
        <>
          
        <TableContainer>
              <Table sx={{ minWidth: 650 }} size={'small'} aria-label="caption table">
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
                        <Button
                          variant="contained"
                          color="primary"
                          className="btn-sm"
                          size="sm"
                          onClick={() => {
                            window.location.href = `#/admin/stock/${stockId}/`;
                          } }
                        >
                          <CgMoreO />
                          {/*  Više <i className="bi bi-arrow-bar-right"/> */}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
                <Pagination>
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ArrowBackIos style={{ color: 'black', fontSize: "20px" }} />
                  </Pagination.Prev>
                  <Pagination.Item disabled>{`${currentPage} od ${totalPages}`}</Pagination.Item>
                  <Pagination.Next
                    disabled={currentPage * itemsPerPage >= totalResults}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ArrowForwardIos style={{ color: 'black', fontSize: "20px" }} />
                  </Pagination.Next>
                </Pagination>
              </div></>
      ) : (
        <div style={{marginTop:"10px"}}><Alert severity='info'>Artikal nema zaduženja.</Alert></div>
      )}      
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

