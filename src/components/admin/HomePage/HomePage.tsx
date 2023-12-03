import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { ApiResponse } from '../../../API/api';
import CategoryType from '../../../types/CategoryType';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu'
import AdminMenu from '../AdminMenu/AdminMenu';
import { UserTable } from '../UserPage/UserTable';
import { Card, CardBody, CardFooter, CardHeader} from '@nextui-org/react';


/* Obavezni dio komponente je state (properties nije), u kome definišemo konačno stanje komponente */
interface HomePageState {
    /* u ovom dijelu upisuje type npr. ako je kategorija je nekog tipa */
    categories?: CategoryType[];
    isLoggedIn?: boolean;
    message?: string;
}

/* U većini slučajeva će biti potrebno napraviti DataTransferObjekat koji će raditi sa podacima,
gdje ćemo definisati da je neka veza primjerak tog DTO-a*/

interface CategoryDto {
    categoryId: number,
    name: string,
    imagePath: string,
}

/* Ova komponenta je proširena da se prikazuje na osnovu parametara koje smo definisali iznad */
const HomePage: React.FC <HomePageState> = () => {

    const [state, setState] = useState<HomePageState>({
        categories: [],
        isLoggedIn: true,
        message:'',
    })

    /* SET FUNKCIJE ĆEMO DEFINISATI PRIJE RENDERA */
    const navigate = useNavigate();

    const setLogginState = (isLoggedIn: boolean) => {
        setState({ ...state, isLoggedIn: isLoggedIn });
        if(isLoggedIn === false) {
            navigate('admin/login')
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
                /* Nakon što se izvrši ruta, šta onda */
                putCategoriesInState(res.data)
            })
    }, [])

    /* KRAJ SET FUNCKIJA */
    

    return (
        /* prikaz klijentu */
        <>
            <RoledMainMenu role='administrator'/>
            <div className="container mx-auto px-4 mt-3 h-max">
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
            <Card className='mt-3' key={category.categoryId}>
                <CardHeader>
                        {category.name}
                </CardHeader>
                <CardBody>
                    <i className={category.imagePath} style={{fontSize:50, display:"flex", justifyContent:"center"}}/>
                </CardBody>
                <CardFooter style={{display:"flex", justifyContent:'center'}}>
                    <small><Link to={`/category/${category.categoryId}`}
                        className='btn btn-block btn-sm'>Prikaži kategoriju</Link></small>
                </CardFooter>
            </Card>
        )
    }
}

export default HomePage;