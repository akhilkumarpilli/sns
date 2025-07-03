use anchor_lang::prelude::*;
use crate::{constants::*, error::SnsError, state::NameRecord};

#[derive(Accounts)]
pub struct UpdateMetadata<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [NAME_SEED, name_record.name.as_bytes()], bump)]
    pub name_record: Account<'info, NameRecord>,
}

pub fn handler(ctx: Context<UpdateMetadata>, new_metadata: String) -> Result<()> {
    require!(
        ctx.accounts.name_record.owner == ctx.accounts.user.key(),
        SnsError::Unauthorized
    );
    require!(
        new_metadata.len() <= MAX_METADATA_LEN,
        SnsError::MetadataTooLong
    );
    ctx.accounts.name_record.metadata = new_metadata;
    Ok(())
}
