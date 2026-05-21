import mongoose from "mongoose"
import BorrowerSchema from "./Borrower.js"

const LedgerSchema = new mongoose.Schema({
    cityId: {type:Number, required: true},
    borrowers:[BorrowerSchema]
});

export default mongoose.model("Ledger",LedgerSchema)