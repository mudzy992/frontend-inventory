import React from 'react';
import api, { ApiResponse } from '../../../API/api';
import { Badge, Button, Card, Col, Container, FloatingLabel, Form, ListGroup, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import Moment from 'moment';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import StockType from '../../../types/StockType';
import StockArticleTable from './StockArticleTable';

interface StockPageProperties {
    match: {
        params: {
            stockID: number;
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

interface StockPageState {
    message: string;
    stock: StockType;
    users: userData[];
    editFeature: {
        visible: boolean;
        categoryId: number;
        name: string;
        excerpt: string;
        description: string;
        contract: string;
        comment: string;
        valueOnConcract: number;
        valueAvailable: number;
        sapNumber: string;
        features: {
            use: number;
            featureId: number;
            articleFeatures: {
                value: string;
            }[]
        }[]
    }
    changeStatus: {
        visible: boolean;
        userId: number | null;
        articleId: number | null;
        comment: string;
        serialNumber: string;
        invBroj: string;
        status: string;
    };
}

export default class StockPage extends React.Component<StockPageProperties> {
    state: StockPageState;

    constructor(props: Readonly<StockPageProperties>) {
        super(props);
        this.state = {
            message: "",
            stock: {},
            users: [],
            editFeature: {
                visible: false,
                categoryId: 0,
                name: "",
                excerpt: "",
                description: "",
                contract: "",
                comment: "",
                valueOnConcract: 0,
                valueAvailable: 0,
                sapNumber: "",
                features: [],
            },
            changeStatus: {
                userId: 0,
                articleId: 0,
                comment: '',
                serialNumber: '',
                status: '',
                invBroj: '',
                visible: false,
            },
        }
    }

    private setStocks(stockData: StockType | undefined) {
        this.setState(Object.assign(this.state, {
            stock: stockData
        }))
    }

    private setEditArticleStringFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.editFeature, {
                [fieldName]: newValue,
            }))
        );
    }

    private setEditArticleNumberFieldState(fieldName: string, newValue: any) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.editFeature, {
                [fieldName]: (newValue === 'null') ? null : Number(newValue),
            }))
        );
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
        const updatedFeatures = this.state.editFeature.features.map(feature => {
            if (feature.featureId === featureId) {
                if (!feature.articleFeatures) {
                    // Ako značajka nema articleFeatures, dodajte novi objekt
                    feature.articleFeatures = [{ value: value }];
                } else {
                    // Ako značajka već ima articleFeatures, ažuriraj postojeći
                    feature.articleFeatures[0].value = value;
                }
            }
            return feature;
        });
    
        this.setState({
            editFeature: {
                ...this.state.editFeature,
                features: updatedFeatures,
            },
        });
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
            }))
        );
    }

    private setChangeStatusNumberFieldState(fieldName: string, newValue: any) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.changeStatus, {
                [fieldName]: (newValue === 'null') ? null : Number(newValue),
            }))
        );
    }

    componentDidMount() {
        this.getStockData();
    }

    componentDidUpdate(oldProperties: StockPageProperties) {
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */
        if (oldProperties.match.params.stockID === this.props.match.params.stockID) {
            return;
        }
        this.getStockData();
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
            api('/api/feature/?filter=categoryId||$eq||' + this.state.stock.categoryId + '/', 'get', {}, 'administrator')
                .then((res: ApiResponse) => {
                    const features: FeatureBaseType[] = res.data.map((item: any) => ({
                        featureId: item.featureId,
                        name: item.name,
                        value: item.articleFeatures.map((feature: any) => (feature.value)),
                    }));
                    resolve(features);
                })
        });
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
                                    required
                                />
                            </OverlayTrigger>
                        </FloatingLabel>
                    </Col>
                </Row>
            </Form.Group>
            </div>
        );
    }

    private async showEditFeatureModal() {
        this.setEditFeatureModalVisibleState(true);
    }

    private async putArticleDetailsInState(article: StockType) {

        this.setEditArticleNumberFieldState('categoryId', Number(article.categoryId));
        this.setEditArticleStringFieldState('name', String(article.name));
        this.setEditArticleStringFieldState('excerpt', String(article.excerpt));
        this.setEditArticleStringFieldState('description', String(article.description));
        this.setEditArticleStringFieldState('contract', String(article.contract));
        this.setEditArticleStringFieldState('comment', String(article.timestamp));
        this.setEditArticleStringFieldState('valueOnConcract', String(article.valueOnContract));
        this.setEditArticleStringFieldState('valueAvailable', String(article.valueAvailable));
        this.setEditArticleStringFieldState('sapNumber', String(article.sapNumber));

        if (!article.categoryId) {
            return;
        }

        const allFeatures: any[] = await this.getFeaturesByCategoryId();

        for (const apiFeature of allFeatures) {
            apiFeature.use = 0;
            apiFeature.value = '';

            if (!article.articles) {
                continue;
            }
            for (const art of article.articles) {
                if (!art?.articleFeatures) {
                    continue;
                }
                for (const articleFeature of art.articleFeatures) {
                    if (articleFeature.featureId === apiFeature.featureId) {
                        apiFeature.use = 1;
                        apiFeature.value = articleFeature.value;
                    }
                }
            }

        }

        this.setState(Object.assign(this.state,
            Object.assign(this.state.editFeature, {
                features: allFeatures,
            }),
        ));
    }

    private getStockData() {
        api('api/stock/' + this.props.match.params.stockID, 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    this.setStocks(undefined);
                    this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                    return;
                }

                const data: StockType = res.data;
                this.setErrorMessage('');
                this.setStocks(data);

                this.editFeatureCategoryChanged();
                this.putArticleDetailsInState(res.data);
            }
            )

    }

    private async getUsers() {
        api('/api/user/', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                this.setUsers(res.data);
            }
            )
    }

    private doEditArticle() {
        api('api/stock/' + this.props.match.params.stockID, 'put', {
            name: this.state.editFeature.name,
            excerpt: this.state.editFeature.excerpt,
            description: this.state.editFeature.description,
            contract: this.state.editFeature.contract,
            categoryId: this.state.editFeature.categoryId,
            sapNumber: this.state.editFeature.sapNumber,
            valueOnContract: this.state.editFeature.valueOnConcract,
            valueAvailable: this.state.editFeature.valueAvailable,
            features: this.state.editFeature.features
                .filter(feature => feature.use === 1)
                .map(feature => ({
                    featureId: feature.featureId,
                    articleFeatures: feature.articleFeatures ?
                        feature.articleFeatures.map(af => ({ value: af.value })) : []
                })),
        }, 'administrator')
            .then((res: ApiResponse) => {
                /* Hvatati grešku ako korisnik nema pravo da mijenja status */
                this.setEditFeatureModalVisibleState(false);
                this.getStockData();
            });
    }

    // Ovo je changeStatus kada se prvi put iz stocka zadužuje artikal
    private changeStatus() {
        api('api/article/' + this.props.match.params.stockID, 'post', {
            stockId: this.props.match.params.stockID,
            userId: this.state.changeStatus.userId,
            comment: this.state.changeStatus.comment,
            serialNumber: this.state.changeStatus.serialNumber,
            status: this.state.changeStatus.status,
            invNumber: this.state.changeStatus.invBroj,
        }, 'administrator')
            .then((res: ApiResponse) => {
                /* Hvatati grešku ako korisnik nema pravo da mijenja status */
                this.setModalVisibleState(false);
                this.getStockData();
            });
    }

    private async showModal() {
        this.setModalVisibleState(true);
        this.getUsers();
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
                                        <i className={this.state.stock?.category?.imagePath}/>
                                        </Col>
                                        <Col md="auto" xs="auto">
                                            {
                                            this.state.stock ?
                                                this.state.stock?.name :
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
                                    this.state.stock ?
                                        (this.renderStockData(this.state.stock)) :
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

        let status = Number(this.state.stock?.valueAvailable);

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
        let status = Number(this.state.stock?.valueAvailable);
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
                            <Button variant="primary" onClick={() => this.changeStatus()}> Sačuvaj
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

    renderStockData(article: StockType) {
        
        return (
            <><Row>
                <Col xs="12" lg="8">
                    <Row>
                        <Col xs="12" lg="4" sm="4" style={{ justifyContent: 'center', alignItems: "center", display: "flex" }}>
                            <i className={`${article.category?.imagePath}`} style={{ fontSize: 150 }}></i>
                        </Col>
                        <Col xs="12" lg="8" sm="8">
                            <Card bg="dark" text="light" className="mb-3">
                                <Card.Header style={{ backgroundColor: "#263238" }}>
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
                                                            value={this.state.editFeature.name}
                                                            onChange={(e) => this.setEditArticleStringFieldState('name', e.target.value)}
                                                            required />
                                                    </FloatingLabel>
                                                    <FloatingLabel label="Kratki opis" className="mb-3">
                                                        <Form.Control
                                                            id="excerpt"
                                                            as="textarea"
                                                            rows={3}
                                                            style={{ height: '100px' }}
                                                            placeholder="Kratki opis"
                                                            value={this.state.editFeature.excerpt}
                                                            onChange={(e) => this.setEditArticleStringFieldState('excerpt', e.target.value)}
                                                            required />
                                                    </FloatingLabel>
                                                    <FloatingLabel label="Detaljan opis" className="mb-3">
                                                        <Form.Control
                                                            id="description"
                                                            as="textarea"
                                                            rows={5}
                                                            style={{ height: '100px' }}
                                                            placeholder="Detaljan opis"
                                                            value={this.state.editFeature.description}
                                                            onChange={(e) => this.setEditArticleStringFieldState('description', e.target.value)}
                                                            required />
                                                    </FloatingLabel>
                                                    <FloatingLabel label="Ugovor" className="mb-3">
                                                        <Form.Control
                                                            id="concract"
                                                            type="text"
                                                            placeholder="Ugovor"
                                                            value={this.state.editFeature.contract}
                                                            onChange={(e) => this.setEditArticleStringFieldState('concract', e.target.value)}
                                                            required />
                                                    </FloatingLabel>
                                                    <FloatingLabel label="Stanje po ugovoru" className="mb-3">
                                                        <Form.Control
                                                            id="valueOnConcract"
                                                            type="text"
                                                            placeholder="Stanje po ugovoru"
                                                            value={this.state.editFeature.valueOnConcract}
                                                            onChange={(e) => this.setEditArticleNumberFieldState('valueOnConcract', e.target.value)}
                                                            required
                                                            readOnly />
                                                    </FloatingLabel>
                                                    <FloatingLabel label="Dostupno artikala" className="mb-3">
                                                        <Form.Control
                                                            id="valueAvailable"
                                                            type="text"
                                                            placeholder="SAP Broj"
                                                            value={this.state.editFeature.valueAvailable}
                                                            onChange={(e) => this.setEditArticleNumberFieldState('valueAvailable', e.target.value)}
                                                            required />
                                                    </FloatingLabel>
                                                    <FloatingLabel label="SAP broj" className="mb-3">
                                                        <Form.Control
                                                            id="sap_number"
                                                            type="text"
                                                            placeholder="SAP Broj"
                                                            value={this.state.editFeature.sapNumber}
                                                            onChange={(e) => this.setEditArticleStringFieldState('sapNumber', e.target.value)}
                                                            required />
                                                    </FloatingLabel>
                                                    <FloatingLabel label="Komentar" className="mb-3">
                                                        <Form.Control
                                                            id="comment"
                                                            as="textarea"
                                                            rows={3}
                                                            style={{ height: '100px' }}
                                                            value={this.state.editFeature.comment}
                                                            onChange={(e) => this.setEditArticleStringFieldState('comment', e.target.value)}
                                                            required
                                                            isValid />
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
                                <ListGroup variant="flush">
                                {article.category && article.category.features && article.category.features.map(feature => (
                                    feature.articleFeatures && feature.articleFeatures.map(artFeature => (
                                        <ListGroup.Item key={artFeature.feature?.name}>
                                            <b>{feature.name}:</b> {artFeature.value}
                                        </ListGroup.Item>
                                    ))
                                ))}


                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12" lg="12" sm="12">
                            <Card bg="dark" text="light" className="mb-3">
                                <Card.Header style={{ backgroundColor: "#263238" }}>Detaljan opis</Card.Header>
                                <Card.Body style={{ borderRadius: "0 0 calc(.25rem - 1px) calc(.25rem - 1px)", background: "white", color: "black" }}>{article.description}</Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    

                </Col>
                <Col sm="12" xs="12" lg="4">
                    <Row>
                        <Col>
                            <Card className="text-dark bg-light mb-2">
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
                                <ListGroup variant="flush">
                                    <ListGroup.Item>Stanje po ugovoru: {article.valueOnContract}</ListGroup.Item>
                                    <ListGroup.Item>Trenutno stanje: {article.valueAvailable}</ListGroup.Item>
                                    <ListGroup.Item>SAP broj: {article.sapNumber}</ListGroup.Item>
                                    <ListGroup.Item>Stanje na: {Moment(article.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListGroup.Item>
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row>
                        <Col>
                            <Card className="mb-3">
                                <StockArticleTable stockId={this.props.match.params.stockID} />
                            </Card>
                        </Col>
                    </Row></>
        );
    }
}
