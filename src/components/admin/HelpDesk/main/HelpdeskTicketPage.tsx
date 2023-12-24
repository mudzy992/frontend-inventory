import React, { Key, useEffect, useState } from 'react'
import HelpdeskTicketsType from '../../../../types/HelpdeskTicketsType'
import api, { ApiResponse } from '../../../../API/api'
import { useUserContext } from '../../../UserContext/UserContext';
import { UserRole } from '../../../../types/UserRoleType';
import RoledMainMenu from '../../../RoledMainMenu/RoledMainMenu';
import { Button, Card, CardBody, Chip, Input, Modal, ModalBody, ModalContent, 
  ModalFooter, ModalHeader, Select, SelectItem, Tab, Table, TableBody, TableCell, TableColumn, 
  TableHeader, TableRow, Tabs, Textarea, Tooltip, useDisclosure } from '@nextui-org/react';
import Datepicker from 'react-tailwindcss-datepicker';
import TicketGroupType from '../../../../types/TicketGroupType';
import Moment from 'moment';
import ModeratorGroupMappingType from '../../../../types/ModeratorGroupMappingType';
import UserType from '../../../../types/UserType';
import { useNavigate } from 'react-router-dom';

  type ModalDetailsProps = {
    isOpen: boolean;
    onClose: () => void;
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

const HelpdeskTicketPage: React.FC = () => {
  const {role, userId} = useUserContext();
  const [groupState, setGroupState] = useState<TicketGroupType[]>([])
  const [helpdeskState, setHelpdeskState] = useState<HelpdeskTicketsType[]>([])
  const [editHelpdeskState, setEdithelpDeskState] = useState<HelpdeskTicketState>({ editTicket: {} });
  const [moderatorGroupState, setModeratorGroupState] = useState<ModeratorGroupMappingType[]>([])
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("details");
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [groupUsers, setGroupUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
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

  const setEditHelpdeskNumberFieldState = (fieldName: string, newValue: any) => {
    setEdithelpDeskState((prev) => ({
      ...prev,
      editTicket: {
        ...prev.editTicket,
        [fieldName]: (newValue === 'null') ? null : Number(newValue),
      },
    }));
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
    getHelpdeskTicketsData()
  }, [userId])

  //Postavljanje početnog datuma
/*   useEffect(() => {
    if (helpdeskState.length > 0 && selectedTicketId !== null) {
      const selectedTicket = helpdeskState.find(
        (ticket) => ticket.ticketId === selectedTicketId
      );
  
      if (selectedTicket && selectedTicket.createdAt) {
        setValue({
          startDate: new Date(selectedTicket.createdAt),
          endDate: new Date(),
        });
      }
    }
  }, [helpdeskState, selectedTicketId]); */

  //Uvećanje željenog roka za 7 dana
/*   useEffect(() => {
    if (value.startDate) {
      const sevenDaysLater = new Date(value.startDate);
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  
      setValue((prevValue) => ({
        ...prevValue,
        endDate: sevenDaysLater,
      }));
    }
  }, [value.startDate]); */

  //Kada se pređe na tab forward da se tad učitaju podaci o moderatorima
/*   useEffect(() => {
    if (selectedTab === 'forward') {  
        getAllModeratorsInGroup();
    }
  }, [selectedTab]); */


  //Postavljanje tiketa u stanje
  useEffect(() => {
    if (groupState.length > 0) {
      const tickets = groupState
        .flatMap((group) => group.helpdeskTickets)
        .filter((ticket) => ticket !== undefined) as HelpdeskTicketsType[];
  
        setHelpdeskState(tickets);
    }
  }, [groupState]);

  /* useEffect(() => {
    if (selectedGroup) {
      // Filtriraj korisnike koji pripadaju odabranoj grupi
      const filteredUsers = moderatorGroupState
        .filter((group) => group.group?.groupId === selectedGroup)
        .flatMap((group) => group.user || [])
        .map((user) => user || []);
      
      setGroupUsers(filteredUsers);
    }
  }, [selectedGroup, moderatorGroupState]); */
  
  //Api za preuzimanje grupa i tiketa iz grupe
  const getHelpdeskTicketsData = () => {
    api(`api/ticket/group/user/${userId}`, "get", {}, role as UserRole)
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
      setGroupState(res.data)
    })
  }

  const putTicketDetailsInState = async (ticketId: number) => {
    const filteredTickets: HelpdeskTicketsType[] = helpdeskState.filter((ticket) => ticket.ticketId === ticketId);

    setEdithelpDeskState((prev) => ({
      ...prev, 
      editTicket: {
        assignedTo: filteredTickets[0].assignedTo || 0,
        duoDate: filteredTickets[0].dueDate || '',
        groupId: filteredTickets[0].groupId || 0,
        resolveDescription: filteredTickets[0].resolveDescription || '',
        status: filteredTickets[0].status || ''
      }
    }))
  }

  //Api za preuzimanje moderatora za potrebe prosljedjivanja tiketa
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
        handleCloseModal()
        getHelpdeskTicketsData()
      })
      
    } catch(error){
      setMessage('Došlo je do greške prilikom izmjene tiketa. Greška: ' + error)
    }
  }

