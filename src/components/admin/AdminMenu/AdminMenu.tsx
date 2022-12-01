import React from 'react'
import SpeedDial from '@mui/material/SpeedDial';
import { Backdrop, SpeedDialAction} from '@mui/material'; 

export default function AdminMenu() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => {
        setOpen(true);
    };
  
    const handleClose = () => {
        setOpen(false);
    };
    const actions = [
        {icon: <i className='bi bi-stack' style={{fontSize:'21px'}}/>, name: 'Dashboard', link: "/"},
        {icon: <i className='bi bi-database-add' style={{fontSize:'21px'}}/>, name: 'Artikli', link: "/admin/article"},
        {icon: <i className='bi bi-list-stars' style={{fontSize:'21px'}}/>, name: 'Osobine', link: "/admin/feature"},
        {icon: <i className='bi bi-card-checklist' style={{fontSize:'21px'}}/> , name: 'Kategorije', link: "/admin/category"},
        {icon: <i className='bi bi-person-plus-fill' style={{fontSize:'21px'}}/>, name: 'Korisnici', link: "/admin/user/"},
        {icon: <i className='bi bi-journal-text' style={{fontSize:'21px'}}/>, name: 'Dokumenti', link: "/admin/document/"},
/*         {icon: <i className='bi bi-building-add' style={{fontSize:'21px'}}/> , name: 'Sektor/služba/odljenje', link: "/admin/department/"}, */
      ]
    return (
        <>
        <Backdrop open={open} />
        <SpeedDial
            ariaLabel="Administrator dashboard"
            hidden={false}
            onClose={handleClose}
            onOpen={handleOpen}
            open={open}
            sx={{ position: 'fixed', bottom: 20, right: 20, margin: 0 }}
            icon={<i className="bi bi-menu-up" style={{fontSize:'22px'}}/>}
        >
            {actions.map((action) => (
          
                <SpeedDialAction 
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    tooltipOpen
                    onClick={()=> window.open('#' + action.link, '_self', 'noopener,noreferrer')} />
            ))}
        </SpeedDial></>
    );
  }