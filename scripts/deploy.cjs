const hre = require("hardhat");

async function main() {
  console.log("Починаємо деплой контракту AnonymousVoting...");

  // Динамічно завантажуємо офіційну бібліотеку Semaphore
  const { getDeployedContract } = await import("@semaphore-protocol/utils");
  
  // Автоматично отримуємо 100% правильну адресу для мережі Sepolia
  const semaphore = getDeployedContract("sepolia");
  console.log(`✅ Знайдено офіційний Semaphore за адресою: ${semaphore.address}`);

  // Деплоїмо наш контракт, передаючи йому справжню адресу
  const Voting = await hre.ethers.getContractFactory("AnonymousVoting");
  const voting = await Voting.deploy(semaphore.address);

  await voting.waitForDeployment();
  const address = await voting.getAddress();

  console.log(`🚀 КОНТРАКТ УСПІШНО ЗАДЕПЛОЄНО! Твоя адреса: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});