import { useState, useEffect } from 'react';
import { NextUIProvider, Button, Card, CardBody,CardHeader, Badge, Tooltip, Listbox, ListboxItem, Table, TableHeader, TableColumn, TableBody, TableCell, TableRow, ListboxSection, ScrollShadow, Link, Popover, PopoverTrigger, PopoverContent  } from '@nextui-org/react';
import api, { ApiResponse } from '../../../API/api';
import Moment from 'moment';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import { useParams, useNavigate } from 'react-router-dom';
import { LangBa } from '../../../config/lang.ba';
import ArticleType from '../../../types/ArticleType';
import saveAs from 'file-saver';
import { ApiConfig } from '../../../config/api.config';
import { Alert } from '../../custom/Alert';

interface UpgradeFeaturesType {
  name: string;
  value: string;
  serialNumber: string;
  comment: string;
  timestamp: string;
}

interface ArticleOnUserPageState {
  message: string;
  article: ArticleType;
  isLoggedIn: boolean;
  errorMessage: string;
  upgradeFeatures: UpgradeFeaturesType[];
}

export default function ArticleOnUserPage() {
  const { serial } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState<ArticleOnUserPageState>({
    message: '',
    article: {} as ArticleType,
    isLoggedIn: true,
    errorMessage: '',
    upgradeFeatures: [],
  });

  const setErrorMessage = (message: string) => {
    setState((prev) => ({ ...prev, message }));
  };

  const setLoggedInState = (isLoggedIn: boolean) => {
    setState((prev) => ({ ...prev, isLoggedIn }));
  };

  const setArticle = (article: ArticleType) => {
    setState((prev) => ({ ...prev, article }));
  };

  const setUpgradeFeatures = (upgradeFeatures: UpgradeFeaturesType[]) => {
    setState((prev) => ({ ...prev, upgradeFeatures }));
  };

  const printOptionalMessage = () => {
    if (state.message === '') {
        return;
    }

    return (
        <Card>
              {state.message}            
        </Card>
    );
}
  
  

  useEffect(() => {
    if (!serial) {
      return;
    }

    if(state.isLoggedIn === false) {
      return (
        navigate('/login')
      )
    } 

    getArticleData(serial as string);
  }, [serial]);

  const getArticleData = (serial: string) => {
    api(`api/article/sb/${serial}`, 'get', {}, 'user').then((res: ApiResponse) => {
      if (res.status === 'error') {
        setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije');
        return;
      }
      if (res.status === 'login') {
        setLoggedInState(false);
        return;
      }

      const data: ArticleType = res.data;
      setErrorMessage('');
      setArticle(data);
    });

    api(`api/upgradeFeature/?filter=serialNumber||$eq||${serial}`, 'get', {}, 'user').then((res: ApiResponse) => {
      setUpgradeFeatures(res.data);
    });
  };

  function badgeStatus (article: ArticleType) {
    let stat:any = article.status;
    let color:any;
    if(stat === LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE) {
        color = 'success'
    } else if(stat === LangBa.ARTICLE_ON_USER.STATUS_DEBT) {
        color = 'warning'
    } else {
        color = 'danger'
    }

    return(
        <Badge content={stat} color={color}> </Badge>
    )
}

  function userDetails(userDet: ArticleType) {
    let stat = userDet.status
    if (stat === LangBa.ARTICLE_ON_USER.STATUS_DEBT) {
        return (<Alert variant='info' title='Info!' body={LangBa.ARTICLE_ON_USER.OBLIGATE_ALERT_INFO} />)
    }
    if (stat === LangBa.ARTICLE_ON_USER.STATUS_DESTROY) {
        return (<Alert variant='danger' title='Info!' body={LangBa.ARTICLE_ON_USER.DESTROY_ALERT_WARNING} />)
    }
    if (stat === LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE) {
        return (
          <div className='mb-3'>
            <span className='ml-2'>Detalji korisnika</span><Listbox key={userDet.user?.userId} className='mt-2 pt-3 bg-gray-800 shadow rounded-2xl'>
            <ListboxItem
              className='w-[95%]'
              key={userDet.user?.fullname!}
              description={<span className='text-tiny text-gray-400'>Naziv korisnika</span>}
            >
              {userDet.user?.fullname}
            </ListboxItem>
            <ListboxItem className='w-[95%]' key={userDet.user?.email!} description={<span className='text-tiny text-gray-400'>Email</span>}>
              {userDet.user?.email}
            </ListboxItem>
            <ListboxItem className='w-[95%]' key={userDet.user?.department?.title!} description={<span className='text-tiny text-gray-400'>Naziv sektora/odjeljenja</span>}>
              {userDet.user?.department?.title}
            </ListboxItem>
            <ListboxItem className='w-[95%]' key={userDet.user?.job?.title!} description={<span className='text-tiny text-gray-400'>Naziv radnog mjesta</span>}>
              {userDet.user?.job?.title}
            </ListboxItem>
            <ListboxItem className='w-[95%]' key={userDet.user?.location?.name!} description={<span className='text-tiny text-gray-400'>Lokacija</span>}>
              {userDet.user?.location?.name}
            </ListboxItem>
          </Listbox>
          </div>
        )
    }
}

  function upgradeFeature(this: any) {
    if (state.upgradeFeatures.length === 0) {
        return (
            <Card className="mb-3">
                <CardHeader className="grid grid-cols-6 gap-4 bg-warning-100" style={{ color:'white'}}>
                        <div className="col-span-5">
                           <i className="bi bi-question-circle" /> Artikal nema nadogradnji
                        </div>
                </CardHeader>
            </Card>
        )
    }
    

    if (state.upgradeFeatures.length !== 0) {
        return (
            <Card className="mb-3">
                <CardHeader className="grid grid-cols-6 gap-4" style={{backgroundColor:"#00695C"}}>
                        <div className="col-span-5 text-sm">
                          {LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.CARD_HEADER2}
                        </div>

                </CardHeader>
                <Listbox>

                {state.upgradeFeatures.map((uf, index) => (
                        <ListboxItem key={index} className='w-[95%] mt-3'>
                            <div className="grid grid-cols gap-2">
                                <div className='col-span-4 flex flex-nowrap'>
                                    <div>
                                        <Popover placement='top' showArrow backdrop='blur'>
                                            <PopoverTrigger>
                                                <i style={{color:"darkgray"}} className="bi bi-info-circle-fill"/>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                {uf.comment} <b>{LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.DATE}</b> {Moment(uf.timestamp).format('DD.MM.YYYY - HH:mm')}
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                <div className='pl-2'><b>{uf.name}: </b> {uf.value}</div>
                            </div>                                
                            </div>
                        </ListboxItem>
                    ), this)}  
                </Listbox>
            </Card>
        )
    }
}

function saveFile (docPath: any) {
  if(!docPath) {
      return (
          <div><Popover placement='right'>
              <PopoverTrigger>
                  <Button size='sm' style={{ backgroundColor: "#9D5353" }}>
                      <i className="bi bi-file-earmark-text" style={{ fontSize: 20, color: "white" }} />
              </Button>
          </PopoverTrigger>
          <PopoverContent>
                  Prenosnica nije generisana
              </PopoverContent>
          </Popover>
          </div>
      )
  }
  if (docPath) {
      const savedFile = (docPath:any) => {
          saveAs(
              ApiConfig.TEMPLATE_PATH + docPath,
              docPath
          );
      }
      return (
          <Link onClick={() => savedFile(docPath)}>
              <i className="bi bi-file-earmark-text" style={{ fontSize: 22, color: "#008b02", cursor:"pointer" }} />
          </Link>
      )
}
}

  function renderArticleData(article: ArticleType) {
    const mappedStockFeatures = state.article.stock?.stockFeatures?.map(stockFeature => ({
        featureId: stockFeature.feature?.featureId || null,
        name: stockFeature.feature?.name || '',
        value: stockFeature.value || ''
      })) || [];

        return (
            <div className="lg:flex">
                <div className="lg:w-8/12 xs:w-full lg:mr-5">
                    <div className="lg:flex">
                        <div className="lg:w-4/12 xs:w-full flex justify-center items-center">
                            <i className={`${article.category?.imagePath}`} style={{ fontSize: 150 }}></i>
                        </div>
                        <div className="lg:w-8/12 xs:w-full">
                            <ScrollShadow hideScrollBar className="w-full h-[250px]">
                                <Listbox items={mappedStockFeatures} variant="bordered">
                                    {(item) => (
                                    <ListboxItem key={item.value}>
                                        <span className="text-bold text-small text-default-400">{item.name}: </span>{item.value}
                                    </ListboxItem>
                                    )}
                                </Listbox>
                            </ScrollShadow>
                            {upgradeFeature()}
                        </div>
                    </div>

                    <div className="lg:flex">
                        <div className="w-full lg:w-12/12 sm:w-12/12">
                            <Card className="mb-3">
                            <CardHeader> <span className='p-2 rounded-lg text-sm bg-gray-800 w-full'>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.DESCRIPTION}</span></CardHeader>
                            <CardBody>
                                <ScrollShadow size={100} hideScrollBar className="w-full max-h-[250px]">
                                {article.stock?.description}
                                </ScrollShadow>
                            </CardBody>
                            </Card>
                        </div>
                    </div>

                <div className="lg:flex mb-3">
                    <Table>
                        <TableHeader>
                          <TableColumn>{LangBa.ARTICLE_ON_USER.TABLE.USER}</TableColumn>
                          <TableColumn>{LangBa.ARTICLE_ON_USER.TABLE.STATUS}</TableColumn>
                          <TableColumn>{LangBa.ARTICLE_ON_USER.TABLE.COMMENT}</TableColumn>
                          <TableColumn>{LangBa.ARTICLE_ON_USER.TABLE.DATE_AND_TIME_ACTION}</TableColumn>
                          <TableColumn>#</TableColumn>
                        </TableHeader>
                        <TableBody>
                        {article.articleTimelines?.map((timeline) => (
                            <TableRow key={timeline.articleTimelineId}>
                            <TableCell>
                                <Link isBlock showAnchorIcon color="primary" href={`#/user/profile/${timeline.userId}`}>
                                {timeline.user?.fullname}
                                </Link>
                            </TableCell>
                            <TableCell>{timeline.status}</TableCell>
                            <TableCell>{timeline.comment}</TableCell>
                            <TableCell>{Moment(timeline.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                            <TableCell>{saveFile(timeline.document?.path)}</TableCell>
                            </TableRow>
                        )) ?? []}
                        </TableBody>
                    </Table>
                </div>
                </div>

                <div className="w-full sm:w-full lg:w-1/3">
                    {userDetails(article)}
                    <div>
                    <Card className="mb-3">
                        <CardHeader className="grid grid-cols-6 gap-4">
                            <div className="col-span-5">{LangBa.ARTICLE_ON_USER.STATUS.STATUS}</div>
                        </CardHeader>
                        <Listbox variant="flat">
                        <ListboxItem key="status">Status: <b>{article.status} </b></ListboxItem>
                        <ListboxItem key="datum-akcije">Datum akcije: {Moment(article.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListboxItem>
                        </Listbox>
                    </Card>
                    </div>
                </div>
            </div>

        );
    }

  return (
    <div>
            <RoledMainMenu />
            <div className="container mx-auto lg:px-4 mt-3 h-max">
                <Card>
                    <CardHeader>
                          <div className='grid grid-cols-12 gap-2 bg-slate-800 rounded-xl p-2'>
                            <div className='col-span-2'>
                                <div className='grid grid-col-2'>
                                  <div>
                                    <i className={state.article.category?.imagePath?.toString()} style={{fontSize: 20}}/>
                                  </div>
                                      
                                  <div className='pl-2 col-start-2 items-center flex'>
                                      {state.article.stock?.name}
                                  </div> 
                              </div>
                            </div>
                            
                            <div className='col-end-13 text-center'>
                                {badgeStatus(state.article)} 
                            </div>
                          </div>
                            
                    </CardHeader>
                    <CardBody>
                            {printOptionalMessage()}

                            {
                                state.article ?
                                    (renderArticleData(state.article)) :
                                    ''
                            }
                            <Card
                                style={{ marginTop: 15 }}
                                className={state.errorMessage ? '' : 'd-none'}>
                                    <CardBody>
                                        <i className="bi bi-exclamation-circle-fill"></i> {state.errorMessage}
                                    </CardBody>
                            </Card>
                    </CardBody>
                </Card>
            </div> 
        </div>
  );
}
