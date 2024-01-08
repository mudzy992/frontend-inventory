// ModalDetails.tsx
import React, { Key, useEffect, useState } from 'react';
import { ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Modal, 
    Chip, Tabs, Tab, Select, SelectItem, Tooltip, Spinner, Checkbox } from '@nextui-org/react';
import HelpdeskTicketsType from '../../../../types/HelpdeskTicketsType';
import api, { ApiResponse } from '../../../../API/api';
import { UserRole } from '../../../../types/UserRoleType';
import { useUserContext } from '../../../UserContext/UserContext';
import { useNavigate } from 'react-router-dom';
import ModeratorGroupMappingType from '../../../../types/ModeratorGroupMappingType';
import UserType from '../../../../types/UserType';
import Moment from 'moment';
import TimelineProgressBar from '../../../custom/TimelineProgressBar';
import TicketGroupType from '../../../../types/TicketGroupType';

type ModalDetailsProps = {
show: boolean;
onHide: () => void;
ticketId: number;
};
interface PriorityItem {
    id: number;
    priority: string;
    days: number;
}
interface ResolveResolutionItem {
    id: number;
    resolution: string;
}
interface ValidationMessages {
    priority?: string;
    resolveResolution?: string;
    resolveTimespand?: string;
    resolveDescription?: string;
}
interface HelpdeskTicketState {
    editTicket: {
        groupId?: number | null;
        groupPartentId?: number | null;
        resolveDescription?: string;
        duoDate?: Date | null;
        assignedTo?: number | null;
        status?: string;
        priority?: string | null;
        resolveDate?: Date;
        resolveResolution?: string | null;
        resolveTimespand?: string | null;
    };
}

