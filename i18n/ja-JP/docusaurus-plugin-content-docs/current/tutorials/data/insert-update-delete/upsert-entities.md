---
title: "エンティティのアップサート | Cloud"
slug: /upsert-entities
sidebar_label: "エンティティのアップサート"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`upsert`操作は、コレクション内のエンティティを挿入または更新するための便利な方法を提供します。 | Cloud"
type: origin
token: YtJPwEVETiTaPMkWSfAccjXTnge
sidebar_position: 2
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - upsert
  - update
  - insert
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# エンティティのアップサート

`upsert`操作は、コレクション内のエンティティを挿入または更新するための便利な方法を提供します。

## 概要\{#overview}

アップサートリクエストで指定された主キーがコレクションに存在するかどうかに応じて、`upsert`を使用して新しいエンティティを挿入するか、既存のエンティティを更新することができます。主キーが見つからない場合は、挿入操作が行われます。それ以外の場合は、更新操作が実行されます。

アップサートリクエストは挿入と削除を組み合わせたものです。既存のエンティティに対する`upsert`リクエストを受信した際、Zilliz Cloudはリクエストペイロードに含まれるデータを挿入し、同時にデータで指定された元の主キーを持つ既存のエンティティを削除します。

![Q3LawAQIKht1FKbsM3EcoQAHnvc](/img/Q3LawAQIKht1FKbsM3EcoQAHnvc.png)

対象のコレクションで主キーに`autoid`が有効になっている場合、Zilliz Cloudはリクエストペイロードに含まれるデータに対して新しい主キーを生成してから挿入します。

`nullable`が有効になっているフィールドについては、更新が必要ない場合は`upsert`リクエストで省略できます。

### マージモードでのアップサート | PUBLIC\{#upsert-in-merge-mode}

`partial_update`フラグを使用して、アップサートリクエストをマージモードで動作させることもできます。これにより、リクエストペイロードに更新が必要なフィールドのみを含めることができます。

![NZNKwxm9ahmi87b487TcuCrNn4c](/img/NZNKwxm9ahmi87b487TcuCrNn4c.png)

マージを実行するには、`upsert`リクエストで主キーと新しい値で更新するフィールドとともに、`partial_update`を`True`に設定します。

そのようなリクエストを受信した際、Zilliz Cloudは強力な一貫性を持つクエリを実行してエンティティを取得し、リクエスト内のデータに基づいてフィールド値を更新し、変更されたデータを挿入し、リクエストで指定された元の主キーを持つ既存のエンティティを削除します。

### アップサートの動作: 特記事項\{#upsert-behaviors-special-notes}

マージ機能を使用する前に考慮すべき特別な注意点がいくつかあります。以下の場合では、`title`および`issue`という名前の2つのスカラーフィールドと、主キー`id`、および`vector`という名前のベクトルフィールドを持つコレクションがあると仮定します。

- **`nullable`が有効なフィールドのアップサート**

    `issue`フィールドがnullになる可能性があるとします。これらのフィールドをアップサートする際は、以下の点に注意してください。

    - `upsert`リクエストで`issue`フィールドを省略し、`partial_update`を無効にした場合、`issue`フィールドは元の値を保持するのではなく、`null`に更新されます。

    - `issue`フィールドの元の値を保持するには、`partial_update`を有効にして`issue`フィールドを省略するか、`upsert`リクエストで元の値を持つ`issue`フィールドを含める必要があります。

- **動的フィールドのキーのアップサート**

    サンプルコレクションで動的キーが有効になっており、エンティティの動的フィールド内のキーバリューペアが`{"author": "John", "year": 2020, "tags": ["fiction"]}`に似ていると仮定します。

    `author`、`year`、または`tags`などのキーを持つエンティティをアップサートするか、他のキーを追加する場合、以下の点に注意してください。

    - `partial_update`を無効にしてアップサートする場合、デフォルトの動作は**上書き**です。つまり、動的フィールドの値は、リクエストに含まれるスキーマ定義されていないすべてのフィールドとその値で上書きされます。

        たとえば、リクエストに含まれるデータが`{"author": "Jane", "genre": "fantasy"}`の場合、対象エンティティの動的フィールド内のキーバリューペアはそれになります。

    - `partial_update`を有効にしてアップサートする場合、デフォルトの動作は**マージ**です。つまり、動的フィールドの値は、リクエストに含まれるスキーマ定義されていないすべてのフィールドとその値とマージされます。

        たとえば、リクエストに含まれるデータが`{"author": "John", "year": 2020, "tags": ["fiction"]}`の場合、対象エンティティの動的フィールド内のキーバリューペアはアップサート後に`{"author": "Jane", "year": 2020, "tags": ["fiction"], "genre": "fantasy"}`になります。

