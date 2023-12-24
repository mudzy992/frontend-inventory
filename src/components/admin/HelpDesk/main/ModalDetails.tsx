// ModalDetails.tsx
import React, { Key, useEffect, useState } from 'react';
import { ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Modal, Chip, Tabs, Tab, Select, SelectItem } from '@nextui-org/react';
import HelpdeskTicketsType from '../../../../types/HelpdeskTicketsType';
import api, { ApiResponse } from '../../../../API/api';
import { UserRole } from '../../../../types/UserRoleType';
import { useUserContext } from '../../../UserContext/UserContext';
import { useNavigate } from 'react-router-dom';
import ModeratorGroupMappingType from '../../../../types/ModeratorGroupMappingType';
import UserType from '../../../../types/UserType';
import Datepicker from 'react-tailwindcss-datepicker';

type ModalDetailsProps = {
  show: boolean;
  onHide: () => void;
  ticketId: number;
};


interface HelpdeskTicketState {
    editTicket: {
      groupId?: number;
      resolveDescription?: string;
      duoDate?: string;
      assignedTo?: number;
      status?: string;
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
    const navigate = useNavigate();
    const [value, setValue] = useState({ 
        startDate: new Date(), 
        endDate: new Date()
    });

    const handleGroupChange = (value: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedGroup(Number(value.target.value));
    };
    
    const handleUserChange = (value: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedUser(Number(value.target.value));
    };
    const handleValueChange = (newValue:any) => {
        setValue(newValue); 
    } 

    function changeStatus(status:string){
        if(status === 'otvoren'){
        return (
            <Button onClick={() => {setEditHelpdeskNumberFieldState('assignedTo', userId); doEditTicket(ticketId)}} color={colorStatus(status)}>Preuzmi zahtjev</Button>
        )
        } else if(status === 'izvršenje') {
        return (
            <Button color={colorStatus(status)}>Zatvori zahtjev</Button>
        )
        }
    }

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
            assignedTo: helpdeskState?.assignedTo || 0,
            duoDate: helpdeskState?.dueDate || '',
            groupId: helpdeskState?.groupId || 0,
            resolveDescription: helpdeskState?.resolveDescription || '',
            status: helpdeskState?.status || ''
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
        console.log(fieldName, newValue)
    };
  
    const setEditHelpdeskStringFieldState = (fieldName: string, newValue: string) => {
        setEdithelpDeskState((prev) => ({
        ...prev,
        editTicket: {
            ...prev.editTicket,
            [fieldName]: newValue,
        },
        }));
    };

    useEffect(() => {
        if (show) {
            getHelpdeskTicketsData();
            console.log(userId)
        }
    }, [show, ticketId]);

