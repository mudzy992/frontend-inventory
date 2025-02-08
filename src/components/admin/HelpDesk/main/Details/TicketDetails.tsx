import React, { useEffect, useRef, useState } from "react";
import { Button, Checkbox, Col, DatePicker, Descriptions, Form, Input, Row, Select, Tooltip } from "antd";
import dayjs from "dayjs";
import HelpdeskTicketsType from "../../../../../types/HelpdeskTicketsType";
import { useApi } from "../../../../../API/api";
import { useUserContext } from "../../../../Contexts/UserContext/UserContext";

interface TicketDetailsProps {
  helpdeskState: HelpdeskTicketsType | undefined;
  isDisabled?: boolean;
  fetchTicket: () => void;
}

const PriorityList = [
  { id: 1, priority: "Problem veće hitnosti ili VIP korisnik", days: 1 },
  { id: 2, priority: "Problem u radu servisa (za sve korisnike u firmi)", days: 1 },
  { id: 3, priority: "Poteškoće u radu grupe korisnika", days: 5 },
  { id: 4, priority: "Povremene poteškoće u radu grupe korisnika", days: 5 },
  { id: 5, priority: "Poteškoće u radu korisnika", days: 5 },
  { id: 6, priority: "Zahtjevi za izmjenu/doradu manje složenosti", days: 5 },
  { id: 7, priority: "Zahtjevi za izmjenu/doradu veće složenosti", days: 5 },
];

const ResolveResolutionList = [
  { id: 1, resolution: "Nemoguće riješiti ili je u koliziji sa standardom ili politikom" },
  { id: 2, resolution: "Riješen - nije potrebna analiza uzroka" },
  { id: 3, resolution: "Uzrok problema nije otklonjen - privremeno rješenje" },
  { id: 4, resolution: "Zahtjev je povučen od strane korisnika" },
];

