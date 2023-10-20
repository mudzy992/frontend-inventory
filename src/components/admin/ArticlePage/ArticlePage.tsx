import React from 'react';
import api, { ApiResponse } from '../../../API/api';
import {Badge, Button, Card, Col, Container, FloatingLabel, Form, ListGroup, Modal, OverlayTrigger, Row, Tooltip, } from 'react-bootstrap';
import FeaturesType from '../../../types/FeaturesType';
import ApiArticleDto from '../../../dtos/ApiArticleDto';
import Moment from 'moment';
import { Table, TableContainer, TableHead, TableRow, TableBody, TableCell, Link, } from "@mui/material";
import ArticleTimelineType from '../../../types/ArticleTimelineType';
import Paper from '@mui/material/Paper';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import saveAs from 'file-saver';
import { ApiConfig } from '../../../config/api.config';
import CategoryType from '../../../types/CategoryType';
import ArticleTable from './ArticleTable';

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
interface FeatureBaseType {
    featureId?: number;
    name: string;
    value: string;
}
interface ArticlePageState {
    message: string;
    articles?: ApiArticleDto;
    feature: FeaturesType[];
    articleTimeline: ArticleTimelineType[];
    users: userData[];
    editFeature: {
        visible:boolean;
        categoryId: number;
        name: string;
        excerpt: string;
        description: string;
        concract: string;
        comment: string;
        valueOnConcract: number;
        valueAvailable: number;
        sap_number: string;
        features: {
            use: number;
            featureId: number;
            name: string;
            value: string;
        }[]
    }
    changeStatus: {
        visible: boolean;
        userId: number | null;
        articleId: number | null;
        value: number | null;
        comment: string;
        serialNumber: string;
        invBroj: string;
        status: string;
    };
    currentPage: number;
    itemsPerPage: number;
}

export default class ArticlePage extends React.Component<ArticlePageProperties> {
    state: ArticlePageState;

    constructor(props: Readonly<ArticlePageProperties>) {
        super(props);
        this.state = {
            message: "",
            feature: [],
            articleTimeline: [],
            users: [],
            editFeature: {
                visible: false,
                categoryId: 0,
                name: "",
                excerpt: "",
                description: "",
                concract: "",
                comment: "",
                valueOnConcract: 0,
                valueAvailable: 0,
                sap_number: "",
                features:[],
            },
            changeStatus: {
                userId: 0,
                articleId: 0,
                value: null,
                comment: '',
                serialNumber: '',
                status: '',
                invBroj: '',
                visible: false,
            },
            currentPage: Number(),
            itemsPerPage: 5,
        }
    }

    private setArticles(articleData: ApiArticleDto | undefined) {
        this.setState(Object.assign(this.state, {
            articles: articleData
        }))
    }

    private setFeaturesData(featuresData: FeaturesType[]) {
        this.setState(Object.assign(this.state, {
            feature: featuresData
        }))
    }

