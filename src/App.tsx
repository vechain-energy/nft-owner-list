import { useState } from 'react'
import { Input, Row, Col } from 'antd'
import NftHolders from './NftHolders'

export function App (): React.ReactElement {
  const [contractAddress, setContractAddress] = useState<string>('0xC35d04F8783f85eDe2f329eed3C1E8B036223A06')

  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <Input.Search placeholder='enter contract address to search owners' onSearch={setContractAddress} />
      </Col>
      <Col span={24}>
        <NftHolders address={contractAddress} />
      </Col>
    </Row>
  )
}
