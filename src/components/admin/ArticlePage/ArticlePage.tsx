import React from 'react';
import api, { ApiResponse } from '../../../API/api';
import { Alert, Badge, Button, Card, Col, Container, FloatingLabel, Form, ListGroup, Modal, OverlayTrigger, Row, Tooltip, } from 'react-bootstrap';
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
interface CategoryDto {
    categoryId: number,
    name: string,
    imagePath: string,
    parentCategoryId: number,
}
interface FeatureBaseType {
    featureId?: number;
    name: string;
    value: string;
}
interface ArticlePageState {
    message: string;
    articles?: ApiArticleDto;
    categories: CategoryType[];
    feature: FeaturesType[];
    articleTimeline: ArticleTimelineType[];
    users: userData[];
    editFeature: {
        visible:boolean;
        categoryId: number;
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
}

export default class ArticlePage extends React.Component<ArticlePageProperties> {
    state: ArticlePageState;

    constructor(props: Readonly<ArticlePageProperties>) {
        super(props);
        this.state = {
            message: "",
            feature: [],
            articleTimeline: [],
            categories: [],
            users: [],
            editFeature: {
                visible: false,
                categoryId: 0,
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
        this.getArticleData()
        this.getCategories()
    }

    componentDidUpdate(oldProperties: ArticlePageProperties) {
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */
        if (oldProperties.match.params.articleID === this.props.match.params.articleID) {
            return;
        }
        this.getArticleData();
    }

    private async getFeaturesByCatId(): Promise<FeatureBaseType[]> {
        return new Promise(resolve => {
            api('api/feature/?filter=categoryId||$eq||' + this.state.articles?.categoryId + '?join=articleFeature&filter=articleFeature.articleId||$eq||' + this.props.match.params.articleID, 'get', {}, 'administrator')
            .then((res : ApiResponse) => {
            if(res.status === 'error') {
                this.setErrorMessage('Greška prilikom učitavanja detalja. Osvježite ili pokušajte ponovo kasnije')
            }
            const features: FeatureBaseType[] = res.data.map((item: any) => ({
                    featureId: item.featureId,
                    name: item.name,
                    value: item.articleFeature.map((feature: any) => (feature.value)),
                }))
            resolve(features) 
            this.setEditFeatureModalVisibleState(false)
        })
    })      
    }

    private getCategories() {
        api('api/category/?filter=parentCategoryId||$notnull', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                return;
            }
            this.putCategoriesInState(res.data)
        })
    }

    private putCategoriesInState(data?: CategoryDto[]) {
        const categories: CategoryType[] | undefined = data?.map(category => {
            return {
                categoryId: category.categoryId,
                name: category.name,
                imagePath: category.imagePath,
                parentCategoryId: category.parentCategoryId,
            };
        });

        this.setState(Object.assign(this.state, {
            categories: categories,
        }));
    }

