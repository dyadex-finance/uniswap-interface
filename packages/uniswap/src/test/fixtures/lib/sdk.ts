import { Token } from '@dyadex-finance/sdk-core'
import { getWrappedNativeAddressWithThrow } from 'uniswap/src/constants/addresses'
import { DEFAULT_NATIVE_ADDRESS_LEGACY } from 'uniswap/src/features/chains/evm/defaults'
import { UniverseChainId } from 'uniswap/src/features/chains/types'

export const ETH = new Token(UniverseChainId.Monad, DEFAULT_NATIVE_ADDRESS_LEGACY, 18, 'ETH', 'Ethereum')

export const WETH = new Token(
  UniverseChainId.Monad,
  getWrappedNativeAddressWithThrow(UniverseChainId.Monad),
  18,
  'WETH',
  'Wrapped Ether',
)
