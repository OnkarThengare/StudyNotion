import { createSlice } from '@reduxjs/toolkit'

// function readTokenFromStorage() {
//     try {
//         const raw = localStorage.getItem("token");
//         if (!raw) return null;
//         return JSON.parse(raw);
//     } catch {
//         return null;
//     }
// }

const initialState = {
    signupData: null,
    loading: false,
    // token: readTokenFromStorage(),
    token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null,
};

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        setSignupData(state, value) {
            state.signupData = value.payload;
        },
        setAuthLoading(state, value) {
            state.loading = value.payload
        },
        setToken(state, value) {
            state.token = value.payload;
        },
    },
});

export const { setSignupData, setAuthLoading, setToken } = authSlice.actions;
export default authSlice.reducer;

