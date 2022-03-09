# Forta-agent
Forta agent for large deposit into staking pool
  it("should return no findings when event is not emitted in the correct address", async () => {
    const wrongAmpToken: string = createAddress("0xd34d");

    const testFromPartition: string = toBytes32("0xc578");
    const testFrom: string = createAddress("0xabc268");
    const testTo: string = createAddress("0xabc842");

    const testOperator: string = createAddress("0xdef954");
    const bytesOperatorData: string = toBytes32("0x0951");
    const testValue: BigNumber = BigNumber.from(200);

    const testDestinationPartition: string = toBytes32("0xd679");
    const testData: string = encodeParameters(
      ["bytes32", "bytes32"],
      [testFlag, testDestinationPartition]
    );

    const { data, topics } = testAmpIFace.encodeEventLog(
      testAmpIFace.getEvent("TransferByPartition"),
      [
        testFromPartition,
        testOperator,
        testFrom,
        testTo,
        testValue,
        testData,
        bytesOperatorData,
      ]
    );

    // prepare the partitions call
    mockProvider.addCallTo(testFlexa, 75, testFlexaIFace, "partitions", {
      inputs: [testDestinationPartition],
      outputs: [true],
    });

    const txEvent: TransactionEvent = new TestTransactionEvent()
      .setBlock(75)
      .addAnonymousEventLog(testAmp, data, ...topics);

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([
      createFinding([testValue.toString(), testFromPartition, testOperator, testFrom, testDestinationPartition, testTo, bytesOperatorData])
    ])
  });