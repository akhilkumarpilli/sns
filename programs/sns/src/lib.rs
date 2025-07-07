pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use instructions::*;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("6wfx3ZD75ePHe5ioWuwqJNbJmyAioYtT19QFHHGHbZxB");

#[program]
pub mod sns {
    use super::*;
    pub fn initialize_config(
        ctx: Context<Initialize>,
        admin: Pubkey,
        treasury: Pubkey,
        price_per_char: u64,
    ) -> Result<()> {
        initialize::handler(ctx, admin, treasury, price_per_char)
    }

    pub fn register_name(ctx: Context<Register>, name: String, metadata: String) -> Result<()> {
        register::handler(ctx, name, metadata)
    }

    pub fn renew_name(ctx: Context<Renew>) -> Result<()> {
        renew::handler(ctx)
    }

    pub fn update_metadata(ctx: Context<UpdateMetadata>, new_metadata: String) -> Result<()> {
        update_metadata::handler(ctx, new_metadata)
    }

    pub fn set_reverse_record(ctx: Context<SetReverseRecord>, name: String) -> Result<()> {
        set_reverse::handler(ctx, name)
    }

    pub fn withdraw_fees(ctx: Context<Withdraw>) -> Result<()> {
        withdraw::handler(ctx)
    }
}
