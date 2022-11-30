import React from 'react';
import api, { ApiResponse } from '../../../API/api';
import { Alert, Badge, Button, Card, Col, Container, FloatingLabel, Form, ListGroup, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { Link, Redirect } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import { Table, TableContainer, TableHead, TableRow, TableBody, TableCell } from "@mui/material";
import Moment from 'moment';
import FeaturesType from '../../../types/FeaturesType';
import ArticleTimelineType from '../../../types/ArticleTimelineType';
import ArticleByUserType from '../../../types/ArticleByUserType';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import { ApiConfig } from '../../../config/api.config';
import saveAs from 'file-saver';
import { LangBa, ModalMessageArticleOnUser} from '../../../config/lang.ba'
import UserType from '../../../types/UserType';
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

interface upgradeFeaturesType {
    name: string;
    value: string;
    serialNumber: string;
    comment: string;
    timestamp: string;
}


interface AdminArticleOnUserPageState {
    message: string;
    article: ArticleByUserType[];
    features: FeaturesType[];
    articleTimeline: ArticleTimelineType[];
    users: userData[];
    user: UserType[];
    isLoggedIn: boolean;
    errorMessage: string;
    changeStatus: {
        visible: boolean;
        userId: number | null;
        articleId: number | null;
        value: number | null;
        comment: string;
        serialNumber: string;
        invBroj: string;
        status: string;
    },
    upgradeFeature: upgradeFeaturesType[],
    upgradeFeatureAdd: {
        visible: boolean;
        name: string;
        value: string;
        comment: string;
        serialNumber: string;
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
            user:[],
            article: [],
            isLoggedIn: true,
            errorMessage: '',
            changeStatus: {
                userId: 0,
                articleId: 0,
                value: null,
                comment: '',
                serialNumber: '',
                invBroj: '',
                status: '',
                visible: false,
            },
            upgradeFeature: [], 
            upgradeFeatureAdd: {
                visible: false,
                name: "",
                value: "",
                comment: "",
                serialNumber: "",
            },
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

    private setChangeStatusVisibleState(newState: boolean) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.changeStatus, {
                visible: newState,
            })))
    }

    private setUpgradeFeatureStringFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.upgradeFeatureAdd, {
                [fieldName]: newValue,
            })))
    }

    private setUpgradeModalVisibleState(newState: boolean) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.upgradeFeatureAdd, {
                visible: newState,
            })))
    }

    private setUpgradeFeature(upgradeFeatureData: upgradeFeaturesType[]) {
        this.setState(Object.assign(this.state, {
            upgradeFeature: upgradeFeatureData
        }))
    }

    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state, {
            errorMessage: message,
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

    private setUser(userData: UserType[]) {
        this.setState(Object.assign(this.state, {
            user: userData
        }))
    }

    componentDidMount() {
        this.getArticleData()
        this.getUpgradeFeatureBySerialNumber()
    }

    componentDidUpdate(oldProperties: AdminArticleOnUserPageProperties) {
        if (oldProperties.match.params.userID === this.props.match.params.userID) {
            return;
        }
        this.getUserArticleData();
    }
    /* '&filter=userDetails.userId||$eq||' + this.props.match.params.userID + */
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
           /*  '&filter=userDetails.userId||$eq||' + this.state.changeStatus.userId + */
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

        api('/api/user/?sort=forname,ASC', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                this.setUsers(res.data)
            }
        )

        api('/api/user/?filter=userId||$eq||' + this.props.match.params.userID, 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                this.setUser(res.data)
            }
        )
        
    }

    private getUserArticleData(){
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
    }

    private getUpgradeFeatureBySerialNumber () {
        api('api/upgradeFeature/?filter=serialNumber||$eq||' + this.props.match.params.serial, 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            this.setUpgradeFeature(res.data)
        })
    }

    private addNewUpgradeFeature () {
        api('api/upgradeFeature/add/' + this.props.match.params.serial, 'post', {
            name: this.state.upgradeFeatureAdd.name,
            value: this.state.upgradeFeatureAdd.value,
            comment: this.state.upgradeFeatureAdd.comment,
            articleId: this.props.match.params.articleId,
        }, 'administrator')
        .then((res: ApiResponse) => {
            this.setUpgradeModalVisibleState(false)
            this.getUpgradeFeatureBySerialNumber()
            this.getArticleData()
        })
    }

    private showAddUpgradeFeatureModal () {
        this.setUpgradeModalVisibleState(true)
    }

    private addNewUpgradeFeatureButton () {
        return (
        <><Button variant='success' size='sm' onClick={() => this.showAddUpgradeFeatureModal()}>{LangBa.ARTICLE_ON_USER.BTN_UPGRADE}</Button><Modal size="lg" centered show={this.state.upgradeFeatureAdd.visible} onHide={() => this.setUpgradeModalVisibleState(false)}>
                <Modal.Header closeButton>
              {LangBa.ARTICLE_ON_USER.MODAL_HEADER_TEXT}
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Text>
                            <h6>{LangBa.ARTICLE_ON_USER.MODAL_FORM_DESCRIPTION}
                            </h6>
                        </Form.Text>
                        <Form.Group>
                            <FloatingLabel controlId='name' label="Naziv" className="mb-3">
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={<Tooltip id="tooltip-name">{LangBa.ARTICLE_ON_USER.TOOLTIP_NAME}</Tooltip>}>
                                    <Form.Control type='text' id='name' value={this.state.upgradeFeatureAdd.name} required
                                        onChange={(e) => this.setUpgradeFeatureStringFieldState('name', e.target.value)} />
                                </OverlayTrigger>
                            </FloatingLabel>
                            <FloatingLabel controlId='value' label={LangBa.ARTICLE_ON_USER.TOOLTIP_VALUE} className="mb-3">
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={<Tooltip id="tooltip-value">{LangBa.ARTICLE_ON_USER.TOOLTIP_VALUE}</Tooltip>}>
                                    <Form.Control type='text' id='value' value={this.state.upgradeFeatureAdd.value} required
                                        onChange={(e) => this.setUpgradeFeatureStringFieldState('value', e.target.value)} />
                                </OverlayTrigger>
                            </FloatingLabel>
                            <FloatingLabel controlId='comment' label="Komentar" className="mb-3">
                                <Form.Control
                                    required
                                    defaultValue=""
                                    id="comment"
                                    as="textarea"
                                    rows={3}
                                    placeholder={LangBa.ARTICLE_ON_USER.FORM_COMMENT_PLACEHOLDER}
                                    style={{ height: '100px' }}
                                    onChange={(e) => this.setUpgradeFeatureStringFieldState('comment', e.target.value)} />
                            </FloatingLabel>
                        </Form.Group>
                    </Form>
                    <Modal.Footer>
                        <Button variant='success' onClick={() => this.addNewUpgradeFeature()}>{LangBa.ARTICLE_ON_USER.BTN_SAVE}</Button>
                    </Modal.Footer>
                </Modal.Body>
            </Modal></>
        )
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
                <Redirect to="/admin/login/" />
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
                                            
                                            <i className={this.state.article.map(arti => (arti.category.imagePath)).toLocaleString()} style={{fontSize:20, marginRight:5}}/> {
                                                this.state.article ?
                                                    this.state.article.map :
                                                    LangBa.ARTICLE_ON_USER.ERR_CONTAINER_ARTICLE_NOT_FOUND
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
                                        <i className="bi bi-exclamation-circle-fill"></i> {this.state.errorMessage}
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

    private changeStatus() {
        api('api/userArticle/add/' + this.state.changeStatus.userId, 'post', {
            articleId: this.props.match.params.articleId,
            value: 1,
            comment: this.state.changeStatus.comment,
            serialNumber: this.state.changeStatus.serialNumber,
            invBroj: this.state.changeStatus.invBroj,
            status: this.state.changeStatus.status
        }, 'administrator')
            .then((res: ApiResponse) => {
                /* Uhvatiti grešku gdje korisnik nema prava da mjenja status */
                if (res.status === "login") {
                    this.setLogginState(false);
                    return
                }
                this.setChangeStatusVisibleState(false)
                this.getUserArticleData()
            })
    }

    private showChangeStatusModal(artTime: ArticleTimelineType[]) {
        const sb: any = artTime.map(SB => (SB.serialNumber)).shift();
        const inv : any = artTime.map(inv => (inv.invBroj)).shift();
        /* const sb: any = serijskic.shift(); */
        this.setChangeStatusVisibleState(true)
        this.setChangeStatusStringFieldState('serialNumber', sb)
        if (inv === null) {
            this.setChangeStatusStringFieldState('invBroj', 'ne ladi1')
        }
        this.setChangeStatusStringFieldState('invBroj', inv)
    }

    private changeStatusButton(article: ArticleByUserType[]) {
        let stat = ""
        const userDetails: UserType[] = this.state.user;
        article.map(ua => stat = (ua.userArticles[ua.userArticles.length - ua.userArticles.length + 0]).status)

        const artiName: string = article.map(arti => (arti.name)).toString();
        const userFullName: string = userDetails.map(user => (user.fullname)).toString();

        if (stat !== LangBa.ARTICLE_ON_USER.STATUS_DESTROY) {
            return (
                <Col lg="3" xs="3" sm="3" md="3" style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center"
                }}>
                    <Button variant='success' size='sm' onClick={() => this.showChangeStatusModal(this.state.articleTimeline)}>{LangBa.ARTICLE_ON_USER.BTN_EDIT}</Button>
                    <Modal size="lg" centered show={this.state.changeStatus.visible} onHide={() => this.setChangeStatusVisibleState(false)}>
                        <Modal.Header closeButton>
                            {LangBa.ARTICLE_ON_USER.MODAL_HEADER_CHANGE_STATUS}
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                            <Form.Text>
                                <h6>{ModalMessageArticleOnUser(artiName, userFullName)}</h6>
                            </Form.Text>
                            <Form.Group className='was-validated'>
                                <FloatingLabel controlId='userId' label={LangBa.ARTICLE_ON_USER.NEW_OBLIGATE_LABEL} className="mb-3">
                                    <Form.Select placeholder={LangBa.ARTICLE_ON_USER.FORM_SELECT_USER_PLACEHOLDER} id='userId' required
                                        onChange={(e) => this.setChangeStatusNumberFieldState('userId', e.target.value)}>
                                        <option value=''>{LangBa.ARTICLE_ON_USER.FORM_SELECT_USER_PLACEHOLDER}</option>
                                        {this.state.users.map(users => (
                                            <option value={Number(users.userId)}>{users.forname} {users.surname}</option>
                                        ))}
                                    </Form.Select>
                                </FloatingLabel>
                            </Form.Group>
                            <Form.Group className="mb-3">             
                                <FloatingLabel controlId='kolicina' label={LangBa.ARTICLE_ON_USER.TOOLTIP_VALUE} className="mb-3">
                                <OverlayTrigger 
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={
                                <Tooltip id="tooltip-kolicina">{LangBa.ARTICLE_ON_USER.TOOLTIP_DEFAULT_VALUE}</Tooltip>
                                }>
                                <Form.Control id='kolicina' type='text' readOnly isValid required placeholder='1 KOM' value='1 KOM' /></OverlayTrigger>  </FloatingLabel>
                                <Form.Text></Form.Text> 
                            </Form.Group>
                            <Form.Group className='was-validated'>
                                <FloatingLabel controlId='status' label="Status" className="mb-3">
                                    <Form.Select id="status"
                                        onChange={(e) => this.setChangeStatusStringFieldState('status', e.target.value)} required>
                                        <option value="">izaberi status</option>
                                        <option value={LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE}>
                                        {LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE}
                                        </option>
                                        <option value={LangBa.ARTICLE_ON_USER.STATUS_DEBT}>
                                        {LangBa.ARTICLE_ON_USER.STATUS_DEBT}
                                        </option>
                                        <option value={LangBa.ARTICLE_ON_USER.STATUS_DESTROY}>
                                        {LangBa.ARTICLE_ON_USER.STATUS_DESTROY}
                                        </option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Form.Group>
                            <Form.Group>
                                <FloatingLabel controlId='serialNumber' label={LangBa.ARTICLE_ON_USER.FORM_LABEL_SERIALNUMBER} className="mb-3">
                                    <OverlayTrigger 
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={
                                    <Tooltip id="tooltip-msg-serialnumber">{LangBa.ARTICLE_ON_USER.TOOLTIP_MSG_SERIALNUMBER}</Tooltip>
                                    }>
                                    <Form.Control type='text' id='serialNumber' value={this.state.changeStatus.serialNumber} readOnly isValid required
                                        onChange={(e) => this.setChangeStatusStringFieldState('serialNumber', e.target.value)} />
                                    </OverlayTrigger>
                                </FloatingLabel>
                                <FloatingLabel controlId='invBroj' label={LangBa.ARTICLE_ON_USER.FORM_LABEL_INV_NUMBER} className="mb-3">
                                    <OverlayTrigger 
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={
                                    <Tooltip id="tooltip-msg-invnumber">{LangBa.ARTICLE_ON_USER.TOOLTIP_MSG_INV_NUMBER}</Tooltip>
                                    }>
                                    <Form.Control type='text' id='invBroj' value={this.state.changeStatus.invBroj} isValid required readOnly
                                        onChange={(e) => this.setChangeStatusStringFieldState('invBroj', e.target.value)} />
                                    </OverlayTrigger>
                                </FloatingLabel>
                            </Form.Group>

                            <Form.Group className='was-validated'>
                                <FloatingLabel controlId='comment' label={LangBa.ARTICLE_ON_USER.FORM_LABEL_COMMENT} className="mb-3">
                                    <Form.Control
                                        required
                                        defaultValue=""
                                        id="comment"
                                        as="textarea"
                                        rows={3}
                                        placeholder={LangBa.ARTICLE_ON_USER.FORM_COMMENT_PLACEHOLDER}
                                        style={{ height: '100px' }}
                                        onChange={(e) => this.setChangeStatusStringFieldState('comment', e.target.value)}
                                    />
                                </FloatingLabel>
                            </Form.Group>
                            </Form>
                            <Modal.Footer>
                                <Button variant='success' onClick={() => this.changeStatus()}>{LangBa.ARTICLE_ON_USER.BTN_SAVE}</Button>
                            </Modal.Footer>
                        </Modal.Body>
                    </Modal>
                </Col>
            )
        }
    }

    private userDetails(userDet: ArticleByUserType[]) {
        let stat = ""
        userDet.map(ua => stat = (ua.userArticles[ua.userArticles.length - ua.userArticles.length + 0]).status)
        const userDetails: UserType[] = this.state.user;
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
                                <>  <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.NAME + userDetails.map(user => (user.surname))} </ListGroup.Item>
                                    <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.LASTNAME + userDetails.map(user => (user.forname))} </ListGroup.Item>
                                    <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.EMAIL + userDetails.map(user => (user.email))} </ListGroup.Item>
                                    <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.DEPARTMENT + userDetails.map(user => (user.department?.title))} </ListGroup.Item>
                                    <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.JOBNAME + userDetails.map(user => (user.job?.title))} </ListGroup.Item>
                                    <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.LOCATION + userDetails.map(user => (user.location?.name))} </ListGroup.Item>
                                </>
                            </ListGroup>
                        </Card>
                    </Col>
                </Row>
            )
        }
    }

    private saveFile (docPath: any) {
        if(!docPath) {
            return (<>
            <Link to="">
                <OverlayTrigger 
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={
                <Tooltip id="tooltip-prenosnica">{LangBa.ARTICLE_ON_USER.DOCUMENT.ERR_DOCUMENT_TOOLTIO}</Tooltip>
                }><i className="bi bi-file-earmark-text" style={{ fontSize: 22, color: "red" }}/></OverlayTrigger>
                </Link></> )
        }
        if (docPath) {
            const savedFile = (docPath:any) => {
                saveAs(
                    ApiConfig.TEMPLATE_PATH + docPath,
                    docPath
                );
            }
            return (
                <Link onClick={() => savedFile(docPath)} to="">
                <i className="bi bi-file-earmark-text" style={{ fontSize: 22, color: "#008b02" }}/></Link>
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
                            <Row style={{display: "flex", alignItems: "center"}} >
                            <Col>
                            {LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.CARD_HEADER}
                            </Col>
                            <Col style={{  display: "flex", justifyContent: "flex-end" }}>
                            {this.addNewUpgradeFeatureButton()}
                            </Col></Row>
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
                            <Row style={{display: "flex", alignItems: "center"}}>
                                <Col>
                                    {LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.CARD_HEADER2}
                                </Col>
                            <Col style={{ display: "flex", justifyContent: "flex-end"}}>
                            {this.addNewUpgradeFeatureButton()}
                            </Col></Row>
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
                            <Row>
                                <Col>
                                    <Card bg="dark" text="light" className="mb-3">
                                        <Card.Header style={{backgroundColor:"#263238"}}>
                                            {LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.CARD_HEADER}
                                            </Card.Header>
                                        <ListGroup variant="flush" >
                                            {this.state.features.map(feature => (
                                                <ListGroup.Item>
                                                    <b>{feature.name}:</b> {feature.value}
                                                </ListGroup.Item>
                                            ), this)}
                                            <ListGroup.Item>
                                            <b>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.SERIALNUMBER} </b>{this.state.articleTimeline.map(art => ([art.serialNumber])).shift()}</ListGroup.Item> 
                                            <ListGroup.Item>
                                            <b>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.INV_NUMBER} </b>{this.state.articleTimeline.map(art => ([art.invBroj])).shift()}</ListGroup.Item> 
                                        </ListGroup>
                                    </Card>
                                </Col>
                            </Row>
                            {this.upgradeFeature()}
                        </Col>
                    </Row>

                    <Row>
                        <Col xs="12" lg="12" sm="12">
                            <Card bg="dark" text="light" className="mb-3">
                                <Card.Header style={{backgroundColor:"#263238"}}>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.DESCRIPTION}</Card.Header>
                                <Card.Body style={{ borderRadius: "0 0 calc(.25rem - 1px) calc(.25rem - 1px)", background: "white", color: "black" }}>
                                    {article.map(desc => (desc.description))}</Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    {/* https://www.npmjs.com/package/material-react-table */}
                    <Row>
                        <Col>
                            <Card className="mb-3">
                                <TableContainer style={{ maxHeight: 300, overflowY: 'auto' }} component={Paper}>
                                    <Table sx={{ minWidth: 700 }} stickyHeader aria-label="sticky table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{LangBa.ARTICLE_ON_USER.TABLE.USER}</TableCell>
                                                <TableCell>{LangBa.ARTICLE_ON_USER.TABLE.STATUS}</TableCell>
                                                <TableCell>{LangBa.ARTICLE_ON_USER.TABLE.COMMENT}</TableCell>
                                                <TableCell>{LangBa.ARTICLE_ON_USER.TABLE.DATE_AND_TIME_ACTION}</TableCell>
                                                <TableCell>#</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {this.state.articleTimeline?.map(articleTimeline => (
                                                <TableRow hover>
                                                    <TableCell>{articleTimeline.user?.surname} {articleTimeline.user?.forname}</TableCell>
                                                    <TableCell>{articleTimeline.status}</TableCell>
                                                    <TableCell>{articleTimeline.comment}</TableCell>
                                                    <TableCell>{Moment(articleTimeline.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                                    <TableCell>{this.saveFile(articleTimeline.document?.path)}</TableCell>
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
                                        {LangBa.ARTICLE_ON_USER.STATUS.STATUS}
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

                                            <><ListGroup.Item>{LangBa.ARTICLE_ON_USER.STOCK.VALUE_ON_CONCRACT + artStock.articlesInStock.valueOnConcract}</ListGroup.Item>
                                                <ListGroup.Item>{LangBa.ARTICLE_ON_USER.STOCK.AVAILABLE_VALUE + artStock.articlesInStock.valueAvailable}</ListGroup.Item>
                                                <ListGroup.Item>{LangBa.ARTICLE_ON_USER.STOCK.SAP + artStock.articlesInStock.sapNumber}</ListGroup.Item>
                                                <ListGroup.Item>{LangBa.ARTICLE_ON_USER.STOCK.IN_STOCK_DATE + Moment(artStock.articlesInStock.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListGroup.Item>
                                            </>
                                        
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
