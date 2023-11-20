---
slug: /docs/connect-to-cluster
beta: FALSE
notebook: FALSE
sidebar_position: 2
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Connect to Cluster

This article offers a systematic guide on connecting to a cluster.

## Before you start{#before-you-start}

Ensure the following prerequisites are met before proceeding:

- You have registered an account with Zilliz Cloud. For details, see [Register with Zilliz Cloud](./register-with-zilliz-cloud) .

- You have created a cluster. For details, see [Create Cluster](./create-cluster).

- You have installed a Milvus SDK applicable to your use case. For details, see [Install SDKs](./install-sdks) .

<Admonition type="info" icon="📘" title="Notes">

For those leaning towards the utilization of RESTful APIs over SDKs, it's important to understand that a continuous connection cannot be established. This is attributed to the HTTP protocol's unidirectional communication mode.

</Admonition>

## Connect to a cluster{#connect-to-a-cluster}

Once your cluster is operational, connect to it utilizing its public endpoint and an authentication token. This token can either be an [API key](./manage-cluster-credentials) or a [cluster credential](./manage-cluster-credentials) comprised of a username-password duo.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

<Tabs groupId="python" defaultValue='python' values={[{"label":"Starter API","value":"python"},{"label":"Advanced API","value":"python_1"}]}>
<TabItem value='python'>

```python
# Connect using a MilvusClient object
from pymilvus import MilvusClient
CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT" # Set your cluster endpoint
TOKEN="YOUR_CLUSTER_TOKEN" # Set your token

# Initialize a MilvusClient instance
# Replace uri and API key with your own
client = MilvusClient(
    uri=CLUSTER_ENDPOINT, # Cluster endpoint obtained from the console
    token=TOKEN # API key or a colon-separated cluster username and password
)

```

</TabItem>
<TabItem value='python_1'>

```python
# Connect with a connections object
from pymilvus import connections

connections.connect(
  alias='default', 
  #  Public endpoint obtained from Zilliz Cloud
  uri=CLUSTER_ENDPOINT,
  # API key or a colon-separated cluster username and password
  token=TOKEN, 
)
```

</TabItem>
</Tabs>
</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT"
const token = "YOUR_CLUSTER_TOKEN"

async function main () {

    // Connect to the cluster
    const client = new MilvusClient({address, token})
    
}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.client.MilvusServiceClient;
import io.milvus.param.ConnectParam;

public final class QuickStartDemo {

    public static void main(String[] args) {
        String clusterEndpoint = "YOUR_CLUSTER_ENDPOINT";
        String token = "YOUR_CLUSTER_TOKEN";

        // 1. Connect to Zilliz Cloud

        ConnectParam connectParam = ConnectParam.newBuilder()
            .withUri(clusterEndpoint)
            .withToken(token)
            .build();   
            
        MilvusServiceClient client = new MilvusServiceClient(connectParam);

        System.out.println("Connected to Zilliz Cloud!");

        // Output:
        // Connected to Zilliz Cloud!
        
    }
    
 }

```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus-sdk-go/v2/client"

func main() {
    CLUSTER_ENDPOINT := "YOUR_CLUSTER_ENDPOINT"
    TOKEN := "YOUR_CLUSTER_TOKEN"
    COLLNAME := "medium_articles_2020"

    // 1. Connect to cluster

    connParams := client.Config{
        Address: CLUSTER_ENDPOINT,
        APIKey:  TOKEN,
    }

    conn, err := client.NewClient(context.Background(), connParams)

    if err != nil {
        log.Fatal("Failed to connect to Zilliz Cloud:", err.Error())
    }
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

- [Create Collection](./create-collection) 

- [Insert Entities](./insert-entities) 

- [Search and Query](./search-query-and-get) 

- [Drop Collection](./drop-collection) 
