import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ApiResponse, removeIdentity } from '../../../API/api';
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
              setLogginState(false);
              removeIdentity('administrator')
              return;
            }
      
            if (res.status === 'error') {
              console.error('API error:', res.data);
              setLogginState(false);
              removeIdentity('administrator')
              return;
            }
      
            putCategoriesInState(res.data);
          })
          .catch((error) => {
            console.error('Error during API call:', error);
            removeIdentity('administrator')
            setLogginState(false);
          });
      }, []);
      

    return (
        /* prikaz klijentu */
        <>
            <RoledMainMenu/>
            <div className="container mx-auto lg:px-4 mt-3 h-max">
                <div className='' >
                    <div className='mr-2 ml-2'>
                        {<UserTable /> }
                    </div>
                    
                    <h5 className='mt-3 ml-3' style={{ color:"white"}}> <i className="bi bi-card-list"/> Top level kategorije</h5>
                    <div className='grid lg:grid-cols-5 lg:gap-5 grid-cols-2 ml-2 mr-2 gap-3'>
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