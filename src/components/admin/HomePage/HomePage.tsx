import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ApiResponse } from '../../../API/api';
import CategoryType from '../../../types/CategoryType';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu'
import AdminMenu from '../AdminMenu/AdminMenu';
import { UserTable } from '../UserPage/UserTable';
import { Card, CardBody, CardFooter, CardHeader} from '@nextui-org/react';

interface HomePageState {
    categories?: CategoryType[];
    isLoggedIn?: boolean;
    message?: string;
}

interface CategoryDto {
    categoryId: number,
    name: string,
    imagePath: string,
}


const HomePage: React.FC <HomePageState> = () => {

    const [state, setState] = useState<HomePageState>({
        categories: [],
        isLoggedIn: true,
        message:'',
    })

    const navigate = useNavigate();

    const setLogginState = (isLoggedIn: boolean) => {
        setState({ ...state, isLoggedIn: isLoggedIn });
        if(isLoggedIn === false) {
            navigate('/login')
        }
    }

    const setMessageState = (message: string) => {
        setState({...state, message: message})
    }

    const putCategoriesInState = (data: CategoryDto[]) => {
        const categories: CategoryType[] = data.map(category => {
            return {
                categoryId: category.categoryId,
                name: category.name,
                imagePath: category.imagePath,
            }
        })
        setState({...state, categories: categories})
    }

    useEffect(() => {
        api('api/category/?filter=parentCategoryId||$isnull', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'login') {
                    setMessageState('Greška prilikom dohvaćanja podataka.')
                    setLogginState(false)
                    return;
                }
                putCategoriesInState(res.data)
            })
    }, [])


    

    return (
        /* prikaz klijentu */
        <>
            <RoledMainMenu role='administrator'/>
            <div className="container mx-auto lg:px-4 mt-3 h-max">
                <div className='' >
                    <div>
                        {<UserTable /> }
                    </div>
                    
                    <h5 className='mt-3 ml-3' style={{ color:"white"}}> <i className="bi bi-card-list"/> Top level kategorije</h5>
                    <div className='grid lg:grid-cols-5 lg:gap-5 xs:grid-cols xs:gap'>
                    {state.categories && state.categories.map(singleCategory)}
                        <p>{state.message}</p>
                    </div>

                </div>
            </div>
            <AdminMenu />
        </>
    )

    function singleCategory(category: CategoryType) {
        return (
            <Card className='mt-3' key={category.categoryId} isPressable onPress={() => window.location.href=`#/category/${category.categoryId}`}>
                <CardHeader>
                        {category.name}
                </CardHeader>
                <CardBody>
                    <i className={category.imagePath} style={{fontSize:50, display:"flex", justifyContent:"center"}}/>
                </CardBody>
                <CardFooter className='flex justify-center'>
                </CardFooter>
            </Card>
        )
    }
}

export default HomePage;