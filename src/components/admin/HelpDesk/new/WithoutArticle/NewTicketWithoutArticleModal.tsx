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
  Tooltip,
  Spinner,
} from "@nextui-org/react";
import { UserRole } from "../../../../../types/UserRoleType";
import api, { ApiResponse } from "../../../../../API/api";
import { useUserContext } from "../../../../UserContext/UserContext";
import { useNavigate } from "react-router-dom";
import TicketGroupType from "../../../../../types/TicketGroupType";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import UserType from "../../../../../types/UserType";

type ModalProps = {
  show: boolean;
  onHide: () => void;
  data?: UserType;
};

interface AddNewTicketState {
  userId?: number;
  articleId?: number | null;
  groupId?: number | null;
  description?: string | null;
  clientDuoDate?: Date | null;
  groupPartentId?: number | null;
}

const NewTicketWithoutArticle: React.FC<ModalProps> = ({
  show,
  onHide,
  data,
}) => {
  const [addNewTicketState, setAddNewTicketState] =
    useState<AddNewTicketState>();
  const [groupsState, setGroupsState] = useState<TicketGroupType[]>();
  const [groupsTypeState, setGroupsTypeState] = useState<TicketGroupType[]>();
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTypeGroup, setSelectedTypeGroup] = useState<number | null>(
    null,
  );
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [parentGroupState, setParentGroupState] = useState<TicketGroupType[]>(
    [],
  );

  const { role } = useUserContext();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const putArticleDetailsInState = async () => {
    setAddNewTicketState({
      userId: data?.userId,
      articleId: null,
      groupId: null,
      description: null,
      clientDuoDate: null,
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

  const handleDatePickerChange = (newValue: Date) => {
    setAddNewTicketFieldState("clientDuoDate", newValue);
  };

  const handleArticleChange = (value: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedArticle(Number(value.target.value));
    setAddNewTicketFieldState("articleId", Number(value.target.value));
  };

  const handleGroupChange = (value: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(Number(value.target.value));
    setAddNewTicketFieldState("groupId", value.target.value);
  };

  const handleGroupTypeChange = (
    value: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedTypeGroup(Number(value.target.value));
    setAddNewTicketFieldState("groupPartentId", value.target.value);
  };

  useEffect(() => {
    if (show) {
      putArticleDetailsInState();
      getGroupsData();
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
            setMessage("Korisnik nema pravo za izmejne!");
          }
          putArticleDetailsInState();
        })
        .finally(() => setLoading(false));
    } catch (error) {
      setMessage(
        "Došlo je do greške prilikom izmjene tiketa. Greška: " + error,
      );
    }
  };

  const getGroupsData = () => {
    setLoading(true);
    api(`api/ticket/group/`, "get", {}, role as UserRole)
      .then((res: ApiResponse) => {
        if (res.status === "login") {
          setMessage(
            "Greška prilikom učitavanja podataka. Korisnik nije prijavljen!",
          );
          return;
        }
        if (res.status === "error") {
          setMessage(
            "Greška prilikom učitavanja podataka, molimo pokušajte ponovo!",
          );
          return;
        }
        if (res.status === "forbidden") {
          setMessage("Korisnik nema prava za učitavanje ove vrste podataka!");
          return;
        }
        setGroupsState(res.data);
      })
      .finally(() => setLoading(false));
  };

  return (
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
              <Input
                label="Korisnik"
                labelPlacement="inside"
                value={data?.fullname}
              />
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
                {data?.articles
                  ? data?.articles.map((article) => (
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
              <div
                className={
                  "grid w-full grid-rows-2 rounded-xl bg-default-100 pb-2 pl-3 pr-3 pt-3"
                }
                style={{ zIndex: 1000 }}
              >
                <span className="text-xs text-default-600">
                  Željeni datum rješenja
                </span>
                <DatePicker
                  className="w-full bg-default-100 text-sm"
                  placeholderText="Odaberite datum"
                  minDate={new Date()}
                  onChange={handleDatePickerChange}
                  startDate={addNewTicketState?.clientDuoDate || null}
                  withPortal
                  selected={addNewTicketState?.clientDuoDate}
                  calendarStartDay={1}
                />
              </div>
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
  );
};

export default NewTicketWithoutArticle;
