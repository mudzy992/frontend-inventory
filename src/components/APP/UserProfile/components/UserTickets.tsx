import React, { useEffect, useState } from "react";
import {
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  Pagination,
} from "@nextui-org/react";
import Moment from "moment";
import ViewSingleTicketModal from "../../../admin/HelpDesk/view/ViewSingleTicket";
import NewTicketWithoutArticle from "../../../admin/HelpDesk/new/WithoutArticle/NewTicketWithoutArticleModal";
import api, { ApiResponse } from "../../../../API/api";
import { useNavigate } from "react-router-dom";
import HelpdeskTicketsType from "../../../../types/HelpdeskTicketsType";
import { useUserContext } from "../../../UserContext/UserContext";

type UserProps = {
  userID: number
};

const UserTickets: React.FC<UserProps> = ({ userID }) => {
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false)
  const rowsPerPage = 5;
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<HelpdeskTicketsType[]>([])
  const { userId, role } = useUserContext();

  const getHelpDeskTickets = async () => {
      try{
        setLoading(true);
        const res: ApiResponse = await api(`api/helpdesk/${userID}/user-tickets`, 'get', undefined)
  
        if (res.status === "error" || res.status === "login") {
          return navigate("/login");
        }
  
        if (res.status === 'ok'){
          setTickets(res.data)
        }
      } catch (error){
        console.error("Greška prilikom dohvatanja korisničkih podataka:", error);
        throw error
      } finally {
        setLoading(false)
      }
    }
  
    useEffect(() => {
      if(userID){
        getHelpDeskTickets()
      }
    }, [userID])

  const handleShowViewModal = () => {
    setShowViewModal(true);
  };

  const handleHideViewModal = () => {
    setShowViewModal(false);
  };

  const openViewModalWithArticle = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    handleShowViewModal();
  };

  const handleShowAddModal = () => {
    setShowAddModal(true);
  };

  const handleHideAddModal = () => {
    setShowAddModal(false);
  };

  const statusColor = (status: string) => {
    let color;
    if (status === "otvoren") {
      return (color = "secondary");
    } else if (status === "zatvoren") {
      return (color = "success");
    } else if (status === "izvršenje") {
      return (color = "warning");
    }
    return color;
  };

  const ukupno: number = tickets.length || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const topContent = React.useMemo(() => {
    return (
      <div className="flex w-full justify-between pb-4 pr-2">
        <span className="pt-2 text-sm text-default-400">
          Ukupno prijavljenih tiketa: {ukupno}
        </span>
        <Button
          onClick={() => handleShowAddModal()}
          variant="shadow"
          color="warning"
          size="sm"
        >
          Prijavi novi tiket
        </Button>
      </div>
    );
  }, [searchValue, currentPage, tickets]);

  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const paginatedTickets = tickets.slice(startIdx, endIdx) || [];

  const bottomContent = React.useMemo(() => {
    return (
      <div className="flex items-center justify-center px-2 py-2">
        <Pagination
          size="sm"
          showControls
          showShadow
          page={currentPage}
          total={Math.ceil(ukupno / rowsPerPage)}
          onChange={handlePageChange}
        />
      </div>
    );
  }, [tickets.length]);

  return (
    <div>
      <Table
        aria-label="tabela-tiketa"
        isCompact
        isStriped
        topContent={topContent}
        bottomContent={bottomContent}
      >
        <TableHeader>
          <TableColumn>#</TableColumn>
          <TableColumn>Opis</TableColumn>
          <TableColumn>Prijavljeno</TableColumn>
          <TableColumn>Riješeno</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Akcija</TableColumn>
        </TableHeader>
        <TableBody>
          {paginatedTickets.map((ticket) => (
            <TableRow key={ticket.ticketId}>
              <TableCell>{ticket.ticketId}</TableCell>
              <TableCell className="w-[100%] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                {ticket.description}
              </TableCell>
              <TableCell className="w-[150px] max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                {Moment(ticket?.createdAt).format("DD.MM.YYYY - HH:mm")}
              </TableCell>
              <TableCell className="w-[150px] max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                {ticket.resolveDate
                  ? Moment(ticket?.resolveDate).format("DD.MM.YYYY - HH:mm")
                  : ""}
              </TableCell>
              <TableCell>
                <Chip size="sm" color={statusColor(ticket.status!)}>
                  {ticket.status}
                </Chip>
              </TableCell>
              <TableCell>{actions(ticket.ticketId!)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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

  function actions(ticketId: number) {
    return (
      <div className="relative flex items-center gap-2">
        <Tooltip content="Pregledaj" showArrow>
          <span
            className="cursor-pointer p-1 text-lg text-default-600 active:opacity-50"
            onClick={() => openViewModalWithArticle(ticketId)}
          >
            <i className="bi bi-eye" />
          </span>
        </Tooltip>
      </div>
    );
  }
};

export default UserTickets;
