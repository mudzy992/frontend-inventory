import React, { useEffect, useState } from 'react'
import api, { ApiResponse } from '../../../../API/api'
import { useUserContext } from '../../../UserContext/UserContext';
import { UserRole } from '../../../../types/UserRoleType';
import RoledMainMenu from '../../../RoledMainMenu/RoledMainMenu';
import { Chip, Table, TableBody, TableCell, TableColumn, 
  TableHeader, TableRow, Tooltip,  } from '@nextui-org/react';
import TicketGroupType from '../../../../types/TicketGroupType';
import Moment from 'moment';
import ModalDetails from './ModalDetails';

const HelpdeskTicketPage: React.FC = () => {
  const {role, userId} = useUserContext();
  const [groupState, setGroupState] = useState<TicketGroupType[]>([])
  const [showModal, setShowModal] = useState(false); 
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  
  useEffect(() => {
    if (userId !== undefined) {
      getHelpdeskTicketsData();
    }
  }, [userId]);

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


  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleHideModal = () => {
    setShowModal(false);
  };

  const openModalWithArticle = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    handleShowModal();
  };

  return (
    <div>
      <RoledMainMenu />
      <div className="container mx-auto lg:px-4 mt-3 h-max">
        <div id='kontejner-tiketa' className="w-full flex flex-col gap-3">
        </div>
        {tiketsTable()}
        
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
            {groupState
              .flatMap((group) => group.helpdeskTickets || [])
              .filter((item) => !!item)
              .map((item) => (
                <TableRow key={item.ticketId}>
                  <TableCell>{item.ticketId}</TableCell>
                  <TableCell>{item.user?.fullname}</TableCell>
                  <TableCell className="w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{item.description}</TableCell>
                  <TableCell>{item.group?.groupName}</TableCell>
                  <TableCell>{Moment(item.createdAt).format('DD.MM.YYYY - HH:mm')}</TableCell>
                  <TableCell>{item.dueDate ? Moment(item.dueDate).format('DD.MM.YYYY - HH:mm') : ""}</TableCell>
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