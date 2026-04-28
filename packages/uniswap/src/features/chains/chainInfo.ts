import { MONAD_CHAIN_INFO } from 'uniswap/src/features/chains/evm/info/monad'
import { MONAD_TESTNET_CHAIN_INFO } from 'uniswap/src/features/chains/evm/info/monad-testnet'

import { UniverseChainId, UniverseChainInfo } from 'uniswap/src/features/chains/types'
import { Platform } from 'uniswap/src/features/platforms/types/Platform'
import { getNonEmptyArrayOrThrow } from 'utilities/src/primitives/array'

export function getChainInfo(chainId: UniverseChainId): UniverseChainInfo {
  return UNIVERSE_CHAIN_INFO[chainId]
}

export const ORDERED_CHAINS = [MONAD_CHAIN_INFO, MONAD_TESTNET_CHAIN_INFO] as const satisfies UniverseChainInfo[]

type ConstChainInfo<P extends Platform = Platform> = Extract<(typeof ORDERED_CHAINS)[number], { platform: P }>

function getOrderedEVMChains(): ConstChainInfo<Platform.EVM>[] {
  const evmChains: ConstChainInfo<Platform.EVM>[] = []
  for (const chain of ORDERED_CHAINS) {
    if (chain.platform === Platform.EVM) {
      evmChains.push(chain)
    }
  }
  return evmChains
}

export const ALL_CHAIN_IDS: UniverseChainId[] = ORDERED_CHAINS.map((chain) => chain.id)

// Exported with narrow typing for viem config typing on web. Will throw if no EVM chain is provided in ORDERED_CHAINS.
export const ORDERED_EVM_CHAINS = getNonEmptyArrayOrThrow(getOrderedEVMChains())

export const ALL_EVM_CHAIN_IDS = ORDERED_EVM_CHAINS.map((chain) => chain.id)

// Typing ensures the `UNIVERSE_CHAIN_INFO` map contains a proper mapping for each item defined in `ORDERED_EVM_CHAINS` (all keys defined & keys match corresponding value's `id` field)
type AllChainsMap = {
  [chainId in UniverseChainId]: Extract<ConstChainInfo, { id: chainId }>
}

export const UNIVERSE_CHAIN_INFO = {
  // MAINNETS
  [UniverseChainId.Monad]: MONAD_CHAIN_INFO,

  // TESTNET
  [UniverseChainId.MonadTestnet]: MONAD_TESTNET_CHAIN_INFO,
} as const satisfies AllChainsMap

export const GQL_MAINNET_CHAINS = ORDERED_EVM_CHAINS.filter((chain) => !chain.testnet).map(
  (chain) => chain.backendChain.chain,
)

export const GQL_TESTNET_CHAINS = ORDERED_EVM_CHAINS.filter((chain) => chain.testnet).map(
  (chain) => chain.backendChain.chain,
)

// If limit support expands beyond Mainnet, refactor to use a `supportsLimits`
// property on chain info objects and filter chains, similar to the pattern used above
export const LIMIT_SUPPORTED_CHAINS = [UniverseChainId.Monad]

export const TOUCAN_AUCTION_SUPPORTED_CHAINS = [UniverseChainId.Monad, UniverseChainId.MonadTestnet]
