import { faExclamationTriangle, faListCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import api, { ApiResponse } from '../../../API/api';
import { Alert, Badge, Button, Card, Col, Container, FloatingLabel, Form, ListGroup, Modal, Row } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import { Table, TableContainer, TableHead, TableRow, TableBody, TableCell } from "@mui/material";
import Moment from 'moment';
import FeaturesType from '../../../types/FeaturesType';
import ArticleTimelineType from '../../../types/ArticleTimelineType';
import ArticleByUserType from '../../../types/ArticleByUserType';
import UserArticleDto from '../../../dtos/UserArticleDto';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';

interface AdminArticleOnUserPageProperties {
    match: {
        params: {
            userID: number;
            articleId: number;
            serial: string;
        }
    }
}

interface userData {
    userId: number;
    surname: string;
    forname: string;
}

interface AdminArticleOnUserPageState {
    userArticle: UserArticleDto[];
    message: string;
    article: ArticleByUserType[];
    features: FeaturesType[];
    articleTimeline: ArticleTimelineType[];
    users: userData[];
    isLoggedIn: boolean;
    errorMessage: string;
    changeStatus: {
        visible: boolean;
        userId: number | null;
        articleId: number | null;
        value: number | null;
        comment: string;
        serialNumber: string;
        status: string;
    }

}

export default class AdminArticleOnUserPage extends React.Component<AdminArticleOnUserPageProperties> {
    state: AdminArticleOnUserPageState;

    constructor(props: Readonly<AdminArticleOnUserPageProperties>) {
        super(props);
        this.state = {
            message: "",
            features: [],
            articleTimeline: [],
            users: [],
            article: [],
            isLoggedIn: true,
            errorMessage: '',
            changeStatus: {
                userId: this.props.match.params.userID,
                articleId: 0,
                value: null,
                comment: '',
                serialNumber: '',
                status: '',
                visible: false,
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
    private setChangeStatusNumberFieldState(fieldName: string, newValue: any) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.changeStatus, {
                [fieldName]: (newValue === 'null') ? null : Number(newValue),
            })))
    }

    private setVisibleState(newState: boolean) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.changeStatus, {
                visible: newState,
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

    private setUserArticle(userArticleData: UserArticleDto[]) {
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

    private setUsers(usersData: userData[]) {
        this.setState(Object.assign(this.state, {
            users: usersData
        }))
    }

    componentDidMount() {
        this.getArticleData()
    }

    componentDidUpdate(oldProperties: AdminArticleOnUserPageProperties) {
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */
        if (oldProperties.match.params.userID === this.props.match.params.userID) {
            return;
        }
        this.getArticleData();
    }
    /* '&filter=userDetails.userId||$eq||' + this.props.match.params.userID + */
    private getArticleData() {
        api('api/article/?filter=articleId||$eq||' + this.props.match.params.articleId +
            '&filter=userDetails.userId||$eq||' + this.state.changeStatus.userId +
            '&join=userArticles&filter=userArticles.serialNumber||$eq||' + this.props.match.params.serial +
            '&sort=userArticles.timestamp,DESC', 'get', {}, 'administrator')
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
            }
            )

        api('/api/user/', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                this.setUsers(res.data)
            }
            )

        api('api/userArticle/?filter=serialNumber||$eq||' + this.props.match.params.serial + '&sort=timestamp,DESC', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    this.setFeaturesData([]);
                    this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                    return;
                }
                if (res.status === 'login') {
                    return this.setLogginState(false);
                }
                const data: UserArticleDto[] = res.data;
                this.setUserArticle(data)

                const articleTimeline: ArticleTimelineType[] = [];
                for (const ua of data) {
                    let status = ua.status;
                    let serialNumber = ua.serialNumber;
                    let sapNumber = ua.article?.sapNumber;
                    let surname = ua.user?.surname;
                    let forname = ua.user?.forname;
                    let timestamp = ua.timestamp;
                    let comment = ua.comment;

                    articleTimeline.push({ surname, forname, status, comment, serialNumber, sapNumber, timestamp })
                }
                this.setArticleTimelineData(articleTimeline)
            })
    }

    private changeStatu() {
        api('api/userArticle/add/' + this.state.changeStatus.userId, 'post', {
            articleId: this.props.match.params.articleId,
            value: 1,
            comment: this.state.changeStatus.comment,
            serialNumber: this.state.changeStatus.serialNumber,
            status: this.state.changeStatus.status
        }, 'administrator')
            .then((res: ApiResponse) => {
                /* Uhvatiti grešku gdje korisnik nema prava da mjenja status */
                if (res.status === "login") {
                    this.setLogginState(false);
                    return
                }
                this.setVisibleState(false)
                this.getArticleData()
            })
    }

    private showModal(artTime: ArticleTimelineType[]) {
        const serijskic: any = artTime.map(SB => [(SB.serialNumber)]);
        const sb: any = serijskic.shift();
        this.setVisibleState(true)
        this.setChangeStatusStringFieldState('serialNumber', sb)
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
                <Redirect to="/user/login/" />
            );
        }

        return (
            <>
                <RoledMainMenu role='administrator' />
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

    private changeStatusButton(article: ArticleByUserType[]) {

        let stat = ""
        article.map(ua => stat = (ua.userArticles[ua.userArticles.length - ua.userArticles.length + 0]).status)

        if (stat !== "otpisano") {
            return (
                <Col lg="3" xs="3" sm="3" md="3" style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center"
                }}>
                    <Button variant='success' size='sm' onClick={() => this.showModal(this.state.articleTimeline)}>Izmjeni</Button>
                    <Modal size="lg" centered show={this.state.changeStatus.visible} onHide={() => this.setVisibleState(false)}>
                        <Modal.Header closeButton>
                            Promjeni status opreme
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Text>
                                <h6>Da li ste sigurni da želite promjeniti status zaduženja
                                    <b> {article.map(arti => (arti.name))} </b>sa korisnika {article.map(user => (user.userDetails[user.userDetails.length - user.userDetails.length + 0]).surname)} {article.map(user => (user.userDetails[user.userDetails.length - user.userDetails.length + 0]).forname)}?
                                </h6>
                            </Form.Text>
                            <Form.Group className='was-validated'>
                                <FloatingLabel controlId='userId' label="Izaberi korisnika" className="mb-3">
                                    <Form.Select placeholder='izaberi korisnika' id='userId' required
                                        onChange={(e) => this.setChangeStatusNumberFieldState('userId', e.target.value)}>
                                        <option value=''>izaberi korisnika</option>
                                        {this.state.users.map(users => (
                                            <option value={Number(users.userId)}>{users.forname} {users.surname}</option>
                                        ))}
                                    </Form.Select>
                                </FloatingLabel>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Količina
                                </Form.Label>
                                <Form.Control type='text' readOnly placeholder='1 KOM' />
                                <Form.Text>Artikal se zadužuje po serijskom broju, tako da je količina predefinisana 1 KOM</Form.Text>
                            </Form.Group>
                            <Form.Group className='was-validated'>
                                <FloatingLabel controlId='status' label="Status" className="mb-3">
                                    <Form.Select id="status"
                                        onChange={(e) => this.setChangeStatusStringFieldState('status', e.target.value)} required>
                                        <option value="">izaberi status</option>
                                        <option value="zaduženo">
                                            zaduženo
                                        </option>
                                        <option value="razduženo">
                                            razduženo
                                        </option>
                                        <option value="otpisano">
                                            otpisano
                                        </option>
                                    </Form.Select>
                                    <Form.Text>
                                        <p> Ako je artikal već zadužen, ne može u ovom trenutku biti ponovo zadužen</p>
                                    </Form.Text>
                                </FloatingLabel>
                            </Form.Group>
                            <Form.Group>
                                <FloatingLabel controlId='serialNumber' label="Serijski broj" className="mb-3">
                                    <Form.Control type='text' id='serialNumber' value={this.state.changeStatus.serialNumber} readOnly isValid required
                                        onChange={(e) => this.setChangeStatusStringFieldState('serialNumber', e.target.value)} /></FloatingLabel>
                            </Form.Group>

                            <Form.Group className='was-validated'>
                                <FloatingLabel controlId='comment' label="Komentar" className="mb-3">
                                    <Form.Control
                                        required
                                        defaultValue=""
                                        id="comment"
                                        as="textarea"
                                        rows={3}
                                        placeholder="Razlog razduženja opreme (neobavezno)"
                                        style={{ height: '100px' }}
                                        onChange={(e) => this.setChangeStatusStringFieldState('comment', e.target.value)}
                                    />
                                </FloatingLabel>
                            </Form.Group>
                            <Modal.Footer>
                                <Button variant='success' onClick={() => this.changeStatu()}>Sačuvaj</Button>
                            </Modal.Footer>
                        </Modal.Body>
                    </Modal>
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

    private userDetails(userDet: ArticleByUserType[]) {
        let stat = ""
        userDet.map(ua => stat = (ua.userArticles[ua.userArticles.length - ua.userArticles.length + 0]).status)

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
                                <>  <ListGroup.Item>Ime: {userDet.map(usr => (usr.userDetails.map(sur => ([sur.surname]))).shift())}</ListGroup.Item>
                                    <ListGroup.Item>Prezime: {userDet.map(usr => (usr.userDetails[usr.userDetails.length - usr.userDetails.length + 0]).forname)}</ListGroup.Item>
                                    <ListGroup.Item>Email: {userDet.map(usr => (usr.userDetails[usr.userDetails.length - usr.userDetails.length + 0]).email)}</ListGroup.Item>
                                    <ListGroup.Item>Sektor: {userDet.map(usr => (usr.userDetails[usr.userDetails.length - usr.userDetails.length + 0]).department)}</ListGroup.Item>
                                    <ListGroup.Item>Radno mjesto: {userDet.map(usr => (usr.userDetails[usr.userDetails.length - usr.userDetails.length + 0]).jobTitle)}</ListGroup.Item>
                                    <ListGroup.Item>Lokacija: {userDet.map(usr => (usr.userDetails[usr.userDetails.length - usr.userDetails.length + 0]).location)}</ListGroup.Item>
                                </>
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
                    {this.userDetails(article)}
                    <Row>
                        <Col>
                            <Card bg="light" text="dark" className=" mb-2">
                                <Card.Header>
                                    <Row>
                                        <Col lg="9" xs="9" sm="9" md="9" style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                                            Status
                                        </Col>
                                        {this.changeStatusButton(article)}
                                    </Row>
                                </Card.Header>
                                <ListGroup variant="flush">
                                    <>
                                        <ListGroup.Item>Status: <b>{article.map(artStat => (artStat.userArticles.map(status => ([status.status])).shift()))} </b></ListGroup.Item>
                                        <ListGroup.Item>Datum akcije:  {article.map(nesto => (Moment(nesto.userArticles[nesto.userArticles.length - nesto.userArticles.length + 0].timestamp)).format('DD.MM.YYYY. - HH:mm'))} </ListGroup.Item>
                                    </>
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
