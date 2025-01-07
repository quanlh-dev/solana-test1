import {
  Keypair,
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
} from "@solana/spl-token";
import { pumpFunBuy, pumpFunSell } from "./pump-fun/swap";
import { TransactionMode } from "./pump-fun/types";

// Utility to create and store generated wallets
function generateWallets(count: number): Keypair[] {
  const wallets: Keypair[] = [];
  for (let i = 0; i < count; i++) {
    wallets.push(Keypair.generate());
  }
  return wallets;
}

function getKeyPairFromPrivateKey(privateKey) {
  const secretKey = Uint8Array.from(JSON.parse(privateKey));
  return Keypair.fromSecretKey(secretKey);
}

async function getTokenBalance(walletPublicKey, mintStr) {
  try {
    const connection = new Connection(
      "https://api.mainnet-beta.solana.com",
      "confirmed"
    );

    const publicKey = new PublicKey(walletPublicKey);
    const mint = new PublicKey(mintStr);

    const associatedTokenAddress = await getAssociatedTokenAddress(
      mint,
      publicKey
    );

    const account = await getAccount(connection, associatedTokenAddress);

    return Number(account.amount);
  } catch (error) {
    console.error("Error getting token balance:", error);
    return null;
  }
}

async function main() {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

  // Parameters
  const parentWalletPrivateKey = "<YOUR_PARENT_WALLET_PRIVATE_KEY_HERE>"; // Replace with your parent wallet private key
  const mintStr = "<TOKEN_MINT_ADDRESS_HERE>"; // Replace with your token's mint address
  const totalSolToSpend = 1; // Total SOL to spend buying tokens
  const priorityFeeInSol = 0.001; // Optional fee for priority transaction
  const slippageDecimal = 0.25; // Slippage

  // Generate 10 wallets
  const wallets = generateWallets(10);
  console.log(
    "Generated wallets:",
    wallets.map((w) => w.publicKey.toBase58())
  );

  // Calculate SOL amount per wallet
  const solPerWallet = totalSolToSpend / wallets.length;

  try {
    // Buy tokens using the parent wallet
    console.log("Buying tokens...");
    await pumpFunBuy(
      TransactionMode.Execution, // Transaction mode
      parentWalletPrivateKey,
      mintStr,
      totalSolToSpend,
      priorityFeeInSol,
      slippageDecimal
    );

    // Distribute tokens equally among wallets in a single transaction
    console.log("Distributing tokens...");
    const parentWalletPublicKey = new PublicKey(
      getKeyPairFromPrivateKey(parentWalletPrivateKey).publicKey
    );
    const tx = new Transaction();

    for (const wallet of wallets) {
      const tokenAccount = await getAssociatedTokenAddress(
        new PublicKey(mintStr),
        wallet.publicKey
      );
      const amountToSend = totalSolToSpend / wallets.length;
      tx.add(
        createTransferInstruction(
          parentWalletPublicKey,
          tokenAccount,
          parentWalletPublicKey,
          amountToSend
        )
      );
    }

    const signature = await connection.sendTransaction(tx, [
      getKeyPairFromPrivateKey(parentWalletPrivateKey),
    ]);
    console.log("Token distribution transaction confirmed:", signature);

    // Sell tokens from each wallet
    console.log("Selling tokens from wallets...");
    for (const wallet of wallets) {
      try {
        const tokenBalance = await getTokenBalance(wallet.publicKey, mintStr);
        if (tokenBalance) {
          await pumpFunSell(
            TransactionMode.Execution, // Transaction mode
            wallet.secretKey.toString(),
            mintStr,
            tokenBalance,
            priorityFeeInSol,
            slippageDecimal
          );
        }
        console.log(`Tokens sold for wallet: ${wallet.publicKey.toBase58()}`);
      } catch (error) {
        console.error(
          `Failed to sell tokens for wallet ${wallet.publicKey.toBase58()}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error during token operations:", error);
  }
}

main();
