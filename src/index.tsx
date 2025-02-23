import React, { ReactNode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap-icons/font/bootstrap-icons.css";
import reportWebVitals from "./reportWebVitals";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Layout, ConfigProvider, theme, Button, Switch } from "antd";
import 'antd/dist/reset.css';
import hrHR from "antd/lib/locale/hr_HR";
import { UserContextProvider, useUserContext } from "./components/Contexts/UserContext/UserContext";
import CategoryPage from "./components/APP/Categories/Categories";
import HomePage from "./components/APP/Home/HomePage";
import AdminUserProfilePage from "./components/APP/UserProfile/UserProfilePage";
import AddArticlePage from "./components/admin/Article/AddArticle/AddArticlePage";
import AddUserPage from "./components/admin/AddUser/AddUserPage";
import AddFeaturePage from "./components/admin/AddFeature/AddFeaturePage";
import AddNewCategoryPage from "./components/admin/AddCategory/AddCategoryPage";
import AddDepartmentAndJob from "./components/admin/AddDepartmentJobLocation/MainAddDepartmentJobLocation";
import AdminDocumentsPage from "./components/admin/Documents/AdminDocumentsPage";
import LoginPage from "./components/Login/LoginPage";
import HelpdeskTicketPage from "./components/admin/HelpDesk/Helpdesk";
import ArticlePage from "./components/admin/Dashboard/Article/ArticlePage";
import TelecomInvoice from "./components/APP/TelecomInvoices/TelecomInvoice";
import InvoiceList from "./components/admin/Invoices/InvoiceList";
import Printers from "./components/admin/Invoices/Printers";
import { NotificationProvider } from "./components/Contexts/Notification/NotificationContext";
import { Header } from "antd/es/layout/layout";
import { MenuFoldOutlined, MenuUnfoldOutlined, AppstoreOutlined } from '@ant-design/icons';
import ArticleComponent from "./components/admin/Article/ArticleComponent";
import HelpdeskDetails from "./components/admin/HelpDesk/main/Details/HelpdeskDetails";
import AppBreadcrumb from "./components/APP/Breadcrumb/AppBreadcrumb";
import Stock from "./components/APP/Stock/Stock";
import SiderNavigationMenu from "./components/APP/SiderNavigationMenu/SiderNavigationMenu";
import UserDropdown from "./components/APP/SiderNavigationMenu/UserDropDownMenu";

