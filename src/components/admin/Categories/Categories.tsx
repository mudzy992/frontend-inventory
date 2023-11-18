import React, { useEffect, useState } from 'react';
import { Alert, Card, Col, Container, Row } from 'react-bootstrap';
import { Link, Redirect, useParams } from 'react-router-dom';
import api from '../../../API/api';
import StockType from '../../../types/UserArticleType';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import Tabela from './TableFunction';

interface CategoryPageState {
  category?: CategoryType;
  subCategory: CategoryType[];
  message: string;
  stocks: StockType[];
}

interface CategoryDto {
  categoryId: number;
  name: string;
  imagePath: string;
  stocks: {
    stockId: number;
    name: string;
    excerpt: string;
    description: string;
    concract: string;
    categoryId: number;
    sapNumber: string;
    valueOnContract: number;
    valueAvailable: number;
    timestamp: string;
  }[];
}

interface CategoryType {
  categoryId?: number;
  name?: string;
  imagePath?: string;
  stocks?: {
    stockId: number;
    name: string;
    excerpt: string;
    description: string;
    concract: string;
    categoryId: number;
    sapNumber: string;
    valueOnContract: number;
    valueAvailable: number;
    timestamp: string;
  }[];
}

const CategoryPage: React.FC = () => {
  const { categoryID } = useParams<{ categoryID: string }>();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [state, setState] = useState<CategoryPageState>({
    subCategory: [],
    message: '',
    stocks: [],
  });

    useEffect(() => {
    const getCategoriesData = async () => {
      try {
        const response = await api(`api/category/${categoryID}`, 'get', {}, 'administrator');
        
        if (response.status === 'login') {
          setIsLoggedIn(false);
          return;
        }

        if (response.status === 'error') {
          return setErrorMessage(
            'Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije'
          );
        }

        const categoryData: CategoryType = {
          categoryId: response.data.categoryId,
          name: response.data.name,
          imagePath: response.data.imagePath,
          stocks: response.data.stocks,
        };

        setCategoryData(categoryData);

        const subcategories: CategoryType[] = response.data.categories.map(
          (category: CategoryDto) => ({
            categoryId: category.categoryId,
            name: category.name,
            imagePath: category.imagePath,
            stocks: category.stocks,
          })
        );
        setSubcategories(subcategories);
      } catch (error) {
        return setErrorMessage(
          'Greška prilikom učitavanja pod-kategorije. Osvježite ili pokušajte ponovo kasnije. Greška: ' + error
        );
      }
    };

    getCategoriesData();
  }, [categoryID]);

  const setErrorMessage = (message: string) => {
    setState((prevState) => ({ ...prevState, message }));
  };

  const setCategoryData = (category: CategoryType) => {
    setState((prevState) => ({ ...prevState, category }));
  };

  const setSubcategories = (subcategories: CategoryType[]) => {
    setState((prevState) => ({ ...prevState, subCategory: subcategories }));
  };

  const printErrorMessage = () => {
    if (!state.message) {
      return null;
    }

    return (
      <Alert variant="error" style={{ marginTop: 15 }}>
        <i className="bi bi-exclamation-circle-fill" /> {state.message}
      </Alert>
    );
  };

  const showSubcategories = () => {
    if (state.subCategory.length === 0) {
      return (
        <Alert variant="info" style={{ marginTop: 15 }}>
        <i className="bi bi-info-circle" /> Nema podkategorija
      </Alert>
      )  
    }

    return (
      <Row>
        <h5 style={{ marginLeft: 10, marginBottom: 8, color: 'white' }}>
          <i className="bi bi-list-nested" /> Podkategorije
        </h5>
        {printErrorMessage()}
        {state.subCategory.map(singleCategory)}
      </Row>
    );
  };

  const singleCategory = (category: CategoryType) => (
    <Col lg="2" md="4" sm="6" xs="6" key={category.categoryId}>
      <Card className="bg-dark text-white mb-3">
        <Card.Header>
          <Card.Title>{category.name}</Card.Title>
        </Card.Header>
        <Card.Body style={{ display: 'flex', justifyContent: 'center' }}>
          <i className={category.imagePath} style={{ fontSize: 60 }}></i>
        </Card.Body>
        <Card.Footer style={{ display: 'flex', justifyContent: 'center' }}>
          <small>
            <Link
              to={`/category/${category.categoryId}`}
              className="btn btn-block btn-sm"
            >
              Prikaži kategoriju
            </Link>
          </small>
        </Card.Footer>
      </Card>
    </Col>
  );
  

  const showArticles = () => {
    if (!state.category) {
      return (
        <div>Nema opreme definisane za ovu kategoriju.</div>
      );
    }
  
    if (!state.category || state.category.stocks?.length === 0) {
      return (
        <div>Nema opreme definisane za ovu kategoriju.</div>
      );
    }
  
    return <Tabela categoryId={categoryID} />;
  };
  
  if(isLoggedIn === false) {
    return (
      <Redirect to="/admin/login" />
    )
  }

  return (
    <div>
      <RoledMainMenu role="administrator" />
      <Container style={{ marginTop: 15 }}>
      <Row className={state.category?.stocks?.length && state.category.stocks.length > 0 ? '' : 'd-none'}>
          <h5 style={{ marginLeft: 10, marginBottom: 8, color: 'white' }}>
            <i className="bi bi-list" />
            {state.category?.name}
          </h5>
          <div>{showArticles()}</div>
        </Row>

        <Row style={{ marginTop: 25 }}>
          <div>{showSubcategories()}</div>
        </Row>
      </Container>
    </div>
  );
};

export default CategoryPage;
