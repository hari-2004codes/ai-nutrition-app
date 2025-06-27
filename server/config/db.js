    // server/config/db.js
    import mongoose from 'mongoose';
    // dotenv.config() is handled in index.js, so typically not needed here unless db.js is standalone
    // import dotenv from 'dotenv';
    // dotenv.config();

    const connectDB = async () => {
      try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
          // useNewUrlParser and useUnifiedTopology are often not needed in recent Mongoose versions (6.x+)
          // but include them if you encounter warnings.
          // useNewUrlParser: true,
          // useUnifiedTopology: true,
        });
        // This log should now correctly show the host if process.env.MONGO_URI is valid
        console.log(`MongoDB Connected: ${conn.connection.host}`);
      } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
      }
    };

    export default connectDB;
    