    useEffect(() => {
        if (helpdeskState && helpdeskState.createdAt) {
            setValue({
                startDate: new Date(helpdeskState.createdAt),
                endDate: new Date()
            });
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

    //Uvećanje željenog roka za 7 dana
    useEffect(() => {
        if (value.startDate) {
        const sevenDaysLater = new Date(value.startDate);
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
        setValue((prevValue) => ({
            ...prevValue,
            endDate: sevenDaysLater,
        }));
        }
    }, [value.startDate]);

    const getHelpdeskTicketsData = () => {
        api(`/api/helpdesk/ticket/${ticketId}`, "get", {}, role as UserRole)
        .then((res: ApiResponse) => {
        if(res.status === 'login') {
            setIsLoggedIn(false)
            setMessage('Greška prilikom učitavanja podataka. Korisnik nije prijavljen!')
            return
        }
        if(res.status === 'error'){
            setMessage('Greška prilikom učitavanja podataka, molimo pokušate ponovo!')
            return
        }
        if(res.status === 'forbidden') {
            setMessage('Korisnik nema prava za učitavanja ove vrste podataka!')
            return
        }
        setHelpdeskState(res.data)
        })
    }

    const getAllModeratorsInGroup = () => {
        api(`api/moderator/group`, "get", {}, role as UserRole)
        .then((res: ApiResponse) => {
        if(res.status === 'login') {
            setIsLoggedIn(false)
            setMessage('Greška prilikom učitavanja podataka. Korisnik nije prijavljen!')
            return
        }
        if(res.status === 'error'){
            setMessage('Greška prilikom učitavanja podataka, molimo pokušate ponovo!')
            return
        }
        if(res.status === 'forbidden') {
            setMessage('Korisnik nema prava za učitavanja ove vrste podataka!')
            return
        }
        setModeratorGroupState(res.data)
        })
    }

    const doEditTicket = async (ticketId:number) => {
        try{
        await api(`api/helpdesk/${ticketId}`, 'put',
        {    
            groupId: editHelpdeskState?.editTicket.groupId,
            resolveDescription: editHelpdeskState?.editTicket.resolveDescription,
            duoDate: editHelpdeskState?.editTicket.duoDate,
            assignedTo: editHelpdeskState?.editTicket.assignedTo,
            status: editHelpdeskState?.editTicket.status,
        },
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
            <div className='mb-3'>
            <Modal isOpen={show} onOpenChange={onHide} backdrop='blur' size='5xl' isDismissable={false}>
                <ModalContent key={helpdeskState?.ticketId}>
                <ModalHeader>
                    <div className='flex justify-between w-full'>
                    <span>Pregled tiketa <span className='text-default-500'>#{helpdeskState?.ticketId}</span></span> 
                    <Chip className='mr-3 col-end-3' color={colorStatus(helpdeskState?.status!)}>{helpdeskState?.status}</Chip></div>
                </ModalHeader>
                <ModalBody>
                    <div className='container mx-auto'>
                    
                    <Tabs 
                    aria-label='Opcije'
                    color='primary' 
                    radius='full'
                    selectedKey={selectedTab}
                    onSelectionChange={(key: Key) => setSelectedTab(key as string)}
                    >
                        <Tab key="details" title='Detalji tiketa'>
                        <div className='grid lg:grid-cols-12 grid-cols gap-2'>
                        <div className='grid lg:col-span-4 col-span gap-2'>
                            <Input label="Korisnik" labelPlacement='inside' value={helpdeskState?.user?.fullname} />
                            {helpdeskState?.articleId ? (
                            <div className='grid gap-2'>
                                <Input label="Naziv opreme" labelPlacement='inside' value={helpdeskState?.article?.stock?.name} />
                                <Input label="Inventurni broj" labelPlacement='inside' value={helpdeskState?.article?.invNumber} />
                                <Input label="Serijski broj" labelPlacement='inside' value={helpdeskState?.article?.serialNumber} />
                            </div>
                            ) : (<></>)}
                            <Input label="Grupa" labelPlacement='inside' value={helpdeskState?.group?.groupName} />
                            <div>
                            <div className='bg-default-100 rounded-xl pl-3 pr-3 pt-1 pb-1'>
                            <span className='text-xs text-default-700'>Datum prijave i željeni rok</span>
                            <Datepicker
                                displayFormat='DD/MM/YYYY'
                                disabled={true}
                                separator='do'
                                value={value}
                                popoverDirection='up'
                                inputClassName="w-full bg-default-100 rounded-xl focus:ring-0 text-small text-black" 
                                onChange={handleValueChange}
                            />
                            </div>
                            <span className='text-[11px] text-default-500 pl-3'>Željeni rok se automacki postavlja 7 dana od dana prijave</span>
                            </div>
                        </div>
                        <div className='grid lg:col-span-8 col-span gap-3 grid-flow-row auto-rows-max'>
                            <div>
                            <Textarea label="Opis zahtjeva" value={helpdeskState?.description} />
                            </div>
                            <div>
                            <Textarea 
                                label="Rješenje zahtjeva"
                                type='text'
                                value={editHelpdeskState.editTicket.resolveDescription}
                                onValueChange={(value: string) => setEditHelpdeskStringFieldState('resolveDescription', value)}
                                placeholder='Opis rješnja zahtjeva' />
                            </div>
                        </div>
                        </div>
                        </Tab>
                        <Tab isDisabled={helpdeskState?.status !== 'otvoren'} key="forward" title='Proslijedi'>
                            {forwardTicket()}
                        </Tab>
                    </Tabs>
                    
                    </div>
                </ModalBody>
                <ModalFooter>
                    {changeStatus(helpdeskState?.status!)}
                    <Button color='success' onPress={() => doEditTicket(helpdeskState?.ticketId!)}>Sačuvaj</Button>
                    <Button color='danger' onPress={onHide}>Zatvori</Button>
                </ModalFooter>
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
