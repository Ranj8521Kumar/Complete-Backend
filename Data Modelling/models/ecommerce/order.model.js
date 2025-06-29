import mongoose from "mongoose";

const orderItemsSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },

    quantity: {
      type: Number,
      required: true
    }
  }
);

const orderSchema = new mongoose.Schema(
  {
    orderPrice: {
      type: Number,
      required: true
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    orderItems: {
      type: [orderItemsSchema],
    },

    address: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["Pending", "Cancel", "Delivered"], //Giving Options
      default: "Pending"
    }
  },

  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);