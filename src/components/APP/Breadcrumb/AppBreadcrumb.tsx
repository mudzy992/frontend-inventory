import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import { useUserContext } from '../../Contexts/UserContext/UserContext';

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
  department: "Sektori/službe/odjeljenja"
};

const AppBreadcrumb = () => {
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
    const to = `/${pathnames.slice(0, index + 1).join('/')}`;

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
        <Link to={role === 'user' ? `/profile/${userId}` : '/'}>
          <HomeOutlined />
        </Link>
      </Breadcrumb.Item>
      {breadcrumbItems}
    </Breadcrumb>
  );
};

export default AppBreadcrumb;
