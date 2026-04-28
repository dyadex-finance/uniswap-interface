import { Currency, Token } from '@dyadex-finance/sdk-core'
import { GraphQLApi } from '@universe/api'
import type { ImageSourcePropType } from 'react-native'
import { MONAD_LOGO_FILLED } from 'ui/src/assets'
import { AUSD_MONAD, nativeOnChain, WBTC, WRAPPED_NATIVE_CURRENCY } from 'uniswap/src/constants/tokens'
import { uniswapUrls } from 'uniswap/src/constants/urls'
import { getChainInfo } from 'uniswap/src/features/chains/chainInfo'
import { UniverseChainId } from 'uniswap/src/features/chains/types'
import { CurrencyInfo, TokenList } from 'uniswap/src/features/dataApi/types'
import { buildCurrencyInfo } from 'uniswap/src/features/dataApi/utils/buildCurrency'
import { areAddressesEqual } from 'uniswap/src/utils/addresses'
import { isNativeCurrencyAddress } from 'uniswap/src/utils/currencyId'

type ChainCurrencyList = {
  readonly [chainId: number]: CurrencyInfo[]
}

/**
 * @deprecated
 * Instead, see the list used in the token selector's quick-select common options section at useAllCommonBaseCurrencies.ts.
 * This list is currently used as fallback list when Token GQL query fails for above list + for hardcoded tokens on testnet chains.
 */
export const COMMON_BASES: ChainCurrencyList = {
  [UniverseChainId.Monad]: [
    nativeOnChain(UniverseChainId.Monad),
    AUSD_MONAD,
    WBTC,
    WRAPPED_NATIVE_CURRENCY[UniverseChainId.Monad] as Token,
  ].map(buildPartialCurrencyInfo),

  [UniverseChainId.MonadTestnet]: [
    nativeOnChain(UniverseChainId.MonadTestnet),
    WRAPPED_NATIVE_CURRENCY[UniverseChainId.MonadTestnet] as Token,
  ].map(buildPartialCurrencyInfo),
}

export function getCommonBase(chainId?: number, address?: string): CurrencyInfo | undefined {
  if (!address || !chainId) {
    return undefined
  }

  const isNative = isNativeCurrencyAddress(chainId, address)
  return COMMON_BASES[chainId]?.find(
    (base) =>
      (base.currency.isNative && isNative) ||
      (base.currency.isToken &&
        areAddressesEqual({
          addressInput1: { address: base.currency.address, chainId: base.currency.chainId },
          addressInput2: { address, chainId },
        })),
  )
}

function getNativeLogoURI(chainId: UniverseChainId = UniverseChainId.Monad): ImageSourcePropType {
  if (chainId === UniverseChainId.Monad) {
    return MONAD_LOGO_FILLED as ImageSourcePropType
  }

  return getChainInfo(chainId).nativeCurrency.logo
}

function getTokenLogoURI(chainId: UniverseChainId, address: string): ImageSourcePropType | string | undefined {
  const chainInfo = getChainInfo(chainId)
  const networkName = chainInfo.assetRepoNetworkName

  return networkName
    ? `${uniswapUrls.uniswapAssetsBlockchainsBaseUrl}/${networkName}/assets/${address}/logo.png`
    : undefined
}

export function buildPartialCurrencyInfo(commonBase: Currency): CurrencyInfo {
  const logoUrl = commonBase.isNative
    ? getNativeLogoURI(commonBase.chainId)
    : getTokenLogoURI(commonBase.chainId, commonBase.address)

  return buildCurrencyInfo({
    currency: commonBase,
    logoUrl,
    safetyInfo: {
      tokenList: TokenList.Default,
      protectionResult: GraphQLApi.ProtectionResult.Benign,
    },
    isSpam: false,
  } as CurrencyInfo)
}
