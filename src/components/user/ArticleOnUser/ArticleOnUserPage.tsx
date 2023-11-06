import React from 'react';
import api, { ApiResponse } from '../../../API/api';
import { Alert, Badge, Card, Col, Container, ListGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import { Table, TableContainer, TableHead, TableRow, TableBody, TableCell } from "@mui/material";
import Moment from 'moment';
import FeaturesType from '../../../types/FeaturesType';
import ArticleTimelineType from '../../../types/ArticleTimelineType';
import UserArticleDto from '../../../dtos/UserArticleDto';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import UserType from '../../../types/UserType';
import { LangBa } from '../../../config/lang.ba';
import ArticleType from '../../../types/ArticleType';


interface ArticleOnUserPageProperties {
    match: {
        params: {
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
    userArticle: UserArticleDto[];
    message: string;
    article: ArticleType;
    users: UserType[];
    isLoggedIn: boolean;
    errorMessage: string;
    changeStatus: {
        visible: boolean;
        userId: number | null;
        articleId: number | null;
        comment: string;
        serialNumber: string;
        invNumber: string;
        status: string;
    },
    upgradeFeature: upgradeFeaturesType[],
}

export default class ArticleOnUserPage extends React.Component<ArticleOnUserPageProperties> {
    state: ArticleOnUserPageState;

    constructor(props: Readonly<ArticleOnUserPageProperties>) {
        super(props);
        this.state = {
            message: "",
            users: [],
            article: {},
            isLoggedIn: true,
            errorMessage: '',
            changeStatus: {
                userId: Number(),
                articleId: 0,
                comment: '',
                serialNumber: '',
                invNumber: '',
                status: '',
                visible: false,
            },
            userArticle: [],
            upgradeFeature: [], 
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

    private setArticle(articleData: ArticleType[]) {
        this.setState(Object.assign(this.state, {
            article: articleData
        }))
    }

    private setUserArticle(userArticleData: UserArticleDto[]) {
        this.setState(Object.assign(this.state, {
            userArticle: userArticleData
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
        if (oldProperties.match.params.serial === this.props.match.params.serial) {
            return;
        }
        this.getArticleData();
    }

    private getArticleData() {
        api(`api/article/sb/${this.props.match.params.serial}`, 'get', {}, 'user')
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                    return;
                }
                if (res.status === 'login') {
                    return this.setLogginState(false);
                }

                const data: ArticleType[] = res.data;
                this.setErrorMessage('')
                this.setArticle(data)
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
            <div>
                <RoledMainMenu role='user' userId={this.state.article.userId} /> /* ovaj dio oko preusmjeravanja id ne radi kako treba */
                <Container style={{ marginTop: 15 }}>
                    <Card className="text-white bg-dark">
                        <Card.Header >
                            <Card.Title >
                                <Container>
                                <Row>
                                        <Col lg="12" xs="12" sm="12" md="12" style={{ display: "flex", justifyContent: "start", }}>
                                            
                                        <i className={this.state.article.category?.imagePath?.toString()} style={{fontSize: 20, marginRight: 5}}/>

                                            {this.state.article.stock?.name}
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
            </div>
        )
    }

    private badgeStatus(article: ArticleType) {

        let stat:any = article.status;
        
        if (stat === LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE) {
            return (
                <Badge pill bg="success" style={{ marginLeft: 10, alignItems: "center", display: "flex", fontSize: 12 }}>
                    {stat}
                </Badge>)
        }
        if (stat === LangBa.ARTICLE_ON_USER.STATUS_DEBT) {
            return (
                <Badge pill bg="warning" text="dark" style={{ marginLeft: 10, alignItems: "center", display: "flex", fontSize: 12 }}>
                    {stat}
                </Badge>)
        }
        if (stat === LangBa.ARTICLE_ON_USER.STATUS_DESTROY) {
            return (
                <Badge pill bg="danger" style={{ marginLeft: 10, alignItems: "center", display: "flex", fontSize: 12 }}>
                    {stat}
                </Badge>)
        }

    }

    private userDetails(userDet: ArticleType) {
        let stat = userDet.status
        if (stat === LangBa.ARTICLE_ON_USER.STATUS_DEBT) {
            return (<Alert variant='info'> {LangBa.ARTICLE_ON_USER.OBLIGATE_ALERT_INFO}</Alert>)
        }
        if (stat === LangBa.ARTICLE_ON_USER.STATUS_DESTROY) {
            return (<Alert variant='warning'> {LangBa.ARTICLE_ON_USER.DESTROY_ALERT_WARNING}</Alert>)
        }
        if (stat === LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE) {
            return (
                <Row>
                    <Col>
                        <Card bg="success" text="white" className="mb-2">
                            <Card.Header>{LangBa.ARTICLE_ON_USER.CARD_HEADER_USER_DETAILS}</Card.Header>
                            <ListGroup variant="flush" >
                                <div>  
                                <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.NAME + userDet.user?.surname} </ListGroup.Item>
                                    <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.LASTNAME + userDet.user?.forname} </ListGroup.Item>
                                    <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.EMAIL + userDet.user?.email} </ListGroup.Item>
                                    <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.DEPARTMENT + userDet.user?.department?.title} </ListGroup.Item>
                                    <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.JOBNAME + userDet.user?.job?.title} </ListGroup.Item>
                                </div>
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
                        <Alert variant="info">
                            Artikal nema dostupnih nadogradnji.
                        </Alert>
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

    renderArticleData(article: ArticleType) {
        return (
            <Row>
                <Col xs="12" lg="8">
                    <Row>
                    <Col xs="12" lg="4" sm="4" style={{ justifyContent: 'center', alignItems: "center", display: "flex" }}>
                            <i className={`${article.category?.imagePath}`} style={{ fontSize: 150 }}></i>
                        </Col>
                        <Col xs="12" lg="8" sm="8">
                            <Card bg="dark" text="light" className="mb-3">
                                <Card.Header>Detalji opreme</Card.Header>
                                <ListGroup variant="flush" >
                                        {this.state.article.stock?.stockFeatures?.map((artFeature, index) => (
                                            <ListGroup.Item key={index}>
                                                <b>{artFeature.feature?.name}:</b> {artFeature.value}
                                            </ListGroup.Item>
                                        ))}
                                            <ListGroup.Item>
                                                <b>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.SERIALNUMBER} </b>{this.state.article.serialNumber}
                                            </ListGroup.Item> 
                                            <ListGroup.Item>
                                                <b>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.INV_NUMBER} </b>{this.state.article.invNumber}
                                            </ListGroup.Item> 
                                </ListGroup>
                            </Card>
                            {this.upgradeFeature()}
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col xs="12" lg="12" sm="12">
                            <Card bg="dark" text="light" className="mb-3">
                                <Card.Header>Detaljan opis</Card.Header>
                                <Card.Body style={{ borderRadius: "0 0 calc(.25rem - 1px) calc(.25rem - 1px)", background: "white", color: "black" }}>{article.stock?.description}</Card.Body>
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
                                                <TableCell>Inventurni broj</TableCell>
                                                <TableCell sortDirection='desc'>Datum i vrijeme akcije</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                        {article.articleTimelines?.map(timeline => (
                                                <TableRow hover>
                                                    <TableCell>{timeline.user?.fullname}</TableCell>
                                                    <TableCell>{timeline.status}</TableCell>
                                                    <TableCell>{timeline.comment}</TableCell>
                                                    <TableCell>{timeline.serialNumber}</TableCell>
                                                    <TableCell>{timeline.invNumber}</TableCell>
                                                    <TableCell >{Moment(timeline.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
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
                        {this.userDetails(article)}
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
                                <div>
                                        <ListGroup.Item key="status">Status: <b>{article.status} </b></ListGroup.Item>
                                        <ListGroup.Item key="datum-akcije">Datum akcije:  {Moment(article.timestamp).format('DD.MM.YYYY. - HH:mm')} </ListGroup.Item>
                                    </div>
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                    
                </Col>
            </Row>
        );
    }
}
