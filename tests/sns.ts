import BN from "bn.js";
import assert from "assert";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { Sns } from "../target/types/sns";

// ✅ Use Anchor’s default local provider
anchor.setProvider(anchor.AnchorProvider.env());
const provider = anchor.getProvider();
const program = anchor.workspace.Sns as anchor.Program<Sns>;
const connection = provider.connection;

// ✅ Create new test keypairs
const user = web3.Keypair.generate();
const treasury = web3.Keypair.generate();
const admin = provider.wallet; // 👈 now uses local keypair from ~/.config/solana/id.json

const NAME = "akhil";
const METADATA = "Akhil Kumar 🧠";
const PRICE_PER_CHAR = new BN(1_000_000); // 0.001 SOL

let configPDA: web3.PublicKey;
let namePDA: web3.PublicKey;
let reversePDA: web3.PublicKey;

describe("sns", () => {
  before(async () => {
    // ✅ Airdrop SOL to test accounts
    for (const pubkey of [user.publicKey, treasury.publicKey]) {
      const sig = await connection.requestAirdrop(pubkey, 2e9); // 2 SOL
      await connection.confirmTransaction(sig);
    }

    // ✅ Derive config PDA
    [configPDA] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );
  });

  it("Initializes config", async () => {
    await program.methods
      .initializeConfig(admin.publicKey, treasury.publicKey, PRICE_PER_CHAR)
      .accounts({
        admin: admin.publicKey,
        config: configPDA,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    const config = await program.account.config.fetch(configPDA);
    assert.ok(config.admin.equals(admin.publicKey));
    assert.ok(config.treasury.equals(treasury.publicKey));
    assert.ok(config.pricePerChar.eq(PRICE_PER_CHAR));
  });

  it("Registers name", async () => {
    [namePDA] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("name"), Buffer.from(NAME)],
      program.programId
    );

    [reversePDA] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("reverse"), user.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .registerName(NAME, METADATA)
      .accounts({
        user: user.publicKey,
        nameRecord: namePDA,
        reverseRecord: reversePDA,
        config: configPDA,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    const nameRecord = await program.account.nameRecord.fetch(namePDA);
    assert.equal(nameRecord.name, NAME);
    assert.equal(nameRecord.metadata, METADATA);
    assert.ok(nameRecord.owner.equals(user.publicKey));
  });

  it("Sets reverse record", async () => {
    await program.methods
      .setReverseRecord(NAME)
      .accounts({
        user: user.publicKey,
        reverse: reversePDA,
        nameRecord: namePDA,
      })
      .signers([user])
      .rpc();

    const reverse = await program.account.reverseRecord.fetch(reversePDA);
    assert.equal(reverse.name, NAME);
  });

  it("Renews name", async () => {
    const before = await program.account.nameRecord.fetch(namePDA);

    await program.methods
      .renewName()
      .accounts({
        user: user.publicKey,
        nameRecord: namePDA,
        config: configPDA,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    const after = await program.account.nameRecord.fetch(namePDA);
    assert.ok(after.expiresAt.toNumber() > before.expiresAt.toNumber());
  });

  it("Updates metadata", async () => {
    const updated = "Updated Metadata";

    await program.methods
      .updateMetadata(updated)
      .accounts({
        user: user.publicKey,
        nameRecord: namePDA,
      })
      .signers([user])
      .rpc();

    const nameRecord = await program.account.nameRecord.fetch(namePDA);
    assert.equal(nameRecord.metadata, updated);
  });

  it("Withdraws fees to treasury", async () => {
    const before = await connection.getBalance(treasury.publicKey);

    await program.methods
      .withdrawFees()
      .accounts({
        admin: admin.publicKey,
        config: configPDA,
        treasury: treasury.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    const after = await connection.getBalance(treasury.publicKey);
    assert.ok(after > before);
  });
});

