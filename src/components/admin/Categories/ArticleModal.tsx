import { FC, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import api from "../../../API/api"; 
import Moment from 'moment';
import { Link } from 'react-router-dom';

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
  const [itemsPerPage, setItemsPerPage] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ResponsibilityArticleBaseType[] | null>(null);

  useEffect(() => {
    if (show) {
      setIsLoading(true);
      // Ažurirajte API poziv za korištenje 'page' umjesto 'offset'
      api(`api/article/s/${stockId}?perPage=${itemsPerPage}&page=${currentPage}`, 'get', {}, 'administrator')
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
    // Napravite API poziv za pretragu koristeći `searchQuery`
    api(`api/article/search/${stockId}?perPage=${itemsPerPage}&page=${currentPage}&query=${searchQuery}`, 'get', {}, 'administrator')
      .then((res) => {
        if (res.status === 'error') {
          console.error('Greška prilikom pretrage:', res.data);
        } else {
          // Ažurirajte stanje s rezultatima pretrage
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
      <div>
        <input
          type="text"
          placeholder="Pretraga..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <Button variant="secondary" onClick={handleSearch}>
          Pretraži
        </Button>
      </div>
  {isLoading ? (
    <div>Učitavanje...</div>
  ) : userArticleData && userArticleData.length > 0 ? (
    <table className='table'>
      <thead>
        <tr>
          <th>Korisnik</th>
          <th>Serijski broj</th>
          <th>Inv. Broj</th>
          <th>Status</th>
          <th>Datum</th>
        </tr>
      </thead>
      <tbody>
        {userArticleData.map((article, index) => (
          <tr key={index}>
            <td>
            <Link to={`/admin/userProfile/${article.user.userId}`}>
            {article.user.fullname}
            </Link>
              
            </td>
            <td>
              <Link to={`/admin/userArticle/${article.user.userId}/${article.articleId}/${article.serialNumber}`}>
              {article.serialNumber}
            </Link>
            </td>
            <td>{article.invNumber}</td>
            <td>{article.status}</td>
            <td>{Moment(article.timestamp).format('DD.MM.YYYY. - HH:mm')}</td>
            <td style={{ border: "none" }}>
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
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <div>Artikal nema zaduženja.</div>
  )}

      <div>
        <Button variant="secondary" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Prethodna stranica
        </Button>
        {currentPage} od {Math.ceil(totalResults / itemsPerPage)}
        <Button variant="secondary" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage * itemsPerPage >= totalResults}>
          Sljedeća stranica
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

