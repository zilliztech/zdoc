---
slug: /connect-to-cluster
beta: FALSE
notebook: FALSE
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Connect to Cluster

This article offers a systematic guide on connecting to a cluster.

## Before you start{#before-you-start}

Ensure the following prerequisites are met before proceeding:

- You have registered an account with Zilliz Cloud. For details, see [Register with Zilliz Cloud](./register-with-zilliz-cloud) .

- You have created a cluster. For details, see [Create Cluster](./create-cluster).

- You have installed a Milvus SDK applicable to your use case. For details, see [Install SDKs](./install-sdks) .

:::info Notes

For those leaning towards the utilization of RESTful APIs over SDKs, it's important to understand that a continuous connection cannot be established. This is attributed to the HTTP protocol's unidirectional communication mode.

:::

## Connect to a cluster{#connect-to-a-cluster}

Once your cluster is operational, connect to it utilizing its public endpoint and an authentication token. This token can either be an [API key](./manage-cluster-credentials) or a [cluster credential](./manage-cluster-credentials) comprised of a username-password duo.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# Initialize a MilvusClient instance
from pymilvus import MilvusClient

client = MilvusClient(
    #  Public endpoint obtained from Zilliz Cloud
    uri=CLUSTER_ENDPOINT,
    token=TOKEN,
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

const address = "<PUBLIC_ENDPOINT>";
// token="username:password" or token="your-api-key" 
const token = "<TOKEN>";

const client = new MilvusClient({ address, token });
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.client.MilvusServiceClient;
import io.milvus.param.ConnectParam;

// 1. Connect to Zilliz Cloud
ConnectParam connectParam = ConnectParam.newBuilder()
    .withUri(PUBLIC-ENDPOINT)
    // TOKEN="username:password" or TOKEN="your-api-key" 
    .withToken(TOKEN)
    .build();

MilvusServiceClient client = new MilvusServiceClient(connectParam);

System.out.println("Connected to Zilliz Cloud!");
```

</TabItem>

<TabItem value='go'>

```go

CLUSTER_ENDPOINT := "YOUR_CLUSTER_ENDPOINT"
// token="username:password" or token="your-api-key" 
TOKEN := "YOUR_CLUSTER_TOKEN"
COLLNAME := "medium_articles_2020"

// 1. Connect to cluster

connParams := client.Config{
    Address:       CLUSTER_ENDPOINT,
    APIKey:        TOKEN,
    EnableTLSAuth: true,
}

conn, err := client.NewClient(context.Background(), connParams)

if err != nil {
    log.Fatal("Failed to connect to Zilliz Cloud:", err.Error())
}
```

</TabItem>

<TabItem value='bash'>

```bash
# token="username:password" or token="your-api-key"
curl --request GET \\
    --url "${PUBLIC_ENDPOINT}/v1/vector/collections" \\
    --header "Authorization: Bearer ${TOKEN}" \\
    --header 'accept: application/json' \\
    --header 'content-type: application/json'
```

</TabItem>
</Tabs>

## Related topics{#related-topics}

- [Create Collection](./create-collection-2) 

- [Insert Entities](./insert-entities) 

- [Search and Query](./search-query-and-get) 

- [Drop Collection](./drop-collection-1) 
