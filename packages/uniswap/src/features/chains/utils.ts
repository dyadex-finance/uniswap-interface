import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { Token } from '@dyadex-finance/sdk-core'
import { GraphQLApi } from '@universe/api'
import { PollingInterval } from 'uniswap/src/constants/misc'
import { ALL_CHAIN_IDS, getChainInfo, ORDERED_CHAINS } from 'uniswap/src/features/chains/chainInfo'
import { EnabledChainsInfo, GqlChainId, NetworkLayer, UniverseChainId } from 'uniswap/src/features/chains/types'
import { Platform } from 'uniswap/src/features/platforms/types/Platform'

// Some code from the web app uses chainId types as numbers
// This validates them as coerces into SupportedChainId
export function toSupportedChainId(chainId?: BigNumberish): UniverseChainId | null {
  if (!chainId || !ALL_CHAIN_IDS.map((c) => c.toString()).includes(chainId.toString())) {
    return null
  }
  return parseInt(chainId.toString(), 10) as UniverseChainId
}

export function getChainLabel(chainId: UniverseChainId): string {
  return getChainInfo(chainId).label
}

/**
 * Return the explorer name for the given chain ID
 * @param chainId the ID of the chain for which to return the explorer name
 */
export function getChainExplorerName(chainId: UniverseChainId): string {
  return getChainInfo(chainId).explorer.name
}

export function isTestnetChain(chainId: UniverseChainId): boolean {
  return Boolean(getChainInfo(chainId)?.testnet)
}

export function isBackendSupportedChainId(chainId: UniverseChainId): boolean {
  const info = getChainInfo(chainId)
  return info.backendChain.backendSupported
}

export function isBackendSupportedChain(chain: GraphQLApi.Chain): chain is GqlChainId {
  const chainId = fromGraphQLChain(chain)
  if (!chainId) {
    return false
  }

  return isBackendSupportedChainId(chainId)
}

export function chainIdToHexadecimalString(chainId: UniverseChainId): string {
  return BigNumber.from(chainId).toHexString()
}

export function hexadecimalStringToInt(hex: string): number {
  return parseInt(hex, 16)
}

export function isL2ChainId(chainId?: UniverseChainId): boolean {
  return chainId !== undefined && getChainInfo(chainId).networkLayer === NetworkLayer.L2
}

export function isMainnetChainId(chainId?: UniverseChainId): boolean {
  return chainId === UniverseChainId.Monad || chainId === UniverseChainId.MonadTestnet
}

export function toGraphQLChain(chainId: UniverseChainId): GqlChainId {
  console.log(`toGraphQLChain`, chainId, getChainInfo(chainId))
  return getChainInfo(UniverseChainId.Monad).backendChain.chain
}

export function fromGraphQLChain(chain: GraphQLApi.Chain | string | undefined): UniverseChainId | null {
  switch (chain) {
    case GraphQLApi.Chain.Monad:
      return UniverseChainId.Monad
    case GraphQLApi.Chain.MonadTestnet:
      return UniverseChainId.MonadTestnet
  }

  return null
}

export function getPollingIntervalByBlocktime(chainId?: UniverseChainId): PollingInterval {
  return isMainnetChainId(chainId) ? PollingInterval.Fast : PollingInterval.LightningMcQueen
}

export function fromUniswapWebAppLink(network: string | null): UniverseChainId {
  switch (network) {
    case GraphQLApi.Chain.Monad.toLowerCase():
      return UniverseChainId.Monad
    case GraphQLApi.Chain.MonadTestnet.toLowerCase():
      return UniverseChainId.MonadTestnet
    default:
      throw new Error(`Network "${network}" can not be mapped`)
  }
}

const CHAIN_ID_TO_UNISWAP_WEB_APP_LINK: Partial<Record<UniverseChainId, string>> = {
  [UniverseChainId.Monad]: GraphQLApi.Chain.Monad.toLowerCase(),
  [UniverseChainId.MonadTestnet]: GraphQLApi.Chain.MonadTestnet.toLowerCase(),
}

