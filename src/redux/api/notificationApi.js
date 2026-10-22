import { baseApi } from "./baseApi";

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotification: builder.query({
      query: (query) => ({
        url: `/notification`,
        method: "GET",
        params: query,
      }),
      providesTags: ["notification"],
      transformResponse: (response) => {
        return {
          data: response?.data,
          meta: response?.meta,
        };
      },
    }),
    markAsRead: builder.mutation({
      query: () => ({
        url: `/notification`,
        method: "PATCH",
      }),
      invalidatesTags: ["notification"],
    }),
    deleteNotification: builder.mutation({
      query: () => ({
        url: `/notification/my-notifications`,
        method: "DELETE",
      }),
      invalidatesTags: ["notification"],
    }),
    deleteSingleNotification: builder.mutation({
      query: (id) => ({
        url: `/notification/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["notification"],
    }),

    // send promotional message
    sendPromotionalMessage: builder.mutation({
      query: (data) => ({
        url: `/notification/promotional`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetMyNotificationQuery,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteSingleNotificationMutation,
  useSendPromotionalMessageMutation,
} = notificationApi;
