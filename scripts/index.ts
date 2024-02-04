import * as hre from "hardhat";
import deployments from "./sablier.json"

async function main() {
    const { ethers } = hre;
    const signers = await ethers.getSigners();
    const signer = signers[0];
    const chainId = await ethers.provider.getNetwork().then(network => network.chainId);
    const contracts = (deployments as any)[chainId];
    const token = "0x016b496974422684ac4474d1d8b75a16b02c14cd";
    const DLStreamContract = await ethers.getContractAt("DlStream", contracts.dl);

    // const contractERC20 = new ethers.Contract(token, [{
    //     "inputs": [
    //         {
    //             "internalType": "address",
    //             "name": "spender",
    //             "type": "address"
    //         },
    //         {
    //             "internalType": "uint256",
    //             "name": "amount",
    //             "type": "uint256"
    //         }
    //     ],
    //     "name": "approve",
    //     "outputs": [
    //         {
    //             "internalType": "bool",
    //             "name": "",
    //             "type": "bool"
    //         }
    //     ],
    //     "stateMutability": "nonpayable",
    //     "type": "function"
    // }], signer);
    // const approveRes = await contractERC20.approve(contracts.dl, "1000000000000000000000000000000000000000000000000");
    // console.log(approveRes?.hash)

    // return

    const createStream = async () => {
        const blockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
        const start = blockTimestamp + 10, cliff = blockTimestamp + 100, end = blockTimestamp + 1000;

        const res = await DLStreamContract.createLinearStream({
            sender: signer.address,
            recipient: '0xAD3A45194eC873d8d6ED908590CF59F7309d6a5f',
            totalAmount: "1000000000000000000000",
            asset: token,
            cancelable: true,
            transferable: true,
            range: { cliff, start, end },
        }, 1, {
            gasLimit: 2000000
        })

        await res?.wait(2);
    }

    await createStream();

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});