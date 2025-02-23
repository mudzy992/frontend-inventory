import { Breadcrumb } from 'antd';
import { useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import { useUserContext } from '../../Contexts/UserContext/UserContext';
import Link from 'antd/es/typography/Link';

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
  stock: "Skladište"
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
    <div>
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
