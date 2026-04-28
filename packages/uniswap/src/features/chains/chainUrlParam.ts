import { UniverseChainId } from 'uniswap/src/features/chains/types'

/**
 * Canonical chain-ID → URL-param mapping.
 *
 * Typed as `Record<UniverseChainId, string>` so the build breaks whenever a new
 * chain is added to the enum without a corresponding URL param.
 *
 * This file intentionally has no transitive dependencies beyond the enum so it
 * can be safely imported from lightweight runtimes (e.g. Cloudflare Workers).
 */
export const CHAIN_ID_TO_URL_PARAM: Record<UniverseChainId, string> = {
  [UniverseChainId.Monad]: 'monad',
  [UniverseChainId.MonadTestnet]: 'monad_testnet',
}

/** Reverse mapping: URL-param → chain ID (built once, O(1) lookup). */
export const URL_PARAM_TO_CHAIN_ID: Record<string, UniverseChainId> = Object.fromEntries(
  Object.entries(CHAIN_ID_TO_URL_PARAM).map(([id, param]) => [param, Number(id) as UniverseChainId]),
) as Record<string, UniverseChainId>
