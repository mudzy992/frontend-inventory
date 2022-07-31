import React from 'react';
import api, { ApiResponse } from '../../../API/api';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import CategoryType from '../../../types/CategoryType';
import { Alert, Button, Card, Col, Container, FloatingLabel, Form, Row } from 'react-bootstrap';
import { List, ListItemButton, ListItemText, ListSubheader, Paper } from '@mui/material';
import AdminMenu from '../AdminMenu/AdminMenu';
import { Link } from 'react-router-dom';

interface AddCategoryPageState {
    categories: CategoryType[];
    message: string;
    addNewCategory: {
        name: string;
        parentCategoryId: number;
        imagePath: string
    }
}

export default class AddNewCategoryPage extends React.Component<{}> {
    state: AddCategoryPageState;
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            categories: [],
            message: '',
            addNewCategory: {
                name: '',
                imagePath: '',
                parentCategoryId: 0,
            }
        }
    }

    componentDidMount() {
        this.getCategories()
    }

    /* SET */

    private setAddNewCategoryStringState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.addNewCategory, {
                [fieldName]: newValue,
            })))
    }

    private setAddNewCategoryNumberState(fieldName: string, newValue: any) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.addNewCategory, {
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

    /* GET */

    private getCategories() {
        api('api/category/', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom učitavanja kategorija, osvježite stranicu i pokušajte ponovo.');
                return;
            }   
            this.setCategoryData(res.data);
        })
    }

    /* DODATNE FUNCKIJE */
    private printOptionalMessage() {
        if (this.state.message === '') {
            return;
        }

        return (
            <>
                {this.state.message}
            </>
        );
    }

    private doAddCategory() {
        api('api/category/', 'post', this.state.addNewCategory, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom dodavanja kategorije, pokušajte ponovo.');
                return;
            }
            this.setErrorMessage('Kategorija je uspješno dodana.');
        })
    }

    private addForm() {
        return(
            <><Card className="mb-3">
                <Card.Header>
                    <Card.Title>Detalji kategorije</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Group className="mb-3 ">
                            <FloatingLabel controlId="name" label="Nova kategorija (naziv)" className="mb-3 was-validated">
                                <Form.Control
                                    id="name"
                                    type="text"
                                    placeholder="Naziv"
                                    value={this.state.addNewCategory.name}
                                    onChange={(e) => this.setAddNewCategoryStringState('name', e.target.value)}
                                    required />
                            </FloatingLabel>
                            <FloatingLabel controlId="imagePath" label="Ikona kategorije" className="mb-3">
                                <Form.Control
                                    id="imagePath"
                                    type="text"
                                    placeholder="Ikona kategorije"
                                    value={this.state.addNewCategory.imagePath}
                                    onChange={(e) => this.setAddNewCategoryStringState('imagePath', e.target.value)}
                                     />
                                    <Form.Text>
                                        Ikonu kategorije pronaći <a href='https://icons.getbootstrap.com/' target={"_blank"}>ovjde</a> te kopirati class. Primjer 2 <i style={{color:"red"}}>"bi bi-align-center"</i>
                                    </Form.Text>
                            </FloatingLabel>
                            <FloatingLabel controlId='parentCategoryId' label="Kategorija" className="mb-3">
                                <Form.Select
                                    id='parentCategoryId'
                                    value={this.state.addNewCategory.parentCategoryId.toString()}
                                    onChange={(e) => this.setAddNewCategoryNumberState('parentCategoryId', e.target.value)}
                                    >
                                    <option value=''>izaberi kategoriju</option>
                                    {this.state.categories.map(category => (
                                        <option value={category.categoryId?.toString()}>{category.name}</option>
                                    ))}
                                </Form.Select>
                                <Form.Text>U slučaju da se odabere kategorije, kreira se podkategorije</Form.Text>
                            </FloatingLabel>

                                <Alert variant="info"
                                    style={{ marginTop: 15 }}
                                    className={this.state.message ? '' : 'd-none'}>
                                     <i className="bi bi-exclamation-square" /> {this.printOptionalMessage()}
                                </Alert>

                        </Form.Group>
                    </Form>
                </Card.Body>
                <Card.Footer className={this.state.addNewCategory.name ? '' : 'd-none'}>
                        <Row style={{ alignItems: 'end' }}>
                            <Button onClick={() => this.doAddCategory()} 
                                    variant="success">
                            <i className="bi bi-plus-circle" /> Dodaj kategoriju</Button>
                        </Row>
                    </Card.Footer>
            </Card>
            </>
        )
    }

    /* RENDERER */

    render() {
        return (
            <>
            <RoledMainMenu role="administrator" />
            <Container style={{ marginTop:15}}>
                {this.renderCategoryData()}
            </Container>
            </>
        )
    }

    renderCategoryData() {
        return(
            <Row>
            <Col xs ="12" lg="12">
                <Row>
                    <AdminMenu />
                    <Col style={{marginTop:5}} xs="12" lg="9" sm="12">
                            {this.addForm()}
                    </Col>
                </Row>
            </Col>
        </Row>
        )
    }
}