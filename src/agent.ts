import {
  Finding,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  getEthersProvider,
  ethers,
} from "forta-agent";

import { BigNumber } from "ethers";
import { AMP_TOKEN_ABI, FLEXA_TOKEN_ABI } from "./abi";

const ethersProvider = getEthersProvider();
const AMOUNT_THRESHOLD = "1"; // 1 million
const transferByPartition: string =
  "event TransferByPartition(bytes32 indexed fromPartition,address operator, address indexed from,address indexed to,uint256 value,bytes data, bytes operatorData)";

let partitionArr = [];


export const createFinding = (amount: number): Finding => {
  return Finding.fromObject({
    name: "Large Deposit",
    description: "Large Deposit into staking pool",
    alertId: "FLEXA-1",
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    metadata: {
      value: amount.toString(),
    },
  });
};

function provideHandleTransaction(amountThreshold:any) {
  const AMP_TOKEN_CONTRACT: string =
    "0xfF20817765cB7f73d4bde2e66e067E58D11095C2";
  const FLEXA_TOKEN_CONTRACT: string = 
  "0x706D7F8B3445D8Dfc790C524E3990ef014e7C578";
  return async (txEvent: TransactionEvent) => {
    const ampTokenContract = new ethers.Contract(
      AMP_TOKEN_CONTRACT,
      AMP_TOKEN_ABI,
      ethersProvider
    );
    const flexaStakingContract = new ethers.Contract(
      FLEXA_TOKEN_CONTRACT,
      FLEXA_TOKEN_ABI,
      ethersProvider
    );

    const findings: Finding[] = [];
       
    // filter the transaction logs for transferByPartition events
    const transferByPartitionEvent = txEvent.filterLog(transferByPartition,AMP_TOKEN_CONTRACT);
    
    // fire alerts for transfers of large stake
      transferByPartitionEvent.forEach(async (events) => {
      const data = events.args.data;
      const _fromPartition = events.args.fromPartition;
      const value = events.args.amount.dividedBy(10 ** 18);;

      //derives destinationAddress from data argument
      const destinationPartition =
        await ampTokenContract._getDestinationPartition(data, _fromPartition);
        

      const destinationPartitionMapping = await flexaStakingContract.partitions(
        destinationPartition
      );
      const blockNumber = txEvent.blockNumber;
      
      //storing partition array globally
      partitionArr = await ampTokenContract.partitionsOf(
        FLEXA_TOKEN_CONTRACT,
        { blockTag: blockNumber }
      );
      
      if (
        partitionArr.includes(destinationPartition) &&
        destinationPartitionMapping == true
      ) {
        if (value >= amountThreshold) {
          const newFinding: Finding = createFinding(events.args.amount);
          findings.push(newFinding);
        }
      }
    });
    return findings;

  };
}
export default {
  handleTransaction: provideHandleTransaction(AMOUNT_THRESHOLD),
};
