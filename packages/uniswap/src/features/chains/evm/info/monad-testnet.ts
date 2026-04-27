import { Token } from '@dyadex-finance/sdk-core'
import { GraphQLApi } from '@universe/api'
import { SwapConfigKey } from '@universe/gating'
import { MONAD_LOGO_FILLED } from 'ui/src/assets'
import { CHAIN_ID_TO_URL_PARAM } from 'uniswap/src/features/chains/chainUrlParam'
import {
  DEFAULT_MS_BEFORE_WARNING,
  DEFAULT_NATIVE_ADDRESS_LEGACY,
  getInfuraEndpointUrl,
  getQuicknodeEndpointUrl,
} from 'uniswap/src/features/chains/evm/rpc'
import { buildChainTokens } from 'uniswap/src/features/chains/evm/tokens'
import {
  GqlChainId,
  NetworkLayer,
  RPCType,
  UniverseChainId,
  UniverseChainInfo,
} from 'uniswap/src/features/chains/types'
import { Platform } from 'uniswap/src/features/platforms/types/Platform'
import { ElementName } from 'uniswap/src/features/telemetry/constants'
import { buildUSDC } from 'uniswap/src/features/tokens/stablecoin'

const testnetTokens = buildChainTokens({
  stables: {
    USDC: buildUSDC('0x754704Bc059F8C67012fEd69BC8A327a5aafb603', UniverseChainId.MonadTestnet),
    AUSD: new Token(UniverseChainId.MonadTestnet, '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a', 6, 'AUSD', 'Agora USD'),
  },
})

export const MONAD_TESTNET_CHAIN_INFO = {
  id: UniverseChainId.MonadTestnet,
  platform: Platform.EVM,
  testnet: true,
  assetRepoNetworkName: 'monad',
  backendChain: {
    chain: GraphQLApi.Chain.Monad as GqlChainId,
    backendSupported: true,
    nativeTokenBackendAddress: undefined,
  },
  bridge: 'https://monadbridge.com/',
  docs: 'https://docs.monad.xyz/',
  label: 'Monad Testnet',
  logo: MONAD_LOGO_FILLED,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad Testnet',
    symbol: 'MON',
    decimals: 18,
    address: DEFAULT_NATIVE_ADDRESS_LEGACY,
    logo: MONAD_LOGO_FILLED,
  },
  networkLayer: NetworkLayer.L1,
  blockTimeMs: 500,
  pendingTransactionsRetryOptions: undefined,
  statusPage: undefined, // TODO: Add status page URL when available
  supportsV4: true,
  supportsNFTs: false,
  urlParam: CHAIN_ID_TO_URL_PARAM[UniverseChainId.MonadTestnet],
  rpcUrls: {
    [RPCType.Public]: {
      http: [getInfuraEndpointUrl(UniverseChainId.MonadTestnet)],
    },
    [RPCType.Default]: {
      http: [getInfuraEndpointUrl(UniverseChainId.MonadTestnet)],
    },
    [RPCType.Interface]: {
      http: [getInfuraEndpointUrl(UniverseChainId.MonadTestnet)],
    },
  },
  wrappedNativeCurrency: {
    name: 'Wrapped Monad',
    symbol: 'WMON',
    decimals: 18,
    address: '0x1Aa879Cc5181dF273250cFF68D29DD0A5751e3Fd',
  },
  blockPerMainnetEpochForChainId: 1,
  blockWaitMsBeforeWarning: DEFAULT_MS_BEFORE_WARNING,
  elementName: ElementName.ChainMonadTestnet,
  explorer: {
    name: 'MonadVision',
    url: 'https://testnet.monadvision.com/',
  },
  interfaceName: 'monad',
  tokens: testnetTokens,
  tradingApiPollingIntervalMs: 150, // approximately 1/3 of block time, which is around 400-500 ms
  gasConfig: {
    send: {
      configKey: SwapConfigKey.MonSendMinGasAmount,
      default: 20, // .002 ETH equivalent
    },
    swap: {
      configKey: SwapConfigKey.MonSwapMinGasAmount,
      default: 150, // .015 ETH equivalent
    },
  },
  acrossProtocolAddress: '0xd2ecb3afe598b746F8123CaE365a598DA831A449',
} as const satisfies UniverseChainInfo
