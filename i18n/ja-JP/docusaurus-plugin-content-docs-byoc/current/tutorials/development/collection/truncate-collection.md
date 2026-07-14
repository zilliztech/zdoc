---
title: "コレクションの Truncate | BYOC"
slug: /truncate-collection
sidebar_label: "コレクションの Truncate"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "コレクションの Truncate では、コレクションのスキーマ、制約、およびインデックスを保持したまま、すべてのエンティティを削除します。現在のタイムスタンプより前にフラッシュされたすべてのエンティティを検索およびクエリから隠し、バックグラウンドで削除するため、エンティティを削除するよりも効率的です。 | BYOC"
type: origin
token: JMtVw2kCYiunF9khkmHcFWbFnxf
sidebar_position: 11
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションの Truncate

コレクションの Truncate では、コレクションのスキーマ、制約、およびインデックスを保持したまま、すべてのエンティティを削除します。現在のタイムスタンプより前にフラッシュされたすべてのエンティティを検索およびクエリから隠し、バックグラウンドで削除するため、エンティティを削除するよりも効率的です。

## 概要\{#overview}

コレクションの Truncate は、スキーマ、制約、インデックスを含む構造定義を完全に保持したまま、コレクションからすべてのエンティティを削除する高パフォーマンスな操作です。これにより、再設定やインデックスの再構築を必要とせず、コレクションは新しいデータの取り込みにすぐ対応できる状態を維持できます。

レコードを個別に処理し、大量のトランザクションログを生成する従来の削除方法とは異なり、Truncate は最適化された 2 段階のメカニズムで動作します。

1. **即時の論理削除**

    Truncate タイムスタンプより前に挿入または削除されたすべてのエンティティは直ちにフラッシュされ、検索およびクエリから隠されるため、以降の操作では実質的に見えなくなります。

1. **効率的な物理クリーンアップ**

    システムは影響を受けたすべてのデータセグメントをバックグラウンドでガベージコレクションし、エンティティごとの削除処理のオーバーヘッドを排除します。

Truncate は、テスト環境のリフレッシュ、パイプラインステージのクリーンアップ、定期的なデータライフサイクル管理など、パフォーマンスとリソース効率が重要な、迅速かつ完全なデータセットのリセットを必要とするユースケースに最適です。

## 例\{#example}

以下のコード例では、すでに `my_collection` という名前のコレクションが存在していることを前提としています。

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
