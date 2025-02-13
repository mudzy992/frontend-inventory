import { Descriptions } from 'antd';
import HelpdeskTicketsType from '../../../../../types/HelpdeskTicketsType';

interface TicketAssetProps {
  ticket: HelpdeskTicketsType;
}

const TicketAsset = ({ ticket  }: TicketAssetProps) => {
  return (
    <Descriptions column={1} bordered>
        <Descriptions.Item label="Naziv opreme">{ticket.article?.stock?.name}</Descriptions.Item>
        <Descriptions.Item label="Inventurni broj">{ticket.article?.invNumber}</Descriptions.Item>
        <Descriptions.Item label="Serijski broj"><a href={`#/admin/article/${ticket.article?.serialNumber}`}>{ticket.article?.serialNumber}</a></Descriptions.Item>
    </Descriptions>
  );
};

export default TicketAsset;
