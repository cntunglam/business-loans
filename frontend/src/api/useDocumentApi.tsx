import type { getDocument, updateDocumentSchema, uploadDocumentSchema } from "@roshi/backend";
import { AwaitedRT } from "@roshi/shared";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useAxios } from "./useAxios";

export const useUploadDocument = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (args: z.infer<typeof uploadDocumentSchema> & { file: File }) => {
      const formData = new FormData();
      formData.append("file", args.file);
      formData.append("applicantInfoId", args.applicantInfoId);
      formData.append("documentType", args.documentType);
      return axios.post("/document/upload", formData).then((res) => res.data);
    },
  });
};

export const useGetDocumentLink = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (filename: string) =>
      axios.get<AwaitedRT<typeof getDocument>>(`/document/${filename}`).then((res) => res.data.data),
  });
};

export const useDeleteDocument = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (filename: string) => axios.delete(`/document/${filename}`).then((res) => res.data),
  });
};

export const useUpdateDocument = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (args: z.infer<typeof updateDocumentSchema> & { filename: string }) =>
      axios.put(`/document/${args.filename}`, args).then((res) => res.data),
  });
};
