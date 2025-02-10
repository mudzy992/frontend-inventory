import React, { useEffect, useState } from "react";
import { ApiResponse, useApi } from "../../../API/api";
import { useUserContext } from "../../Contexts/UserContext/UserContext";
import { UserRole } from "../../../types/UserRoleType";
import { Input, Pagination, Tabs, Table, Tag, Tooltip, Card } from "antd";
import Moment from "moment";
import HelpdeskTicketsType from "../../../types/HelpdeskTicketsType";
import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "../../Contexts/Notification/NotificationContext";

const { TabPane } = Tabs;

const HelpdeskTicketPage: React.FC = () => {
  const { api } = useApi();
  const { role, userId } = useUserContext();
  const [helpdeskState, setHelpdeskState] = useState<HelpdeskTicketsType[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("unassigned");
  const [ticketsItemsPerPage] = useState<number>(10);
  const [ticketsTotalPage, setTicketsTotalPage] = useState<number>(0);
  const [ticketsPaginationTableQuery, setTicketsPaginationTableQuery] = useState<string>("");

  const [unassignedTicketCurrentPage, setUnassignedTicketsCurrentPage] = useState<number>(1);
  const [allTicketCurrentPage, setAllTicketsCurrentPage] = useState<number>(1);
  const [assignedTicketCurrentPage, setAssignedTicketsCurrentPage] = useState<number>(1);
  const [solvedTicketCurrentPage, setSolvedTicketsCurrentPage] = useState<number>(1);

  const { error, warning, success } = useNotificationContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId !== undefined) {
      let assignedToValue;
      let statusValue;
      let currentPage = 1;
  
      // Izbor stranice na osnovu selektovanog taba
      if (selectedTab === "unassigned") {
        currentPage = unassignedTicketCurrentPage;
        assignedToValue = null;
        statusValue = "otvoren";
      } else if (selectedTab === "assigned") {
        currentPage = assignedTicketCurrentPage;
        assignedToValue = userId;
        statusValue = "izvršenje";
      } else if (selectedTab === "solved") {
        currentPage = solvedTicketCurrentPage;
        assignedToValue = userId;
        statusValue = "zatvoren";
      } else if (selectedTab === "all") {
        currentPage = allTicketCurrentPage;
      }
  
      // Pozivanje funkcije za učitavanje tiketa
      getHelpdeskTicketsData(currentPage, assignedToValue, statusValue);
    }
  }, [
    userId,
    selectedTab,
    allTicketCurrentPage,
    unassignedTicketCurrentPage,
    assignedTicketCurrentPage,
    solvedTicketCurrentPage,
    ticketsPaginationTableQuery,
  ]);
  

  const getHelpdeskTicketsData = (
    currentPage: number,
    assignedTo?: number | null,
    status?: string,
    query?: string,
  ) => {
    let apiEndpoint = `api/helpdesk/s/${userId}?perPage=${ticketsItemsPerPage}&page=${currentPage}`;

    if (ticketsPaginationTableQuery) {
      apiEndpoint += `&query=${encodeURIComponent(ticketsPaginationTableQuery)}`;
    }

    if (assignedTo !== undefined && assignedTo !== null) {
      apiEndpoint += `&assignedTo=${assignedTo}`;
    }

    if (status) {
      apiEndpoint += `&status=${status}`;
    }

    api(apiEndpoint, "get", {}, role as UserRole).then((res: ApiResponse) => {
      if (res.status === "error") {
        warning.notification("Greška prilikom učitavanja podataka, molimo pokušate ponovo!");
        return;
      }
      if (res.status === "forbidden") {
        warning.notification("Korisnik nema prava za učitavanja ove vrste podataka!");
        return;
      }
      setHelpdeskState(res.data.results);
      const totalCount: number = res.data.total;
      const totalPages: number = Math.ceil(totalCount / ticketsItemsPerPage);
      setTicketsTotalPage(totalPages);
    });
  };

  const handleSearchChange = (query: string) => {
    setTicketsPaginationTableQuery(query);
  };

  const handlePageChange = (page: number) => {
    if (selectedTab === "unassigned") {
      setUnassignedTicketsCurrentPage(page);
    } else if (selectedTab === "assigned") {
      setAssignedTicketsCurrentPage(page);
    } else if (selectedTab === "solved") {
      setSolvedTicketsCurrentPage(page);
    } else if (selectedTab === "all") {
      setAllTicketsCurrentPage(page);
    }
  };  

  function colorStatus(status: string) {
    let color;
    if (status === "otvoren") {
      color = "volcano";
    } else if (status === "izvršenje") {
      color = "gold";
    } else if (status === "zatvoren") {
      color = "green";
    } else {
      color = "error";
    }
    return color;
  }
  
  function actions(ticketId: number) {
    return (
      <div className="relative flex items-center gap-2">
        <Tooltip title="Pregledaj">
          <span
            className="cursor-pointer p-1 text-lg text-default-600 active:opacity-50"
            onClick={() => navigate(`/admin/helpdesk/${ticketId}`)} 
          >
            <i className="bi bi-eye" />
          </span>
        </Tooltip>
      </div>
    );
  } 

  // Funkcija za paginaciju
  const tableBottomContent = (
    currentPage: number,
    setPageFunction: (page: number) => void,
  ) => {
    return (
      <div className="mt-3 flex justify-center">
        <Pagination
          current={currentPage}
          pageSize={ticketsItemsPerPage}
          total={ticketsTotalPage * ticketsItemsPerPage}
          onChange={(page) => handlePageChange(page)}
          showQuickJumper
        />
      </div>
    );
  };


  const tableTopContent = () => {
    return (
      <Input
        placeholder="Pronađi tiket..."
        allowClear
        prefix={<i className="bi bi-search text-default-500" />}
        onPressEnter={(e:any) => handleSearchChange(e.target.value)}
      />
    );
  };

  const renderTicketTable = (currentPage: number) => {
    return (
      <div className="w-full overflow-x-auto">
        <Table
          columns={[
            { title: "#", dataIndex: "ticketId", width:60 },
            { title: "Prijavio/la", render: (record) => (record.user.fullname), width:200 },
            { title: "Opis tiketa", dataIndex: "description", ellipsis:true, width:150 },
            { title: "Grupa", render: (record) => (record.group.groupName), width:150},
            { title: "Datum prijave", dataIndex: "createdAt", render: (text) => Moment(text).format("DD.MM.YYYY - HH:mm"), width:150 },
            { title: "Datum izvršetka", dataIndex: "duoDate", render: (text) => text ? Moment(text).format("DD.MM.YYYY - HH:mm") : '', width:150 },
            { title: "Status", dataIndex: "status", render: (text) => <Tag color={colorStatus(text)}>{text}</Tag>, width:80},
            { title: "Izvršava zadatak", render: (record) => (record.assignedTo2?.fullname || ''), width:200},
            { title: "Akcije", dataIndex: "ticketId", render: (text) => actions(text), width:70, className:"flex flex-col items-center" },
          ]}
          dataSource={helpdeskState}
          pagination={false}
          title={tableTopContent}
          footer={() => tableBottomContent(currentPage, setAssignedTicketsCurrentPage)}
          tableLayout="fixed"
        />
      </div>
    );
  };

  return (
    <Card>
        <Tabs defaultActiveKey="unassigned" onChange={(key) => setSelectedTab(key)}>
          <TabPane tab="Svi" key="all">
            {renderTicketTable(allTicketCurrentPage)}
          </TabPane>
          <TabPane tab="Nepreuzeti" key="unassigned">
            {renderTicketTable(unassignedTicketCurrentPage)}
          </TabPane>
          <TabPane tab="Moji preuzeti" key="assigned">
            {renderTicketTable(assignedTicketCurrentPage)}
          </TabPane>
          <TabPane tab="Moji završeni" key="solved">
            {renderTicketTable(solvedTicketCurrentPage)}
          </TabPane>
        </Tabs>
    </Card>
  );
};

export default HelpdeskTicketPage;
