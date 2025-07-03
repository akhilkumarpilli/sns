use anchor_lang::prelude::*;

#[account]
pub struct Config {
    pub admin: Pubkey,
    pub treasury: Pubkey,
    pub price_per_char: u64,
}

#[account]
pub struct NameRecord {
    pub owner: Pubkey,
    pub name: String,
    pub metadata: String,
    pub expires_at: i64,
}

#[account]
pub struct ReverseRecord {
    pub name: String,
}