const TicketDetails: React.FC<TicketDetailsProps> = ({
  helpdeskState,
  isDisabled,
  fetchTicket
}) => {
    const {api} = useApi()
    const {role, userId} = useUserContext()
    const [form] = Form.useForm();
    const [assigned, setAssigned] = useState<boolean>(false);
    const isTicketAssigned = useRef(false);
    const [closeTicketStatus, setCloseTicketStatus] = useState<boolean>(false)

  useEffect(() => {
    if (helpdeskState) {
      form.setFieldsValue({
        duoDate: helpdeskState?.duoDate ? dayjs(helpdeskState.duoDate) : null, 
        assignedTo: helpdeskState?.assignedTo || null,
        resolveDescription: helpdeskState?.resolveDescription || "",
        status: helpdeskState?.status || "",
        priority: helpdeskState?.priority || null,
        resolveDate: helpdeskState?.resolveDate || undefined,
        resolveResolution: helpdeskState?.resolveResolution || null,
        resolveTimespand: helpdeskState?.resolveTimespand || null,
      });
    }
    if (isTicketAssigned.current) {
      isTicketAssigned.current = false;
    }
  }, [helpdeskState, form]);

  const updateResolvedTimespandFromInput = (value: string) => {
    const resolvedTimespand = helpdeskState?.resolveTimespand;

    if (resolvedTimespand) {
      const newValue = parseInt(resolvedTimespand, 10) + parseInt(value, 10);
      form.setFieldValue("resolveTimespand", newValue)
    }
    if (!resolvedTimespand) {
        form.setFieldValue("resolveTimespand", value)
    }
  };

  const resolvedTimespandDescription = () => {
    const resolvedTimespand = helpdeskState?.resolveTimespand;

    if (resolvedTimespand) {
      const minutes = parseInt(resolvedTimespand, 10);
      const days = Math.floor(minutes / (24 * 60));
      const hours = Math.floor((minutes % (24 * 60)) / 60);
      const remainingMinutes = minutes % 60;

      const descriptionText = `Utrošeno: ${days} dan/a, ${hours} sat/i i ${remainingMinutes} minuta`;
      return descriptionText;
    }
  };

  const handlePriorityChange = (value: string) => {
    const selectedPriorityItem = PriorityList.find(
      (item) => item.priority === value
    );
  
    if (selectedPriorityItem) {
      const calculatedDueDate = calculateDueDate(selectedPriorityItem.days);
  
      if (calculatedDueDate.isValid()) {
        form.setFields([
          { name: "priority", value: value },
          { name: "duoDate", value: calculatedDueDate } 
        ]);
      } else {
        console.error("Calculated due date is invalid!");
      }
    }
  };
  
  const calculateDueDate = (days: number): dayjs.Dayjs => {
    const createdAt = form.getFieldValue('createdAt') ? dayjs(form.getFieldValue('createdAt')) : dayjs(); 
    let dueDate = createdAt;
  
    while (days > 0) {
      dueDate = dueDate.add(1, 'day');
      if (dueDate.day() !== 0 && dueDate.day() !== 6) {
        days--;
      }
    }
  
    return dueDate;
  };

  const updateHelpdeskState = () => {
    if (helpdeskState) {
      // Ažuriraj stanje sa novim vrednostima iz forme
      const updatedState = {
        ...helpdeskState,
        duoDate: form.getFieldValue('duoDate'),
        assignedTo: form.getFieldValue('assignedTo'),
        resolveDescription: form.getFieldValue('resolveDescription'),
        status: form.getFieldValue('status'),
        priority: form.getFieldValue('priority'),
        resolveDate: form.getFieldValue('resolveDate'),
        resolveResolution: form.getFieldValue('resolveResolution'),
        resolveTimespand: form.getFieldValue('resolveTimespand'),
      };
      return updatedState;
    }
    return helpdeskState;
  };
  

  const doEditTicket = async (ticketId: number) => {
    const updatedState = updateHelpdeskState();
    console.log(updateHelpdeskState)
    if (JSON.stringify(updatedState) !== JSON.stringify(helpdeskState)) {
      
        await api(
        `api/helpdesk/${ticketId}`,
        "put",
        updatedState,
        role,
      )
      fetchTicket();
    } else {
      console.log("No changes detected, skipping API call.");
    }
  };

  const handleAssiningTicket = async () => {
    const currentPriority = form.getFieldValue("priority");
    const currentDuoDate = form.getFieldValue("duoDate");
  
    if (!currentPriority || !currentDuoDate) {
      console.log("Missing priority or due date");
      return; // Exit if fields are not filled
    }
  
    const currentStatus = form.getFieldValue("status");
    const currentAssignedTo = form.getFieldValue("assignedTo");
  
    if (currentStatus !== "izvršenje" || currentAssignedTo !== userId) {
      form.setFieldValue("status", "izvršenje");
      form.setFieldValue("assignedTo", userId);
      isTicketAssigned.current = true;
      await doEditTicket(helpdeskState?.ticketId!);
    }
  };
  
  
  const handleCloseTicket = async () => {
    const currentResolveDescription = form.getFieldValue("resolveDescription");
    const currentResolveResolution = form.getFieldValue("resolveResolution");
    const currentResolveTimespand = form.getFieldValue("resolveTimespand");
  
    console.log(currentResolveDescription, currentResolveResolution, currentResolveTimespand);
  
    let hasError = false;
  
    // Provera da li su polja prazna ili null, i postavljanje default vrednosti
    if (!currentResolveDescription || currentResolveDescription === "* Upišite opis rješenja") {
      form.setFieldValue("resolveDescription", "* Upišite opis rješenja");
      hasError = true;
    }
    if (!currentResolveResolution || currentResolveResolution === "* Odaberite rezoluciju rješenja") {
      form.setFieldValue("resolveResolution", "* Odaberite rezoluciju rješenja");
      hasError = true;
    }
    if (!currentResolveTimespand || currentResolveTimespand === "* Upišite utrošeno vrijeme") {
      form.setFieldValue("resolveTimespand", "* Upišite utrošeno vrijeme");
      hasError = true;
    }
  
    // Ako je bilo grešaka, ne ide dalje
    if (hasError) return;
  
    // Ako je sve u redu, zatvori tiket
    const date = new Date();
    if (form.getFieldValue("status") !== "zatvoren") {
      form.setFieldValue("status", "zatvoren");
      form.setFieldValue("resolveDate", date);
      await doEditTicket(helpdeskState?.ticketId!);
    }
  };
  
  
  function changeStatus(status: string) {
    if (status === "otvoren") {
      return (
        <Checkbox
          aria-label="Označi kako bi preuzeo zahtjev"
          checked={assigned}
          onChange={() => setAssigned((prev) => !prev)}
        >
          <Button
            disabled={!assigned}
            onClick={() => handleAssiningTicket()}
          >
            Preuzmi zahtjev
          </Button>
        </Checkbox>
      );
    } else if (status === "izvršenje") {
      return (
        <Checkbox
          aria-label="Označi kako bi zatvorio zahtjev"
          checked={closeTicketStatus}
          onChange={() => setCloseTicketStatus((prev) => !prev)}
        >
          <Button
            disabled={!closeTicketStatus}
            onClick={() => handleCloseTicket()}
          >
            Zatvori zahtjev
          </Button>
        </Checkbox>
      );
    }
  }

  return (
    <Row gutter={16}>
      <Col xs={24} lg={12}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Korisnik">{helpdeskState?.user?.fullname}</Descriptions.Item>
          <Descriptions.Item label="Kontakt">{helpdeskState?.user?.localNumber}</Descriptions.Item>
          <Descriptions.Item label="Sektor/služba/odjeljenje">{helpdeskState?.user?.department?.title}</Descriptions.Item>
          <Descriptions.Item label="Lokacija korisnika">{helpdeskState?.user?.location?.name}</Descriptions.Item>
          <Descriptions.Item label="Datum prijave">{dayjs(helpdeskState?.createdAt).format("DD.MM.YYYY - HH:mm")}</Descriptions.Item>
          <Descriptions.Item label="Željeni rok realizacije">{dayjs(helpdeskState?.clientDuoDate).format("DD.MM.YYYY - HH:mm")}</Descriptions.Item>
          <Descriptions.Item label="Grupa">{helpdeskState?.group?.groupName}</Descriptions.Item>
          <Descriptions.Item label="Vrsta zahtjeva">{helpdeskState?.groupPartent?.groupName}</Descriptions.Item>
          <Descriptions.Item label="Opis zahtjeva">{helpdeskState?.description}</Descriptions.Item>
        </Descriptions>
      </Col>
      <Col xs={24} lg={12}>
        <Form form={form} 
        layout="vertical" 
        onFinish={() => doEditTicket(helpdeskState?.ticketId!)}
        >
          <Form.Item label="Prioritet" name="priority">
            <Select disabled={isDisabled} onChange={handlePriorityChange}>
              {PriorityList.map((priorityItem) => (
                <Select.Option key={priorityItem.id} value={priorityItem.priority}>
                  {priorityItem.priority} - {priorityItem.days} dana
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Predviđeni datum rješenja" name="duoDate">
            <DatePicker
              format="DD.MM.YYYY - HH:mm"
              disabled={isDisabled}
              showTime={{ format: "HH:mm" }}
              readOnly
            />
          </Form.Item>

          {helpdeskState?.status !== 'otvoren' && (
            <>
              <Form.Item label="Rješenje zahtjeva" name="resolveDescription">
                <Input.TextArea disabled={isDisabled} />
              </Form.Item>
              <Form.Item label="Rješenje" name="resolveResolution">
                <Select disabled={isDisabled} >
                  {ResolveResolutionList.map((resolveItem) => (
                    <Select.Option key={resolveItem.id} value={resolveItem.resolution}>
                      {resolveItem.resolution}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Utrošeno vrijeme (minute)" name="resolveTimespand">
                <Input disabled={isDisabled} onChange={(e) => updateResolvedTimespandFromInput(e.target.value)} />
              </Form.Item>
              <span>{resolvedTimespandDescription()}</span>
            </>
          )}
          <Form.Item name="status" initialValue={helpdeskState?.status} hidden />
          <Form.Item name="assignedTo" initialValue={helpdeskState?.assignedTo} hidden />
          <Form.Item name="resolveDate" initialValue={helpdeskState?.resolveDate} hidden />
          <Form.Item name="createdAt" initialValue={helpdeskState?.createdAt} hidden />
          {changeStatus(helpdeskState?.status!)}

          <Button type="primary" htmlType="submit" className={`${helpdeskState?.status === 'zatvoren' && 'hidden'}`}>Izmjeni</Button>
        </Form>
      </Col>
    </Row>
  );
};

export default TicketDetails;
