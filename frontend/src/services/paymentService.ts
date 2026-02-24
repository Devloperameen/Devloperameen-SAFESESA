import { apiRequest } from "@/lib/api";

export interface Transaction {
    id: string;
    courseId: {
        _id: string;
        title: string;
        thumbnail: string;
        price: number;
    };
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    transactionId: string;
    createdAt: string;
}

export async function processPayment(payload: {
    courseId: string;
    paymentMethod: string;
    paymentReference?: string;
}) {
    return apiRequest<{
        transaction: any;
        enrollment: any;
    }>("/payments/process", {
        method: "POST",
        body: payload,
    });
}

export async function getMyTransactions(): Promise<Transaction[]> {
    const response = await apiRequest<Transaction[]>("/payments/my-transactions");
    return response;
}
