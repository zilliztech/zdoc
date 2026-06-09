---
title: "Truncate Collection | Cloud"
slug: /truncate-collection
sidebar_label: "Truncate Collection"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Truncating a collection removes all entities while preserving the collection's schema, constraints, and indexes. It is more efficient than deleting entities because it hides all entities flushed before the current timestamp from searches and queries and drops them in the background. | Cloud"
type: origin
token: JMtVw2kCYiunF9khkmHcFWbFnxf
sidebar_position: 11
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Truncate Collection

Truncating a collection removes all entities while preserving the collection's schema, constraints, and indexes. It is more efficient than deleting entities because it hides all entities flushed before the current timestamp from searches and queries and drops them in the background.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature applies only to managed collections.</p>

</Admonition>

## Overview\{#overview}

Collection truncation is a high-performance operation that removes all entities from a collection while fully preserving its structural definition, including schema, constraints, and indexes. This keeps the collection immediately ready for new data ingestion without requiring reconfiguration or index rebuilding.

Unlike conventional deletion methods that process records individually and generate extensive transaction logs, truncation operates through an optimized two-step mechanism:

1. **Immediate logical removal**

    All entities inserted or deleted before the truncation timestamp are immediately flushed and hidden from searches and queries, making them effectively invisible to subsequent operations.

1. **Efficient physical cleanup**

    The system garbage-collects all affected data segments in the background, eliminating the overhead of per-entity deletion processing.

Truncation is ideal for use cases that require rapid, complete dataset resets, such as test environment refreshes, pipeline stage cleanup, or periodic data lifecycle management, where performance and resource efficiency are critical.

## Example\{#example}

The following code examples assume that you already have a collection named `my_collection`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.truncate_collection(
    collection_name="my_collection"
)
```

</TabItem>

<TabItem value='java'>

```java
// java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.TruncateCollectionReq;

public class TruncateExample {
  public static void main(String[] args) {
      ConnectConfig connectConfig = ConnectConfig.builder()
              .uri("YOUR_CLUSTER_ENDPOINT")
              .token("YOUR_CLUSTER_TOKEN")
              .build();
      MilvusClientV2 client = new MilvusClientV2(connectConfig);

      // Truncate collection
      TruncateCollectionReq req = TruncateCollectionReq.builder()
              .collectionName("my_collection")
              .build();
      client.truncateCollection(req);

      System.out.println("collection truncated successfully");
      client.close();
  }
}
```

</TabItem>

<TabItem value='go'>

```go
// go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

func main() {
    ctx := context.Background()

    client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
            Address: "YOUR_CLUSTER_ENDPOINT",
            APIKey: "YOUR_CLUSTER_TOKEN"
    })
    if err != nil {
            log.Fatal("failed to connect:", err)
    }
    defer client.Close(ctx)

    err = client.TruncateCollection(ctx, milvusclient.NewTruncateCollectionOption("my_collection"))
    if err != nil {
            log.Fatal("failed to truncate:", err)
    }

    fmt.Println("collection truncated successfully")
}
```

</TabItem>

<TabItem value='javascript'>

```javascript

const milvusClient = new MilvusClient({ 
    address: 'YOUR_CLUSTER_ENDPOINT', 
    token: 'YOUR_CLUSTER_TOKEN'
});

const res = await milvusClient.truncateCollection({
    collection_name: my_collection,
 });
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# restful
curl -X POST "${CLUSTER_ENDPOINT}/v2/vectordb/collections/truncate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Request-Timeout: 10" \
  -d '{
    "dbName": "default",
    "collectionName": "my_collection"
  }'
```

</TabItem>
</Tabs>

