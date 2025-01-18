import React, { useEffect, useState } from "react";
import { Button, Input, Modal, Select, Form, Spin, DatePicker } from "antd";
import { UserRole } from "../../../../../types/UserRoleType";
import { useUserContext } from "../../../../Contexts/UserContext/UserContext";
import { useNavigate } from "react-router-dom";
import TicketGroupType from "../../../../../types/TicketGroupType";
import ArticleType from "../../../../../types/ArticleType";
import dayjs from "dayjs";
import { useApi } from "../../../../../API/api";
import { useNotificationContext } from "../../../../Contexts/Notification/NotificationContext";

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
  clientDuoDate?: dayjs.Dayjs | null;
  groupPartentId?: number | null;
}

const NewTicketWithoutArticle: React.FC<ModalProps> = ({ show, onHide, userID }) => {
  const { api } = useApi();
  const { error, success, warning } = useNotificationContext();
  const [addNewTicketState, setAddNewTicketState] = useState<AddNewTicketState>();
  const [groupsState, setGroupsState] = useState<TicketGroupType[]>();
  const [userArticles, setUserArticles] = useState<ArticleType[]>([]);
  const [groupsTypeState, setGroupsTypeState] = useState<TicketGroupType[]>();
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [clientDuoDate, setClientDuoDate] = useState<dayjs.Dayjs | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { role } = useUserContext();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const putArticleDetailsInState = async () => {
    setAddNewTicketState({
      userId: userID,
      articleId: null,
      groupId: null,
      description: null,
      clientDuoDate: null,
      groupPartentId: null,
    });
    setClientDuoDate(null);
  };

  const handleDatePickerChange = (date: dayjs.Dayjs | null) => {
    if (date && date.isValid()) {
      setAddNewTicketState((prev) => ({
        ...prev,
        clientDuoDate: date,
      }));
    } else {
      error.message("Neispravan datum");
    }
  };

  const handleArticleChange = (value: number) => {
    setAddNewTicketState((prev) => ({
      ...prev,
      articleId: value,
    }));
  };

  const handleGroupChange = (value: number) => {
    setSelectedGroup(value);
    setAddNewTicketState((prev) => ({
      ...prev,
      groupId: value,
    }));
  };

  const handleGroupTypeChange = (value: number) => {
    setAddNewTicketState((prev) => ({
      ...prev,
      groupPartentId: value,
    }));
  };

  useEffect(() => {
    if (show) {
      putArticleDetailsInState();
      getGroupsData();
      getUserArticles();
    }
  }, [show]);

  useEffect(() => {
    if (selectedGroup) {
      const filteredGroups = groupsState?.filter(
        (group) => group.parentGroupId === selectedGroup
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
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [
    addNewTicketState?.clientDuoDate,
    addNewTicketState?.groupPartentId,
    addNewTicketState?.description,
  ]);

  const doAddTicket = async () => {
    try {
      setLoading(true);
      const response = await api(`api/helpdesk/`, "post", addNewTicketState, role as UserRole);
      if (response.status === "login") {
        navigate("/login");
        return;
      }

      if (response.status === "forbidden") {
        warning.notification("Korisnik nema pravo za izmene!");
        return;
      }

      success.notification(`Uspješno ste prijavili tiket #${response.data.ticketId}`);
      putArticleDetailsInState();
    } catch (err:any) {
      error.notification(err.data.message);
    } finally {
      setLoading(false);
    }
  };

  const getGroupsData = async () => {
    setLoading(true);
    const response = await api(`api/ticket/group/`, "get", {}, role as UserRole);
    if (response.status === "login") {
      warning.notification("Greška prilikom učitavanja podataka. Korisnik nije prijavljen!");
      return;
    }

    if (response.status === "forbidden") {
      warning.notification("Korisnik nema prava za učitavanje ove vrste podataka!");
      return;
    }

    setGroupsState(response.data);
    setLoading(false);
  };

  const getUserArticles = async () => {
    setLoading(true);
    const response = await api(`api/article/user/${userID}`, "get", undefined, role as UserRole);
    if (response.status === "login") {
      warning.notification("Greška prilikom učitavanja podataka. Korisnik nije prijavljen!");
      return;
    }

    if (response.status === "forbidden") {
      warning.notification("Korisnik nema prava za učitavanje ove vrste podataka!");
      return;
    }

    setUserArticles(response.data);
    setLoading(false);
  };

  return (
    <Modal
      open={show}
      onCancel={onHide}
      title="Novi tiket"
      footer={null}
      width={600}
      destroyOnClose
      style={{top:20}}
    >
      {loading ? (
        <div className="flex justify-center">
          <Spin tip="Učitavanje..." />
        </div>
      ) : (
        <Form
          initialValues={{
            ...addNewTicketState,
            clientDuoDate: addNewTicketState?.clientDuoDate ? dayjs(addNewTicketState.clientDuoDate) : null,
          }}
          onFinish={doAddTicket}
          layout="vertical"
        >
          <Form.Item label="Grupa" name="groupId">
            <Select
              placeholder="Odaberite grupu"
              onChange={handleGroupChange}
              value={addNewTicketState?.groupId}
            >
              {groupsState?.map((group) => (
                <Select.Option key={group.groupId} value={group.groupId}>
                  {group.groupName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedGroup && (
            <Form.Item label="Vrsta zahtjeva" name="groupPartentId">
              <Select
                placeholder="Odaberite vrstu zahtjeva"
                onChange={handleGroupTypeChange}
                value={addNewTicketState?.groupPartentId}
              >
                {groupsTypeState?.map((group) => (
                  <Select.Option key={group.groupId} value={group.groupId}>
                    {group.groupName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item label="Oprema" name="articleId">
            <Select
              placeholder="Odaberite opremu"
              onChange={handleArticleChange}
              value={addNewTicketState?.articleId}
            >
              {userArticles?.map((article) => (
                <Select.Option key={article.articleId} value={article.articleId}>
                  {article.stock?.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Opis zahtjeva" name="description">
            <Input.TextArea
              placeholder="Opišite vaš problem"
              value={addNewTicketState?.description!}
              onChange={(e) =>
                setAddNewTicketState((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </Form.Item>

          <Form.Item label="Željeni datum rješenja" name="clientDuoDate">
            <DatePicker
              value={clientDuoDate ? dayjs(clientDuoDate) : null} 
              onChange={handleDatePickerChange}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              disabled={isVisible}
              loading={loading}
            >
              Prijavi
            </Button>
            <Button onClick={onHide} style={{ marginLeft: "8px" }}>
              Zatvori
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default NewTicketWithoutArticle;