    private async editFeatureCategoryChanged() {

        const features = await this.getFeaturesByCatId();
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

    private editFeatureInput(feature: any) {
        return (
            <><Form.Group className="mb-3 was-validated">
                <Row style={{ alignItems: 'baseline' }}>
                    <Col xs="4" sm="1" className="text-center">
                        <input type="checkbox" value="1" checked={feature.use === 1}
                            onChange={(e) => this.setEditFeatureUse(feature.featureId, e.target.checked)} />
                    </Col>

                    <Col>
                        <FloatingLabel controlId='name' label={feature.name} className="mb-3">
                            <Form.Control
                                id="name"
                                type="text"
                                placeholder={feature.name}
                                value={feature.value}
                                onChange={(e) => this.setEditFeatureValue(feature.featureId, e.target.value)}
                                required />
                        </FloatingLabel>
                    </Col>
                </Row>
            </Form.Group>
            </>

        );
    }

    private async showEditFeatureModal() {
        this.setEditFeatureModalVisibleState(true)
    }
    private getArticleData() {
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
                this.getFeaturesByCatId()
                this.editFeatureCategoryChanged()
            }
        )
        api('/api/user/', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                this.setUsers(res.data)
            }
        )
    }

    private changeStatu() {
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
                this.getArticleData()
            })
    }

    private async showModal() {
        this.setModalVisibleState(true)
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
            <>
                <RoledMainMenu role='administrator' />
                <Container style={{ marginTop: 15 }}>
                    <Card className="text-white bg-dark">
                        <Card.Header >
                            <Card.Title style={{ display: "flex", justifyContent: "start", }}>
                                
                            <i className={this.state.articles?.category?.imagePath} style={{fontSize:20, marginRight:5}}/> {
                                    this.state.articles ?
                                        this.state.articles?.name :
                                        'Oprema nije pronađena'
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
            </>
        )
    }

    private badgeStatus() {

        let status = 0;
        this.state.articles?.articlesInStock.map(stock => (
            status = stock.valueAvailable
        ))

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
        let status = 0;
        this.state.articles?.articlesInStock.map(stock => (
            status = stock.valueAvailable
        ))

        if (status === 0) {
            return (
                <Badge pill bg="danger" >
                    nema na stanju
                </Badge>
            )
        }
        if (status !== 0) {
            
            return (
                <Col style={{
                    display: "flex",
                    justifyContent: "flex-end",
                }}>
                    
                    <Button size='sm' onClick={() => this.showModal()}><i className="bi bi-pencil-square"/> Izmjeni</Button>
                    <Modal size="lg" centered show={this.state.changeStatus.visible} onHide={() => this.setModalVisibleState(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Kartica zaduženja</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group className='was-validated'>
                            <FloatingLabel controlId='userId' label="Novo zaduženje na korisnika" className="mb-3">
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
                                <FloatingLabel controlId='kolicina' label="Kolicina" className="mb-3">
                                <OverlayTrigger 
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={
                                <Tooltip id="tooltip-kolicina">Zadana vrijednost zaduženja ove opreme je 1 KOM</Tooltip>
                                }>
                                <Form.Control id='kolicina' type='text' readOnly isValid required placeholder='1 KOM' value='1 KOM' /></OverlayTrigger>  </FloatingLabel>
                                <Form.Text></Form.Text>
                            </Form.Group>
                        
                            <Form.Group className='was-validated'>
                                <FloatingLabel controlId='status' label="Status" className="mb-3">
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
                                <FloatingLabel controlId='serialNumber' label="Serijski broj" className="mb-3">
                                    <OverlayTrigger 
                                        placement="top"
                                        delay={{ show: 250, hide: 400 }}
                                        overlay={
                                        <Tooltip id="tooltip-serialNumber">U ovom koraku se dodjeljuje korisniku oprema po serijskom broju. Serijski broj se kasnije ne može mjenjati.</Tooltip>
                                        }>
                                    <Form.Control type='text' id='serialNumber' required
                                        onChange={(e) => this.setChangeStatusStringFieldState('serialNumber', e.target.value)} />
                                    </OverlayTrigger>
                                </FloatingLabel>
                                <FloatingLabel controlId='invBroj' label="Inventurni broj" className="mb-3">
                                    <OverlayTrigger 
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={
                                    <Tooltip id="tooltip-invBroj">U ovom koraku se dodjeljuje inventurni broj opremi. Inventurni broj se kasnije ne može mjenjati.</Tooltip>
                                    }>
                                    <Form.Control type='text' id='invBroj' value={this.state.changeStatus.invBroj} isValid required
                                        onChange={(e) => this.setChangeStatusStringFieldState('invBroj', e.target.value)} />
                                    </OverlayTrigger>
                                </FloatingLabel>
                            </Form.Group>
                            <Form.Group className='was-validated'>
                                <FloatingLabel controlId='comment' label="Komentar" className="mb-3">
                                    <Form.Control
                                        id="comment"
                                        as="textarea"
                                        rows={3}
                                        placeholder="(neobavezno)"
                                        style={{ height: '100px' }}
                                        onChange={(e) => this.setChangeStatusStringFieldState('comment', e.target.value)}
                                        required
                                        isValid
                                    /></FloatingLabel>
                            </Form.Group>
                            <Modal.Footer>
                                <Button variant="primary" onClick={() => this.changeStatu()}> Sačuvaj
                                </Button>
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

    private saveFile (docPath: any) {
            if(!docPath) {
                return (<>
                <Button size='sm' variant='danger'>
                    <OverlayTrigger 
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                    <Tooltip id="tooltip-prenosnica">Prenosnica nije generisana</Tooltip>
                    }><i className="bi bi-file-earmark-text" style={{ fontSize: 20 }}/></OverlayTrigger>
                    </Button></> )
            }
            if (docPath) {
                const savedFile = (docPath:any) => {
                    saveAs(
                        ApiConfig.TEMPLATE_PATH + docPath,
                        docPath
                    );
                }
                return (
                    <Button size='sm' variant='info' onClick={() => savedFile(docPath)}>
                    <i className="bi bi-file-earmark-text" style={{ fontSize: 20 }}/></Button>
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
                                <Card.Header>
                                    <Row>
                                        <Col>
                                        Detalji opreme
                                        </Col>
                                        <Col style={{ display: "flex", justifyContent: "flex-end"}}>
                                         <Button size='sm' onClick={() => this.showEditFeatureModal()} ><i className="bi bi-pencil-square"/> Izmjeni</Button>
                                        <Modal size="lg" centered show={this.state.editFeature.visible} onHide={() => this.setEditFeatureModalVisibleState(false)}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Izmjena detalja opreme</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                               {/*  {this.editFeatureCategoryChanged()} */}
                                                <Form.Group className='was-validated'>
                                                {this.state.editFeature.features.map(this.editFeatureInput, this)}
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                </Form.Group>
                                                <Modal.Footer>
                                                    <Button variant="primary" onClick={() => this.changeStatu()}> Sačuvaj
                                                    </Button>
                                                </Modal.Footer>
                                            </Modal.Body>
                                        </Modal>
                                        </Col>
                                    </Row>
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
                                                <TableCell sortDirection='desc'>Datum i vrijeme akcije</TableCell>
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
                                                    <TableCell >{Moment(articleTimeline.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                                    <TableCell>{this.saveFile(articleTimeline.documentPath)}</TableCell>
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
                                <Card.Header>
                                    <Row>
                                    <Col >
                                        U skladištu
                                    </Col>
                                        {this.changeStatusButton()}
                                    </Row>
                                </Card.Header>
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