const ModalDetails: React.FC<ModalDetailsProps> = ({ show, onHide, ticketId }) => {
    const {role, userId} = useUserContext();
    const [helpdeskState, setHelpdeskState] = useState<HelpdeskTicketsType>()
    const [editHelpdeskState, setEdithelpDeskState] = useState<HelpdeskTicketState>({ editTicket: {} });
    const [message, setMessage] = useState<string>('')
    const [validateMessages, setValidateMessages] = useState<ValidationMessages>({});
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
    const [selectedTab, setSelectedTab] = useState<string>("details");
    const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
    const [groupParent, setGroupParent] = useState<TicketGroupType[]>([]);
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [selectedGroupParent, setSelectedGroupParent] = useState<number | null>(null);
    const [moderatorGroupState, setModeratorGroupState] = useState<ModeratorGroupMappingType[]>([])
    const [groupUsers, setGroupUsers] = useState<UserType[]>([]);
    const [isDisabled, setIsDisabled] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isSelectedAssignedCheckBox, setIsSelectedAssignedCheckBox] = useState<boolean>(false);
    const [isSelectedCloseTicketCheckBox, setIsSelectedCloseTicketCheckBox] = useState<boolean>(false);
    const navigate = useNavigate();

    const PriorityList: PriorityItem[] = [
        { id: 1, priority: "Problem veće hitnosti ili VIP korisnik", days: 1 },
        { id: 2, priority: "Problem u radu servisa (za sve korisnike u firmi)", days: 1 },
        { id: 3, priority: "Poteškoće u radu grupe korisnika", days: 5 },
        { id: 4, priority: "Povremene poteškoće u radu grupe korisnika", days: 5 },
        { id: 5, priority: "Poteškoće u radu korisnika", days: 5 },
        { id: 6, priority: "Zahtjevi za izmjenu/doradu manje složenosti", days: 5 },
        { id: 7, priority: "Zahtjevi za izmjenu/doradu veće složenosti", days: 5 },
    ];

    const ResolveResolutionList: ResolveResolutionItem[] = [
        {id: 1, resolution: "Nemoguće riješiti ili je u koliziji sa standardom ili politikom"},
        {id: 2, resolution: "Riješen - nije potrebna analiza uzroka"},
        {id: 3, resolution: "Uzrok problema nije otklonjen - privremeno rješenje"},
        {id: 4, resolution: "Zahtjev je povučen od strane korisnika"},
    ]

    
    function colorStatus(status: string) {
        let color
        if(status === 'otvoren'){
            return color = 'secondary'
        } else if(status === 'izvršenje') {
            return color = 'warning'
        } else if(status === 'zatvoren') {
            return color = 'success'
        }
    }

    const putTicketDetailsInState = async () => {
        setEdithelpDeskState((prev) => ({
        ...prev, 
        editTicket: {
            duoDate: helpdeskState?.duoDate || null,
            assignedTo: helpdeskState?.assignedTo || null,
            groupPartentId: helpdeskState?.groupPartentId || null,
            groupId: helpdeskState?.groupId || null,
            resolveDescription: helpdeskState?.resolveDescription || '',
            status: helpdeskState?.status || '',
            priority: helpdeskState?.priority || null,
            resolveDate: helpdeskState?.resolveDate || undefined,
            resolveResolution: helpdeskState?.resolveResolution || null,
            resolveTimespand: helpdeskState?.resolveTimespand || null,
        }
        }))
    }

    const setEditHelpdeskNumberFieldState = (fieldName: string, newValue: any) => {
        setEdithelpDeskState((prev) => ({
            ...prev,
            editTicket: {
                ...prev.editTicket,
                [fieldName]: (newValue === 'null') ? null : Number(newValue),
            },
        }));
    }
    
    const setEditHelpdeskStringFieldState = (fieldName: string, newValue: any) => {
        setEdithelpDeskState((prev) => {
            const newEditTicket = {
                ...prev.editTicket,
                [fieldName]: newValue,
            };        
            return {
                ...prev,
                editTicket: newEditTicket,
            };
        });
    };
    
    const setValidationMessageFieldState = (field: string, value: string) => {
        setValidateMessages((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    const handleGroupChange = (value: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedGroup(Number(value.target.value));
        setEditHelpdeskNumberFieldState('groupId', value.target.value);
    };

    const handleGroupParentChange = (value: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedGroupParent(Number(value.target.value));
        setEditHelpdeskNumberFieldState('groupPartentId', value.target.value);
    };
    
    const handleUserChange = (value: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedUser(Number(value.target.value));
        setEditHelpdeskNumberFieldState('assignedTo', value.target.value);
        setEditHelpdeskStringFieldState('status', 'izvršenje');
    };

    const handlePriorityChange = (value: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPriority = value.target.value;
        const selectedPriorityItem = PriorityList.find(item => item.priority === selectedPriority);
        
        if (selectedPriorityItem) {
            setEditHelpdeskStringFieldState('priority', selectedPriority);
            const calculatedDueDate = calculateDueDate(selectedPriorityItem.days);
            setEditHelpdeskStringFieldState('duoDate', calculatedDueDate);
        };
    }

    const calculateDueDate = (days: number): string => {
        const today = new Date();
        let dueDate = new Date(helpdeskState?.createdAt || today);
        while (days > 0) {
            dueDate.setDate(dueDate.getDate() + 1);
            if (dueDate.getDay() !== 0 && dueDate.getDay() !== 6) {
                days--;
            }
        }
    
        return dueDate.toISOString();
    };

    const handleAssiningTicket = async () => {
        if (editHelpdeskState.editTicket.priority) {
            await doEditTicket(ticketId);
        }
        return setValidationMessageFieldState('priority', '* Odaberite prioritet');
    };
    
    const handleForwardTicket = async () => {
        if (editHelpdeskState.editTicket.priority) {
            await doEditTicket(ticketId);
        }
        setSelectedTab('details')
        setValidationMessageFieldState('priority', '* Odaberite prioritet');
        return
    }; 
    
    const handleCloseTicket = async () => {
        if (
        editHelpdeskState.editTicket.resolveDescription &&
        editHelpdeskState.editTicket.resolveResolution &&
        editHelpdeskState.editTicket.resolveTimespand
        ) {
            await doEditTicket(ticketId);
        } else {
            setValidationMessageFieldState('resolveDescription', '* Upišite opis rješnja')
            setValidationMessageFieldState('resolveResolution', '* Odaberite rezoluciju rješnja')
            setValidationMessageFieldState('resolveTimespand', '* Upišite utrošeno vrijeme')
            return
        }
    };

    function changeStatus(status:string){
        if(status === 'otvoren'){
            return (        
                <Checkbox aria-label='Označi kako bi preuzeo zahtjev' isSelected={isSelectedAssignedCheckBox} onValueChange={setIsSelectedAssignedCheckBox}>
                    <Button isDisabled={!isSelectedAssignedCheckBox} onClick={() => handleAssiningTicket()} color={colorStatus(status)}>Preuzmi zahtjev</Button>
                </Checkbox>
            )
        } else if(status === 'izvršenje') {
            return (
                <Checkbox aria-label='Označi kako bi zatvorio zahtjev' isSelected={isSelectedCloseTicketCheckBox} onValueChange={setIsSelectedCloseTicketCheckBox} >
                    <Button isDisabled={!isSelectedCloseTicketCheckBox} onClick={() => handleCloseTicket()} color={colorStatus(status)}>Zatvori zahtjev</Button>
                </Checkbox>
            )
        } 
    }

    const resolvedTimespandDescription = () => {
        const resolvedTimespand = helpdeskState?.resolveTimespand;
    
        if (resolvedTimespand) {
        const minutes = parseInt(resolvedTimespand, 10);
        const days = Math.floor(minutes / (24 * 60));
        const hours = Math.floor((minutes % (24 * 60)) / 60);
        const remainingMinutes = minutes % 60;

        const descriptionText = `Utrošeno: ${days} dan/a, ${hours} sat/i i ${remainingMinutes} minuta`;
        return descriptionText
        }
    };

    const updateResolvedTimespandFromInput = (value: string) => {
        const resolvedTimespand = helpdeskState?.resolveTimespand;
        
        if (resolvedTimespand) {
            const newValue = parseInt(resolvedTimespand, 10) + parseInt(value, 10);
            setEditHelpdeskStringFieldState('resolveTimespand', newValue.toString());
        }
        if(!resolvedTimespand){
            setEditHelpdeskStringFieldState('resolveTimespand', value);
        }
    };

    useEffect(() => {
        if(isSelectedAssignedCheckBox){
            setEditHelpdeskNumberFieldState('assignedTo', userId);
            setEditHelpdeskStringFieldState('status', 'izvršenje');
        } else {
            setEditHelpdeskNumberFieldState('assignedTo', null);
            setEditHelpdeskStringFieldState('status', 'otvoren');
        }
    }, [isSelectedAssignedCheckBox]);

    useEffect(() => {
        if(isSelectedCloseTicketCheckBox){
            const date = new Date();
            setEditHelpdeskStringFieldState('status', 'zatvoren');
            setEditHelpdeskStringFieldState('resolveDate', date);
        } else {
            setEditHelpdeskStringFieldState('status', helpdeskState?.status);
            setEditHelpdeskStringFieldState('resolveDate', null);
        }
    }, [isSelectedCloseTicketCheckBox]);

    useEffect(() => {
        if (show) {
            getHelpdeskTicketsData();
            setSelectedTab('details')
        }
    }, [show]);

    useEffect(() => {
        if(helpdeskState?.status === 'zatvoren') {
            setIsDisabled(true)
        } else {
            setIsDisabled(false)
        }
        putTicketDetailsInState()
    }, [helpdeskState]);

    useEffect(() => {
        if (selectedGroup) {
        const filteredUsers = moderatorGroupState
            .filter((group) => group.group?.groupId === selectedGroup)
            .flatMap((group) => group.user || [])
            .map((user) => user || []);
        
        setGroupUsers(filteredUsers);

        const filteretParentGroup = moderatorGroupState
            .filter((group) => group.group?.groupId === selectedGroup)
            .flatMap((group) => group.group?.ticketGroups || [])
            .map((parentGroups) => parentGroups || [])

            setGroupParent(filteretParentGroup)
        }

    }, [selectedGroup, moderatorGroupState, selectedUser]); 

    useEffect(() => {
        if (selectedTab === 'forward') {
            setSelectedGroup(null)
            getAllModeratorsInGroup();
        }
    }, [selectedTab]);


    const getHelpdeskTicketsData = () => {
        setIsLoading(true);
    
        api(`/api/helpdesk/ticket/${ticketId}`, "get", {}, role as UserRole)
            .then((res: ApiResponse) => {
                if (res.status === 'login') {
                    setIsLoggedIn(false);
                    setMessage('Greška prilikom učitavanja podataka. Korisnik nije prijavljen!');
                    return;
                }
                if (res.status === 'error') {
                    setMessage('Greška prilikom učitavanja podataka, molimo pokušajte ponovo!');
                    return;
                }
                if (res.status === 'forbidden') {
                    setMessage('Korisnik nema prava za učitavanje ove vrste podataka!');
                    return;
                }
                setHelpdeskState(res.data);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    const getAllModeratorsInGroup = () => {
        setIsLoading(true);
    
        api(`api/moderator/group`, "get", {}, role as UserRole)
            .then((res: ApiResponse) => {
                if (res.status === 'login') {
                    setIsLoggedIn(false);
                    setMessage('Greška prilikom učitavanja podataka. Korisnik nije prijavljen!');
                    return;
                }
                if (res.status === 'error') {
                    setMessage('Greška prilikom učitavanja podataka, molimo pokušajte ponovo!');
                    return;
                }
                if (res.status === 'forbidden') {
                    setMessage('Korisnik nema prava za učitavanje ove vrste podataka!');
                    return;
                }
                setModeratorGroupState(res.data);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    const doEditTicket = async (ticketId:number) => {
        try {
            await api(`api/helpdesk/${ticketId}`, 'put', editHelpdeskState.editTicket,
            role as UserRole)
            .then((res: ApiResponse) => {
                if (res.status === 'login'){
                return navigate('/login')
                }

                if(res.status === 'forbidden') {
                setMessage('Korisnik nema pravo za izmejne!')
                }
            })
            getHelpdeskTicketsData()
        } catch(error) {
            setMessage('Došlo je do greške prilikom izmjene tiketa. Greška: ' + error);
        }
    }
                
    return (
        
        <Modal 
        isOpen={show} 
        onOpenChange={onHide} 
        backdrop='blur' 
        size='5xl' 
        isDismissable={false}
        scrollBehavior='inside'
        >
            <ModalContent key={helpdeskState?.ticketId} className='overflow-auto'>
                <ModalHeader className='flex justify-between'>
                    <span>Pregled tiketa <span className='text-default-500'>#{helpdeskState?.ticketId}</span></span> 
                    <Chip className='mr-3 col-end-3' color={colorStatus(helpdeskState?.status!)}>{helpdeskState?.status}</Chip>
                </ModalHeader>
                
                <ModalBody>
                    {isLoading ? (
                    <div className="flex justify-center items-center p-6">
                        <Spinner color='primary' label='Učitavanje...' labelColor='primary' />
                    </div>  ) : (
                    <div>
                    <Tabs
                        aria-label='Opcije'
                        color='primary' 
                        radius='full'
                        selectedKey={selectedTab}
                        onSelectionChange={(key: Key) => setSelectedTab(key as string)}
                    >
                        <Tab key="details" title='Detalji tiketa'>
                        <div className='grid lg:grid-cols-12 grid-cols gap-3'>    
                            <div className='grid lg:col-span-4 col-span gap-2 grid-flow-row auto-rows-max'>
                                <div className='grid gap-2'>
                                    <div className='grid grid-cols-3 gap-2'>
                                    <Input className='col-span-2' label="Korisnik" labelPlacement='inside' value={helpdeskState?.user?.fullname} />  
                                    <Input label="Kontakt" labelPlacement='inside' value={helpdeskState?.user?.localNumber} /> 
                                    </div>
                                    <Tooltip content={helpdeskState?.user?.department?.title} showArrow placement='right'>
                                        <Input label="Sektor/odjeljenje" labelPlacement='inside' value={helpdeskState?.user?.department?.title} />
                                    </Tooltip>
                                    <Input label="Lokacija" labelPlacement='inside' value={helpdeskState?.user?.location?.name} /> 
                                </div>
                                <div className='grid grid-cols-2 gap-2'>
                                    <Input label="Datum prijave" labelPlacement='inside' value={Moment(helpdeskState?.createdAt).format('DD.MM.YYYY - HH:mm')} />
                                    <Input label="Željeni rok klijenta" labelPlacement='inside' value={helpdeskState?.clientDuoDate ? Moment(helpdeskState?.clientDuoDate).format('DD.MM.YYYY - HH:mm') : ""} />
                                </div>
                                <div className='grid gap-2'>
                                    <Select
                                        isDisabled={isDisabled}
                                        id='priority'
                                        label='Prioritet'
                                        placeholder='Odaberite prioritet'
                                        errorMessage={editHelpdeskState.editTicket.priority === null ? validateMessages.priority : ''}
                                        value={editHelpdeskState.editTicket.priority === null ? '' : editHelpdeskState.editTicket.priority}
                                        selectedKeys={editHelpdeskState.editTicket.priority ? [`${editHelpdeskState.editTicket.priority}`] : []}
                                        onChange={handlePriorityChange}
                                        >
                                            
                                        {PriorityList.map((priorityItem) => (
                                            <SelectItem
                                            key={priorityItem.priority}
                                            textValue={priorityItem.priority}
                                            value={priorityItem.priority}
                                            >
                                                <div className="flex gap-2 items-center">
                                                    <div className="flex flex-col">
                                                        <Tooltip content={priorityItem.priority} showArrow placement='right'>
                                                        <span className="text-small">{priorityItem.priority}</span></Tooltip>
                                                        <span className="text-tiny text-default-400">Predviđeno vrijeme za rješenje {priorityItem.days} dan/a</span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Input label="Predviđeni datum rješenja"
                                    labelPlacement='inside' 
                                    value={editHelpdeskState.editTicket?.duoDate ? Moment(editHelpdeskState.editTicket?.duoDate).format('DD.MM.YYYY - HH:mm') : ""} />
                                </div>
                            </div>
                            <div className='grid lg:col-span-8 col-span gap-2 grid-flow-row auto-rows-max'>
                                <div className='grid gap-2'>
                                    <div className='grid grid-cols-2 gap-2'>
                                        <Tooltip content={helpdeskState?.group?.groupName} showArrow>
                                            <Input label="Grupa" labelPlacement='inside' value={helpdeskState?.group?.groupName} />
                                        </Tooltip>
                                        <Tooltip content={helpdeskState?.groupPartent?.groupName} showArrow>
                                            <Input label="Vrsta zahtjeva" labelPlacement='inside' value={helpdeskState?.groupPartent?.groupName} />
                                        </Tooltip>
                                        
                                    </div>
                                    <Textarea label="Opis zahtjeva" value={helpdeskState?.description} />
                                </div>
                                <div className={helpdeskState?.status === 'otvoren' ? 'hidden' : ''}>
                                    <Textarea
                                        errorMessage={editHelpdeskState.editTicket.resolveDescription === '' ? validateMessages.resolveDescription : ''}
                                        isReadOnly={isDisabled}
                                        label="Rješenje zahtjeva"
                                        type='text'
                                        value={editHelpdeskState.editTicket.resolveDescription}
                                        onValueChange={(value: string) => setEditHelpdeskStringFieldState('resolveDescription', value)}
                                        placeholder='Opis rješnja zahtjeva' />
                                </div>
                                <div className={helpdeskState?.status === 'otvoren' ? 'hidden' : 'grid grid-cols-3 gap-2'}>
                                    <div className='col-span-2'>
                                    <Select
                                        isDisabled={isDisabled}
                                        id='resolveResolution'
                                        label='Rješenje'
                                        placeholder='Odaberite rješnje'
                                        errorMessage={editHelpdeskState.editTicket.resolveResolution === null ? validateMessages.resolveResolution : ''}
                                        value={editHelpdeskState.editTicket.resolveResolution === null ? "" : editHelpdeskState.editTicket.resolveResolution}
                                        selectedKeys={editHelpdeskState.editTicket.resolveResolution ? [`${editHelpdeskState.editTicket.resolveResolution}`] : []}
                                        onChange={(value) => setEditHelpdeskStringFieldState('resolveResolution', value.target.value)}
                                        >
                                            
                                        {ResolveResolutionList.map((resolveItem) => (
                                            <SelectItem
                                            key={resolveItem.resolution}
                                            textValue={resolveItem.resolution}
                                            value={resolveItem.resolution}
                                            >
                                                <div className="flex gap-2 items-center">
                                                    <div className="flex flex-col">
                                                        <Tooltip content={resolveItem.resolution} showArrow placement='right'>
                                                        <span className="text-small">{resolveItem.resolution}</span></Tooltip>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    </div>
                                    <Input label={editHelpdeskState.editTicket.resolveTimespand ? 'Dodatno vrijeme (minute)' : 'Utrošeno vrijeme (minute)'}
                                    errorMessage={editHelpdeskState.editTicket.resolveTimespand === null ? validateMessages.resolveTimespand : ''}
                                    isDisabled={isDisabled}
                                    labelPlacement='inside'
                                    description={<span className='text-success'>{resolvedTimespandDescription()}</span>}
                                    onValueChange={(value: string) => updateResolvedTimespandFromInput(value)}
                                    />
                                </div>
                            </div>
                            </div>
                        </Tab>
                        <Tab isDisabled={helpdeskState?.articleId === null} key="article" title='Oprema'>
                            <div className='grid gap-2'>
                                <Input label="Naziv opreme" labelPlacement='inside' value={helpdeskState?.article?.stock?.name!} />
                                <Input label="Inventurni broj" labelPlacement='inside' value={helpdeskState?.article?.invNumber!} />
                                <Input label="Serijski broj" labelPlacement='inside' value={helpdeskState?.article?.serialNumber!} />
                            </div>
                        </Tab>
                        <Tab isDisabled={helpdeskState?.status === 'zatvoren'} key="forward" title='Proslijedi'>
                            {forwardTicket()}
                        </Tab>
                    </Tabs>
                    <div className='w-full flex justify-between'>
                        <TimelineProgressBar 
                            createdAt={new Date(helpdeskState?.createdAt ? helpdeskState.createdAt : 0)}
                            clientDuo={new Date(helpdeskState?.clientDuoDate ? helpdeskState.clientDuoDate : 0)}
                            duoDate={new Date(helpdeskState?.duoDate ? helpdeskState.duoDate : 0)}
                            resolveDate={new Date(helpdeskState?.resolveDate ? helpdeskState.resolveDate : 0)}
                        />
                    </div>
                    </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    {changeStatus(helpdeskState?.status!)}
                    {isDisabled ? (
                    <div className='flex items-center text-small bg-danger shadow-md rounded-xl p-2'>
                        <i className="bi bi-check2-circle mr-2 text-medium text-white font-bold" /> 
                        <span className=' text-white'>
                            {editHelpdeskState.editTicket?.resolveDate ? Moment(editHelpdeskState.editTicket?.resolveDate).format('DD.MM.YYYY - HH:mm') : ""} 
                        </span>
                    </div>) 
                    : 
                    (<Button className={isSelectedAssignedCheckBox || isSelectedCloseTicketCheckBox ? "hidden" : "inline-block"} color='success' onPress={() => doEditTicket(helpdeskState?.ticketId!)}>Sačuvaj</Button>)
                    }
                    <Button color='danger' onPress={onHide}>Zatvori</Button>
                </ModalFooter>
                
            </ModalContent>
        </Modal>
    );

    function forwardTicket() {
    return (
        <div className='grid gap-3'>
            <Select
            id='groupId'
            label='Grupa'
            placeholder='Odaberite grupu'
            value={helpdeskState?.groupId}
            onChange={handleGroupChange}
            selectedKeys={selectedGroup ? [`${selectedGroup}`] : []}
            >
            {moderatorGroupState.map((group, index) => (
                <SelectItem 
                key={group.group?.groupId || index} 
                textValue={`${group.group?.groupId} - ${group.group?.groupName}`}
                value={Number(group.groupId)}
                >
                <div className="flex gap-2 items-center">
                    <div className="flex flex-col">
                    <span className="text-small">{group.group?.groupName}</span>
                    <span className="text-tiny text-default-400">{group.group?.location?.name}</span>
                    </div>
                </div>
                </SelectItem>
            ))}
            </Select>
            {selectedGroup ? (
            <Select
                id='groupParentId'
                label='Vrsta zahtjeva'
                placeholder='Odaberite vrstu zahtjeva'
                onChange={handleGroupParentChange}
                selectedKeys={editHelpdeskState.editTicket.groupPartentId ? [`${editHelpdeskState.editTicket.groupPartentId}`] : []}
            >
                {groupParent
                .map((group) => (
                <SelectItem
                    key={Number(group.groupId)}
                    textValue={`${group.groupId} - ${group.groupName}`}
                    value={Number(group.groupId)}
                > {group.groupName} </SelectItem>
                ))}
            </Select>
            ): (<div></div>)}     
            {selectedGroup ? (
            <Select
                id='userId'
                label='Korisnik'
                placeholder='Odaberite korisnika'
                onChange={handleUserChange}
                selectedKeys={selectedUser ? [`${selectedUser}`] : []}
            >
                {groupUsers.map((user, index) => (
                <SelectItem
                    key={user?.userId || index}
                    textValue={`${user.userId} - ${user.fullname}`}
                    value={Number(user?.userId)}
                > {user.fullname} </SelectItem>
                ))}
            </Select>
            ): (<div></div>)} 

            <Button color='warning' isDisabled={selectedGroupParent ? false : true} onPress={() => handleForwardTicket()}>Proslijedi zahtjev</Button>
        </div>
    );
}
};

export default ModalDetails;
