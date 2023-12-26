// ModalDetails.tsx
import React, { Key, useEffect, useState } from 'react';
import { ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Modal, Chip, Tabs, Tab, Select, SelectItem, Tooltip, Spinner } from '@nextui-org/react';
import HelpdeskTicketsType from '../../../../types/HelpdeskTicketsType';
import api, { ApiResponse } from '../../../../API/api';
import { UserRole } from '../../../../types/UserRoleType';
import { useUserContext } from '../../../UserContext/UserContext';
import { useNavigate } from 'react-router-dom';
import ModeratorGroupMappingType from '../../../../types/ModeratorGroupMappingType';
import UserType from '../../../../types/UserType';
import Moment from 'moment';

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


interface HelpdeskTicketState {
    editTicket: {
      groupId?: number | null;
      resolveDescription?: string;
      duoDate?: string;
      assignedTo?: number | null;
      status?: string;
      priority?: string;
      resolveDate?: string;
    };
  }

const ModalDetails: React.FC<ModalDetailsProps> = ({ show, onHide, ticketId }) => {
    const {role, userId} = useUserContext();
    const [helpdeskState, setHelpdeskState] = useState<HelpdeskTicketsType>()
    const [editHelpdeskState, setEdithelpDeskState] = useState<HelpdeskTicketState>({ editTicket: {} });
    const [message, setMessage] = useState<string>('')
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
    const [selectedTab, setSelectedTab] = useState<string>("details");
    const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<number | undefined>(undefined);
    const [moderatorGroupState, setModeratorGroupState] = useState<ModeratorGroupMappingType[]>([])
    const [groupUsers, setGroupUsers] = useState<UserType[]>([]);
    const [isDisabled, setIsDisabled] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
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

    const handleGroupChange = (value: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedGroup(Number(value.target.value));
    };
    
    const handleUserChange = (value: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedUser(Number(value.target.value));
    };

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
            duoDate: helpdeskState?.duoDate || '',
            assignedTo: helpdeskState?.assignedTo || null,
            groupId: helpdeskState?.groupId || null,
            resolveDescription: helpdeskState?.resolveDescription || '',
            status: helpdeskState?.status || '',
            priority: helpdeskState?.priority || '',
            resolveDate: helpdeskState?.resolveDate || '',
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
        setEdithelpDeskState((prev) => ({
            ...prev,
            editTicket: {
                ...prev.editTicket,
                [fieldName]: newValue,
            },
        }));
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
        const dueDate = new Date(helpdeskState?.createdAt || new Date());
        dueDate.setDate(dueDate.getDate() + days);
        return dueDate.toISOString();
    }

    const handleAssiningTicket = async () => {
       setEditHelpdeskStringFieldState('status', 'izvršenje')
        await setEditHelpdeskNumberFieldState('assignedTo', userId);
    };

    const handleCloseTicket = async () => {
        const date:Date = new Date();
        setEditHelpdeskStringFieldState('status', 'zatvoren')
        setEditHelpdeskStringFieldState('resolveDate', date)
        //razlog rješenja postaviti
     };

    function changeStatus(status:string){
        if(status === 'otvoren'){
            return (        
                <Button onClick={() => {handleAssiningTicket()}} color={colorStatus(status)}>Preuzmi zahtjev</Button>
            )
        } else if(status === 'izvršenje') {
            return (
                <Button onClick={() => {handleCloseTicket()}} color={colorStatus(status)}>Zatvori zahtjev</Button>
            )
        } 
    }

    useEffect(() => {
        doEditTicket(ticketId);
        getHelpdeskTicketsData()
        putTicketDetailsInState()
      }, [editHelpdeskState.editTicket.assignedTo]);

    useEffect(() => {
        doEditTicket(ticketId);
        getHelpdeskTicketsData()
        putTicketDetailsInState()
      }, [editHelpdeskState.editTicket.resolveDate]);

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
        // Filtriraj korisnike koji pripadaju odabranoj grupi
        const filteredUsers = moderatorGroupState
            .filter((group) => group.group?.groupId === selectedGroup)
            .flatMap((group) => group.user || [])
            .map((user) => user || []);
        
        setGroupUsers(filteredUsers);
        }
    }, [selectedGroup, moderatorGroupState]); 

    useEffect(() => {
        if (selectedTab === 'forward') {  
            getAllModeratorsInGroup();
        }
    }, [selectedTab]);


    const getHelpdeskTicketsData = () => {
        setIsLoading(true); // Postavi isLoading na true pre nego što počneš sa zahtevom
    
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
        try{
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
        
        } catch(error){
        setMessage('Došlo je do greške prilikom izmjene tiketa. Greška: ' + error)
        }
    }

    return (
            <div>
            <Modal 
            isOpen={show} 
            onOpenChange={onHide} 
            backdrop='blur' 
            size='5xl' 
            isDismissable={false}
            className='flex flex-col'
            >
                    <ModalContent key={helpdeskState?.ticketId}>
                    <ModalHeader>
                        <div className='flex justify-between w-full'>
                        <span>Pregled tiketa <span className='text-default-500'>#{helpdeskState?.ticketId}</span></span> 
                        <Chip className='mr-3 col-end-3' color={colorStatus(helpdeskState?.status!)}>{helpdeskState?.status}</Chip></div>
                    </ModalHeader>
                {isLoading ? (<div className="flex justify-center items-center p-6">
                        <Spinner color='primary' label='Učitavanje...' labelColor='primary' />
                    </div>  ) : (
                        <div>
                    <ModalBody>
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
                                            errorMessage={message}
                                            value={editHelpdeskState.editTicket.priority}
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
                                                <Input label="Podrgrupa" labelPlacement='inside' value={helpdeskState?.groupPartent?.groupName} />
                                            </Tooltip>
                                            
                                        </div>
                                        <Textarea label="Opis zahtjeva" value={helpdeskState?.description} />
                                    </div>
                                    <div>
                                        <Textarea 
                                            isDisabled={isDisabled} 
                                            label="Rješenje zahtjeva"
                                            type='text'
                                            value={editHelpdeskState.editTicket.resolveDescription}
                                            onValueChange={(value: string) => setEditHelpdeskStringFieldState('resolveDescription', value)}
                                            placeholder='Opis rješnja zahtjeva' />
                                    </div>
                                </div>
                                </div>
                            </Tab>
                            <Tab isDisabled={helpdeskState?.articleId === null} key="article" title='Oprema'>
                                <div className='grid gap-2'>
                                    <Input label="Naziv opreme" labelPlacement='inside' value={helpdeskState?.article?.stock?.name} />
                                    <Input label="Inventurni broj" labelPlacement='inside' value={helpdeskState?.article?.invNumber} />
                                    <Input label="Serijski broj" labelPlacement='inside' value={helpdeskState?.article?.serialNumber} />
                                </div>
                            </Tab>
                            <Tab isDisabled={helpdeskState?.status !== 'otvoren'} key="forward" title='Proslijedi'>
                                {forwardTicket()}
                            </Tab>
                        </Tabs>
                    </ModalBody>
                    <ModalFooter>
                        {changeStatus(helpdeskState?.status!)}
                        {isDisabled ? (<div className='flex items-center text-small bg-danger shadow-md rounded-xl p-2'>
                            <i className="bi bi-check2-circle mr-2 text-medium text-white font-bold" /> 
                            <span className=' text-white'>
                            Zahtjev zatvoren: {editHelpdeskState.editTicket?.resolveDate ? Moment(editHelpdeskState.editTicket?.resolveDate).format('DD.MM.YYYY - HH:mm') : ""} 
                            </span></div>) 
                        : 
                        (<Button  color='success' onPress={() => doEditTicket(helpdeskState?.ticketId!)}>Sačuvaj</Button>)
                        }
                        
                        <Button color='danger' onPress={onHide}>Zatvori</Button>
                    </ModalFooter>
                    </div>
                )}
                </ModalContent>
                    </Modal>
            
            </div>
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
            id='userId'
            label='Korisnik'
            placeholder='Odaberite korisnika'
            onChange={handleUserChange}
            selectedKeys={selectedUser ? [`${selectedUser}`] : []}
          >
            {groupUsers.map((user, index) => (
              <SelectItem
                key={user?.userId || index}
                textValue={user?.fullname || ''}
                value={Number(user?.userId)}
              > {user.fullname} </SelectItem>
            ))}
          </Select>
        ): (<div></div>)} 

        <Button color='warning'>Proslijedi zahtjev</Button>
      </div>
    );
  }
};

export default ModalDetails;
