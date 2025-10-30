import { expect } from "chai";
import { ethers } from "hardhat";

describe("TipJar", function () {
  it("forwards native tips and emits event", async function () {
    const [sender, recipient] = await ethers.getSigners();

    const TipJar = await ethers.getContractFactory("TipJar");
    const tipJar = await TipJar.deploy();
    await tipJar.waitForDeployment();

    const amount = ethers.parseEther("0.02");

    await expect(
      tipJar.connect(sender).tipNative(recipient.address, "thanks" as string, { value: amount })
    )
      .to.emit(tipJar, "NativeTip")
      .withArgs(sender.address, recipient.address, amount, "thanks");

    // Check recipient balance increased by ~amount (account for gas elsewhere by checking delta via provider)
    const balanceBefore = await ethers.provider.getBalance(recipient.address);
    // Send another tip to observe delta precisely
    await tipJar.connect(sender).tipNative(recipient.address, "again", { value: amount });
    const balanceAfter = await ethers.provider.getBalance(recipient.address);
    expect(balanceAfter - balanceBefore).to.equal(amount);
  });
});


