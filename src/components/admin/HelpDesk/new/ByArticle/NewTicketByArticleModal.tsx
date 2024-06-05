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
  DatePicker,
} from "@nextui-org/react";
import { UserRole } from "../../../../../types/UserRoleType";
import api, { ApiResponse } from "../../../../../API/api";
import { useUserContext } from "../../../../UserContext/UserContext";
import { useNavigate } from "react-router-dom";
import TicketGroupType from "../../../../../types/TicketGroupType";
import Toast from "../../../../custom/Toast";
import {now, getLocalTimeZone, DateValue } from "@internationalized/date";

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

interface MessageType {
  message: {
    message: string;
    variant: string;
  };
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
  const [message, setMessage] = useState<MessageType>({
    message: { message: "", variant: "" },
  });
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
            setErrorMessage("Korisnik nema pravo za izmejne!", "danger");
          }
          setErrorMessage(
            `Uspješno ste prijavili tiket: #${res.data.ticketId}`,
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

  const getParentGroupData = () => {
    api(
      `api/ticket/group/parent/${addNewTicketState?.groupId}`,
      "get",
      {},
      role as UserRole,
    ).then((res: ApiResponse) => {
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
      setParentGroupState(res.data);
    });
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
              <DatePicker 
              onChange={handleDatePickerChange}
              label="Željeni datum rješenja"
              showMonthAndYearPickers
              hideTimeZone
              defaultValue={now(getLocalTimeZone())} />
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

export default NewTicketByArticleModal;
