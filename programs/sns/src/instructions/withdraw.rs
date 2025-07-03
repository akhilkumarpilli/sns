use anchor_lang::prelude::*;
use crate::{constants::CONFIG_SEED, error::SnsError, state::*};

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, seeds = [CONFIG_SEED], bump, has_one = admin, has_one = treasury)]
    pub config: Account<'info, Config>,
    pub admin: Signer<'info>,
    /// CHECK: This is a writable destination account (treasury) owned by admin; validated via `has_one = treasury`
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
}

pub fn handler(ctx: Context<Withdraw>) -> Result<()> {
    let config_account = ctx.accounts.config.to_account_info();
    let treasury_account = ctx.accounts.treasury.to_account_info();

    let total_lamports = **config_account.lamports.borrow();
    let rent_exempt_min = Rent::get()?.minimum_balance(config_account.data_len());

    require!(total_lamports > rent_exempt_min, SnsError::NoFeesAvailable);

    let amount = total_lamports - rent_exempt_min;

    **config_account.try_borrow_mut_lamports()? -= amount;
    **treasury_account.try_borrow_mut_lamports()? += amount;

    Ok(())
}
