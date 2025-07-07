use anchor_lang::prelude::*;
use crate::{constants::*, error::SnsError, state::*};

#[derive(Accounts)]
pub struct Renew<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds=[CONFIG_SEED], bump)]
    pub config: Account<'info, Config>,
    #[account(mut, seeds = [NAME_SEED, name_record.name.as_bytes()], bump)]
    pub name_record: Account<'info, NameRecord>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Renew>) -> Result<()> {
    require!(
        ctx.accounts.name_record.owner == ctx.accounts.user.key(),
        SnsError::Unauthorized
    );
    let price = ctx.accounts.config.price_per_char * ctx.accounts.name_record.name.len() as u64;

    // charge fees
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.user.key(),
        &ctx.accounts.config.key(),
        price,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.config.to_account_info(),
        ],
    )?;

    ctx.accounts.name_record.expires_at = Clock::get()?.unix_timestamp + ONE_YEAR_IN_SECONDS;

    Ok(())
}
