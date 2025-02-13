import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const breadcrumbMap: Record<string, string> = {
  helpdesk: 'Helpdesk',
  profile: 'Profil',
  article: 'Artikal',
  invoices: 'Fakture',
  feature: 'Osobine',
  documents: 'Dokumenti',
  category: 'Kategorije',
  dashboard: 'Kontrolna Tabla',
  user: 'Korisnici',
  department: 'Sektori/službe/odjeljenja',
};

const AppBreadcrumb = () => {
  const location = useLocation();
  let pathnames = location.pathname.split('/').filter((x) => x);

  if (location.pathname === '/') {
    return null;
  }

  // Posebna provera za /admin/user
  let modifiedPathnames = pathnames.filter((value) => value !== 'admin'); // Uklanjamo "admin" iz svih slučajeva

  if (pathnames.join('/') === 'admin/user') {
    modifiedPathnames = ['user']; // Ako je /admin/user, ostavi samo "user"
  }

  const breadcrumbItems = modifiedPathnames.map((value, index) => {
    const last = index === modifiedPathnames.length - 1;
    const to = `/${modifiedPathnames.slice(0, index + 1).join('/')}`;

    const breadcrumbLabel = breadcrumbMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

    return last ? (
      <Breadcrumb.Item key={to}>{breadcrumbLabel}</Breadcrumb.Item>
    ) : (
      <Breadcrumb.Item key={to}>
        <Link to={to}>{breadcrumbLabel}</Link>
      </Breadcrumb.Item>
    );
  });

  return (
    <Breadcrumb>
      <Breadcrumb.Item>
        <Link to="/">
          <HomeOutlined />
        </Link>
      </Breadcrumb.Item>
      {breadcrumbItems}
    </Breadcrumb>
  );
};

export default AppBreadcrumb;
