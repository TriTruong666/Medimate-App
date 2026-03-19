import { BaseResponse } from "@/types/APIResponse";
import { DemoUser, PostDemo } from "@/types/Demo";
import { axiosClient } from "./client";

export async function demo(): Promise<BaseResponse<DemoUser[]>> {
  const res = await axiosClient.get(`/api/v1/users`);
  return res.data;
}

export async function postDemo(data: PostDemo) {
  const res = await axiosClient.post(`/api/v1/create-demo-user`, data);
  return res.data;
}
