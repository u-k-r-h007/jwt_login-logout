import mongoose from "mongoose";

const  connectDB= async(DATABASE_URL)=>{
    try {
        const DB_OPTIONS={
            dbName:'utkarsh'
        }
        await mongoose.connect(DATABASE_URL,DB_OPTIONS)
        console.log('Connected to database')
    } catch (error) {
        console.log(error)
    }
}


export default connectDB