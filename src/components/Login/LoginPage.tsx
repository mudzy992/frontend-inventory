import React, { useState } from 'react';
import AdministratorLoginPage from '../admin/AdministratorLoginPage/AdministratorLoginPage';
import { Card, CardBody, Tab, Tabs } from '@nextui-org/react';
import UserLoginPage from '../user/UserLogin/UserLoginPage';

const LoginPage: React.FC = () => {
    const [selected, setSelected] = useState('user')
    return (
        <div className='flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0'>
            <div className='col-span-4 col-start-5 w-full md:mt-0 sm:max-w-md xl:p-0'>
                <div>
                    <span className='lg:text-7xl text-5xl'> <i className="bi bi-incognito incognito-icon text-green-600" />
                    Inventory</span> database
                </div>
                <Card>
                    <CardBody>
                        <Tabs
                        fullWidth
                        size='md'
                        aria-label='Forma za prijavu'
                        selectedKey={selected}
                        onSelectionChange={(key) => setSelected(key as string)}
                        >
                            <Tab key='user' title='Korisnčka prijava'>
                                <UserLoginPage />
                            </Tab>
                            <Tab key='admin' title='Administrator'>
                                <AdministratorLoginPage />
                            </Tab>
                        </Tabs>
                    </CardBody>
                </Card>
                
            </div>
        </div>
    )
}

export default LoginPage;