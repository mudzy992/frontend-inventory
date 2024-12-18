import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  Select,
  SelectItem,
  Spinner, 
  DatePicker,
} from "@nextui-org/react";
import { UserRole } from "../../../../../types/UserRoleType";
import api, { ApiResponse } from "../../../../../API/api";
import { useUserContext } from "../../../../UserContext/UserContext";
import { useNavigate } from "react-router-dom";
import TicketGroupType from "../../../../../types/TicketGroupType";
import Toast from "../../../../custom/Toast";
import {now, getLocalTimeZone, DateValue, parseDate } from "@internationalized/date";
import ArticleType from "../../../../../types/ArticleType";
import moment from "moment";

type ModalProps = {
  show: boolean;
  onHide: () => void;
  userID?: number;
};

interface AddNewTicketState {
  userId?: number;
  articleId?: number | null;
  groupId?: number | null;
  description?: string | null;
  clientDuoDate?: Date | null;
  groupPartentId?: number | null;
}

interface MessageType {
  message: {
    message: string;
    variant: string;
  };
}

const NewTicketWithoutArticle: React.FC<ModalProps> = ({
  show,
  onHide,
  userID,
}) => {
  const [addNewTicketState, setAddNewTicketState] =
    useState<AddNewTicketState>();
  const [groupsState, setGroupsState] = useState<TicketGroupType[]>();
  const [userArticles, setUserArticles] = useState<ArticleType[]>([]);
  const [groupsTypeState, setGroupsTypeState] = useState<TicketGroupType[]>();
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [clientDuoDate, setClientDuoDate] = useState(parseDate("2024-04-04"));
  const [loading, setLoading] = useState<boolean>(false);
  const { role } = useUserContext();
  const navigate = useNavigate();
  const [message, setMessage] = useState<MessageType>({
    message: { message: "", variant: "" },
  });
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const putArticleDetailsInState = async () => {
    setAddNewTicketState({
      userId: userID,
      articleId: null,
      groupId: null,
      description: null,
      clientDuoDate: moment(clientDuoDate).format('YYYY-MM-DD'),
      groupPartentId: null,
    });
  };

  const setAddNewTicketFieldState = (
    fieldName: keyof AddNewTicketState,
    newValue: any,
  ) => {
    setAddNewTicketState((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  };

  const setErrorMessage = (message: string, variant: string) => {
    setMessage((prev) => ({
      ...prev,
      message: { message, variant },
    }));
  };

  const resetMessage = () => {
    setMessage((prev) => ({
      ...prev,
      message: { message: "", variant: "" },
    }));
  };

  const handleDatePickerChange = (newValue: DateValue) => {
    const dateStr = newValue.toString();
    const cleanDateStr = dateStr.split('[')[0];
    const date = new Date(cleanDateStr);
    setAddNewTicketFieldState("clientDuoDate", date);
  };

  const handleArticleChange = (value: React.ChangeEvent<HTMLSelectElement>) => {
    setAddNewTicketFieldState("articleId", Number(value.target.value));
  };

  const handleGroupChange = (value: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(Number(value.target.value));
    setAddNewTicketFieldState("groupId", value.target.value);
  };

  const handleGroupTypeChange = (
    value: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setAddNewTicketFieldState("groupPartentId", value.target.value);
  };

  useEffect(() => {
    if (show) {
      putArticleDetailsInState();
      getGroupsData();
      getUserArticles()
    }
  }, [show]);

  useEffect(() => {
    if (selectedGroup) {
      const filteredGroups = groupsState?.filter(
        (group) => group.parentGroupId === selectedGroup,
      );
      setGroupsTypeState(filteredGroups);
    } else {
      setGroupsTypeState([]);
    }
  }, [selectedGroup, groupsState]);

  useEffect(() => {
    if (
      addNewTicketState?.groupPartentId &&
      addNewTicketState?.description &&
      addNewTicketState?.clientDuoDate
    ) {
      return setIsVisible(false);
    } else {
      return setIsVisible(true);
    }
  }, [
    addNewTicketState?.clientDuoDate,
    addNewTicketState?.groupPartentId,
    addNewTicketState?.description,
  ]);

  const doAddTicket = async () => {
    try {
      setLoading(true);
      await api(`api/helpdesk/`, "post", addNewTicketState, role as UserRole)
        .then((res: ApiResponse) => {
          if (res.status === "login") {
            return navigate("/login");
          }

          if (res.status === "forbidden") {
            setErrorMessage("Korisnik nema pravo za izmejne!", "danger");
          }
          setErrorMessage(
            `Uspješno ste prijavili tiket #${res.data.ticketId}`,
            "success",
          );
          putArticleDetailsInState();
        })
        .finally(() => setLoading(false));
    } catch (error) {
      setErrorMessage(
        "Došlo je do greške prilikom izmjene tiketa. Greška: " + error,
        "danger",
      );
    }
  };

  const getGroupsData = () => {
    setLoading(true);
    api(`api/ticket/group/`, "get", {}, role as UserRole)
      .then((res: ApiResponse) => {
        if (res.status === "login") {
          setErrorMessage(
            "Greška prilikom učitavanja podataka. Korisnik nije prijavljen!",
            "danger",
          );
          return;
        }
        if (res.status === "error") {
          setErrorMessage(
            "Greška prilikom učitavanja podataka, molimo pokušajte ponovo!",
            "danger",
          );
          return;
        }
        if (res.status === "forbidden") {
          setErrorMessage(
            "Korisnik nema prava za učitavanje ove vrste podataka!",
            "danger",
          );
          return;
        }
        setGroupsState(res.data);
      })
      .finally(() => setLoading(false));
  };

  const getUserArticles = async () => {
    setLoading(true);
    api(`api/article/user/${userID}`, 'get', undefined, role as UserRole)
      .then((res: ApiResponse) => {
        if (res.status === "login") {
          setErrorMessage(
            "Greška prilikom učitavanja podataka. Korisnik nije prijavljen!",
            "danger",
          );
          return;
        }
        if (res.status === "error") {
          setErrorMessage(
            "Greška prilikom učitavanja podataka, molimo pokušajte ponovo!",
            "danger",
          );
          return;
        }
        if (res.status === "forbidden") {
          setErrorMessage(
            "Korisnik nema prava za učitavanje ove vrste podataka!",
            "danger",
          );
          return;
        }
        setUserArticles(res.data);
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Toast
        variant={message.message.variant}
        message={message.message.message}
        onClose={resetMessage}
      />
      <Modal
        isOpen={show}
        onOpenChange={onHide}
        backdrop="blur"
        size={"xl"}
        isDismissable={false}
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Novi tiket</ModalHeader>
          <ModalBody>
            {loading ? (
              <div className="flex items-center justify-center">
                <Spinner
                  label="Učitavanje..."
                  labelColor="warning"
                  color="warning"
                />
              </div>
            ) : (
              <>
{/*                 <Input
                  label="Korisnik"
                  labelPlacement="inside"
                  value={data?.fullname}
                /> */}
                <Select
                  id="groupId"
                  label="Grupa"
                  placeholder="Odaberite grupu"
                  value={
                    addNewTicketState?.groupId === null
                      ? ""
                      : addNewTicketState?.groupId
                  }
                  onChange={handleGroupChange}
                >
                  {groupsState
                    ? groupsState
                        .filter((group) => group.parentGroupId === null)
                        .map((group, index) => (
                          <SelectItem
                            key={group.groupId || index}
                            textValue={`${group.groupId} - ${group.groupName}`}
                            value={Number(group.groupId)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <span className="text-small">
                                  {group.groupName}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                    : []}
                </Select>

                {selectedGroup ? (
                  <Select
                    id="parentGroupId"
                    label="Vrsta zahtjeva"
                    placeholder="Odaberite vrstu zahtjeva"
                    onChange={handleGroupTypeChange}
                    selectedKeys={
                      addNewTicketState?.groupPartentId
                        ? [`${addNewTicketState.groupPartentId}`]
                        : []
                    }
                  >
                    {groupsTypeState
                      ? groupsTypeState.map((group) => (
                          <SelectItem
                            key={Number(group.groupId)}
                            textValue={`${group.groupId} - ${group.groupName}`}
                            value={Number(group.groupId)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <span className="text-small">
                                  {group.groupName}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      : []}
                  </Select>
                ) : (
                  <div></div>
                )}
                <Select
                  label="Oprema"
                  labelPlacement="inside"
                  value={
                    addNewTicketState?.articleId === null
                      ? ""
                      : addNewTicketState?.articleId
                  }
                  selectedKeys={
                    addNewTicketState?.articleId
                      ? [`${addNewTicketState?.articleId}`]
                      : []
                  }
                  onChange={handleArticleChange}
                >
                  {userArticles
                    ? userArticles.map((article) => (
                        <SelectItem
                          key={Number(article?.articleId)}
                          textValue={article?.stock?.name}
                          value={Number(article?.articleId)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <span className="text-small">
                                {article?.stock?.name}
                              </span>
                              <span className="text-tiny text-default-400">
                                {article.category?.name}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    : []}
                </Select>

                <Textarea
                  label="Opis zahtjeva"
                  placeholder="Opišite vaš problem"
                  value={
                    addNewTicketState?.description === null
                      ? ""
                      : addNewTicketState?.description
                  }
                  onValueChange={(value: string) =>
                    setAddNewTicketFieldState("description", value)
                  }
                />
               <DatePicker 
                onChange={setClientDuoDate}
                label="Željeni datum rješenja"
                showMonthAndYearPickers
                hideTimeZone 
                value={clientDuoDate} />
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              isDisabled={isVisible}
              color="success"
              onClick={() => doAddTicket()}
            >
              Prijavi
            </Button>
            <Button color="danger" onPress={onHide}>
              Zatvori
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NewTicketWithoutArticle;
