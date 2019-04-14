import * as XDR from "js-xdr";
import StellarSdk from "stellar-sdk";
import { toJSON, toXDR } from "./index";

const STELLAR_HOST = "https://horizon.stellar.org";
const server = new StellarSdk.Server(STELLAR_HOST);

describe("Integration", () => {
  test("serializing and deserializing Stellar transaction result", async () => {
    if (!process.env.RUN_INTEGRATION) { return; }

    const testTransaction = (transaction) => {
      console.log("serializing and deserializing transaction: ", transaction._links.self.href);

      // Read ResultXDR, convert to JSON and back to XDR.
      let xdr = StellarSdk.xdr.TransactionResult.fromXDR(transaction.result_xdr, "base64");
      let json = toJSON(xdr);

      let xdrCopy = toXDR(StellarSdk.xdr.TransactionResult, json);

      expect(xdrCopy.toXDR().toString("base64")).toEqual(transaction.result_xdr);

      // Read ResultMetaXDR, convert to JSON and back to XDR.
      xdr = StellarSdk.xdr.TransactionMeta.fromXDR(transaction.result_meta_xdr, "base64");
      json = toJSON(xdr);

      xdrCopy = toXDR(StellarSdk.xdr.TransactionMeta, json);
      expect(xdrCopy.toXDR().toString("base64")).toEqual(transaction.result_meta_xdr);

      // Read TransactionEnvelope, convert to JSON and back to XDR.
      xdr = StellarSdk.xdr.TransactionEnvelope.fromXDR(transaction.envelope_xdr, "base64");
      json = toJSON(xdr);

      xdrCopy = toXDR(StellarSdk.xdr.TransactionEnvelope, json);
      expect(xdrCopy.toXDR().toString("base64")).toEqual(transaction.envelope_xdr);

      // Read LedgerEntryChanges, convert to JSON and back to XDR.
      xdr = StellarSdk.xdr.LedgerEntryChanges.fromXDR(transaction.fee_meta_xdr, "base64");
      json = toJSON(xdr);

      xdrCopy = toXDR(StellarSdk.xdr.LedgerEntryChanges, json);
      expect(StellarSdk.xdr.LedgerEntryChanges.toXDR(xdrCopy).toString("base64")).toEqual(transaction.fee_meta_xdr);
    };

    let transactions = await server.transactions().order("desc").limit(200).call();
    transactions.records.forEach(testTransaction);

    transactions = await transactions.next();
    transactions.records.forEach(testTransaction);

    transactions = await transactions.next();
    transactions.records.forEach(testTransaction);
  }, 200000);
});
