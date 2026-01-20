import { configureStore } from "@reduxjs/toolkit";
import  counterReducer  from "../features/counter/counterSlice";
import { api } from "../api/api";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [api.reducerPath]: api.reducer,
  },
  devTools: false,
  middleware: (getDefailtMiddleware) =>
    getDefailtMiddleware().concat(api.middleware)
  
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch