import React, { useEffect, useState } from 'react';
import api, { ApiResponse } from '../../../API/api';
import ArticleType from '../../../types/ArticleType';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import CategoryType from '../../../types/CategoryType';
import ApiArticleDto from '../../../dtos/ApiArticleDto';
import AdminMenu from '../AdminMenu/AdminMenu';
import { Alert } from '../../custom/Alert';
import { Button, Card, CardBody, CardFooter, CardHeader, Checkbox, Input, Select, SelectItem, Spinner, Textarea, Tooltip } from '@nextui-org/react';

interface AddArticlePageState{
    articles: ArticleType[];
    categories: CategoryType[];
    message: string;
    isLoggedIn: boolean;
    addArticle: {
        name: string;
        categoryId: number;
        excerpt: string;
        description: string;
        concract: string;
        comment: string;
        sapNumber: string;
        valueOnConcract: number;
        valueAvailable: number;
        features: {
            use: number;
            featureId: number;
            name: string;
            value: string;
        }[]
    }
}

interface FeatureBaseType {
    featureId: number;
    name: string;
}
interface CategoryDto {
    categoryId: number,
    name: string,
    imagePath: string,
    parentCategoryId: number,
}



const AddArticlePage: React.FC = () => {
    const [state, setState] = useState<AddArticlePageState>({
        articles: [],
        categories: [],
        message: '',
        isLoggedIn: true,
        addArticle: {
            name: '',
            categoryId: 0,
            excerpt: '',
            description: '',
            concract: '',
            comment: '',
            sapNumber: '',
            valueOnConcract: 0,
            valueAvailable: 0,
            features: [],
        }
    })

    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        getArticle()
        getCategories()
    },[])

    const setErrorMessage = (message: string) => {
        setState(prev => ({...prev, message: message}))
    }

    const setIsLoggedInStatus = (isLoggedIn: boolean) => {
        setState(prev => ({...prev, isLoggedIn: isLoggedIn}))
    }

    const setAddArticleStringFieldState = (fieldName: string, newValue: string) => {
        setState((prev) => ({
            ...prev, addArticle: {...prev.addArticle, [fieldName]: newValue}
        }))
    }

    const setAddArticleNumberFieldState = (fieldName: string, newValue: any) => {
        setState((prev) => ({
            ...prev, addArticle: {...prev.addArticle, [fieldName]: (newValue === 'null') ? null : Number(newValue)}
        }))
    }

    const setAddArticleFeatureUse = (featureId: number, use: boolean) => {
        const addFeatures: { featureId: number; use: number; }[] = [...state.addArticle.features];

        for (const feature of addFeatures) {
            if (feature.featureId === featureId) {
                feature.use = use ? 1 : 0;
                break;
            }
        }

        setState((prev) => ({...prev, features: addFeatures}))
    }

    const setAddArticleFeatureValue = (featureId: number, value: string) => {
        const addFeatures: { featureId: number; value: string; }[] = [...state.addArticle.features];

        for (const feature of addFeatures) {
            if (feature.featureId === featureId) {
                feature.value = value;
                break;
            }
        }
        
        setState((prev) => ({...prev, features: addFeatures}))
    }

    const clearFormFields = () => {
        setState((prevState) => ({
            ...prevState,
            addArticle: {
                name: '',
                categoryId: 0,
                excerpt: '',
                description: '',
                concract: '',
                comment: '',
                sapNumber: '',
                valueOnConcract: 0,
                valueAvailable: 0,
                features: [],
            },
        }));
    };
    
    /* Kraj SET */
    /* GET */
    const getArticle = async () => {
        try{
            setLoading(true)
            await api('api/article/?join=articleFeatures&join=features&join=category', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if(res.status === 'login') {
                    setIsLoggedInStatus(false);
                    return;
                }
                if(res.status === 'error') {
                    setErrorMessage('Greška prilikom učitavanja artikala. Osvježite ili pokušajte ponovo kasnije')
                }
                putArticlesInState(res.data)
                setLoading(false)
            })
        } catch(error){
            setErrorMessage('Greška prilikom učitavanja artikala. Osvježite ili pokušajte ponovo kasnije')
            setLoading(false)
        }
        
    }

    const putArticlesInState = (data?: ApiArticleDto[]) => {
        const articles: ArticleType[] | undefined = data?.map(article => {
            return {
                articleId: article.articleId,
                name: article.name,
                excerpt: article.excerpt,
                description: article.description,
                concract: article.concract,
                sapNumber: article.sapNumber,
                articleFeatures: article.articleFeature,
                features: article.features,
                category: article.category,
                categoryId: article.categoryId,
            };
        });

        setState(Object.assign(state, {
            articles: articles,
        }));
    }

    const getFeaturesByCatId = async (categoryId: number): Promise<FeatureBaseType[]> => {
        return new Promise(resolve => {
            api('api/feature/?filter=categoryId||$eq||' + categoryId + '/', 'get', {}, 'administrator')
            .then((res : ApiResponse) => {
                if(res.status === 'login') {
                    setIsLoggedInStatus(false);
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

    const getCategories = async () => {
        try{
          
            await api('api/category/?filter=parentCategoryId||$notnull', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if(res.status === 'login') {
                    setIsLoggedInStatus(false);
                    return;
                }
                if (res.status === "error" ) {
                    return;
                }
                putCategoriesInState(res.data)
                
            })
        }catch(error){
            setErrorMessage('Greška prilikom učitavanja artikala. Osvježite ili pokušajte ponovo kasnije')
        }
        
    }

    const putCategoriesInState = (data?: CategoryDto[]) => {
        const categories: CategoryType[] | undefined = data?.map(category => {
            return {
                categoryId: category.categoryId,
                name: category.name,
                imagePath: category.imagePath,
                parentCategoryId: category.parentCategoryId,
            };
        });

        setState(Object.assign(state, {
            categories: categories,
        }));
    }

    const addArticleCategoryChanged = async (selectedValue:any) => {
        console.log(selectedValue.target.value)
        setAddArticleNumberFieldState('categoryId', selectedValue.target.value);

        const features = await getFeaturesByCatId(selectedValue.target.value);
        const stateFeatures = features.map(feature => ({
            featureId: feature.featureId,
            name: feature.name,
            value: '',
            use: 0,
        }));
        setState((prev) => ({...prev, addArticle: {...prev.addArticle, features: stateFeatures}}))
    }
    /* Kraj GET */
    /* Dodatne funkcije */
    const printOptionalMessage = () => {
        if (state.message === '') {
            return;
        }

        return (
            <Alert title='info' variant='info' body={state.message} />
        );
    }

    const addArticleFeatureInput = (feature: any) => {
        return (
            <div key={feature.featureId} id='inputi-checkbox' className='flex gap-3 items-center'>
                <Checkbox
                    className='mb-3'
                    isSelected={feature.use === 1}
                    onValueChange={(value) => setAddArticleFeatureUse(feature.featureId, value)}
                />
                <Tooltip showArrow={true} content="U slučaju da se ne označi kvadratić pored, osobina neće biti prikazana">
                    <Input
                        type='text'
                        variant='bordered'
                        label={feature.name}
                        placeholder={feature.name}
                        value={feature.value}
                        labelPlacement='inside'
                        onChange={(e) => setAddArticleFeatureValue(feature.featureId, e.target.value)}
                        className='flex-grow mb-3'
                    />
                </Tooltip>
            </div>
        );
    }

    const doAddArticle = () => {
        const requestBody = {
            name: state.addArticle.name,
            excerpt: state.addArticle.excerpt,
            description: state.addArticle.description,
            contract: state.addArticle.concract,
            categoryId: state.addArticle.categoryId,
            sapNumber: state.addArticle.sapNumber,
            valueOnContract: state.addArticle.valueOnConcract,
            valueAvailable: state.addArticle.valueAvailable,
            features: state.addArticle.features
                .filter(feature => feature.use === 1)
                .map(feature => ({
                    featureId: feature.featureId,
                    value: feature.value,
                })),
        };
    
        api('/api/stock/', 'post', requestBody, 'administrator').then(async (res: ApiResponse) => {
            if(res.status === 'login') {
                setIsLoggedInStatus(false);
                return;
            }
            if (res.status === 'ok') {
                clearFormFields();
            }
        });
    }
    
    /* Kraj dodatnih funkcija */


    const addForm = () => {
        return (
            <div>
            <Card className="mb-3">
                <CardHeader>Detalji opreme</CardHeader>
                <CardBody>
                    <div className="flex flex-col">
                        <div className='w-full mb-3 mr-3'>
                            <Input
                            id="name" 
                            type="text" 
                            label="Naziv opreme"
                            labelPlacement='inside'
                            value={ state.addArticle.name }
                            onChange={(e) => setAddArticleStringFieldState('name', e.target.value) }
                            >
                            </Input>
                        </div>

                        <div className='w-full mb-3 mr-3'>
                            <Select
                                id='categoryId'
                                label='Kategorija'
                                placeholder='Odaberite kategoriju'
                                onChange={(value) => addArticleCategoryChanged(value)}
                            >
                                {state.categories.map((category, index) => (
                                    <SelectItem key={category.categoryId || index} textValue={`${category.categoryId} - ${category.name}`} value={Number(category.categoryId)}>
                                        {category.categoryId} - {category.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className='w-full mb-3 mr-3'>
                            <Textarea
                            id="excerpt"
                            label="Kratki opis"
                            placeholder="Opišite artikal ukratko"
                            value={ state.addArticle.excerpt }
                            onChange={ (e) => setAddArticleStringFieldState('excerpt', e.target.value) }
                            />
                        </div>

                        <div className='w-full mb-3 mr-3'>
                            <Textarea
                            id="description"
                            label="Detaljan opis"
                            placeholder="Opišite detaljno artikal"
                            value={ state.addArticle.description }
                            onChange={ (e) => setAddArticleStringFieldState('description', e.target.value) }
                            />
                        </div>

                        <div className='w-full mb-3 mr-3'>
                            <Input
                            id="sapNumber" 
                            type="text" 
                            label="SAP broj"
                            labelPlacement='inside'
                            value={ state.addArticle.sapNumber }
                            onChange={(e) => setAddArticleStringFieldState('sapNumber', e.target.value) }
                            >
                            </Input>
                        </div>

                        <div className='w-full mb-3 mr-3'>
                            <Textarea
                            id="comment"
                            label="Komentar"
                            placeholder="Neobavezno"
                            value={ state.addArticle.comment }
                            onChange={ (e) => setAddArticleStringFieldState('comment', e.target.value) }
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>
            <Card className="mb-3">
                <CardHeader>Osobine skladišta</CardHeader>
                <CardBody>
                <div className="flex flex-col">
                        <div className='w-full mb-3 mr-3'>
                            <Input
                            id="concract" 
                            type="text" 
                            label="Broj ugovora"
                            labelPlacement='inside'
                            value={ state.addArticle.concract }
                            onChange={(e) => setAddArticleStringFieldState('concract', e.target.value) }
                            >
                            </Input>
                        </div>

                        <div className='w-full mb-3 mr-3'>
                            <Input
                            id="valueOnConcract" 
                            type="number" 
                            label="Stanje po ugovoru"
                            labelPlacement='inside'
                            value={ state.addArticle.valueOnConcract.toString()}
                            onChange={(e) => setAddArticleNumberFieldState('valueOnConcract', e.target.value) }
                            >
                            </Input>
                        </div>

                        <div className='w-full mb-3 mr-3'>
                            <Input
                            id="valueAvailable" 
                            type="number" 
                            label="Dostupno stanje"
                            labelPlacement='inside'
                            value={ state.addArticle.valueAvailable.toString()}
                            onChange={(e) => setAddArticleNumberFieldState('valueAvailable', e.target.value) }
                            >
                            </Input>
                        </div>
                    </div>
                </CardBody>
            </Card>
            <Card className={state.addArticle.categoryId ? '' : 'hidden mb-3'}>
                <CardHeader>Detalji opreme</CardHeader>
                <CardBody>
                    <div className="flex flex-col">
                        {state.addArticle.features.map(addArticleFeatureInput, this)}
                    </div>
                </CardBody>
                <CardFooter>
                    <div style={{ alignItems: 'end' }}>
                        <Button onClick={() => doAddArticle()} color="success"><i className="bi bi-plus-circle"/> Dodaj opremu</Button>
                    </div>
                </CardFooter>
            </Card>

            
            </div>
        )
    }
        return(
            <div>
            <RoledMainMenu />
            <div className="container mx-auto lg:px-4 mt-3 h-max">
                {loading ? (
                    <div className="flex justify-center items-center h-screen">
                        <Spinner color='danger' label='Učitavanje...' labelColor='danger' />
                    </div>
                ) : (
                    addForm()
                )}
                <AdminMenu />
            </div>
        </div>
    )
}
export default AddArticlePage