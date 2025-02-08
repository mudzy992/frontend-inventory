import { Button, Dropdown, Menu, Select } from 'antd';

interface TicketActionsProps {
  ticketId: number;
}

const TicketActions = ({ ticketId,  }: TicketActionsProps) => {
  const handleMenuClick = (e: any) => {
    
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="assign">Assign</Menu.Item>
      <Menu.Item key="changeStatus">Change Status</Menu.Item>
    </Menu>
  );

  return (
    <div>
      <Dropdown overlay={menu}>
        <Button>Actions</Button>
      </Dropdown>
      <Select defaultValue="Priority" style={{ width: 120 }} >
        <Select.Option value="low">Low</Select.Option>
        <Select.Option value="medium">Medium</Select.Option>
        <Select.Option value="high">High</Select.Option>
      </Select>
    </div>
  );
};

export default TicketActions;