/*   const handleValueChange = (newValue:any) => {
    setValue(newValue); 
    }  */

  function handleOpenModal(ticketId: number) {
    setSelectedTicketId(ticketId);
    putTicketDetailsInState(ticketId)
    onOpen();
  }

  function handleCloseModal() {
    setSelectedTicketId(null);
    onClose();
  }
    
  return (
    <div>
      <RoledMainMenu />
      <div className="container mx-auto lg:px-4 mt-3 h-max">
        <div id='kontejner-tiketa' className="w-full flex flex-col gap-3">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {tikets()}
          </div>
          
        </div>
        {tiketsTable()}
      </div>
    </div>
  )

  function tikets(){
    const filteredTickets = helpdeskState.filter((ticket) => ticket.assignedTo === userId);
    return filteredTickets.map((tiket, index) => (
      <div key={tiket.ticketId} className='mb-3'>
        <Card>
          <CardBody>
            <div className='bg-default-100 p-2 rounded-large'>{tiket.title}</div>
            <div className='p-2'>{tiket.description}</div>            
          </CardBody>
        </Card>
      </div>
    ))
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

  function actions(ticketId: number) {
    return (
      <div className="relative flex items-center gap-2">
            <Tooltip content="Preuzmi" showArrow>
              <span className="text-lg text-default-600 cursor-pointer active:opacity-50">
              <i className="bi bi-person-up"/>
              </span>
            </Tooltip>
            <Tooltip content="Pregledaj" showArrow>
            <span
              className="text-lg p-1 text-default-600 cursor-pointer active:opacity-50"
              onClick={() => handleOpenModal(ticketId)}
            >
              <i className="bi bi-eye" />
            </span>
            </Tooltip>
            <Tooltip color="success" content="Zatvori zahtjev" showArrow>
              <span  className="text-lg text-success cursor-pointer active:opacity-50">
                <i className="bi bi-check2-circle" />
              </span>
            </Tooltip>
          </div>
    )
  }

  function changeStatus(status:string){
    if(status === 'otvoren'){
      return (
        <Button color={colorStatus(status)}>Preuzmi zahtjev</Button>
      )
    } else if(status === 'izvršenje') {
      return (
        <Button color={colorStatus(status)}>Zatvori zahtjev</Button>
      )
    }
  }

/*   function forwardTicket() {
    return (
      <div className='grid gap-3'>
        <Select
          id='groupId'
          label='Grupa'
          placeholder='Odaberite grupu'
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
  } */
  

  function ModalDetails({ isOpen, onClose, ticketId }: ModalDetailsProps) {
    const filteredTickets = helpdeskState.filter((ticket) => ticket.ticketId === ticketId);
    return (
    <div>
      <div className='mb-3'>
          <Modal isOpen={isOpen} onOpenChange={onClose} backdrop='blur' size='5xl' isDismissable={false}>

      {filteredTickets.map((tiket, index) => (
            <ModalContent>
              <ModalHeader>
                <div className='flex justify-between w-full'>
                  <span>Pregled tiketa <span className='text-default-500'>#{tiket.ticketId}</span></span> 
                  <Chip className='mr-3 col-end-3' color={colorStatus(tiket.status!)}>{tiket.status}</Chip></div>
              </ModalHeader>
              <ModalBody>
                <div className='container mx-auto'>
                  <div className='grid lg:grid-cols-12 grid-cols gap-2'>
                      <div className='grid lg:col-span-4 col-span gap-2'>
                        <Input label="Korisnik" labelPlacement='inside' value={tiket.user?.fullname} />
                        {tiket.articleId ? (
                          <div className='grid gap-2'>
                            <Input label="Naziv opreme" labelPlacement='inside' value={tiket.article?.stock?.name} />
                            <Input label="Inventurni broj" labelPlacement='inside' value={tiket.article?.invNumber} />
                            <Input label="Serijski broj" labelPlacement='inside' value={tiket.article?.serialNumber} />
                          </div>
                        ) : (<></>)}
                        <Input label="Grupa" labelPlacement='inside' value={tiket.group?.groupName} />
                        <div>
                        <div className='bg-default-100 rounded-xl pl-3 pr-3 pt-1 pb-1'>
                          <span className='text-xs text-default-700'>Datum prijave i željeni rok</span>
                        {/* <Datepicker
                          displayFormat='DD/MM/YYYY'
                          disabled={true}
                          separator='do'
                          value={value}
                          popoverDirection='up'
                          inputClassName="w-full bg-default-100 rounded-xl focus:ring-0 text-small text-black" 
                          onChange={handleValueChange}
                        /> */}
                        </div>
                        <span className='text-[11px] text-default-500 pl-3'>Željeni rok se automacki postavlja 7 dana od dana prijave</span>
                        </div>
                      </div>
                      <div className='grid lg:col-span-8 col-span gap-3 grid-flow-row auto-rows-max'>
                        <div>
                          <Textarea label="Opis zahtjeva" value={tiket.description} />
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
                  {/* <Tabs 
                  aria-label='Opcije'
                  color='primary' 
                  radius='full'
                  selectedKey={selectedTab}
                   onSelectionChange={(key: Key) => setSelectedTab(key as string)}
                  >
                    <Tab key="details" title='Detalji tiketa'>
                      
                    </Tab>
                    <Tab isDisabled={tiket.status !== 'otvoren'} key="forward" title='Proslijedi'>
                      {forwardTicket()}
                    </Tab>
                  </Tabs> */}
                  
                </div>
              </ModalBody>
            <ModalFooter>
                  {changeStatus(tiket.status!)}
                  <Button color='success' onPress={() => doEditTicket(tiket.ticketId!)}>Sačuvaj</Button>
                  <Button color='danger' onPress={onClose}>Zatvori</Button>
            </ModalFooter>
            </ModalContent>
         
        )
    )
    }
 </Modal>
        </div> 
    </div> 
    )
  }

  function tiketsTable() {
    return (
      <div className='w-full'>
        <Table
        aria-label='tabla-tiketa'
        isHeaderSticky
        isStriped
        isCompact
        selectionMode='single'
        >
          <TableHeader>
            <TableColumn key="ticketID">#</TableColumn>
            <TableColumn key="naziv">Naziv</TableColumn>
            <TableColumn key="opis">Opis tiketa</TableColumn>
            <TableColumn key="prijavio">Prijavio/la</TableColumn>
            <TableColumn key="grupa">Grupa</TableColumn>
            <TableColumn key="datum-prijave">Datum prijave</TableColumn>
            <TableColumn key="datum-izvrsetka">Datum izvršetka</TableColumn>
            <TableColumn key="status">Status</TableColumn>
            <TableColumn key="zaduzeni-korisni">Izvršava zadatak</TableColumn>
            <TableColumn key="action">Akcije</TableColumn>
          </TableHeader>
          <TableBody items={helpdeskState} emptyContent="Svaka čast, svi tiketi su završeni">
            {(item) => (
              <TableRow key={item.ticketId}>
                <TableCell>{item.ticketId}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell className="w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{item.description}</TableCell>
                <TableCell>{item.user?.fullname}</TableCell>
                <TableCell>{item.group?.groupName}</TableCell>
                <TableCell>{Moment(item.createdAt).format('DD.MM.YYYY - HH:mm')}</TableCell>
                <TableCell>{item.dueDate}</TableCell>
                <TableCell><Chip variant='solid' color={colorStatus(item.status!)}>{item.status}</Chip></TableCell>
                <TableCell>{item.assignedTo2?.fullname}</TableCell>
                <TableCell>{actions(item.ticketId!)}</TableCell>
              </TableRow>
            )}
          </TableBody>

        </Table>
        <ModalDetails
          isOpen={isOpen}
          onClose={handleCloseModal}
          ticketId={selectedTicketId || 0}
        />
      </div>
    )
  }
}

export default HelpdeskTicketPage