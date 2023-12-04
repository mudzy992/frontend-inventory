import React, { useCallback, useEffect, useState } from 'react';
import api, { ApiResponse } from '../../../API/api';
import { Alert, Button,  Col, Container, FloatingLabel, Form, ListGroup, Modal, OverlayTrigger, Row, Stack, Tooltip } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Moment from 'moment';
import UserArticleDto from '../../../dtos/UserArticleDto';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import { ApiConfig } from '../../../config/api.config';
import saveAs from 'file-saver';
import { LangBa } from '../../../config/lang.ba'
import UserType from '../../../types/UserType';
import ArticleType from '../../../types/ArticleType';
import { Autocomplete, AutocompleteItem, Badge, Card, CardBody, CardHeader, Link, Listbox, ListboxItem, ListboxSection, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';

interface upgradeFeaturesType {
    upgradeFeatureId: number;
    name: string;
    value: string;
    serialNumber: string;
    comment: string;
    timestamp: string;
}

interface AdminArticleOnUserPageProps {
    serial: string | undefined;
  }

interface AdminArticleOnUserPageState {
    userArticle: UserArticleDto[];
    message: string;
    article: ArticleType;
    users: UserType[];
    isLoggedIn: boolean;
    errorMessage: string;
    expandedCards: boolean[];
    changeStatus: {
        visible: boolean;
        userId: number | null;
        articleId: number | null;
        comment: string;
        serialNumber: string;
        invNumber: string;
        status: string;
    },
    upgradeFeature: upgradeFeaturesType[],
    upgradeFeatureAdd: {
        visible: boolean;
        name: string;
        value: string;
        comment: string;
    }

}

const AdminArticleOnUserPage: React.FC = () => {
    const { serial } = useParams();
    const [state, setState] = useState<AdminArticleOnUserPageState> ({
        message: "",
            users: [],
            article: {},
            isLoggedIn: true,
            errorMessage: '',
            expandedCards: new Array(2).fill(false),
            changeStatus: {
                userId: Number(),
                articleId: 0,
                comment: '',
                serialNumber: '',
                invNumber: '',
                status: '',
                visible: false,
            },
            upgradeFeature: [], 
            upgradeFeatureAdd: {
                visible: false,
                name: "",
                value: "",
                comment: "",
            },
            userArticle: [],
    })

    const setChangeStatusStringFieldState = (fieldName: string, newValue: string) => {
        setState((prev) => ({
            ...prev, changeStatus: {
                ...prev.changeStatus, 
                [fieldName]: newValue
            }
        }))
    }

    const setChangeStatusNumberFieldState = (fieldName: string, newValue: any) => {
        setState((prev) => ({
            ...prev, changeStatus: {
                ...prev.changeStatus,
                [fieldName]: (newValue === 'null') ? null : Number(newValue)
            }
        }))
    }

    const setChangeStatusVisibleState = (newState: boolean) => {
        setState((prev) => ({
            ...prev, changeStatus: {
                ...prev.changeStatus, visible: newState
            }
        }))
    }

    const setUpgradeFeatureStringFieldState = (fieldName: string, newValue: string) => {
        setState((prev) => ({
            ...prev, upgradeFeatureAdd: {
                ...prev.upgradeFeatureAdd, 
                [fieldName]: newValue
            }
        }))
    }

    const setUpgradeModalVisibleState = (newState: boolean) => {
        setState((prev) => ({
            ...prev, upgradeFeatureAdd: {
                ...prev.upgradeFeatureAdd, visible: newState
            }
        }))
    }

    const setUpgradeFeature = (upgradeFeatureData: upgradeFeaturesType[]) => {
        setState((prev) => ({
            ...prev, upgradeFeature: upgradeFeatureData
        }))
    }

    const setErrorMessage = (message: string) => {
        setState((prev) => ({
            ...prev, errorMessage: message,
        }));
    }

    const navigate = useNavigate();
    const setLogginState = (isLoggedIn: boolean) => {
        setState((prev) => ({
            ...prev, isLoggedIn: isLoggedIn
        }))
        if(isLoggedIn === false) {
            navigate('admin/login')
        }
    }

    const setArticle = (articleData: ArticleType) => {
        setState((prev) => ({
            ...prev, article: articleData
        }))
    }


    const setUsers = (usersData: UserType[]) => {
        setState((prev) => ({
            ...prev, users: usersData
        }))
    }

    const toggleExpand = (index: number) => {
        setState((prev) => {
          const expandedCards = [...prev.expandedCards];
          expandedCards[index] = !expandedCards[index];
          return { ...prev, expandedCards }; 
        });
      };
      
    const getArticleData = useCallback(async () => {
    try {
        await api(`api/article/sb/${serial}`, 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === 'error') {
            setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije');
            return;
            }
            if (res.status === 'login') {
            return setLogginState(false);
            }
            const data: ArticleType = res.data;
            setErrorMessage('');
            setArticle(data);
        });
    } catch (err) {
        setErrorMessage('Greška prilikom dohvaćanja podataka za artikle. Greška: ' + err);
    }
    }, [serial]);
    
    const getUserData = useCallback(async () => {
    try {
        await api('/api/user/?sort=forname,ASC', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === 'login') {
            return setLogginState(false);
            }

            setUsers(res.data);
        });
    } catch (err) {
        setErrorMessage('Greška prilikom dohvaćanja podataka o korisnicima (AdminArticleOnUserPage). Greška: ' + err);
    }
    }, [serial]);
    
    const getUpgradeFeature = useCallback(async () => {
    try {
        await api('api/upgradeFeature/?filter=serialNumber||$eq||' + serial, 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === 'login') {
            return setLogginState(false);
            }
            setUpgradeFeature(res.data);
        });
    } catch (err) {
        setErrorMessage('Greška prilikom dohvaćanja dodataka (AdminArticleOnUserPage). Greška: ' + err);
    }
    }, [serial]);
    
    useEffect(() => {
    const fetchData = async () => {
        try {
        await getArticleData();
        await getUserData();
        await getUpgradeFeature();
        } catch (err) {
        setErrorMessage('Error fetching data:' + err);
        }
    };

    fetchData();
    }, [serial, getArticleData, getUserData, getUpgradeFeature]);
    
    const addNewUpgradeFeature = () => {
        api('api/upgradeFeature/add/' + serial, 'post', {
            name: state.upgradeFeatureAdd.name,
            value: state.upgradeFeatureAdd.value,
            comment: state.upgradeFeatureAdd.comment,
            articleId: state.article.articleId,
        }, 'administrator')
            .then((res: ApiResponse) => {
            if (res.status === 'login') {
                return setLogginState(false);
            }
            getUpgradeFeature();

            setState((prev) => ({
                ...prev,
                upgradeFeatureAdd: {
                visible: false,
                name: '',
                value: '',
                comment: '',
                }
            }));
        });
    };

    const showAddUpgradeFeatureModal = () => {
        setUpgradeModalVisibleState(true)
    }


    const addNewUpgradeFeatureButton = () => {
        return (
        <div><Button variant='success' size='sm' onClick={() => showAddUpgradeFeatureModal()}>{LangBa.ARTICLE_ON_USER.BTN_UPGRADE}</Button><Modal size="lg" centered show={state.upgradeFeatureAdd.visible} onHide={() => setUpgradeModalVisibleState(false)}>
                <Modal.Header closeButton>
              {LangBa.ARTICLE_ON_USER.MODAL_HEADER_TEXT}
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Text>
                            <h6>{LangBa.ARTICLE_ON_USER.MODAL_FORM_DESCRIPTION}
                            </h6>
                        </Form.Text>
                        <Form.Group>
                            <FloatingLabel label="Naziv" className="mb-3">
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={<Tooltip id="tooltip-name">{LangBa.ARTICLE_ON_USER.TOOLTIP_NAME}</Tooltip>}>
                                    <Form.Control type='text' id='name' value={state.upgradeFeatureAdd.name} required
                                        onChange={(e) => setUpgradeFeatureStringFieldState('name', e.target.value)} />
                                </OverlayTrigger>
                            </FloatingLabel>
                            <FloatingLabel label={LangBa.ARTICLE_ON_USER.TOOLTIP_VALUE} className="mb-3">
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={<Tooltip id="tooltip-value">{LangBa.ARTICLE_ON_USER.TOOLTIP_VALUE}</Tooltip>}>
                                    <Form.Control type='text' id='value' value={state.upgradeFeatureAdd.value} required
                                        onChange={(e) => setUpgradeFeatureStringFieldState('value', e.target.value)} />
                                </OverlayTrigger>
                            </FloatingLabel>
                            <FloatingLabel label="Komentar" className="mb-3">
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={<Tooltip id="tooltip-comment">{LangBa.ARTICLE_ON_USER.TOOLTIP_COMMENT}</Tooltip>}>
                                    <Form.Control
                                    defaultValue=""
                                    type='text' 
                                    id="comment" 
                                    as="textarea"
                                    rows={3}
                                    placeholder={LangBa.ARTICLE_ON_USER.FORM_COMMENT_PLACEHOLDER}
                                    style={{ height: '100px' }}
                                    value={state.upgradeFeatureAdd.comment} 
                                    required
                                    onChange={(e) => setUpgradeFeatureStringFieldState('comment', e.target.value)} />
                                </OverlayTrigger>
                            </FloatingLabel>
                        </Form.Group>
                    </Form>
                    <Modal.Footer>
                        <Button variant='success' onClick={() => addNewUpgradeFeature()}>{LangBa.ARTICLE_ON_USER.BTN_SAVE}</Button>
                    </Modal.Footer>
                </Modal.Body>
            </Modal></div>
        )
    }


    const changeStatus = () => {
        api('api/article/status/' + state.article.articleId, 'patch', {
            userId: state.changeStatus.userId,
            comment: state.changeStatus.comment,
            status: state.changeStatus.status,
            invNumber: state.changeStatus.invNumber
        }, 'administrator')
            .then((res: ApiResponse) => {
                /* Uhvatiti grešku gdje korisnik nema prava da mjenja status */
                if (res.status === "login") {
                    setLogginState(false);
                    return
                }
                setChangeStatusVisibleState(false)
                getArticleData()

                setState((prev) => ({
                    ...prev,
                    changeStatus: {
                        userId: Number(),
                        articleId: Number(),
                        comment: '',
                        serialNumber: '',
                        invNumber: '',
                        status: '',
                        visible: false,
                    }
                }));
            })
    }

    function showChangeStatusModal(article: ArticleType) {
        const sb: any = article.serialNumber;
        const inv : any = article.invNumber;
        /* const sb: any = serijskic.shift(); */
        setChangeStatusVisibleState(true)
        setChangeStatusStringFieldState('serialNumber', sb)
        if (inv === null) {
            setChangeStatusStringFieldState('invNumber', 'ne ladi1')
        }
        setChangeStatusStringFieldState('invNumber', inv)
    }

    function changeStatusButton(article: ArticleType) {
        let stat = article.status;
        const artiName = article.stock?.name;
        const userFullName: any = article.user?.fullname;

        if (stat !== LangBa.ARTICLE_ON_USER.STATUS_DESTROY) {
            return (
                <Col lg="3" xs="3" sm="3" md="3" style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center"
                }}>
                    <Button 
                        variant='success' 
                        size='sm' 
                        onClick={() => showChangeStatusModal(state.article)}>
                            {LangBa.ARTICLE_ON_USER.BTN_EDIT}
                    </Button>
                    <Modal size="lg" centered show={state.changeStatus.visible} onHide={() => setChangeStatusVisibleState(false)}>
                        <Modal.Header closeButton>
                            {LangBa.ARTICLE_ON_USER.MODAL_HEADER_CHANGE_STATUS}
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                            <Form.Text>
                                <h6>Da li ste sigurni da želite promjeniti status opreme {artiName} sa korisnika {userFullName}</h6>
                            </Form.Text>
                            <Form.Group className='was-validated'>
                                <FloatingLabel label="Status" className="mb-3">
                                    <Form.Select id="status"
                                        onChange={(e) => setChangeStatusStringFieldState('status', e.target.value)} required>
                                        <option value="">izaberi status</option>
                                        <option value={LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE}>
                                        {LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE}
                                        </option>
                                        <option value={LangBa.ARTICLE_ON_USER.STATUS_DEBT}>
                                        {LangBa.ARTICLE_ON_USER.STATUS_DEBT}
                                        </option>
                                        <option value={LangBa.ARTICLE_ON_USER.STATUS_DESTROY}>
                                        {LangBa.ARTICLE_ON_USER.STATUS_DESTROY}
                                        </option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Form.Group>
                            <Form.Group className='was-validated'>
                                <Autocomplete
                                    className='mb-3'
                                    id="pick-the-user"
                                    disabled={state.changeStatus.status === 'razduženo' || state.changeStatus.status === 'otpisano'}
                                    /* onChange={(event, value, reason) => {
                                        if (reason === 'selectOption' && typeof value === 'string') {
                                            const selectedUser = this.state.users.find(user => user.fullname === value);
                                            if (selectedUser) {
                                                const userId = selectedUser.userId;
                                                this.setChangeStatusNumberFieldState('userId', userId || null);
                                            }
                                        }
                                    }} */
                                   /*  renderInput={(params) => <TextField {...params} label="Novo zaduženje na korisnika"/>} */
                                >
                                {state.users.map((option) => (
                                    <AutocompleteItem key={option.userId !== undefined ? option.userId : 'defaultKey'} value={''}>{option.fullname}</AutocompleteItem>
                                ))}

                                </Autocomplete>
                            </Form.Group>
                            <Form.Group className="mb-3">             
                                <FloatingLabel label={LangBa.ARTICLE_ON_USER.TOOLTIP_VALUE} className="mb-3">
                                <OverlayTrigger 
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={
                                <Tooltip id="tooltip-kolicina">{LangBa.ARTICLE_ON_USER.TOOLTIP_DEFAULT_VALUE}</Tooltip>
                                }>
                                <Form.Control id='kolicina' type='text' readOnly isValid required placeholder='1 KOM' value='1 KOM' /></OverlayTrigger>  </FloatingLabel>
                                <Form.Text></Form.Text> 
                            </Form.Group>
                            
                            <Form.Group>
                                <FloatingLabel label={LangBa.ARTICLE_ON_USER.FORM_LABEL_SERIALNUMBER} className="mb-3">
                                    <OverlayTrigger 
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={
                                    <Tooltip id="tooltip-msg-serialnumber">{LangBa.ARTICLE_ON_USER.TOOLTIP_MSG_SERIALNUMBER}</Tooltip>
                                    }>
                                    <Form.Control type='text' id='serialNumber' value={state.changeStatus.serialNumber} readOnly isValid required
                                        onChange={(e) => setChangeStatusStringFieldState('serialNumber', e.target.value)} />
                                    </OverlayTrigger>
                                </FloatingLabel>
                                <FloatingLabel label={LangBa.ARTICLE_ON_USER.FORM_LABEL_INV_NUMBER} className="mb-3">
                                    <OverlayTrigger 
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={
                                    <Tooltip id="tooltip-msg-invnumber">{LangBa.ARTICLE_ON_USER.TOOLTIP_MSG_INV_NUMBER}</Tooltip>
                                    }>
                                    <Form.Control type='text' id='invNumber' value={state.changeStatus.invNumber} isValid required readOnly
                                        onChange={(e) => setChangeStatusStringFieldState('invNumber', e.target.value)} />
                                    </OverlayTrigger>
                                </FloatingLabel>
                            </Form.Group>

                            <Form.Group className='was-validated'>
                                <FloatingLabel label={LangBa.ARTICLE_ON_USER.FORM_LABEL_COMMENT} className="mb-3">
                                    <Form.Control
                                        required
                                        defaultValue=""
                                        id="comment"
                                        as="textarea"
                                        rows={3}
                                        placeholder={LangBa.ARTICLE_ON_USER.FORM_COMMENT_PLACEHOLDER}
                                        style={{ height: '100px' }}
                                        onChange={(e) => setChangeStatusStringFieldState('comment', e.target.value)}
                                    />
                                </FloatingLabel>
                            </Form.Group>
                            </Form>
                            <Modal.Footer>
                                <Button variant='success' onClick={() => changeStatus()}>{LangBa.ARTICLE_ON_USER.BTN_SAVE}</Button>
                            </Modal.Footer>
                        </Modal.Body>
                    </Modal>
                </Col>
            )
        }
    }
    

    const printOptionalMessage = () => {
        if (state.message === '') {
            return;
        }

        return (
            <Card>
                <CardBody>
                    {state.message}
                </CardBody>
                
            </Card>
        );
    }

    return (
        <div>
            <RoledMainMenu role='administrator' />
            <div className="container mx-auto px-4 mt-3 h-max">
                <Card>
                    <CardHeader className='grid grid-cols-6 gap-2'>  
                            <div className='col-span-5 flex flex-nowrap'>
                                    <i className={state.article.category?.imagePath?.toString()} style={{fontSize: 20}}/>
                                <div className='pl-2 col-start-2'>
                                    {state.article.stock?.name}
                                </div> 
                            </div>
                            <div className='col-end-7'>
                                {badgeStatus(state.article)} 
                            </div>
                    </CardHeader>
                    <CardBody>
                            {printOptionalMessage()}

                            {
                                state.article ?
                                    (renderArticleData(state.article)) :
                                    ''
                            }
                            <Card
                                style={{ marginTop: 15 }}
                                className={state.errorMessage ? '' : 'd-none'}>
                                    <CardBody>
                                        <i className="bi bi-exclamation-circle-fill"></i> {state.errorMessage}
                                    </CardBody>
                            </Card>
                    </CardBody>
                </Card>
            </div> 
        </div>
    )
    

    function badgeStatus (article: ArticleType) {
        let stat:any = article.status;
        let color:any;
        if(stat === LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE) {
            color = 'success'
        } else if(stat === LangBa.ARTICLE_ON_USER.STATUS_DEBT) {
            color = 'warning'
        } else {
            color = 'danger'
        }

        return(
            <Badge content={stat} color={color}> </Badge>
        )
    }

    

    function userDetails(userDet: ArticleType) {
        let stat = userDet.status
        if (stat === LangBa.ARTICLE_ON_USER.STATUS_DEBT) {
            return (<Alert variant='info'> {LangBa.ARTICLE_ON_USER.OBLIGATE_ALERT_INFO}</Alert>)
        }
        if (stat === LangBa.ARTICLE_ON_USER.STATUS_DESTROY) {
            return (<Alert variant='warning'> {LangBa.ARTICLE_ON_USER.DESTROY_ALERT_WARNING}</Alert>)
        }
        if (stat === LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE) {
            return (
                <div className="w-full border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100 mb-3">
                    <Listbox className="mb-2">
                        <ListboxSection title={'Detalji korisnika'}>
                            <ListboxItem key={'userDet-ime'}>{LangBa.ARTICLE_ON_USER.USER_DETAILS.NAME + userDet.user?.surname} </ListboxItem>
                            <ListboxItem key={'userDet-prezime'}>{LangBa.ARTICLE_ON_USER.USER_DETAILS.LASTNAME + userDet.user?.forname} </ListboxItem>
                            <ListboxItem key={'userDet-email'}>{LangBa.ARTICLE_ON_USER.USER_DETAILS.EMAIL + userDet.user?.email} </ListboxItem>
                            <ListboxItem key={'userDet-sektor'}>{LangBa.ARTICLE_ON_USER.USER_DETAILS.DEPARTMENT + userDet.user?.department?.title} </ListboxItem>
                            <ListboxItem key={'userDet-radno-mjesto'}>{LangBa.ARTICLE_ON_USER.USER_DETAILS.JOBNAME + userDet.user?.job?.title} </ListboxItem>
                        </ListboxSection>
                    </Listbox>
                </div>
            )
        }
    }

