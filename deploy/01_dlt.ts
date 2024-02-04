const { ethers } = require("hardhat");
import sablierAddress from "../scripts/stream/sablier.json"

module.exports = async ({ getNamedAccounts, deployments }: { getNamedAccounts: any, deployments: any }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  let sablier = (sablierAddress as any)[await ethers.provider.getNetwork().then((net: any) => net.chainId)] || { linear: "" };
  
  console.log(deployer, sablier.linear, sablier.dynamic)

  if(!sablier.linear){
    const DLSablierV2Comptroller = await deploy("DLSablierV2Comptroller", {
      from: deployer,
      args: [deployer],
      log: true,
    });
    const DLSablierV2NFTDescriptor = await deploy("DLSablierV2NFTDescriptor", {
      from: deployer,
      args: [],
      log: true,
    });
    const DLSablierV2LockupLinear = await deploy("DLSablierV2LockupLinear", {
      from: deployer,
      args: [deployer, DLSablierV2Comptroller.address, DLSablierV2NFTDescriptor.address],
      log: true,
    });
    sablier.linear = DLSablierV2LockupLinear.address;
    sablier.dynamic = DLSablierV2LockupLinear.address;
  }

  const DlStream = await deploy("DlStream", {
    from: deployer,
    args: [deployer, sablier.linear, sablier.dynamic],
    log: true,
  });
  console.log("DlStream", DlStream.address)

};
module.exports.tags = ["DlStream"];