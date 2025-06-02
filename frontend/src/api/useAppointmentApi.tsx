import type { createAppointment, createAppointmentSchema, deleteAppointmentHandler, getWeeklyAppointmentsHandler } from '@roshi/backend';
import { AwaitedRT } from '@roshi/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useAxios } from './useAxios';

export const useCreateAppointment = () => {
  const axios = useAxios({ successToast: true });
  return useMutation({
    mutationFn: (args: z.infer<typeof createAppointmentSchema>) =>
      axios.post<AwaitedRT<typeof createAppointment>>(`/appointment`, args).then((res) => res.data)
  });
};

export const useDeleteAppointment = () => {
  const axios = useAxios({ successToast: true });
  return useMutation({
    mutationFn: (id: string) => axios.delete<AwaitedRT<typeof deleteAppointmentHandler>>(`/appointment/${id}`).then((res) => res.data)
  });
};

export const useGetScheduledAppointment = (params: { date: string }) => {
  const axios = useAxios();

  return useQuery({
    queryKey: ['useGetScheduledAppointment', params],
    queryFn: () =>
      axios
        .get<AwaitedRT<typeof getWeeklyAppointmentsHandler>>('/appointment/scheduled-appointments', {
          params
        })
        .then((res) => res)
  });
};
