import { faListCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import api, { ApiResponse } from '../../API/api';
import { Badge, Card, Col, Container, FloatingLabel, Form, ListGroup, Row, } from 'react-bootstrap';
import FeaturesType from '../../types/FeaturesType';
import ApiArticleDto from '../../dtos/ApiArticleDto';
import Moment from 'moment';
import { Table, TableContainer, TableHead, TableRow, TableBody, TableCell } from "@mui/material";
import ArticleTimelineType from '../../types/ArticleTimelineType';
import Paper from '@mui/material/Paper';
import ArticleByUserType from '../../types/ArticleByUserType';
import UserType from '../../types/UserType';

interface ArticlePageProperties {
    match: {
        params: {
            articleID: number;
        }
    }
}

interface userData {
    userId: number;
    surname: string;
    forname: string;
}

interface ArticlePageState {
    message: string;
    articles?: ApiArticleDto;
    features: FeaturesType[];
    articleTimeline: ArticleTimelineType[];
    users: userData[];
    changeStatus: {
        userId: number | null;
        articleId: number | null;
        value: number | null;
        comment: string;
        serialNumber: string;
        status: string;
    }
}


export default class ArticlePage extends React.Component<ArticlePageProperties> {
    state: ArticlePageState;

    constructor(props: Readonly<ArticlePageProperties>) {
        super(props);
        this.state = {
            message: "",
            features: [],
            articleTimeline: [],
            users: [],
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

    private setArticles(articleData: ApiArticleDto | undefined) {
        this.setState(Object.assign(this.state, {
            articles: articleData
        }))
    }

    private setFeaturesData(featuresData: FeaturesType[]) {
        this.setState(Object.assign(this.state, {
            features: featuresData
        }))
    }

    private setUsers(usersData: userData[]) {
        this.setState(Object.assign(this.state, {
            users: usersData
        }))
    }

    private setArticleTimelineData(articleTimelineData: ArticleTimelineType[]) {
        this.setState(Object.assign(this.state, {
            articleTimeline: articleTimelineData
        }))
    }

    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message,
        }));
    }

    private setChangeStatusStringFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.changeStatus, {
                [fieldName]: newValue,
            })))
    }

    private setChangeStatusNumberFieldState(fieldName: string, newValue: any) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.changeStatus, {
                [fieldName]: (newValue === 'null') ? null : Number(newValue),
            })))
    }

    private setLogginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isLoggedIn: isLoggedIn,
        });
        this.setState(newState);
    }

    componentDidMount() {
        this.getArticleData()
    }

    componentDidUpdate(oldProperties: ArticlePageProperties) {
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */
        if (oldProperties.match.params.articleID === this.props.match.params.articleID) {
            return;
        }
        this.getArticleData();
    }

    private getArticleData() {
        api('api/article/' + this.props.match.params.articleID, 'get', {})
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    this.setArticles(undefined);
                    this.setFeaturesData([]);
                    this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                    return;
                }

                const data: ApiArticleDto = res.data;
                this.setErrorMessage('')
                this.setArticles(data)

                const features: FeaturesType[] = [];

                for (const articleFeature of data.articleFeature) {
                    const value = articleFeature.value;
                    let name = '';

                    for (const feature of data.features) {
                        if (feature.featureId === articleFeature.featureId) {
                            name = feature.name;
                            break;
                        }
                    }

                    features.push({ name, value });
                }
                this.setFeaturesData(features);

                const articleTimeline: ArticleTimelineType[] = [];

                for (const statusRespon of data.userArticle) {
                    let sapNumber = data.sapNumber;
                    let surname = '';
                    let forname = '';
                    let comment = '';
                    let status = '';
                    let serialNumber = '';
                    let timestamp = '';
                    if (statusRespon.articleId === data.articleId) {
                        status = statusRespon.status;
                        comment = '';
                        serialNumber = statusRespon.serialNumber;
                        timestamp = statusRespon.timestamp;
                        for (const user of data.userDetails) {
                            if (statusRespon.userId === user.userId) {
                                surname = user.surname;
                                forname = user.forname;
                            }
                        }
                    }
                    articleTimeline.push({ surname, forname, status, comment, serialNumber, sapNumber, timestamp })
                }
                this.setArticleTimelineData(articleTimeline)
            })

        api('/api/user', 'get', {})
            .then((res: ApiResponse) => {
                this.setUsers(res.data)
            })
    }

    private changeStatu() {
        api('api/userArticle/add/' + this.state.changeStatus.userId, 'post', {
            articleId: this.props.match.params.articleID,
            value: 1,
            comment: this.state.changeStatus.comment,
            serialNumber: this.state.changeStatus.serialNumber,
            status: this.state.changeStatus.status
        })
            .then((res: ApiResponse) => {
                if (res.status === "login") {
                    this.setLogginState(false);
                    return
                }
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
        return (
            <Container style={{ marginTop: 15 }}>
                <Card className="text-white bg-dark">
                    <Card.Header >
                        <Card.Title style={{ display: "flex", justifyContent: "start", }}>
                            <FontAwesomeIcon style={{ marginRight: 5 }} icon={faListCheck} />{
                                this.state.articles ?
                                    this.state.articles?.name :
                                    'Article not found'
                            }
                            {this.badgeStatus()}
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text>
                            {this.printOptionalMessage()}

                            {
                                this.state.articles ?
                                    (this.renderArticleData(this.state.articles)) :
                                    ''
                            }
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Container>
        )
    }

    private badgeStatus() {

        let status = 0;
        this.state.articles?.articlesInStock.map(stat => (
            status = stat.valueAvailable
        ))
        if (status === 0) {
            return (
                <Badge pill bg="danger" style={{ marginLeft: 10, alignItems: "center", display: "flex", fontSize: 12 }}>
                    nema na stanju
                </Badge>)
        }
        if (status > 0) {
            return (
                <Badge pill bg="success" style={{ marginLeft: 10, alignItems: "center", display: "flex", fontSize: 12 }}>
                    dostupno
                </Badge>)
        }

    }

    private changeStatusButton() {
        let status = 0;
        this.state.articles?.articlesInStock.map(stat => (
            status = stat.valueAvailable
        ))
        if (status !== 0) {
            return (
                <Col lg="3" xs="3" sm="3" md="3" style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center"
                }}>
                    <a type="button" className="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#button-razduzi"> Promjeni</a>
                    <div className="modal fade" id="button-razduzi" role="dialog" aria-hidden="true" tabIndex={-1} style={{ color: "black" }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg" role="document" style={{ width: "auto", height: "auto" }}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Kartica zaduženja</h5>
                                </div>
                                <div className="modal-body">


                                    <Form.Group>
                                        <FloatingLabel controlId='value' label="Status" className="mb-3">
                                            <Form.Select placeholder='izaberi korisnika' id='userId'
                                                onChange={(e) => this.setChangeStatusNumberFieldState('userId', e.target.value)}>
                                                <option>izaberi korisnika</option>
                                                {this.state.users.map(users => (
                                                    <option value={users.userId.toString()}>{users.forname} {users.surname}</option>
                                                ))}
                                            </Form.Select>
                                        </FloatingLabel>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Količina
                                            </Form.Label>
                                            <Form.Control type='text' readOnly id='value' placeholder='1 KOM' />
                                            <Form.Text>Artikal se zadužuje po serijskom broju, tako da je količina predefinisana 1 KOM</Form.Text>
                                        </Form.Group>

                                    </Form.Group>

                                    <Form.Group>
                                        <FloatingLabel controlId='value' label="Status" className="mb-3">
                                            <Form.Select id="status"
                                                onChange={(e) => this.setChangeStatusStringFieldState('status', e.target.value)}>
                                                <option>izaberi status</option>
                                                <option value='zaduženo'>
                                                    Zaduženo
                                                </option>
                                                <option value='razduženo'>
                                                    Razduženo
                                                </option>
                                                <option value='otpisano'>
                                                    Otpisano
                                                </option>
                                            </Form.Select>
                                        </FloatingLabel>
                                    </Form.Group>
                                    <Form.Group>
                                        <FloatingLabel controlId='value' label="Serijski broj" className="mb-3">
                                            <Form.Control type='text' id='serialNumber' placeholder='1'
                                                onChange={(e) => this.setChangeStatusStringFieldState('serialNumber', e.target.value)} /></FloatingLabel>
                                    </Form.Group>
                                    <Form.Group>
                                        <FloatingLabel controlId='value' label="Komentar" className="mb-3">
                                            <Form.Control
                                                id="comment"
                                                as="textarea"
                                                rows={3}
                                                placeholder="(neobavezno)"
                                                style={{ height: '100px' }}
                                                onChange={(e) => this.setChangeStatusStringFieldState('comment', e.target.value)}
                                            /></FloatingLabel>
                                    </Form.Group>
                                </div>
                                <div className="modal-footer">
                                    <a type="button" className="btn btn-danger btn-md" data-bs-toggle="modal" data-dismiss="modal"> Zatvori </a>
                                    <a type="button" className="btn btn-success btn-md" data-bs-toggle="modal" data-dismiss="modal" onClick={() => this.changeStatu()}> Sačuvaj </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
            )
        }

        return (
            <Col lg="3" xs="3" sm="3" md="3" style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center"
            }}>
            </Col>
        )

    }


    renderArticleData(article: ApiArticleDto) {
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
                                <Card.Body style={{ borderRadius: "0 0 calc(.25rem - 1px) calc(.25rem - 1px)", background: "white", color: "black" }}>{article.description}</Card.Body>
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
                            <Card className="text-dark bg-light mb-2" >
                                <Card.Header><Row>
                                    <Col lg="9" xs="9" sm="9" md="9" style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                                        U skladištu
                                    </Col>
                                    {this.changeStatusButton()}
                                </Row></Card.Header>
                                <ListGroup variant="flush" >
                                    {this.state.articles?.articlesInStock.map(arStock => (
                                        <><ListGroup.Item>Stanje po ugovoru: {arStock.valueOnConcract}</ListGroup.Item>
                                            <ListGroup.Item>Trenutno stanje: {arStock.valueAvailable}</ListGroup.Item>
                                            <ListGroup.Item>SAP broj: {arStock.sapNumber}</ListGroup.Item>
                                            <ListGroup.Item>Stanje na: {Moment(arStock.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListGroup.Item>
                                        </>
                                    ), this)}
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}
