type InvoiceType = {
    invoiceId: number;
    createdAt: string;
    invoiceNumber: number;
    issueDate?: string | null;
    customer?: string | null;
    rentPrice: string;
    totalAmount: string;
    type: string;
    status: string;
    blackAndWhite: number;
    color: number;
    scan: number;
};
