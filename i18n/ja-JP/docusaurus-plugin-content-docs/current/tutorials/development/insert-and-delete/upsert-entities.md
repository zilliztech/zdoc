---
title: "エンティティの Upsert | Cloud"
slug: /upsert-entities
sidebar_label: "Upsert"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`upsert` 操作は、collection 内のエンティティを挿入または更新するための便利な方法を提供します。 | Cloud"
type: origin
token: YtJPwEVETiTaPMkWSfAccjXTnge
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# エンティティの Upsert

`upsert` 操作は、collection 内のエンティティを挿入または更新するための便利な方法を提供します。 

## 概要\{#overview}

`upsert` を使用すると、upsert リクエストで指定された主キーが collection 内に存在するかどうかに応じて、新しいエンティティを挿入するか、既存のエンティティを更新するかを選べます。主キーが見つからない場合は、挿入操作が行われます。見つかった場合は、更新操作が実行されます。

upsert リクエストは、insert と delete を組み合わせたものです。既存のエンティティに対する `upsert` リクエストを受け取ると、Zilliz Cloud はリクエスト payload に含まれるデータを挿入すると同時に、データ内で指定された元の主キーを持つ既存のエンティティを削除します。 

![Q3LawAQIKht1FKbsM3EcoQAHnvc](https://zdoc-images.s3.us-west-2.amazonaws.com/Q3LawAQIKht1FKbsM3EcoQAHnvc.png)

対象 collection の主フィールドで `autoID` が有効になっている場合でも、`upsert` リクエストには対象エンティティの主キーを含める必要があります。Zilliz Cloud は、指定された主キーを使用して置き換えるエンティティを特定し、リクエスト payload に含まれるデータを挿入する前に、新しい主キーを生成します。

`nullable` が有効になっているフィールドについては、更新が不要な場合、`upsert` リクエストでそれらを省略できます。

### マージモードでの Upsert\{#upsert-in-merge-mode}

`partial_update` フラグを使用して、upsert リクエストをマージモードで動作させることもできます。これにより、リクエスト payload には更新が必要なフィールドだけを含めることができます。

![NZNKwxm9ahmi87b487TcuCrNn4c](https://zdoc-images.s3.us-west-2.amazonaws.com/NZNKwxm9ahmi87b487TcuCrNn4c.png)

マージを実行するには、`upsert` リクエストで `partial_update` を `True` に設定し、主キーと更新するフィールド、およびその新しい値を一緒に指定します。 

このようなリクエストを受け取ると、Zilliz Cloud は strong consistency でクエリを実行してエンティティを取得し、リクエスト内のデータに基づいてフィールド値を更新し、変更済みデータを挿入してから、リクエストに含まれる元の主キーを持つ既存のエンティティを削除します。

`ARRAY` フィールドについては、マージモードは `ARRAY_APPEND` と `ARRAY_REMOVE` という 2 つの演算子をサポートします。これらの演算子を使うと、現在の値を取得するために最初にエンティティをクエリしなくても、既存の `ARRAY` フィールドに要素を追加したり、一致する要素を削除したりできます。詳細については、[partial-update 演算子を使用した ARRAY フィールドの Upsert](./upsert-entities#upsert-array-fields-in-merge-mode) を参照してください。

### フィールド値の更新\{#update-field-values}

既存エンティティのフィールド値を更新するには、[マージモードでの upsert](./upsert-entities#upsert-entities-in-merge-mode) を使用します。このモードでは、リクエストに含まれるフィールドのみが更新され、それ以外のすべてのフィールドは既存の値を保持します。

### Upsert の動作: 特記事項\{#upsert-behaviors-special-notes}

マージ機能を使用する前に考慮すべき特記事項がいくつかあります。以下のケースでは、`title` と `issue` という 2 つの scalar フィールド、主キー `id`、および `vector` という vector フィールドを持つ collection があると仮定します。 

- **`nullable` が有効なフィールドの Upsert。**

    `issue` フィールドが null を許容すると仮定します。これらのフィールドを upsert する際は、次の点に注意してください。

    - `upsert` リクエストで `issue` フィールドを省略し、`partial_update` を無効にすると、`issue` フィールドは元の値を保持するのではなく `null` に更新されます。

    - `issue` フィールドの元の値を保持するには、`partial_update` を有効にして `issue` フィールドを省略するか、`upsert` リクエストに `issue` フィールドを元の値とともに含める必要があります。

- **dynamic field 内のキーの Upsert**。

    例の collection で dynamic key を有効にしており、あるエンティティの dynamic field 内のキーと値のペアが `{"author": "John", "year": 2020, "tags": ["fiction"]}` のようなものだと仮定します。 

    `author`、`year`、`tags` などのキーでエンティティを upsert したり、他のキーを追加したりする場合は、次の点に注意してください。

    - `partial_update` を無効にして upsert する場合、デフォルトの動作は **override** です。つまり、dynamic field の値は、リクエストに含まれる schema で定義されていないすべてのフィールドとその値によって上書きされます。 

        たとえば、リクエストに含まれるデータが `{"author": "Jane", "genre": "fantasy"}` の場合、対象エンティティの dynamic field 内のキーと値のペアはそれに更新されます。

    - `partial_update` を有効にして upsert する場合、デフォルトの動作は **merge** です。つまり、dynamic field の値は、リクエストに含まれる schema で定義されていないすべてのフィールドとその値とマージされます。

        たとえば、リクエストに含まれるデータが `{"author": "John", "year": 2020, "tags": ["fiction"]}` の場合、upsert 後に対象エンティティの dynamic field 内のキーと値のペアは `{"author": "John", "year": 2020, "tags": ["fiction"], "genre": "fantasy"}` になります。

- **JSON フィールドの Upsert。**

    例の collection に `extras` という schema で定義された JSON フィールドがあり、この JSON フィールド内のあるエンティティのキーと値のペアが `{"author": "John", "year": 2020, "tags": ["fiction"]}` のようなものだと仮定します。

    変更された JSON データでエンティティの `extras` フィールドを upsert する場合、JSON フィールドは全体として扱われ、個別のキーを選択的に更新することはできない点に注意してください。言い換えると、JSON フィールドは **merge** モードでの upsert を**サポートしません**。

- **`ARRAY` フィールドの Upsert。**

    デフォルトでは、マージモードの `ARRAY` フィールドは **REPLACE** セマンティクスに従います。つまり、リクエストに含まれる値が既存の配列を上書きします。より細かい更新のために、Zilliz Cloud は次の 2 つの演算子もサポートしています。

    - `ARRAY_APPEND` は、リクエスト payload 内の要素を既存の配列に追加します。

    - `ARRAY_REMOVE` は、リクエスト payload 内の値に一致するすべての要素を既存の配列から削除します。

    演算子の構文、サポートされる要素型、およびその他の制約については、[partial-update 演算子を使用した array フィールドの Upsert](./upsert-entities#upsert-array-fields-in-merge-mode) を参照してください。

- **StructArray フィールドの Upsert。**

    エンティティ内の StructArray フィールドを upsert すると、そのフィールド値は上書きされます。これを行うには、マージモードで upsert を実行する場合でも、struct schema で定義されたすべてのサブフィールドを含む辞書のリストを指定する必要があります。

    詳細については、[マージモードでの StructArray フィールドの Upsert](./upsert-entities#upsert-structarray-field-in-merge-mode) を参照してください。

### 制限事項\{#limits-and-restrictions}

上記の内容に基づき、従うべき制限事項がいくつかあります。

- `upsert` リクエストには、`autoID` が有効な場合でも、常に対象エンティティの主キーを含める必要があります。`autoID` collection では、リクエスト内の主キーは置き換える既存エンティティを識別します。Milvus は、挿入される置換エンティティに対して新しい主キーを生成します。

- 対象 collection はロードされており、クエリに利用可能である必要があります。

- リクエストで指定されるすべてのフィールドは、対象 collection の schema に存在している必要があります。

- リクエストで指定されるすべてのフィールドの値は、schema で定義されたデータ型と一致している必要があります。

- 関数を使用して別のフィールドから派生したフィールドについては、再計算を可能にするために、Zilliz Cloud は upsert 中にその派生フィールドを削除します。

## コレクション内のエンティティを Upsert する\{#upsert-entities-in-a-collection}

このセクションでは、`my_collection` という名前のコレクションにエンティティを Upsert します。このコレクションには、`id`、`vector`、`title`、`issue` という名前の 4 つのフィールドしかありません。`id` フィールドは主キーフィールドであり、`title` フィールドと `issue` フィールドはスカラーフィールドです。

これら 3 つのエンティティがコレクション内にすでに存在する場合、upsert リクエストに含まれるものによって上書きされます。

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

# Output
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

// Output:
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

// Output
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
--header "Request-Timeout: 10" \
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

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::EntityRows data = {
    {{"id", 0}, {"vector", std::vector<float>{-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911}}, {"title", "Artificial Intelligence in Real Life"}, {"issue", "vol.12"}},
    {{"id", 1}, {"vector", std::vector<float>{0.4762662251462588, -0.6942502138717026, -0.4490002642657902, -0.628696575798281, 0.9660395877041965}}, {"title", "Hollow Man"}, {"issue", "vol.19"}},
    {{"id", 2}, {"vector", std::vector<float>{-0.8864122635045097, 0.9260170474445351, 0.801326976181461, 0.6383943392381306, 0.7563037341572827}}, {"title", "Treasure Hunt in Missouri"}, {"issue", "vol.12"}}
};

milvus::UpsertResponse resp_upsert;
status = client->Upsert(milvus::UpsertRequest()
                            .WithCollectionName("my_collection")
                            .WithRowsData(std::move(data)),
                        resp_upsert);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

## パーティション内のエンティティを Upsert する\{#upsert-entities-in-a-partition}

指定したパーティションにエンティティを Upsert することもできます。以下のコードスニペットでは、コレクション内に **PartitionA** という名前のパーティションがあることを前提としています。

これら 3 つのエンティティがパーティション内にすでに存在する場合、リクエストに含まれるものによって上書きされます。 

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

# Output
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

// Output:
//
// UpsertResp(upsertCnt=3)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

// 6. Upsert data in partitions
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

// Output
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
--header "Request-Timeout: 10" \
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

```c++
milvus::EntityRows data = {
    {{"id", 10}, {"vector", std::vector<float>{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}}, {"title", "Layour Design Reference"}, {"issue", "vol.34"}},
    {{"id", 11}, {"vector", std::vector<float>{0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104}}, {"title", "Doraemon and His Friends"}, {"issue", "vol.2"}},
    {{"id", 12}, {"vector", std::vector<float>{0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592}}, {"title", "Pikkachu and Pokemon"}, {"issue", "vol.12"}}
};

milvus::UpsertResponse resp_upsert;
auto status = client->Upsert(milvus::UpsertRequest()
                                .WithCollectionName("my_collection")
                                .WithPartitionName("partitionA")
                                .WithRowsData(std::move(data)),
                            resp_upsert);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

## マージモードでエンティティを Upsert する\{#upsert-entities-in-merge-mode}

以下のコード例は、部分更新を使ってエンティティを Upsert する方法を示しています。更新が必要なフィールドとその新しい値、および明示的な部分更新フラグだけを指定してください。

次の例では、upsert リクエストで指定されたエンティティの `issue` フィールドが、リクエストに含まれる値に更新されます。

<Admonition type="info" icon="📘" title="Notes">

マージモードで upsert を実行する場合は、リクエストに含まれるエンティティが同じフィールドセットを持っていることを確認してください。以下のコードスニペットのように 2 つ以上のエンティティを upsert する場合、エラーを防ぎ、データ整合性を維持するために、それらが同一のフィールドを含んでいることが重要です。

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

# Output
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

// Output:
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

// Output
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
  -H "Request-Timeout: 10" \
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

```c++
milvus::EntityRows data = {{{"id", 1}, {"issue", "vol.14"}},
                           {{"id", 2}, {"issue", "vol.7"}}};
auto status = client->Upsert(milvus::UpsertRequest()
                                .WithCollectionName("my_collection")
                                .WithRowsData(std::move(data))
                                .WithPartialUpdate(true),
                             resp_upsert);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

## マージモードで ARRAY フィールドを Upsert する\{#upsert-array-fields-in-merge-mode}

部分更新演算子（`ARRAY_APPEND` と `ARRAY_REMOVE`）が導入される前は、`ARRAY` フィールドの一部を更新するにはクライアント側での read-modify-write フローが必要でした。つまり、既存の配列をクエリし、アプリケーションコードで変更し、完全な置換値を Upsert する必要がありました。部分更新演算子を使うと、追加または削除する要素だけを送信できるため、クライアント側のロジックを減らし、Upsert 前の追加の読み取りを回避できます。

主キー `1` を持つエンティティにすでに `tags = ["new", "trial"]` があるとします。部分更新演算子が導入される前は、配列に `"premium"` 要素を追加するには、完全な置換配列を Upsert する必要がありました。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.upsert(
    collection_name="users",
    # highlight-start
    data=[{"pk": 1, "tags": ["new", "trial", "premium"]}],
    partial_update=True,
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
List<JsonObject> replacementData = Collections.singletonList(
        gson.fromJson("{\"pk\": 1, \"tags\": [\"new\", \"trial\", \"premium\"]}", JsonObject.class)
);

client.upsert(UpsertReq.builder()
        .collectionName("users")
        // highlight-start
        .partialUpdate(true)
        .data(replacementData)
        // highlight-end
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

`ARRAY_APPEND` を使うと、追加する要素だけを送信できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.upsert(
    collection_name="users",
    # highlight-start
    data=[{"pk": 1, "tags": ["premium"]}],
    field_ops={"tags": FieldOp.array_append()},
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
List<JsonObject> appendData = Collections.singletonList(
        gson.fromJson("{\"pk\": 1, \"tags\": [\"premium\"]}", JsonObject.class)
);

UpsertReq.FieldPartialUpdateOp appendTags = UpsertReq.FieldPartialUpdateOp.builder()
        .fieldName("tags")
        .opType(UpsertReq.FieldPartialUpdateOp.OpType.ARRAY_APPEND)
        .build();

client.upsert(UpsertReq.builder()
        .collectionName("users")
        // highlight-start
        .data(appendData)
        .fieldOps(Collections.singletonList(appendTags))
        // highlight-end
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

`field_ops` を介していずれかの演算子をフィールドに関連付けると、暗黙的に部分更新セマンティクスが有効になります。そのため、`field_ops` と一緒に `partial_update=True` を渡す必要は**ありません**。

</Admonition>

### 制限事項\{#limits}

- ペイロード値は、対象の `ARRAY` フィールドの `element_type` と一致している必要があります。たとえば、対象フィールドが `ARRAY<VARCHAR>` の場合、ペイロードには文字列値を含める必要があります。

- このリリースでは、`ARRAY_APPEND` と `ARRAY_REMOVE` は `element_type` が `BOOL`、`INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、`DOUBLE`、または `VARCHAR` の `ARRAY` フィールドをサポートします。

- `ARRAY_APPEND` 操作の後、結果の配列長はフィールドの `max_capacity` を超えてはいけません。

- 同じエンティティに対する同時 upsert は、リクエスト間でアトミックではありません。2 つのリクエストが同じ `ARRAY` フィールドを同時に更新すると、後から書き込まれた内容が先の書き込みを上書きする可能性があります。すべての同時変更を保持する必要がある場合は、アプリケーションレベルで調整を行ってください。

### 例\{#example}

以下の例では、主キー `pk`、`ARRAY<VARCHAR>` 型の `tags` フィールド、および `embedding` ベクトルフィールドを持つ小さな `users` コレクションを使用します。まず初期 `tags` 値を持つ 2 つのエンティティを挿入し、その後 `ARRAY_APPEND` と `ARRAY_REMOVE` を使って、各演算子が保存された配列をどのように変更するかを示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, FieldOp, MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 1. Create a collection with an ARRAY<VARCHAR> field
schema = client.create_schema(enable_dynamic_field=False)
schema.add_field("pk", DataType.INT64, is_primary=True)
schema.add_field("embedding", DataType.FLOAT_VECTOR, dim=5)
schema.add_field(
    "tags",
    DataType.ARRAY,
    element_type=DataType.VARCHAR,
    max_capacity=8,
    max_length=32,
)

index_params = client.prepare_index_params()
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",
    metric_type="L2",
)

client.create_collection(
    collection_name="users",
    schema=schema,
    index_params=index_params
)

# 2. Seed two entities
client.insert(
    collection_name="users",
    data=[
        {"pk": 1, "embedding": [0.1, 0.2, 0.3, 0.4, 0.5], "tags": ["new"]},
        {"pk": 2, "embedding": [0.6, 0.7, 0.8, 0.9, 1.0], "tags": ["new", "trial"]},
    ],
)

# 3. Append tags without reading the existing ARRAY values
client.upsert(
    collection_name="users",
    # highlight-start
    data=[
        {"pk": 1, "tags": ["premium", "vip"]},
        {"pk": 2, "tags": ["premium"]},
    ],
    field_ops={"tags": FieldOp.array_append()},
    # highlight-end
)

res = client.query(
    collection_name="users",
    filter="pk in [1, 2]",
    output_fields=["pk", "tags"],
)
print(res)

# Example output:
# data: [
#   "{'pk': 1, 'tags': ['new', 'premium', 'vip']}",
#   "{'pk': 2, 'tags': ['new', 'trial', 'premium']}"
# ]

# 4. Remove matching tags without replacing the full ARRAY field
client.upsert(
    collection_name="users",
    # highlight-start
    data=[
        {"pk": 1, "tags": ["new"]},
        {"pk": 2, "tags": ["trial"]},
    ],
    field_ops={"tags": FieldOp.array_remove()},
    # highlight-end
)

res = client.query(
    collection_name="users",
    filter="pk in [1, 2]",
    output_fields=["pk", "tags"],
)
print(res)

# Example output:
# data: [
#   "{'pk': 1, 'tags': ['premium', 'vip']}",
#   "{'pk': 2, 'tags': ['new', 'premium']}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.request.UpsertReq;
import io.milvus.v2.service.vector.response.QueryResp;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());
Gson gson = new Gson();

// 1. Create a collection with an ARRAY<VARCHAR> field
CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .enableDynamicField(false)
        .build();

schema.addField(AddFieldReq.builder()
        .fieldName("pk")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("tags")
        .dataType(DataType.Array)
        .elementType(DataType.VarChar)
        .maxCapacity(8)
        .maxLength(32)
        .build());

List<IndexParam> indexParams = Collections.singletonList(IndexParam.builder()
        .fieldName("embedding")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.L2)
        .build());

client.createCollection(CreateCollectionReq.builder()
        .collectionName("users")
        .collectionSchema(schema)
        .indexParams(indexParams)
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build());

// 2. Seed two entities
List<JsonObject> data = Arrays.asList(
        gson.fromJson("{\"pk\": 1, \"embedding\": [0.1, 0.2, 0.3, 0.4, 0.5], \"tags\": [\"new\"]}", JsonObject.class),
        gson.fromJson("{\"pk\": 2, \"embedding\": [0.6, 0.7, 0.8, 0.9, 1.0], \"tags\": [\"new\", \"trial\"]}", JsonObject.class)
);

client.insert(InsertReq.builder()
        .collectionName("users")
        .data(data)
        .build());

// 3. Append tags without reading the existing ARRAY values
List<JsonObject> appendData = Arrays.asList(
        gson.fromJson("{\"pk\": 1, \"tags\": [\"premium\", \"vip\"]}", JsonObject.class),
        gson.fromJson("{\"pk\": 2, \"tags\": [\"premium\"]}", JsonObject.class)
);

UpsertReq.FieldPartialUpdateOp appendTags = UpsertReq.FieldPartialUpdateOp.builder()
        .fieldName("tags")
        .opType(UpsertReq.FieldPartialUpdateOp.OpType.ARRAY_APPEND)
        .build();

client.upsert(UpsertReq.builder()
        .collectionName("users")
        // highlight-start
        .data(appendData)
        .fieldOps(Collections.singletonList(appendTags))
        // highlight-end
        .build());

QueryResp res = client.query(QueryReq.builder()
        .collectionName("users")
        .filter("pk in [1, 2]")
        .outputFields(Arrays.asList("pk", "tags"))
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build());
System.out.println(res);

// Example output:
// [
//   {"pk": 1, "tags": ["new", "premium", "vip"]},
//   {"pk": 2, "tags": ["new", "trial", "premium"]}
// ]

// 4. Remove matching tags without replacing the full ARRAY field
List<JsonObject> removeData = Arrays.asList(
        gson.fromJson("{\"pk\": 1, \"tags\": [\"new\"]}", JsonObject.class),
        gson.fromJson("{\"pk\": 2, \"tags\": [\"trial\"]}", JsonObject.class)
);

UpsertReq.FieldPartialUpdateOp removeTags = UpsertReq.FieldPartialUpdateOp.builder()
        .fieldName("tags")
        .opType(UpsertReq.FieldPartialUpdateOp.OpType.ARRAY_REMOVE)
        .build();

client.upsert(UpsertReq.builder()
        .collectionName("users")
        // highlight-start
        .data(removeData)
        .fieldOps(Collections.singletonList(removeTags))
        // highlight-end
        .build());

res = client.query(QueryReq.builder()
        .collectionName("users")
        .filter("pk in [1, 2]")
        .outputFields(Arrays.asList("pk", "tags"))
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build());
System.out.println(res);

// Example output:
// [
//   {"pk": 1, "tags": ["premium", "vip"]},
//   {"pk": 2, "tags": ["new", "premium"]}
// ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

## マージモードで StructArray フィールドを Upsert する\{#upsert-structarray-field-in-merge-mode}

エンティティ内の StructArray フィールドを Upsert すると、そのフィールド値は上書きされます。つまり、StructArray フィールドを Upsert する際には、struct スキーマで定義されているすべてのサブフィールドを含める必要があります。

以下の例は、6 つのサブフィールドを持つ StructArray フィールドである `chunks` フィールドをマージモードで Upsert する方法を示しています。操作が完了すると、id 1 のエンティティの `chunks` フィールドは、リクエストで指定された 2 つの struct 要素を含む配列に設定されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.upsert(
    collection_name="books",
    # highlight-start
    data=[{
        "id": 1,
        "chunks": [
            {
              "text": "Use HNSW efSearch to trade recall for latency.",
              "section": "index",
              "page": 1,
              "quality_score": 0.92,
              "has_code": True,
              "emb_list_vector": [0.11, 0.21, 0.31, 0.41]
            },
            {
              "text": "Range search returns vectors within a distance boundary.",
              "section": "search",
              "page": 2,
              "quality_score": 0.86,
              "has_code": False,
              "emb_list_vector": [0.18, 0.23, 0.29, 0.36]
            }
        ]
    }],
    # highlight-end
    partial_update=True
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

