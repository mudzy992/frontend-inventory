import { Modal as AntdModal, Card, Tabs, Tag } from 'antd'; // Uvoz Ant Design modala sa alias-om
import TicketActions from './TicketActions';
import TicketComments from './TicketComments';
import TicketActivity from './TicketActivity';
import HelpdeskTicketsType from '../../../../../types/HelpdeskTicketsType';
import TicketDetails from './TicketDetails';
import { useEffect, useState } from 'react';
import { ApiResponse, useApi } from '../../../../../API/api';
import { useUserContext } from '../../../../Contexts/UserContext/UserContext';
import { useParams } from 'react-router-dom';

const HelpdeskDetails:React.FC = () => {
  const {ticketId} = useParams<({ticketId: string})>()
  const [ticket, setTicket] = useState<HelpdeskTicketsType>()
  const {api} = useApi()
  const {role} = useUserContext()

  useEffect(() => {
    fetchTicket()
  },[ticketId])

  function colorStatus(status: string) {
    let color;
    if (status === "otvoren") {
      color = "volcano";
    } else if (status === "izvršenje") {
      color = "gold";
    } else if (status === "zatvoren") {
      color = "green";
    } else {
      color = "error";
    }
    return color;
  }

  const fetchTicket = () => {
      api(`/api/helpdesk/ticket/${ticketId}`, "get", {}, role)
        .then((res: ApiResponse) => {
          setTicket(res.data);
        })
    };

  if (!ticket) {
    return <div>Ticket not found</div>; // Prikazuje poruku ako tiket nije pronađen
  }

  return (
    <Card title={<div className='flex flex-row justify-between'>
      <span>Detalji tiketa #{ticketId}</span>
      <Tag color={colorStatus(ticket.status!)}>{ticket.status}</Tag></div>}
      >
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Detalji" key="1">
          <TicketDetails 
          helpdeskState={ticket} 
          isDisabled={ticket.status === "zatvoren"} 
          fetchTicket={fetchTicket}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Akcije" key="2">
          <TicketActions ticketId={ticket.ticketId!} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Informacije" key="3">
          <TicketComments ticket={ticket} />
        </Tabs.TabPane>
        {/* <Tabs.TabPane tab="Activity" key="4">
          <TicketActivity ticket={ticket} />
        </Tabs.TabPane> */}
      </Tabs>
    </Card>
  );
};

export default HelpdeskDetails;
