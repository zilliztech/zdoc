---
slug: /connect-to-cluster
beta: FALSE
notebook: FALSE
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Connect to Cluster

This guide provides step-by-step instructions on how to connect to a cluster.

## Before you start{#before-you-start}

Before proceeding, ensure that you have completed the following steps:

- You have registered an account with Zilliz Cloud. For details, see [Register with Zilliz Cloud](./register-with-zilliz-cloud) .

- You have created a cluster. For details, see [Create Cluster](./create-cluster).

- You have installed a Milvus SDK applicable to your use case. For details, see [Install SDKs](./install-sdks) .

:::info Notes

If you prefer using RESTful APIs instead of SDKs, note that it's not possible to establish a persistent connection due to the unidirectional communication mechanism of the HTTP protocol.

:::

## Connect to a cluster{#connect-to-a-cluster}

Once a cluster is up, you can connect to it using its public endpoint and a token. The token can either be an [API key](./manage-api-keys) or a [cluster credential](./manage-cluster-credentials) that consists of a username and password pair.

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# Initialize a MilvusClient instance
# Replace uri and token with your own
from pymilvus import MilvusClient

client = MilvusClient(
        uri="<PUBLIC_ENDPOINT>", # Cluster endpoint obtained from the console
        token="<TOKEN>" # token="username:password" or token="your-api-key"
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

const address = "<PUBLIC_ENDPOINT>";
const token = "<TOKEN>";

const client = new MilvusClient({ address, token });
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.client.MilvusServiceClient;
import io.milvus.param.ConnectParam;

public class QuickStart 
{
    public static void main( String[] args )
    {
        // 1. Connect to Zilliz Cloud
        ConnectParam connectParam = ConnectParam.newBuilder()
            .withUri(PUBLIC-ENDPOINT)
            .withToken(TOKEN)
            .build();

        MilvusServiceClient client = new MilvusServiceClient(connectParam);

        System.out.println("Connected to Zilliz Cloud!");

     }
}
```

</TabItem>

<TabItem value='bash'>

```bash
# Replace uri and API key with your own
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
