import {
    HandleTransaction,
    TransactionEvent
  } from "forta-agent"
  import { 
    createAddress,
    TestTransactionEvent,
    encodeParameters
  } from "forta-agent-tools";

  import {
    createFinding,
    provideHandleTransaction
  
  } from "./agent";
  import { utils,BigNumber } from "ethers";
  const AMOUNT_THRESHOLD=100;
  const AMP_TOKEN="0xfF20817765cB7f73d4bde2e66e067E58D11095C2"
  const FLEXA_TOKEN="0x706D7F8B3445D8Dfc790C524E3990ef014e7C578"
  const transferByPartition: string="TransferByPartition(bytes32,address,address,address,uint256,bytes,bytes)"

  describe("Large stake deposits", () => {
    let handleTransaction: HandleTransaction
  
    beforeAll(() => {
      handleTransaction = provideHandleTransaction(AMOUNT_THRESHOLD,AMP_TOKEN,FLEXA_TOKEN);
    })

    it("should return a finding",async()=>{
        const testFromPartition:string ="0xcccccccc2862b8cb21caedb8706d7f8b3445d8dfc790c524e3990ef014e7c578";
        const testFrom:string = createAddress("");
        const testTo:string =createAddress("");

        // const testTopics: string[] = [
        //     encodeParameters(["bytes32"], [testFromPartition]),
        //     encodeParameters(["address"], [testFrom]),
        //     encodeParameters(["address"], [testTo])
        //   ];
      const testOperator:string =createAddress("");
      const testValue =100;
      const bytesOperatorData:string="";

      const testFlag:string="0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      const testDestinationPartition="0xcccccccc7a0208a97d8ac263706d7f8b3445d8dfc790c524e3990ef014e7c578"
      const testDataArgs:any[]=[testFlag,testDestinationPartition];

      const mockData: string = encodeParameters(
        ["bytes32", "bytes32"],
        testDataArgs
      );
     

      const txEvent: TransactionEvent = new TestTransactionEvent()
      .addEventLog(transferByPartition);
      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([
        createFinding(
            AMOUNT_THRESHOLD,
            testValue,
            testFromPartition,
            testOperator,
            testFrom,
            testDestinationPartition,
            testTo
        )
      ]);
    })
})