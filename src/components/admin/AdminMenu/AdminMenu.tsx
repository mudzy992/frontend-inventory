import { Button, Tooltip } from '@nextui-org/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminMenu = () => {
  const actions = [
    { icon: <i className='bi bi-stack' style={{ fontSize: '21px' }} />, name: 'Dashboard', link: '/' },
    { icon: <i className='bi bi-database-add' style={{ fontSize: '21px' }} />, name: 'Artikli', link: '/admin/article' },
    { icon: <i className='bi bi-list-stars' style={{ fontSize: '21px' }} />, name: 'Osobine', link: '/admin/feature' },
    { icon: <i className='bi bi-card-checklist' style={{ fontSize: '21px' }} />, name: 'Kategorije', link: '/admin/category' },
    { icon: <i className='bi bi-person-plus-fill' style={{ fontSize: '21px' }} />, name: 'Korisnici', link: '/admin/user/' },
    { icon: <i className='bi bi-journal-text' style={{ fontSize: '21px' }} />, name: 'Dokumenti', link: '/admin/document/' },
    { icon: <i className='bi bi-building-add' style={{ fontSize: '21px' }} />, name: 'Sektor/služba/odljenje', link: '/admin/department/' },
  ];

  const [isMenuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    setMenuVisible(true);
  };
  
  const handleMouseLeave = () => {
    setMenuVisible(false);
  };
  
  const toggleMenuVisibility = () => {
    setMenuVisible(!isMenuVisible);
  };
  
  const handleButtonClick = (link:string) => {
    navigate(link);
    setMenuVisible(false);
  };

  return (
    <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed bottom-4 right-4 group"
    >
      {isMenuVisible && (
        <div
          id="speed-dial-menu-text-outside-button-square"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="flex flex-col items-center mb-4 space-y-2"
        >
            
                {actions.map((action, index) => (
                    <Tooltip isOpen content={action.name} placement='left' showArrow key={index}>
                        <Button
                            key={index}
                            onClick={() => handleButtonClick(action.link)}
                            startContent={action.icon}
                            className="relative w-[52px] h-[52px]"
                            size='sm'
                            radius='full'
                            variant='shadow'
                            color='secondary'
                        >
                        </Button>
                    </Tooltip>
                ))}
            
        </div>
      )}
      
        <Button
        variant='shadow'
        color='primary'
        onClick={toggleMenuVisibility}
        className="flex items-center justify-center rounded-full w-14 h-14"
        >
          <svg className="w-5 h-5 transition-transform group-hover:rotate-45" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
          </svg>
      </Button>
    </div>
  );
};

export default AdminMenu;