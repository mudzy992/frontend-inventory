import React, { useEffect, useState } from 'react';
import api, { ApiResponse } from '../../../API/api';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import CategoryType from '../../../types/CategoryType';
import AdminMenu from '../AdminMenu/AdminMenu';
import { Alert } from '../../custom/Alert';
import { Button, Card, CardBody, CardFooter, CardHeader, Input, Select, SelectItem, Spinner } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';

interface AddCategoryPageState {
    categories: CategoryType[];
    message: string;
    isLoggedIn: boolean;
    addNewCategory: {
        name: string;
        parentCategoryId: number;
        imagePath: string
    }
}

const AddNewCategoryPage: React.FC = () => {
    const [state, setState] = useState<AddCategoryPageState>({
        categories: [],
        message: '',
        isLoggedIn: true,
        addNewCategory: {
            name: '',
            imagePath: '',
            parentCategoryId: 0,
        }
    })
    const navigate = useNavigate()
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        getCategories()
    }, [])

    /* SET */

    const setAddNewCategoryStringState = (fieldName: string, newValue: string) => {
        setState((prev) => ({
            ...prev, addNewCategory: {...prev.addNewCategory, [fieldName]: newValue}
        }))
    }

    const setAddNewCategoryNumberState = (fieldName: string, newValue: any) => {
        setState((prev) => ({
            ...prev, addNewCategory: {...prev.addNewCategory, [fieldName]: (newValue === 'null') ? null : Number(newValue)}
        }))
    }

    const setErrorMessage = (message: string) => {
        setState(prev => ({...prev, message:message}))
    }

    const setIsLoggedInStatus = (isLoggedIn: boolean) => {
        setState((prev) => ({...prev, isLoggedIn:isLoggedIn}))

        if(isLoggedIn === false) {
            navigate('/login/')
        }
    }

    const setCategoryData = (category: CategoryType) => {
        setState(Object.assign(state, {
            categories: category
        }))
    }

    /* GET */

    const getCategories = async () => {
        try {
            setLoading(true);
    
            const res = await api('api/category/', 'get', {}, 'administrator');
    
            if (res.status === 'login') {
                setIsLoggedInStatus(false);
                return;
            }
    
            if (res.status === 'error') {
                setErrorMessage('Greška prilikom učitavanja kategorija, osvježite stranicu i pokušajte ponovo.');
                return;
            }
    
            setCategoryData(res.data);
            setLoading(false);
        } catch (error) {
            setErrorMessage('Došlo je do greške prilikom učitavanja kategorija, osvježite stranicu i pokušajte ponovo.');
            setLoading(false);
        }
    };

    /* DODATNE FUNCKIJE */
    const printOptionalMessage = () => {
        if (state.message === '') {
            return;
        }

        return (
            <Alert title='info' variant='info' body={state.message} />
        );
    }

    const doAddCategory = () => {
        api('api/category/', 'post', state.addNewCategory, 'administrator')
        .then((res: ApiResponse) => {
            if(res.status === 'login') {
                setIsLoggedInStatus(false)
                return;
            }
            if (res.status === "error") {
                setErrorMessage('Greška prilikom dodavanja kategorije, pokušajte ponovo.');
                return;
            }
            setErrorMessage('Kategorija je uspješno dodana.');
        })
    }

    const addForm = () => {
        return(
            <div>
                {loading ? ( 
                    <div className="flex justify-center items-center h-screen">
                        <Spinner color='success' />
                    </div>                   
                ) : (
                    <Card className="mb-3">
                    <CardHeader>
                        Detalji kategorije
                    </CardHeader>
                    <CardBody>
                    <div className="flex flex-col">
                        <div className='w-full mb-3 mr-3'>
                            <Input
                            id="name" 
                            type="text" 
                            label="Nova kategorija (naziv)"
                            labelPlacement='inside'
                            value={state.addNewCategory.name}
                            onChange={(e) => setAddNewCategoryStringState('name', e.target.value)}
                            >
                            </Input>
                        </div>
                        <div className='w-full mb-3 mr-3'>
                            <Input
                            id="imagePath" 
                            type="text" 
                            label="Ikona kategorije"
                            labelPlacement='inside'
                            value={state.addNewCategory.imagePath}
                            onChange={(e) => setAddNewCategoryStringState('imagePath', e.target.value)}
                            >
                            </Input>
                            <p className='pl-3 pt-3 text-sm text-default-500'>Ikonu kategorije pronaći <a href='https://icons.getbootstrap.com/' target={"_blank"} rel={"noreferrer"}>ovjde</a> te kopirati class. Primjer <i style={{color:"red"}}>"bi bi-align-center"</i></p>
                        </div>
                        <div className='lg:flex w-full'> 
                            <Select
                                id='categoryId'
                                label='Podkategorija'
                                placeholder='Odaberite podkategoriju'
                                onChange={(e) => setAddNewCategoryNumberState('parentCategoryId', e.target.value)}
                            >
                                {state.categories.map((category, index) => (
                                    <SelectItem key={category.categoryId || index} textValue={`${category.categoryId} - ${category.name}`} value={Number(category.categoryId)}>
                                        {category.categoryId} - {category.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </div>
                    </CardBody>
                    <CardFooter className={state.addNewCategory.name ? '' : 'hidden'}>
                        <div>
                            {printOptionalMessage()}
                        </div>
                        <div style={{ alignItems: 'end' }}>
                            <Button onClick={() => doAddCategory()} 
                                    color="success">
                            <i className="bi bi-plus-circle" /> Dodaj kategoriju</Button>
                        </div>
                    </CardFooter>
                </Card>
                )}
                
            </div>
        )
    }

    return (
        <div>
            <RoledMainMenu />
            <div className="container mx-auto lg:px-4 mt-3 h-max">
                {addForm()}
                <AdminMenu />
            </div>
        </div>
    )
}

export default AddNewCategoryPage;