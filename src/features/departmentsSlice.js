import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAllDepartments } from "../api";

export const fetchDepartments = createAsyncThunk('departments/fetchDepartments', async () => {
    try {
        const response = await axios.post(getAllDepartments, { orgId: 1 });
        console.log("Response:", response.data);  
        return response.data.map((dept) => ({
            id: dept.departmentID,
            title: dept.departmentName,
        }));
    } catch (error) {
        console.error("Error fetching departments:", error); 
        throw error;  
    }
   
});

const departmentsSlice = createSlice({
    name: 'departments',
    initialState: {
        list:[],
        loading:false,
        error:null,
    },
    reducers: {},
    extraReducers:(builder) => {
        builder
        .addCase(fetchDepartments.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchDepartments.fulfilled, (state, action) => {
            state.loading = false;
            state.list= action.payload;
        })
        .addCase(fetchDepartments.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message
        })

    }
});

export default departmentsSlice.reducer;
