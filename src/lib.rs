#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env,
};

mod test;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InsufficientLiquidity = 3,
    InvalidAmount = 4,
    InvalidToken = 5,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    TokenA,
    TokenB,
    ReservesA,
    ReservesB,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SwapEvent {
    pub user: Address,
    pub amount_in: i128,
    pub amount_out: i128,
}

#[contract]
pub struct LiquidityPool;

#[contractimpl]
impl LiquidityPool {
    /// Deposit liquidity into the pool.
    /// In this simplified version, the first deposit sets the token addresses.
    pub fn deposit(
        env: Env,
        user: Address,
        token_a: Address,
        token_b: Address,
        amount_a: i128,
        amount_b: i128,
    ) -> Result<(), ContractError> {
        user.require_auth();

        if amount_a <= 0 || amount_b <= 0 {
            return Err(ContractError::InvalidAmount);
        }

        // Initialize tokens if not already set
        if !env.storage().instance().has(&DataKey::TokenA) {
            env.storage().instance().set(&DataKey::TokenA, &token_a);
            env.storage().instance().set(&DataKey::TokenB, &token_b);
            env.storage().instance().set(&DataKey::ReservesA, &0i128);
            env.storage().instance().set(&DataKey::ReservesB, &0i128);
        } else {
            // Verify swap pair matches
            let stored_a: Address = env.storage().instance().get(&DataKey::TokenA).unwrap();
            let stored_b: Address = env.storage().instance().get(&DataKey::TokenB).unwrap();
            if (token_a != stored_a || token_b != stored_b) && (token_a != stored_b || token_b != stored_a) {
                return Err(ContractError::InvalidToken);
            }
        }

        // Transfer tokens to the contract
        let client_a = token::Client::new(&env, &token_a);
        let client_b = token::Client::new(&env, &token_b);

        client_a.transfer(&user, &env.current_contract_address(), &amount_a);
        client_b.transfer(&user, &env.current_contract_address(), &amount_b);

        // Update reserves
        let res_a: i128 = env.storage().instance().get(&DataKey::ReservesA).unwrap_or(0);
        let res_b: i128 = env.storage().instance().get(&DataKey::ReservesB).unwrap_or(0);

        // Logic assumes token_a passed matches DataKey::TokenA
        let stored_a: Address = env.storage().instance().get(&DataKey::TokenA).unwrap();
        if token_a == stored_a {
            env.storage().instance().set(&DataKey::ReservesA, &(res_a + amount_a));
            env.storage().instance().set(&DataKey::ReservesB, &(res_b + amount_b));
        } else {
            env.storage().instance().set(&DataKey::ReservesA, &(res_a + amount_b));
            env.storage().instance().set(&DataKey::ReservesB, &(res_b + amount_a));
        }

        Ok(())
    }

    /// Swap Token A for Token B using constant product formula: x * y = k
    pub fn swap(
        env: Env,
        user: Address,
        token_in: Address,
        amount_in: i128,
    ) -> Result<i128, ContractError> {
        user.require_auth();

        if amount_in <= 0 {
            return Err(ContractError::InvalidAmount);
        }

        if !env.storage().instance().has(&DataKey::TokenA) {
            return Err(ContractError::NotInitialized);
        }

        let token_a: Address = env.storage().instance().get(&DataKey::TokenA).unwrap();
        let token_b: Address = env.storage().instance().get(&DataKey::TokenB).unwrap();
        
        let (res_in, res_out, token_out) = if token_in == token_a {
            (
                env.storage().instance().get::<_, i128>(&DataKey::ReservesA).unwrap(),
                env.storage().instance().get::<_, i128>(&DataKey::ReservesB).unwrap(),
                token_b.clone()
            )
        } else if token_in == token_b {
            (
                env.storage().instance().get::<_, i128>(&DataKey::ReservesB).unwrap(),
                env.storage().instance().get::<_, i128>(&DataKey::ReservesA).unwrap(),
                token_a.clone()
            )
        } else {
            return Err(ContractError::InvalidToken);
        };

        if res_in == 0 || res_out == 0 {
            return Err(ContractError::InsufficientLiquidity);
        }

        // Constant Product Formula: (x + dx)(y - dy) = xy
        // dy = (y * dx) / (x + dx)
        let amount_out = (res_out * amount_in) / (res_in + amount_in);

        if amount_out <= 0 {
            return Err(ContractError::InsufficientLiquidity);
        }

        // Transfer tokens
        let client_in = token::Client::new(&env, &token_in);
        let client_out = token::Client::new(&env, &token_out);

        client_in.transfer(&user, &env.current_contract_address(), &amount_in);
        client_out.transfer(&env.current_contract_address(), &user, &amount_out);

        // Update reserves
        if token_in == token_a {
            env.storage().instance().set(&DataKey::ReservesA, &(res_in + amount_in));
            env.storage().instance().set(&DataKey::ReservesB, &(res_out - amount_out));
        } else {
            env.storage().instance().set(&DataKey::ReservesB, &(res_in + amount_in));
            env.storage().instance().set(&DataKey::ReservesA, &(res_out - amount_out));
        }

        // Emit Event
        env.events().publish(
            (symbol_short!("swap"),),
            SwapEvent {
                user: user.clone(),
                amount_in,
                amount_out,
            },
        );

        Ok(amount_out)
    }

    pub fn get_reserves(env: Env) -> (i128, i128) {
        let a = env.storage().instance().get(&DataKey::ReservesA).unwrap_or(0);
        let b = env.storage().instance().get(&DataKey::ReservesB).unwrap_or(0);
        (a, b)
    }
}
