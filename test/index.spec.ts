import {expect} from "chai";
import getCRClient from "src";
import CentralRegistry from "../src/client";

describe("The Get Client", () => {
  it("should return the instance of the Client", ()=> {
    const client = getCRClient();
    expect(client instanceof CentralRegistry).to.be.true;
  });
});