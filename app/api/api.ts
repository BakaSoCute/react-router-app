import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
type Users = {
    id: number
    name: string
    email: string
    address: {
        street: string
        suite: string
        city: string
        zipcode: string
        geo: {
            lat: string
            lng: string
        }
    }
    phone: string
    website: string
    company: {
        name: string
        catchPhrase: string
        bs: string
    }

}
type Posts = {
    userId: number
    id: number
    title: string
    body: string
}


export const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com'}),
    tagTypes:["User","Post","Todo"],
    endpoints: (builder) => ({
        getUsers: builder.query<Users[],void>({
            query: () => `users/`,
            providesTags: ['User']
        }),
        getPosts: builder.query<Posts[],number>({
            query: () => `posts/`,
            providesTags: ["Post"],
            transformResponse: (response: Posts[],__,arg) => {
                return response.slice(0, arg)
            }
        }),
        createUser: builder.mutation<Users, Partial<Users>>({
            query: (body) => ({
                url: "/users",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User"],
        }),
    })
})
export const { useGetUsersQuery, useGetPostsQuery, useCreateUserMutation} = api