import React, { useState } from 'react'
import UserType from '../../../../types/UserType'
import { Button, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip } from '@nextui-org/react'
import Moment from 'moment';
import ViewSingleTicketModal from '../../../admin/HelpDesk/view/ViewSingleTicket';
import NewTicketByArticleModal from '../../../admin/HelpDesk/new/ByArticle/NewTicketByArticleModal';

type UserTicketsProps = {
    data: UserType
}

const UserTickets: React.FC<UserTicketsProps> = ({data}) => {
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

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

    const handleShowAddModal = () => {
        setShowAddModal(true);
    };
    
    const handleHideAddModal = () => {
        setShowAddModal(false);
    };

    const statusColor = (status: string) => {
        let color
        if(status === 'otvoren'){
            return color = "secondary"
        } else if(status === 'zatvoren'){
            return color = "success"
        } else if(status === 'izvršenje'){
            return color = "warning"
        }
        return color
    }
  return (
    <div>
        <div className='pb-4 pr-2 flex justify-end w-full'><Button onClick={() => handleShowAddModal()} variant='shadow' color='warning' size='sm'>Prijavi novi tiket</Button></div>
        <Table aria-label='tabela-tiketa' isCompact isStriped>
            <TableHeader>
                <TableColumn>#</TableColumn>
                <TableColumn>Opis</TableColumn>
                <TableColumn>Prijavljeno</TableColumn>
                <TableColumn>Riješeno</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn>Akcija</TableColumn>
            </TableHeader>
            <TableBody>
                {data.helpdeskTickets ? data.helpdeskTickets?.map((ticket) => (
                    <TableRow key={ticket.ticketId}>
                        <TableCell >{ticket.ticketId}</TableCell>
                        <TableCell>{ticket.description}</TableCell>
                        <TableCell>{Moment(ticket?.createdAt).format('DD.MM.YYYY - HH:mm')}</TableCell>
                        <TableCell>{ticket.resolveDate ? Moment(ticket?.resolveDate).format('DD.MM.YYYY - HH:mm') : ""}</TableCell>
                        <TableCell><Chip size='sm' color={statusColor(ticket.status!)}>{ticket.status}</Chip></TableCell>
                        <TableCell>{actions(ticket.ticketId!)}</TableCell>
                    </TableRow>)): []}
            </TableBody>
            
        </Table>
        <ViewSingleTicketModal
        show={showViewModal}
        onHide={handleHideViewModal}
        ticketId={selectedTicketId!}
        data={data}
        />
        <NewTicketByArticleModal 
            show={showAddModal}
            onHide={handleHideAddModal}
            />
    </div>
  )

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
}

export default UserTickets