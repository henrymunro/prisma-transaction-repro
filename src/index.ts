import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

const numberOfConcurrentTransactions = parseInt(
  process.env.NUMBER_OF_CONCURRENT_TRANSACTIONS || "1",
  10
);

async function runTransaction() {
  const start = Date.now();

  try {
    await client.$transaction(async (t) => {
      // 👀 Note were using the client directly, not the transaction client here
      // If we use the transaction client here we have no issue
      await client.user.findMany();

      await t.user.findMany();
    });

    console.log(`Transaction succeeded - ${Date.now() - start}ms`);
  } catch (e: any) {
    console.log(`Transaction errored - ${Date.now() - start}ms `, e.message);
  }
}

async function main() {
  console.log(
    `Starting with ${numberOfConcurrentTransactions} concurrent transactions`
  );
  do {
    const promises = Array(numberOfConcurrentTransactions)
      .fill(0)
      .map(() => runTransaction());

    await Promise.all(promises);
  } while (true);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
