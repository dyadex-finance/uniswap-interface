import { UniverseChainId } from 'uniswap/src/features/chains/types'
import { getPossibleChainMatchFromSearch } from 'uniswap/src/utils/search/getPossibleChainMatchFromSearch'

vi.mock('uniswap/src/features/chains/chainInfo', () => ({
  getChainInfo: vi.fn(),
}))

vi.mock('uniswap/src/features/chains/utils', () => ({
  isTestnetChain: vi.fn(),
}))

import { getChainInfo } from 'uniswap/src/features/chains/chainInfo'
import { isTestnetChain } from 'uniswap/src/features/chains/utils'

const mockGetChainInfo = getChainInfo as any
const mockIsTestnetChain = isTestnetChain as any

function setupChains(
  chains: Record<number, { nativeName: string; interfaceName: string; searchAliases?: string[] }>,
  testnetChains: number[] = [],
): void {
  mockIsTestnetChain.mockImplementation((chainId: number) => testnetChains.includes(chainId))
  mockGetChainInfo.mockImplementation((chainId: number) => {
    const config = chains[chainId]
    if (config) {
      return {
        nativeCurrency: { name: config.nativeName },
        interfaceName: config.interfaceName,
        searchAliases: config.searchAliases,
      } as any
    }
    return {} as any
  })
}

describe('getPossibleChainMatchFromSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when search query is empty or invalid', () => {
    it('should return null chainId when search query is empty string', () => {
      const result = getPossibleChainMatchFromSearch('', [UniverseChainId.Monad])

      expect(result).toEqual({ chainId: null, searchQuery: '' })
    })

    it('should return null chainId when search query is null', () => {
      const result = getPossibleChainMatchFromSearch(null as any, [UniverseChainId.Monad])

      expect(result).toEqual({ chainId: null, searchQuery: null })
    })

    it('should return null chainId when search query is undefined', () => {
      const result = getPossibleChainMatchFromSearch(undefined as any, [UniverseChainId.Monad])

      expect(result).toEqual({ chainId: null, searchQuery: undefined })
    })

    it('should return null chainId when search query is only whitespace', () => {
      setupChains({
        [UniverseChainId.Monad]: { nativeName: 'Ethereum', interfaceName: 'mainnet' },
      })

      const result = getPossibleChainMatchFromSearch('   ', [UniverseChainId.Monad])

      expect(result).toEqual({ chainId: null, searchQuery: '   ' })
    })
  })

  describe('when chain name appears at the start of the query', () => {
    it('should match native currency name at start and return remaining query', () => {
      setupChains({
        [UniverseChainId.Monad]: { nativeName: 'Ethereum', interfaceName: 'mainnet' },
      })

      const result = getPossibleChainMatchFromSearch('ethereum usdc', [UniverseChainId.Monad])

      expect(result).toEqual({ chainId: UniverseChainId.Monad, searchQuery: 'usdc' })
    })

    it('should match interface name at start and return remaining query', () => {
      setupChains({
        [UniverseChainId.Polygon]: { nativeName: 'POL', interfaceName: 'polygon' },
      })

      const result = getPossibleChainMatchFromSearch('polygon usdc', [UniverseChainId.Polygon])

      expect(result).toEqual({ chainId: UniverseChainId.Polygon, searchQuery: 'usdc' })
    })

    it('should be case insensitive', () => {
      setupChains({
        [UniverseChainId.Monad]: { nativeName: 'Ethereum', interfaceName: 'mainnet' },
      })

      const result = getPossibleChainMatchFromSearch('ETHEREUM usdc', [UniverseChainId.Monad])

      expect(result).toEqual({ chainId: UniverseChainId.Monad, searchQuery: 'usdc' })
    })
  })

  describe('when chain name appears at the end of the query', () => {
    it('should match native currency name at end and return remaining query', () => {
      setupChains({
        [UniverseChainId.Monad]: { nativeName: 'Ethereum', interfaceName: 'mainnet' },
      })

      const result = getPossibleChainMatchFromSearch('usdc ethereum', [UniverseChainId.Monad])

      expect(result).toEqual({ chainId: UniverseChainId.Monad, searchQuery: 'usdc' })
    })

    it('should match interface name at end and return remaining query', () => {
      setupChains({
        [UniverseChainId.ArbitrumOne]: { nativeName: 'Ethereum', interfaceName: 'arbitrum' },
      })

      const result = getPossibleChainMatchFromSearch('usdc arbitrum', [UniverseChainId.ArbitrumOne])

      expect(result).toEqual({ chainId: UniverseChainId.ArbitrumOne, searchQuery: 'usdc' })
    })

    it('should be case insensitive', () => {
      setupChains({
        [UniverseChainId.Polygon]: { nativeName: 'POL', interfaceName: 'polygon' },
      })

      const result = getPossibleChainMatchFromSearch('usdc POLYGON', [UniverseChainId.Polygon])

      expect(result).toEqual({ chainId: UniverseChainId.Polygon, searchQuery: 'usdc' })
    })
  })

  describe('when chain name is the exact query (no additional text)', () => {
    it('should not match when query is exactly the native currency name', () => {
      setupChains({
        [UniverseChainId.Monad]: { nativeName: 'Ethereum', interfaceName: 'mainnet' },
      })

      const result = getPossibleChainMatchFromSearch('ethereum', [UniverseChainId.Monad])

      expect(result).toEqual({ chainId: null, searchQuery: 'ethereum' })
    })

    it('should not match when query is exactly the interface name', () => {
      setupChains({
        [UniverseChainId.ArbitrumOne]: { nativeName: 'Ethereum', interfaceName: 'arbitrum' },
      })

      const result = getPossibleChainMatchFromSearch('arbitrum', [UniverseChainId.ArbitrumOne])

      expect(result).toEqual({ chainId: null, searchQuery: 'arbitrum' })
    })

    it('should not match shorter alias that is a prefix without a space boundary', () => {
      setupChains({
        [UniverseChainId.Polygon]: { nativeName: 'POL', interfaceName: 'polygon' },
      })

      const result = getPossibleChainMatchFromSearch('polygon', [UniverseChainId.Polygon])

      expect(result).toEqual({ chainId: null, searchQuery: 'polygon' })
    })
  })

  describe('when chain name appears in the middle of the query', () => {
    it('should not match when chain name is in the middle', () => {
      setupChains({
        [UniverseChainId.Monad]: { nativeName: 'Ethereum', interfaceName: 'mainnet' },
      })

      const result = getPossibleChainMatchFromSearch('buy ethereum token', [UniverseChainId.Monad])

      expect(result).toEqual({ chainId: null, searchQuery: 'buy ethereum token' })
    })
  })

  describe('when matching by search aliases', () => {
    it('should match a search alias at the start of the query', () => {
      setupChains({
        [UniverseChainId.Base]: { nativeName: 'Ethereum', interfaceName: 'base', searchAliases: ['base chain'] },
      })

      const result = getPossibleChainMatchFromSearch('base chain usdc', [UniverseChainId.Base])

      expect(result).toEqual({ chainId: UniverseChainId.Base, searchQuery: 'usdc' })
    })

    it('should match a search alias at the end of the query', () => {
      setupChains({
        [UniverseChainId.Base]: { nativeName: 'Ethereum', interfaceName: 'base', searchAliases: ['base chain'] },
      })

      const result = getPossibleChainMatchFromSearch('usdc base chain', [UniverseChainId.Base])

      expect(result).toEqual({ chainId: UniverseChainId.Base, searchQuery: 'usdc' })
    })

    it('should prefer the longest matching alias', () => {
      setupChains({
        [UniverseChainId.Monad]: {
          nativeName: 'Ethereum',
          interfaceName: 'eth',
          searchAliases: ['ethereum mainnet'],
        },
      })

      const result = getPossibleChainMatchFromSearch('ethereum mainnet usdc', [UniverseChainId.Monad])

      expect(result).toEqual({ chainId: UniverseChainId.Monad, searchQuery: 'usdc' })
    })
  })

  describe('when handling testnet chains', () => {
    it('should skip testnet chains', () => {
      setupChains(
        {
          [UniverseChainId.Monad]: { nativeName: 'Ethereum', interfaceName: 'mainnet' },
          [UniverseChainId.Sepolia]: { nativeName: 'Ethereum', interfaceName: 'sepolia' },
        },
        [UniverseChainId.Sepolia],
      )

      const result = getPossibleChainMatchFromSearch('ethereum usdc', [UniverseChainId.Monad, UniverseChainId.Sepolia])

      expect(result).toEqual({ chainId: UniverseChainId.Monad, searchQuery: 'usdc' })
      expect(mockIsTestnetChain).toHaveBeenCalledWith(UniverseChainId.Monad)
    })

    it('should return null chainId when only testnet chains are available', () => {
      setupChains(
        {
          [UniverseChainId.Sepolia]: { nativeName: 'Ethereum', interfaceName: 'sepolia' },
        },
        [UniverseChainId.Sepolia],
      )

      const result = getPossibleChainMatchFromSearch('ethereum usdc', [UniverseChainId.Sepolia])

      expect(result).toEqual({ chainId: null, searchQuery: 'ethereum usdc' })
    })
  })

  describe('when no matches are found', () => {
    it('should return null chainId when no chains match', () => {
      setupChains({
        [UniverseChainId.Monad]: { nativeName: 'Ethereum', interfaceName: 'mainnet' },
        [UniverseChainId.Polygon]: { nativeName: 'POL', interfaceName: 'polygon' },
      })

      const result = getPossibleChainMatchFromSearch('bitcoin usdc', [UniverseChainId.Monad, UniverseChainId.Polygon])

      expect(result).toEqual({ chainId: null, searchQuery: 'bitcoin usdc' })
    })

    it('should return null chainId when enabledChains is empty', () => {
      const result = getPossibleChainMatchFromSearch('ethereum usdc', [])

      expect(result).toEqual({ chainId: null, searchQuery: 'ethereum usdc' })
    })

    it('should return null chainId when all chains are testnets', () => {
      setupChains(
        {
          [UniverseChainId.Sepolia]: { nativeName: 'Ethereum', interfaceName: 'sepolia' },
          [UniverseChainId.UnichainSepolia]: { nativeName: 'Ethereum', interfaceName: 'unichain-sepolia' },
        },
        [UniverseChainId.Sepolia, UniverseChainId.UnichainSepolia],
      )

      const result = getPossibleChainMatchFromSearch('ethereum usdc', [
        UniverseChainId.Sepolia,
        UniverseChainId.UnichainSepolia,
      ])

      expect(result).toEqual({ chainId: null, searchQuery: 'ethereum usdc' })
    })
  })

  describe('when multiple chains could match', () => {
    it('should return the first matching chain in enabledChains order', () => {
      setupChains({
        [UniverseChainId.Monad]: { nativeName: 'Ethereum', interfaceName: 'mainnet' },
        [UniverseChainId.ArbitrumOne]: { nativeName: 'Ethereum', interfaceName: 'arbitrum' },
      })

      const result = getPossibleChainMatchFromSearch('ethereum usdc', [
        UniverseChainId.Monad,
        UniverseChainId.ArbitrumOne,
      ])

      expect(result).toEqual({ chainId: UniverseChainId.Monad, searchQuery: 'usdc' })
    })

    it('should prefer a chain that matches at the start over an earlier chain that matches only at the end', () => {
      setupChains({
        [UniverseChainId.Monad]: {
          nativeName: 'Ether',
          interfaceName: 'mainnet',
          searchAliases: ['alpha'],
        },
        [UniverseChainId.Polygon]: {
          nativeName: 'POL',
          interfaceName: 'foo',
        },
      })

      const result = getPossibleChainMatchFromSearch('foo alpha', [UniverseChainId.Monad, UniverseChainId.Polygon])

      expect(result).toEqual({ chainId: UniverseChainId.Polygon, searchQuery: 'alpha' })
    })
  })

  describe('query sanitization', () => {
    it('should trim whitespace from the remaining query', () => {
      setupChains({
        [UniverseChainId.Monad]: { nativeName: 'Ethereum', interfaceName: 'mainnet' },
      })

      const result = getPossibleChainMatchFromSearch('ethereum usdc', [UniverseChainId.Monad])

      expect(result).toEqual({ chainId: UniverseChainId.Monad, searchQuery: 'usdc' })
    })

    it('should collapse multiple spaces in the remaining query', () => {
      setupChains({
        [UniverseChainId.Monad]: { nativeName: 'Ethereum', interfaceName: 'mainnet' },
      })

      const result = getPossibleChainMatchFromSearch('usdc   ethereum', [UniverseChainId.Monad])

      expect(result).toEqual({ chainId: UniverseChainId.Monad, searchQuery: 'usdc' })
    })
  })

  describe('edge cases', () => {
    it('should handle interface names with special characters', () => {
      setupChains({
        [UniverseChainId.Monad]: { nativeName: 'Ethereum', interfaceName: 'main-net' },
      })

      const result = getPossibleChainMatchFromSearch('main-net usdc', [UniverseChainId.Monad])

      expect(result).toEqual({ chainId: UniverseChainId.Monad, searchQuery: 'usdc' })
    })

    it('should match base chain at start of query', () => {
      setupChains({
        [UniverseChainId.Monad]: { nativeName: 'Ethereum', interfaceName: 'mainnet' },
        [UniverseChainId.Base]: { nativeName: 'Ethereum', interfaceName: 'base' },
      })

      const result = getPossibleChainMatchFromSearch('base usdc', [UniverseChainId.Monad, UniverseChainId.Base])

      expect(result).toEqual({ chainId: UniverseChainId.Base, searchQuery: 'usdc' })
    })

    it('should not match when search aliases is an empty array', () => {
      setupChains({
        [UniverseChainId.Monad]: { nativeName: 'Ethereum', interfaceName: 'mainnet', searchAliases: [] },
      })

      const result = getPossibleChainMatchFromSearch('bitcoin usdc', [UniverseChainId.Monad])

      expect(result).toEqual({ chainId: null, searchQuery: 'bitcoin usdc' })
    })

    it('should not match when alias is a prefix of a word without a space', () => {
      setupChains({
        [UniverseChainId.Base]: { nativeName: 'Ethereum', interfaceName: 'base' },
      })

      const result = getPossibleChainMatchFromSearch('baseball', [UniverseChainId.Base])

      expect(result).toEqual({ chainId: null, searchQuery: 'baseball' })
    })

    it('should not match when alias is a suffix of a word without a space', () => {
      setupChains({
        [UniverseChainId.Base]: { nativeName: 'Ethereum', interfaceName: 'base' },
      })

      const result = getPossibleChainMatchFromSearch('coinbase', [UniverseChainId.Base])

      expect(result).toEqual({ chainId: null, searchQuery: 'coinbase' })
    })
  })
})
