import {
  Finding,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  getEthersProvider,
  ethers,
} from "forta-agent";

import { BigNumber, utils } from "ethers";

import { FLEXA_TOKEN_ABI } from "./abi";

const ethersProvider = getEthersProvider();
const AMOUNT_THRESHOLD = 1000000; // 1 million
const transferByPartition: string =
  "event TransferByPartition(bytes32 indexed fromPartition,address operator, address indexed from,address indexed to,uint256 value,bytes data, bytes operatorData)";

export const createFinding = (
  amount: number,
  partition: string,
  operator: string,
  from: string,
  destinationPartition: any,
  to: string
): Finding => {
  return Finding.fromObject({
    name: "Large Deposit",
    description: "Large Deposit into staking pool",
    alertId: "FLEXA-1",
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    metadata: {
      value: amount.toString(),
      partition: partition,
      operator: operator,
      from: from,
      destinationPartition: destinationPartition,
      to: to,
    },
  });
};

function provideHandleTransaction(
  amountThreshold: any,
  ampToken: string,
  flexaManager: string
) {
  const flexaStakingContract = new ethers.Contract(
    flexaManager,
    FLEXA_TOKEN_ABI,
    ethersProvider
  );
  return async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];

    // filter the transaction logs for transferByPartition events
    const transferByPartitionEvent = txEvent.filterLog(
      transferByPartition,
      ampToken
    );

    // fire alerts for transfers of large stake
    transferByPartitionEvent.forEach(async (events) => {
      const data = events.args.data;
      const value = events.args.amount;

      //derives destinationAddress from data argument
        const decodedData = utils.defaultAbiCoder.decode(
        ["bytes32", "bytes32"],
        data
      );

      const destinationPartitionMapping = await flexaStakingContract.partitions(
        decodedData[1]
      );

      if (destinationPartitionMapping == true) {
        if (value.gte(amountThreshold)) {
          const newFinding: Finding = createFinding(
            events.args.amount,
            events.args.fromPartition,
            events.args.operator,
            events.args.from,
            decodedData,
            events.args.to
          );
          findings.push(newFinding);
        }
      }
    });
    return findings;
  };
}
export default {
  handleTransaction: provideHandleTransaction(
    AMOUNT_THRESHOLD,
    "0xfF20817765cB7f73d4bde2e66e067E58D11095C2",
    "0x706D7F8B3445D8Dfc790C524E3990ef014e7C578"
  ),
};
