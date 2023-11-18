import React from 'react';
import api, { ApiResponse } from '../../../API/api';
import { Alert, Badge, Button, Card, Col, Container, FloatingLabel, Form, ListGroup, Modal, OverlayTrigger, Row, Stack, Tooltip } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import { Table, TableContainer, TableHead, TableRow, TableBody, TableCell, Link, Autocomplete, TextField, AutocompleteChangeReason, AutocompleteChangeDetails } from "@mui/material";
import Moment from 'moment';
import UserArticleDto from '../../../dtos/UserArticleDto';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import { ApiConfig } from '../../../config/api.config';
import saveAs from 'file-saver';
import { LangBa, ModalMessageArticleOnUser} from '../../../config/lang.ba'
import UserType from '../../../types/UserType';
import ArticleType from '../../../types/ArticleType';
import { KeyboardDoubleArrowDown, KeyboardDoubleArrowUp } from '@mui/icons-material';
import "./article.on.user.page.css";
interface AdminArticleOnUserPageProperties {
    match: {
        params: {
            serial: string;
        }
    }
}

interface upgradeFeaturesType {
    upgradeFeatureId: number;
    name: string;
    value: string;
    serialNumber: string;
    comment: string;
    timestamp: string;
}

interface AdminArticleOnUserPageState {
    userArticle: UserArticleDto[];
    message: string;
    article: ArticleType;
    users: UserType[];
    isLoggedIn: boolean;
    errorMessage: string;
    expandedCards: boolean[];
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
    upgradeFeatureAdd: {
        visible: boolean;
        name: string;
        value: string;
        comment: string;
        serialNumber: string;
    }

}

export default class AdminArticleOnUserPage extends React.Component<
  AdminArticleOnUserPageProperties,
  AdminArticleOnUserPageState
