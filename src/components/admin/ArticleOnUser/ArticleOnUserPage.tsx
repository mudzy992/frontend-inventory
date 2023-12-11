import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
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
import { Autocomplete, AutocompleteItem, Badge, Card, CardBody, CardHeader, Link, Listbox, ListboxItem, 
    ListboxSection, Popover, PopoverContent, Button, PopoverTrigger, ScrollShadow, Table, TableBody, TableCell, TableColumn, TableHeader, 
    TableRow, Modal, ModalHeader, ModalBody, ModalFooter, ModalContent, Input, Textarea, Select, SelectItem } from '@nextui-org/react';
import { useAsyncList } from '@react-stately/data';
import { Alert } from '../../custom/Alert';

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
    const [selectedUser, setSelectedUser] = useState<string>('')
    const [selectedUserIsDisabled, setSelectedUserIdDisabled] = useState<boolean>(true)
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

    const onSelectionChange = (selectedItem: UserTypeBase | null) => {
        if (selectedItem) {
          const userId = selectedItem.userId;
          setChangeStatusNumberFieldState('userId', userId || null);
        }
      };

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
                    /* setUsers(res.data); */
            } catch (err) {
                setErrorMessage('Greška prilikom dohvaćanja podataka o korisnicima (AdminArticleOnUserPage). Greška: ' + err);
                return {items: []}
            }
        }
    })
    
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
        <div><Button className='text-sm' color='success' size='sm' onClick={() => showAddUpgradeFeatureModal()} 
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
                        <Button color='success' onClick={() => addNewUpgradeFeature()}>{LangBa.ARTICLE_ON_USER.BTN_SAVE}</Button>
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
        if (stat !== LangBa.ARTICLE_ON_USER.STATUS_DESTROY) {
            return (
                <div className="lg:w-1/4 xs:w-1/4 sm:w-1/4 md:w-1/4 flex justify-end items-center">
                    <Button 
                        color='success' 
                        size='sm'
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
                                    <Button color='success' className='text-white' startContent={<i className="bi bi-save"></i>} onClick={() => changeStatus()}>{LangBa.ARTICLE_ON_USER.BTN_SAVE}</Button>
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
                    <CardHeader className='grid grid-cols-6 gap-2'>  
                            <div className='col-span-4 flex flex-nowrap'>
                                    <i className={state.article.category?.imagePath?.toString()} style={{fontSize: 20}}/>
                                <div className='pl-2 col-start-2'>
                                    {state.article.stock?.name}
                                </div> 
                            </div>
                            <div className='col-end-7 flex justify-center'>
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
            return (<Alert variant='info' title='Info!' body={LangBa.ARTICLE_ON_USER.OBLIGATE_ALERT_INFO} />)
        }
        if (stat === LangBa.ARTICLE_ON_USER.STATUS_DESTROY) {
            return (<Alert variant='danger' title='Info!' body={LangBa.ARTICLE_ON_USER.DESTROY_ALERT_WARNING} />)
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
                <CardHeader className="grid grid-cols-6 gap-4" style={{backgroundColor:"#00695C", color:'white'}}>
                        <div className="col-span-5">
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
            <Card className="mb-3">
                <CardHeader className="grid grid-cols-6 gap-4" style={{backgroundColor:"#00695C"}}>
                        <div className="col-span-5">
                            {LangBa.ARTICLE_ON_USER.UPGRADE_FEATURE.CARD_HEADER2}
                        </div>
                        <div className="col-end-7 flex justify-end">
                            {addNewUpgradeFeatureButton()}
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
    const mappedStockFeatures = state.article.stock?.stockFeatures?.map(stockFeature => ({
        featureId: stockFeature.feature?.featureId || null,
        name: stockFeature.feature?.name || '',
        value: stockFeature.value || ''
      })) || [];

        return (
            <div className="lg:flex">
                <div className="lg:w-8/12 xs:w-full lg:mr-5">
                    <div className="lg:flex">
                        <div className="lg:w-4/12 xs:w-full flex justify-center items-center">
                            <i className={`${article.category?.imagePath}`} style={{ fontSize: 150 }}></i>
                        </div>
                        <div className="lg:w-8/12 xs:w-full">
                            <ScrollShadow hideScrollBar className="w-full h-[250px]">
                                <Listbox items={mappedStockFeatures} variant="bordered">
                                    {(item) => (
                                    <ListboxItem key={item.value}>
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
                            <Card className="mb-3">
                            <CardHeader>{LangBa.ARTICLE_ON_USER.ARTICLE_DETAILS.DESCRIPTION}</CardHeader>
                            <CardBody>
                                <ScrollShadow size={100} hideScrollBar className="w-full max-h-[250px]">
                                {article.stock?.description}
                                </ScrollShadow>
                            </CardBody>
                            </Card>
                        </div>
                    </div>

                <div className="lg:flex mb-3">
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
                            <TableCell>
                                <Link isBlock showAnchorIcon color="primary" href={`#/admin/userProfile/${timeline.userId}`}>
                                {timeline.user?.fullname}
                                </Link>
                            </TableCell>
                            <TableCell>{timeline.status}</TableCell>
                            <TableCell>{timeline.comment}</TableCell>
                            <TableCell>{Moment(timeline.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                            <TableCell>{saveFile(timeline.document?.path)}</TableCell>
                            </TableRow>
                        )) ?? []}
                        </TableBody>
                    </Table>
                </div>
                </div>

                <div className="w-full sm:w-full lg:w-1/3">
                    {userDetails(article)}
                    <div>
                    <Card className="mb-3">
                        <CardHeader className="grid grid-cols-6 gap-4">
                            <div className="col-span-5">{LangBa.ARTICLE_ON_USER.STATUS.STATUS}</div>
                            <div className="col-end-7 flex justify-end">{changeStatusButton(article)}</div>
                        </CardHeader>
                        <Listbox variant="flat">
                        <ListboxItem key="status">Status: <b>{article.status} </b></ListboxItem>
                        <ListboxItem key="datum-akcije">Datum akcije: {Moment(article.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListboxItem>
                        </Listbox>
                    </Card>
                    </div>
                    <div className="w-full border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100 mb-3">
                    <Listbox variant="flat">
                        <ListboxSection title={'U skladištu'}>
                        <ListboxItem key={'stanje-ugovor'}>{LangBa.ARTICLE_ON_USER.STOCK.VALUE_ON_CONCRACT + article.stock?.valueOnContract}</ListboxItem>
                        <ListboxItem key={'stanje-trenutno'}>{LangBa.ARTICLE_ON_USER.STOCK.AVAILABLE_VALUE + article.stock?.valueAvailable}</ListboxItem>
                        <ListboxItem key={'sapBroj'}>{LangBa.ARTICLE_ON_USER.STOCK.SAP + article.stock?.sapNumber}</ListboxItem>
                        <ListboxItem key={'datum-akcije'}>{LangBa.ARTICLE_ON_USER.STOCK.IN_STOCK_DATE + Moment(article.stock?.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListboxItem>
                        </ListboxSection>
                    </Listbox>
                    </div>
                </div>
            </div>

        );
    }
}

export default AdminArticleOnUserPage;
