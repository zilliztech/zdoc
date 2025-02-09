---
title: "コレクションの変更 | Cloud"
slug: /modify-collections
sidebar_label: "コレクションの変更"
beta: FALSE
notebook: FALSE
description: "コレクションの名前を変更したり、設定を変更することができます。このページでは、コレクションの変更方法について説明します。 | Cloud"
type: origin
token: VNZ3wZORaiaC2Bk9yfEcZEponWb
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - modify collections
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションの変更

コレクションの名前を変更したり、設定を変更することができます。このページでは、コレクションの変更方法について説明します。

## コレクション名の変更{#rename-collection}{#rename-collection}

コレクションの名前は次のように変更できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.rename_collection(
    old_name="my_collection",
    new_name="my_new_collection"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.RenameCollectionReq;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();
    
MilvusClientV2 client = new MilvusClientV2(connectConfig);

RenameCollectionReq renameCollectionReq = RenameCollectionReq.builder()
        .collectionName("my_collection")
        .newCollectionName("my_new_collection")
        .build();

client.renameCollection(renameCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

const res = await client.renameCollection({
    oldName: "my_collection",
    newName: "my_new_collection"
});
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey:  token,
})
if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

err = cli.RenameCollection(ctx, milvusclient.NewRenameCollectionOption("my_collection", "my_new_collection"))
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/rename" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "newCollectionName": "my_new_collection"
}'
```

</TabItem>
</Tabs>

## コレクションのプロパティを設定{#set-collection-properties}{#set-collection-properties}

次のコードスニペットは、コレクションTTLを設定する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.alter_collection_properties(
    collection_name="my_collection",
    properties={"collection.ttl.seconds": 60}
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.AlterCollectionReq;
import java.util.HashMap;
import java.util.Map;

Map<String, String> properties = new HashMap<>();
properties.put("collection.ttl.seconds", "60");

AlterCollectionReq alterCollectionReq = AlterCollectionReq.builder()
        .collectionName("my_collection")
        .properties(properties)
        .build();

client.alterCollection(alterCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.alterCollection({
    collection_name: "my_collection",
    properties: {
        "collection.ttl.seconds": 60
    }
})
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
    "github.com/milvus-io/milvus/pkg/common"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

err = cli.AlterCollection(ctx, milvusclient.NewAlterCollectionOption("my_collection").WithProperty(common.CollectionTTLConfigKey, 60))
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
# REST
```

</TabItem>
</Tabs>

適用可能なコレクションプロパティは次のとおりです。

<table>
   <tr>
     <th><p>プロパティ</p></th>
     <th><p>いつ使用するか</p></th>
   </tr>
   <tr>
     <td><p><code>collection.ttl.seconds</code></p></td>
     <td><p>コレクションを特定の期間削除する必要がある場合は、Time-To-Live(TTL)を秒単位で設定することを検討してください。TTLがタイムアウトすると、Zilliz Cloudはコレクション内のエンティティを削除します。</p><p>削除は非同期であり、削除が完了する前に検索やクエリが可能であることを示しています。</p></td>
   </tr>
   <tr>
     <td><p><code>mmap.enabled</code></p></td>
     <td><p>メモリマッピング(Mmap)により、ディスク上の大きなファイルに直接メモリアクセスできるため、Zilliz Cloudはインデックスとデータをメモリとハードドライブの両方に保存できます。このアプローチにより、アクセス頻度に基づいてデータ配置ポリシーを最適化し、検索パフォーマンスに影響を与えることなくコレクションのストレージ容量を拡張できます。</p><p>\<ターゲットを含める="zilliz"></p><p>Zilliz Cloudは、クラスタの<a href="./use-mmap#mmapglobal-mmap-strategy">グローバルmmap設定</a>を実装しています。特定のフィールドまたはインデックスの設定を変更できます。</p><p>\</include></p></td>
   </tr>
</table>

