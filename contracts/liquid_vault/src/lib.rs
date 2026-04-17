#![no_std]
use soroban_sdk::{contract, contractimpl, contractclient, Address, Env, log};

// Interface for the Token contract to enable inter-contract calls
#[contractclient(name = "TokenClient")]
pub trait TokenInterface {
    fn transfer(env: Env, from: Address, to: Address, amount: i128);
    fn balance(env: Env, id: Address) -> i128;
}

#[contract]
pub struct Vault;

#[contractimpl]
impl Vault {
    /// Deposits tokens into the vault by calling the token contract
    pub fn deposit(env: Env, from: Address, token_wasm_id: Address, amount: i128) {
        from.require_auth();
        
        let client = TokenClient::new(&env, &token_wasm_id);
        
        // INTER-CONTRACT CALL: Call transfer on the token contract
        client.transfer(&from, &env.current_contract_address(), &amount);
        
        // Track deposit in vault storage
        let current_deposit: i128 = env.storage().persistent().get(&from).unwrap_or(0);
        env.storage().persistent().set(&from, &(current_deposit + amount));
        
        log!(&env, "Vault: {} deposited {} from token {}", from, amount, token_wasm_id);
    }

    /// Checks the balance of a user in the vault
    pub fn get_vault_balance(env: Env, user: Address) -> i128 {
        env.storage().persistent().get(&user).unwrap_or(0)
    }
}
