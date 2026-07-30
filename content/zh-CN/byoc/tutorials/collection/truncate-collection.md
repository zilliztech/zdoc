---
title: "Truncate Collection | BYOC"
slug: /truncate-collection
sidebar_label: "Truncate Collection"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Truncate Collection 会移除 Collection 中的所有 Entity，同时保留 Collection 的 Schema、约束和 Index。相比删除 Entity，Truncate Collection 更高效，因为它会从 Search 和 Query 中隐藏当前时间戳之前已 flush 的所有 Entity，并在后台删除这些 Entity。 | BYOC"
type: origin
token: K1A9w7ioni59eek5Blqc6e10ndf
sidebar_position: 11
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Truncate Collection

Truncate Collection 会移除 Collection 中的所有 Entity，同时保留 Collection 的 Schema、约束和 Index。相比删除 Entity，Truncate Collection 更高效，因为它会从 Search 和 Query 中隐藏当前时间戳之前已 flush 的所有 Entity，并在后台删除这些 Entity。

<Admonition type="info" icon="📘" title="说明">

此功能仅适用于 Managed Collection。

</Admonition>

## 概述 \{#overview}

Collection Truncation 是一种高性能操作，可以从 Collection 中移除所有 Entity，同时完整保留其结构定义，包括 Schema、约束和 Index。这使 Collection 可以立即准备接收新数据，而无需重新配置或重建 Index。

与逐条处理记录并生成大量事务日志的常规删除方法不同，Truncation 通过优化的两步机制运行：

1. **立即逻辑移除**：在 Truncation 时间戳之前插入或删除的所有 Entity 都会立即 flush，并从 Search 和 Query 中隐藏，使其对后续操作不可见。

1. **高效物理清理**：系统会在后台对所有受影响的数据 Segment 执行垃圾回收，消除逐 Entity 删除处理带来的开销。

Truncation 非常适合需要快速、完整重置数据集的场景，例如测试环境刷新、Pipeline 阶段清理或周期性数据生命周期管理；在这些场景中，性能和资源效率都很关键。

## 示例 \{#example}

以下代码示例假设你已经有一个名为 `my_collection` 的 Collection。

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

```plaintext
// C++
```
