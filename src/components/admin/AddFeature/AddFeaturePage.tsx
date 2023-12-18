import React, { useEffect, useState } from 'react';
import api, { ApiResponse } from '../../../API/api';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import CategoryType from '../../../types/CategoryType';
import AdminMenu from '../AdminMenu/AdminMenu';
import { Button, Card, CardBody, CardFooter, CardHeader, Input, Listbox, ListboxItem, ListboxSection, Select, SelectItem } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../custom/Alert';

interface AddFeatureState {
    categories: CategoryType[];
    message: string;
    isLoggedIn: boolean;
    addNewFeature: {
        name: string;
        categoryId: number;
        features: {
            featureId: number,
            name: string,
            categoryId: number
        }[]
    }
}

interface FeatureBaseType {
    featureId: number;
    name: string;
    categoryId: number
}

const AddFeaturePage: React.FC = () => {
    const [state, setState] = useState<AddFeatureState>({
        categories: [],
        message: '',
        isLoggedIn: true,
        addNewFeature: {
            name: '',
            categoryId: 0,
            features: [],
        }
    })

    const navigate = useNavigate()

    const setAddNewFeatureStringState = (fieldName: string, newValue: string) => {
        setState((prev) => ({
            ...prev, addNewFeature: {...prev.addNewFeature, [fieldName]: newValue}
        }))
    }

    const setAddNewFeatureNumberState = (fieldName: string, newValue: any) => {
        setState((prev) => ({
            ...prev, addNewFeature: {...prev.addNewFeature, [fieldName]: (newValue === 'null') ? null : Number(newValue)}
        }))
    }

    const setErrorMessage = (message: string) => {
        setState((prev) => ({...prev, message: message}))
    }

    const setLogginState = (isLoggedIn: boolean) => {
        setState((prev) => ({...prev, isLoggedIn:isLoggedIn}))

        if(isLoggedIn === false) {
            navigate('/login/')
        }
    }

    const setCategoryData = (category: CategoryType[]) => {
        setState((prev) => ({...prev, categories: category}))
    }

    const addFeatureCategoryChanged = async (selectedValue: any) => {
        const categoryId = Number(selectedValue.target.value);
        setAddNewFeatureNumberState('categoryId', categoryId);
        const features = await getFeaturesByCatId(categoryId);
        const stateFeatures = features.map(feature => ({
            featureId: feature.featureId,
            name: feature.name,
            categoryId: categoryId,
        }));

        setState((prev) => ({...prev, addNewFeature: {...prev.addNewFeature, categoryId: categoryId, features: stateFeatures}}))
    }

    /* KRAJ SET */

    /* GET */
    const getCategories = () => {
        api('api/category/?filter=parentCategoryId||$notnull', 'get', {}, 'administrator')
        .then((res : ApiResponse) => {
            if(res.status === 'login') {
                setLogginState(false);
                return;
            }
            setCategoryData(res.data)
        })
    }

    const getFeaturesByCatId = async (categoryId: number): Promise<FeatureBaseType[]> => {
        return new Promise(resolve => {
            api('api/feature/?filter=categoryId||$eq||' + categoryId + '/', 'get', {}, 'administrator')
            .then((res : ApiResponse) => {
                if(res.status === 'login') {
                    setLogginState(false);
                    return;
                }
                if(res.status === 'error') {
                    setErrorMessage('Greška prilikom učitavanja detalja. Osvježite ili pokušajte ponovo kasnije')
                }
            const features: FeatureBaseType[] = res.data.map((item: any) => ({
                featureId: item.featureId,
                name: item.name
            }))
            resolve(features)
        })
    })      
    }

    useEffect(() => {
        getCategories()        
    }, [])

    const printOptionalMessage = () => {
        if (state.message === '') {
            return;
        }

        return (
            <Alert title='info' variant='info' body={state.message} />
        );
    }

    const addFeatureInput = (feature: any) => {
        return (
            <ListboxItem key={feature.name}>
                {feature.name}
            </ListboxItem>     
        );
    }

    const doAddFeature = () => {
        api('/api/feature/', 'post', {
            categoryId: state.addNewFeature.categoryId,
            name: state.addNewFeature.name,
        }, 'administrator')
        .then(async (res: ApiResponse) => {
            if(res.status === 'login') {
                setLogginState(false);
                return;
            }
            if(res.status === 'error') {
                setErrorMessage('Greška prilikom dodavanja nove osobine. Provjerite da li se osobina već nalazi u listi iznad. Osvježite ili pokušajte ponovo kasnije')
                return
            }
            setErrorMessage('')
            const categoryId = Number(state.addNewFeature.categoryId);
            const features = await getFeaturesByCatId(categoryId);
            const stateFeatures = features.map(feature => ({
                featureId: feature.featureId,
                name: feature.name,
                categoryId: categoryId,
            }));

            setState((prev) => ({...prev, addNewFeature: {...prev.addNewFeature, categoryId: categoryId, features: stateFeatures}}));
        });
    }

    const addForm = () => {
        return(
            <div><Card className="mb-3">
                <CardHeader>
                    Detalji osobine
                </CardHeader>
                <CardBody>
                <div className="flex flex-col">
                    <div className='lg:flex w-full'> 
                        <div className='w-full mb-3 mr-3'>
                            <Select
                                id='categoryId'
                                label='Kategorija'
                                placeholder='Odaberite kategoriju'
                                onChange={(value) => addFeatureCategoryChanged(value)}
                            >
                                {state.categories.map((category, index) => (
                                    <SelectItem key={category.categoryId || index} textValue={`${category.categoryId} - ${category.name}`} value={Number(category.categoryId)}>
                                        {category.categoryId} - {category.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Listbox variant='flat' aria-label="Trenutne osobine">
                            <ListboxSection className={state.addNewFeature.categoryId ? '' : 'hidden'}>
                                {state.addNewFeature.features.map(addFeatureInput, this)}
                            </ListboxSection>                                    
                        </Listbox>  
                    </div>
                    <div className='w-full mb-3 mr-3'>
                        <Input
                        id="name" 
                        type="text" 
                        label="Nova osobina (naziv)"
                        labelPlacement='inside'
                        value={state.addNewFeature.name}
                        onChange={(e) => setAddNewFeatureStringState('name', e.target.value)}
                        >
                        </Input>
                    </div>
                </div>
                </CardBody>
                <CardFooter>
                    <div>
                        {printOptionalMessage()}
                    </div>
                    <div style={{ alignItems: 'end' }}>
                        <Button  onClick={() => doAddFeature()} color="success" className={state.addNewFeature.name ? '' : 'hidden'} ><i className="bi bi-plus-circle" /> Dodaj osobinu</Button>
                    </div>
                </CardFooter>
            </Card>
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

export default AddFeaturePage;
