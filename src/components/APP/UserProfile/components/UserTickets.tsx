import React, { useEffect, useState } from "react";
import { Button, Table, Tag, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import Moment from "moment";
import { ApiResponse, useApi } from "../../../../API/api";
import HelpdeskTicketsType from "../../../../types/HelpdeskTicketsType";
import { useUserContext } from "../../../UserContext/UserContext";
import ViewSingleTicketModal from "../../../admin/HelpDesk/view/ViewSingleTicket";
import NewTicketWithoutArticle from "../../../admin/HelpDesk/new/WithoutArticle/NewTicketWithoutArticleModal";

type UserProps = {
  userID: number;
};

const UserTickets: React.FC<UserProps> = ({ userID }) => {
  const { api } = useApi();
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tickets, setTickets] = useState<HelpdeskTicketsType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { userId, role } = useUserContext();

  const getHelpDeskTickets = async () => {
    try {
      setLoading(true);
      const res: ApiResponse = await api(
        `api/helpdesk/${userID}/user-tickets`,
        "get",
        undefined
      );

      if (res.status === "error" || res.status === "login") {
        return navigate("/login");
      }

      if (res.status === "ok") {
        setTickets(res.data);
      }
    } catch (error) {
      console.error("Greška prilikom dohvatanja korisničkih podataka:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userID) {
      getHelpDeskTickets();
    }
  }, [userID]);

  const handleShowViewModal = () => setShowViewModal(true);
  const handleHideViewModal = () => setShowViewModal(false);

  const openViewModalWithArticle = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    handleShowViewModal();
  };

  const handleShowAddModal = () => setShowAddModal(true);
  const handleHideAddModal = () => setShowAddModal(false);

  const statusColor = (status: string) => {
    if (status === "otvoren") return "volcano";
    if (status === "zatvoren") return "green";
    if (status === "izvršenje") return "cyan";
    return "default";
  };

  const ukupno: number = tickets.length || 0;

  const columns= [
    {
      title: "#",
      dataIndex: "ticketId",
      key: "ticketId",
    },
    {
      title: "Opis",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <div style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {text}
        </div>
      ),
    },
    {
      title: "Prijavljeno",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => Moment(text).format("DD.MM.YYYY - HH:mm"),
    },
    {
      title: "Riješeno",
      dataIndex: "resolveDate",
      key: "resolveDate",
      render: (text: string) =>
        text ? Moment(text).format("DD.MM.YYYY - HH:mm") : "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={statusColor(status)}>{status}</Tag>,
    },
    {
      title: "Akcija",
      key: "action",
      render: (_: any, record: { ticketId: number; }) => (
        <Tooltip title="Pregledaj">
          <Button
            icon={<i className="bi bi-eye" />}
            size="small"
            onClick={() => openViewModalWithArticle(record.ticketId)}
          />
        </Tooltip>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "16px" }}>
        <span>Ukupno: {ukupno}</span>
        <Button
          onClick={handleShowAddModal}
          color="primary"
          variant="outlined"
          icon={<i className="bi bi-plus-circle" />}
        >
          Prijavi novi tiket
        </Button>
      </div>

      <Table
        dataSource={tickets.map(ticket => ({
          ...ticket,
          ticketId: ticket.ticketId ?? -1,
        }))}
        loading={loading}
        columns={columns}
        scroll={{ x: "max-content" }}
      />

      <ViewSingleTicketModal
        show={showViewModal}
        onHide={handleHideViewModal}
        ticketId={selectedTicketId!}
        data={tickets}
      />
      <NewTicketWithoutArticle
        show={showAddModal}
        onHide={handleHideAddModal}
        userID={userId}
      />
    </div>
  );
};

export default UserTickets;
