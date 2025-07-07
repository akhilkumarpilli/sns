use anchor_lang::prelude::*;
use crate::{constants::*, error::SnsError, state::*};

#[derive(Accounts)]
#[instruction(name: String)]
pub struct Register<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [CONFIG_SEED], bump)]
    pub config: Account<'info, Config>,

    #[account(init, payer = user, seeds = [b"name", name.as_bytes()], bump, space = 8 + 32 + 4 + MAX_NAME_LEN + 4 + MAX_METADATA_LEN + 8 )]
    pub name_record: Account<'info, NameRecord>,

    #[account(init_if_needed, payer = user, seeds = [b"reverse", user.key().as_ref()], bump, space = 8 + 4 + MAX_NAME_LEN )]
    pub reverse_record: Account<'info, ReverseRecord>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Register>, name: String, metadata: String) -> Result<()> {
    require!(name.len() <= MAX_NAME_LEN, SnsError::NameTooLong);
    require!(
        metadata.len() <= MAX_METADATA_LEN,
        SnsError::MetadataTooLong
    );

    let config = &ctx.accounts.config;
    let price = config.price_per_char * name.len() as u64;

    // charge fees from user
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

    let name_record = &mut ctx.accounts.name_record;
    name_record.name = name.clone();
    name_record.metadata = metadata;
    name_record.owner = ctx.accounts.user.key();
    name_record.expires_at = Clock::get()?.unix_timestamp + ONE_YEAR_IN_SECONDS;

    let reverse_record = &mut ctx.accounts.reverse_record;
    reverse_record.name = name;

    Ok(())
}
