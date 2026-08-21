import type { ReturnRequest, CreateReturnRequestInput, ShipTrackingInput } from "@mohini-artistry/shared";
import { apiClient } from "./client";

export const returnsApi = {
  create: (input: CreateReturnRequestInput) => apiClient.post<ReturnRequest>("/returns", input),
  shipBack: (id: number, input: ShipTrackingInput) => apiClient.post<ReturnRequest>(`/returns/${id}/ship`, input),
};
