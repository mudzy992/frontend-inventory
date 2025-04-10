import { Button, Dropdown, Menu } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { MenuProps } from 'antd/lib';
import { useNavigate } from 'react-router-dom';
import { useUserContext, removeIdentity } from '../../Contexts/UserContext/UserContext';



const UserDropdown = () => {
  const {userId, isAuthenticated, setRole, setUserId, setIsAuthenticated, setPhoneIp} = useUserContext()
  const navigate = useNavigate()
  const logOut = async () => {
    if(isAuthenticated){
      await removeIdentity(setIsAuthenticated, setUserId, setRole, setPhoneIp);
      navigate('/login')
    }
  }
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a
        rel="noopener noreferrer"
        href={`#/profile/${userId}`}>
        Profil
        </a>
      ),
      icon: <UserOutlined />
    },
    {
      key: '2',
      label: (
        <a
        onClick={logOut}
        >
        Odjavi se
        </a>
      ),
      icon: <LogoutOutlined />,
      danger: true
    }
  ]



  return (
    <div>
      {isAuthenticated && (
        <Dropdown menu={{items}}>
          <Button
            className="flex items-center text-lg"
            type="text"
            icon={<UserOutlined />}
          >
          </Button>
        </Dropdown>
      )}
    </div>
  );
};

export default UserDropdown;
