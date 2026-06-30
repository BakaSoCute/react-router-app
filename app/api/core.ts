import { createApi } from "@reduxjs/toolkit/query/react";
import { API_TAG_TYPES, baseQueryWithReauth } from "./base";

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [...API_TAG_TYPES],
  endpoints: () => ({}),
});
