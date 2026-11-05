import { blockConfigs } from '../../src/blocks'

export const allBlockSlugs = (): string[] => blockConfigs.map((b) => b.slug)
