import React, { useEffect, useState } from 'react';
import api, { ApiResponse } from '../../../API/api';
/* import {Badge, Button, Card, Col, Container, FloatingLabel, Form, ListGroup, Modal, OverlayTrigger, Row, Tooltip, } from 'react-bootstrap'; */
import FeaturesType from '../../../types/FeaturesType';
import Moment from 'moment';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import StockType from '../../../types/StockType';
import { useNavigate, useParams } from 'react-router-dom';
import ArticleInStockTable from './StockArticleTableNew';
import { Autocomplete, AutocompleteItem, Button, Card, CardBody, CardHeader, Checkbox, Chip, Input, Listbox, ListboxItem, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ScrollShadow, Select, SelectItem, Textarea, Tooltip } from '@nextui-org/react';
import { Alert } from '../../custom/Alert';
/* import { Redirect } from 'react-router-dom'; */

interface userData {
    userId: number;
    surname: string;
    forname: string;
    fullname: string;
}
interface FeatureBaseType {
    featureId?: number;
    name: string;
    stockFeatureId: number;
    value: string;  
}
interface StockPageState {
    error: {
        message: string;
        variant: "success" | "danger" | "warning";
        index: string;
    };
    stock: StockType;
    feature: FeaturesType[];
    users: userData[];
    isLoggedIn: boolean;
    expandedCards: boolean[];
    editFeature: {
        visible:boolean;
        categoryId: number;
        name: string;
        excerpt: string;
        description: string;
        concract: string;
        comment: string;
        valueOnConcract: number;
        valueAvailable: number;
        sapNumber: string;
        features: {
            use: number;
            featureId: number;
            name: string;
            value: string;
            stockFeatureId: number;
        }[]
    }
    changeStatus: {
        visible: boolean;
        userId: number | null;
        articleId: number | null;
        comment: string;
        serialNumber: string;
        invNumber: string;
        status: string;
    };
}

