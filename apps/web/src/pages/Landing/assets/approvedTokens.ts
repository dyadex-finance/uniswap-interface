import { GraphQLApi } from '@universe/api'
import ethereumLogo from '~/assets/images/ethereum-logo.png'
import { NATIVE_CHAIN_ID } from '~/constants/tokens'

export interface InteractiveToken {
  name: string
  symbol: string
  address: string
  chain: GraphQLApi.Chain
  color: string
  logoUrl: string
}

export const approvedERC20: InteractiveToken[] = [
  {
    name: 'USDCoin',
    symbol: 'USDC',
    address: '0x754704Bc059F8C67012fEd69BC8A327a5aafb603',
    chain: GraphQLApi.Chain.Monad,
    color: '#2775CA',
    logoUrl:
      'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  },
  {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    chain: GraphQLApi.Chain.Monad,
    color: '#F7931A',
    logoUrl:
      'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
  },
  {
    name: 'Uniswap',
    symbol: 'UNI',
    color: '#FF007A',
    logoUrl:
      'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    chain: GraphQLApi.Chain.Monad,
  },
  {
    name: 'Monad',
    symbol: 'MON',
    color: '#680BF3',
    logoUrl: 'https://assets.coingecko.com/coins/images/38927/large/monad.jpg',
    address: NATIVE_CHAIN_ID,
    chain: GraphQLApi.Chain.Monad,
  },
]
