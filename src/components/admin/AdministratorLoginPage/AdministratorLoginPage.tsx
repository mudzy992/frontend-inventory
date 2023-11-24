import React from 'react';
import './style.css';
import { Container, Col, Card, Form, Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import api, { ApiResponse, saveRefreshToken, saveToken } from '../../../API/api';
import MuiAlert from '@mui/material/Alert';
import { Snackbar, Stack } from '@mui/material';

interface administratorData {
    id: number;
}

interface AdministratorLoginPageState {
    username: string;
    password: string;
    administratorID: administratorData[];
    isLoggedIn: boolean;
    isTyping: boolean;
    error: {
        message?: string;
        visible: boolean;
    };
}

export default class AdministratorLoginPage extends React.Component {
    state: AdministratorLoginPageState;

    constructor(props: Readonly<{}>) {
        super(props);

        this.state = {
            username: '',
            password: '',
            administratorID: [],
            isLoggedIn: false,
            isTyping: true,
            error: {
                visible: false,
            },
        }
    }

    componentDidMount() {
        const typingTimeout = setTimeout(() => {
            this.setState({ ...this.state, isTyping: false });
        }, 3500);

        return () => clearTimeout(typingTimeout);
    }
    private formInputChanged(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState(Object.assign(this.state, {
            [event.target.id]: event.target.value,
        }));
    }

    private handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            this.doLogin();
        }
    }

    private setLogginState(isLoggedIn: boolean) {
        this.setState(Object.assign(this.state, {
            isLoggedIn: isLoggedIn,
        }));
    };

    private setAdministratorID(administratorID: administratorData[]) {
        this.setState(Object.assign(this.state, {
            administratorID: administratorID,
        }));
    };

    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state.error, {
             message: message,
         }));
     }

    private async showErrorMessage() {
        this.setErrorMessageVisible(true)
    }

    private setErrorMessageVisible(newState: boolean) {
        this.setState(Object.assign(this.state.error, {
            visible: newState,
        }));
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
                            case -3001: message = 'Neispravni korisnički podaci!'; break;
                            case -3002: message = 'Neispravni korisnički podaci!'; break;
                        }

                        this.setErrorMessage(message);
                        this.showErrorMessage()
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
            return <Redirect to="/" />;
        }

        return (
            <Container>
                <Col md={{ span: 4, offset: 4 }}>
                    <Card style={{ marginTop: '50%' }}>
                        <div className="logo-container">
                            <div className="circle">
                                <i className="bi bi-incognito incognito-icon"></i>
                            </div>
                            <div className={`typing ${this.state.isTyping ? 'typing' : ''}`}>Inventory Database</div>
                        </div>
                        <Card.Body>
                            <Card.Title>
                                <i className="bi bi-box-arrow-in-right" /> Administrator Login
                            </Card.Title>
                            <Form>
                                <Form.Group>
                                    <Form.Label className="login-form-label" htmlFor="username">
                                        Korisničko ime:
                                    </Form.Label>
                                    <Form.Control
                                        className="login-form-control"
                                        type="text"
                                        id="username"
                                        value={this.state.username}
                                        onChange={event => this.formInputChanged(event as any)}
                                        onKeyDown={event => this.handleKeyPress(event as any)}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label className="login-form-label" htmlFor="password">
                                        Lozinka:
                                    </Form.Label>
                                    <Form.Control
                                        className="login-form-control"
                                        type="password"
                                        id="password"
                                        value={this.state.password}
                                        onChange={event => this.formInputChanged(event as any)}
                                        onKeyDown={event => this.handleKeyPress(event as any)}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <div className="block">
                                        <Button
                                            variant="success"
                                            className="btn-style"
                                            onClick={() => this.doLogin()}
                                        >
                                            Prijava
                                        </Button>
                                    </div>
                                </Form.Group>
                            </Form>
                            <Stack spacing={2} sx={{ width: '100%' }}>
                                <Snackbar
                                    open={this.state.error.visible}
                                    autoHideDuration={6000}
                                    onClose={() => this.setErrorMessageVisible(false)}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                                >
                                    <MuiAlert severity="error" sx={{ width: '100%' }}>
                                        {this.state.error.message}
                                    </MuiAlert>
                                </Snackbar>
                            </Stack>
                        </Card.Body>
                    </Card>
                </Col>
            </Container>
        );
    }
}