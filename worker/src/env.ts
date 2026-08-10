import type { Hex } from 'viem'

export interface Env {
  PRIVATE_KEY: Hex
  DB: D1Database
  /** Names can only be written as direct subnames of this. Set in wrangler.toml */
  PARENT_NAME: string
}
