import Link from 'next/link'
import Menu from '../components/Layout'

export default function Index() {
  return (
    <div>
      <div>
        <Menu />
      </div>
      <div>
        <ScrollMenu />
      </div>
    </div>
  )
}
