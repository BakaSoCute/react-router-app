import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type User = {
    id: number;
    name: string;
    email: string;
    address: {
        street: string;
        suite: string;
        city: string;
        zipcode: string;
        geo: {
            lat: string;
            lng: string;
        };
    };
    phone: string;
    website: string;
    company: {
        name: string;
        catchPhrase: string;
        bs: string;
    };
};

type Post = {
    userId: number;
    id: number;
    title: string;
    body: string;
};

type AddUserRequest = {
    channelId: string;
};

type AddUserResponse = {
    channelId: string
    message: string
    success: boolean
};

const TOKEN = import.meta.env.VITE_TOKEN_RAILWAY||import.meta.env.API_TOKEN_RAILWAY;

export const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ 
        baseUrl: 'https://jsonplaceholder.typicode.com'
    }),
    tagTypes: ["User", "Post", "Todo"], 
    endpoints: (builder) => ({
        getUsers: builder.query<User[], void>({
            query: () => '/users',
            providesTags: (result) => 
                result 
                    ? [
                        ...result.map(({ id }) => ({ type: 'User' as const, id })),
                        { type: 'User', id: 'LIST' }
                    ]
                    : [{ type: 'User', id: 'LIST' }]
        }),
        
        getPosts: builder.query<Post[], number>({
            query: (limit = 10) => `/posts?_limit=${limit}`,
            // query: () => '/posts',
            // transformResponse: (response: Post[], meta, arg) => {
            //     return response.slice(0, arg);
            // },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Post' as const, id })),
                        { type: 'Post', id: 'LIST' }
                    ]
                    : [{ type: 'Post', id: 'LIST' }]
        }),
        
        createUser: builder.mutation<User, Partial<User>>({
            query: (body) => ({
                url: "/users",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: 'User', id: 'LIST' }],
        }),
    })
});

export const apiRailway = createApi({
    reducerPath: "apiRailway",
    baseQuery: fetchBaseQuery({ 
        baseUrl: "https://bot-twich-production.up.railway.app",
        prepareHeaders: (headers) => {
            if (TOKEN) {
                headers.set('Authorization', `Bearer ${TOKEN}`);
            }
            headers.set('Content-Type', 'application/json');
            return headers;
        }
    }),
    tagTypes: ["Channel"],
    endpoints: (builder) => ({
        addUser: builder.mutation<AddUserResponse, AddUserRequest>({
            query: (body) => ({
                url: "/api/channels",
                method: "POST",
                body: {
                    channelId: body.channelId
                }
            }),
            invalidatesTags: [{ type: 'Channel', id: 'LIST' }]
        }),
        
    })
});

export const { 
    useGetUsersQuery, 
    useGetPostsQuery, 
    useCreateUserMutation 
} = api;

export const { 
    useAddUserMutation 
} = apiRailway;