import React from 'react';
import api, { ApiResponse } from '../../../API/api';
import { Alert, Badge, Card, Col, Container, ListGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import { Table, TableContainer, TableHead, TableRow, TableBody, TableCell } from "@mui/material";
import Moment from 'moment';
import FeaturesType from '../../../types/FeaturesType';
import ArticleTimelineType from '../../../types/ArticleTimelineType';
import ArticleByUserType from '../../../types/ArticleByUserType';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import UserType from '../../../types/UserType';
import { LangBa } from '../../../config/lang.ba';

interface ArticleOnUserPageProperties {
    match: {
        params: {
            userID: number;
            articleId: number;
            serial: string;
        }
    }
}

interface upgradeFeaturesType {
    name: string;
    value: string;
    serialNumber: string;
    comment: string;
    timestamp: string;
}

interface ArticleOnUserPageState {
    user: UserType[];
    message: string;
    article: ArticleByUserType[];
    features: FeaturesType[];
    articleTimeline: ArticleTimelineType[];
    upgradeFeature: upgradeFeaturesType[],
    isLoggedIn: boolean;
    errorMessage: string;
    changeStatus: {
        userId: number;
        articleId: number;
        value: number | null;
        comment: string;
        serialNumber: string;
        status: string;
    }

}

export default class ArticleOnUserPage extends React.Component<ArticleOnUserPageProperties> {
    state: ArticleOnUserPageState;

    constructor(props: Readonly<ArticleOnUserPageProperties>) {
        super(props);
        this.state = {
            message: "",
            user: [],
            features: [],
            articleTimeline: [],
            upgradeFeature: [],
            article: [],
            isLoggedIn: true,
            errorMessage: '',
            changeStatus: {
                userId: 0,
                articleId: 0,
                value: null,
                comment: '',
                serialNumber: '',
                status: '',
            },
        }
    }

    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message,
        }));
    }

    private setLogginState(isLoggedIn: boolean) {
        this.setState(Object.assign(this.state, {
            isLoggedIn: isLoggedIn,
        }));
    }

    private setArticle(articleData: ArticleByUserType[]) {
        this.setState(Object.assign(this.state, {
            article: articleData
        }))
    }
    
    private setUser(userData: UserType[]) {
        this.setState(Object.assign(this.state, {
            user: userData,
        }));
    }

    private setFeaturesData(featuresData: FeaturesType[]) {
        this.setState(Object.assign(this.state, {
            features: featuresData
        }))
    }

    private setArticleTimelineData(articleTimelineData: ArticleTimelineType[]) {
        this.setState(Object.assign(this.state, {
            articleTimeline: articleTimelineData
        }))
    }

    private setUpgradeFeature(upgradeFeatureData: upgradeFeaturesType[]) {
        this.setState(Object.assign(this.state, {
            upgradeFeature: upgradeFeatureData
        }))
    }

    componentDidMount() {
        this.getArticleData()
    }

    componentDidUpdate(oldProperties: ArticleOnUserPageProperties) {
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */
        if (oldProperties.match.params.articleId === this.props.match.params.articleId) {
            return;
        }
        this.getArticleData();
    }

    private getArticleData() {
        api('api/articleTimeline/?filter=serialNumber||$eq||' + this.props.match.params.serial + '&sort=timestamp,DESC', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    this.setFeaturesData([]);
                    this.setErrorMessage(LangBa.ARTICLE_ON_USER.ERR_READ_CATEGORY)
                    return;
                }
                if (res.status === 'login') {
                    return this.setLogginState(false);
                }

                this.setArticleTimelineData(res.data)
            })
            
        api('api/article/?filter=articleId||$eq||' + this.props.match.params.articleId +
            '&filter=userDetails.userId||$eq||' + this.props.match.params.userID +
            '&join=userArticles&filter=userArticles.serialNumber||$eq||' + this.props.match.params.serial +
            '&sort=userArticles.timestamp,DESC', 'get', {}, 'user')
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    this.setFeaturesData([]);
                    this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                    return;
                }
                if (res.status === 'login') {
                    return this.setLogginState(false);
                }

                const data: ArticleByUserType[] = res.data;
                this.setErrorMessage('')
                this.setArticle(data)
                const features: FeaturesType[] = [];

                for (const start of data) {
                    for (const articleFeature of start.articleFeature) {
                        const value = articleFeature.value;
                        let name = '';

                        for (const feature of start.features) {
                            if (feature.featureId === articleFeature.featureId) {
                                name = feature.name;
                                break;
                            }
                        }

                        features.push({ name, value });
                    }
                }
                this.setFeaturesData(features);
            })

        api('api/user/?filter=userId||$eq||' + this.props.match.params.userID, 'get', {}, 'user')
        .then((res: ApiResponse) => {
            if (res.status === 'error') {
                this.setFeaturesData([]);
                this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                return;
            }
            if (res.status === 'login') {
                return this.setLogginState(false);
            }
            this.setUser(res.data)
        })

        api('api/upgradeFeature/?filter=serialNumber||$eq||' + this.props.match.params.serial, 'get', {}, 'user')
        .then((res: ApiResponse) => {
            this.setUpgradeFeature(res.data)
        })
    }

    private printOptionalMessage() {
        if (this.state.message === '') {
            return;
        }

        return (
            <Card.Text>
                {this.state.message}
            </Card.Text>
        );
    }

    render() {
        if (this.state.isLoggedIn === false) {
            return (
                <Redirect to="/user/login" />
            );
        }
        return (
            <>
                <RoledMainMenu role='user' />
                <Container style={{ marginTop: 15 }}>
                    <Card className="text-white bg-dark">
                        <Card.Header >
                            <Card.Title >
                                <Container>
                                    <Row>
                                        <Col lg="12" xs="12" sm="12" md="12" style={{ display: "flex", justifyContent: "start", }}>
                                        <i className="bi bi-card-checklist" style={{ marginRight: 5 }}/>{
                                                this.state.article ?
                                                    this.state.article.map :
                                                    'Article not found'
                                            }
                                            {this.state.article.map(ar => (ar.name))}
                                            {this.badgeStatus(this.state.article)}
                                        </Col>
                                    </Row>
                                </Container>
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Card.Text>
                                {this.printOptionalMessage()}

                                {
                                    this.state.article ?
                                        (this.renderArticleData(this.state.article)) :
                                        ''
                                }

                                <Alert variant="danger"
                                    style={{ marginTop: 15 }}
                                    className={this.state.errorMessage ? '' : 'd-none'}>
                                    <i className="bi bi-exclamation-circle-fill"></i>  {this.state.errorMessage}
                                </Alert>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Container>
            </>
        )
    }

    private badgeStatus(article: ArticleByUserType[]) {
        let stat = ""
        article.map(ua => stat = (ua.userArticles[ua.userArticles.length - ua.userArticles.length + 0]).status)
        if (stat === "zaduženo") {
            return (
                <Badge pill bg="success" style={{ marginLeft: 10, alignItems: "center", display: "flex", fontSize: 12 }}>
                    {stat}
                </Badge>)
        }
        if (stat === "razduženo") {
            return (
                <Badge pill bg="warning" text="dark" style={{ marginLeft: 10, alignItems: "center", display: "flex", fontSize: 12 }}>
                    {stat}
                </Badge>)
        }
        if (stat === "otpisano") {
            return (
                <Badge pill bg="danger" style={{ marginLeft: 10, alignItems: "center", display: "flex", fontSize: 12 }}>
                    {stat}
                </Badge>)
        }

    }

    private userDetails(userDet: UserType[]) {
        let stat = ""
        /* userDet.map(ua => stat = (ua.userArticles[ua.userArticles.length - ua.userArticles.length + 0]).status) */

        if (stat === 'razduženo') {
            return (<Alert variant='info'> Nema podataka o korisniku, oprema razdužena</Alert>)
        }
        if (stat === 'otpisano') {
            return (<Alert variant='warning'> Nema podataka o korisniku, oprema otpisana</Alert>)
        }
        if (stat === 'zaduženo') {
            return (
                <Row>
                    <Col>
                        <Card bg="success" text="white" className="mb-2">
                            <Card.Header>Detalji korisnika</Card.Header>
                            <ListGroup variant="flush" >
                            <><ListGroup.Item>Ime: {userDet.map(usr => (usr.surname))}</ListGroup.Item>
                                    <ListGroup.Item>Prezime: {userDet.map(usr => (usr.forname))}</ListGroup.Item>
                                    <ListGroup.Item>Email: {userDet.map(usr => (usr.email))}</ListGroup.Item>
                                    <ListGroup.Item>Sektor: {userDet.map(usr => (usr.department?.title))}</ListGroup.Item>
                                    <ListGroup.Item>Radno mjesto: {userDet.map(usr => (usr.job?.title))}</ListGroup.Item>
                                    <ListGroup.Item>Lokacija: {userDet.map(usr => (usr.location?.name))}</ListGroup.Item>
                                </>
                            </ListGroup>
                        </Card>
                    </Col>
                </Row>
            )
        }
    }

    private upgradeFeature() {
        if (this.state.upgradeFeature.length === 0) {
            return (
                <Row>
                    <Col>
                        <Card bg="dark" text="light" className="mb-3">
                            <Card.Header style={{backgroundColor:"#00695C", borderBottomLeftRadius:"0.25rem", borderBottomRightRadius:"0.25rem"}}>
                                {LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.CARD_HEADER}
                            </Card.Header>
                        </Card>
                    </Col>
                </Row>
            )
        }
        if (this.state.upgradeFeature.length !== 0) {
            return (
                <Row>
                    <Col>
                        <Card bg="dark" text="light" className="mb-3">
                            <Card.Header style={{backgroundColor:"#00695C"}}>
                                {LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.CARD_HEADER2}
                            </Card.Header>
                            <ListGroup variant="flush" >
                            {this.state.upgradeFeature.map(uf => (
                                    <ListGroup.Item style={{ display: "flex", alignItems: "center"}}>
                                        <b>{uf.name}: </b> {uf.value}
                                        <OverlayTrigger 
                                        placement="top"
                                        delay={{ show: 250, hide: 400 }}
                                        overlay={
                                        <Tooltip id="tooltip-kolicina">{uf.comment} <b>{LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.DATE}</b> {Moment(uf.timestamp).format('DD.MM.YYYY - HH:mm')}</Tooltip>
                                        }>
                                        <Badge bg='success' pill style={{marginLeft:"5px", fontSize:"11px"}}>?</Badge></OverlayTrigger>
                                    </ListGroup.Item>
                                ), this)}
                            </ListGroup>
                        </Card>
                    </Col>
                </Row>
            
            )
        }
    }

    renderArticleData(article: ArticleByUserType[]) {
        return (
            <Row>
                <Col xs="12" lg="8">
                    <Row>
                        <Col xs="12" lg="4" sm="4" style={{ justifyContent: 'center', alignItems: "center", display: "flex" }}>
                            <i className={`${article.map(cat => (cat.category.imagePath))}`} style={{ fontSize: 150 }}></i>
                        </Col>
                        <Col xs="12" lg="8" sm="8">
                            <Card bg="dark" text="light" className="mb-3">
                                <Card.Header>Detalji opreme</Card.Header>
                                <ListGroup variant="flush" >
                                    {this.state.features.map(feature => (
                                        <ListGroup.Item>
                                            <b>{feature.name}:</b> {feature.value}
                                        </ListGroup.Item>
                                    ), this)}
                                    <ListGroup.Item>
                                            <b>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.SERIALNUMBER} </b>{this.state.articleTimeline.map(art => ([art.serialNumber])).shift()}</ListGroup.Item> 
                                </ListGroup>
                            </Card>
                            {this.upgradeFeature()}
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col xs="12" lg="12" sm="12">
                            <Card bg="dark" text="light" className="mb-3">
                                <Card.Header>Detaljan opis</Card.Header>
                                <Card.Body style={{ borderRadius: "0 0 calc(.25rem - 1px) calc(.25rem - 1px)", background: "white", color: "black" }}>{article.map(desc => (desc.description))}</Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Card className="mb-3">
                                <TableContainer style={{ maxHeight: 300, overflowY: 'auto' }} component={Paper}>
                                    <Table sx={{ minWidth: 700 }} stickyHeader aria-label="sticky table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Korisnik</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Komentar</TableCell>
                                                <TableCell>Serijski broj</TableCell>
                                                <TableCell>SAP broj</TableCell>
                                                <TableCell sortDirection='desc'>Datum i vrijeme akcije</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {this.state.articleTimeline?.map(articleTimeline => (
                                                <TableRow hover>
                                                    <TableCell>{articleTimeline.user?.surname} {articleTimeline.user?.forname}</TableCell>
                                                    <TableCell>{articleTimeline.status}</TableCell>
                                                    <TableCell>{articleTimeline.comment}</TableCell>
                                                    <TableCell>{articleTimeline.serialNumber}</TableCell>
                                                    <TableCell>{articleTimeline.article?.sapNumber}</TableCell>
                                                    <TableCell >{Moment(articleTimeline.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <Col sm="12" xs="12" lg="4" >
                    {this.userDetails(this.state.user)}
                    <Row>
                        <Col>
                            <Card bg="light" text="dark" className=" mb-2">
                                <Card.Header>
                                    <Row>
                                        <Col lg="9" xs="9" sm="9" md="9" style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                                            Status
                                        </Col>
                                    </Row>
                                </Card.Header>
                                <ListGroup variant="flush">
                                    <>
                                        <ListGroup.Item>Status: <b>{article.map(nesto => (nesto.userArticles[nesto.userArticles.length - nesto.userArticles.length + 0].status))} </b></ListGroup.Item>
                                        <ListGroup.Item>Datum akcije:  {article.map(nesto => (Moment(nesto.userArticles[nesto.userArticles.length - nesto.userArticles.length + 0].timestamp)).format('DD.MM.YYYY. - HH:mm'))} </ListGroup.Item>
                                    </>
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                    
                </Col>
            </Row>
        );
    }
}