    private setEditArticleStringFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.editFeature, {
                [fieldName]: newValue,
            })))
    }

    private setEditArticleNumberFieldState(fieldName: string, newValue: any) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.editFeature, {
                [fieldName]: (newValue === 'null') ? null : Number(newValue),
            })))
    }

    private setEditFeatureUse(featureId: number, use: boolean) {
        const addFeatures: { featureId: number; use: number; }[] = [...this.state.editFeature.features];

        for (const feature of addFeatures) {
            if (feature.featureId === featureId) {
                feature.use = use ? 1 : 0;
                break;
            }
        }

        this.setState(Object.assign(this.state,
            Object.assign(this.state.editFeature, {
                features: addFeatures,
            }),
        ));
    }

    private setEditFeatureValue(featureId: number, value: string) {
        const addFeatures: { featureId: number; value: string; }[] = [...this.state.editFeature.features];

        for (const feature of addFeatures) {
            if (feature.featureId === featureId) {
                feature.value = value;
                break;
            }
        }

        this.setState(Object.assign(this.state,
            Object.assign(this.state.editFeature, {
                features: addFeatures,
            }),
        ));
    }

    private setModalVisibleState(newState: boolean) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.changeStatus, {
                visible: newState,
            })
        ));
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

    private setEditFeatureModalVisibleState(newState: boolean) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.editFeature, {
                visible: newState,
            })
        ));
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

    componentDidMount() {
        this.getArticleData(1)
    }

    componentDidUpdate(oldProperties: ArticlePageProperties) {
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */
        if (oldProperties.match.params.articleID === this.props.match.params.articleID) {
            return;
        }
        this.getArticleData(1);
    }

    private async editFeatureCategoryChanged() {
        const features = await this.getFeaturesByCategoryId();
        const stateFeatures = features.map(feature => ({
            featureId: feature.featureId,
            name: feature.name,
            value: feature.value,
            use: 0,
        }));

        this.setState(Object.assign(this.state,
            Object.assign(this.state.editFeature, {
                features: stateFeatures,
            }),
        ));
    }

    private async getFeaturesByCategoryId(): Promise<FeatureBaseType[]> {
        return new Promise(resolve => {
            api('/api/feature/?filter=categoryId||$eq||' + this.state.editFeature.categoryId + '/', 'get', {}, 'administrator')
            .then((res: ApiResponse) => { 
                const features: FeatureBaseType[] = res.data.map((item: any) => ({
                    featureId: item.featureId,
                    name: item.name,
                    value: item.articleFeature.map((feature: any) => (feature.value)),
                }));
                resolve(features);
            })
        })
    }

    private editFeatureInput(feature: any) {
        return (
            <div><Form.Group className="mb-3 was-validated">
                <Row style={{ alignItems: 'baseline' }}>
                    <Col xs="4" sm="1" className="text-center">
                        <input type="checkbox" value="1" checked={feature.use === 1}
                            onChange={(e) => this.setEditFeatureUse(feature.featureId, e.target.checked)} />
                    </Col>

                    <Col>
                        <FloatingLabel label={feature.name} className="mb-3">
                        <OverlayTrigger 
                            placement="top"
                            delay={{ show: 250, hide: 400 }}
                            overlay={
                            <Tooltip id="tooltip-serialNumber">U slučaju da se ne označi kvadratić pored, osobina neće biti prikazana</Tooltip>
                            }> 
                            <Form.Control
                                id="name"
                                type="text"
                                placeholder={feature.name}
                                value={feature.value}
                                onChange={(e) => this.setEditFeatureValue(feature.featureId, e.target.value)}
                                required /></OverlayTrigger>
                        </FloatingLabel>
                    </Col>
                </Row>
            </Form.Group>
            </div>
        );
    }
    
    private async showEditFeatureModal() {
        this.setEditFeatureModalVisibleState(true)
    }

    private async putArticleDetailsInState(article: ApiArticleDto) {
        this.setEditArticleNumberFieldState('categoryId', Number(article.categoryId))
        this.setEditArticleStringFieldState('name', String(article.name))
        this.setEditArticleStringFieldState('excerpt', String(article.excerpt))
        this.setEditArticleStringFieldState('description', String(article.description))
        this.setEditArticleStringFieldState('concract', String(article.concract))
        this.setEditArticleStringFieldState('comment', String(article.comment))
        this.setEditArticleStringFieldState('valueOnConcract', String(article.articlesInStock.valueOnConcract))
        this.setEditArticleStringFieldState('valueAvailable', String(article.articlesInStock.valueAvailable))
        this.setEditArticleStringFieldState('sap_number', String(article.sapNumber))

        if (!article.categoryId) {
            return;
        }

        const allFeatures: any[] = await this.getFeaturesByCategoryId();

        for (const apiFeature of allFeatures) {
            apiFeature.use   = 0;
            apiFeature.value = '';

            if (!article.articleFeature) {
                continue;
            }

            for (const articleFeature of article.articleFeature) {
                if (articleFeature.featureId === apiFeature.featureId) {
                    apiFeature.use = 1;
                    apiFeature.value = articleFeature.value;
                }
            }
        }

        this.setState(Object.assign(this.state,
            Object.assign(this.state.editFeature, {
                features: allFeatures,
            }),
        ));
    }


    private getArticleData(page:number) {
        const itemsPerPage = this.state.itemsPerPage;
        const offset = (page - 1) * itemsPerPage;
        //const includeRelations = ['category', 'userDetails', 'articleFeature', 'features', 'userArticles', 'documents'];
        //const includeParam = includeRelations.join(',');
        //api('api/article/p/'+ this.props.match.params.articleID +`/?perPage=${itemsPerPage}&offset=${offset}`, 'get', {}, 'administrator')
        api('api/article/' + this.props.match.params.articleID, 'get', {}, 'administrator')
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
                    let value = articleFeature.value;
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

                for (const statusRespon of data.userArticles) {
                    let articleId = data.articleId;
                    let surname = '';
                    let forname = '';
                    let comment = statusRespon.comment;
                    let status = '';
                    let serialNumber = '';
                    let timestamp = '';
                    let userId = 0;
                    let documentPath = '';
                    if (statusRespon.articleId === data.articleId) {
                        status = statusRespon.status;
                        serialNumber = statusRespon.serialNumber;
                        timestamp = statusRespon.timestamp;
                        for (const user of data.userDetails) {
                            if (statusRespon.userId === user.userId) {
                                userId = user.userId;
                                surname = user.surname;
                                forname = user.forname;
                            }
                        }
                    }
                    for (const doc of data.documents) {
                        if (doc.documentsId === statusRespon.documentId) {
                            documentPath = doc.path;
                            break;
                        }
                    }
                    articleTimeline.push({ surname, forname, status, comment, serialNumber, articleId, timestamp, documentPath, userId })
                }
                this.setArticleTimelineData(articleTimeline)
                this.editFeatureCategoryChanged()
                this.putArticleDetailsInState(res.data)
            }
        )
        
    }

    private async getUsers(){
        api('/api/user/', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                this.setUsers(res.data)
            }
        )
    }
    
    private doEditArticle() {
        const curPage = this.state.currentPage;
        api('api/article/' + this.props.match.params.articleID, 'patch', {
            categoryId: this.state.editFeature.categoryId,
            details : {
                name: this.state.editFeature.name,
                excerpt: this.state.editFeature.excerpt,
                description: this.state.editFeature.description,
                concract: this.state.editFeature.concract,
                comment: this.state.editFeature.comment,
                sap_number: this.state.editFeature.sap_number,
            },
            stock:{
                valueOnConcract: this.state.editFeature.valueOnConcract,
                valueAvailable: this.state.editFeature.valueAvailable,
                sap_number: this.state.editFeature.sap_number,
            },
            features: this.state.editFeature.features
                .filter(feature => feature.use === 1)
                .map(feature => ({
                    featureId: feature.featureId,
                    value: feature.value
                })),
        }, 'administrator')
        .then((res: ApiResponse) => {
            /* Hvatati grešku ako korisnik nema pravo da mjenja status */
            this.setEditFeatureModalVisibleState(false)
            this.getArticleData(Number(curPage))
        })
    }

    private changeStatu() {
        const curPage = this.state.currentPage;
        api('api/userArticle/add/' + this.state.changeStatus.userId, 'post', {
            articleId: this.props.match.params.articleID,
            value: 1,
            comment: this.state.changeStatus.comment,
            serialNumber: this.state.changeStatus.serialNumber,
            status: this.state.changeStatus.status,
            invBroj: this.state.changeStatus.invBroj,
        }, 'administrator')
            .then((res: ApiResponse) => {
                /* Hvatati grešku ako korisnik nema pravo da mjenja status */
                this.setModalVisibleState(false)
                this.getArticleData(Number(curPage))
            })
    }

    private async showModal() {
        this.setModalVisibleState(true)
        this.getUsers()
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
            <div>
                <RoledMainMenu role='administrator' />
                <Container style={{ marginTop: 15 }}>
                    <Card className="text-white bg-dark">
                        <Card.Header >
                            <Card.Title>
                                <Row style={{
                                            display: "flex",
                                            alignItems: "center",
                                        }}>
                                        <Col md="auto" xs="auto">
                                        <i className={this.state.articles?.category?.imagePath}/>
                                        </Col>
                                        <Col md="auto" xs="auto">
                                            {
                                            this.state.articles ?
                                                this.state.articles?.name :
                                                'Oprema nije pronađena'
                                            }
                                        </Col>    
                                        <Col md="auto" xs="auto">
                                            {this.badgeStatus()}
                                        </Col>
                                        <Col style={{ display: "flex", justifyContent: "flex-end"}}>
                                            <Button className="btn" size='sm' onClick={() => this.showEditFeatureModal()} ><i className="bi bi-pencil-square"/> Izmjeni</Button> 
                                        </Col>
                                </Row>
                                
                            
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
            </div>
        )
    }

    private badgeStatus() {

        let status = Number(this.state.editFeature?.valueAvailable);

        if (status === 0) {
            return (
                <Badge pill bg="danger" style={{ marginLeft: 10, alignItems: "center", display: "flex", fontSize: 12 }}>
                    nema na stanju
                </Badge>
                )
        }
        if (status > 0) {
            return (
                <Badge pill bg="success" style={{ marginLeft: 10, alignItems: "center", display: "flex", fontSize: 12 }}>
                    dostupno
                </Badge>
                )
        }

    }

    private changeStatusButton() {
        let status = Number(this.state.articles?.articlesInStock.valueAvailable);
        /* this.state.articles?.articlesInStock.map(stock => (
            status = stock.valueAvailable
        )) */

        if (status === 0) {
            return (
                <Badge pill bg="danger" >
                    nema na stanju
                </Badge>
            )
        }
        if (status > 0) {
            
            return (
                
                    
                    <div><Button size='sm' onClick={() => this.showModal()}><i className="bi bi-pencil-square" /> Izmjeni/zaduži</Button><Modal size="lg" centered show={this.state.changeStatus.visible} onHide={() => this.setModalVisibleState(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Kartica zaduženja</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className='was-validated'>
                            <FloatingLabel label="Novo zaduženje na korisnika" className="mb-3">
                                <Form.Select placeholder='izaberi korisnika' id='userId' required
                                    onChange={(e) => this.setChangeStatusNumberFieldState('userId', e.target.value)}>
                                    <option value=''>izaberi korisnika</option>
                                    {this.state.users.map(users => (
                                        <option value={users.userId.toString()}>{users.forname} {users.surname}</option>
                                    ))}
                                </Form.Select>
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <FloatingLabel label="Kolicina" className="mb-3">
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={<Tooltip id="tooltip-kolicina">Zadana vrijednost zaduženja ove opreme je 1 KOM</Tooltip>}>
                                    <Form.Control id='kolicina' type='text' readOnly isValid required placeholder='1 KOM' value='1 KOM' /></OverlayTrigger>  </FloatingLabel>
                            <Form.Text></Form.Text>
                        </Form.Group>

                        <Form.Group className='was-validated'>
                            <FloatingLabel label="Status" className="mb-3">
                                <Form.Select id="status" required
                                    onChange={(e) => this.setChangeStatusStringFieldState('status', e.target.value)}>
                                    <option value=''> izaberi status</option>
                                    <option value='zaduženo'>
                                        zaduženo
                                    </option>
                                    <option value='razduženo'>
                                        razduženo
                                    </option>
                                    <option value='otpisano'>
                                        otpisano
                                    </option>
                                </Form.Select>
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group className='was-validated'>
                            <FloatingLabel label="Serijski broj" className="mb-3">
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={<Tooltip id="tooltip-serialNumber">U ovom koraku se dodjeljuje korisniku oprema po serijskom broju. Serijski broj se kasnije ne može mjenjati.</Tooltip>}>
                                    <Form.Control type='text' id='serialNumber' required
                                        onChange={(e) => this.setChangeStatusStringFieldState('serialNumber', e.target.value)} />
                                </OverlayTrigger>
                            </FloatingLabel>
                            <FloatingLabel label="Inventurni broj" className="mb-3">
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={<Tooltip id="tooltip-invBroj">U ovom koraku se dodjeljuje inventurni broj opremi. Inventurni broj se kasnije ne može mjenjati.</Tooltip>}>
                                    <Form.Control type='text' id='invBroj' value={this.state.changeStatus.invBroj} isValid required
                                        onChange={(e) => this.setChangeStatusStringFieldState('invBroj', e.target.value)} />
                                </OverlayTrigger>
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group className='was-validated'>
                            <FloatingLabel label="Komentar" className="mb-3">
                                <Form.Control
                                    id="comment"
                                    as="textarea"
                                    rows={3}
                                    placeholder="(neobavezno)"
                                    style={{ height: '100px' }}
                                    onChange={(e) => this.setChangeStatusStringFieldState('comment', e.target.value)}
                                    required
                                    isValid /></FloatingLabel>
                        </Form.Group>
                        <Modal.Footer>
                            <Button variant="primary" onClick={() => this.changeStatu()}> Sačuvaj
                            </Button>
                        </Modal.Footer>
                    </Modal.Body>
                </Modal></div>
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
                                <Card.Header style={{backgroundColor:"#263238"}}>
                                        Detalji opreme
                                        <Modal size="lg" centered show={this.state.editFeature.visible} onHide={() => this.setEditFeatureModalVisibleState(false)}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Izmjena detalja opreme</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <Form>
                                                <Form.Group className="mb-3 was-validated">
                                                <FloatingLabel label="Naziv opreme" className="mb-3">
                                                    <Form.Control 
                                                    id="name" 
                                                    type="text" 
                                                    placeholder="Naziv"
                                                    value={ this.state.editFeature.name }
                                                    onChange={ (e) => this.setEditArticleStringFieldState('name', e.target.value) }
                                                    required />
                                                </FloatingLabel>
                                                <FloatingLabel label="Kratki opis" className="mb-3">
                                                    <Form.Control 
                                                    id="excerpt" 
                                                    as="textarea" 
                                                    rows={3} 
                                                    style={{ height: '100px' }}
                                                    placeholder="Kratki opis"
                                                    value={ this.state.editFeature.excerpt }
                                                    onChange={ (e) => this.setEditArticleStringFieldState('excerpt', e.target.value) }
                                                    required />
                                                </FloatingLabel>
                                                <FloatingLabel label="Detaljan opis" className="mb-3">
                                                    <Form.Control 
                                                    id="description" 
                                                    as="textarea" 
                                                    rows={5} 
                                                    style={{ height: '100px' }}
                                                    placeholder="Detaljan opis"
                                                    value={ this.state.editFeature.description }
                                                    onChange={ (e) => this.setEditArticleStringFieldState('description', e.target.value) }
                                                    required />
                                                </FloatingLabel>
                                                <FloatingLabel label="Ugovor" className="mb-3">
                                                    <Form.Control 
                                                    id="concract" 
                                                    type="text" 
                                                    placeholder="Ugovor"
                                                    value={ this.state.editFeature.concract }
                                                    onChange={ (e) => this.setEditArticleStringFieldState('concract', e.target.value) }
                                                    required />
                                                </FloatingLabel>
                                                <FloatingLabel label="Stanje po ugovoru" className="mb-3">
                                                    <Form.Control 
                                                    id="valueOnConcract" 
                                                    type="text" 
                                                    placeholder="Stanje po ugovoru"
                                                    value={ this.state.editFeature.valueOnConcract }
                                                    onChange={ (e) => this.setEditArticleNumberFieldState('valueOnConcract', e.target.value) }
                                                    required
                                                    readOnly />
                                                </FloatingLabel>
                                                <FloatingLabel label="Dostupno artikala" className="mb-3">
                                                    <Form.Control 
                                                    id="valueAvailable" 
                                                    type="text" 
                                                    placeholder="SAP Broj"
                                                    value={ this.state.editFeature.valueAvailable }
                                                    onChange={ (e) => this.setEditArticleNumberFieldState('valueAvailable', e.target.value) }
                                                    required />
                                                </FloatingLabel>
                                                <FloatingLabel label="SAP broj" className="mb-3">
                                                    <Form.Control 
                                                    id="sap_number" 
                                                    type="text" 
                                                    placeholder="SAP Broj"
                                                    value={ this.state.editFeature.sap_number }
                                                    onChange={ (e) => this.setEditArticleStringFieldState('sap_number', e.target.value) }
                                                    required />
                                                </FloatingLabel>
                                                <FloatingLabel label="Komentar" className="mb-3">
                                                    <Form.Control
                                                    id="comment"
                                                    as="textarea"
                                                    rows={3}
                                                    style={{ height: '100px' }}
                                                    value={ this.state.editFeature.comment }
                                                    onChange={ (e) => this.setEditArticleStringFieldState('comment', e.target.value) }
                                                    required
                                                    isValid
                                                    />
                                                </FloatingLabel>
                                                </Form.Group>
                                                    <Form.Group className='was-validated'>
                                                        {this.state.editFeature.features.map(this.editFeatureInput, this)}
                                                    </Form.Group>
                                                </Form>
                                                <Modal.Footer>
                                                    <Button variant="primary" onClick={() => this.doEditArticle()}> Sačuvaj
                                                    </Button>
                                                </Modal.Footer>
                                            </Modal.Body>
                                        </Modal>
                                    </Card.Header>
                                <ListGroup variant="flush" >
                                    {this.state.feature.map(feature => (
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
                                <Card.Header style={{backgroundColor:"#263238"}}>Detaljan opis</Card.Header>
                                <Card.Body style={{ borderRadius: "0 0 calc(.25rem - 1px) calc(.25rem - 1px)", background: "white", color: "black" }}>{article.description}</Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card className="mb-3"> 
                            <ArticleTable articleId={this.props.match.params.articleID} />
                            </Card>
                        </Col>
                    </Row>

                    {/* <Row>
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
                                                <TableCell>Datum i vrijeme akcije</TableCell>
                                                <TableCell>#</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {this.state.articleTimeline?.map(articleTimeline => (
                                                <TableRow hover>
                                                    <TableCell><Link href={`#/admin/userProfile/${articleTimeline.userId}`} style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                                                        {articleTimeline.surname} {articleTimeline.forname}</Link>
                                                    </TableCell>
                                                    <TableCell>{articleTimeline.status}</TableCell>
                                                    <TableCell>{articleTimeline.comment}</TableCell>
                                                    <TableCell><Link href={`#/admin/userArticle/${articleTimeline.userId}/${articleTimeline.articleId}/${articleTimeline.serialNumber}`} style={{ textDecoration: 'none', fontWeight: 'bold' }} >
                                                        {articleTimeline.serialNumber}</Link>
                                                    </TableCell>
                                                    <TableCell>{Moment(articleTimeline.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                                    <TableCell style={{ justifyContent: 'center'}}>{this.saveFile(articleTimeline.documentPath)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Card>
                        </Col>
                    </Row> */}
                </Col>
                <Col sm="12" xs="12" lg="4" >
                    <Row>
                        <Col>
                            <Card className="text-dark bg-light mb-2" >
                                <Card.Header>
                                    <Row style={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}>
                                    <Col style={{
                                        display: "flex",
                                        justifyContent: "flex-start",
                                    }}>
                                        U skladištu
                                    </Col>
                                    <Col style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}>
                                    {this.changeStatusButton()}
                                    </Col>
                                        
                                    </Row>
                                </Card.Header>
                                 <ListGroup variant="flush" >
                                            <ListGroup.Item>Stanje po ugovoru: {this.state.articles?.articlesInStock.valueOnConcract}</ListGroup.Item>
                                            <ListGroup.Item>Trenutno stanje: {this.state.articles?.articlesInStock.valueAvailable}</ListGroup.Item>
                                            <ListGroup.Item>SAP broj: {this.state.articles?.articlesInStock.sapNumber}</ListGroup.Item>
                                            <ListGroup.Item>Stanje na: {Moment(this.state.articles?.articlesInStock.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListGroup.Item>
                                </ListGroup> 
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}
