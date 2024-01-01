import React from 'react';
import { Card, CardBody} from '@nextui-org/react';
import UserLoginPage from './UserLoginPage';

const LoginPage: React.FC = () => {
    return (
        <div className='flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0'>
            <div className='col-span-4 col-start-5 w-full md:mt-0 sm:max-w-md xl:p-0'>
                <div>
                    <span className='lg:text-7xl text-5xl'> <i className="bi bi-incognito incognito-icon text-green-600" />
                    Inventory</span> database
                </div>
                <Card>
                    <CardBody>
                        <UserLoginPage />
                    </CardBody>
                </Card>
                
            </div>
        </div>
    )
}

export default LoginPage;