import React, { useEffect, useState } from "react";
import ArticleType from "../../../../../types/ArticleType";
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
} from "@nextui-org/react";
import { UserRole } from "../../../../../types/UserRoleType";
import api, { ApiResponse } from "../../../../../API/api";
import { useUserContext } from "../../../../UserContext/UserContext";
import { useNavigate } from "react-router-dom";
import TicketGroupType from "../../../../../types/TicketGroupType";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type ModalProps = {
  show: boolean;
  onHide: () => void;
  data?: ArticleType;
};

interface AddNewTicketState {
  userId?: number;
  articleId?: number;
  groupId?: number;
  description?: string | null;
  clientDuoDate?: Date | null;
  groupPartentId?: number | null;
}

const NewTicketByArticleModal: React.FC<ModalProps> = ({
  show,
  onHide,
  data,
}) => {
  const [addNewTicketState, setAddNewTicketState] =
    useState<AddNewTicketState>();
  const [parentGroupState, setParentGroupState] = useState<TicketGroupType[]>(
    [],
  );

  const { role } = useUserContext();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const putArticleDetailsInState = async () => {
    setAddNewTicketState({
      userId: data?.userId,
      articleId: data?.articleId,
      groupId: data?.category?.group?.groupId,
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

  useEffect(() => {
    if (show) {
      putArticleDetailsInState();
    }
    if (addNewTicketState?.groupId) {
      getParentGroupData();
    }
  }, [show, addNewTicketState?.groupId]);

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

  const getParentGroupData = () => {
    api(
      `api/ticket/group/parent/${addNewTicketState?.groupId}`,
      "get",
      {},
      role as UserRole,
    ).then((res: ApiResponse) => {
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
      setParentGroupState(res.data);
    });
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
        <ModalHeader>{data?.stock?.name}</ModalHeader>
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
                value={data?.user?.fullname}
              />
              <Input
                label="Artikal"
                labelPlacement="inside"
                value={data?.stock?.name}
              />
              <Input
                label="Grupa"
                labelPlacement="inside"
                value={data?.category?.group?.groupName}
              />
              <Select
                id="groupId"
                label="Vrsta zahtjeva"
                placeholder="Odaberite vrstu zahtjeva"
                value={addNewTicketState?.groupId}
                onChange={(value) =>
                  setAddNewTicketFieldState(
                    "groupPartentId",
                    value.target.value,
                  )
                }
              >
                {parentGroupState.map((group, index) => (
                  <SelectItem
                    key={group.groupId || index}
                    textValue={`${group.groupId} - ${group.groupName}`}
                    value={Number(group.groupId)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className="text-small">{group.groupName}</span>
                        <span className="text-tiny text-default-400">
                          {group.location?.name}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
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

export default NewTicketByArticleModal;