const StockPage: React.FC = () => {
    const{stockID} = useParams<{stockID: string}>()
    const [categoryID, setCategoryId] = useState<number | undefined>(0)
    const [selectedUser, setSelectedUser] = useState<string>('')
    const navigate = useNavigate()
    const [state, setState] = useState<StockPageState>({
        error: {
            message: '',
            variant: 'success',
            index: '',
        },
        stock: {},
        feature: [],
        users: [],
        isLoggedIn: true,
        expandedCards: new Array(2).fill(false),
        editFeature: {
            visible: false,
            categoryId: 0,
            name: "",
            excerpt: "",
            description: "",
            concract: "",
            comment: "",
            valueOnConcract: 0,
            valueAvailable: 0,
            sapNumber: "",
            features:[{
                use: 0,
                featureId: Number(),
                name: "",
                value: "",
                stockFeatureId: Number(),
            }],
        },
        changeStatus: {
            userId: 0,
            articleId: 0,
            comment: '',
            serialNumber: '',
            status: '',
            invNumber: '',
            visible: false,
        },
    })

    const setStocks = (stockData: StockType | undefined) => {
        setState((prev) => ({ ...prev, stock: stockData || {} }));
    }

    const setFeaturesData = (featuresData: FeaturesType[]) => {
        setState((prev) => ({...prev, feature: featuresData}))
    }  

    const setEditArticleStringFieldState = (fieldName: string, newValue: string) => {
        setState((prev) => ({
          ...prev,
          editFeature: {
            ...prev.editFeature,
            [fieldName]: newValue,
          },
        }));
    };
      
    const setEditArticleNumberFieldState = (fieldName: string, newValue: any) => {
    setState((prev) => ({
        ...prev,
        editFeature: {
        ...prev.editFeature,
        [fieldName]: newValue === 'null' ? null : Number(newValue),
        },
    }));
    };
      
    const setEditFeatureUse = (featureId: number, use: boolean) => {
    setState((prev) => {
        const addFeatures = [...prev.editFeature.features];
        const updatedFeatures = addFeatures.map((feature) =>
        feature.featureId === featureId ? { ...feature, use: use ? 1 : 0 } : feature
        );
    
        return {
        ...prev,
        editFeature: {
            ...prev.editFeature,
            features: updatedFeatures,
        },
        };
    });
    };
      
    const setEditFeatureValue = (featureId: number, value: string) => {
    setState((prev) => {
        const updatedFeatures = prev.editFeature.features.map((feature) =>
        feature.featureId === featureId ? { ...feature, value } : feature
        );
    
        return {
        ...prev,
        editFeature: {
            ...prev.editFeature,
            features: updatedFeatures,
        },
        };
    });
    };
      
    const setModalVisibleState = (newState: boolean) => {
    setState((prev) => ({
        ...prev,
        changeStatus: {
        ...prev.changeStatus,
        visible: newState,
        },
    }));
    };
    
    const setUsers = (usersData: userData[]) => {
    setState((prev) => ({
        ...prev,
        users: usersData,
    }));
    };
    
    const setErrorMessage = (message: string, variant: "success" | "danger" | "warning", index:string,) => {
    setState((prev) => ({
        ...prev,
        error: {
            message: message,
            variant: variant,
            index: index
        },
    }));
    };

    
    const setIsLoggedInStatus = (isLoggedIn: boolean) => {
    setState((prev) => ({
        ...prev,
        isLoggedIn,
    }));
    };
    
    const setEditFeatureModalVisibleState = (newState: boolean) => {
    setState((prev) => ({
        ...prev,
        editFeature: {
        ...prev.editFeature,
        visible: newState,
        },
    }));
    };
    
    const setChangeStatusStringFieldState = (fieldName: string, newValue: string) => {
    setState((prev) => ({
        ...prev,
        changeStatus: {
        ...prev.changeStatus,
        [fieldName]: newValue,
        },
    }));
    };
    
    const setChangeStatusNumberFieldState = (fieldName: string, newValue: any) => {
    setState((prev) => ({
        ...prev,
        changeStatus: {
        ...prev.changeStatus,
        [fieldName]: newValue === 'null' ? null : Number(newValue),
        },
    }));
    };

    const onInputChange = (value: string) => {
        setSelectedUser(value)
            const selectedUser = state.users.find(user => user.fullname === value);
                if (selectedUser) {
                    const userId = selectedUser.userId;
                    setChangeStatusNumberFieldState('userId', userId || null);
                }
    }
      
    useEffect(() => {
        getStockData()
    }, [stockID, categoryID])

    const getStockData = () => {
        try {
            api('api/stock/' + stockID, 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
            if(res.status === 'login') {
                setIsLoggedInStatus(false)
                return;
            } 
            if (res.status === 'error') {
                setStocks(undefined);
                setFeaturesData([]);
                setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije', 'danger', 'err-stock')
                return;
            }
            const data: StockType = res.data;
            setCategoryId(data.categoryId)
            setStocks(data)
            putArticleDetailsInState(res.data)
            editFeatureCategoryChanged()            
            }
        )
    } catch (error) {

    }}

    const getUsers = async () => {
        try {
            api('/api/user/', 'get', {}, 'administrator')
                .then((res: ApiResponse) => {
                    if(res.status === 'login') {
                        setIsLoggedInStatus(false)
                        return;
                    } 
                    setUsers(res.data)
                }
            )
        } catch(error) {
            setErrorMessage('Greška prilikom dohvaćanja korisnika. Greška: ' + error, 'danger', 'err-users')
        }
    }
        
    const editFeatureCategoryChanged = async () => {
        try {
        const features = await getFeaturesByCategoryId();
        const updatedFeatures = state.editFeature.features.map((feature) => ({
            ...feature,
            use: 0,
        }));

        features.forEach((feature) => {
            const existingFeature = updatedFeatures.find((f) => f.featureId === feature.featureId);

            if (existingFeature) {
            existingFeature.name = feature.name;
            existingFeature.value = feature.value;
            existingFeature.stockFeatureId = feature.stockFeatureId;
            }
        });
        setState((prevEditFeature) => ({
            ...prevEditFeature,
            features: updatedFeatures,
        }));
        } catch (error) {
        setIsLoggedInStatus(false);
        setErrorMessage('Greška prilikom dohvatanja osobina. Greška: ' + error, 'danger', 'err-edit-features')
        }
    };
    
    const getFeaturesByCategoryId = async (): Promise<FeatureBaseType[]> => {
        return new Promise(async (resolve) => {
          try {   
            const res = await api(
              '/api/feature/?filter=categoryId||$eq||' + categoryID,
              'get',
              {},
              'administrator'
            );
      
            if (res.status === 'login') {
              setIsLoggedInStatus(false);
              return;
            }
      
            const features: FeatureBaseType[] = res.data.map((item: any) => ({
              featureId: item.featureId,
              name: item.name,
              value: item.stockFeatures.map((feature: any) => feature.value),
              stockFeatureId: item.stockFeatures.map((feature: any) => feature.stockFeatureId),
            }));
    
            resolve(features);
          } catch (error) {
            setErrorMessage('Greška prilikom dohvatanja osobina po kategoriji. Greška: ' + error, 'danger', 'err-get-features-id');
          }
        });
    };
      
    const putArticleDetailsInState = async (article: StockType) => {
        try {
            setEditArticleNumberFieldState('categoryId', Number(article.categoryId));
            setEditArticleStringFieldState('name', String(article.name));
            setEditArticleStringFieldState('excerpt', String(article.excerpt));
            setEditArticleStringFieldState('description', String(article.description));
            setEditArticleStringFieldState('concract', String(article.contract));
            setEditArticleStringFieldState('valueOnConcract', String(article.valueOnContract));
            setEditArticleStringFieldState('valueAvailable', String(article.valueAvailable));
            setEditArticleStringFieldState('sapNumber', String(article.sapNumber));
    
          if (!article.stockFeatures) {
            return;
          }
    
          const allFeatures: any[] = await getFeaturesByCategoryId();
          const updatedFeatures: any[] = [];
    
          for (const apiFeature of allFeatures) {
            apiFeature.use = 0;
            apiFeature.value = '';
    
            for (const feature of article.stockFeatures) {
              if (feature && feature.featureId === apiFeature.featureId) {
                apiFeature.use = 1;
                apiFeature.value = feature.value || '';
              }
            }
    
            updatedFeatures.push(apiFeature);
          }
    
          // Postavite ažurirane osobine u state
          setState((prev) => ({
            ...prev,
            editFeature: {
              ...prev.editFeature,
              features: updatedFeatures,
            },
          }));
        } catch (error) {
          // Obrada greške
          console.error(error);
        }
    };

    const doEditArticle = () => {
        const editedFeatures = state.editFeature.features
            .filter(feature => feature.use === 1)
            .map(feature => ({
                featureId: feature.featureId,
                value: feature.value,
            }));
        const requestBody = {
            name: state.editFeature.name,
            excerpt: state.editFeature.excerpt,
            description: state.editFeature.description,
            contract: state.editFeature.concract,
            categoryId: state.editFeature.categoryId,
            sapNumber: state.editFeature.sapNumber,
            valueOnContract: state.editFeature.valueOnConcract,
            valueAvailable: state.editFeature.valueAvailable,
            features: editedFeatures,
        };
        
        
        api('api/stock/' + stockID, 'put', requestBody, 'administrator')
            .then((res: ApiResponse) => {
                if(res.status === 'login') {
                    setIsLoggedInStatus(false)
                    return;
                } 
                setEditFeatureModalVisibleState(false);
                getStockData()
            });            
    }
    
    const changeStatus = () => {
        try {
            api('api/article/' + stockID, 'post', {
                stockId: stockID,
                userId: state.changeStatus.userId,
                comment: state.changeStatus.comment,
                serialNumber: state.changeStatus.serialNumber,
                status: state.changeStatus.status,
                invNumber: state.changeStatus.invNumber,
            }, 'administrator')
            .then((res: ApiResponse) => {
                if(res.status === 'login') {
                    setIsLoggedInStatus(false)
                    return;
                } 
                /* Hvatati grešku ako korisnik nema pravo da mjenja status */
                setModalVisibleState(false)
                /* Očistiti listu nakon dodavanja, kako bi polja na sljedećoj izmjeni bila prazna */
                setState((prev) =>({
                    ...prev, changeStatus: {
                        userId: Number(),
                        comment: '',
                        serialNumber: '',
                        status: '',
                        invNumber: '',
                        visible: false,
                        articleId: null
                    }
                }))
            })
          }catch (err) {
            setErrorMessage('Greška prilikom izmjene status. Greška:' + err, 'danger', 'err-change-status')
        }
    }

    const editFeaturesInput = (feature: any) => {
        return (
            <div key={feature.featureId} id='inputi-checkbox' className='flex gap-3 items-center'>
                <Checkbox
                    className='mb-3'
                    isSelected={feature.use === 1}
                    onValueChange={(value) => setEditFeatureUse(feature.featureId, value)}
                />
                <Tooltip showArrow={true} content="U slučaju da se ne označi kvadratić pored, osobina neće biti prikazana">
                    <Input
                        type='text'
                        variant='bordered'
                        label={feature.name}
                        placeholder={feature.name}
                        value={feature.value}
                        labelPlacement='inside'
                        onChange={(e) => setEditFeatureValue(feature.featureId, e.target.value)}
                        className='flex-grow mb-3'
                    />
                </Tooltip>
            </div>
        );
    }
    
    const showEditFeatureModal = async () => {
        setEditFeatureModalVisibleState(true)
    }

    const showModal = async () => {
        setModalVisibleState(true)
        getUsers()
    }

    const printOptionalMessage = () => {
        if(state.error.message === '') {
            return;
        }

        return (
            <Alert variant='danger' title='Info!' body={state.error.message} />
        )
    }

    const badgeStatus = () => {
        let status = Number(state.stock?.valueAvailable);
        if (status === 0) {
            return (
                <Chip color="danger" style={{ marginLeft: 10, alignItems: "center", display: "flex", fontSize: 12 }}>
                    nema na stanju
                </Chip>
                )
        }
        if (status > 0) {
            return (
                <Chip color="success" style={{ marginLeft: 10, alignItems: "center", display: "flex", fontSize: 12 }}>
                    dostupno
                </Chip>
            )
        }
    }

    const changeStatusButton = () => {
        let status = Number(state.stock?.valueAvailable);

        if (status === 0) {
            return (
                <Chip color="danger" >
                    nema na stanju
                </Chip>
            )
        }
        if (status > 0) {
            return (                    
                <div id='modal-zaduzenja'>
                    <Button size='sm' color='success' onClick={() => showModal()}><i className="bi bi-pencil-square" /> Izmjeni/zaduži</Button>
                        <Modal size="lg" backdrop='blur' isOpen={state.changeStatus.visible} onClose={() => setModalVisibleState(false)}>
                            <ModalContent>
                                <ModalHeader>
                                    Kartica zaduženja
                                </ModalHeader>
                                    <ModalBody>
                                        <Select
                                            variant='bordered'
                                            label="Status"
                                            placeholder="Odaberite status"
                                            onChange={(e) => {setChangeStatusStringFieldState('status', e.target.value);}}
                                            disabledKeys={['razduženo', 'otpisano']}
                                            >
                                                <SelectItem key={'zaduženo'} value={'zaduženo'}>
                                                    zaduženo
                                                </SelectItem>
                                                <SelectItem isReadOnly key={'razduženo'} value={'razduženo'}>
                                                    razduženo
                                                </SelectItem>
                                                <SelectItem isReadOnly  key={'otpisano'} value={'otpisano'}>
                                                    otpisano
                                                </SelectItem>
                                        </Select>
                                        <Autocomplete
                                            label='Odaberi korisnika'
                                            id="pick-the-user"
                                            onInputChange={onInputChange}
                                            isClearable
                                            aria-label="Autocomplete za odabir korisnika"
                                            aria-live="assertive"
                                            >
                                            {state.users.map((option) => (
                                                <AutocompleteItem key={option.userId !== undefined ? option.userId : 'defaultKey'} value={''}>{option.fullname}</AutocompleteItem>
                                            ))}
                                        </Autocomplete>

                                        <Input
                                            type='text'
                                            variant='bordered'
                                            label='Serijski broj'
                                            key={'serial-number'}
                                            labelPlacement='inside'
                                            onChange={(e) => setChangeStatusStringFieldState('serialNumber', e.target.value)}
                                        />
                                        <Input
                                            type='text'
                                            variant='bordered'
                                            label='Inventurni broj'
                                            key={'inventurni-broj'}
                                            labelPlacement='inside'
                                            onChange={(e) => setChangeStatusStringFieldState('invNumber', e.target.value)}

                                        />

                                        <Textarea
                                            label="Opis"
                                            placeholder="Upišite razlog zaduženja/razduženja/otpisa"
                                            key={'description'}
                                            variant='bordered'
                                            onChange={(e) => setChangeStatusStringFieldState('comment', e.target.value)}
                                            description='Neobavezno'
                                        />  
                                        <ModalFooter>
                                            <Button color="success" onClick={() => changeStatus()}> Sačuvaj </Button>
                                        </ModalFooter>
                                    </ModalBody>
                                </ModalContent>
                            </Modal>
                    </div>
            )
        }
    }

    const renderStockData = (article: StockType) => {
        return (
            <>
            
            <div className="lg:flex">
                <div className="lg:w-8/12 xs:w-full lg:mr-5">
                    <div className="lg:flex">
                        <div className="lg:w-4/12 xs:w-full flex justify-center items-center">
                        <i className={`${article.category?.imagePath}`} style={{ fontSize: 150 }}></i>
                        </div>
                        <div className="lg:w-8/12 xs:w-full">
                            {article.stockFeatures && article.stockFeatures[0] && (
                                <ScrollShadow hideScrollBar className="h-[180px]">
                                    <Listbox variant="flat" key={`stockFeatures:${article.stockFeatures[0].featureId}`}>
                                    {article.stockFeatures.map((feature, index) => (
                                        <ListboxItem textValue={feature.feature?.name} key={index}>
                                            {feature.feature && <b>{feature.feature.name}:</b>} {feature.value}
                                        </ListboxItem>
                                    ))}
                                    </Listbox>
                                </ScrollShadow>
                                )}
                        </div>
                    </div>
                    <div className="lg:flex">
                        <div className="w-full lg:w-12/12 sm:w-12/12">
                            <Card className="mb-3">
                            <CardHeader>Detaljan opis</CardHeader>
                            <CardBody>
                                <ScrollShadow size={100} hideScrollBar className="w-full max-h-[250px]">
                                {article.description}
                                </ScrollShadow>
                            </CardBody>
                            </Card>
                        </div>
                    </div>
                </div>
                <div className="w-full sm:w-full lg:w-1/3">
                    <Card>
                        <CardHeader className='grid grid-cols-6'>
                            <div className="col-span-5">U skladištu</div>
                            <div className="col-end-7 flex justify-end">{changeStatusButton()}</div>
                        </CardHeader>
                        <Listbox aria-label="Odaberi stavku iz liste" variant="flat" key={`stock:${article.stockId}`}>
                            <ListboxItem textValue={article.valueOnContract?.toString()} key={'trenutno-stanje'}>Stanje po ugovoru: {article.valueOnContract}</ListboxItem>
                            <ListboxItem textValue={article.valueAvailable?.toString()} key={'dostupno-stanje'}>Trenutno stanje: {article.valueAvailable}</ListboxItem>
                            <ListboxItem textValue={article.sapNumber} key={'sap-broj'}>SAP broj: {article.sapNumber}</ListboxItem>
                            <ListboxItem textValue={article.timestamp} key={'datum-akcije'}>Stanje na: {Moment(article.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListboxItem>
                        </Listbox>
                    </Card>
                </div>
            </div>

            <div id='tabela-artikala' className="w-full mt-5"> {/* drugi kontejner punog sadržaja */}
                <ArticleInStockTable stockId={state.stock.stockId || 0} />
            </div>
                        
             

            <Modal size="3xl" placement='auto' scrollBehavior='inside' backdrop='blur'
                isOpen={state.editFeature.visible} onClose={() => setEditFeatureModalVisibleState(false)}
                aria-labelledby="modal-edit-feature"
                >
                <ModalContent id='modal-edit-sadrzaj'>
                    <ModalHeader id="modal-edit-feature">
                        Izmjena detalja opreme
                    </ModalHeader>
                    <ModalBody id='modal-edit-body'>
                    <ScrollShadow id='sjena-tekst' hideScrollBar className="w-full max-h-[110vh] gap-3 grid">
                    <Input
                        type='text'
                        variant='bordered'
                        label='Naziv'
                        key={'name'}
                        labelPlacement='inside'
                        value={state.editFeature.name}
                        onChange={(e) => setEditArticleStringFieldState('name', e.target.value)}
                        aria-describedby="naziv-helper-text"
                    />
                    <Textarea
                        label="Kartki opis"
                        placeholder="Upišite kratki opis"
                        key={'excerpt'}
                        variant='bordered'
                        value={state.editFeature.excerpt}
                        onChange={(e) => setEditArticleStringFieldState('excerpt', e.target.value)}
                        aria-describedby="excerpt-helper-text"
                    />
                    <Textarea
                        label="Detaljan opis"
                        placeholder="Upišite detaljan opis"
                        key={'description'}
                        variant='bordered'
                        value={state.editFeature.description}
                        onChange={(e) => setEditArticleStringFieldState('description', e.target.value)}
                        aria-describedby="description-helper-text"
                    />
                    <Input
                        type='text'
                        variant='bordered'
                        label='Ugovor'
                        key={'concract'}
                        labelPlacement='inside'
                        value={state.editFeature.concract}
                        onChange={(e) => setEditArticleStringFieldState('concract', e.target.value)}
                        aria-describedby="ugovor-helper-text"
                    />
                    <Input
                        type='number'
                        variant='bordered'
                        label='Stanje po ugovoru'
                        key={'valueOnConcract'}
                        labelPlacement='inside'
                        value={state.editFeature.valueOnConcract.toString()}
                        onChange={(e) => setEditArticleNumberFieldState('valueOnConcract', e.target.value)}
                        aria-describedby="po-ugovoru-helper-text"
                    />
                    <Input
                        type='number'
                        variant='bordered'
                        label='Dostupno artikala'
                        key={'valueAvailable'}
                        labelPlacement='inside'
                        value={state.editFeature.valueAvailable.toString()}
                        onChange={(e) => setEditArticleNumberFieldState('valueAvailable', e.target.value)}
                        aria-describedby="dostupno-helper-text"
                    />
                    <Input
                        type='text'
                        variant='bordered'
                        label='SAP broj'
                        key={'sap_number'}
                        labelPlacement='inside'
                        value={state.editFeature.sapNumber}
                        onChange={(e) => setEditArticleStringFieldState('sapNumber', e.target.value)}
                        aria-describedby="sap-broj-helper-text"
                    />
                    <div>
                        {state.editFeature.features.map(editFeaturesInput, this)}
                    </div>
                    </ScrollShadow>
                        
                        
                    </ModalBody>
                    <ModalFooter id='modal-edit-footer'>
                        <Button color="success" onClick={() => doEditArticle()}> Sačuvaj
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            </>
        );
    }

    return (
        <div>
            <RoledMainMenu />
            <div className="container mx-auto lg:px-4 mt-3 h-max">
                <Card>
                    <CardHeader className='grid grid-cols-6 gap-2'>
                        <div className='col-span-4 flex flex-nowrap'>
                            <i className={state.stock?.category?.imagePath} />
                            <div className='pl-2 col-start-2'>
                                {state.stock ?
                                    state.stock?.name :
                                    'Oprema nije pronađena'}
                            </div>
                        </div>
                        <div className='lg:col-end-7 xs:col-end-5 flex justify-center gap-2'>
                            {badgeStatus()}
                            <Button size='sm' color='success' onClick={() => showEditFeatureModal()}><i className="bi bi-pencil-square" /> Izmjeni</Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {printOptionalMessage()}

                        {state.stock ?
                            (renderStockData(state.stock)) :
                            ''}
                    </CardBody>
                </Card>
            </div>
        </div>   
    )
}

export default StockPage;