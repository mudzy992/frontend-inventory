import { Breadcrumb } from 'antd';
import { useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import { useUserContext } from '../../Contexts/UserContext/UserContext';
import Link from 'antd/es/typography/Link';
import React from 'react';

const breadcrumbMap: Record<string, string> = {
  helpdesk: 'Helpdesk',
  profile: 'Profil',
  article: 'Artikal',
  invoices: 'Fakture',
  feature: 'Osobine',
  documents: 'Dokumenti',
  category: 'Kategorije',
  add: 'Dodaj',
  user: 'Korisnici',
  department: "Sektori/službe/odjeljenja",
  stock: "Skladište",
  printers: "Printeri",
};

const AppBreadcrumb:React.FC<{isDark: boolean}> = ({isDark}) => {
  const location = useLocation();
  const { role, userId } = useUserContext();

  const pathnames = location.pathname.split('/').filter((x) => x);

  if (location.pathname === '/') {
    return null;
  }

  const breadcrumbItems = pathnames.map((value, index) => {
    if (value === 'admin') {
      return null;
    }
    const last = index === pathnames.length - 1;
    const to = `#/${pathnames.slice(0, index + 1).join('#/')}`;

    const breadcrumbLabel = breadcrumbMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

    return last ? (
      <Breadcrumb.Item key={to}>
        <span>{breadcrumbLabel}</span>
      </Breadcrumb.Item>
    ) : (
      <Breadcrumb.Item key={to}>
        <Link href={to} >
          {breadcrumbLabel}
        </Link>
      </Breadcrumb.Item>
    );
  });

  return (
    <div className={`p-2 ${isDark ? "bg-[#141414] border-[#313131]" : "bg-white border-[#F3F4F8]"} mb-3  border-[1px] rounded-xl`}>
      <Breadcrumb className="flex items-center">
        <Breadcrumb.Item>
          <Link href={role === 'user' ? `#/profile/${userId}` : '/'}>
            <HomeOutlined className="text-xl" />
          </Link>
        </Breadcrumb.Item>
        {breadcrumbItems}
      </Breadcrumb>
    </div>
  );
};

export default AppBreadcrumb;
