import { Link } from '@/components/ui'

export function Footer() {
  return (
    <footer className="flex gap-6">
      <Link href="https://docs.ens.domains/learn/ccip-read/">Docs</Link>
      <Link href="https://github.com/gskril/ens-offchain-registrar">Repo</Link>
    </footer>
  )
}
