import React, { useEffect } from 'react';
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
import { Card, CardBody, CardHeader, Chip, Link, Listbox, ListboxItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';

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
    if(state.isLoggedIn === false) {
      return (
        navigate('/login')
      )
    } 
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

  const getUserData = async () => {
    try {
      const userResponse = await api(`api/user/${userID}`, 'get', {}, 'user');
      handleApiResponse(userResponse, setUsers, 'Greška prilikom učitavanja korisnika.');
  
      const articleResponse = await api(`api/article/?filter=user.userId||$eq||${userID}`, 'get', {}, 'user');
      handleApiResponse(articleResponse, setArticleByUser, 'Greška prilikom učitavanja artikala.');
      
      const articleByUser = articleResponse.data || [];
      const features = [];
  
      for (const start of articleByUser) {
        for (const articleFeature of start.stock?.stockFeatures || []) {
          const value = articleFeature.value;
          const articleId = articleFeature.feature?.articleId;
          const name = articleFeature.feature?.name;
  
          features.push({ articleId, name, value });
        }
      }
  
      setFeaturesData(features);
    } catch (error) {
      console.error('Greška prilikom dohvaćanja podataka:', error);
      setLogginState(false);
      setErrorMessage('Došlo je do greške. Osvježite ili pokušajte ponovo kasnije.');
    }
  };
  
  const handleApiResponse = (response:any, setter:any, errorMessage:string) => {
    if (response.status === 'error' || response.status === 'login') {
      setLogginState(false);
      return;
    }
  
    const data = response.data || [];
    setter(data);
  };
  

  const printOptionalMessage = () => {
    if (state.message === '') {
      return;
    }
    return <Card>{state.message}</Card>;
  };

  return (
    <>
      <RoledMainMenu />
      <div className="container mx-auto lg:px-4 mt-3 h-max">
        <Card className="text-white bg-dark">
          <CardHeader>
            <i className="bi bi-card-checklist mr-2" /> {state.users ? state.users.fullname : 'Kartica korisnika nije pronađena'}
          </CardHeader>
          <CardBody>
            {printOptionalMessage()}
            {state.users ? renderArticleData(state.users) : ''}
          </CardBody>
        </Card>
      </div>
    </>
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
      <div className="xs:w-full">
        <b>Zadužena oprema</b>
        <br />
          <Table aria-label="sticky table">
            <TableHeader>
                <TableColumn>Naziv</TableColumn>
                <TableColumn>Datum zaduženja</TableColumn>
                <TableColumn>Serijski broj</TableColumn>
                <TableColumn>Inventoruni broj broj</TableColumn>
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
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="lg:w-4/12 xs:w-full mb-3">
          <span className='ml-2'>Detalji korisnika</span>
          <Listbox aria-label="Odaberi opciju" key={user.userId} className='mt-2 pt-3 bg-gray-800 shadow rounded-2xl'>
              <ListboxItem 
                className='w-[95%]'
                key={user.fullname!} 
                description={<span className='text-tiny text-gray-400'>Naziv korisnika</span>}
                >
                {user.fullname}
              </ListboxItem>
              <ListboxItem className='w-[95%]' key={user.email!} description={<span className='text-tiny text-gray-400'>Email</span>}>
                {user.email}
              </ListboxItem>
              <ListboxItem className='w-[95%]' key={user.department?.title!} description={<span className='text-tiny text-gray-400'>Naziv sektora/odjeljenja</span>}>
                {user.department?.title}
              </ListboxItem>
              <ListboxItem className='w-[95%]' key={user.job?.title!} description={<span className='text-tiny text-gray-400'>Naziv radnog mjesta</span>}>
                {user.job?.title}
              </ListboxItem>
              <ListboxItem className='w-[95%]' key={user.location?.name!} description={<span className='text-tiny text-gray-400'>Lokacija</span>}>
                {user.location?.name}
              </ListboxItem>
          </Listbox>
        </div>
        <div className="lg:w-8/12 xs:w-full flex flex-col gap-3">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {articles()}
          </div>
          <div>{responsibilityArticlesOnUser()}</div>
        </div>
      </div>
    );
  }

  function articles() {
    return state.article.map((artikal) => (
      <div key={artikal.articleId} className="mb-3">
        <Card className="w-full bg-cyan-950">
          <CardBody className="flex flex-col items-center">
            <Chip color='primary' size='sm'>{artikal.category?.name}</Chip>
            <div style={{ fontSize: 11, color: 'white' }}>{artikal.stock?.name}</div>
            <i className={`${artikal.category?.imagePath}`} style={{ fontSize: 52, color: 'white' }} />
          </CardBody>
        </Card>
      </div>
    ));
  }
}