export function toUniswapWebAppLink(chainId: UniverseChainId): string | null {
  const network = CHAIN_ID_TO_UNISWAP_WEB_APP_LINK[chainId]

  if (!network) {
    throw new Error(`ChainID "${chainId}" can not be mapped`)
  }

  return network
}

export function filterChainIdsByFeatureFlag(featureFlaggedChainIds: {
  [key in UniverseChainId]?: boolean
}): UniverseChainId[] {
  return ALL_CHAIN_IDS.filter((chainId) => {
    return featureFlaggedChainIds[chainId] ?? true
  })
}

/**
 * Filters chain IDs by platform (EVM or SVM)
 * @param chainIds Array of chain IDs to filter (as numbers)
 * @param platform Platform to filter by (EVM or SVM)
 * @returns Filtered array of chain IDs matching the specified platform
 */
export function filterChainIdsByPlatform<T extends number>(chainIds: T[], platform: Platform): T[] {
  return chainIds.filter<T>((chainId): chainId is T => {
    const universeChainId = chainId as UniverseChainId
    if (!ALL_CHAIN_IDS.includes(universeChainId)) {
      return false
    }
    const chainInfo = getChainInfo(universeChainId)
    return chainInfo.platform === platform
  })
}

export function getEnabledChains({
  platform,
  /**
   * When `true`, it will return all enabled chains, including testnets.
   */
  includeTestnets = false,
  isTestnetModeEnabled,
  featureFlaggedChainIds,
}: {
  platform?: Platform
  isTestnetModeEnabled: boolean
  featureFlaggedChainIds: UniverseChainId[]
  includeTestnets?: boolean
}): EnabledChainsInfo {
  const enabledChainInfos = ORDERED_CHAINS.filter((chainInfo) => {
    // Filter by platform
    if (platform !== undefined && platform !== chainInfo.platform) {
      return false
    }

    // Filter by testnet mode
    if (!includeTestnets && isTestnetModeEnabled !== isTestnetChain(chainInfo.id)) {
      return false
    }

    // Filter by feature flags
    if (!featureFlaggedChainIds.includes(chainInfo.id)) {
      return false
    }

    if (chainInfo.id === UniverseChainId.Monad || chainInfo.id === UniverseChainId.MonadTestnet) {
      // Temporary hard filter for Monad chains
      return true
    }

    return false
  })

  // Extract chain IDs and GQL chains from filtered results
  const chains = enabledChainInfos.map((chainInfo) => chainInfo.id)
  const gqlChains = enabledChainInfos.map((chainInfo) => chainInfo.backendChain.chain)

  console.log({ chains, gqlChains })
  const result = {
    chains,
    gqlChains,
    defaultChainId: getDefaultChainId({ platform, isTestnetModeEnabled }),
    isTestnetModeEnabled,
  }

  return result
}

function getDefaultChainId({
  platform,
  isTestnetModeEnabled,
}: {
  platform?: Platform
  isTestnetModeEnabled: boolean
}): UniverseChainId {
  return isTestnetModeEnabled ? UniverseChainId.MonadTestnet : UniverseChainId.Monad
}

/** Returns all stablecoins for a given chainId. */
export function getStablecoinsForChain(chainId: UniverseChainId): Token[] {
  return getChainInfo(chainId).tokens.stablecoins
}

/** Checks if a token address is a stablecoin on the given chain. */
export function isStablecoinAddress(chainId: UniverseChainId, tokenAddress: string): boolean {
  try {
    const stablecoins = getStablecoinsForChain(chainId)
    return stablecoins.some((stablecoin) => stablecoin.address.toLowerCase() === tokenAddress.toLowerCase())
  } catch {
    return false
  }
}

/** Returns the primary stablecoin for a given chainId. */
export function getPrimaryStablecoin(chainId: UniverseChainId): Token {
  return getChainInfo(chainId).tokens.stablecoins[0]
}

export function isUniverseChainId(chainId?: number | UniverseChainId | null): chainId is UniverseChainId {
  return !!chainId && ALL_CHAIN_IDS.includes(chainId as UniverseChainId)
}
