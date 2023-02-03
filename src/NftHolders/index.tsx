import { useState, useEffect } from 'react'
import { API_URL, Events } from '../constants'
import { Table, Typography, Button, Alert } from 'antd'
import { saveAs } from 'file-saver'

import Papa from 'papaparse'

const CHUNK_SIZE = 250
const MAX_RETRIES = 10

const { Text } = Typography

interface Props {
  address: string
}

interface Event {
  tokenId: string
  _from: string
  _to: string
  _meta: any
}

interface Owner {
  address: string
  tokenIds: Set<string>
}
interface Owners {
  [key: string]: Owner
}

export default function NftHolders ({ address }: Props): React.ReactElement {
  const [events, setEvents] = useState<Event[]>([])
  const [owners, setOwners] = useState<Owners>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const loadTransfersFor = async (address: string): Promise<void> => {
    setLoading(true)
    const events: Event[] = []
    setError('')

    let allowedErrors = MAX_RETRIES
    do {
      try {
        const results = await fetch(`${API_URL}/${address}/${encodeURIComponent(Events.Transfer)}?limit=${CHUNK_SIZE}&offset=${events.length}`)
        const fetchedEvents = await results.json()
        if (fetchedEvents.length === 0) { break }
        events.push(...fetchedEvents)
      } catch (err: any) {
        allowedErrors--
        console.error(err)
        if (allowedErrors === 0) {
          setError(err.message)
        }
      }
    } while (events.length % CHUNK_SIZE === 0 && allowedErrors > 0)

    setEvents(
      events
        .sort((event1, event2) => event1._meta.blockNumber - event2._meta.blockNumber)
    )
    setLoading(false)
  }

  const handleDownload = (): void => {
    const columns = {
      address: 'Address',
      count: 'Count',
      tokenIds: 'Token Ids'
    }
    const data = [...Object.values(owners)]
      .filter(({ tokenIds }) => tokenIds.size > 0)
      .map(owner => ({ address: owner.address, count: owner.tokenIds.size, tokenIds: Array.from(owner.tokenIds).join(', ') }))

    const csv = Papa.unparse([columns, ...data], { header: false })
    const csvFile = new window.Blob([csv], { type: 'text/csv;charset=utf-8' })
    saveAs(csvFile, `NFT-Owners_${address}.csv`)
  }

  useEffect(() => {
    loadTransfersFor(address)
      .catch(console.error)
  }, [address])

  useEffect(() => {
    const owners = {}

    const ensureOwnerExists = (address): any => owners[address] !== undefined || (owners[address] = { address, tokenIds: new Set() })
    events.forEach(event => {
      [event._from, event._to].map(ensureOwnerExists)

      owners[event._from].tokenIds.delete(event.tokenId)
      owners[event._to].tokenIds.add(event.tokenId)
    })

    setOwners(owners)
  }, [events])

  return (
    <>
      {error !== '' && <Alert message='failed to load events' description={error} type='error' showIcon closable />}

      <Table
        loading={loading}
        rowKey='address'
        dataSource={
          [...Object.values(owners)]
            .filter(({ tokenIds }) => tokenIds.size > 0)
        }
        expandable={{
          expandedRowRender: (owner) => <Text type='secondary'>Owned Tokens: {Array.from(owner.tokenIds).join(', ')}</Text>,
          rowExpandable: (owner: Owner) => owner.tokenIds.size > 0
        }}
      >
        <Table.Column
          title='Owner'
          dataIndex='address'
          sorter={(a: Owner, b: Owner) => a.address.localeCompare(b.address)}
        />
        <Table.Column
          title='Count'
          render={owner => owner.tokenIds.size}
          sorter={(a: Owner, b: Owner) => a.tokenIds.size - b.tokenIds.size}
        />
      </Table>

      <Button block type='primary' onClick={handleDownload}>Download as CSV</Button>
    </>
  )
}