- **JSONフィールドのアップサート**

    サンプルコレクションに`extras`という名前のスキーマ定義されたJSONフィールドがあり、エンティティのこのJSONフィールド内のキーバリューペアが`{"author": "John", "year": 2020, "tags": ["fiction"]}`に似ていると仮定します。

    修正されたJSONデータでエンティティの`extras`フィールドをアップサートする際、JSONフィールドは全体として扱われ、個々のキーを個別に更新することはできないことに注意してください。言い換えれば、JSONフィールドは**マージ**モードでのアップサートを**サポートしません**。

### 制限事項と制約\{#limits-and-restrictions}

上記の内容に基づき、従うべき制限事項と制約がいくつかあります。

- `upsert`リクエストには、対象エンティティの主キーを常に含める必要があります。

- 対象のコレクションはロードされており、クエリが可能である必要があります。

- リクエストで指定されたすべてのフィールドは、対象コレクションのスキーマに存在している必要があります。

- リクエストで指定されたすべてのフィールドの値は、スキーマで定義されたデータ型と一致する必要があります。

- 関数を使用して別のフィールドから派生したフィールドについては、Zilliz Cloudは再計算を可能にするためにアップサート時に派生フィールドを削除します。

## コレクションへのエンティティのアップサート\{#upsert-entities-in-a-collection}

このセクションでは、`my_collection`という名前のコレクションにエンティティをアップサートします。このコレクションには、`id`、`vector`、`title`、および`issue`という名前の4つのフィールドのみがあります。`id`フィールドは主キーフィールドであり、`title`フィールドと`issue`フィールドはスカラー値フィールドです。

アップサートリクエストに含まれる3つのエンティティが、コレクション内に存在する場合、それらはリクエストに含まれたもので上書きされます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

data=[
    {
        "id": 0,
        "vector": [-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911],
        "title": "Artificial Intelligence in Real Life",
        "issue": "vol.12"
    }, {
        "id": 1,
        "vector": [0.4762662251462588, -0.6942502138717026, -0.4490002642657902, -0.628696575798281, 0.9660395877041965],
        "title": "Hollow Man",
        "issue": "vol.19"
    }, {
        "id": 2,
        "vector": [-0.8864122635045097, 0.9260170474445351, 0.801326976181461, 0.6383943392381306, 0.7563037341572827],
        "title": "Treasure Hunt in Missouri",
        "issue": "vol.12"
    }
]

res = client.upsert(
    collection_name='my_collection',
    data=data
)

print(res)

# 出力
# {'upsert_count': 3}
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.UpsertReq;
import io.milvus.v2.service.vector.response.UpsertResp;

import java.util.*;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

Gson gson = new Gson();
List<JsonObject> data = Arrays.asList(
        gson.fromJson("{\"id\": 0, \"vector\": [-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911], \"title\": \"Artificial Intelligence in Real Life\", \"issue\": \"\vol.12\"}", JsonObject.class),
        gson.fromJson("{\"id\": 1, \"vector\": [0.4762662251462588, -0.6942502138717026, -0.4490002642657902, -0.628696575798281, 0.9660395877041965], \"title\": \"Hollow Man\", \"issue\": \"vol.19\"}", JsonObject.class),
        gson.fromJson("{\"id\": 2, \"vector\": [-0.8864122635045097, 0.9260170474445351, 0.801326976181461, 0.6383943392381306, 0.7563037341572827], \"title\": \"Treasure Hunt in Missouri\", \"issue\": \"vol.12\"}", JsonObject.class),
);

UpsertReq upsertReq = UpsertReq.builder()
        .collectionName("my_collection")
        .data(data)
        .build();

UpsertResp upsertResp = client.upsert(upsertReq);
System.out.println(upsertResp);

// 出力:
//
// UpsertResp(upsertCnt=3)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

data = [
    {id: 0, vector: [-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911], title: "Artificial Intelligence in Real Life", issue: "vol.12"},
    {id: 1, vector: [0.4762662251462588, -0.6942502138717026, -0.4490002642657902, -0.628696575798281, 0.9660395877041965], title: "Hollow Man", issue: "vol.19"},
    {id: 2, vector: [-0.8864122635045097, 0.9260170474445351, 0.801326976181461, 0.6383943392381306, 0.7563037341572827], title: "Treasure Hunt in Missouri", issue: "vol.12"},
]

res = await client.upsert({
    collection_name: "my_collection",
    data: data,
})

console.log(res.upsert_cnt)

