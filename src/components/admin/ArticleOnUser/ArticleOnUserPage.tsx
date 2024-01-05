import React, { Key, useCallback, useEffect, useState } from 'react';
import api, { ApiResponse } from '../../../API/api';
import { useNavigate, useParams } from 'react-router-dom';
import Moment from 'moment';
import UserArticleDto from '../../../dtos/UserArticleDto';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import { ApiConfig } from '../../../config/api.config';
import saveAs from 'file-saver';
import { LangBa } from '../../../config/lang.ba'
import UserType from '../../../types/UserType';
import ArticleType from '../../../types/ArticleType';
import { Autocomplete, AutocompleteItem, Card, CardBody, CardHeader, Link, Listbox, ListboxItem, 
    Popover, PopoverContent, Button, PopoverTrigger, ScrollShadow, Table, TableBody, TableCell, TableColumn, TableHeader, 
    TableRow, Modal, ModalHeader, ModalBody, ModalFooter, ModalContent, Input, Textarea, Select, SelectItem, Chip, Tabs, Tab, Tooltip } from '@nextui-org/react';
import { useAsyncList } from '@react-stately/data';
import { Alert } from '../../custom/Alert';
import { useUserContext } from '../../UserContext/UserContext';
import { UserRole } from '../../../types/UserRoleType';
import NewTicketByArticleModal from '../HelpDesk/new/ByArticle/NewTicketByArticleModal';
import ViewSingleTicketModal from '../HelpDesk/view/ViewSingleTicket';

interface upgradeFeaturesType {
    upgradeFeatureId: number;
    name: string;
    value: string;
    serialNumber: string;
    comment: string;
    timestamp: string;
}

