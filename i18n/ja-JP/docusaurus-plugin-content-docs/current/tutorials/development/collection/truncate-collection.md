---
title: "コレクションの Truncate | Cloud"
slug: /truncate-collection
sidebar_label: "コレクションの Truncate"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "コレクションを Truncate すると、コレクションのスキーマ、制約、インデックスを保持したまま、すべてのエンティティが削除されます。これはエンティティを削除するよりも効率的です。現在のタイムスタンプより前に flush されたすべてのエンティティを検索やクエリから隠し、バックグラウンドで削除するためです。 | Cloud"
type: origin
token: JMtVw2kCYiunF9khkmHcFWbFnxf
sidebar_position: 11
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションの Truncate

コレクションを Truncate すると、コレクションのスキーマ、制約、インデックスを保持したまま、すべてのエンティティが削除されます。これはエンティティを削除するよりも効率的です。現在のタイムスタンプより前に flush されたすべてのエンティティを検索やクエリから隠し、バックグラウンドで削除するためです。

<Admonition type="info" icon="📘" title="Notes">

この機能は managed collection にのみ適用されます。

</Admonition>

## 概要\{#overview}

コレクションの Truncate は、スキーマ、制約、インデックスなどの構造定義を完全に保持しながら、コレクションからすべてのエンティティを削除する高性能な操作です。これにより、再設定やインデックスの再構築を必要とせず、コレクションはすぐに新しいデータの取り込みに使用できる状態に保たれます。

レコードを個別に処理し、大量のトランザクションログを生成する従来の削除方法とは異なり、Truncate は最適化された 2 段階のメカニズムで動作します。

1. **即時の論理削除**

    Truncate のタイムスタンプより前に挿入または削除されたすべてのエンティティは即座に flush され、検索やクエリから隠されるため、以降の操作からは実質的に見えなくなります。

1. **効率的な物理クリーンアップ**

    システムは影響を受けたすべてのデータセグメントをバックグラウンドでガベージコレクションし、エンティティごとの削除処理によるオーバーヘッドを排除します。

Truncate は、テスト環境の更新、パイプラインステージのクリーンアップ、定期的なデータライフサイクル管理など、データセット全体の迅速なリセットが必要で、性能とリソース効率が重要なユースケースに最適です。

## 例\{#example}

次のコード例では、`my_collection` という名前のコレクションがすでに存在していることを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
// C++
```

</TabItem>
</Tabs>