// 出力
//
// 3
//
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

titleColumn := column.NewColumnString("title", []string{
    "Artificial Intelligence in Real Life", "Hollow Man", "Treasure Hunt in Missouri",
})

issueColumn := column.NewColumnString("issue", []string{
    "vol.12", "vol.19", "vol.12"
})

_, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("id", []int64{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}).
    WithFloatVectorColumn("vector", 5, [][]float32{
        {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592},
        {0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104},
        {0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592},
    }).
    WithColumns(titleColumn, issueColumn),
)
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/upsert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "data": [
        {"id": 0, "vector": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], "title": "Artificial Intelligence in Real Life", "issue": "vol.12"},
        {"id": 1, "vector": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], "title": "Hollow Man", "issue": "vol.19"},
        {"id": 2, "vector": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], "title": "Treasure Hunt in Missouri", "issue": "vol.12"},
],
    "collectionName": "my_collection"
}'

# {
#     "code": 0,
#     "data": {
#         "upsertCount": 3,
#         "upsertIds": [
#             0,
#             1,
#             2,
#         ]
#     }
# }
```

</TabItem>
</Tabs>

## パーティションへのエンティティのアップサート\{#upsert-entities-in-a-partition}

指定したパーティションにエンティティをアップサートすることもできます。以下のコードスニペットでは、コレクションに**PartitionA**という名前のパーティションが存在すると仮定しています。

リクエストに含まれる3つのエンティティが、パーティション内に存在する場合、それらはリクエストに含まれたもので上書きされます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data=[
    {
        "id": 10,
        "vector": [0.06998888224297328, 0.8582816610326578, -0.9657938677934292, 0.6527905683627726, -0.8668460657158576],
        "title": "Layour Design Reference",
        "issue": "vol.34"
    },
    {
        "id": 11,
        "vector": [0.6060703043917468, -0.3765080534566074, -0.7710758854987239, 0.36993888322346136, 0.5507513364206531],
        "title": "Doraemon and His Friends",
        "issue": "vol.2"
    },
    {
        "id": 12,
        "vector": [-0.9041813104515337, -0.9610546012461163, 0.20033003106083358, 0.11842506351635174, 0.8327356724591011],
        "title": "Pikkachu and Pokemon",
        "issue": "vol.12"
    },
]

res = client.upsert(
    collection_name="my_collection",
    data=data,
    partition_name="partitionA"
)

print(res)

# 出力
# {'upsert_count': 3}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.UpsertReq;
import io.milvus.v2.service.vector.response.UpsertResp;

Gson gson = new Gson();
List<JsonObject> data = Arrays.asList(
        gson.fromJson("{\"id\": 10, \"vector\": [0.06998888224297328, 0.8582816610326578, -0.9657938677934292, 0.6527905683627726, -0.8668460657158576], \"title\": \"Layour Design Reference\", \"issue\": \"vol.34\"}", JsonObject.class),
        gson.fromJson("{\"id\": 11, \"vector\": [0.6060703043917468, -0.3765080534566074, -0.7710758854987239, 0.36993888322346136, 0.5507513364206531], \"title\": \"Doraemon and His Friends\", \"issue\": \"vol.2\"}", JsonObject.class),
        gson.fromJson("{\"id\": 12, \"vector\": [-0.9041813104515337, -0.9610546012461163, 0.20033003106083358, 0.11842506351635174, 0.8327356724591011], \"title\": \"Pikkachu and Pokemon\", \"issue\": \"vol.12\"}", JsonObject.class),
);

UpsertReq upsertReq = UpsertReq.builder()
        .collectionName("my_collection")
        .partitionName("partitionA")
        .data(data)
        .build();

UpsertResp upsertResp = client.upsert(upsertReq);
System.out.println(upsertResp);

// 出力:
//
// UpsertResp(upsertCnt=3)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

// 6. パーティションにデータをアップサート
data = [
    {id: 10, vector: [0.06998888224297328, 0.8582816610326578, -0.9657938677934292, 0.6527905683627726, -0.8668460657158576], title: "Layour Design Reference", issue: "vol.34"},
    {id: 11, vector: [0.6060703043917468, -0.3765080534566074, -0.7710758854987239, 0.36993888322346136, 0.5507513364206531], title: "Doraemon and His Friends", issue: "vol.2"},
    {id: 12, vector: [-0.9041813104515337, -0.9610546012461163, 0.20033003106083358, 0.11842506351635174, 0.8327356724591011], title: "Pikkachu and Pokemon", issue: "vol.12"},
]

res = await client.upsert({
    collection_name: "my_collection",
    data: data,
    partition_name: "partitionA"
})

console.log(res.upsert_cnt)

// 出力
//
// 3
//
```

