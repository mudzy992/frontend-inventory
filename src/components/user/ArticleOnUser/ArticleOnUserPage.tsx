import { useState, useEffect } from 'react';
import { NextUIProvider, Button, Card, CardBody,CardHeader, Badge, Tooltip, Listbox, ListboxItem  } from '@nextui-org/react';
import api, { ApiResponse } from '../../../API/api';
import Moment from 'moment';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import { useParams, useNavigate } from 'react-router-dom';
import { LangBa } from '../../../config/lang.ba';
import ArticleType from '../../../types/ArticleType';
import { Col, Row } from 'react-bootstrap';

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
      return null;
    }

    return <Card><CardBody>{state.message}</CardBody></Card>;
  };

  useEffect(() => {
    if (!serial) {
      return;
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

  const badgeStatus = (status: string) => {
    const statusColors: Record<string, string> = {
      [LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE]: 'success',
      [LangBa.ARTICLE_ON_USER.STATUS_DEBT]: 'warning',
      [LangBa.ARTICLE_ON_USER.STATUS_DESTROY]: 'danger',
    };

    return (
      <Badge shape="circle" /* color={statusColors[status]} */ style={{ marginLeft: 10, alignItems: 'center', display: 'flex', fontSize: 12 }}>
        {status}
      </Badge>
    );
  };

  const userDetails = (userDet: ArticleType) => {
    const stat = userDet.status;

    if (stat === LangBa.ARTICLE_ON_USER.STATUS_DEBT) {
      return <Card> <CardBody>{LangBa.ARTICLE_ON_USER.OBLIGATE_ALERT_INFO}</CardBody></Card>;
    }

    if (stat === LangBa.ARTICLE_ON_USER.STATUS_DESTROY) {
      return <Card> <CardBody>{LangBa.ARTICLE_ON_USER.DESTROY_ALERT_WARNING}</CardBody></Card>;
    }

    if (stat === LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE) {
      return (
        <Card className="mb-2">
          <CardHeader>{LangBa.ARTICLE_ON_USER.CARD_HEADER_USER_DETAILS}</CardHeader>
          <Listbox>
                  <ListboxItem key={'name'} >{LangBa.ARTICLE_ON_USER.USER_DETAILS.NAME + userDet.user?.surname}</ListboxItem>
                  <ListboxItem key={'lastname'} >{LangBa.ARTICLE_ON_USER.USER_DETAILS.LASTNAME + userDet.user?.forname}</ListboxItem>
                  <ListboxItem key={'email'} >{LangBa.ARTICLE_ON_USER.USER_DETAILS.EMAIL + userDet.user?.email}</ListboxItem>
                  <ListboxItem key={'department'} >{LangBa.ARTICLE_ON_USER.USER_DETAILS.DEPARTMENT + userDet.user?.department?.title}</ListboxItem>
                  <ListboxItem key={'jobname'} >{LangBa.ARTICLE_ON_USER.USER_DETAILS.JOBNAME + userDet.user?.job?.title}</ListboxItem>
          </Listbox>
        </Card>
      );
    }
  };

  const upgradeFeature = () => {
    if (state.upgradeFeatures.length === 0) {
      return (
        <Card className="mb-3">
          <CardBody>
              <Badge>{LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.CARD_HEADER}</Badge>
          </CardBody>
        </Card>
      );
    }

    return (
      <Card className="mb-3">
        <CardHeader style={{ backgroundColor: '#00695C' }}>
          {LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.CARD_HEADER2}
        </CardHeader>
        <CardBody>
          <ul>
            {state.upgradeFeatures.map((uf) => (
              <li key={uf.serialNumber} style={{ display: 'flex', alignItems: 'center' }}>
                <b>{uf.name}:</b> {uf.value}
                <Tooltip content={`${uf.comment} ${LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.DATE} ${Moment(uf.timestamp).format(
                  'DD.MM.YYYY - HH:mm'
                )}`}>
                  <Badge shape="circle" style={{ marginLeft: '5px', fontSize: '11px' }}>
                    ?
                  </Badge>
                </Tooltip>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    );
  };

  const renderArticleData = (article: ArticleType) => {
    return (
      <Row>
        <Col xs="12" lg="8">
          <Row>
            <Col xs="12" lg="4" sm="4" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
              <i className={`${article.category?.imagePath}`} style={{ fontSize: 150 }}></i>
            </Col>
            <Col xs="12" lg="8" sm="8">
              <Card className="mb-3">
                <CardHeader>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.CARD_HEADER}</CardHeader>
                <CardBody>
                  <ul>
                    {article.stock?.stockFeatures?.map((artFeature, index) => (
                      <li key={index}>
                        <b>{artFeature.feature?.name}:</b> {artFeature.value}
                      </li>
                    ))}
                    <li>
                      <b>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.SERIALNUMBER}</b> {article.serialNumber}
                    </li>
                    <li>
                      <b>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.INV_NUMBER}</b> {article.invNumber}
                    </li>
                  </ul>
                </CardBody>
              </Card>
              {upgradeFeature()}
            </Col>
          </Row>

          <Row>
            <Col xs="12" lg="12" sm="12">
              <Card className="mb-3">
                <CardHeader>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.DESCRIPTION}</CardHeader>
                <CardBody style={{ borderRadius: '0 0 calc(.25rem - 1px) calc(.25rem - 1px)', background: 'white', color: 'black' }}>
                  {article.stock?.description}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col sm="12" xs="12" lg="4">
          {userDetails(article)}
          <Row>
            <Col>
              <Card className=" mb-2">
                <CardHeader>
                  <Row>
                    <Col lg="9" xs="9" sm="9" md="9" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                      {LangBa.ARTICLE_ON_USER.USER_DETAILS.STATUS}
                    </Col>
                  </Row>
                </CardHeader>
                <ul>
                  <li key="status">
                    Status: <b>{article.status} </b>
                  </li>
                  <li key="datum-akcije">
                    Datum akcije: {Moment(article.timestamp).format('DD.MM.YYYY. - HH:mm')}{' '}
                  </li>
                </ul>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col sm="12" xs="12" lg="12">
          <Card className="mb-3">
            <ul>
              {/* {article.articleTimelines?.map((timeline) => (
                <li key={timeline.timestamp}>
                  <b>{timeline.user?.fullname}</b>  {timeline.status}{' '}
                  {LangBa.ARTICLE_ON_USER.WITH_COMMENT_LABEL} {timeline.comment} {LangBa.ARTICLE_ON_USER.SERIAL_LABEL} {timeline.serialNumber}{' '}
                  {LangBa.ARTICLE_ON_USER.INV_LABEL} {timeline.invNumber} {LangBa.ARTICLE_ON_USER.ON_DATE_LABEL}{' '}
                  {Moment(timeline.timestamp).format('DD.MM.YYYY. - HH:mm')}
                </li>
              ))} */}
            </ul>
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <NextUIProvider>
      <div>
        <RoledMainMenu role="user" userId={state.article ? state.article.userId : undefined} />
          <Card>
            <CardHeader>
                <Row>
                  <Col lg="12" xs="12" sm="12" md="12" style={{ display: 'flex', justifyContent: 'start' }}>
                    <i className={state.article.category?.imagePath?.toString()} style={{ fontSize: 20, marginRight: 5 }} />
                    {state.article.stock?.name}
                    {state.article.status && badgeStatus(state.article.status)}
                  </Col>
                </Row>
            </CardHeader>
            <CardBody>
              {printOptionalMessage()}

              {state.article ? renderArticleData(state.article) : ''}

              {state.errorMessage && (
                  <Badge>
                    <i className="bi bi-exclamation-circle-fill"></i> {state.errorMessage}
                  </Badge>
              )}
            </CardBody>
          </Card>
      </div>
    </NextUIProvider>
  );
}
