import React, { Key, useEffect, useState } from "react";
import { ApiResponse, useApi } from "../../../../API/api";
import { useUserContext } from "../../../Contexts/UserContext/UserContext";
import { UserRole } from "../../../../types/UserRoleType";
import {
  Chip,
  Input,
  Pagination,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  Tooltip,
} from "@nextui-org/react";
import Moment from "moment";
import ModalDetails from "./ModalDetails";
import HelpdeskTicketsType from "../../../../types/HelpdeskTicketsType";
import { useNavigate } from "react-router-dom";
import Toast from "../../../custom/Toast";

interface MessageType {
  message: {
    message: string;
    variant: string;
  }
}

const HelpdeskTicketPage: React.FC = () => {
  const { api } = useApi();
  const { role, userId } = useUserContext();
  const [helpdeskState, setHelpdeskState] = useState<HelpdeskTicketsType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [message, setMessage] = useState<MessageType>({message: {message: "", variant: ""}});
  const [selectedTab, setSelectedTab] = useState<string>("unassigned");
  const [ticketsItemsPerPage] = useState<number>(10);
  const [ticketsTotalPage, setTicketsTotalPage] = useState<number>(0);
  const [ticketsPaginationTableQuery, setTicketsPaginationTableQuery] =
    useState<string>("");
  const [unassignedTicketCurrentPage, setUnassignedTicketsCurrentPage] =
    useState<number>(1);
  const [allTicketCurrentPage, setAllTicketsCurrentPage] = useState<number>(1);
  const [assignedTicketCurrentPage, setAssignedTicketsCurrentPage] =
    useState<number>(1);
  const [solvedTicketCurrentPage, setSolvedTicketsCurrentPage] =
    useState<number>(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId !== undefined) {
      let assignedToValue;
      let statusValue;
      let currentPage = Number(1);

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

  const setErrorMessage = (message: string, variant: string) => {
    setMessage((prev) => ({
      ...prev,
      message: { message, variant }
    }));
  };

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
      if (res.status === "login") {
        navigate('/login');
        setErrorMessage(
          "Greška prilikom učitavanja podataka. Korisnik nije prijavljen!", "danger",
        );
        return;
      }
      if (res.status === "error") {
        setErrorMessage(
          "Greška prilikom učitavanja podataka, molimo pokušate ponovo!", "danger",
        );
        return;
      }
      if (res.status === "forbidden") {
        setErrorMessage("Korisnik nema prava za učitavanja ove vrste podataka!", "danger");
        return;
      }
      setHelpdeskState(res.data.results);
      const totalCount: number = res.data.total;
      const totalPages: number = Math.ceil(totalCount / ticketsItemsPerPage);
      setTicketsTotalPage(totalPages);
    });
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleHideModal = () => {
    setShowModal(false);
  };

  const openModalWithArticle = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    handleShowModal();
  };

  const handleSearchChange = (query: string) => {
    setTicketsPaginationTableQuery(query);
  };

  const tableBottomContent = (
    currentPage: number,
    setPageFunction: (page: number) => void,
  ) => {
    return (
      <div className="mt-3 flex justify-center">
        <Pagination
          color="default"
          showControls
          variant="flat"
          disableCursorAnimation
          initialPage={currentPage}
          page={currentPage}
          total={ticketsTotalPage}
          onChange={(page) => setPageFunction(page)}
        />
      </div>
    );
  };

  const tableTopContent = () => {
    return (
      <Input
        placeholder="Pronađi tiket..."
        variant="bordered"
        isClearable
        startContent={<i className="bi bi-search text-default-500" />}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            const target = e.target as HTMLInputElement;
            handleSearchChange(target.value);
          }
        }}
      />
    );
  };

  return (
    <div>
      <div className="container mx-auto mt-3 h-max lg:px-4">
        <div id="kontejner-tiketa" className="flex w-full flex-col gap-3"></div>
        <Tabs
          aria-label="Opcije"
          color="primary"
          radius="full"
          selectedKey={selectedTab}
          onSelectionChange={(key: Key) => setSelectedTab(key as string)}
        >
          <Tab key="all" title="Svi">
            {allTicketsTable()}
          </Tab>
          <Tab key="unassigned" title="Nepreuzeti">
            {unAssignedTickets()}
          </Tab>
          <Tab key="assigned" title="Moji preuzeti">
            {assignedByUserTickets()}
          </Tab>
          <Tab key="solved" title="Moji završeni">
            {assignedByUserSolvedTickets()}
          </Tab>
        </Tabs>
      </div>
      <Toast variant={message.message.variant} message={message.message.message} />
    </div>
  );

  function colorStatus(status: string) {
    let color;
    if (status === "otvoren") {
      return (color = "secondary");
    } else if (status === "izvršenje") {
      return (color = "warning");
    } else if (status === "zatvoren") {
      return (color = "success");
    }
  }

  function actions(ticketId: number) {
    return (
      <div className="relative flex items-center gap-2">
        {/*  <Tooltip content="Preuzmi" showArrow>
              <span className="text-lg text-default-600 cursor-pointer active:opacity-50">
              <i className="bi bi-person-up"/>
              </span>
            </Tooltip> */}
        <Tooltip content="Pregledaj" showArrow>
          <span
            className="cursor-pointer p-1 text-lg text-default-600 active:opacity-50"
            onClick={() => openModalWithArticle(ticketId)}
          >
            <i className="bi bi-eye" />
          </span>
        </Tooltip>
        {/* <Tooltip color="success" content="Zatvori zahtjev" showArrow>
              <span  className="text-lg text-success cursor-pointer active:opacity-50">
                <i className="bi bi-check2-circle" />
              </span>
            </Tooltip> */}
      </div>
    );
  }

  function allTicketsTable() {
    return (
      <div className="w-full">
        <Table
          aria-label="tabla-tiketa"
          isHeaderSticky
          isStriped
          isCompact
          selectionMode="single"
          topContent={tableTopContent()}
          bottomContent={tableBottomContent(
            allTicketCurrentPage,
            setAllTicketsCurrentPage,
          )}
        >
          <TableHeader>
            <TableColumn key="ticketID">#</TableColumn>
            <TableColumn key="prijavio">Prijavio/la</TableColumn>
            <TableColumn key="opis">Opis tiketa</TableColumn>
            <TableColumn key="grupa">Grupa</TableColumn>
            <TableColumn key="datum-prijave">Datum prijave</TableColumn>
            <TableColumn key="datum-izvrsetka">Datum izvršetka</TableColumn>
            <TableColumn key="status">Status</TableColumn>
            <TableColumn key="zaduzeni-korisni">Izvršava zadatak</TableColumn>
            <TableColumn key="action">Akcije</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Svaka čast, svi tiketi su završeni">
            {helpdeskState
              .filter((item) => !!item)
              .map((item) => (
                <TableRow key={item.ticketId}>
                  <TableCell>{item.ticketId}</TableCell>
                  <TableCell>{item.user?.fullname}</TableCell>
                  <TableCell className="w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.description}
                  </TableCell>
                  <TableCell>{item.group?.groupName}</TableCell>
                  <TableCell>
                    {Moment(item.createdAt).format("DD.MM.YYYY - HH:mm")}
                  </TableCell>
                  <TableCell>
                    {item.duoDate
                      ? Moment(item.duoDate).format("DD.MM.YYYY - HH:mm")
                      : ""}
                  </TableCell>
                  <TableCell>
                    <Chip variant="solid" color={colorStatus(item.status!)}>
                      {item.status}
                    </Chip>
                  </TableCell>
                  <TableCell>{item.assignedTo2?.fullname}</TableCell>
                  <TableCell>{actions(item.ticketId!)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <ModalDetails
          show={showModal}
          onHide={handleHideModal}
          ticketId={selectedTicketId!}
        />
      </div>
    );
  }

  function unAssignedTickets() {
    return (
      <div className="w-full">
        <Table
          aria-label="tabla-tiketa"
          isHeaderSticky
          isStriped
          isCompact
          selectionMode="single"
          topContent={tableTopContent()}
          bottomContent={tableBottomContent(
            allTicketCurrentPage,
            setUnassignedTicketsCurrentPage,
          )}
        >
          <TableHeader>
            <TableColumn key="ticketID">#</TableColumn>
            <TableColumn key="prijavio">Prijavio/la</TableColumn>
            <TableColumn key="opis">Opis tiketa</TableColumn>
            <TableColumn key="grupa">Grupa</TableColumn>
            <TableColumn key="datum-prijave">Datum prijave</TableColumn>
            <TableColumn key="datum-izvrsetka">Datum izvršetka</TableColumn>
            <TableColumn key="status">Status</TableColumn>
            <TableColumn key="zaduzeni-korisni">Izvršava zadatak</TableColumn>
            <TableColumn key="action">Akcije</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Svaka čast, svi tiketi su završeni">
            {helpdeskState
              .filter((item) => !!item && item.assignedTo === null)
              .map((item) => (
                <TableRow key={item.ticketId}>
                  <TableCell>{item.ticketId}</TableCell>
                  <TableCell>{item.user?.fullname}</TableCell>
                  <TableCell className="w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.description}
                  </TableCell>
                  <TableCell>{item.group?.groupName}</TableCell>
                  <TableCell>
                    {Moment(item.createdAt).format("DD.MM.YYYY - HH:mm")}
                  </TableCell>
                  <TableCell>
                    {item.duoDate
                      ? Moment(item.duoDate).format("DD.MM.YYYY - HH:mm")
                      : ""}
                  </TableCell>
                  <TableCell>
                    <Chip variant="solid" color={colorStatus(item.status!)}>
                      {item.status}
                    </Chip>
                  </TableCell>
                  <TableCell>{item.assignedTo2?.fullname}</TableCell>
                  <TableCell>{actions(item.ticketId!)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <ModalDetails
          show={showModal}
          onHide={handleHideModal}
          ticketId={selectedTicketId!}
        />
      </div>
    );
  }

  function assignedByUserTickets() {
    return (
      <div className="w-full">
        <Table
          aria-label="tabla-tiketa"
          isHeaderSticky
          isStriped
          isCompact
          selectionMode="single"
          topContent={tableTopContent()}
          bottomContent={tableBottomContent(
            assignedTicketCurrentPage,
            setAssignedTicketsCurrentPage,
          )}
        >
          <TableHeader>
            <TableColumn key="ticketID">#</TableColumn>
            <TableColumn key="prijavio">Prijavio/la</TableColumn>
            <TableColumn key="opis">Opis tiketa</TableColumn>
            <TableColumn key="grupa">Grupa</TableColumn>
            <TableColumn key="datum-prijave">Datum prijave</TableColumn>
            <TableColumn key="datum-izvrsetka">Datum izvršetka</TableColumn>
            <TableColumn key="status">Status</TableColumn>
            <TableColumn key="zaduzeni-korisni">Izvršava zadatak</TableColumn>
            <TableColumn key="action">Akcije</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Svaka čast, svi tiketi su završeni">
            {helpdeskState
              .filter(
                (item) =>
                  !!item &&
                  item.assignedTo === userId &&
                  item.status === "izvršenje",
              )
              .map((item) => (
                <TableRow key={item.ticketId}>
                  <TableCell>{item.ticketId}</TableCell>
                  <TableCell>{item.user?.fullname}</TableCell>
                  <TableCell className="w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.description}
                  </TableCell>
                  <TableCell>{item.group?.groupName}</TableCell>
                  <TableCell>
                    {Moment(item.createdAt).format("DD.MM.YYYY - HH:mm")}
                  </TableCell>
                  <TableCell>
                    {item.duoDate
                      ? Moment(item.duoDate).format("DD.MM.YYYY - HH:mm")
                      : ""}
                  </TableCell>
                  <TableCell>
                    <Chip variant="solid" color={colorStatus(item.status!)}>
                      {item.status}
                    </Chip>
                  </TableCell>
                  <TableCell>{item.assignedTo2?.fullname}</TableCell>
                  <TableCell>{actions(item.ticketId!)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <ModalDetails
          show={showModal}
          onHide={handleHideModal}
          ticketId={selectedTicketId!}
        />
      </div>
    );
  }

  function assignedByUserSolvedTickets() {
    return (
      <div className="w-full">
        <Table
          aria-label="tabla-tiketa"
          isHeaderSticky
          isStriped
          isCompact
          selectionMode="single"
          topContent={tableTopContent()}
          bottomContent={tableBottomContent(
            solvedTicketCurrentPage,
            setSolvedTicketsCurrentPage,
          )}
        >
          <TableHeader>
            <TableColumn key="ticketID">#</TableColumn>
            <TableColumn key="prijavio">Prijavio/la</TableColumn>
            <TableColumn key="opis">Opis tiketa</TableColumn>
            <TableColumn key="grupa">Grupa</TableColumn>
            <TableColumn key="datum-prijave">Datum prijave</TableColumn>
            <TableColumn key="datum-izvrsetka">Datum izvršetka</TableColumn>
            <TableColumn key="status">Status</TableColumn>
            <TableColumn key="zaduzeni-korisni">Izvršava zadatak</TableColumn>
            <TableColumn key="action">Akcije</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Svaka čast, svi tiketi su završeni">
            {helpdeskState
              .filter(
                (item) =>
                  !!item &&
                  item.assignedTo === userId &&
                  item.status === "zatvoren",
              )
              .map((item) => (
                <TableRow key={item.ticketId}>
                  <TableCell>{item.ticketId}</TableCell>
                  <TableCell>{item.user?.fullname}</TableCell>
                  <TableCell className="w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.description}
                  </TableCell>
                  <TableCell>{item.group?.groupName}</TableCell>
                  <TableCell>
                    {Moment(item.createdAt).format("DD.MM.YYYY - HH:mm")}
                  </TableCell>
                  <TableCell>
                    {item.duoDate
                      ? Moment(item.duoDate).format("DD.MM.YYYY - HH:mm")
                      : ""}
                  </TableCell>
                  <TableCell>
                    <Chip variant="solid" color={colorStatus(item.status!)}>
                      {item.status}
                    </Chip>
                  </TableCell>
                  <TableCell>{item.assignedTo2?.fullname}</TableCell>
                  <TableCell>{actions(item.ticketId!)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <ModalDetails
          show={showModal}
          onHide={handleHideModal}
          ticketId={selectedTicketId!}
        />
      </div>
    );
  }
};

export default HelpdeskTicketPage;
