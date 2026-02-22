import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; 

const initialState = {
    user: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ""
}

// --- 1. LOGIN USER ---
export const LoginUser = createAsyncThunk("user/LoginUser", async(user, thunkAPI) => {
    try {
        const response = await axios.post('https://warga-melapor-backend-production.up.railway.app/login', {
            email: user.email,
            password: user.password
        });
        
        // Simpan token ke LocalStorage agar sesi tetap hidup saat halaman di-refresh
        if(response.data.accessToken){
            localStorage.setItem('accessToken', response.data.accessToken);
        }
        
        return response.data; 
    } catch (error) {
        if(error.response){
            const message = error.response.data.msg;
            return thunkAPI.rejectWithValue(message);
        }
    }
});

// --- 2. GET ME (Validasi Sesi / Ambil Data User) ---
export const getMe = createAsyncThunk("user/getMe", async(_, thunkAPI) => {
    try {
        const token = localStorage.getItem('accessToken');
        
        // Mencegah request ke server jika token tidak ada di browser
        if(!token) {
            return thunkAPI.rejectWithValue("No token found");
        }

        const response = await axios.get('https://warga-melapor-backend-production.up.railway.app/me', {
            headers: {
                Authorization: `Bearer ${token}` 
            }
        });
        
        return response.data; 
    } catch (error) {
        if(error.response){
            const message = error.response.data.msg;
            return thunkAPI.rejectWithValue(message);
        }
    }
});

// --- 3. LOGOUT ---
export const LogOut = createAsyncThunk("user/LogOut", async() => {
    // Hapus token dari penyimpanan lokal browser
    localStorage.removeItem('accessToken');
    
    // Hapus sesi di sisi backend
    await axios.delete('https://warga-melapor-backend-production.up.railway.app/logout');
});

// --- 4. REDUX SLICE KONFIGURASI ---
export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = "";
        }
    },
    extraReducers: (builder) => {
        // --- State Handling untuk LOGIN ---
        builder.addCase(LoginUser.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(LoginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.user = action.payload;
        });
        builder.addCase(LoginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        });

        // --- State Handling untuk GET ME ---
        builder.addCase(getMe.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getMe.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.user = action.payload; 
        });
        builder.addCase(getMe.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        });

        // --- State Handling untuk LOGOUT ---
        builder.addCase(LogOut.fulfilled, (state) => {
            state.user = null;
        });
    }
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;