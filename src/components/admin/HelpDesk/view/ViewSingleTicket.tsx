import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  Tabs,
  Avatar,
  Divider,
  Spin,
  Descriptions,
} from "antd";
import HelpdeskTicketsType from "../../../../types/HelpdeskTicketsType";
import Moment from "moment";
import { useUserContext } from "../../../UserContext/UserContext";
import { UserRole } from "../../../../types/UserRoleType";
import { ApiResponse, useApi } from "../../../../API/api";
import { useNavigate } from "react-router-dom";
import TabPane from "antd/es/tabs/TabPane";
import { useNotificationContext } from "../../../Notification/NotificationContext";

type ModalProps = {
  show: boolean;
  onHide: () => void;
  data: HelpdeskTicketsType[];
  ticketId: number;
};

interface AddNewComment {
  text: string;
  ticketId: number;
  userId: number;
  reply: {
    text?: string;
    ticketId?: number;
    userId?: number;
  };
}

const ViewSingleTicketModal: React.FC<ModalProps> = ({
  show,
  onHide,
  data,
  ticketId,
}) => {
  const { role, userId } = useUserContext();
  const {error, success, warning} = useNotificationContext();
  const [ticketState, setTicketState] = useState<HelpdeskTicketsType>();
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { api } = useApi();
  const [addNewCommentReplyState, setAddNewCommentReplyState] =
    useState<AddNewComment>({
      text: "",
      ticketId: 0,
      userId: 0,
      reply: {},
    });
  const navigate = useNavigate();

  useEffect(() => {
    if (show && data) {
      const selectedTicket = data.find((ticket) => ticket.ticketId === ticketId);
      setTicketState(selectedTicket);
    }
  }, [show, data, ticketId]);

  const handleReplyClick = (commentId: any) => {
    setSelectedCommentId((prev) => (prev === commentId ? null : commentId));
  };

  const doAddNewReply = async (commentId: number) => {
    try {
      setIsLoading(true);
      await api(
        `api/comment/reply/${commentId}`,
        "post",
        {
          text: addNewCommentReplyState.reply?.text,
          ticketId: ticketId,
          userId: userId,
        },
        role as UserRole
      )
        .then((res: ApiResponse) => {
          if (res.status === "login") {
            return navigate("/login");
          }

          if (res.status === "forbidden") {
            warning.notification("Korisnik nema dovoljno prava")
            return;
          }
        })
        .finally(() => {
          setSelectedCommentId(null);
          success.notification('Uspješno ste odgovorili na traženu informaciju')
          setAddNewCommentReplyState((prev) => ({ ...prev, reply: { text: "" } }));
          setIsLoading(false);
        });
    } catch (err:any) {
      error.notification(err.data.message)
    }
  };

  const totalComments = () => {
    let total = ticketState?.comments?.length || 0;
    const replies = (ticketState?.comments || []).map((comment) => comment?.comments?.length || 0);
    if (replies.length > 0) {
      total += replies.reduce((acc, curr) => acc + curr, 0);
    }
    return total;
  };

  const formatDateTime = (dateTimeString: Date) => {
    const now = new Date();
    const pastDate = new Date(dateTimeString);
    const timeDifference = now.getTime() - pastDate.getTime();

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return <span>prije nekoliko trenutaka</span>;
    else if (minutes < 60) return <span>prije {minutes} minuta</span>;
    else if (hours < 24) return <span>prije {hours} sati</span>;
    else if (days < 7) return <span>prije {days} dana</span>;
    else return <span>{pastDate.toLocaleDateString()}</span>;
  };

  return (
    <Modal
      open={show}
      width={800}
      style={{top:20}}
      title={`Tiket #${ticketState?.ticketId}`}
      loading={isLoading}
      footer={[
        <Button key="cancel" onClick={onHide}>
          Cancel
        </Button>,
      ]}
    >
      <Tabs defaultActiveKey="1">
      <TabPane tab="Detalji tiketa" key="1">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Grupa">{ticketState?.group?.groupName}</Descriptions.Item>
          <Descriptions.Item label="Vrsta zahtjeva">{ticketState?.groupPartent?.groupName}</Descriptions.Item>
          <Descriptions.Item label="Datum prijave">{Moment(ticketState?.createdAt).format("DD.MM.YYYY - HH:mm")}</Descriptions.Item>
          <Descriptions.Item label="Željeni datum rješenja">{Moment(ticketState?.clientDuoDate).format("DD.MM.YYYY - HH:mm")}</Descriptions.Item>
          {ticketState?.status === "zatvoren" && (
            <Descriptions.Item label="Datum rješenja tiketa">{Moment(ticketState?.resolveDate).format("DD.MM.YYYY - HH:mm")}</Descriptions.Item>
          )}
          {ticketState?.status !== "otvoren" && (
            <Descriptions.Item label="Tiket preuzeo">{ticketState?.assignedTo2?.fullname}</Descriptions.Item>
          )}
          <Descriptions.Item label="Opis problema">{ticketState?.description}</Descriptions.Item>
          {ticketState?.status === "zatvoren" && (
            <Descriptions.Item label="Rješenje problema">{ticketState?.resolveDescription}</Descriptions.Item>
          )}
        </Descriptions>
      </TabPane>

      <TabPane tab="Detalji opreme" key="2" disabled={ticketState?.article?.articleId === null}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Naziv">{ticketState?.article?.stock?.name}</Descriptions.Item>
          <Descriptions.Item label="Inventurni broj">{ticketState?.article?.invNumber}</Descriptions.Item>
          <Descriptions.Item label="Serijski broj">{ticketState?.article?.serialNumber}</Descriptions.Item>
        </Descriptions>
      </TabPane>

        <TabPane tab={`Informacija (${totalComments()})`} key="3" disabled={totalComments() === 0}>
          {isLoading ? (
            <Spin size="large" />
          ) : (
            <div className="space-y-4">
              {conversation()}
            </div>

          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
  function conversation() {
    return isLoading ? (
      <div className="flex items-center justify-center">
        <Spin  />
      </div>
    ) : (
      <div className="w-full">
        {ticketState?.comments
          ? ticketState?.comments
              .filter((comment) => !comment.parentCommentId)
              .map((comment, index) => (
                <div>
                  <div
                    id="kontejner-komentara"
                    className="mb-2 flex justify-end"
                  >
                    <div id="komentar" className=" flex w-full flex-row">
                      <div className="lg:w-full">
                        <div className="mb-1 flex flex-row">
                          <div
                            id="avatar-komentara"
                            className="mr-3 flex items-center"
                          >
                            <Avatar
                            >{combineFirstLetters(
                              comment.user?.surname || "",
                              comment.user?.forname || "",
                            )}</Avatar>
                          </div>
                          <div className="grid w-full grid-flow-row rounded-xl bg-default-900 p-3 text-sm shadow">
                            <div className="flex h-full justify-between">
                              <span className="text-sm font-bold">
                                {comment?.user?.fullname}
                              </span>
                              <a
                                onClick={() =>
                                  handleReplyClick(comment?.commentId!)
                                }
                              >
                                <span className="ml-2 cursor-pointer text-sm">
                                  Odgovori
                                </span>
                              </a>
                            </div>
                            <Divider className="my-1" />
                            <div className="w-full">{comment?.text}</div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <span className="mr-2 text-tiny">
                            {formatDateTime(comment.createdAt!)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`col-span-12 ${selectedCommentId === comment?.commentId ? "inline" : "hidden"}`}
                    id="reply"
                  >
                    <Input.TextArea
                      value={addNewCommentReplyState.reply?.text}
                      onChange={(e) =>
                        setAddNewCommentReplyState({ ...addNewCommentReplyState, reply: { text: e.target.value } })
                      }
                      placeholder="Upišite odgovor"
                    />

                    <div className="mb-2 flex justify-end">
                      <Button
                        color="primary"
                        className="mt-2"
                        onClick={() => doAddNewReply(comment?.commentId!)}
                      >
                        Odgovori
                      </Button>
                    </div>
                  </div>
                  {comment?.comments ? (
                    comment.comments.map((replies) => (
                      <div
                        id="kontejner-odgovora-komentara"
                        className="mb-2 flex justify-end"
                      >
                        <div
                          id="replies"
                          className="flex w-full flex-row justify-end"
                        >
                          <div className="lg:w-full">
                            <div className="flex flex-row">
                              <div className="grid w-full grid-flow-row rounded-xl bg-default text-black p-3 text-sm shadow">
                                <span className="text-sm font-bold text-default-700">
                                  {replies.user?.fullname}
                                </span>
                                <Divider className="my-1 border-black" />
                                <div className="w-full">{replies.text}</div>
                              </div>
                              <div
                                id="avatar-odgovora-komentara"
                                className="ml-3 flex items-center"
                              >
                                <Avatar
                                >{combineFirstLetters(
                                  replies.user?.surname || "",
                                  replies.user?.forname || "",
                                )}</Avatar>
                              </div>
                            </div>
                            <div className="text-tiny">{formatDateTime(replies.createdAt!)}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div></div>
                  )}
                </div>
              ))
          : []}
      </div>
    );
  }


  function combineFirstLetters(surname: string, forname: string) {
    const inicialLetters =
      surname.charAt(0).toUpperCase() + forname.charAt(0).toUpperCase();
    return inicialLetters;
  }
};

export default ViewSingleTicketModal;
