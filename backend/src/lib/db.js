import mongoose from "mongoose"


export const connectDb = async()=>{
    try {
        const conn = await mongoose.connect(`${process.env.URL}/videoApp`);
        console.log(`⌛ MongoDB connected ${conn.connection.host}`)
    } catch (error) {
        console.log("💀 mongodb connection error: ",error)
    }
}