function saveFile (docPath: any) {
        if(!docPath) {
            return (
                <div><Popover placement='right'>
                    <PopoverTrigger>
                        <Button size='sm' style={{ backgroundColor: "#9D5353" }}>
                            <i className="bi bi-file-earmark-text" style={{ fontSize: 20, color: "white" }} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                        Prenosnica nije generisana
                    </PopoverContent>
                </Popover>
                </div>
            )
        }
        if (docPath) {
            const savedFile = (docPath:any) => {
                saveAs(
                    ApiConfig.TEMPLATE_PATH + docPath,
                    docPath
                );
            }
            return (
                <Link onClick={() => savedFile(docPath)}>
                    <i className="bi bi-file-earmark-text" style={{ fontSize: 22, color: "#008b02", cursor:"pointer" }} />
                </Link>
            )
    }
}


function doDeleteUpgradeFeature(upgradeFeatureId: number) {
    api('api/upgradeFeature/delete/' + upgradeFeatureId, 'delete', {}, 'administrator')
    .then((res: ApiResponse) => {
        if (res.status === "login") {
            setLogginState(false);
            return
        }
        getUpgradeFeature();
    })
}

function upgradeFeature(this: any) {
    if (state.upgradeFeature.length === 0) {
        return (
            <Card className="mb-3">
                <CardHeader style={{backgroundColor:"#00695C"}}>
                    <div className="grid lg:grid-cols-6 xs:grid-cols gap-2" >
                        <div>
                            {LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.CARD_HEADER}
                        </div>
                        <div className='col-end-7'>
                            {addNewUpgradeFeatureButton()}
                        </div>
                    </div>
                </CardHeader>
            </Card>
        )
    }

    if (state.upgradeFeature.length !== 0) {
        return (
            <Card className="mb-3">
                <CardHeader style={{backgroundColor:"#00695C"}}>
                    <div className="grid lg:grid-cols-6 xs:grid-cols gap-2" >
                        <div>
                            {LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.CARD_HEADER2}
                        </div>
                        <div className='col-end-7'>
                            {addNewUpgradeFeatureButton()}
                        </div>
                    </div>
                </CardHeader>
                <Listbox>

                {state.upgradeFeature.map((uf, index) => (
                        <ListboxItem key={index}>
                            <div className="grid grid-cols gap-2">
                                <div className='col-span-4 flex flex-nowrap'>
                                    <div>
                                        <Popover placement='top' showArrow backdrop='blur'>
                                            <PopoverTrigger>
                                                <i style={{color:"darkgray"}} className="bi bi-info-circle-fill"/>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                {uf.comment} <b>{LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.DATE}</b> {Moment(uf.timestamp).format('DD.MM.YYYY - HH:mm')}
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                <div className='pl-2'><b>{uf.name}: </b> {uf.value}</div>
                            </div>
                                <div className='col-end-7 flex justify-content-end'>
                                    <Link onClick={e => (doDeleteUpgradeFeature(uf.upgradeFeatureId))} > <i style={{ color:"red"}} className="bi bi-trash3-fill"/></Link>
                                </div>                                     
                            </div>
                        </ListboxItem>
                    ), this)}  
                </Listbox>
            </Card>
        )
    }
}

