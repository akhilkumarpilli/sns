use anchor_lang::prelude::*;

use crate::{constants::CONFIG_SEED, state::Config};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = admin,space = 8+32+32+8, seeds = [CONFIG_SEED], bump)]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<Initialize>,
    admin: Pubkey,
    treasury: Pubkey,
    price: u64,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    config.admin = admin;
    config.treasury = treasury;
    config.price_per_char = price;
    Ok(())
}
