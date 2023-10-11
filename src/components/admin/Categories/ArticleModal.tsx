import React, { FC, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import api from "../../../API/api"; 
import Moment from 'moment';
import { Link } from 'react-router-dom';

interface ArticleModalProps {
  show: boolean;
  onHide: () => void;
  articleId: number;
}

interface UserArticleBaseType {
  serialNumber: string;
  invBroj: string;
  status: 'zaduženo' | 'razduženo' | 'otpisano';
  timestamp: string;
  articleId: number;
  user:{
    userId: number;
    fullname: string;
  }
}

const ArticleModal: FC<ArticleModalProps> = ({ show, onHide, articleId }) => {
  const [userArticleData, setUserArticleData] = useState<UserArticleBaseType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Dodali smo isLoading state

  useEffect(() => {
    if (show) {
      setIsLoading(true); // Postavljamo isLoading na true prije poziva API-ja
      // Dohvatite podatke sa novog API-ja na temelju articleId
      api(`api/userArticle/?filter=articleId||$eq||${articleId}`, 'get', {}, 'administrator')
        .then((res) => {
          if (res.status === 'error') {
            console.error('Greška prilikom dohvaćanja dodatnih podataka:');
          } else {
            // Ažurirajte state s novim podacima
            setUserArticleData(res.data as UserArticleBaseType[]);
          }
          setIsLoading(false); // Postavljamo isLoading na false nakon završetka API poziva
        })
        .catch((error) => {
          console.error('Greška pri dohvaćanju podataka:', error);
          setIsLoading(false); // Postavljamo isLoading na false u slučaju greške
        });
    }
  }, [show, articleId]);

  return (
    <Modal 
    show={show} 
    onHide={onHide}
    size='lg'
    >
      <Modal.Header closeButton>
        <Modal.Title>Detalji zaduženja</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
        {userArticleData.map((userArticle, index) => (
          <tr key={index}>
            <td>
            <Link to={`/admin/userProfile/${userArticle.user.userId}`}>
            {userArticle.user.fullname}
            </Link>
              
            </td>
            <td>
              <Link to={`/admin/userArticle/${userArticle.user.userId}/${userArticle.articleId}/${userArticle.serialNumber}`}>
              {userArticle.serialNumber}
            </Link>
            </td>
            <td>{userArticle.invBroj}</td>
            <td>{userArticle.status}</td>
            <td>{Moment(userArticle.timestamp).format('DD.MM.YYYY. - HH:mm')}</td>
            <td style={{ border: "none" }}>
                  <Button
                  variant="contained"
                  color="primary"
                  className="btn-sm"
                  onClick={() => {
                    window.location.href = `#/article/${articleId}/`;
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

