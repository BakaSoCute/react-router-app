import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type User = {
    success: boolean,
    user: {
        id: string,
        login: string,
        display_name: string,
        email: string,
        description: string | undefined,
        profile_image_url: string,
        created_at: string,
        broadcaster_type: string | undefined,
        view_count: number
    },
    timestamp: string
}
type Valid = {
    isValid: boolean
}
type Refresh = {
    status: string
}



export const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ 
        baseUrl: import.meta.env.VITE_BACKEND_URL,
        credentials: 'include'
    }),
    tagTypes: ["User","Valid","Refresh"],
    endpoints: (builder) => ({
        getUser: builder.query<User, void>({
            query: () => '/api/auth/twitch/user',
            providesTags: (result) => 
                result ? [{ type: 'User', state: {id: result.user.id,
                    login: result.user.login,
                    display_name: result.user.display_name,
                    email: result.user.email,
                    profile_image_url: result.user.profile_image_url
                 }}] : []
        }),
        validUser: builder.query<Valid, void>({
            query: () => "/api/auth/validate",
            providesTags: (result) => 
                result ? [{type: "Valid", isValid: result.isValid}] : []
        }),
        refreshToken: builder.query<Refresh,void>({
            query: () => "/api/auth/refresh",
            providesTags: (result) =>
                result ? [{type: "Refresh", status: result.status}] : []
        })
    })
});

// export const apiRailway = createApi({
//     reducerPath: "apiRailway",
//     baseQuery: fetchBaseQuery({ 
//         baseUrl: "https://bot-twich-production.up.railway.app",
//         prepareHeaders: (headers) => {
//             if (TOKEN) {
//                 headers.set('Authorization', `Bearer ${TOKEN}`);
//             }
//             headers.set('Content-Type', 'application/json');
//             return headers;
//         }
//     }),
//     tagTypes: ["Channel"],
//     endpoints: (builder) => ({
//         addUser: builder.mutation<AddUserResponse, AddUserRequest>({
//             query: (body) => ({
//                 url: "/api/channels",
//                 method: "POST",
//                 body: {
//                     channelId: body.channelId
//                 }
//             }),
//             invalidatesTags: [{ type: 'Channel', id: 'LIST' }]
//         }),
        
//     })
// });

export const { 
    useGetUserQuery,
    useValidUserQuery,
    useRefreshTokenQuery 
} = api;

// export const { 
//     useAddUserMutation 
// } = apiRailway;