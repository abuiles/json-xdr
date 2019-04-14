import * as XDR from "js-xdr";
import StellarSdk from "stellar-sdk";
import { toJSON, toXDR } from "./index";

const STELLAR_HOST = "https://horizon.stellar.org";
const server = new StellarSdk.Server(STELLAR_HOST);

describe("Integration", () => {
  if (process.env.RUN_INTEGRATION) {
    test("serializing and deserializing Stellar transaction result", async () => {
      const testTransaction = (transaction) => {
        console.log("serializing and deserializing transaction: ", transaction.id);

        let xdr = StellarSdk.xdr.TransactionResult.fromXDR(transaction.result_xdr, "base64");
        let json = toJSON(xdr);

        let xdrCopy = toXDR(StellarSdk.xdr.TransactionResult, json);

        expect(transaction.result_xdr).toEqual(xdrCopy.toXDR().toString("base64"));

        xdr = StellarSdk.xdr.TransactionEnvelope.fromXDR(transaction.envelope_xdr, "base64");
        json = toJSON(xdr);

        xdrCopy = toXDR(StellarSdk.xdr.TransactionEnvelope, json);
        expect(transaction.envelope_xdr).toEqual(xdrCopy.toXDR().toString("base64"));
      };

      let transactions = await server.transactions().limit(100).call();
      transactions.records.forEach(testTransaction);

      transactions = transactions.next();
      transactions.records.forEach(testTransaction);
    }, 20000);
  } else {
    test.todo("skipping integration tests - use `yarn test:all` to run all test");
  }
});
