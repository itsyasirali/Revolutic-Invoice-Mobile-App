export interface Item {
  id: string;
  userId?: string;
  type: "Service";
  name: string;
  unit?: string;
  sellingPrice?: number;
  description?: string;
  status?: "Active" | "inActive";
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemFormData {
  name: string;
  unit?: string;
  sellingPrice?: string;
  description?: string;
  status?: "Active" | "inActive";
}
