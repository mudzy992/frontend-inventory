import { Timeline, Tag, Typography } from 'antd';
import HelpdeskTicketsType from '../../../../../types/HelpdeskTicketsType';


interface TicketActivityProps {
  ticket: HelpdeskTicketsType | null;
}

const TicketActivity = ({ ticket }: TicketActivityProps) => {
  return (
    <Timeline>
    </Timeline>
  );
};

export default TicketActivity;
