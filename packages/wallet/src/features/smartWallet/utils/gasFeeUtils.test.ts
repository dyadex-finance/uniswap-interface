import { nativeOnChain } from 'uniswap/src/constants/tokens'
import { UniverseChainId } from 'uniswap/src/features/chains/types'
import { GasFeeData, GroupedGasFee, groupGasFeesBySymbol } from 'wallet/src/features/smartWallet/utils/gasFeeUtils'

describe('groupGasFeesBySymbol', () => {
  it.each([
    {
      name: 'single gas fee',
      input: [{ chainId: UniverseChainId.Monad, gasFeeDisplayValue: '1000000000000000' }],
      expected: {
        ETH: {
          totalFeeAmountInWei: '1000000000000000',
          chainIds: [UniverseChainId.Monad],
          currency: nativeOnChain(UniverseChainId.Monad),
        },
      },
    },
    {
      name: 'multiple gas fees same symbol',
      input: [
        { chainId: UniverseChainId.Monad, gasFeeDisplayValue: '1000000000000000' },
        { chainId: UniverseChainId.ArbitrumOne, gasFeeDisplayValue: '2000000000000000' },
      ],
      expected: {
        ETH: {
          totalFeeAmountInWei: '3000000000000000',
          chainIds: [UniverseChainId.Monad, UniverseChainId.ArbitrumOne],
          currency: nativeOnChain(UniverseChainId.Monad),
        },
      },
    },
    {
      name: 'multiple gas fees different symbols',
      input: [
        { chainId: UniverseChainId.Monad, gasFeeDisplayValue: '1000000000000000' },
        { chainId: UniverseChainId.Optimism, gasFeeDisplayValue: '1000000000000000' },
        { chainId: UniverseChainId.Polygon, gasFeeDisplayValue: '1000000000000000' },
      ],
      expected: {
        ETH: {
          totalFeeAmountInWei: '2000000000000000',
          chainIds: [UniverseChainId.Monad, UniverseChainId.Optimism],
          currency: nativeOnChain(UniverseChainId.Monad),
        },
        POL: {
          totalFeeAmountInWei: '1000000000000000',
          chainIds: [UniverseChainId.Polygon],
          currency: nativeOnChain(UniverseChainId.Polygon),
        },
      },
    },
  ] as Array<{
    name: string
    input: GasFeeData[]
    expected: Record<string, Partial<GroupedGasFee>>
  }>)('should handle $name', ({ input, expected }) => {
    const result = groupGasFeesBySymbol(input)
    expect(result).toEqual(expected)
  })
})
