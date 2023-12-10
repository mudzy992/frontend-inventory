import React, { useEffect } from 'react';
import { Col, Container, Row, Badge } from 'react-bootstrap';
import api, { ApiResponse } from '../../../API/api';
import Moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import ApiUserProfileDto from '../../../dtos/ApiUserProfileDto';
import FeaturesType from '../../../types/FeaturesType';
/* import { Redirect } from 'react-router-dom'; */
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import UserType from '../../../types/UserType';
import ArticleType from '../../../types/ArticleType';
import DepartmentByIdType from '../../../types/DepartmentByIdType';
import { Card, CardBody, CardHeader, Link, Table, TableBody, TableCell, TableHeader, TableRow } from '@nextui-org/react';

interface UserProfilePageState {
  user?: UserType;
  users?: UserType;
  message: string;
  article: ArticleType[];
  features: FeaturesType[];
  isLoggedIn: boolean;
  departmentJobs: DepartmentByIdType[];
}

export default function UserProfilePage() {
  const { userID } = useParams();
  const navigate = useNavigate();

  const [state, setState] = React.useState<UserProfilePageState>({
    message: '',
    article: [],
    features: [],
    isLoggedIn: true,
    departmentJobs: [],
  });

  useEffect(() => {
    getUserData();
  }, []);

  const setFeaturesData = (featuresData: FeaturesType[]) => {
    setState((prev) => ({ ...prev, features: featuresData }));
  };

  const setUsers = (userProfileDate: ApiUserProfileDto | undefined) => {
    setState((prev) => ({ ...prev, users: userProfileDate }));
  };

  const setArticleByUser = (articleData: ArticleType[]) => {
    setState((prev) => ({ ...prev, article: articleData }));
  };

  const setErrorMessage = (message: string) => {
    setState((prev) => ({ ...prev, message }));
  };

  const setLogginState = (isLoggedIn: boolean) => {
    setState((prev) => ({ ...prev, isLoggedIn }));
  };

  const getUserData = () => {
    api(`api/user/${userID}`, 'get', {}, 'user').then((res: ApiResponse) => {
      if (res.status === 'error') {
        setUsers(undefined);
        setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije');
        return;
      }
      if (res.status === 'login') {
        return setLogginState(false);
      }

      const data: ApiUserProfileDto = res.data;
      setErrorMessage('');
      setUsers(data);
    });

    api(`api/article/?filter=user.userId||$eq||${userID}`, 'get', {}, 'user').then((res: ApiResponse) => {
      if (res.status === 'login') {
        return setLogginState(false);
      }
      const articleByUser: ArticleType[] = res.data;
      setArticleByUser(articleByUser);
      const features: FeaturesType[] = [];

      for (const start of articleByUser) {
        for (const articleFeature of start.stock?.stockFeatures || []) {
          const value = articleFeature.value;
          const articleId = articleFeature.feature?.articleId;
          const name = articleFeature.feature?.name;

          features.push({ articleId, name, value });
        }
      }
      setFeaturesData(features);
    });
  };

  const printOptionalMessage = () => {
    if (state.message === '') {
      return;
    }
    return <Card>{state.message}</Card>;
  };

  /* if (!state.isLoggedIn) {
    return <Redirect to="/user/login" />;
  } */

  return (
    <div>
      <RoledMainMenu role="user" userId={Number(userID)} />
      <Container style={{ marginTop: 20 }}>
        <Card className="text-white bg-dark">
          <CardHeader>
              <i className="bi bi-card-checklist" /> {state.users ? state.users.fullname : 'Kartica korisnika nije pronađena'}
          </CardHeader>
          <CardBody>
            {printOptionalMessage()}
            {state.users ? renderArticleData(state.users) : ''}
          </CardBody>
        </Card>
      </Container>
    </div>
  );

  function responsibilityArticlesOnUser() {
    if (state.users?.articles?.length === 0) {
      return (
        <div>
          <b>Zadužena oprema</b>
          <br />
          <Card>
            <CardBody>
              Korisnik nema zadužene opreme
            </CardBody>
            </Card>
        </div>
      );
    }
    return (
      <div>
        <b>Zadužena oprema</b>
        <br />
          <Table style={{ minWidth: 700,  maxHeight: 300}} aria-label="sticky table">
            <TableHeader>
              <TableRow>
                <TableCell>Naziv</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Datum zaduženja</TableCell>
                <TableCell>Serijski broj</TableCell>
                <TableCell>Inventoruni broj broj</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(state.users?.articles || [])?.map((ura, index) => 
                <TableRow key={index}>
                  <TableCell>
                    <Link href={`#/user/article/${ura.serialNumber}`} style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                      {ura.stock?.name}
                    </Link>
                  </TableCell>
                  <TableCell>{Moment(ura.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                  <TableCell>{ura.serialNumber}</TableCell>
                  <TableCell>{ura.invNumber}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </div>
    );
  }

  function renderArticleData(user: UserType) {
    return (
      <Row>
        <Col xs="12" lg="3" style={{ backgroundColor: '', padding: 5, paddingLeft: 5 }} key={user.userId}>
          <ul className="list-group" style={{ borderRadius: '--bs-card-border-radius', overflow: 'hidden' }}>
            <div>
              <li className="list-group-item active">
                <b>Detalji korisnika</b>
              </li>
              <li className="list-group-item">Ime: {user.surname}</li>
              <li className="list-group-item">Prezime: {user.forname}</li>
              <li className="list-group-item">Email: {user.email}</li>
              <li className="list-group-item">Sektor: {user.department?.title}</li>
              <li className="list-group-item">Radno mjesto: {user.job?.title}</li>
              <li className="list-group-item">Lokacija: {user.location?.name}</li>
            </div>
          </ul>
        </Col>
        <Col xs="12" lg="9">
          <Row>{articles()}</Row>
          <Row style={{ padding: 5 }}>{responsibilityArticlesOnUser()}</Row>
        </Col>
      </Row>
    );
  }

  function articles() {
    return state.article.map((artikal) => (
      <Col lg="3" xs="6" style={{ paddingTop: 5, paddingLeft: 16 }} key={artikal.articleId}>
        <Card  className="mb-3" style={{ backgroundColor: '#316B83' }}>
          <CardBody style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Badge pill bg="primary">{artikal.category?.name}</Badge>
            {
              <div style={{ fontSize: 11, color: 'white' }}>
                {artikal.stock?.name}
              </div>
            }
            <i className={`${artikal.category?.imagePath}`} style={{ fontSize: 52, color: 'white' }} />
          </CardBody>
        </Card>
      </Col>
    ));
  }
}
