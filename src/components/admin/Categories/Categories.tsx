import React, { useEffect, useState } from 'react';
import { Alert, Card, Col, Container, Row } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import api, { ApiResponse } from '../../../API/api';
import CategoryType from '../../../types/CategoryType';
import UserArticleType from '../../../types/UserArticleType';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import Tabela from './TableFunction';

interface CategoryPageState {
  category?: CategoryType;
  subCategory: CategoryType[];
  message: string;
  articles: UserArticleType[];
}

interface CategoryDto {
  categoryId: number;
  name: string;
  imagePath: string;
}

const CategoryPage: React.FC = () => {
  const { categoryID } = useParams<{ categoryID: string }>();
  const [state, setState] = useState<CategoryPageState>({
    subCategory: [],
    message: '',
    articles: [],
  });

  useEffect(() => {
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

  const setArticles = (articles: UserArticleType[]) => {
    setState((prevState) => ({ ...prevState, articles }));
  };

  const getCategoriesData = () => {
    api(`api/category/${categoryID}`, 'get', {}, 'administrator').then(
      (res: ApiResponse) => {
        if (res.status === 'error') {
          return setErrorMessage(
            'Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije'
          );
        }

        const categoryData: CategoryType = {
          categoryId: res.data.categoryId,
          name: res.data.name,
          imagePath: res.data.imagePath,
        };

        setCategoryData(categoryData);

        const subcategories: CategoryType[] = res.data.categories.map(
          (category: CategoryDto) => ({
            categoryId: category.categoryId,
            name: category.name,
            imagePath: category.imagePath,
          })
        );

        setSubcategories(subcategories);
      }
    );

    api(
      `api/article/?filter=categoryId||$eq||${categoryID}`,
      'get',
      {},
      'administrator'
    ).then((res: ApiResponse) => {
      if (res.status === 'error') {
        return setErrorMessage(
          'Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije'
        );
      }

      setArticles(res.data);
    });
  };

  const printErrorMessage = () => {
    if (!state.message) {
      return null;
    }

    return (
      <Alert variant="error" style={{ marginTop: 15 }}>
        <i className="bi bi-exclamation-circle-fill"></i> {state.message}
      </Alert>
    );
  };

  const showSubcategories = () => {
    if (state.subCategory.length === 0) {
      return null;
    }

    return (
      <Row>
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
    if (state.articles.length === 0) {
      return (
        <div>Nema opreme definisane za ovu kategoriju.</div>
      );
    }

    return <Tabela data={state.articles} />;
  };

  return (
    <div>
      <RoledMainMenu role="administrator" />
      <Container style={{ marginTop: 15 }}>
        <Row className={state.articles.length > 0 ? '' : 'd-none'}>
          <h5 style={{ marginLeft: 10, marginBottom: 8, color: 'white' }}>
            <i className="bi bi-list" />
            {state.category?.name}
          </h5>
          <div>{showArticles()}</div>
        </Row>

        <Row style={{ marginTop: 25 }}>
          <h5 style={{ marginLeft: 10, marginBottom: 8, color: 'white' }}>
            <i className="bi bi-list-nested" /> Podkategorije
          </h5>
          <div>{showSubcategories()}</div>
        </Row>
      </Container>
    </div>
  );
};

export default CategoryPage;
