import { useState } from 'react'
import { Input, Row, Col } from 'antd'
import NftHolders from './NftHolders'

export function App (): React.ReactElement {
  const [contractAddress, setContractAddress] = useState<string>('0xe0ab6916048ee208154bd76f1343d84b726fa62a')

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
