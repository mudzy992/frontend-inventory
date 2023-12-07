import React, { useEffect, useState } from 'react';
import api, { ApiResponse } from '../../../API/api';
import {Badge, Button, Card, Col, Container, FloatingLabel, Form, ListGroup, Modal, OverlayTrigger, Row, Tooltip, } from 'react-bootstrap';
import FeaturesType from '../../../types/FeaturesType';
import Moment from 'moment';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import StockType from '../../../types/StockType';
/* import ArticleInStockTable from './StockArticleTableNew.tsx'; */
import { useNavigate, useParams } from 'react-router-dom';
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
    message: string;
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
    const navigate = useNavigate()
    const [state, setState] = useState<StockPageState>({
        message: "",
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
      
      const setErrorMessage = (message: string) => {
        setState((prev) => ({
          ...prev,
          message,
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
      
    const toggleExpand = (index:number) => {
        setState((prev) => {
        const expandedCards = [...prev.expandedCards];
        expandedCards[index] = !expandedCards[index];
        return { ...prev, expandedCards };
        });
    };

    useEffect(() => {
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
                    setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                    return;
                }
                const data: StockType = res.data;
                setErrorMessage('')
                setCategoryId(data.categoryId)
                setStocks(data)
                
                putArticleDetailsInState(res.data)
                editFeatureCategoryChanged() 
                }
            )
        } catch (error) {

        }}
        getStockData()
    }, [stockID])


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
            setErrorMessage('Greška prilikom dohvaćanja korisnika. Greška: ' + error)
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
        setErrorMessage('Greška prilikom dohvatanja osobina. Greška: ' + error)
        }
    };
    
    const getFeaturesByCategoryId = async (): Promise<FeatureBaseType[]> => {
        return new Promise(async (resolve) => {
          try {
            const categoryId = state.stock?.categoryId;
      
            // Dodajte provjeru postoji li categoryId prije nego što ga koristite
            if (!categoryId) {
              console.warn('categoryId nije dostupan.');
              return;
            }
      
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
      
            console.log(features);
            resolve(features);
          } catch (error) {
            setErrorMessage('Greška prilikom dohvatanja osobina po kategoriji. Greška: ' + error);
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
            setEditArticleStringFieldState('comment', String(article.timestamp));
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
            setErrorMessage('Greška prilikom izmjene status. Greška:' + err)
        }
    }

    const editFeaturesInput = (feature: any) => {
        return (
            <div><Form.Group className="mb-3 was-validated">
                <Row style={{ alignItems: 'baseline' }}>
                    <Col xs="4" sm="1" className="text-center">
                        <input type="checkbox" value="1" checked={feature.use === 1}
                            onChange={(e) => setEditFeatureUse(feature.featureId, e.target.checked)} />
                    </Col>

                    <Col>
                        <FloatingLabel label={feature.name} className="mb-3">
                        <OverlayTrigger 
                            placement="top"
                            delay={{ show: 250, hide: 400 }}
                            overlay={
                            <Tooltip id="tooltip-serialNumber">U slučaju da se ne označi kvadratić pored, osobina neće biti prikazana</Tooltip>
                            }> 
                            <Form.Control
                                id="name"
                                type="text"
                                placeholder={feature.name}
                                value={feature.value}
                                onChange={(e) => setEditFeatureValue(feature.featureId, e.target.value)}
                                required /></OverlayTrigger>
                        </FloatingLabel>
                    </Col>
                </Row>
            </Form.Group>
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
        if(state.message === '') {
            return;
        }

        return (
            <Card.Text>
                {state.message}
            </Card.Text>
        )
    }

    const badgeStatus = () => {
        let status = Number(state.stock?.valueAvailable);
        if (status === 0) {
            return (
                <Badge pill bg="danger" style={{ marginLeft: 10, alignItems: "center", display: "flex", fontSize: 12 }}>
                    nema na stanju
                </Badge>
                )
        }
        if (status > 0) {
            return (
                <Badge pill bg="success" style={{ marginLeft: 10, alignItems: "center", display: "flex", fontSize: 12 }}>
                    dostupno
                </Badge>
            )
        }
    }

    const changeStatusButton = () => {
        let status = Number(state.stock?.valueAvailable);

        if (status === 0) {
            return (
                <Badge pill bg="danger" >
                    nema na stanju
                </Badge>
            )
        }
        if (status > 0) {
            return (                    
                    <div><Button size='sm' onClick={() => showModal()}><i className="bi bi-pencil-square" /> Izmjeni/zaduži</Button><Modal size="lg" centered show={state.changeStatus.visible} onHide={() => setModalVisibleState(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Kartica zaduženja</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Form.Group className='was-validated'>
                            <FloatingLabel label="Status" className="mb-3">
                                <Form.Select id="status" required
                                    onChange={(e) => setChangeStatusStringFieldState('status', e.target.value)}>
                                    <option value=''> izaberi status</option>
                                    <option value='zaduženo'>
                                        zaduženo
                                    </option>
                                    <option value='razduženo'>
                                        razduženo
                                    </option>
                                    <option value='otpisano'>
                                        otpisano
                                    </option>
                                </Form.Select>
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group className='was-validated'>
                            {/* <Autocomplete
                                className='mb-3'
                                disablePortal
                                id="pick-the-user"
                                disabled={state.changeStatus.status === 'razduženo' || state.changeStatus.status === 'otpisano'}
                                onChange={(event, value, reason) => {
                                    if (reason === 'selectOption' && typeof value === 'string') {
                                        const selectedUser = state.users.find(user => user.fullname === value);
                                        if (selectedUser) {
                                            const userId = selectedUser.userId;
                                            setChangeStatusNumberFieldState('userId', userId || null);
                                        }
                                    }
                                }}
                                options={state.users.map((option) => option.fullname)}
                                renderInput={(params) => <TextField {...params} label="Novo zaduženje na korisnika"/>}
                            /> */}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <FloatingLabel label="Kolicina" className="mb-3">
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={<Tooltip id="tooltip-kolicina">Zadana vrijednost zaduženja ove opreme je 1 KOM</Tooltip>}>
                                    <Form.Control id='kolicina' type='text' readOnly isValid required placeholder='1 KOM' value='1 KOM' /></OverlayTrigger>  </FloatingLabel>
                            <Form.Text></Form.Text>
                        </Form.Group>
                        <Form.Group className='was-validated'>
                            <FloatingLabel label="Serijski broj" className="mb-3">
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={<Tooltip id="tooltip-serialNumber">U ovom koraku se dodjeljuje korisniku oprema po serijskom broju. Serijski broj se kasnije ne može mjenjati.</Tooltip>}>
                                    <Form.Control type='text' id='serialNumber' required
                                        onChange={(e) => setChangeStatusStringFieldState('serialNumber', e.target.value)} />
                                </OverlayTrigger>
                            </FloatingLabel>
                            <FloatingLabel label="Inventurni broj" className="mb-3">
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={<Tooltip id="tooltip-invNumber">U ovom koraku se dodjeljuje inventurni broj opremi. Inventurni broj se kasnije ne može mjenjati.</Tooltip>}>
                                    <Form.Control type='text' id='invNumber' value={state.changeStatus.invNumber} isValid required
                                        onChange={(e) => setChangeStatusStringFieldState('invNumber', e.target.value)} />
                                </OverlayTrigger>
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group className='was-validated'>
                            <FloatingLabel label="Komentar" className="mb-3">
                                <Form.Control
                                    id="comment"
                                    as="textarea"
                                    rows={3}
                                    placeholder="(neobavezno)"
                                    style={{ height: '100px' }}
                                    onChange={(e) => setChangeStatusStringFieldState('comment', e.target.value)}
                                    required
                                    isValid /></FloatingLabel>
                        </Form.Group>
                        <Modal.Footer>
                            <Button variant="primary" onClick={() => changeStatus()}> Sačuvaj
                            </Button>
                        </Modal.Footer>
                    </Modal.Body>
                </Modal></div>
            )
        }

        return (
            <Col lg="3" xs="3" sm="3" md="3" style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center"
            }}>
            </Col>
        )

    }

    const renderStockData = (article: StockType) => {
        const { expandedCards } = state;
        return (
            <><Row>
                <Col xs="12" lg="8">
                    <Row>
                        <Col xs="12" lg="4" sm="4" style={{ justifyContent: 'center', alignItems: "center", display: "flex" }}>
                            <i className={`${article.category?.imagePath}`} style={{ fontSize: 150 }}></i>
                        </Col>
                        <Col xs="12" lg="8" sm="8">
                            <Card bg="dark" text="light" className="mb-3">
                                <Card.Header style={{ backgroundColor: "#263238" }}>
                                    Detalji opreme
                                    <Modal size="lg" centered show={state.editFeature.visible} onHide={() => setEditFeatureModalVisibleState(false)}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Izmjena detalja opreme</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <Form>
                                                <Form.Group className="mb-3 was-validated">
                                                    <FloatingLabel label="Naziv opreme" className="mb-3">
                                                        <Form.Control
                                                            id="name"
                                                            type="text"
                                                            placeholder="Naziv"
                                                            value={state.editFeature.name}
                                                            onChange={(e) => setEditArticleStringFieldState('name', e.target.value)}
                                                            required />
                                                    </FloatingLabel>
                                                    <FloatingLabel label="Kratki opis" className="mb-3">
                                                        <Form.Control
                                                            id="excerpt"
                                                            as="textarea"
                                                            rows={3}
                                                            style={{ height: '100px' }}
                                                            placeholder="Kratki opis"
                                                            value={state.editFeature.excerpt}
                                                            onChange={(e) => setEditArticleStringFieldState('excerpt', e.target.value)}
                                                            required />
                                                    </FloatingLabel>
                                                    <FloatingLabel label="Detaljan opis" className="mb-3">
                                                        <Form.Control
                                                            id="description"
                                                            as="textarea"
                                                            rows={5}
                                                            style={{ height: '100px' }}
                                                            placeholder="Detaljan opis"
                                                            value={state.editFeature.description}
                                                            onChange={(e) => setEditArticleStringFieldState('description', e.target.value)}
                                                            required />
                                                    </FloatingLabel>
                                                    <FloatingLabel label="Ugovor" className="mb-3">
                                                        <Form.Control
                                                            id="concract"
                                                            type="text"
                                                            placeholder="Ugovor"
                                                            value={state.editFeature.concract}
                                                            onChange={(e) => setEditArticleStringFieldState('concract', e.target.value)}
                                                            required />
                                                    </FloatingLabel>
                                                    <FloatingLabel label="Stanje po ugovoru" className="mb-3">
                                                        <Form.Control
                                                            id="valueOnConcract"
                                                            type="text"
                                                            placeholder="Stanje po ugovoru"
                                                            value={state.editFeature.valueOnConcract}
                                                            onChange={(e) => setEditArticleNumberFieldState('valueOnConcract', e.target.value)}
                                                            required
                                                            readOnly />
                                                    </FloatingLabel>
                                                    <FloatingLabel label="Dostupno artikala" className="mb-3">
                                                        <Form.Control
                                                            id="valueAvailable"
                                                            type="text"
                                                            placeholder="SAP Broj"
                                                            value={state.editFeature.valueAvailable}
                                                            onChange={(e) => setEditArticleNumberFieldState('valueAvailable', e.target.value)}
                                                            required />
                                                    </FloatingLabel>
                                                    <FloatingLabel label="SAP broj" className="mb-3">
                                                        <Form.Control
                                                            id="sap_number"
                                                            type="text"
                                                            placeholder="SAP Broj"
                                                            value={state.editFeature.sapNumber}
                                                            onChange={(e) => setEditArticleStringFieldState('sapNumber', e.target.value)}
                                                            required />
                                                    </FloatingLabel>
                                                    <FloatingLabel label="Komentar" className="mb-3">
                                                        <Form.Control
                                                            id="comment"
                                                            as="textarea"
                                                            rows={3}
                                                            style={{ height: '100px' }}
                                                            value={state.editFeature.comment}
                                                            onChange={(e) => setEditArticleStringFieldState('comment', e.target.value)}
                                                            required
                                                            isValid />
                                                    </FloatingLabel>
                                                </Form.Group>
                                                <Form.Group className='was-validated'>
                                                    {state.editFeature.features.map(editFeaturesInput, this)}
                                                </Form.Group>
                                            </Form>
                                            <Modal.Footer>
                                                <Button variant="primary" onClick={() => doEditArticle()}> Sačuvaj
                                                </Button>
                                            </Modal.Footer>
                                        </Modal.Body>
                                    </Modal>
                                </Card.Header>

                                <ListGroup variant="flush" >
                                {article.stockFeatures && article.stockFeatures.map(feature => (
                                        <ListGroup.Item key={feature.feature?.name}>
                                            <b>{feature.feature?.name}:</b> {feature.value}
                                        </ListGroup.Item>
                                ))}
                                <ListGroup.Item></ListGroup.Item>
                                </ListGroup>
                                {/* <div className='moreLess'>
                                    {article.stockFeatures ? article.stockFeatures.length > 4 && (
                                        <Link className='linkStyle' onClick={() => toggleExpand(0)}>
                                            {expandedCards[0] ? <KeyboardDoubleArrowUp /> : <KeyboardDoubleArrowDown />}
                                        </Link>
                                    ):""}
                                </div> */}
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12" lg="12" sm="12">
                            <Card bg="dark" text="light" className="mb-3">
                                <Card.Header style={{ backgroundColor: "#263238" }}>Detaljan opis</Card.Header>
                                <Card.Body className={`kartica-wrapper description ${expandedCards[1] ? 'kartica-expanded' : ''}`}>
                                    {article.description}
                                </Card.Body>
                                {/* <div className='moreLess'>
                                    {article.description ? article.description.length > 100 && (
                                        <Link className='linkStyle' onClick={() => toggleExpand(1)}>
                                            {expandedCards[1] ? <KeyboardDoubleArrowUp /> : <KeyboardDoubleArrowDown />}
                                        </Link>
                                    ):""}
                                </div> */}
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <Col sm="12" xs="12" lg="4">
                    <Row>
                        <Col>
                            <Card className="text-dark bg-light mb-2">
                                <Card.Header>
                                    <Row style={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}>
                                        <Col style={{
                                            display: "flex",
                                            justifyContent: "flex-start",
                                        }}>
                                            U skladištu
                                        </Col>
                                        <Col style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                        }}>
                                            {changeStatusButton()}
                                        </Col>

                                    </Row>
                                </Card.Header>
                                <ListGroup variant="flush">
                                    <ListGroup.Item>Stanje po ugovoru: {article.valueOnContract}</ListGroup.Item>
                                    <ListGroup.Item>Trenutno stanje: {article.valueAvailable}</ListGroup.Item>
                                    <ListGroup.Item>SAP broj: {article.sapNumber}</ListGroup.Item>
                                    <ListGroup.Item>Stanje na: {Moment(article.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListGroup.Item>
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row>
                <Col>
                    {/* <ArticleInStockTable stockId={state.stock.stockId || 0} /> */}
                </Col>
            </Row>
            </>
        );
    }

    return (
        <div>
            <RoledMainMenu role='administrator' />
            <Container style={{ marginTop: 15 }}>
                <Card className="text-white bg-dark">
                    <Card.Header >
                        <Card.Title>
                            <Row style={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}>
                                    <Col md="auto" xs="auto">
                                    <i className={state.stock?.category?.imagePath}/>
                                    </Col>
                                    <Col md="auto" xs="auto">
                                        {
                                        state.stock ?
                                            state.stock?.name :
                                            'Oprema nije pronađena'
                                        }
                                    </Col>    
                                    <Col md="auto" xs="auto">
                                        {badgeStatus()}
                                    </Col>
                                    <Col style={{ display: "flex", justifyContent: "flex-end"}}>
                                        <Button className="btn" size='sm' onClick={() => showEditFeatureModal()} ><i className="bi bi-pencil-square"/> Izmjeni</Button> 
                                    </Col>
                            </Row>
                            
                        
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text>
                            {printOptionalMessage()}

                            {
                                state.stock ?
                                    (renderStockData(state.stock)) :
                                    ''
                            }
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    )
}

export default StockPage;