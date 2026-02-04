import { createSlice } from "@reduxjs/toolkit"

interface AccountSetings {
    isLogin: boolean
}

const initialState: AccountSetings = {
    isLogin: false
}

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        login: (state) => {
            state.isLogin = true
        },
        logout: (state) => {
            state.isLogin = false
        }
    }
})
export const {login,logout} = accountSlice.actions
export const selectLogin = (state:{ account:AccountSetings}) => state.account.isLogin

export default accountSlice.reducer