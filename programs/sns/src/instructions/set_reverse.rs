use anchor_lang::prelude::*;
use crate::{error::SnsError, state::*};

#[derive(Accounts)]
#[instruction(name: String)]
pub struct SetReverseRecord<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub reverse: Account<'info, ReverseRecord>,
    #[account(mut)]
    pub name_record: Account<'info, NameRecord>,
}

pub fn handler(ctx: Context<SetReverseRecord>, name: String) -> Result<()> {
    require!(
        ctx.accounts.name_record.owner == ctx.accounts.user.key(),
        SnsError::Unauthorized
    );
    ctx.accounts.reverse.name = name;
    Ok(())
}