function renderArticleData(article: ArticleType) {
        return (
            <Row>
                <Col xs="12" lg="8">
                    <Row>
                        <Col xs="12" lg="4" sm="4" style={{ justifyContent: 'center', alignItems: "center", display: "flex" }}>
                            <i className={`${article.category?.imagePath}`} style={{ fontSize: 150 }}></i>
                        </Col>
                        <Col xs="12" lg="8" sm="8">
                            <Row>
                                <Col>
                                
                                <Listbox
                                items={state.article.stock?.stockFeatures}
                                variant='flat'
                                >
                                    {(item) => (
                                        <ListboxSection key={item.stockFeatureId}>
                                                <ListboxItem key={'test'} textValue={item.feature?.name}>{item.feature?.name}</ListboxItem>
                                        </ListboxSection>
                                    )}
                                    </Listbox>
                            {/* <ListboxSection title={'Detalji opreme'}>
                                <ScrollShadow size={100} hideScrollBar className="w-[100%] h-[250px]">
                                {state.article.stock.stockFeatures?.map((artFeature, index) => (
                                    <ListboxItem key={index}>
                                    <b>{artFeature.feature?.name}: </b>{artFeature.value}
                                    </ListboxItem>
                                ))}
                                <ListboxItem key={'komentar'}>
                                    <b>Komentar: </b>{state.article.comment}
                                </ListboxItem>
                                <ListboxItem key={'serijski'}>
                                    <b>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.SERIALNUMBER} </b>{state.article.serialNumber}
                                </ListboxItem>
                                <ListboxItem key={'inventurni'}>
                                    <b>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.INV_NUMBER} </b>{state.article.invNumber}
                                </ListboxItem>
                                </ScrollShadow>
                            </ListboxSection> */}
                            

                                </Col>
                            </Row>
                            {upgradeFeature()}
                        </Col>
                    </Row>

                    <Row>
                        <Col xs="12" lg="12" sm="12">
                            <Card className="mb-3">
                                <CardHeader >{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.DESCRIPTION}</CardHeader>
                                <CardBody>
                                    <ScrollShadow size={100} hideScrollBar  className="w-[100%] h-[250px]">
                                        {article.stock?.description}
                                    </ScrollShadow>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Table>
                            <TableHeader>
                                    <TableColumn>{LangBa.ARTICLE_ON_USER.TABLE.USER}</TableColumn>
                                    <TableColumn>{LangBa.ARTICLE_ON_USER.TABLE.STATUS}</TableColumn>
                                    <TableColumn>{LangBa.ARTICLE_ON_USER.TABLE.COMMENT}</TableColumn>
                                    <TableColumn>{LangBa.ARTICLE_ON_USER.TABLE.DATE_AND_TIME_ACTION}</TableColumn>
                                    <TableColumn>#</TableColumn>
                            </TableHeader>
                            <TableBody>
                            {article.articleTimelines?.map((timeline) => (
                                <TableRow key={timeline.articleTimelineId}>
                                    <TableCell><Link isBlock showAnchorIcon color="primary" href={`#/admin/userProfile/${timeline.userId}`} >{timeline.user?.fullname}</Link></TableCell>
                                    <TableCell>{timeline.status}</TableCell>
                                    <TableCell>{timeline.comment}</TableCell>
                                    <TableCell>{Moment(timeline.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                    <TableCell>{saveFile(timeline.document?.path)}</TableCell>
                                </TableRow>
                            )) ?? []}
                            </TableBody>
                        </Table>
                    </Row>
                </Col>
                <Col sm="12" xs="12" lg="4" >
                    {userDetails(article)}
                    <Row>
                        <Col>
                            <Card className=" mb-2">
                                <CardHeader>
                                    <Row>
                                        <Col lg="9" xs="9" sm="9" md="9" style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                                        {LangBa.ARTICLE_ON_USER.STATUS.STATUS}
                                        </Col>
                                        {changeStatusButton(article)}
                                    </Row>
                                </CardHeader>
                                <ListGroup variant="flush">
                                    <ListGroup.Item key="status">Status: <b>{article.status} </b></ListGroup.Item>
                                    <ListGroup.Item key="datum-akcije">Datum akcije:  {Moment(article.timestamp).format('DD.MM.YYYY. - HH:mm')} </ListGroup.Item>
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card className="text-dark bg-light mb-2" >
                                <CardHeader>U skladištu</CardHeader>
                                    <ListGroup variant="flush" >
                                        <ListGroup.Item>{LangBa.ARTICLE_ON_USER.STOCK.VALUE_ON_CONCRACT + article.stock?.valueOnContract}</ListGroup.Item>
                                        <ListGroup.Item>{LangBa.ARTICLE_ON_USER.STOCK.AVAILABLE_VALUE + article.stock?.valueAvailable}</ListGroup.Item>
                                        <ListGroup.Item>{LangBa.ARTICLE_ON_USER.STOCK.SAP + article.stock?.sapNumber}</ListGroup.Item>
                                        <ListGroup.Item>{LangBa.ARTICLE_ON_USER.STOCK.IN_STOCK_DATE + Moment(article.stock?.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListGroup.Item>
                                    </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export default AdminArticleOnUserPage;
