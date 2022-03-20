import { faSignInAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import { Container, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import api, { ApiResponse, saveRefreshToken, saveToken } from '../../../API/api';


interface administratorData {
    id: number;
}


interface AdministratorLoginPageState {
    username: string;
    password: string;
    administratorID: administratorData[];
    errorMessage: string;
    isLoggedIn: boolean;
}

export default class AdministratorLoginPage extends React.Component {
    state: AdministratorLoginPageState;

    constructor(props: Readonly<{}>) {
        super(props);

        this.state = {
            username: '',
            password: '',
            administratorID: [],
            errorMessage: '',
            isLoggedIn: false,
        }
    }
    private formInputChanged(event: React.ChangeEvent<HTMLInputElement>) {
        const newState = Object.assign(this.state, {
            [event.target.id]: event.target.value,
        });

        this.setState(newState);
    }

    private setLogginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isLoggedIn: isLoggedIn,
        });

        this.setState(newState);
    }

    private setAdministratorID(administratorID: administratorData[]) {
        const newState = Object.assign(this.state, {
            administratorID: administratorID,
        });

        this.setState(newState);
    }

    private setErrorMessage(message: string) {
        const newState = Object.assign(this.state, {
            errorMessage: message,
        });

        this.setState(newState);
    }

    private doLogin() {
        api(
            'auth/administrator/login',
            'post',
            {
                username: this.state.username,
                password: this.state.password,
            }
        )
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    this.setErrorMessage('System error... Try again!');

                    return;
                }

                if (res.status === 'ok') {
                    if (res.data.statusCode !== undefined) {
                        let message = '';

                        switch (res.data.statusCode) {
                            case -3001: message = 'Unkwnon username!'; break;
                            case -3002: message = 'Bad password!'; break;
                        }

                        this.setErrorMessage(message);

                        return;
                    }
                    this.setAdministratorID(res.data.id);
                    saveToken('administrator', res.data.token);
                    saveRefreshToken('administrator', res.data.refreshToken);

                    this.setLogginState(true);

                }
            });
    }
    render() {
        if (this.state.isLoggedIn === true) {
            return (
                <Redirect to="/" />
            );
        }
        return (
            <Container>
                <Col md={{ span: 6, offset: 3 }}>
                    <Card style={{ marginTop: 10 }}>
                        <Card.Body>
                            <Card.Title>
                                <FontAwesomeIcon icon={faSignInAlt} /> Administrator Login
                            </Card.Title>
                            <Form>
                                <Form.Group>
                                    <Form.Label htmlFor="username">Korisničko ime:</Form.Label>
                                    <Form.Control type="text" id="username"
                                        value={this.state.username}
                                        onChange={event => this.formInputChanged(event as any)} />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label htmlFor="password">Password:</Form.Label>
                                    <Form.Control type="password" id="password"
                                        value={this.state.password}
                                        onChange={event => this.formInputChanged(event as any)} />
                                </Form.Group>
                                <Form.Group>
                                    <Button variant="primary"
                                        style={{ marginTop: 15 }}
                                        onClick={() => this.doLogin()}>
                                        Log in
                                    </Button>
                                </Form.Group>
                            </Form>
                            <Alert variant="danger"
                                style={{ marginTop: 15 }}
                                className={this.state.errorMessage ? '' : 'd-none'}>
                                {/* <FontAwesomeIcon icon={ faExclamationTriangle } />   */}{this.state.errorMessage}
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Container>
        )
    }
}/* Kraj koda */