> {
    constructor(props: Readonly<AdminArticleOnUserPageProperties>) {
        super(props);
        this.state = {
            message: "",
            users: [],
            article: {},
            isLoggedIn: true,
            errorMessage: '',
            expandedCards: new Array(2).fill(false),
            changeStatus: {
                userId: Number(),
                articleId: 0,
                comment: '',
                serialNumber: '',
                invNumber: '',
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

    private setArticle(articleData: ArticleType) {
        this.setState(Object.assign(this.state, {
            article: articleData
        }))
    }


    private setUsers(usersData: UserType[]) {
        this.setState(Object.assign(this.state, {
            users: usersData
        }))
    }

    private toggleExpand = (index: number) => {
        this.setState((prevState) => {
          const expandedCards = [...prevState.expandedCards];
          expandedCards[index] = !expandedCards[index];
          return { expandedCards };
        });
      };
      
    componentDidMount() {
        this.getArticleData()
        this.getUpgradeFeature()
    }

    componentDidUpdate(oldProperties: AdminArticleOnUserPageProperties) {
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */
        if (oldProperties.match.params.serial === this.props.match.params.serial) {
            return;
        }
        this.getArticleData();
    }
    /* '&filter=userDetails.userId||$eq||' + this.props.match.params.userID + */
    private getArticleData() {
        api(`api/article/sb/${this.props.match.params.serial}`, 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                    return;
                }
                if (res.status === 'login') {
                    return this.setLogginState(false);
                }
                const data: ArticleType = res.data;
                this.setErrorMessage('')
                this.setArticle(data)
            }
        )

        api('/api/user/?sort=forname,ASC', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'login') {
                    return this.setLogginState(false);
                }

                this.setUsers(res.data)
            }
        )
    }

    private getUpgradeFeature () {
        api('api/upgradeFeature/?filter=serialNumber||$eq||' + this.props.match.params.serial, 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === 'login') {
                return this.setLogginState(false);
            }
            this.setUpgradeFeature(res.data)
        })
    }

    private addNewUpgradeFeature () {
        api('api/upgradeFeature/add/' + this.props.match.params.serial, 'post', {
            name: this.state.upgradeFeatureAdd.name,
            value: this.state.upgradeFeatureAdd.value,
            comment: this.state.upgradeFeatureAdd.comment,
            articleId: this.state.article.articleId,
        }, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === 'login') {
                return this.setLogginState(false);
            }
            this.setUpgradeModalVisibleState(false)
            this.getUpgradeFeature()
            this.getArticleData()
        })
    }

    private showAddUpgradeFeatureModal () {
        this.setUpgradeModalVisibleState(true)
    }

    private addNewUpgradeFeatureButton () {
        return (
        <div><Button variant='success' size='sm' onClick={() => this.showAddUpgradeFeatureModal()}>{LangBa.ARTICLE_ON_USER.BTN_UPGRADE}</Button><Modal size="lg" centered show={this.state.upgradeFeatureAdd.visible} onHide={() => this.setUpgradeModalVisibleState(false)}>
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
                            <FloatingLabel label="Naziv" className="mb-3">
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={<Tooltip id="tooltip-name">{LangBa.ARTICLE_ON_USER.TOOLTIP_NAME}</Tooltip>}>
                                    <Form.Control type='text' id='name' value={this.state.upgradeFeatureAdd.name} required
                                        onChange={(e) => this.setUpgradeFeatureStringFieldState('name', e.target.value)} />
                                </OverlayTrigger>
                            </FloatingLabel>
                            <FloatingLabel label={LangBa.ARTICLE_ON_USER.TOOLTIP_VALUE} className="mb-3">
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={<Tooltip id="tooltip-value">{LangBa.ARTICLE_ON_USER.TOOLTIP_VALUE}</Tooltip>}>
                                    <Form.Control type='text' id='value' value={this.state.upgradeFeatureAdd.value} required
                                        onChange={(e) => this.setUpgradeFeatureStringFieldState('value', e.target.value)} />
                                </OverlayTrigger>
                            </FloatingLabel>
                            <FloatingLabel label="Komentar" className="mb-3">
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={<Tooltip id="tooltip-comment">{LangBa.ARTICLE_ON_USER.TOOLTIP_COMMENT}</Tooltip>}>
                                    <Form.Control
                                    defaultValue=""
                                    type='text' 
                                    id="comment" 
                                    as="textarea"
                                    rows={3}
                                    placeholder={LangBa.ARTICLE_ON_USER.FORM_COMMENT_PLACEHOLDER}
                                    style={{ height: '100px' }}
                                    value={this.state.upgradeFeatureAdd.comment} 
                                    required
                                    onChange={(e) => this.setUpgradeFeatureStringFieldState('comment', e.target.value)} />
                                </OverlayTrigger>
                            </FloatingLabel>
                        </Form.Group>
                    </Form>
                    <Modal.Footer>
                        <Button variant='success' onClick={() => this.addNewUpgradeFeature()}>{LangBa.ARTICLE_ON_USER.BTN_SAVE}</Button>
                    </Modal.Footer>
                </Modal.Body>
            </Modal></div>
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
            <div>
                <RoledMainMenu role='administrator' />
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
                                        <i className="bi bi-exclamation-circle-fill"></i> {this.state.errorMessage}
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

    private changeStatus() {
        api('api/article/status/' + this.state.article.articleId, 'patch', {
            userId: this.state.changeStatus.userId,
            comment: this.state.changeStatus.comment,
            status: this.state.changeStatus.status,
            invNumber: this.state.changeStatus.invNumber
        }, 'administrator')
            .then((res: ApiResponse) => {
                /* Uhvatiti grešku gdje korisnik nema prava da mjenja status */
                if (res.status === "login") {
                    this.setLogginState(false);
                    return
                }
                this.setChangeStatusVisibleState(false)
                this.getArticleData()
            })
    }

    private showChangeStatusModal(article: ArticleType) {
        const sb: any = article.serialNumber;
        const inv : any = article.invNumber;
        /* const sb: any = serijskic.shift(); */
        this.setChangeStatusVisibleState(true)
        this.setChangeStatusStringFieldState('serialNumber', sb)
        if (inv === null) {
            this.setChangeStatusStringFieldState('invNumber', 'ne ladi1')
        }
        this.setChangeStatusStringFieldState('invNumber', inv)
    }

    private changeStatusButton(article: ArticleType) {
        let stat = article.status;
        const artiName = article.stock?.name;
        const userFullName: any = article.user?.fullname;

        if (stat !== LangBa.ARTICLE_ON_USER.STATUS_DESTROY) {
            return (
                <Col lg="3" xs="3" sm="3" md="3" style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center"
                }}>
                    <Button 
                        variant='success' 
                        size='sm' 
                        onClick={() => this.showChangeStatusModal(this.state.article)}>
                            {LangBa.ARTICLE_ON_USER.BTN_EDIT}
                    </Button>
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
                                <FloatingLabel label="Status" className="mb-3">
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
                            <Form.Group className='was-validated'>
                                <Autocomplete
                                    className='mb-3'
                                    disablePortal
                                    id="pick-the-user"
                                    disabled={this.state.changeStatus.status === 'razduženo' || this.state.changeStatus.status === 'otpisano'}
                                    onChange={(event, value, reason) => {
                                        if (reason === 'selectOption' && typeof value === 'string') {
                                            const selectedUser = this.state.users.find(user => user.fullname === value);
                                            if (selectedUser) {
                                                const userId = selectedUser.userId;
                                                this.setChangeStatusNumberFieldState('userId', userId || null);
                                            }
                                        }
                                    }}
                                    options={this.state.users.map((option) => option.fullname)}
                                    renderInput={(params) => <TextField {...params} label="Novo zaduženje na korisnika"/>}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">             
                                <FloatingLabel label={LangBa.ARTICLE_ON_USER.TOOLTIP_VALUE} className="mb-3">
                                <OverlayTrigger 
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={
                                <Tooltip id="tooltip-kolicina">{LangBa.ARTICLE_ON_USER.TOOLTIP_DEFAULT_VALUE}</Tooltip>
                                }>
                                <Form.Control id='kolicina' type='text' readOnly isValid required placeholder='1 KOM' value='1 KOM' /></OverlayTrigger>  </FloatingLabel>
                                <Form.Text></Form.Text> 
                            </Form.Group>
                            
                            <Form.Group>
                                <FloatingLabel label={LangBa.ARTICLE_ON_USER.FORM_LABEL_SERIALNUMBER} className="mb-3">
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
                                <FloatingLabel label={LangBa.ARTICLE_ON_USER.FORM_LABEL_INV_NUMBER} className="mb-3">
                                    <OverlayTrigger 
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={
                                    <Tooltip id="tooltip-msg-invnumber">{LangBa.ARTICLE_ON_USER.TOOLTIP_MSG_INV_NUMBER}</Tooltip>
                                    }>
                                    <Form.Control type='text' id='invNumber' value={this.state.changeStatus.invNumber} isValid required readOnly
                                        onChange={(e) => this.setChangeStatusStringFieldState('invNumber', e.target.value)} />
                                    </OverlayTrigger>
                                </FloatingLabel>
                            </Form.Group>

                            <Form.Group className='was-validated'>
                                <FloatingLabel label={LangBa.ARTICLE_ON_USER.FORM_LABEL_COMMENT} className="mb-3">
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
                                <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.NAME + userDet.user?.surname} </ListGroup.Item>
                                    <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.LASTNAME + userDet.user?.forname} </ListGroup.Item>
                                    <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.EMAIL + userDet.user?.email} </ListGroup.Item>
                                    <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.DEPARTMENT + userDet.user?.department?.title} </ListGroup.Item>
                                    <ListGroup.Item>{LangBa.ARTICLE_ON_USER.USER_DETAILS.JOBNAME + userDet.user?.job?.title} </ListGroup.Item>
                            </ListGroup>
                        </Card>
                    </Col>
                </Row>
            )
        }
    }

