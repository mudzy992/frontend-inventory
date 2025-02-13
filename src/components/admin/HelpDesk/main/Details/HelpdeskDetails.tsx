import { Modal as AntdModal, Badge, Card, Tabs, Tag } from 'antd';
import TicketActions from './TicketActions';
import TicketComments from './TicketComments';
import TicketActivity from './TicketActivity';
import HelpdeskTicketsType from '../../../../../types/HelpdeskTicketsType';
import TicketDetails from './TicketDetails';
import { useEffect, useState } from 'react';
import { ApiResponse, useApi } from '../../../../../API/api';
import { useUserContext } from '../../../../Contexts/UserContext/UserContext';
import { useParams } from 'react-router-dom';
import TicketAsset from './TicketAsset';
import { FileTextOutlined, DesktopOutlined, AppstoreAddOutlined, MessageOutlined } from '@ant-design/icons'; // Uvoz ikona

const HelpdeskDetails: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<HelpdeskTicketsType>();
  const { api } = useApi();
  const { role, userId } = useUserContext();

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

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
      });
  };

  if (!ticket) {
    return <Card className='w-full flex items-center justify-center'>Tiket nije pronađen</Card>;
  }

  return (
    <Card title={<div className='flex flex-row justify-between'>
      <span>Detalji tiketa #{ticketId}</span>
      <Tag color={colorStatus(ticket.status!)}>{ticket.status}</Tag>
    </div>}
    >
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab={<><FileTextOutlined /> Detalji</>} key="1">
          <TicketDetails 
            helpdeskState={ticket} 
            isDisabled={ticket.status === "zatvoren" || (ticket.status === "izvršenje" && ticket.assignedTo !== userId)}
            fetchTicket={fetchTicket}
          />
        </Tabs.TabPane>
        <Tabs.TabPane className={ticket.article ? "block" : "hidden"} tab={<><DesktopOutlined /> Oprema</>} key="2">
          <TicketAsset ticket={ticket!} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={<><AppstoreAddOutlined /> Akcije</>} key="3">
          <TicketActions ticketId={ticket.ticketId!} isDisabled={ticket.status === "zatvoren" || (ticket.status === "izvršenje" && ticket.assignedTo !== userId)} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={<><MessageOutlined /> Informacije <Badge count={ticket.comments?.length} /></>} key="4">
          <TicketComments ticket={ticket} />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
};

export default HelpdeskDetails;