type UserTypeBase = {
    userId: string;
    fullname: string;
  };

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
    const { role } = useUserContext()
    const [selectedUser, setSelectedUser] = useState<string>('')
    const [selectedUserIsDisabled, setSelectedUserIdDisabled] = useState<boolean>(true)
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedTab, setSelectedTab] = useState<string>("articles");
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
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

    const onInputChange = (value: string) => {
    setSelectedUser(value)
    const selectedUser = state.users.find(user => user.fullname === value);
        if (selectedUser) {
            const userId = selectedUser.userId;
            setChangeStatusNumberFieldState('userId', userId || null);
        }
    }

    const isDisabled = () => {
        if (state.changeStatus.status === 'razduženo' || 'otpisano') {
            setSelectedUserIdDisabled(true)
            setChangeStatusNumberFieldState('userId', Number());
        } 
        if (state.changeStatus.status === 'zaduženo') {
            setSelectedUserIdDisabled(false)
        }
    }

    useEffect(() => {
        isDisabled();
      }, [state.changeStatus.status]);

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
            navigate('/login')
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

    const userList = useAsyncList<UserTypeBase> ({
        async load({signal, filterText}) {
            try {
                const res = await api(`/api/user/?sort=forname,ASC`, 'get', {}, 'administrator')
                if (res.status === 'login') {
                        setLogginState(false);
                        return {items: []}
                    }
                    return {items: res.data}
            } catch (err) {
                setErrorMessage('Greška prilikom dohvaćanja podataka o korisnicima (AdminArticleOnUserPage). Greška: ' + err);
                return {items: []}
            }
        }
    })
    
    const getUpgradeFeature = useCallback(async () => {
    try {
        await api(`api/upgradeFeature/get/${serial}`, 'get', {}, role as UserRole)
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

    const handleShowModal = () => {
        setShowModal(true);
    };

    const handleHideModal = () => {
        setShowModal(false);
    };

    const openModalWithArticle = () => {
        handleShowModal();
    };

    const handleShowViewModal = () => {
        setShowViewModal(true);
      };
    
      const handleHideViewModal = () => {
        setShowViewModal(false);
      };
    
      const openViewModalWithArticle = (ticketId: number) => {
        setSelectedTicketId(ticketId);
        handleShowViewModal();
      };

    const addNewUpgradeFeatureButton = () => {
        return (
        <div><Button className='text-sm' color='success' variant='shadow' size='sm' onClick={() => showAddUpgradeFeatureModal()} 
                startContent={<i className="bi bi-node-plus text-base"></i>}>{LangBa.ARTICLE_ON_USER.BTN_UPGRADE}
            </Button>
            <Modal size="lg" backdrop='blur' isOpen={state.upgradeFeatureAdd.visible} onClose={() => setUpgradeModalVisibleState(false)}>
                <ModalContent>
                <ModalHeader>
                    {LangBa.ARTICLE_ON_USER.MODAL_HEADER_TEXT}
                </ModalHeader>
                <ModalBody>
                    <div className="w-full flex flex-col gap-4">
                        <Input
                        type='text'
                        variant='bordered'
                        label='Naziv'
                        key={'name'}
                        labelPlacement='inside'
                        onChange={(e) => setUpgradeFeatureStringFieldState('name', e.target.value)}
                        description='Unesite naziv nadogradnje. Npr. SSD, RAM '
                        />
                        <Input
                        type='text'
                        variant='bordered'
                        label='Vrijednost'
                        key={'value'}
                        labelPlacement='inside'
                        onChange={(e) => setUpgradeFeatureStringFieldState('value', e.target.value)}
                        description='Unesite vrijednost nadogradnje. Npr. 256GB, 8GB '
                        />
                        <Textarea
                        label="Opis"
                        placeholder="Upišite razlog nadogradnje"
                        key={'description'}
                        variant='bordered'
                        onChange={(e) => setUpgradeFeatureStringFieldState('comment', e.target.value)}
                        />
                    </div>
                    <ModalFooter>
                        <Button color='success' variant='shadow' onClick={() => addNewUpgradeFeature()}>{LangBa.ARTICLE_ON_USER.BTN_SAVE}</Button>
                    </ModalFooter>
                </ModalBody>
                </ModalContent>
            </Modal>
            </div>
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
        setChangeStatusVisibleState(true)
        setChangeStatusStringFieldState('serialNumber', sb)
        setChangeStatusStringFieldState('invNumber', inv)
    }

    function changeStatusButton(article: ArticleType) {
        let stat = article.status;
        if (stat !== LangBa.ARTICLE_ON_USER.STATUS_DESTROY) {
            return (
                <div className="lg:w-1/4 xs:w-1/4 sm:w-1/4 md:w-1/4 flex justify-end items-center">
                    <Button 
                        color='success' 
                        size='sm'
                        variant='shadow'
                        startContent={<i className="bi bi-pencil-square"></i>}
                        onClick={() => showChangeStatusModal(state.article)}>
                            {LangBa.ARTICLE_ON_USER.BTN_EDIT}
                    </Button>
                    <Modal size="lg" backdrop='blur' isOpen={state.changeStatus.visible} onClose={() => setChangeStatusVisibleState(false)}>
                    <ModalContent>
                        <ModalHeader>
                            {LangBa.ARTICLE_ON_USER.MODAL_HEADER_CHANGE_STATUS}
                        </ModalHeader>
                            <ModalBody>
                                <div className="w-full flex flex-col gap-4">
                                    <Select
                                        variant='bordered'
                                        label="Status"
                                        placeholder="Odaberite status"
                                        onChange={(e) => {setChangeStatusStringFieldState('status', e.target.value); isDisabled()}}
                                    >
                                        <SelectItem key={LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE} value={LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE}>
                                            {LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE}
                                        </SelectItem>
                                        <SelectItem key={LangBa.ARTICLE_ON_USER.STATUS_DEBT} value={LangBa.ARTICLE_ON_USER.STATUS_DEBT}>
                                            {LangBa.ARTICLE_ON_USER.STATUS_DEBT}
                                        </SelectItem>
                                        <SelectItem key={LangBa.ARTICLE_ON_USER.STATUS_DESTROY} value={LangBa.ARTICLE_ON_USER.STATUS_DESTROY}>
                                            {LangBa.ARTICLE_ON_USER.STATUS_DESTROY}
                                        </SelectItem>
                                    </Select>
                                    <Autocomplete
                                        label='Odaberi korisnika'
                                        id="pick-the-user"
                                        isDisabled={selectedUserIsDisabled}
                                        onInputChange={onInputChange}
                                        isLoading={userList.isLoading}
                                        isClearable
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
                                        isDisabled
                                        value={state.changeStatus.serialNumber}
                                        onChange={(e) => setChangeStatusStringFieldState('serialNumber', e.target.value)}
                                        description={LangBa.ARTICLE_ON_USER.TOOLTIP_MSG_SERIALNUMBER}
                                    />
                                    <Input
                                        type='text'
                                        variant='bordered'
                                        label='Inventurni broj'
                                        key={'inventurni-broj'}
                                        labelPlacement='inside'
                                        isDisabled
                                        value={state.changeStatus.invNumber}
                                        onChange={(e) => setChangeStatusStringFieldState('invNumber', e.target.value)}
                                        description={LangBa.ARTICLE_ON_USER.TOOLTIP_MSG_INV_NUMBER}
                                    />
                                    <Textarea
                                        label="Opis"
                                        placeholder="Upišite razlog zaduženja/razduženja/otpisa"
                                        key={'description'}
                                        variant='bordered'
                                        onChange={(e) => setChangeStatusStringFieldState('comment', e.target.value)}
                                    />
                                </div>
                                <ModalFooter>
                                    <Button color='success' variant='shadow' startContent={<i className="bi bi-save"></i>} onClick={() => changeStatus()}>{LangBa.ARTICLE_ON_USER.BTN_SAVE}</Button>
                                </ModalFooter>
                            </ModalBody>
                    </ModalContent>
                    </Modal>
                </div>
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
            <RoledMainMenu />
            <div className="container mx-auto lg:px-4 mt-3 h-max">
                <Card>
                    <CardHeader>
                    <div className='flex justify-between items-center w-full bg-default-100 rounded-xl p-2'>
                        <div className='flex items-center'>
                        <div>
                            <i className={state.article.category?.imagePath?.toString()} style={{fontSize: 20}}/>
                        </div>
                        <div className='pl-2 text-left'>
                            {state.article.stock?.name}
                        </div>
                        </div>
                        <div className='flex items-center'>
                            {badgeStatus(state.article)} 
                        </div>
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
                                className={state.errorMessage ? '' : 'hidden'}>
                                    <CardBody>
                                        <i className="bi bi-exclamation-circle-fill"></i> {state.errorMessage}
                                    </CardBody>
                            </Card>
                    </CardBody>
                </Card>
            </div>
            <NewTicketByArticleModal 
            show={showModal}
            onHide={handleHideModal}
            data={state.article}
            />
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
            <Chip color={color}>{stat} </Chip>
        )
    }

    function userDetails(userDet: ArticleType) {
        let stat = userDet.status
        if (stat === LangBa.ARTICLE_ON_USER.STATUS_DEBT) {
            return (<Alert className='mb-3' variant='warning' title='Info!' body={LangBa.ARTICLE_ON_USER.OBLIGATE_ALERT_INFO} />)
        }
        if (stat === LangBa.ARTICLE_ON_USER.STATUS_DESTROY) {
            return (<Alert variant='danger' title='Info!' body={LangBa.ARTICLE_ON_USER.DESTROY_ALERT_WARNING} />)
        }
        if (stat === LangBa.ARTICLE_ON_USER.STATUS_OBLIGATE) {
            return (
                <Card className='mb-3 shadow text-sm'>
                    <CardHeader className='bg-default-100'>Detalji korisnika</CardHeader>
                    <CardBody>
                        <Listbox aria-label='Detalji korisnika'>
                            <ListboxItem key={'userDet-ime'} textValue='ime' aria-label='Ime korisnika'>{LangBa.ARTICLE_ON_USER.USER_DETAILS.NAME + userDet.user?.surname} </ListboxItem>
                            <ListboxItem key={'userDet-prezime'}textValue='prezime' aria-label='Prezime korisnika'>{LangBa.ARTICLE_ON_USER.USER_DETAILS.LASTNAME + userDet.user?.forname} </ListboxItem>
                            <ListboxItem key={'userDet-email'} textValue='email' aria-label='Email korisnika'>{LangBa.ARTICLE_ON_USER.USER_DETAILS.EMAIL + userDet.user?.email} </ListboxItem>
                            <ListboxItem key={'userDet-sektor'} textValue='sektor ili odjeljenje' aria-label='Sektor ili odjeljenje korisnika'>{LangBa.ARTICLE_ON_USER.USER_DETAILS.DEPARTMENT + userDet.user?.department?.title} </ListboxItem>
                            <ListboxItem key={'userDet-radno-mjesto'} textValue='radno mjesto' aria-label='Radno mjesto korisnika'>{LangBa.ARTICLE_ON_USER.USER_DETAILS.JOBNAME + userDet.user?.job?.title} </ListboxItem>
                        </Listbox>
                    </CardBody>
                </Card>
            )
        }
    }

function saveFile (docPath: any) {
        if(!docPath) {
            return (
                <div><Popover placement='right'>
                    <PopoverTrigger>
                        <Button size='sm' variant='shadow' color='danger'>
                            <i className="bi bi-file-earmark-text" style={{ fontSize: 20}} />
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
                <Button size='sm' variant='shadow' color='success' onClick={() => savedFile(docPath)}><i className="bi bi-file-earmark-text" style={{ fontSize: 20}} /></Button>
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
            <Card className="mb-3 shadow">
                <CardHeader className="grid grid-cols-6 gap-4" style={{backgroundColor:"#00695C", color:'white'}}>
                        <div className="col-span-5 text-sm">
                            {LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.CARD_HEADER}
                        </div>
                        <div className="col-end-7 flex justify-end">
                            {addNewUpgradeFeatureButton()}
                        </div>
                </CardHeader>
            </Card>
        )
    }

    if (state.upgradeFeature.length !== 0) {
        return (
            <Card className="mb-3 shadow">
                <CardHeader className="grid grid-cols-6 gap-4" style={{backgroundColor:"#00695C"}}>
                        <div className="col-span-5 text-sm">
                            {LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.CARD_HEADER2}
                        </div>
                        <div className="col-end-7 flex justify-end">
                            {addNewUpgradeFeatureButton()}
                        </div>
                </CardHeader>
                <Listbox aria-label='Box nadogradnje'>

                {state.upgradeFeature.map((uf, index) => (
                        <ListboxItem key={index} aria-label={`nadogradnja-${index}`} textValue={`${index} + nadogradnja`}>
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

function actions(ticketId: number) {
    return (
        <div className="relative flex items-center gap-2">
            <Tooltip content="Pregledaj" showArrow>
            <span
              className="text-lg p-1 text-default-600 cursor-pointer active:opacity-50"
              onClick={() => openViewModalWithArticle(ticketId)}
            >
              <i className="bi bi-eye" />
            </span>
            </Tooltip>
        </div>
    )
  }
  
function renderArticleData(article: ArticleType) {
    const mappedStockFeatures = state.article.stock?.stockFeatures?.map(stockFeature => ({
        featureId: stockFeature.feature?.featureId || null,
        name: stockFeature.feature?.name || '',
        value: stockFeature.value || '',
      })) || [];

      if (state.article.serialNumber) {
        mappedStockFeatures.push({
          featureId: null,
          name: 'Serijski broj',
          value: state.article.serialNumber
        });
      }
      
      if (state.article.invNumber) {
        mappedStockFeatures.push({
          featureId: null, 
          name: 'Inventurni broj',
          value: state.article.invNumber
        });
      }

        return (
            <div className="lg:flex">
                <div className="lg:w-8/12 xs:w-full lg:mr-5">
                    <Button size='sm' color='danger' className='absolute' variant='flat' onClick={() => openModalWithArticle()} > Prijavi problem</Button>
                    <div className="lg:flex">
                        <div className="lg:w-4/12 xs:w-full flex justify-center items-center">
                            <i className={`${article.category?.imagePath}`} style={{ fontSize: 150 }}></i>
                        </div>
                        <div className="lg:w-8/12 xs:w-full">
                            <ScrollShadow hideScrollBar className="w-full h-[250px]">
                                <Listbox items={mappedStockFeatures} variant="bordered" aria-label='box-specifikacije'>
                                    {(item) => (
                                    <ListboxItem key={item.value} aria-label={`specifikacija-${item.featureId}`} textValue={`Item-${item.name}`}>
                                        <span className="text-bold text-small text-default-400">{item.name}: </span>{item.value}
                                    </ListboxItem>
                                    )}
                                </Listbox>     
                            </ScrollShadow>
                            {upgradeFeature()}
                        </div>
                    </div>

                    <div className="lg:flex">
                        <div className="w-full lg:w-12/12 sm:w-12/12">
                            <Card className="mb-3 shadow">
                            <CardHeader className='text-sm'>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.DESCRIPTION}</CardHeader>
                            <CardBody>
                                <ScrollShadow size={100} hideScrollBar className="w-full max-h-[250px] text-sm">
                                    {article.stock?.description}
                                </ScrollShadow>
                            </CardBody>
                            </Card>
                        </div>
                    </div>

                <div className="mb-3">
                    <Tabs
                    aria-label='Opcije'
                    color='primary' 
                    radius='full'
                    selectedKey={selectedTab}
                    onSelectionChange={(key: Key) => setSelectedTab(key as string)}
                    size='sm'
                    >
                        <Tab key="articles" title="Kretanje opreme">
                        <div className='overflow-x-auto overflow-hidden'>
                               <Table aria-label='tabela-zaduzenja' removeWrapper className='shadow-md p-2 rounded-xl'>
                                <TableHeader>
                                    <TableColumn key={'korisnik'} aria-label='Naziv korisnika'>{LangBa.ARTICLE_ON_USER.TABLE.USER}</TableColumn>
                                    <TableColumn key={'status'} aria-label='status artikla'>{LangBa.ARTICLE_ON_USER.TABLE.STATUS}</TableColumn>
                                    <TableColumn key={'komentar'} aria-label='Komentar akcije'>{LangBa.ARTICLE_ON_USER.TABLE.COMMENT}</TableColumn>
                                    <TableColumn key={'datum-vrijeme'} aria-label='Datum i vrijeme akcije'>{LangBa.ARTICLE_ON_USER.TABLE.DATE_AND_TIME_ACTION}</TableColumn>
                                    <TableColumn className='w-min-[150px]' key={'dokument'} aria-label='Prateci dokument'>#</TableColumn>
                                </TableHeader>
                                <TableBody>
                                {article.articleTimelines?.map((timeline, index) => (
                                    <TableRow key={timeline.articleTimelineId}>
                                        <TableCell className='whitespace-nowrap min-w-fit' key={`korisnik-${timeline.user?.fullname}-${index}`} aria-label='naziv-korisnika'>
                                            <Link className='text-sm' isBlock showAnchorIcon color="primary" href={`#/user/profile/${timeline.userId}`}>
                                            {timeline.user?.fullname}
                                            </Link>
                                        </TableCell>
                                        <TableCell className='whitespace-nowrap min-w-fit' key={`status-${timeline.status}-${index}`} aria-label='Status artikla'>{timeline.status}</TableCell>
                                        <TableCell className='whitespace-nowrap min-w-fit' key={`korisnik-${timeline.comment}-${index}`} aria-label='Komentar'>{timeline.comment}</TableCell>
                                        <TableCell className='whitespace-nowrap min-w-fit' key={`datum-vrijeme-${index}`} aria-label='Vrijeme i datum akcije'>{Moment(timeline.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                        <TableCell className='whitespace-nowrap min-w-fit' key={`dokument-${index}`} aria-label='DOkument'>{saveFile(timeline.document?.path)}</TableCell>
                                    </TableRow>
                                )) ?? []}
                                </TableBody>
                            </Table> 
                            </div> 
                        </Tab>
                        <Tab key="tickets" title="Tiketi">
                            <div className='overflow-x-auto overflow-hidden'>
                            <Table aria-label='tabela-zaduzenja' removeWrapper className='shadow-md p-2 rounded-xl' isCompact isStriped>
                                <TableHeader>
                                    <TableColumn key={'opis'} aria-label='Opis tiketa'>Opis tiketa</TableColumn>
                                    <TableColumn key={'datum-vrijeme-prijave'} aria-label='Datum prijave'>Datum prijave</TableColumn>
                                    <TableColumn key={'status'} aria-label='status tiketa'>Status tiketa</TableColumn>
                                    <TableColumn key={'action'} aria-label='akcija'>Akcija</TableColumn>
                                </TableHeader>
                                <TableBody>
                                {article.helpdeskTickets?.map((ticket, index) => (
                                    <TableRow key={ticket.ticketId}>
                                        <TableCell 
                                        className="max-w-[400px] overflow-hidden text-ellipsis whitespace-nowrap"
                                        key={`opis-${ticket.description}-${index}`} aria-label='opis-tiketa'>{ticket.description}</TableCell>
                                        <TableCell className='whitespace-nowrap min-w-fit' key={`datum-vrijeme-${index}`} aria-label='Datum i vrijeme prijave'>{Moment(ticket.createdAt).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                        <TableCell className='whitespace-nowrap min-w-fit' key={`status-${ticket.status}-${index}`} aria-label='Status tiketa'>
                                           {ticket.status === "zatvoren" ? (<Chip size='sm' variant='flat' color='success'>{ticket.status}</Chip>):(<Chip size='sm' variant='flat' color='warning'>{ticket.status}</Chip>)}
                                        </TableCell>
                                        <TableCell className='whitespace-nowrap min-w-fit' key={`action-${index}`} aria-label='Akcija'>{actions(ticket.ticketId!)}</TableCell>
                                    </TableRow>
                                )) ?? []}
                                </TableBody>
                            </Table> </div>
                        </Tab>
                    </Tabs>
                    <ViewSingleTicketModal
                    show={showViewModal}
                    onHide={handleHideViewModal}
                    ticketId={selectedTicketId!}
                    data={state.article.helpdeskTickets!}
                    />
                </div>
                </div>

                <div className="w-full sm:w-full lg:w-1/3">
                    {userDetails(article)}
                    <div>
                    <Card className="mb-3 shadow text-sm">
                        <CardHeader className="bg-default-100 grid grid-cols-6 gap-4">
                            <div className="col-span-5">{LangBa.ARTICLE_ON_USER.STATUS.STATUS}</div>
                            <div className="col-end-7 flex justify-end">{changeStatusButton(article)}</div>
                        </CardHeader>
                        <CardBody>
                            <Listbox variant="flat" aria-label='box-stanja'>
                                <ListboxItem key="status" aria-label='status-stanja' textValue={`status-${article.status}`}>Status: <b>{article.status} </b></ListboxItem>
                                <ListboxItem key="datum-akcije" aria-label='akcije-datum' textValue='Datum i vrijeme akcije'>Datum akcije: {Moment(article.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListboxItem>
                            </Listbox>
                        </CardBody>
                       
                    </Card>
                    </div>
                    <Card className='shadow text-sm'>
                        <CardHeader className='bg-default-100'>
                            U skladištu
                        </CardHeader>
                        <CardBody>
                            <Listbox variant="flat" aria-label='box-skladista'>
                                <ListboxItem key={'stanje-ugovor'} aria-label='Stanje ugovora' textValue={`status-${article.stock?.valueOnContract}`}>{LangBa.ARTICLE_ON_USER.STOCK.VALUE_ON_CONCRACT + article.stock?.valueOnContract}</ListboxItem>
                                <ListboxItem key={'stanje-trenutno'} aria-label='Trenutno stanje' textValue={`status-${article.stock?.valueAvailable}`}>{LangBa.ARTICLE_ON_USER.STOCK.AVAILABLE_VALUE + article.stock?.valueAvailable}</ListboxItem>
                                <ListboxItem key={'sapBroj'} aria-label='SAP broj' textValue={`status-${article.stock?.sapNumber}`}>{LangBa.ARTICLE_ON_USER.STOCK.SAP + article.stock?.sapNumber}</ListboxItem>
                                <ListboxItem key={'datum-akcije'} aria-label='Datum i vrijeme akcije' textValue={`vrijeme-akcije`}>{LangBa.ARTICLE_ON_USER.STOCK.IN_STOCK_DATE + Moment(article.stock?.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListboxItem>
                            </Listbox>
                        </CardBody>
                    </Card>
                    
                </div>
            </div>

        );
    }
}

export default AdminArticleOnUserPage;
