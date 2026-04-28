import { getDisplayChainIds } from 'uniswap/src/components/network/NetworkIconList/getDisplayChainIds'
import { UniverseChainId } from 'uniswap/src/features/chains/types'

describe(getDisplayChainIds, () => {
  it('returns empty array when chainIds is empty', () => {
    const enabled = [UniverseChainId.Monad, UniverseChainId.Polygon]
    expect(getDisplayChainIds([], enabled)).toEqual([])
  })

  it('returns only chain IDs that are in the enabled list', () => {
    const chainIds = [UniverseChainId.Monad, UniverseChainId.ArbitrumOne, UniverseChainId.Polygon]
    const enabled = [UniverseChainId.Monad, UniverseChainId.Polygon]
    expect(getDisplayChainIds(chainIds, enabled)).toEqual([UniverseChainId.Monad, UniverseChainId.Polygon])
  })

  it('filters out chains not in enabled list', () => {
    const chainIds = [UniverseChainId.Monad, UniverseChainId.Optimism]
    const enabled = [UniverseChainId.Monad]
    expect(getDisplayChainIds(chainIds, enabled)).toEqual([UniverseChainId.Monad])
  })

  it('deduplicates while preserving first occurrence order', () => {
    const chainIds = [UniverseChainId.Monad, UniverseChainId.Polygon, UniverseChainId.Monad, UniverseChainId.Polygon]
    const enabled = [UniverseChainId.Monad, UniverseChainId.Polygon]
    expect(getDisplayChainIds(chainIds, enabled)).toEqual([UniverseChainId.Monad, UniverseChainId.Polygon])
  })

  it('preserves input order when deduping', () => {
    const chainIds = [UniverseChainId.Polygon, UniverseChainId.Monad, UniverseChainId.Polygon]
    const enabled = [UniverseChainId.Monad, UniverseChainId.Polygon]
    expect(getDisplayChainIds(chainIds, enabled)).toEqual([UniverseChainId.Polygon, UniverseChainId.Monad])
  })

  it('returns at most enabledChainIds.length items', () => {
    const chainIds = [UniverseChainId.Monad, UniverseChainId.Polygon, UniverseChainId.ArbitrumOne]
    const enabled = [UniverseChainId.Monad, UniverseChainId.Polygon]
    const result = getDisplayChainIds(chainIds, enabled)
    expect(result).toHaveLength(2)
    expect(result).toEqual([UniverseChainId.Monad, UniverseChainId.Polygon])
  })

  it('never returns more than 3 icons even when more chains are enabled and provided', () => {
    const chainIds = [
      UniverseChainId.Monad,
      UniverseChainId.Polygon,
      UniverseChainId.ArbitrumOne,
      UniverseChainId.Optimism,
      UniverseChainId.Base,
    ]
    const enabled = [
      UniverseChainId.Monad,
      UniverseChainId.Polygon,
      UniverseChainId.ArbitrumOne,
      UniverseChainId.Optimism,
      UniverseChainId.Base,
    ]
    const result = getDisplayChainIds(chainIds, enabled)
    expect(result).toHaveLength(3)
    expect(result).toEqual([UniverseChainId.Monad, UniverseChainId.Polygon, UniverseChainId.ArbitrumOne])
  })
})
