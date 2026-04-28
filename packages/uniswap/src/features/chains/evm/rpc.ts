import { config } from 'uniswap/src/config'
import { RetryOptions, RPCType, UniverseChainId } from 'uniswap/src/features/chains/types'
import { ONE_MINUTE_MS } from 'utilities/src/time/time'

/** Address that represents native currencies on ETH, Arbitrum, etc. */
export const DEFAULT_NATIVE_ADDRESS_LEGACY = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
export const DEFAULT_NATIVE_ADDRESS = '0x0000000000000000000000000000000000000000'
export const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 10, minWait: 250, medWait: 500, maxWait: 1000 }

export const DEFAULT_MS_BEFORE_WARNING = ONE_MINUTE_MS * 10

// Source: https://marketplace.quicknode.com/chains_and_networks

export function getQuicknodeChainId(chainId: UniverseChainId): string {
  switch (chainId) {
    case UniverseChainId.Monad:
      return 'monad-mainnet'

    case UniverseChainId.MonadTestnet:
      return 'monad-testnet'
    default:
      throw new Error(`Chain ${chainId} does not have a corresponding QuickNode chain ID`)
  }
}

// If chain requires a path suffix
export function getQuicknodeChainIdPathSuffix(chainId: UniverseChainId): string {
  switch (chainId) {
    default:
      return ''
  }
}

export function getQuicknodeEndpointUrl(chainId: UniverseChainId): string {
  const quicknodeChainId = getQuicknodeChainId(chainId)

  return `https://${config.quicknodeEndpointName}${quicknodeChainId ? `.${quicknodeChainId}` : ''}.quiknode.pro/${
    config.quicknodeEndpointToken
  }${getQuicknodeChainIdPathSuffix(chainId)}`
}

export function getInfuraChainId(chainId: UniverseChainId): string {
  switch (chainId) {
    case UniverseChainId.Monad:
      return 'monad-mainnet'
    case UniverseChainId.MonadTestnet:
      return 'monad-testnet'

    default:
      throw new Error(`Chain ${chainId} does not have a corresponding Infura chain ID`)
  }
}

export function getInfuraEndpointUrl(chainId: UniverseChainId): string {
  const infuraChainId = getInfuraChainId(chainId)

  return `https://${infuraChainId}.infura.io/v3/${config.infuraKey}`
}

export function getPlaywrightRpcUrls(url: string): { [key in RPCType]: { http: string[] } } {
  return {
    [RPCType.Public]: { http: [url] },
    [RPCType.Default]: { http: [url] },
    [RPCType.Fallback]: { http: [url] },
    [RPCType.Interface]: { http: [url] },
    [RPCType.Private]: { http: [url] },
    [RPCType.PublicAlt]: { http: [url] },
  }
}