private saveFile (docPath: any) {
        if(!docPath) {
            return (<div>
            <Link >
                <OverlayTrigger 
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={
                <Tooltip id="tooltip-prenosnica">Prenosnica nije generisana</Tooltip>
                }><i className="bi bi-file-earmark-text" style={{ fontSize: 22, color: "red" }}/></OverlayTrigger>
                </Link></div> )
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


private doDeleteUpgradeFeature(upgradeFeatureId: number) {
    api('api/upgradeFeature/delete/' + upgradeFeatureId, 'delete', {}, 'administrator')
    .then((res: ApiResponse) => {
        if (res.status === "login") {
            this.setLogginState(false);
            return
        }
        this.getUpgradeFeature();
    })
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
                        {this.state.upgradeFeature.map((uf, index) => (
                                <ListGroup.Item key={index} >
                                    <Stack direction='horizontal' gap={3}>
                                    <div className='p-1 '> 
                                            <OverlayTrigger
                                                placement="top"
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={
                                            <Tooltip id="tooltip-kolicina">{uf.comment} <b>{LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.DATE}</b> {Moment(uf.timestamp).format('DD.MM.YYYY - HH:mm')}</Tooltip>
                                            }>
                                            <i style={{color:"darkgreen"}} className="bi bi-info-circle-fill"/>
                                            </OverlayTrigger>
                                        </div>
                                        <div className='p'><b>{uf.name}: </b> {uf.value}</div>
                                        
                                        <div className='p-2 ms-auto'>
                                            <Link onClick={e => (this.doDeleteUpgradeFeature(uf.upgradeFeatureId))} style={{cursor:'pointer'}}> <i style={{ color:"darkred"}} className="bi bi-trash3-fill"/></Link>
                                        </div>                                     
                                    </Stack>
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
        const { expandedCards } = this.state;
        return (
            <Row>
                <Col xs="12" lg="8">
                    <Row>
                        <Col xs="12" lg="4" sm="4" style={{ justifyContent: 'center', alignItems: "center", display: "flex" }}>
                            <i className={`${article.category?.imagePath}`} style={{ fontSize: 150 }}></i>
                        </Col>
                        <Col xs="12" lg="8" sm="8">
                            <Row>
                                <Col>
                                    <Card bg="dark" text="light" className="mb-3">
                                        <Card.Header style={{backgroundColor:"#263238"}}>
                                            {LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.CARD_HEADER}
                                            </Card.Header>
                                        <ListGroup className={`kartica-wrapper ${expandedCards[0] ? 'kartica-expanded' : ''}`} variant="flush" >
                                        {this.state.article.stock?.stockFeatures?.map((artFeature, index) => (
                                            <ListGroup.Item key={index}>
                                                <b>{artFeature.feature?.name}:</b> {artFeature.value}
                                            </ListGroup.Item>
                                        ))}
                                        <ListGroup.Item>
                                                <b>Komentar: </b>{this.state.article.comment}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                <b>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.SERIALNUMBER} </b>{this.state.article.serialNumber}
                                            </ListGroup.Item> 
                                            <ListGroup.Item>
                                                <b>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.INV_NUMBER} </b>{this.state.article.invNumber}
                                            </ListGroup.Item>
                                            
                                            <ListGroup.Item>
                                            </ListGroup.Item>
                                        </ListGroup>
                                        <div className='moreLess'>
                                            {this.state.article.stock?.stockFeatures ? this.state.article.stock?.stockFeatures.length > 4 && (
                                                <Link className='linkStyle' onClick={() => this.toggleExpand(0)}>
                                                    {expandedCards[0] ? <KeyboardDoubleArrowUp /> : <KeyboardDoubleArrowDown />}
                                              </Link>
                                            ):""}
                                        </div>
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
                                <Card.Body className={`kartica-wrapper description ${expandedCards[1] ? 'kartica-expanded' : ''}`}>
                                    {article.stock?.description}
                                </Card.Body>
                                <div className='moreLess'>
                                    {article.stock?.description ? article.stock?.description.length > 100 && (
                                        <Link className='linkStyle' onClick={() => this.toggleExpand(1)}>
                                            {expandedCards[1] ? <KeyboardDoubleArrowUp /> : <KeyboardDoubleArrowDown />}
                                        </Link>
                                    ):""}
                                </div>
                                
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
                                            {article.articleTimelines?.map(timeline => (
                                                <TableRow key="tabela-user" hover>
                                                    <TableCell><Link href={`#/admin/userProfile/${timeline.userId}`} style={{textDecoration:"none", fontWeight:"bold", color:"#0E5E6F"}}>{timeline.user?.fullname}</Link></TableCell>
                                                    <TableCell>{timeline.status}</TableCell>
                                                    <TableCell>{timeline.comment}</TableCell>
                                                    <TableCell>{Moment(timeline.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                                    <TableCell>{this.saveFile(timeline.document?.path)}</TableCell>
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
                                    <ListGroup.Item key="status">Status: <b>{article.status} </b></ListGroup.Item>
                                    <ListGroup.Item key="datum-akcije">Datum akcije:  {Moment(article.timestamp).format('DD.MM.YYYY. - HH:mm')} </ListGroup.Item>
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card className="text-dark bg-light mb-2" >
                                <Card.Header>U skladištu</Card.Header>
                                    <ListGroup variant="flush" >
                                        <ListGroup.Item>{LangBa.ARTICLE_ON_USER.STOCK.VALUE_ON_CONCRACT + article.stock?.valueOnContract}</ListGroup.Item>
                                        <ListGroup.Item>{LangBa.ARTICLE_ON_USER.STOCK.AVAILABLE_VALUE + article.stock?.valueAvailable}</ListGroup.Item>
                                        <ListGroup.Item>{LangBa.ARTICLE_ON_USER.STOCK.SAP + article.stock?.sapNumber}</ListGroup.Item>
                                        <ListGroup.Item>{LangBa.ARTICLE_ON_USER.STOCK.IN_STOCK_DATE + Moment(article.stock?.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListGroup.Item>
                                    </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}
