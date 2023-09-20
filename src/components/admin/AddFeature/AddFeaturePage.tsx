import React from 'react';
import api, { ApiResponse } from '../../../API/api';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import CategoryType from '../../../types/CategoryType';
import { Alert, Button, Card, Col, Container, FloatingLabel, Form, Row } from 'react-bootstrap';
import { List, ListItemButton, ListItemText, ListSubheader } from '@mui/material';
import AdminMenu from '../AdminMenu/AdminMenu';

interface AddFeatureState {
    categories: CategoryType[];
    message: string;
    addNewFeature: {
        name: string;
        categoryId: number;
        features: {
            featureId: number,
            name: string,
            categoryId: number
        }[]
    }
}

interface FeatureBaseType {
    featureId: number;
    name: string;
}

export default class AddFeaturePage extends React.Component<{}> {
    state: AddFeatureState;
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            categories: [],
            message: '',
            addNewFeature: {
                name: '',
                categoryId: 0,
                features: [],
            }
        }
    }

    componentDidMount() {
        this.getCategories();
    }

    /* SET */
    private setAddNewFeatureStringState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.addNewFeature, {
                [fieldName]: newValue,
            })))
    }

    private setAddNewFeatureNumberState(fieldName: string, newValue: any) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.addNewFeature, {
                [fieldName]: (newValue === 'null') ? null : Number(newValue),
            })))
    }

    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message,
        }));
    }

    private setCategoryData(category: CategoryType) {
        this.setState(Object.assign(this.state, {
            categories: category
        }))
    }

    private async addFeatureCategoryChanged(event: React.ChangeEvent<HTMLSelectElement>) {
        this.setAddNewFeatureNumberState('categoryId', event.target.value);

        const features = await this.getFeaturesByCatId(this.state.addNewFeature.categoryId);
        const stateFeatures = features.map(feature => ({
            featureId: feature.featureId,
            name: feature.name,
        }));

        this.setState(Object.assign(this.state,
            Object.assign(this.state.addNewFeature, {
                features: stateFeatures,
            }),
        ));
    }

    /* KRAJ SET */

    /* GET */
    private getCategories() {
        api('api/category/?filter=parentCategoryId||$notnull', 'get', {}, 'administrator')
        .then((res : ApiResponse) => {
            this.setCategoryData(res.data)
        })
    }

    private async getFeaturesByCatId(categoryId: number): Promise<FeatureBaseType[]> {
        return new Promise(resolve => {
            api('api/feature/?filter=categoryId||$eq||' + categoryId + '/', 'get', {}, 'administrator')
            .then((res : ApiResponse) => {
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

    /* KRAJ GET */

    /* DODATNE FUNKCIJE */
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

    private addFeatureInput(feature: any) {
        return (
            <ListItemButton>
                <ListItemText primary={feature.name} />
            </ListItemButton>
                
        );
    }

    private doAddFeature() {
        api('/api/feature/', 'post', {
            categoryId: this.state.addNewFeature.categoryId,
            name: this.state.addNewFeature.name,
        }, 'administrator')
        .then(async (res: ApiResponse) => {
            if(res.status === 'error') {
                this.setErrorMessage('Greška prilikom dodavanja nove osobine. Provjerite da li se osobina već nalazi u listi iznad. Osvježite ili pokušajte ponovo kasnije')
                return
            }
            this.setErrorMessage('')
            const features = await this.getFeaturesByCatId(this.state.addNewFeature.categoryId);
            const stateFeatures = features.map(feature => ({
                featureId: feature.featureId,
                name: feature.name,
            }));

            this.setState(Object.assign(this.state,
                Object.assign(this.state.addNewFeature, {
                    features: stateFeatures,
                }),
            ));
        });
    }

    private addForm() {
        return(
            <div><Card className="mb-3">
                <Card.Header>
                    <Card.Title>Detalji osobine</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Group className="mb-3 was-validated">
                                <FloatingLabel label="Kategorija" className="mb-3">
                                    <Form.Select
                                        id='categoryId'
                                        value={this.state.addNewFeature.categoryId.toString()}
                                        onChange={(e) => this.addFeatureCategoryChanged(e as any)}
                                        required>
                                        <option value=''>izaberi kategoriju</option>
                                        {this.state.categories.map(category => (
                                            <option value={category.categoryId?.toString()}>{category.name}</option>
                                        ))}
                                    </Form.Select>
                                </FloatingLabel>
                                <List>
                                <ListSubheader className={this.state.addNewFeature.categoryId ? '' : 'd-none'}>Trenutne osobine</ListSubheader>
                                    {this.state.addNewFeature.features.map(this.addFeatureInput, this)}
                                </List>  
                                
                            <FloatingLabel label="Nova osobina (naziv)" className="mb-3">
                                <Form.Control
                                    id="name"
                                    type="text"
                                    placeholder="Naziv"
                                    value={this.state.addNewFeature.name}
                                    onChange={(e) => this.setAddNewFeatureStringState('name', e.target.value)}
                                    required />
                            </FloatingLabel>
                            <Row>
                                <Alert variant="danger"
                                    style={{ marginTop: 15 }}
                                    className={this.state.message ? '' : 'd-none'}>
                                     <i className="bi bi-exclamation-square" /> {this.printOptionalMessage()}
                                </Alert>
                                </Row>
                        </Form.Group>
                    </Form>
                </Card.Body>
                <Card.Footer>
                        <Row style={{ alignItems: 'end' }}>
                            <Button onClick={() => this.doAddFeature()} variant="success" className={this.state.addNewFeature.name ? '' : 'd-none'} ><i className="bi bi-plus-circle" /> Dodaj osobinu</Button>
                        </Row>
                    </Card.Footer>
            </Card>
            </div>
        )
    }
    /* KRAJ DODATNIH FUNKCIJA */

    /* RENDER */

    render() {
        return (
            <div>
                <RoledMainMenu role="administrator" />
                <Container style={{ marginTop:15}}>
                    {this.renderFeatureData()}
                    <AdminMenu />
                </Container>
            </div>
        )
    }

    renderFeatureData() {
        return(
            <Row>
            <Col xs ="12" lg="12">
                <Row>
                    
                    <Col style={{marginTop:5}} xs="12" lg="12" sm="12">
                            {this.addForm()}
                    </Col>
                </Row>
            </Col>
        </Row>
        )
    }

}/* KRAJ KODA */
