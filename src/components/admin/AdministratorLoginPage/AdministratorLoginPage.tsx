import React, { useState, useEffect } from 'react';
import {  Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api, { ApiResponse, saveRefreshToken, saveToken } from '../../../API/api';
import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react';
import { EyeSlashFilledIcon } from '../../../Icons/EyeSlashFilledIcon';
import { EyeFilledIcon } from '../../../Icons/EyeFilledIcon';
import { Alert } from '../../custom/Alert';

interface AdministratorLoginPageProps {}

interface AdministratorLoginPageState {
    username: string;
    password: string;
    administratorID: number[];
    isLoggedIn: boolean;
    isTyping: boolean;
    message: string;
}

const AdministratorLoginPage: React.FC<AdministratorLoginPageProps> = () => {
    const [isVisible, setIsVisible] = React.useState(false);
    const toggleVisibility = () => setIsVisible(!isVisible);
    const [state, setState] = useState<AdministratorLoginPageState>({
        username: '',
        password: '',
        administratorID: [],
        isLoggedIn: false,
        isTyping: true,
        message: '',
    });

    const navigate = useNavigate();


    const formInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({
            ...state,
            [event.target.id]: event.target.value,
        });
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            doLogin();
        }
    };

    const setLogginState = (isLoggedIn: boolean) => {
        setState({
            ...state,
            isLoggedIn: isLoggedIn,
        });

        if (isLoggedIn) {
            navigate('/');
        }
    };

    const setAdministratorID = (administratorID: number[]) => {
        setState({
            ...state,
            administratorID: administratorID,
        });
    };

    const setErrorMessage = (message: string) => {
        setState((prev) =>({...prev, message: message}))
    };

    const printErrorMessage = () => {
        if (!state.message) {
          return null;
        }
        return (
          <Alert variant='danger' title='Upozorenje!' body={state.message} />
        );
      };

    const doLogin = () => {
        api('auth/administrator/login', 'post', {
            username: state.username,
            password: state.password,
        }).then((res: ApiResponse) => {
            if (res.status === 'error') {
                setErrorMessage('System error... Try again!');
                return;
            }

            if (res.status === 'ok') {
                if (res.data.statusCode !== undefined) {
                    let message = '';

                    switch (res.data.statusCode) {
                        case -3001:
                        case -3002:
                            message = 'Neispravni korisnički podaci!';
                            break;
                    }

                    setErrorMessage(message);
                    return;
                }

                setAdministratorID(res.data.id);
                saveToken('administrator', res.data.token);
                saveRefreshToken('administrator', res.data.refreshToken);

                setLogginState(true);
            }
        });
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="col-span-4 col-start-5">
            {printErrorMessage()}
                <Card className=''>        
                    <CardHeader>
                        <i className="bi bi-box-arrow-in-right mr-2" /> Administrator Login
                    </CardHeader>
                    <CardBody className='gap-3'>

                        <Input 
                            type='text'
                            id='username'
                            label='Korisničko ime'
                            placeholder="Unesite korisničko ime"
                            variant="bordered"
                            value={state.username}
                            onChange={(event) => formInputChanged(event as any)}
                            onKeyDown={(event) => handleKeyPress(event as any)}
                        />
                        <Input
                            id='password'
                            label="Lozinka"
                            variant="bordered"
                            placeholder="Unesite lozinku"
                            endContent={
                                <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                                {isVisible ? (
                                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                ) : (
                                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                )}
                                </button>
                            }
                            type={isVisible ? "text" : "password"}
                            value={state.password}
                            onChange={(event) => formInputChanged(event as any)}
                            onKeyDown={(event) => handleKeyPress(event as any)}
                        />
                        <Button variant="solid" color='success' onClick={() => doLogin()}>
                            Prijava
                        </Button>
                    </CardBody>
                </Card>
                
            </div>
        </div>
    );
};

export default AdministratorLoginPage;
