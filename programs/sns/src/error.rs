use anchor_lang::prelude::*;

#[error_code]
pub enum SnsError {
    #[msg("Name is too long")]
    NameTooLong,
    #[msg("Metadata is too long")]
    MetadataTooLong,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Insufficient funds for registration")]
    InsufficientFunds,
    #[msg("No fees available")]
    NoFeesAvailable,
}
