import React from 'react';
import { Container, Card, Row, Col, Form, FloatingLabel, Button,} from 'react-bootstrap';
import api, { ApiResponse } from '../../../API/api';
import ArticleType from '../../../types/ArticleType';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import CategoryType from '../../../types/CategoryType';
import ApiArticleDto from '../../../dtos/ApiArticleDto';
import AdminMenu from '../AdminMenu/AdminMenu';
import { useNavigate } from 'react-router-dom';

interface AddArticlePageState{
    articles: ArticleType[];
    categories: CategoryType[];
    message: string;
    isLoggedIn: boolean;
    addArticle: {
        name: string;
        categoryId: number;
        excerpt: string;
        description: string;
        concract: string;
        comment: string;
        sapNumber: string;
        valueOnConcract: number;
        valueAvailable: number;
        features: {
            use: number;
            featureId: number;
            name: string;
            value: string;
        }[]
    }
}

interface FeatureBaseType {
    featureId: number;
    name: string;
}
interface CategoryDto {
    categoryId: number,
    name: string,
    imagePath: string,
    parentCategoryId: number,
}



export default class AddArticlePage extends React.Component<{}>{
    state: AddArticlePageState;
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            articles: [],
            categories: [],
            message: '',
            isLoggedIn: true,
            addArticle: {
                name: '',
                categoryId: 0,
                excerpt: '',
                description: '',
                concract: '',
                comment: '',
                sapNumber: '',
                valueOnConcract: 0,
                valueAvailable: 0,
                features: [],
            }
        }
    }
    
    componentDidMount() {
        this.getArticle()
        this.getCategories()
    }
    /* SET */
    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message,
        }));
    }

    private setIsLoggedIn(isLoggedIn: boolean) {
        this.setState(Object.assign(this.state, {
            isLoggedIn: isLoggedIn,
        }));
    }

    private setAddArticleStringFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.addArticle, {
                [fieldName]: newValue,
            })))
    }

    private setAddArticleNumberFieldState(fieldName: string, newValue: any) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.addArticle, {
                [fieldName]: (newValue === 'null') ? null : Number(newValue),
            })))
    }

    private setAddArticleFeatureUse(featureId: number, use: boolean) {
        const addFeatures: { featureId: number; use: number; }[] = [...this.state.addArticle.features];

        for (const feature of addFeatures) {
            if (feature.featureId === featureId) {
                feature.use = use ? 1 : 0;
                break;
            }
        }

        this.setState(Object.assign(this.state,
            Object.assign(this.state.addArticle, {
                features: addFeatures,
            }),
        ));
    }

    private clearFormFields() {
        this.setState({
            addArticle: {
                name: '',
                categoryId: 0,
                excerpt: '',
                description: '',
                concract: '',
                comment: '',
                sapNumber: '',
                valueOnConcract: 0,
                valueAvailable: 0,
                features: [],
            },
        });
    }
    

    private setAddArticleFeatureValue(featureId: number, value: string) {
        const addFeatures: { featureId: number; value: string; }[] = [...this.state.addArticle.features];

        for (const feature of addFeatures) {
            if (feature.featureId === featureId) {
                feature.value = value;
                break;
            }
        }

        this.setState(Object.assign(this.state,
            Object.assign(this.state.addArticle, {
                features: addFeatures,
            }),
        ));
    }
    /* Kraj SET */
    /* GET */
    private getArticle() {
        api('api/article/?join=articleFeatures&join=features&join=category', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if(res.status === 'login') {
                this.setIsLoggedIn(false);
                return;
            }
            if(res.status === 'error') {
                this.setErrorMessage('Greška prilikom učitavanja artikala. Osvježite ili pokušajte ponovo kasnije')
            }
            this.putArticlesInState(res.data)
        })
    }

    private putArticlesInState(data?: ApiArticleDto[]) {
        const articles: ArticleType[] | undefined = data?.map(article => {
            return {
                articleId: article.articleId,
                name: article.name,
                excerpt: article.excerpt,
                description: article.description,
                concract: article.concract,
                sapNumber: article.sapNumber,
                articleFeatures: article.articleFeature,
                features: article.features,
                category: article.category,
                categoryId: article.categoryId,
            };
        });

        this.setState(Object.assign(this.state, {
            articles: articles,
        }));
    }

    private async getFeaturesByCatId(categoryId: number): Promise<FeatureBaseType[]> {
        return new Promise(resolve => {
            api('api/feature/?filter=categoryId||$eq||' + categoryId + '/', 'get', {}, 'administrator')
            .then((res : ApiResponse) => {
                if(res.status === 'login') {
                    this.setIsLoggedIn(false);
                    return;
                }
            if(res.status === 'error') {
                this.setErrorMessage('Greška prilikom učitavanja detalja. Osvježite ili pokušajte ponovo kasnije')
            }

            const features: FeatureBaseType[] = res.data.map((item: any) => ({
                featureId: item.featureId,
                name: item.name
            }))
            resolve(features)
        })
    })      
    }

    private getCategories() {
        api('api/category/?filter=parentCategoryId||$notnull', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if(res.status === 'login') {
                this.setIsLoggedIn(false);
                return;
            }
            if (res.status === "error" ) {
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

    private async addArticleCategoryChanged(event: React.ChangeEvent<HTMLSelectElement>) {
        this.setAddArticleNumberFieldState('categoryId', event.target.value);

        const features = await this.getFeaturesByCatId(this.state.addArticle.categoryId);
        const stateFeatures = features.map(feature => ({
            featureId: feature.featureId,
            name: feature.name,
            value: '',
            use: 0,
        }));

        this.setState(Object.assign(this.state,
            Object.assign(this.state.addArticle, {
                features: stateFeatures,
            }),
        ));
    }
    /* Kraj GET */
    /* Dodatne funkcije */
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

    private addArticleFeatureInput(feature: any) {
        return (
            <div><Form.Group className="mb-3 was-validated">
                <Row style={{ alignItems: 'baseline' }}>
                    <Col xs="4" sm="1" className="text-center">
                        <input type="checkbox" value="1" checked={feature.use === 1}
                            onChange={(e) => this.setAddArticleFeatureUse(feature.featureId, e.target.checked)} />
                    </Col>

                    <Col>
                        <FloatingLabel label={feature.name} className="mb-3">
                            <Form.Control
                                id="name"
                                type="text"
                                placeholder="Naziv"
                                value={feature.value}
                                onChange={(e) => this.setAddArticleFeatureValue(feature.featureId, e.target.value)}
                                required />
                        </FloatingLabel>
                    </Col>
                </Row>
            </Form.Group>
            </div>

        );
    }

    private doAddArticle() {
        const requestBody = {
            name: this.state.addArticle.name,
            excerpt: this.state.addArticle.excerpt,
            description: this.state.addArticle.description,
            contract: this.state.addArticle.concract, // Ispravite tipfeler (concract -> contract)
            categoryId: this.state.addArticle.categoryId,
            sapNumber: this.state.addArticle.sapNumber,
            valueOnContract: this.state.addArticle.valueOnConcract, // Ispravite tipfeler (valueOnConcract -> valueOnContract)
            valueAvailable: this.state.addArticle.valueAvailable,
            features: this.state.addArticle.features
                .filter(feature => feature.use === 1)
                .map(feature => ({
                    featureId: feature.featureId,
                    value: feature.value,
                })),
        };
    
        api('/api/stock/', 'post', requestBody, 'administrator').then(async (res: ApiResponse) => {
            if(res.status === 'login') {
                this.setIsLoggedIn(false);
                return;
            }
            if (res.status === 'ok') {
                // Nakon uspešnog dodavanja, pozovite clearFormFields da biste očistili polja
                this.clearFormFields();
            }
            // Dodajte ostatak koda za obradu odgovora ako je potrebno
        });
    }
    
    /* Kraj dodatnih funkcija */
    render() {
        return(
            <div>
            <RoledMainMenu role='administrator'/>
            <Container style={{ marginTop:15}}> 
            {this.printOptionalMessage()}
                {
                    this.state.articles ?
                        (this.renderArticleData()) :
                        ''
                }{}
            </Container>
            </div>
        )
    }

    private addForm() {
        return (
            <div>
            <Card className="mb-3">
                <Card.Header>Detalji opreme</Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Group className="mb-3 was-validated">
                        <FloatingLabel label="Naziv opreme" className="mb-3">
                            <Form.Control 
                            id="name" 
                            type="text" 
                            placeholder="Naziv"
                            value={ this.state.addArticle.name }
                            onChange={ (e) => this.setAddArticleStringFieldState('name', e.target.value) }
                            required />
                        </FloatingLabel>

                        <FloatingLabel label="Kategorija" className="mb-3">
                            <Form.Select 
                            id='categoryId'
                            value={this.state.addArticle.categoryId.toString()}
                            onChange={(e) => this.addArticleCategoryChanged(e as any)}
                            required>
                                <option value=''>izaberi kategoriju</option>
                                {this.state.categories.map((category, index) => (
                                    <option key={index} value={category.categoryId?.toString()}>{category.name}</option>
                                ))} 
                            </Form.Select>
                        </FloatingLabel>
                        <FloatingLabel label="Kratki opis" className="mb-3">
                            <Form.Control 
                            id="excerpt" 
                            as="textarea" 
                            rows={3} 
                            style={{ height: '100px' }}
                            placeholder="Kratki opis"
                            value={ this.state.addArticle.excerpt }
                            onChange={ (e) => this.setAddArticleStringFieldState('excerpt', e.target.value) }
                            required />
                        </FloatingLabel>
                        <FloatingLabel label="Detaljan opis" className="mb-3">
                            <Form.Control 
                            id="description" 
                            as="textarea" 
                            rows={5} 
                            style={{ height: '100px' }}
                            placeholder="Detaljan opis"
                            value={ this.state.addArticle.description }
                            onChange={ (e) => this.setAddArticleStringFieldState('description', e.target.value) }
                            required />
                        </FloatingLabel>
                        <FloatingLabel label="SAP broj" className="mb-3">
                            <Form.Control 
                            id="sapNumber" 
                            type="text" 
                            placeholder="SAP Broj"
                            value={ this.state.addArticle.sapNumber }
                            onChange={ (e) => this.setAddArticleStringFieldState('sapNumber', e.target.value) }
                            required />
                        </FloatingLabel>
                        <FloatingLabel label="Komentar" className="mb-3">
                            <Form.Control
                            id="comment"
                            as="textarea"
                            rows={3}
                            style={{ height: '100px' }}
                            value={ this.state.addArticle.comment }
                            onChange={ (e) => this.setAddArticleStringFieldState('comment', e.target.value) }
                            required
                            isValid
                            />
                        </FloatingLabel>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
            <Card className="mb-3">
                <Card.Header>Osobine skladišta</Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Group className="mb-3 was-validated"> 
                            <FloatingLabel label="Ugovor" className="mb-3">
                                    <Form.Control 
                                    id="concract" 
                                    type="text" 
                                    placeholder="Ugovor"
                                    value={ this.state.addArticle.concract }
                                    onChange={ (e) => this.setAddArticleStringFieldState('concract', e.target.value) }
                                    required />
                                </FloatingLabel>
                                <FloatingLabel label="Stanje po ugovoru" className="mb-3">
                                <Form.Control
                                    id="valueOnConcract"
                                    type="text"
                                    placeholder="Stanje po ugovoru"
                                    onChange={(e) => this.setAddArticleNumberFieldState('valueOnConcract', e.target.value)}
                                    required />
                                </FloatingLabel>
                                <FloatingLabel label="Dostupno stanje" className="mb-3">
                                <Form.Control
                                    id="valueAvailable"
                                    type="text"
                                    placeholder="Dostupno stanje"
                                    onChange={(e) => this.setAddArticleNumberFieldState('valueAvailable', e.target.value)}
                                    required />
                                </FloatingLabel>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
            <Card className={this.state.addArticle.categoryId ? '' : 'd-none mb-3'}>
                <Card.Header>Detalji opreme</Card.Header>
                <Card.Body>
                    <Form key="forma-dodavanja-dodataka-artikla">
                        {this.state.addArticle.features.map(this.addArticleFeatureInput, this)}
                    </Form>
                </Card.Body>
                <Card.Footer>
                    <Row style={{ alignItems: 'end' }}>
                        <Button onClick={() => this.doAddArticle()} variant="success"><i className="bi bi-plus-circle"/> Dodaj opremu</Button>
                    </Row>
                </Card.Footer>
            </Card>

            
            </div>
        )
    }
    renderArticleData() {
        /* if(this.state.isLoggedIn === false){
            return(
                navigate('/login')
            )
        } */
        return(
            <Row>
            <Col xs ="12" lg="12">
                <Row>
                    
                    <Col style={{marginTop:5}} xs="12" lg="12" sm="12">
                            {this.addForm()}
                            <AdminMenu />
                    </Col>
                </Row>
            </Col>
        </Row>
        )
    }
}