import { Currency, NativeCurrency, Token, UNI_ADDRESSES, WETH9 } from '@dyadex-finance/sdk-core'
import { getChainInfo } from 'uniswap/src/features/chains/chainInfo'
import { MONAD_CHAIN_INFO } from 'uniswap/src/features/chains/evm/info/monad'
import { MONAD_TESTNET_CHAIN_INFO } from 'uniswap/src/features/chains/evm/info/monad-testnet'
import { UniverseChainId } from 'uniswap/src/features/chains/types'
import { isUniverseChainId } from 'uniswap/src/features/chains/utils'
import { logger } from 'utilities/src/logger/logger'

export const { USDC: USDC_MONAD, AUSD: AUSD_MONAD } = MONAD_CHAIN_INFO.tokens

export const { USDC: USDC_SEPOLIA } = MONAD_TESTNET_CHAIN_INFO.tokens

export const USDC = USDC_MONAD

export const { USDT } = MONAD_CHAIN_INFO.tokens

export const WBTC = new Token(
  UniverseChainId.Monad,
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  8,
  'WBTC',
  'Wrapped BTC',
)

export const UNI = {
  [UniverseChainId.Monad]: new Token(
    UniverseChainId.Monad,
    UNI_ADDRESSES[UniverseChainId.Monad] as string,
    18,
    'UNI',
    'Uniswap',
  ),
  [UniverseChainId.MonadTestnet]: new Token(
    UniverseChainId.MonadTestnet,
    UNI_ADDRESSES[UniverseChainId.MonadTestnet] as string,
    18,
    'UNI',
    'Uniswap',
  ),
}

export const WRAPPED_NATIVE_CURRENCY: { [chainId: number]: Token | undefined } = {
  ...(WETH9 as Record<UniverseChainId, Token>),

  [UniverseChainId.Monad]: new Token(
    UniverseChainId.Monad,
    '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A',
    18,
    'WMON',
    'Wrapped Monad',
  ),
  [UniverseChainId.MonadTestnet]: new Token(
    UniverseChainId.MonadTestnet,
    '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A',
    18,
    'WMON',
    'Wrapped Monad',
  ),
}

class NativeCurrencyImpl extends NativeCurrency {
  public get wrapped(): Token {
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId]
    if (wrapped) {
      return wrapped
    }
    throw new Error(`Unsupported chain ID: ${this.chainId}`)
  }

  constructor(chainId: number) {
    if (!isUniverseChainId(chainId)) {
      logger.warn('tokens.ts', 'NativeCurrencyImpl', `Initializing native currency for non-universe chain: ${chainId}`)
      super(chainId, 18, 'ETH', 'Ethereum')
      return
    }

    const { name, decimals, symbol } = getChainInfo(chainId).nativeCurrency
    super(chainId, decimals, symbol, name)
  }

  public equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  }
}

const cachedNativeCurrency: { [chainId: number]: NativeCurrencyImpl } = {}

/**
 * @deprecated Prefer obtaining metadata via the non-sdk-based getChainInfo(chainId).nativeCurrency instead.
 *
 * Utility for obtaining an `@dyadex-finance/sdk-core` `NativeCurrency` instance for a given chainId.
 */
export function nativeOnChain(chainId: number): NativeCurrencyImpl {
  const cached = cachedNativeCurrency[chainId]

  if (cached) {
    return cached
  }

  const result = new NativeCurrencyImpl(chainId)
  cachedNativeCurrency[chainId] = result
  return result
}

// TODO[DAT-1513]: Replace with metadata fields from backend
export const UNICHAIN_BRIDGED_ASSETS: readonly BridgedAsset[] = [
  {
    unichainAddress: '0xbde8a5331e8ac4831cf8ea9e42e229219eafab97', // SOL
    nativeChain: 'Solana',
    nativeAddress: 'native',
  },
  {
    unichainAddress: '0xbe51A5e8FA434F09663e8fB4CCe79d0B2381Afad', // JUP
    nativeChain: 'Solana',
    nativeAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  },
  {
    unichainAddress: '0x97Fadb3D000b953360FD011e173F12cDDB5d70Fa', // WIF
    nativeChain: 'Solana',
    nativeAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  },
  {
    unichainAddress: '0x15d0e0c55a3e7ee67152ad7e89acf164253ff68d', // HYPE
    nativeChain: 'HyperEVM',
    nativeAddress: 'native',
  },
  {
    unichainAddress: '0xBbE97f3522101e5B6976cBf77376047097BA837F', // BONK
    nativeChain: 'Solana',
    nativeAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  },
]

export function isBridgedAsset(address: string): boolean {
  return UNICHAIN_BRIDGED_ASSETS.some((asset) => asset.unichainAddress === address)
}

export type BridgedAsset = {
  unichainAddress: string
  nativeChain: string
  nativeAddress: string
}
