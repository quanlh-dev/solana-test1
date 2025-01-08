# Solana Wallet Management Script

## Description
This project includes a script that:
- Generates 10 wallets.
- Buys tokens using a parent wallet and distributes them equally among the 10 generated wallets in a single transaction.
- Sells tokens from each wallet back into SOL.
- Includes retry logic for the buy operation.

## Installation

1. **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

## Usage

1. **Set up environment variables:**
    - Create a `.env` file in the root directory and add the following variables:
      ```env
      PARENT_WALLET_PRIVATE_KEY=<YOUR_PARENT_WALLET_PRIVATE_KEY>
      TOKEN_MINT_ADDRESS=<TOKEN_MINT_ADDRESS>
      TOTAL_SOL_TO_SPEND=1
      PRIORITY_FEE_IN_SOL=0.001
      SLIPPAGE_DECIMAL=0.25
      ```

2. **Run the script:**
    ```bash
    npm start
    ```

## Functions explained

### `generateWallets(count: number): Keypair[]`
Generates and returns an array of `count` Keypairs.

### `getKeyPairFromPrivateKey(privateKey: string): Keypair`
Converts a private key string to a Keypair.

### `getTokenBalance(walletPublicKey: PublicKey, mintStr: string): Promise<number | null>`
Fetches and returns the token balance of a given wallet.

### `pumpFunBuy(transactionMode: TransactionMode, payerPrivateKey: string, mintStr: string, solIn: number, priorityFeeInSol: number, slippageDecimal: number)`
Buys tokens using the parent wallet with retry logic.

### `pumpFunSell(transactionMode: TransactionMode, payerPrivateKey: string, mintStr: string, tokenBalance: number, priorityFeeInSol: number, slippageDecimal: number)`
Sells tokens from a wallet back into SOL.

### `main()`
Main function that:
1. Generates 10 wallets.
2. Buys tokens using the parent wallet and distributes them equally among the 10 wallets in a single transaction.
3. Sells tokens from each wallet back into SOL.

## Scripts

- `npm start`: Runs the main script.
- `npm run build`: Builds the project.