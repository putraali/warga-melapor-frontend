import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    reports: [],      // Menampung list laporan
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ""
}

// --- AKSI 1: BUAT LAPORAN BARU (CREATE) ---
export const createReport = createAsyncThunk("report/createReport", async(reportData, thunkAPI) => {
    try {
        const token = localStorage.getItem('accessToken'); 
        if(!token){
            return thunkAPI.rejectWithValue("Token tidak ditemukan. Mohon login dulu.");
        }

        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        };

        // PERUBAHAN: Endpoint menembak langsung ke Railway
        const response = await axios.post('https://warga-melapor-backend-production.up.railway.app/reports', reportData, config);
        return response.data;
    } catch (error) {
        if(error.response){
            return thunkAPI.rejectWithValue(error.response.data.msg);
        }
    }
});

// --- AKSI 2: LIHAT SEMUA LAPORAN (GET) ---
export const getReports = createAsyncThunk("report/getReports", async(_, thunkAPI) => {
    try {
        const token = localStorage.getItem('accessToken');
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        
        // PERUBAHAN: Endpoint menembak langsung ke Railway
        const response = await axios.get('https://warga-melapor-backend-production.up.railway.app/reports', config);
        return response.data;
    } catch (error) {
        if(error.response){
            return thunkAPI.rejectWithValue(error.response.data.msg);
        }
    }
});

// --- AKSI 3: HAPUS LAPORAN (DELETE) ---
export const deleteReport = createAsyncThunk("report/deleteReport", async(id, thunkAPI) => {
    try {
        const token = localStorage.getItem('accessToken');
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        
        // PERUBAHAN: Endpoint menembak langsung ke Railway
        await axios.delete(`https://warga-melapor-backend-production.up.railway.app/reports/${id}`, config);
        
        // Kembalikan ID agar reducer tahu mana yang harus dihapus dari state
        return id; 
    } catch (error) {
        if(error.response){
            return thunkAPI.rejectWithValue(error.response.data.msg);
        }
    }
});

export const reportSlice = createSlice({
    name: "report",
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
        // 1. HANDLE CREATE REPORT
        builder.addCase(createReport.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(createReport.fulfilled, (state) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.message = "Laporan berhasil dikirim!";
        });
        builder.addCase(createReport.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        });

        // 2. HANDLE GET REPORTS
        builder.addCase(getReports.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getReports.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.reports = action.payload;
        });
        builder.addCase(getReports.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        });

        // 3. HANDLE DELETE REPORT
        builder.addCase(deleteReport.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(deleteReport.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            // Filter array laporan: Buang laporan yang ID-nya sama dengan payload (yang dihapus)
            // Ini membuat UI update otomatis tanpa reload
            state.reports = state.reports.filter((report) => report.uuid !== action.payload);
        });
        builder.addCase(deleteReport.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        });
    }
});

export const { reset } = reportSlice.actions;
export default reportSlice.reducer;