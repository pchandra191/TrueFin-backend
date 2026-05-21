import mongoose from "mongoose";

const InstallmentSchema = new mongoose.Schema({
  month: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    enum: ["paid", "defaulter", "pending", "NA", "completed", "partially-defaulter", "sd", ""],
    default: "pending",
  },
});

const BorrowerSchema = new mongoose.Schema({
  uniqueId: {type:String, required:true, unique:true},
  cityId: { type: Number, required: true },
  borrowerId: { type: Number, required: true, },
  IPM: [{ type: Number, required: true, default: 0 }],
  name: { type: String, required: true },
  phoneNumber: { type: String, default: "" },
  connectorName: { type: String, default: "" },
  lastLeft: { type: String, required: true },
  installmentCondition: { type: String, required: true, default: "NA" },
  installmentStartMonth: { type: String, default: "" },
  installments: [InstallmentSchema],
}, { timestamps: true });

// Virtual: total amount across all installments
BorrowerSchema.virtual("total").get(function () {
  return this.installments.reduce((sum, inst) => sum + inst.amount, 0);
});

// Virtual: remaining amount (IPM × 12 − total paid)
BorrowerSchema.virtual("amtLeft").get(function () {
  const yearlyIPM = this.IPM[this.IPM.length - 1] || 0;
  const totalPaid = this.installments.reduce((sum, inst) => sum + inst.amount, 0);
  return yearlyIPM * 12 - totalPaid;
});

BorrowerSchema.set("toJSON", { virtuals: true });
BorrowerSchema.set("toObject", { virtuals: true });

export default BorrowerSchema;
