import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
import { network } from "hardhat";

const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Test DLStream", function () {
    let DLStreamContract: Contract, DLSablierV2ComptrollerContract: Contract, DLSablierV2NFTDescriptorContract: Contract, DLSablierV2LockupLinearContract: Contract, DLTContract: Contract;
    let owner: SignerWithAddress;
    let owner2: SignerWithAddress;
    let owner3: SignerWithAddress;
    let fee = 1;
    let totalAmount = "10000000000000000000000000"

    it("Deploy Contract", async function () {
        const signers = await ethers.getSigners();
        owner = signers[0];
        owner2 = signers[1];
        owner3 = signers[2];

        const DLT = await ethers.getContractFactory("DLT");
        DLTContract = await DLT.deploy();

        const DLSablierV2Comptroller = await ethers.getContractFactory("DLSablierV2Comptroller");
        DLSablierV2ComptrollerContract = await DLSablierV2Comptroller.deploy(owner.address);

        const DLSablierV2NFTDescriptor = await ethers.getContractFactory("DLSablierV2NFTDescriptor");
        DLSablierV2NFTDescriptorContract = await DLSablierV2NFTDescriptor.deploy();

        const DLSablierV2LockupLinear = await ethers.getContractFactory("DLSablierV2LockupLinear");
        DLSablierV2LockupLinearContract = await DLSablierV2LockupLinear.deploy(owner.address, DLSablierV2ComptrollerContract.address, DLSablierV2NFTDescriptorContract.address);

        const DlStream = await ethers.getContractFactory("DlStream");
        DLStreamContract = await DlStream.deploy(owner.address, DLSablierV2LockupLinearContract.address, DLSablierV2LockupLinearContract.address);
    });

    it("setOwner", async function () {
        await DLStreamContract.setOwner(owner.address);
        let dlOwner = await DLStreamContract.owner();
        expect(dlOwner).to.equal(owner.address);
    });

    it("setBroker", async function () {
        let broker0 = await DLStreamContract.broker();
        expect(broker0.account).to.equal("0x0000000000000000000000000000000000000000");

        await DLStreamContract.setBroker({
            account: owner3.address,
            fee
        });
        let broker = await DLStreamContract.broker();
        expect(broker.account).to.equal(owner3.address);
    });

    it("createLinearStream", async function () {
        await DLTContract.approve(DLStreamContract.address, "1000000000000000000000000000000000000000000000000");
        const blockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
        const start = blockTimestamp + 10, cliff = blockTimestamp + 100, end = blockTimestamp + 1000;

        const res = await DLStreamContract.createLinearStream({
            sender: owner.address,
            recipient: owner2.address,
            totalAmount,
            asset: DLTContract.address,
            cancelable: true,
            transferable: true,
            range: { start, cliff, end }
        }, 1);

        expect(res).to.
            emit(DLStreamContract, "CreateLinearStreamEvent").
            withArgs(1, owner.address, owner2.address, [totalAmount, 0, 0], DLTContract.address, true, true, [start, cliff, end], owner3.address);

        // const fee = await DLTContract.balanceOf(owner3.address);
        // console.log(fee)
        // expect(await DLTContract.balanceOf(owner3.address).toString()).to.equal(BigNumber.from(""));

        expect(await DLStreamContract._dlStreamId()).to.equal(1);

        const stream = await DLSablierV2LockupLinearContract.getStream(1);
        expect(stream.sender).to.equal(DLStreamContract.address);
    });

    it("withdraw", async function () {
        const delaySeconds = 600;
        await network.provider.send("evm_increaseTime", [delaySeconds]);
        await network.provider.send("evm_mine");

        const withdrawableAmountOf = await DLSablierV2LockupLinearContract.withdrawableAmountOf(1);

        await DLStreamContract.connect(owner2).claim(1, withdrawableAmountOf);

        const getwidrawnAmount = await DLSablierV2LockupLinearContract.getWithdrawnAmount(1);
        expect(getwidrawnAmount.toString()).to.equal(withdrawableAmountOf.toString());
    });

    it("cancel", async function () {
        expect(await DLSablierV2LockupLinearContract.wasCanceled(1)).to.equal(false);

        await DLStreamContract.cancel(1);
        expect(await DLSablierV2LockupLinearContract.wasCanceled(1)).to.equal(true);

        const stream2 = await DLSablierV2LockupLinearContract.getStream(1);
        expect(stream2.wasCanceled).to.equal(true);
    });
});