const { Content, Footer, Sider } = Layout;

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps & { isDarkMode: boolean; setIsDarkMode: (value: boolean) => void; isCompact: boolean; setIsCompact: (value: boolean) => void; }> = ({ children, isDarkMode, setIsDarkMode, isCompact, setIsCompact }) => {
  const curentYear = new Date().getFullYear();
  const {isAuthenticated, role, userId} = useUserContext()
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);


  return (
    <Layout
    className={`min-h-screen`}
    >
    {isAuthenticated && (
      <div className="z-[1]">
            <Sider
            collapsible
            collapsed={collapsed}
            trigger={null}
            style={{
                overflow: "auto",
                height: "100vh",
                transition: "width 0.3s ease-in-out",
              }}
            className={`
                transition-all duration-300 flex flex-col justify-center fixed bg-[#141414] border-r-[1px] border-[#313131]
                ${isMobile ? "inset-0 z-[50] shadow-lg" : "left-0 top-0"}
                ${collapsed ? "w-[70px]" : "w-[250px]"}
              `}
            breakpoint="lg"
            collapsedWidth={isMobile ? 0 : 70}
            onBreakpoint={(broken) => {
                setCollapsed(true);
            }}
            onCollapse={(collapsed) => {
                setCollapsed(collapsed);
            }}
            onMouseEnter={() => {
                if (!isMobile) setCollapsed(false);
            }}
            onMouseLeave={() => {
                if (!isMobile) setCollapsed(true);
            }}
            width={250}
            >
            <SiderNavigationMenu collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className={`${collapsed ? 'hidden' : 'block'} flex flex-col gap-2 items-start mx-3 px-5 py-2 justify-end bg-teal-950 rounded-md text-sm text-white`}>
            <div className="flex flex-row justify-between items-center w-full">
              <span className="text-default">Tema</span>
              <Switch
                title="Tema"
                checked={isDarkMode}
                onChange={() => setIsDarkMode(!isDarkMode)}
                checkedChildren="🌙"
                unCheckedChildren="☀️"
              />
            </div>
            <div className="flex flex-row justify-between items-center w-full">
              <span className="text-default">Pregled </span>
              <Switch
                title="Prikaz"
                checked={isCompact}
                onChange={() => setIsCompact(!isCompact)}
                checkedChildren="Pregledno"
                unCheckedChildren="Standardno"
              />
            </div>
          </div>
            </Sider>
            {isMobile && !collapsed && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setCollapsed(true)}
            />
            )}
      </div>
    )}
    <Layout className={`transition-all duration-500 w-full ${isAuthenticated && !isMobile && 'pl-16'}
        ${isDarkMode ? "background-dark" : "background-light"}
        background-animated`}
        >
        <Header
            className={`h-14 sticky-header bg-[rgba(var(--antd-colorBgBaseRGB),0.5)]
            backdrop-blur-md flex flex-row justify-between items-center
            transition-all duration-300 ${!isAuthenticated && 'hidden'} ${isAuthenticated && !collapsed ? "blur-md" : ""}`}
        >
            <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className={isAuthenticated && isMobile ? "flex items-center font-lg" : "hidden"}
            style={{ fontSize: "16px" }}
            />
            <span className="flex items-center gap-2 font-extrabold text-xl w-full justify-center">
                <AppstoreOutlined className="text-primary text-xl" />
                <Link to={role === 'user' ? `/profile/${userId}` : '/'}>Inventory database</Link>
            </span>
            <div className="flex flex-row items-center gap-2">
                <UserDropdown />
            </div>
        </Header>
        <Content
            className={`container mx-auto px-4 py-4 transition-all duration-300 z-[1]
            ${isAuthenticated && !collapsed ? "blur-sm" : ""}`}
        >
            {isAuthenticated && (
                <div className={`p-2 ${isDarkMode ? "bg-[#141414] border-[#313131]" : "bg-white border-[#F3F4F8]"} mb-3  border-[1px] rounded-xl`}>
                    <AppBreadcrumb />
                </div>
            )}
            {children}
        </Content>
        <Footer className={`text-center text-gray-400 z-[1] bg-[rgba(var(--antd-colorBgBaseRGB),0.5)] backdrop-blur-md
            ${isAuthenticated && !collapsed ? "blur-sm" : ""}`}>Inventory Database v1.3.6 ©{curentYear} Created by Mudžahid Cerić
        </Footer>
    </Layout>
  </Layout>
)};

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  return (
    <React.StrictMode>
      <ConfigProvider
          locale={hrHR}
          theme={{
            "token": {
              "colorPrimary": "#33bcb7",
              "colorInfo": "#1668dc",
              "colorSuccess": "#3c8618",
              "wireframe": false,
              colorLink: isDarkMode ? "#FACC15" : "#1668dc", // Menja boju linka u zavisnosti od teme
              colorLinkHover: isDarkMode ? "#EAB308" : "#0F52BA",
            },
            "components": {
              "Button": {
                "borderRadius": 15,
                "borderRadiusSM": 9,
                "controlHeight": 40
              },
              "Input": {
                "borderRadius": 12,
                "controlHeight": 44,
              },
              "Select": {
                "borderRadius": 12,
                "controlHeight": 44,
              },
              "Tag": {
                "borderRadius":8
              },
              "Card": {
                "borderRadiusLG": 16
             }
            },
            "algorithm": isCompact
            ? [isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm, theme.compactAlgorithm]
            : isDarkMode
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
          }}
        >

            <Router>
            <UserContextProvider>
              <NotificationProvider>
              <AppLayout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} isCompact={isCompact} setIsCompact={setIsCompact}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/profile/:userID" element={<AdminUserProfilePage />} />
                  <Route path="/category/:categoryID" element={<CategoryPage />} />
                  <Route path="/article/:serial" element={<ArticleComponent />} />
                  <Route path="/stock/:stockId" element={<Stock />} />
                  <Route path="/admin/article/" element={<ArticlePage />} />
                  <Route path="/admin/article/add" element={<AddArticlePage />} />
                  <Route path="/admin/user/" element={<AddUserPage />} />
                  <Route path="/admin/feature/" element={<AddFeaturePage />} />
                  <Route path="/admin/category/" element={<AddNewCategoryPage />} />
                  <Route path="/admin/department/" element={<AddDepartmentAndJob />} />
                  <Route path="/admin/documents/" element={<AdminDocumentsPage />} />
                  <Route path="/admin/helpdesk" element={<HelpdeskTicketPage />} />
                  <Route path="/admin/helpdesk/:ticketId" element={<HelpdeskDetails />} />
                  <Route path="/admin/invoices" element={<InvoiceList />} />
                  <Route path="/admin/invoices/:invoiceId/printers" element={<Printers />} />
                  <Route path="/admin/telecom" element={<TelecomInvoice />} />
                </Routes>
              </AppLayout>
              </NotificationProvider>
              </UserContextProvider>
            </Router>
          </ConfigProvider>
    </React.StrictMode>
  );
};

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Element with id 'root' not found.");
}

reportWebVitals();
