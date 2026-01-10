export interface AdminCartListResponse {
    id: number;
    userId: number | null;
    userName: string;
    userEmail: string | null;
    sessionId: string | null;
    itemsCount: number;
    totalValue: number;
    createdAt: string;
    updatedAt: string;
    isAbandoned: boolean;
}

export interface AdminCartListPage {
    content: AdminCartListResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}
