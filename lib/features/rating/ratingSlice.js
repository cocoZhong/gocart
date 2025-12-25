import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getHeader } from "@/utils";
export const fetchUserRatings = createAsyncThunk(
    "rating/fetchUserRatings",
    async (_, thunkAPI) => {
        try {
            const header = await getHeader();
            const { data } = await axios.get(`/api/rating`, header);
            return data.ratings;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);
const ratingSlice = createSlice({
    name: "rating",
    initialState: {
        ratings: [],
    },
    reducers: {
        addRating: (state, action) => {
            state.ratings.push(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUserRatings.fulfilled, (state, action) => {
            state.ratings = action.payload;
        });
    },
});

export const { addRating } = ratingSlice.actions;

export default ratingSlice.reducer;
