import React, { Key, useEffect, useState } from 'react'
import api, { ApiResponse } from '../../../../API/api'
import { useUserContext } from '../../../UserContext/UserContext';
import { UserRole } from '../../../../types/UserRoleType';
import RoledMainMenu from '../../../RoledMainMenu/RoledMainMenu';
import { Chip, Input, Pagination, Tab, Table, TableBody, TableCell, TableColumn, 
  TableHeader, TableRow, Tabs, Tooltip,  } from '@nextui-org/react';
import Moment from 'moment';
import ModalDetails from './ModalDetails';
import HelpdeskTicketsType from '../../../../types/HelpdeskTicketsType';

const HelpdeskTicketPage: React.FC = () => {
  const {role, userId} = useUserContext();
  const [helpdeskState, setHelpdeskState] = useState<HelpdeskTicketsType[]>([])
  const [showModal, setShowModal] = useState(false); 
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [selectedTab, setSelectedTab] = useState<string>("unassigned");
  const [ticketCurrentPage, setTicketsCurrentPage] = useState<number>(1);
  const [ticketsItemsPerPage] = useState<number>(5);
  const [ticketsTotalPage, setTicketsTotalPage] = useState<number>(0);
  const [ticketsPaginationTableQuery, setTicketsPaginationTableQuery] = useState<string>('');
  const [assignedToValue, setAssignedToValue] = useState<number | null>(null);
  const [statusValue, setStatusValue] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    if (userId !== undefined) {
      if(selectedTab === "all"){
        setAssignedToValue(null)
        setStatusValue(undefined)
        getHelpdeskTicketsData();
      } else if(selectedTab === "unassigned"){
        setAssignedToValue(null);
        setStatusValue("otvoren");
        getHelpdeskTicketsData();
      } else if(selectedTab === "assigned"){
        setAssignedToValue(userId);
        setStatusValue("izvršenje");
        getHelpdeskTicketsData();
      } else if(selectedTab === "solved"){
        setAssignedToValue(userId);
        setStatusValue("zatvoren");
        getHelpdeskTicketsData();
      }
/*       getHelpdeskTicketsData(); */
    }
  }, [userId, selectedTab, assignedToValue, statusValue]);

  //Api za preuzimanje grupa i tiketa iz grupe
  const getHelpdeskTicketsData = () => {
    api(`api/helpdesk/s/${userId}?perPage=${ticketsItemsPerPage}&page=${ticketCurrentPage}&query=${encodeURIComponent(ticketsPaginationTableQuery)}&assignedTo=${assignedToValue}&status=${statusValue}`, 
    "get", {}, role as UserRole)
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
        setHelpdeskState(res.data.results)
        const totalCount: number = res.data.total;
        const totalPages: number = Math.ceil(totalCount / ticketsItemsPerPage);
        setTicketsTotalPage(totalPages);
      })
  }

  useEffect(() => {
    getHelpdeskTicketsData()
  }, [ticketCurrentPage, ticketsItemsPerPage, ticketsPaginationTableQuery]);

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleHideModal = () => {
    setShowModal(false);
    getHelpdeskTicketsData()
  };

  const openModalWithArticle = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    handleShowModal();
  };

  const handleSearchChange = (query: string) => {
    setTicketsCurrentPage(1)
    setTicketsPaginationTableQuery(query)        
}  

  return (
    <div>
      <RoledMainMenu />
      <div className="container mx-auto lg:px-4 mt-3 h-max">
        <div id='kontejner-tiketa' className="w-full flex flex-col gap-3">
          </div>
          <Tabs
          aria-label='Opcije'
          color='primary' 
          radius='full'
          selectedKey={selectedTab}
          onSelectionChange={(key: Key) => setSelectedTab(key as string)}
          >
            <Tab key='all' title="Svi">
              {allTicketsTable()}
            </Tab>
            <Tab key='unassigned' title="Nepreuzeti">
              {unAssignedTickets()}
            </Tab>
            <Tab key='assigned' title='Moji preuzeti'>
              {assignedByUserTickets()}
            </Tab>
            <Tab key='solved' title='Moji završeni'>
              {assignedByUserSolvedTickets()}
            </Tab>
          </Tabs>
      </div>
    </div>
  )

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
              onClick={() => openModalWithArticle(ticketId)}
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

  function allTicketsTable() {
    return (
      <div className='w-full'>
        <Table
        aria-label='tabla-tiketa'
        isHeaderSticky
        isStriped
        isCompact
        selectionMode='single'
        topContent={
          <Input
            placeholder="Pronađi tiket..."
            variant='bordered'
            isClearable
            startContent={<i className="bi bi-search text-default-500" />}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    handleSearchChange(target.value);
                }
            }}                            
        />
        }
        bottomContent={
          <div className="flex justify-center mt-3"> 
              <Pagination
              color="default"
              showControls
              variant='flat'
              disableCursorAnimation
              initialPage={ticketCurrentPage}
              page={ticketCurrentPage}
              total={ticketsTotalPage}
              onChange={(page) => setTicketsCurrentPage(page)}
              />
          </div>
        }
        >
          <TableHeader>
            <TableColumn key="ticketID">#</TableColumn>
            <TableColumn key="prijavio">Prijavio/la</TableColumn>
            <TableColumn key="opis">Opis tiketa</TableColumn>
            <TableColumn key="grupa">Grupa</TableColumn>
            <TableColumn key="datum-prijave">Datum prijave</TableColumn>
            <TableColumn key="datum-izvrsetka">Datum izvršetka</TableColumn>
            <TableColumn key="status">Status</TableColumn>
            <TableColumn key="zaduzeni-korisni">Izvršava zadatak</TableColumn>
            <TableColumn key="action">Akcije</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Svaka čast, svi tiketi su završeni">
            {helpdeskState
              .filter((item) => !!item)
              .map((item) => (
                <TableRow key={item.ticketId}>
                  <TableCell>{item.ticketId}</TableCell>
                  <TableCell>{item.user?.fullname}</TableCell>
                  <TableCell className="w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{item.description}</TableCell>
                  <TableCell>{item.group?.groupName}</TableCell>
                  <TableCell>{Moment(item.createdAt).format('DD.MM.YYYY - HH:mm')}</TableCell>
                  <TableCell>{item.duoDate ? Moment(item.duoDate).format('DD.MM.YYYY - HH:mm') : ""}</TableCell>
                  <TableCell><Chip variant='solid' color={colorStatus(item.status!)}>{item.status}</Chip></TableCell>
                  <TableCell>{item.assignedTo2?.fullname}</TableCell>
                  <TableCell>{actions(item.ticketId!)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <ModalDetails
          show={showModal}
          onHide={handleHideModal}
          ticketId={selectedTicketId!}
        />
      </div>
    )
  }

  function unAssignedTickets() {
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
            <TableColumn key="prijavio">Prijavio/la</TableColumn>
            <TableColumn key="opis">Opis tiketa</TableColumn>
            <TableColumn key="grupa">Grupa</TableColumn>
            <TableColumn key="datum-prijave">Datum prijave</TableColumn>
            <TableColumn key="datum-izvrsetka">Datum izvršetka</TableColumn>
            <TableColumn key="status">Status</TableColumn>
            <TableColumn key="zaduzeni-korisni">Izvršava zadatak</TableColumn>
            <TableColumn key="action">Akcije</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Svaka čast, svi tiketi su završeni"> 
            {helpdeskState
              .filter((item) => !!item && item.assignedTo === null)
              .map((item) => (
                <TableRow key={item.ticketId}>
                  <TableCell>{item.ticketId}</TableCell>
                  <TableCell>{item.user?.fullname}</TableCell>
                  <TableCell className="w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{item.description}</TableCell>
                  <TableCell>{item.group?.groupName}</TableCell>
                  <TableCell>{Moment(item.createdAt).format('DD.MM.YYYY - HH:mm')}</TableCell>
                  <TableCell>{item.duoDate ? Moment(item.duoDate).format('DD.MM.YYYY - HH:mm') : ""}</TableCell>
                  <TableCell><Chip variant='solid' color={colorStatus(item.status!)}>{item.status}</Chip></TableCell>
                  <TableCell>{item.assignedTo2?.fullname}</TableCell>
                  <TableCell>{actions(item.ticketId!)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <ModalDetails
          show={showModal}
          onHide={handleHideModal}
          ticketId={selectedTicketId!}
        />
      </div>
    )
  }

  function assignedByUserTickets() {
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
            <TableColumn key="prijavio">Prijavio/la</TableColumn>
            <TableColumn key="opis">Opis tiketa</TableColumn>
            <TableColumn key="grupa">Grupa</TableColumn>
            <TableColumn key="datum-prijave">Datum prijave</TableColumn>
            <TableColumn key="datum-izvrsetka">Datum izvršetka</TableColumn>
            <TableColumn key="status">Status</TableColumn>
            <TableColumn key="zaduzeni-korisni">Izvršava zadatak</TableColumn>
            <TableColumn key="action">Akcije</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Svaka čast, svi tiketi su završeni">
            {helpdeskState
              .filter((item) => !!item && item.assignedTo === userId && item.status === 'izvršenje')
              .map((item) => (
                <TableRow key={item.ticketId}>
                  <TableCell>{item.ticketId}</TableCell>
                  <TableCell>{item.user?.fullname}</TableCell>
                  <TableCell className="w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{item.description}</TableCell>
                  <TableCell>{item.group?.groupName}</TableCell>
                  <TableCell>{Moment(item.createdAt).format('DD.MM.YYYY - HH:mm')}</TableCell>
                  <TableCell>{item.duoDate ? Moment(item.duoDate).format('DD.MM.YYYY - HH:mm') : ""}</TableCell>
                  <TableCell><Chip variant='solid' color={colorStatus(item.status!)}>{item.status}</Chip></TableCell>
                  <TableCell>{item.assignedTo2?.fullname}</TableCell>
                  <TableCell>{actions(item.ticketId!)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <ModalDetails
          show={showModal}
          onHide={handleHideModal}
          ticketId={selectedTicketId!}
        />
      </div>
    )
  }

  function assignedByUserSolvedTickets() {
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
            <TableColumn key="prijavio">Prijavio/la</TableColumn>
            <TableColumn key="opis">Opis tiketa</TableColumn>
            <TableColumn key="grupa">Grupa</TableColumn>
            <TableColumn key="datum-prijave">Datum prijave</TableColumn>
            <TableColumn key="datum-izvrsetka">Datum izvršetka</TableColumn>
            <TableColumn key="status">Status</TableColumn>
            <TableColumn key="zaduzeni-korisni">Izvršava zadatak</TableColumn>
            <TableColumn key="action">Akcije</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Svaka čast, svi tiketi su završeni">
            {helpdeskState
              .filter((item) => !!item && item.assignedTo === userId && item.status === 'zatvoren')
              .map((item) => (
                <TableRow key={item.ticketId}>
                  <TableCell>{item.ticketId}</TableCell>
                  <TableCell>{item.user?.fullname}</TableCell>
                  <TableCell className="w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{item.description}</TableCell>
                  <TableCell>{item.group?.groupName}</TableCell>
                  <TableCell>{Moment(item.createdAt).format('DD.MM.YYYY - HH:mm')}</TableCell>
                  <TableCell>{item.duoDate ? Moment(item.duoDate).format('DD.MM.YYYY - HH:mm') : ""}</TableCell>
                  <TableCell><Chip variant='solid' color={colorStatus(item.status!)}>{item.status}</Chip></TableCell>
                  <TableCell>{item.assignedTo2?.fullname}</TableCell>
                  <TableCell>{actions(item.ticketId!)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <ModalDetails
          show={showModal}
          onHide={handleHideModal}
          ticketId={selectedTicketId!}
        />
      </div>
    )
  }
}

export default HelpdeskTicketPage