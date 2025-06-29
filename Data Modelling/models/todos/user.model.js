import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: [true, "password is required"]
    }
  },
  
  {
    timestamps: true
  }
);

export const User = mongoose.model("User", userSchema);

//store in database in plural form and all character in lower case:
  //User --> users(stored in mongodb)