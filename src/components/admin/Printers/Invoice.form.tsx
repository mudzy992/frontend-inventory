import React, { useEffect, useState } from "react";
import { Input, Button, Select, SelectItem } from "@nextui-org/react"; // Uvoz NextUI komponenata
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../UserContext/UserContext";
import api from "../../../API/api";

interface InvoiceFormProps {
  invoiceId: number;
}

type Status = "izvršenje" | "plaćeno" | null; // Definiraj tip za status

interface FormData {
  issueDate: string;
  customer: string;
  status: "izvršenje" | "plaćeno" | null;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceId }) => {
  const { role } = useUserContext(); // Koristi autentifikaciju za ulogu korisnika
  const navigate = useNavigate();

  // State za pohranu vrijednosti forme
  const [formData, setFormData] = useState<FormData>({
    issueDate: "",
    customer: "",
    status: null,
  });


  const [isSubmitting, setIsSubmitting] = useState(false);

  // Funkcija za učitavanje inicijalnih podataka fakture
  const loadInvoice = async () => {
    try {
      const response = await api(`/api/invoice/${invoiceId}`, "get", undefined, role);
      if (response.status === "login") {
        return navigate("/"); // Redirekcija ako nije prijavljen
      }
      const invoice = response.data;
      setFormData({
        issueDate: invoice.issueDate,
        customer: invoice.customer,
        status: invoice.status, // Provjeriti ako je status pravi tip
      });
    } catch (error) {
      console.error("Error loading invoice:", error);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value, // Ako je prazno, postavljamo na null za status
    }));
  };

  const handleSelectChange = (value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      status: value as Status, // Kastaj vrijednost u Status
    }));
  };
  

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const response = await api(`api/invoice/${invoiceId}`, "patch", formData, role);
      if (response.status === "ok") {
        alert("Faktura je uspješno ažurirana!");
      } else {
        alert("Došlo je do greške prilikom ažuriranja fakture.");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-md p-4 space-y-6">
      <div className="space-y-2">
        <label htmlFor="issueDate" className="block text-sm font-medium">
          Datum izdavanja
        </label>
        <Input
          id="issueDate"
          type="date"
          name="issueDate"
          className="w-full"
          value={formData.issueDate}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="customer" className="block text-sm font-medium">
          Kupac
        </label>
        <Input
          id="customer"
          type="text"
          name="customer"
          className="w-full"
          value={formData.customer}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="status" className="block text-sm font-medium">
          Status
        </label>
        <Select
            id="status"
            name="status"
            className="w-full"
            selectedKeys={formData.status ? new Set([formData.status]) : new Set()} // Postavi početni status ili prazan set
            onSelectionChange={(keys) => {
                const selectedValue = Array.from(keys).pop(); // Izvučemo vrijednost iz skupa
                handleSelectChange(selectedValue as string | null); // Proslijedimo je handleru
            }}
            >
            <SelectItem key="izvršenje" value="izvršenje">Izvršenje</SelectItem>
            <SelectItem key="plaćeno" value="plaćeno">Plaćeno</SelectItem>
            </Select>
      </div>

      <Button
        type="submit"
        color="primary"
        isLoading={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Ažuriranje..." : "Ažuriraj fakturu"}
      </Button>
    </form>
  );
};

export default InvoiceForm;
