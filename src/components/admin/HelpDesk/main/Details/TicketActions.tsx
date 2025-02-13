import { useEffect, useState } from "react";
import { Select, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import TicketGroupType from "../../../../../types/TicketGroupType";
import UserType from "../../../../../types/UserType";
import ModeratorGroupMappingType from "../../../../../types/ModeratorGroupMappingType";
import { ApiResponse, useApi } from "../../../../../API/api";

interface TicketActionsProps {
  ticketId: number;
  isDisabled?: boolean;
}

const TicketActions: React.FC<TicketActionsProps> = ({ ticketId, isDisabled }) => {
  const [groupState, setGroupState] = useState<TicketGroupType[]>([]);
  const [groupUsers, setGroupUsers] = useState<UserType[]>([]);
  const [groupParent, setGroupParent] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedGroupParent, setSelectedGroupParent] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const {api} = useApi()

  useEffect(() => {
    if (selectedGroup) {
      const filteredUsers = groupState
        .filter((group) => group.groupId === selectedGroup)
        .flatMap((group) => {
          const moderatorMappings: ModeratorGroupMappingType[] | undefined = group.moderatorGroupMappings;
          return moderatorMappings ? moderatorMappings.map((mapping) => mapping.user as UserType) : [];
        });
      setGroupUsers(filteredUsers);

      const filteredParentGroup = groupState
        .filter((group) => group.groupId === selectedGroup)
        .flatMap((group) => group.ticketGroups || []);
      setGroupParent(filteredParentGroup);
    }
  }, [selectedGroup, groupState]);

  const handleGroupChange = (value: number) => {
    setSelectedGroup(value);
  };

  const handleGroupParentChange = (value: number) => {
    setSelectedGroupParent(value);
  };

  const handleUserChange = (value: number) => {
    setSelectedUser(value);
  };

  useEffect(() => {
    getAllModeratorsInGroup()
  }, [])

  const getAllModeratorsInGroup = () => {
    setIsLoading(true);
    api("/api/ticket/group", "get", {})
      .then((res: ApiResponse) => {
        if (res.status === "login") {
          navigate("/login");
          message.error("Korisnik nije prijavljen!");
          return;
        }
        if (res.status === "error" || res.status === "forbidden") {
          message.error("Greška prilikom učitavanja podataka!");
          return;
        }
        setGroupState(res.data);
      })
      .finally(() => setIsLoading(false));
  };

  const doEditTicket = async () => {
    setIsLoading(true);
    try {
      await api(`/api/helpdesk/${ticketId}`, "put", {
        groupId: selectedGroup,
        groupPartentId: selectedGroupParent,
        assignedTo: selectedUser,
        status: "izvršenje",
      });
      message.success("Tiket uspešno izmenjen");
    } catch (error) {
      message.error("Došlo je do greške: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-3">
      <Select
        disabled={isDisabled}
        placeholder="Odaberite grupu"
        onChange={handleGroupChange}
        value={selectedGroup || undefined}
        loading={isLoading}
      >
        {groupState
          .filter((group) => group.parentGroupId === null)
          .map((group) => (
            <Select.Option key={group.groupId} value={group.groupId}>
              {group.groupName}
            </Select.Option>
          ))}
      </Select>
      {selectedGroup && (
        <Select
          placeholder="Odaberite vrstu zahteva"
          onChange={handleGroupParentChange}
          value={selectedGroupParent || undefined}
        >
          {groupParent.map((group) => (
            <Select.Option key={group.groupId} value={group.groupId}>
              {group.groupName}
            </Select.Option>
          ))}
        </Select>
      )}
      {selectedGroup && (
        <Select
          placeholder="Odaberite korisnika"
          onChange={handleUserChange}
          value={selectedUser || undefined}
        >
          {groupUsers.map((user) => (
            <Select.Option key={user.userId} value={user.userId}>
              {user.fullname}
            </Select.Option>
          ))}
        </Select>
      )}
      <Button
        type="primary"
        disabled={!selectedGroupParent}
        onClick={doEditTicket}
      >
        Proslijedi zahtjev
      </Button>
    </div>
  );
};

export default TicketActions;
