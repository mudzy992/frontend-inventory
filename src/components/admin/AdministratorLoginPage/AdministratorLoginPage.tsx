import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ApiResponse, saveRefreshToken, saveToken } from '../../../API/api';
import { Button, Divider, Input } from '@nextui-org/react';
import { Alert } from '../../custom/Alert';
import {  saveIdentity, useUserContext } from '../../UserContext/UserContext';

interface AdministratorLoginPageState {
    username: string;
    password: string;
    administratorID: number;
    isLoggedIn: boolean;
    isTyping: boolean;
    errorMessage: string;
    isAlertClosed: boolean,
}

const AdministratorLoginPage: React.FC = () => {
    const [isVisible, setIsVisible] = React.useState(false);
    const toggleVisibility = () => setIsVisible(!isVisible);
    const { setUserId, setRole } = useUserContext();
    const [state, setState] = useState<AdministratorLoginPageState>({
        username: '',
        password: '',
        administratorID: 0,
        isLoggedIn: false,
        isTyping: true,
        errorMessage: '',
        isAlertClosed: false,
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

    const setAdministratorID = (administratorID: number) => {
        setState({
            ...state,
            administratorID: administratorID,
        });
    };

    const closeAlert = () => {
        setState((prev) => ({ ...prev, isAlertClosed: true }));
    };
    
    const openAlert = () => {
        setState((prev) => ({ ...prev, isAlertClosed: false }));
    };
    
    const setErrorMessage = (message: string) => {
        setState((prev) => ({ ...prev, errorMessage: message, isAlertClosed: false }));
    };
    
    const printErrorMessage = () => {
        if (!state.errorMessage || state.isAlertClosed) {
            return null;
        }
        return (
            <Alert 
            showCloseButton={true} 
            variant='danger' 
            title='Upozorenje!' 
            body={state.errorMessage}
            isOpen={!state.isAlertClosed}
            onClose={closeAlert} />
        );
    };

    const doLogin = async () => {
        api('auth/administrator/login', 'post', {
            username: state.username,
            password: state.password,
        }).then(async (res: ApiResponse) => {
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
                await saveIdentity('administrator', res.data.id, setRole, setUserId);
                await setAdministratorID(res.data.id);
                await saveToken(res.data.token);
                await saveRefreshToken( res.data.refreshToken);

                await setLogginState(true);
            }
        });
    };

    useEffect(() => {
        if (state.errorMessage && !state.isAlertClosed) {
          openAlert();
        }
      }, [state.errorMessage, state.isAlertClosed]);

    return (
    <div className='grid gap-3'>
        <div className='text-center text-3xl text-gray-400'>
            <p>
                Administratorka prijava
            </p>
        </div>
        <Input
            type='text'
            id='username'
            label='Korisničko ime'
            placeholder="Unesite korisničko ime"
            variant="flat"
            labelPlacement='outside'
            value={state.username}
            onChange={(event) => formInputChanged(event as any)}
            onKeyDown={(event) => handleKeyPress(event as any)} 
            startContent={
                <i className="bi bi-person-bounding-box text-2xl text-default-400 pointer-events-none" />
            }
        />
        <Input
            id='password'
            label="Lozinka"
            variant="flat"
            labelPlacement='outside'
            placeholder="Unesite lozinku"
            endContent={<button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                {isVisible ? (
                    <i className="bi bi-eye-fill text-2xl text-default-400 pointer-events-none" />
                ) : (
                    <i className="bi bi-eye-slash-fill text-2xl text-default-400 pointer-events-none" />
                )}
            </button>}
            type={isVisible ? "text" : "password"}
            value={state.password}
            onChange={(event) => formInputChanged(event as any)}
            onKeyDown={(event) => handleKeyPress(event as any)} 
            startContent={
                <i className="bi bi-key-fill text-2xl text-default-400 pointer-events-none"></i>
            }
        />

        <Divider className="my-4" />
        <Button size='lg' variant="solid" color='default' onClick={() => doLogin()}>
            Prijava
        </Button>

        <div>
            {printErrorMessage()}
        </div>
    </div>
    );
};

export default AdministratorLoginPage;
