import request from "@/service/fetch";
import type { TreeNode } from "@rap/components-ui/tree/types";

export interface TreeTransferUser {
  id: string;
  name: string;
  account: string;
  classKey: string;
  organizationPath?: string;
}

export interface FetchTreeTransferUsersParams {
  treeKey?: string;
  search?: string;
  includeChild?: boolean;
}

function readArrayData<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  const data = (response as { data?: unknown }).data;
  if (Array.isArray(data)) return data as T[];
  const nestedData = (data as { data?: unknown } | undefined)?.data;
  return Array.isArray(nestedData) ? (nestedData as T[]) : [];
}

export const fetchTreeTransferOrganizations = async (): Promise<TreeNode[]> => {
  const response = await request.get("/api/rap/tree-transfer/organizations");
  return readArrayData<TreeNode>(response);
};

export const fetchTreeTransferAsyncOrganizations = async (): Promise<TreeNode[]> => {
  const response = await request.get("/api/rap/tree-transfer/async-organizations");
  return readArrayData<TreeNode>(response);
};

export const fetchTreeTransferOrganizationChildren = async (
  parentKey: string
): Promise<TreeNode[]> => {
  const response = await request.get("/api/rap/tree-transfer/organization-children", {
    params: { parentKey },
  });
  return readArrayData<TreeNode>(response);
};

export const fetchTreeTransferUsers = async (
  params: FetchTreeTransferUsersParams
): Promise<TreeTransferUser[]> => {
  const response = await request.get("/api/rap/tree-transfer/users", {
    params: params as Record<string, string | number | boolean | undefined>,
  });
  return readArrayData<TreeTransferUser>(response);
};

export const fetchSelectedTreeTransferUsers = async (
  ids: string[]
): Promise<TreeTransferUser[]> => {
  const response = await request.post("/api/rap/tree-transfer/selected-users", {
    data: { ids },
  });
  return readArrayData<TreeTransferUser>(response);
};
