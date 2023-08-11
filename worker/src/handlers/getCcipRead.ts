import { SigningKey } from 'ethers/lib/utils'

import { database } from '../ccip-read/db'
import { makeApp } from '../ccip-read/server'
import { Env } from '../env'

export const getCcipRead = async (request: Request, env: Env) => {
  const signer = new SigningKey(env.PRIVATE_KEY)
  const ccipRouter = makeApp(signer, '/lookup/', database, env)
  return ccipRouter.handle(request)
}
