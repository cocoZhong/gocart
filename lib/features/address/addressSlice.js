import { addressDummyData } from "@/assets/assets";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getHeader } from "@/utils";
import axios from "axios";

export const fetchAddress = createAsyncThunk(
    "address/fetchAddress",
    async (_, thunkAPI) => {
        try {
            const header = await getHeader();
            const { data } = await axios.get("/api/address", header);
            return data ? data.addresses : [];
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);
// export const updateAddress = createAsyncThunk(
//     "address/updateAddress",
//     async (_, thunkAPI) => {
//         try {
//             const header = await getHeader();
//             const address = thunkAPI.getState().address.list;
//             const { data } = await axios.post(
//                 "/api/address",
//                 { address },
//                 header
//             );
//             return data.addresses;
//         } catch (error) {
//             return thunkAPI.rejectWithValue(error);
//         }
//     }
// );

const addressSlice = createSlice({
    name: "address",
    initialState: {
        list: [],
    },
    reducers: {
        addAddress: (state, action) => {
            state.list.push(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAddress.fulfilled, (state, action) => {
            state.list = action.payload;
        });
    },
});

export const { addAddress } = addressSlice.actions;

export default addressSlice.reducer;