</TabItem>

<TabItem value='go'>

```go
titleColumn = column.NewColumnString("title", []string{
    "Layour Design Reference", "Doraemon and His Friends", "Pikkachu and Pokemon",
})
issueColumn = column.NewColumnString("issue", []string{
    "vol.34", "vol.2", "vol.12",
})

_, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithPartition("partitionA").
    WithInt64Column("id", []int64{10, 11, 12, 13, 14, 15, 16, 17, 18, 19}).
    WithFloatVectorColumn("vector", 5, [][]float32{
        {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592},
        {0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104},
        {0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592},
    }).
    WithColumns(titleColumn, issueColumn),
)
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/upsert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "data": [
        {"id": 10, "vector": [0.06998888224297328, 0.8582816610326578, -0.9657938677934292, 0.6527905683627726, -0.8668460657158576], "title": "Layour Design Reference", "issue": "vol.34"},
        {"id": 11, "vector": [0.6060703043917468, -0.3765080534566074, -0.7710758854987239, 0.36993888322346136, 0.5507513364206531], "title": "Doraemon and His Friends", "issue": "vol.2"},
        {"id": 12, "vector": [-0.9041813104515337, -0.9610546012461163, 0.20033003106083358, 0.11842506351635174, 0.8327356724591011], "title": "Pikkachu and Pokemon", "issue": "vol.12"},
    ],
    "collectionName": "my_collection",
    "partitionName": "partitionA"
}'

# {
#     "code": 0,
#     "data": {
#         "upsertCount": 3,
#         "upsertIds": [
#             10,
#             11,
#             12,
#         ]
#     }
# }
```

</TabItem>
</Tabs>

## マージモードでのエンティティのアップサート | PUBLIC\{#upsert-entities-in-merge-mode}

以下のコード例は、部分更新でエンティティをアップサートする方法を示しています。更新が必要なフィールドとその新しい値のみを指定し、明示的な部分更新フラグを提供します。

以下の例では、アップサートリクエストで指定されたエンティティの`issue`フィールドは、リクエストに含まれた値に更新されます。

<Admonition type="info" icon="📘" title="注意">

<p>マージモードでアップサートを行う際は、リクエストに関与するエンティティが同じフィールドセットを持っていることを確認してください。アップサートされるエンティティが2つ以上ある場合、以下に示すコードスニペットのように、エラーを防ぎデータの整合性を維持するために同一のフィールドを含めていることが重要です。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data=[
    {
        "id": 1,
        "issue": "vol.14"
    },
    {
        "id": 2,
        "issue": "vol.7"
    }
]

res = client.upsert(
    collection_name="my_collection",
    data=data,
    partial_update=True
)

print(res)

# 出力
# {'upsert_count': 2}
```

</TabItem>

<TabItem value='java'>

```java
JsonObject row1 = new JsonObject();
row1.addProperty("id", 1);
row1.addProperty("issue", "vol.14");

JsonObject row2 = new JsonObject();
row2.addProperty("id", 2);
row2.addProperty("issue", "vol.7");

UpsertReq upsertReq = UpsertReq.builder()
        .collectionName("my_collection")
        .data(Arrays.asList(row1, row2))
        .partialUpdate(true)
        .build();

UpsertResp upsertResp = client.upsert(upsertReq);
System.out.println(upsertResp);

// 出力:
//
// UpsertResp(upsertCnt=2)
```

</TabItem>

<TabItem value='go'>

```go
pkColumn := column.NewColumnInt64("id", []int64{1, 2})
issueColumn = column.NewColumnString("issue", []string{
    "vol.17", "vol.7",
})

_, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithColumns(pkColumn, issueColumn).
    WithPartialUpdate(true),
)
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data=[
    {
        "id": 1,
        "issue": "vol.14"
    },
    {
        "id": 2,
        "issue": "vol.7"
    }
];

const res = await client.upsert({
    collection_name: "my_collection",
    data,
    partial_update: true
});

console.log(res)

// 出力
//
// 2
//
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

export COLLECTION_NAME="my_collection"
export UPSERT_DATA='[
  {
    "id": 1,
    "issue": "vol.14"
  },
  {
    "id": 2,
    "issue": "vol.7"
  }
]'

curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/upsert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"data\": ${UPSERT_DATA},
    \"partialUpdate\": true
  }"

# {
#     "code": 0,
#     "data": {
#         "upsertCount": 2,
#         "upsertIds": [
#              3,
#             12,
#         ]
#     }
# }
```

</TabItem>
</Tabs>