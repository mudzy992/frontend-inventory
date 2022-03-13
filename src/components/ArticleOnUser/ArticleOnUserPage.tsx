import { faExclamationTriangle, faListCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import api, { ApiResponse } from '../../API/api';
import { Alert, Badge, Button, Card, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import FeaturesType from '../../types/FeaturesType';
import Moment from 'moment';
import { Table, TableContainer, TableHead, TableRow, TableBody, TableCell } from "@mui/material";
import ArticleTimelineType from '../../types/ArticleTimelineType';
import Paper from '@mui/material/Paper';
import ArticleByUserType from '../../types/ArticleByUserType';
import { Redirect } from 'react-router-dom';
import UserArticleType from '../../types/UserArticleType';

interface ArticleOnUserPageProperties {
    match: {
        params: {
            articleId: number;
            serial: string;
        }
    }
}


interface FeatureData {
    name: string
    value: string;
}

interface ArticleTimelineData {
    surname: string;
    forname: string;
    name: string;
    status: string;
    comment: string;
    serialNumber: string;
    sapNumber: string;
    timestamp: string;
}

interface ArticleOnUserPageState {
    userArticle: UserArticleType[];
    message: string;
    article: ArticleByUserType[];
    features: FeatureData[];
    articleTimeline: ArticleTimelineData[];
    isLoggedIn: boolean;
    errorMessage: string;
    changeStatus: {
        userId: number;
        articleId: number;
        value: number | null;
        comment: string;
        serialNumber: string;
    }

}

export default class ArticleOnUserPage extends React.Component<ArticleOnUserPageProperties> {
    state: ArticleOnUserPageState;

    constructor(props: Readonly<ArticleOnUserPageProperties>) {
        super(props);
        this.state = {
            message: "",
            features: [],
            articleTimeline: [],
            article: [],
            isLoggedIn: true,
            errorMessage: '',
            changeStatus: {
                userId: 0,
                articleId: 0,
                value: null,
                comment: '',
                serialNumber: ''
            },
            userArticle: [],
        }
    }

    private setChangeStatusStringFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.changeStatus, {
                [fieldName]: newValue,
            })))
    }

    private setChangeStatusNumberFieldState(fieldName: number, newValue: number) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.changeStatus, {
                [fieldName]: newValue,
            })))
    }
    private setErrorMessage(message: string) {
        const newState = Object.assign(this.state, {
            errorMessage: message,
        });

        this.setState(newState);
    }

    private setLogginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isLoggedIn: isLoggedIn,
        });

        this.setState(newState);
    }

    private setArticle(articleData: ArticleByUserType[]) {
        this.setState(Object.assign(this.state, {
            article: articleData
        }))
    }

    private setUserArticle(userArticleData: UserArticleType[]) {
        this.setState(Object.assign(this.state, {
            userArticle: userArticleData
        }))
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
        api('api/article/?filter=articleId||$eq||' + this.props.match.params.articleId + '&join=userArticle&filter=userArticle.serialNumber||$eq||' + this.props.match.params.serial, 'get', {})
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

                const articleTimeline: ArticleTimelineType[] = [];
                for (const start of data) {
                    for (const statusRespon of start.userArticle) {
                        let sapNumber = start.sapNumber;
                        let surname = '';
                        let forname = '';
                        let comment = '';
                        let status = '';
                        let serialNumber = '';
                        let timestamp = '';
                        if (statusRespon.articleId === start.articleId) {
                            status = statusRespon.status;
                            comment = '';
                            serialNumber = statusRespon.serialNumber;
                            timestamp = statusRespon.timestamp;
                            for (const user of start.userDetails) {
                                if (statusRespon.userId === user.userId) {
                                    surname = user.surname;
                                    forname = user.forname;
                                }
                            }
                        }
                        articleTimeline.push({ surname, forname, status, comment, serialNumber, sapNumber, timestamp })
                    }
                }
                this.setArticleTimelineData(articleTimeline)
            })
        api('api/userArticle/?filter=serialNumber||$eq||' + this.props.match.params.serial, 'get', {})
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    this.setFeaturesData([]);
                    this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                    return;
                }
                if (res.status === 'login') {
                    return this.setLogginState(false);
                }
                const data: UserArticleType[] = res.data;
                this.setUserArticle(data)

                /* const articleTimeline: ArticleTimelineType[] = [];
                for (const ua of data) {
                    let status = ua.status;
                    let serialNumber = ua.serialNumber;
                    let sapNumber = '';
                    let surname = '';
                    let forname = '';
                    let comment = '';
                    let timestamp = ua.timestamp;
                    for (const debtComment of ua.debt) {
                        if (ua.articleId === debtComment.articleId) {
                            comment = debtComment.comment
                        }
                        for (const destroyedComment of ua.destroy) {
                            if (ua.articleId === destroyedComment.articleId) {
                                comment = destroyedComment.comment
                            }
                            for (const user of ua.user) {
                                if (ua.userId === user.userId) {
                                    surname = user.surname;
                                    forname = user.forname;
                                }
                                for (const art of ua.article) {
                                    if (ua.articleId === art.articleId) {
                                        sapNumber = art.sapNumber
                                    }
                                }
                            }
                        }
                    }
                    articleTimeline.push({ surname, forname, status, comment, serialNumber, sapNumber, timestamp })
                }
                this.setArticleTimelineData(articleTimeline) */
            })
        /* Poseban api za sortiranje po timestampu */
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
            <Container style={{ marginTop: 15 }}>
                <Card className="text-white bg-dark">
                    <Card.Header >
                        <Card.Title >
                            <Container>
                                <Row>
                                    <Col lg="12" xs="12" sm="12" md="12" style={{ display: "flex", justifyContent: "start", }}>
                                        <FontAwesomeIcon style={{ marginRight: 5 }} icon={faListCheck} />{
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
                                <FontAwesomeIcon icon={faExclamationTriangle} />  {this.state.errorMessage}
                            </Alert>
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Container>
        )
    }

    private badgeStatus(article: ArticleByUserType[]) {
        let stat = ""
        article.map(ua => (ua.userArticle.map(status => (stat = status.status))))

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

    private DebtButton(article: ArticleByUserType[]) {
        let stat = ""
        article.map(ua => (ua.userArticle.map(status => (stat = status.status))))
        if (stat === "razduženo") {
            return (
                <Col lg="3" xs="3" sm="3" md="3" style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center"
                }}>
                    <Button className="btn btn-success btn-sm">Zaduži</Button>
                </Col>
            )
        }

        if (stat === "otpisano") {
            return (
                <Col lg="3" xs="3" sm="3" md="3" style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center"
                }}>
                </Col>
            )
        }
        if (stat === "zaduženo") {
            return (
                <Col lg="3" xs="3" sm="3" md="3" style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center"
                }}>
                    <a type="button" className="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#button-razduzi"> Razduži </a>
                    <div className="modal fade" id="button-razduzi" role="dialog" aria-hidden="true" tabIndex={-1} style={{ color: "black" }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg" role="document" style={{ width: "auto", height: "auto" }}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Razduženje opreme</h5>
                                </div>
                                <div className="modal-body">
                                    <Form.Text><h6>Da li ste sigurni da želite razdužiti <b>{article.map(arti => (arti.name))} </b>sa korisnika {article.map(ud => (ud.userDetails.map(user => (user.surname))))} {article.map(ud => (ud.userDetails.map(user => (user.forname))))} ?</h6></Form.Text>
                                    <Form.Group>
                                        <Form.Label>Komentar</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Razlog razduženja opreme (neobavezno)"
                                            onChange={(e) => this.setChangeStatusStringFieldState('comment', e.target.value)}
                                        />
                                    </Form.Group>
                                </div>
                                <div className="modal-footer">
                                    <a type="button" className="btn btn-danger btn-md" data-bs-toggle="modal" data-dismiss="modal"> Zatvori </a>
                                    <button type="button" className="btn btn-success">Sačuvaj</button>
                                </div>
                            </div>
                        </div>
                    </div>


                </Col>
            )
        }
    }

    /* private doChangeStatus (){
        api('api')
    } */

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
                                </ListGroup>
                            </Card>
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
                                                    <TableCell>{articleTimeline.surname} {articleTimeline.forname}</TableCell>
                                                    <TableCell>{articleTimeline.status}</TableCell>
                                                    <TableCell>{articleTimeline.comment}</TableCell>
                                                    <TableCell>{articleTimeline.serialNumber}</TableCell>
                                                    <TableCell>{articleTimeline.sapNumber}</TableCell>
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
                    <Row>
                        <Col>
                            <Card bg="success" text="white" className="mb-2">
                                <Card.Header>Detalji korisnika</Card.Header>
                                <ListGroup variant="flush" >
                                    {article.map(propUser => (propUser.userDetails.map(user => (
                                        <><ListGroup.Item>Ime: {user.surname}</ListGroup.Item>
                                            <ListGroup.Item>Prezime: {user.forname}</ListGroup.Item>
                                            <ListGroup.Item>Email: {user.email}</ListGroup.Item>
                                            <ListGroup.Item>Sektor: {user.department}</ListGroup.Item>
                                            <ListGroup.Item>Radno mjest: {user.jobTitle}</ListGroup.Item>
                                            <ListGroup.Item>Lokacija: {user.location}</ListGroup.Item>
                                        </>
                                    ))))}
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card bg="light" text="dark" className=" mb-2">
                                <Card.Header>
                                    <Row>
                                        <Col lg="9" xs="9" sm="9" md="9" style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                                            Status
                                        </Col>
                                        {this.DebtButton(article)}
                                    </Row>
                                </Card.Header>
                                <ListGroup variant="flush">
                                    {article.map(uaStat => (uaStat.userArticle.map(stat => (
                                        <>
                                            <ListGroup.Item>Status: <b>{stat.status} </b></ListGroup.Item>
                                            <ListGroup.Item>Datum zaduženja: {Moment(stat.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListGroup.Item>
                                        </>
                                    ))))}
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card className="text-dark bg-light mb-2" >
                                <Card.Header>U skladištu</Card.Header>
                                <ListGroup variant="flush" >
                                    {article.map(artStock => (
                                        artStock.articlesInStock.map(arStock => (
                                            <><ListGroup.Item>Stanje po ugovoru: {arStock.valueOnConcract}</ListGroup.Item>
                                                <ListGroup.Item>Trenutno stanje: {arStock.valueAvailable}</ListGroup.Item>
                                                <ListGroup.Item>SAP broj: {arStock.sapNumber}</ListGroup.Item>
                                                <ListGroup.Item>Stanje na: {Moment(arStock.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListGroup.Item>
                                            </>
                                        ))
                                    ))
                                    }
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}
