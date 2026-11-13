---
title: "エンティティの Upsert | Cloud"
slug: /upsert-entities
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "upsert 操作は、コレクション内のエンティティを挿入または更新する便利な方法を提供します。 | Cloud"
type: origin
displayed_sidebar: default
token: shared-upsert-entities
sidebar_label: "Upsert"
sidebar_position: 2
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/insert-and-delete/upsert-entities.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# エンティティの Upsert

`upsert` 操作は、コレクション内のエンティティを挿入または更新する便利な方法を提供します。

## 概要\{#overview}

`upsert` を使用すると、upsert リクエストで指定したプライマリキーがコレクションに存在するかどうかに応じて、新しいエンティティの挿入または既存のエンティティの更新を行えます。プライマリキーが見つからない場合は、挿入操作が実行されます。それ以外の場合は、更新操作が実行されます。`autoID` コレクションでの部分更新は例外で、以下で説明するように既存のエンティティのみを更新します。

Zilliz Cloud での upsert は、**上書き**モードと**マージ**モードのいずれかで動作します。

### 上書きモードでの Upsert\{#upsert-in-override-mode}

上書きモードで動作する upsert リクエストは、挿入と削除を組み合わせたものです。既存のエンティティに対する `upsert` リクエストを受信すると、Zilliz Cloud はリクエストペイロードに含まれるデータを挿入し、同時に、そのデータで指定された元のプライマリキーを持つ既存のエンティティを削除します。

![上書きモードでの Upsert](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/40c0e8ca69eaf270bd1e6972e688b8f7e7865d0678c2a4170ecef678c0bb05b7.png)

対象のコレクションでプライマリフィールドに対して `autoID` が有効になっている場合でも、`upsert` リクエストには対象エンティティのプライマリキーを含める必要があります。Zilliz Cloud は指定されたプライマリキーを使用して置き換えるエンティティを特定し、リクエストペイロードに含まれるデータを挿入する前に、そのデータ用の新しいプライマリキーを生成します。

`nullable` が有効になっているフィールドは、更新が不要であれば `upsert` リクエストで省略できます。

<a id="upsert-in-merge-mode--milvus-v262"></a>

### マージモードでの Upsert\{#upsert-in-merge-mode}

マージモードを使用すると、既存のエンティティの特定のフィールドのみを更新し、その他のフィールドは変更せずに保持できます。

![マージモードでの Upsert](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/a4dd47f055ed299fb600638f41ef2be283f7984a29236072a76e39eec300588f.png)

`partial_update=True` を設定し、プライマリキーと更新するフィールドを指定します。

Zilliz Cloud は強整合性クエリで既存のエンティティを取得し、変更内容を保存済みのデータとマージして、マージ後のエンティティを挿入し、古いエンティティを削除します。

プライマリキーが存在しない場合、結果は `autoID` が有効かどうかによって異なります：

- **`autoID` が無効な場合**、Zilliz Cloud は指定したプライマリキーで新しいエンティティを挿入しようとします。通常の挿入要件を満たしていれば、リクエストは成功します。必須フィールドが不足している場合、リクエストはフィールド不足エラーで失敗します。null を許容するフィールドとデフォルト値を持つフィールドは、通常の挿入と同様に省略できます。
- **`autoID` が有効な場合**、リクエスト内のすべてのプライマリキーがすでに存在している必要があります。挿入に必要なすべてのフィールドを指定していても、いずれかのプライマリキーが存在しない場合、Zilliz Cloud はリクエストを拒否します。既存のエンティティでは、マージモードによりプライマリキーが変更されずに保持されます。

部分更新がフィールド不足エラーで失敗した場合は、対象のエンティティが存在するかどうかを確認してください。既存のエンティティがない場合、Zilliz Cloud は省略したフィールドの値を取得できません。

新しいエンティティには、`insert` または上書きモードの upsert を使用します。個々のフィールドの後続の更新にはマージモードを使用します。

`ARRAY` フィールドでは、マージモードは `ARRAY_APPEND` と `ARRAY_REMOVE` の 2 つの演算子をサポートしています。これらの演算子を使用すると、エンティティをクエリして現在の値を取得しなくても、既存の `ARRAY` フィールドに要素を追加したり、一致する要素を削除したりできます。詳細は、[マージモードでの ARRAY フィールドの Upsert](./upsert-entities#upsert-array-fields-in-merge-mode-or-milvus-2617) を参照してください。

### フィールド値の更新\{#update-field-values}

既存のエンティティのフィールド値を更新するには、[マージモードでの upsert](./upsert-entities#upsert-entities-in-merge-mode) を使用します。このモードでは、リクエストに含まれるフィールドのみが更新され、その他のフィールドは既存の値を保持します。

### Upsert の動作：特別な注意事項\{#upsert-behaviors-special-notes}

マージ機能を使用する前に考慮すべき特別な注意事項がいくつかあります。以下のケースでは、`title` と `issue` という 2 つのスカラーフィールド、プライマリキー `id`、および `vector` という名前のベクトルフィールドを持つコレクションがあることを前提としています。

- **`nullable` が有効なフィールドの Upsert。**

    `issue` フィールドが null になり得るとします。これらのフィールドを upsert するときは、次の点に注意してください。

    - `upsert` リクエストで `issue` フィールドを省略し、`partial_update` を無効にすると、`issue` フィールドは元の値を保持せずに `null` に更新されます。

    - `issue` フィールドの元の値を保持するには、`partial_update` を有効にして `issue` フィールドを省略するか、`upsert` リクエストに `issue` フィールドを元の値とともに含める必要があります。

- **動的フィールド内のキーの Upsert**。

    例のコレクションで動的キーを有効にしていて、エンティティの動的フィールド内のキーと値のペアが `{"author": "John", "year": 2020, "tags": ["fiction"]}` のようになっているとします。

    `author`、`year`、`tags` などのキーを指定してエンティティを upsert する場合、または他のキーを追加する場合は、次の点に注意してください。

    - `partial_update` を無効にして upsert した場合、デフォルトの動作は **上書き** です。つまり、動的フィールドの値は、リクエストに含まれるスキーマ定義外のすべてのフィールドとその値によって上書きされます。

        例えば、リクエストに含まれるデータが `{"author": "Jane", "genre": "fantasy"}` の場合、対象エンティティの動的フィールド内のキーと値のペアはその内容に更新されます。

    - `partial_update` を有効にして upsert した場合、デフォルトの動作は **マージ** です。これは、動的フィールドの値が、リクエストに含まれるスキーマ定義外のすべてのフィールドとその値とマージされることを意味します。

        例えば、リクエストに含まれるデータが `{"author": "John", "year": 2020, "tags": ["fiction"]}` の場合、upsert 後に、対象エンティティの動的フィールド内のキーと値のペアは `{"author": "John", "year": 2020, "tags": ["fiction"], "genre": "fantasy"}` になります。

- **JSON フィールドの Upsert。**

    例のコレクションに `extras` という名前のスキーマ定義の JSON フィールドがあり、エンティティのこの JSON フィールド内のキーと値のペアが `{"author": "John", "year": 2020, "tags": ["fiction"]}` のようになっているとします。

    変更した JSON データでエンティティの `extras` フィールドを upsert する場合、JSON フィールドは全体として扱われ、個々のキーを選択的に更新することはできません。つまり、JSON フィールドは **マージ** モードでの upsert を **サポートしていません**。

- **`ARRAY` フィールドの Upsert。**

    デフォルトでは、マージモードの `ARRAY` フィールドは **REPLACE** セマンティクスに従います。つまり、リクエストに含まれる値が既存の配列を上書きします。より細かい更新のために、Zilliz Cloud は 2 つの演算子もサポートしています。

    - `ARRAY_APPEND` は、リクエストペイロード内の要素を既存の配列に追加します。

    - `ARRAY_REMOVE` は、既存の配列からリクエストペイロード内の値に一致するすべての要素を削除します。

    演算子の構文、サポートされる要素型、その他の制約については、[マージモードでの ARRAY フィールドの Upsert](./upsert-entities#upsert-array-fields-in-merge-mode-or-milvus-2617) を参照してください。


- **StructArray フィールドの Upsert。**

    エンティティの StructArray フィールドを upsert すると、そのフィールド値は上書きされます。そのため、マージモードで upsert を実行する場合でも、struct スキーマで定義されたすべてのサブフィールドを含む辞書のリストを指定する必要があります。Milvus v3.0.x と互換性のある Dedicated クラスターでは、要素レベルで null を許容するサブフィールドを省略できます。その場合、Zilliz Cloud はその Struct 要素に null を格納します。StructArray フィールドを含むコレクションへの upsert は、On-Demand クラスターではまだ利用できず、そこでは一括インポートが StructArray データの唯一の書き込み経路です。

    詳細は、[マージモードでの StructArray フィールドの Upsert](./upsert-entities#upsert-structarray-field-in-merge-mode) を参照してください。


### 制限と制約\{#limits-and-restrictions}

上記の内容に基づき、従うべき制限と制約がいくつかあります。

- `upsert` リクエストには、`autoID` が有効な場合でも、常に対象エンティティのプライマリキーを含める必要があります。`autoID` コレクションでは、プライマリキーの扱いは upsert モードによって異なります。

    - 上書きモードでは、プライマリキーが置き換える既存のエンティティを特定し、Zilliz Cloud が置き換え後のエンティティ用に新しいプライマリキーを生成します。

    - マージモードでは、プライマリキーが更新対象の既存のエンティティを特定し、変更されずに保持されます。プライマリキーが存在しない場合、リクエストは新しいエンティティを挿入せずに失敗します。

- 対象のコレクションはロード済みで、クエリに使用できる必要があります。

- リクエストで指定するすべてのフィールドは、対象コレクションのスキーマに存在している必要があります。

- リクエストで指定するすべてのフィールドの値は、スキーマで定義されたデータ型と一致している必要があります。

- 関数を使用して別のフィールドから派生したフィールドについては、Zilliz Cloud は再計算を可能にするため、upsert 中にその派生フィールドを削除します。

## コレクション内のエンティティの Upsert\{#upsert-entities-in-a-collection}

このセクションでは、`my_collection` という名前のコレクションにエンティティを upsert します。このコレクションには、`id`、`vector`、`title`、`issue` という 2 つのフィールドしかありません。`id` フィールドはプライマリフィールドで、`title` フィールドと `issue` フィールドはスカラーフィールドです。

3 つのエンティティがコレクションに存在する場合、それらは upsert リクエストに含まれるエンティティによって上書きされます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, FieldOp, DataType

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
import java.util.Arrays;
import java.util.List;
import java.util.Collections;
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import com.google.gson.JsonArray;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());
Gson gson = new Gson();
List<JsonObject> data = Arrays.asList(
        gson.fromJson("{\"id\": 0, \"vector\": [-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911], \"title\": \"Artificial Intelligence in Real Life\", \"issue\": \"vol.12\"}", JsonObject.class),
        gson.fromJson("{\"id\": 1, \"vector\": [0.4762662251462588, -0.6942502138717026, -0.4490002642657902, -0.628696575798281, 0.9660395877041965], \"title\": \"Hollow Man\", \"issue\": \"vol.19\"}", JsonObject.class),
        gson.fromJson("{\"id\": 2, \"vector\": [-0.8864122635045097, 0.9260170474445351, 0.801326976181461, 0.6383943392381306, 0.7563037341572827], \"title\": \"Treasure Hunt in Missouri\", \"issue\": \"vol.12\"}", JsonObject.class)
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

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
)

ctx := context.Background()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey: "YOUR_CLUSTER_TOKEN",
})

if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

titleColumn := column.NewColumnVarChar("title", []string{
    "Artificial Intelligence in Real Life", "Hollow Man", "Treasure Hunt in Missouri",
})

issueColumn := column.NewColumnVarChar("issue", []string{
    "vol.12", "vol.19", "vol.12",
})

_, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("id", []int64{0, 1, 2}).
    WithFloatVectorColumn("vector", 5, [][]float32{
        {-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911},
        {0.4762662251462588, -0.6942502138717026, -0.4490002642657902, -0.628696575798281, 0.9660395877041965},
        {-0.8864122635045097, 0.9260170474445351, 0.801326976181461, 0.6383943392381306, 0.7563037341572827},
    }).
    WithColumns(titleColumn, issueColumn),
)

if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;
client
    .upsert(
        UpsertRequest::builder()
            .insert(
                InsertRequest::builder()
                    .collection_name("my_collection")
                    .columns(vec![
                        FieldData::Int64 {
                            name: "id".into(),
                            values: vec![0i64, 1, 2],
                        },
                        FieldData::FloatVector {
                            name: "vector".into(),
                            values: vec![
                                vec![-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911],
                                vec![0.4762662251462588, -0.6942502138717026, -0.4490002642657902, -0.628696575798281, 0.9660395877041965],
                                vec![-0.8864122635045097, 0.9260170474445351, 0.801326976181461, 0.6383943392381306, 0.7563037341572827],
                            ],
                        },
                        FieldData::VarChar {
                            name: "title".into(),
                            values: vec![
                                "Artificial Intelligence in Real Life".into(),
                                "Hollow Man".into(),
                                "Treasure Hunt in Missouri".into(),
                            ],
                        },
                        FieldData::VarChar {
                            name: "issue".into(),
                            values: vec!["vol.12".into(), "vol.19".into(), "vol.12".into()],
                        },
                    ])
                    .build()?,
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
#include "milvus/MilvusClientV2.h"
#include <iostream>

auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param("YOUR_CLUSTER_ENDPOINT");
connect_param.WithToken("YOUR_CLUSTER_TOKEN");
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

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});
const data = [
    {id: 0, vector: [-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911], title: "Artificial Intelligence in Real Life", issue: "vol.12"},
    {id: 1, vector: [0.4762662251462588, -0.6942502138717026, -0.4490002642657902, -0.628696575798281, 0.9660395877041965], title: "Hollow Man", issue: "vol.19"},
    {id: 2, vector: [-0.8864122635045097, 0.9260170474445351, 0.801326976181461, 0.6383943392381306, 0.7563037341572827], title: "Treasure Hunt in Missouri", issue: "vol.12"},
]

const res = await client.upsert({
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
        {"id": 0, "vector": [-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911], "title": "Artificial Intelligence in Real Life", "issue": "vol.12"},
        {"id": 1, "vector": [0.4762662251462588, -0.6942502138717026, -0.4490002642657902, -0.628696575798281, 0.9660395877041965], "title": "Hollow Man", "issue": "vol.19"},
        {"id": 2, "vector": [-0.8864122635045097, 0.9260170474445351, 0.801326976181461, 0.6383943392381306, 0.7563037341572827], "title": "Treasure Hunt in Missouri", "issue": "vol.12"}
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

## パーティション内のエンティティの Upsert\{#upsert-entities-in-a-partition}

エンティティを指定したパーティションに upsert することもできます。以下のコードスニペットは、コレクションに **PartitionA** という名前のパーティションがあることを前提としています。

3 つのエンティティがパーティションに存在する場合、それらはリクエストに含まれるエンティティによって上書きされます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
Gson gson = new Gson();
List<JsonObject> data = Arrays.asList(
        gson.fromJson("{\"id\": 10, \"vector\": [0.06998888224297328, 0.8582816610326578, -0.9657938677934292, 0.6527905683627726, -0.8668460657158576], \"title\": \"Layour Design Reference\", \"issue\": \"vol.34\"}", JsonObject.class),
        gson.fromJson("{\"id\": 11, \"vector\": [0.6060703043917468, -0.3765080534566074, -0.7710758854987239, 0.36993888322346136, 0.5507513364206531], \"title\": \"Doraemon and His Friends\", \"issue\": \"vol.2\"}", JsonObject.class),
        gson.fromJson("{\"id\": 12, \"vector\": [-0.9041813104515337, -0.9610546012461163, 0.20033003106083358, 0.11842506351635174, 0.8327356724591011], \"title\": \"Pikkachu and Pokemon\", \"issue\": \"vol.12\"}", JsonObject.class)
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

<TabItem value='go'>

```go
titleColumn := column.NewColumnVarChar("title", []string{
    "Layour Design Reference", "Doraemon and His Friends", "Pikkachu and Pokemon",
})

issueColumn := column.NewColumnVarChar("issue", []string{
    "vol.34", "vol.2", "vol.12",
})

_, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithPartition("partitionA").
    WithInt64Column("id", []int64{10, 11, 12}).
    WithFloatVectorColumn("vector", 5, [][]float32{
        {0.06998888224297328, 0.8582816610326578, -0.9657938677934292, 0.6527905683627726, -0.8668460657158576},
        {0.6060703043917468, -0.3765080534566074, -0.7710758854987239, 0.36993888322346136, 0.5507513364206531},
        {-0.9041813104515337, -0.9610546012461163, 0.20033003106083358, 0.11842506351635174, 0.8327356724591011},
    }).
    WithColumns(titleColumn, issueColumn),
)

if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .upsert(
        UpsertRequest::builder()
            .insert(
                InsertRequest::builder()
                    .collection_name("my_collection")
                    .partition_name("partitionA")
                    .columns(vec![
                        FieldData::Int64 {
                            name: "id".into(),
                            values: vec![10i64, 11, 12],
                        },
                        FieldData::FloatVector {
                            name: "vector".into(),
                            values: vec![
                                vec![0.06998888224297328, 0.8582816610326578, -0.9657938677934292, 0.6527905683627726, -0.8668460657158576],
                                vec![0.6060703043917468, -0.3765080534566074, -0.7710758854987239, 0.36993888322346136, 0.5507513364206531],
                                vec![-0.9041813104515337, -0.9610546012461163, 0.20033003106083358, 0.11842506351635174, 0.8327356724591011],
                            ],
                        },
                        FieldData::VarChar {
                            name: "title".into(),
                            values: vec![
                                "Layour Design Reference".into(),
                                "Doraemon and His Friends".into(),
                                "Pikkachu and Pokemon".into(),
                            ],
                        },
                        FieldData::VarChar {
                            name: "issue".into(),
                            values: vec!["vol.34".into(), "vol.2".into(), "vol.12".into()],
                        },
                    ])
                    .build()?,
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
milvus::EntityRows data = {
    {{"id", 10}, {"vector", std::vector<float>{0.06998888224297328, 0.8582816610326578, -0.9657938677934292, 0.6527905683627726, -0.8668460657158576}}, {"title", "Layour Design Reference"}, {"issue", "vol.34"}},
    {{"id", 11}, {"vector", std::vector<float>{0.6060703043917468, -0.3765080534566074, -0.7710758854987239, 0.36993888322346136, 0.5507513364206531}}, {"title", "Doraemon and His Friends"}, {"issue", "vol.2"}},
    {{"id", 12}, {"vector", std::vector<float>{-0.9041813104515337, -0.9610546012461163, 0.20033003106083358, 0.11842506351635174, 0.8327356724591011}}, {"title", "Pikkachu and Pokemon"}, {"issue", "vol.12"}}
};
milvus::UpsertResponse resp_upsert;
status = client->Upsert(milvus::UpsertRequest()
                            .WithCollectionName("my_collection")
                            .WithPartitionName("partitionA")
                            .WithRowsData(std::move(data)),
                        resp_upsert);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 6. Upsert data in partitions
const data = [
    {id: 10, vector: [0.06998888224297328, 0.8582816610326578, -0.9657938677934292, 0.6527905683627726, -0.8668460657158576], title: "Layour Design Reference", issue: "vol.34"},
    {id: 11, vector: [0.6060703043917468, -0.3765080534566074, -0.7710758854987239, 0.36993888322346136, 0.5507513364206531], title: "Doraemon and His Friends", issue: "vol.2"},
    {id: 12, vector: [-0.9041813104515337, -0.9610546012461163, 0.20033003106083358, 0.11842506351635174, 0.8327356724591011], title: "Pikkachu and Pokemon", issue: "vol.12"},
]

const res = await client.upsert({
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
        {"id": 12, "vector": [-0.9041813104515337, -0.9610546012461163, 0.20033003106083358, 0.11842506351635174, 0.8327356724591011], "title": "Pikkachu and Pokemon", "issue": "vol.12"}
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

<a id="upsert-entities-in-merge-mode--milvus-v262"></a>

## マージモードでのエンティティの Upsert\{#upsert-entities-in-merge-mode}

次の例では、`my_collection` 内のプライマリキー `1` と `2` を持つエンティティの `issue` フィールドのみを更新します。実行する前に、両方のエンティティがすでに存在することを確認してください。その他のフィールドは現在の値が保持されます。

<Admonition type="info" icon="📘" title="Notes">

マージモードで upsert を実行する場合は、リクエストに含まれるエンティティが同じフィールドのセットを持っていることを確認してください。以下のコードスニペットに示すように、upsert するエンティティが 2 つ以上ある場合、エラーを防ぎ、データの整合性を維持するためには、それらが同一のフィールドを含むことが重要です。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

issueColumn := column.NewColumnVarChar("issue", []string{
    "vol.14", "vol.7",
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

<TabItem value='rust'>

```rust
client
    .upsert(
        UpsertRequest::builder()
            .insert(
                InsertRequest::builder()
                    .collection_name("my_collection")
                    .columns(vec![
                        FieldData::Int64 {
                            name: "id".into(),
                            values: vec![1i64, 2],
                        },
                        FieldData::VarChar {
                            name: "issue".into(),
                            values: vec!["vol.14".into(), "vol.7".into()],
                        },
                    ])
                    .build()?,
            )
            .partial_update(true)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
milvus::EntityRows data = {{{"id", 1}, {"issue", "vol.14"}},
                           {{"id", 2}, {"issue", "vol.7"}}};
milvus::UpsertResponse resp_upsert;
status = client->Upsert(milvus::UpsertRequest()
                            .WithCollectionName("my_collection")
                            .WithRowsData(std::move(data))
                            .WithPartialUpdate(true),
                        resp_upsert);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
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
#             1,
#             2
#         ]
#     }
# }
```

</TabItem>

</Tabs>

<a id="upsert-array-fields-in-merge-mode"></a>

## マージモードでの ARRAY フィールドの Upsert | Milvus 2.6.17+\{#upsert-array-fields-in-merge-mode-or-milvus-2617}

部分更新演算子（`ARRAY_APPEND` と `ARRAY_REMOVE`）が導入される前は、`ARRAY` フィールドの一部を更新するには、クライアント側で読み取り・変更・書き込みのフローが必要でした。つまり、既存の配列をクエリし、アプリケーションコードで変更し、置き換える完全な値を upsert します。部分更新演算子を使用すると、追加または削除する要素のみを送信できるため、クライアント側のロジックを削減し、upsert 前の余分な読み取りを回避できます。

プライマリキー `1` を持つエンティティにすでに `tags = ["new", "trial"]` があるとします。部分更新演算子が導入される前は、配列に要素 `"premium"` を追加するには、置き換える完全な配列を upsert する必要がありました。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
Gson gson = new Gson();
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

<TabItem value='go'>

```go
_, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("users").
    WithInt64Column("pk", []int64{1}).
    WithColumns(column.NewColumnVarCharArray("tags", [][]string{{"new", "trial", "premium"}})).
    WithPartialUpdate(true),
)

if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .upsert(
        UpsertRequest::builder()
            .insert(
                InsertRequest::builder()
                    .collection_name("users")
                    .columns(vec![
                        FieldData::Int64 {
                            name: "pk".into(),
                            values: vec![1i64],
                        },
                        FieldData::ArrayVarChar {
                            name: "tags".into(),
                            values: vec![vec!["new".to_string(), "trial".to_string(), "premium".to_string()]],
                        },
                    ])
                    .build()?,
            )
            .partial_update(true)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
milvus::EntityRows data = {{{"pk", 1}, {"tags", std::vector<std::string>{"new", "trial", "premium"}}}};
milvus::UpsertResponse resp_upsert;
status = client->Upsert(milvus::UpsertRequest()
                            .WithCollectionName("users")
                            .WithRowsData(std::move(data))
                            .WithPartialUpdate(true),
                        resp_upsert);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.upsert({
    collection_name: "users",
    data: [{pk: 1, tags: ["new", "trial", "premium"]}],
    partial_update: true,
});
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
    "collectionName": "users",
    "data": [
        {"pk": 1, "tags": ["new", "trial", "premium"]}
    ],
    "partialUpdate": true
}'

# {
#     "code": 0,
#     "data": {
#         "upsertCount": 1,
#         "upsertIds": [
#             1
#         ]
#     }
# }
```

</TabItem>

</Tabs>

`ARRAY_APPEND` を使用する場合は、追加する要素のみを送信します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
client.upsert(
    collection_name="users",
    data=[{"pk": 1, "tags": ["premium"]}],
    field_ops={"tags": FieldOp.array_append()},
)
```

</TabItem>

<TabItem value='java'>

```java
Gson gson = new Gson();
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

<TabItem value='go'>

```go
_, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("users").
    WithInt64Column("pk", []int64{1}).
    WithColumns(column.NewColumnVarCharArray("tags", [][]string{{"premium"}})).
    WithArrayAppend("tags"),
)

if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .upsert(
        UpsertRequest::builder()
            .insert(
                InsertRequest::builder()
                    .collection_name("users")
                    .columns(vec![
                        FieldData::Int64 {
                            name: "pk".into(),
                            values: vec![1i64],
                        },
                        FieldData::ArrayVarChar {
                            name: "tags".into(),
                            values: vec![vec!["premium".to_string()]],
                        },
                    ])
                    .build()?,
            )
            .field_ops(vec![
                FieldPartialUpdateOp::new()
                    .field_name("tags")
                    .op_type(FieldPartialUpdateOpType::ArrayAppend),
            ])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
milvus::EntityRows data = {{{"pk", 1}, {"tags", std::vector<std::string>{"premium"}}}};
milvus::UpsertResponse resp_upsert;
status = client->Upsert(milvus::UpsertRequest()
                            .WithCollectionName("users")
                            .WithRowsData(std::move(data))
                            .AddFieldOp(milvus::FieldPartialUpdateOp("tags", milvus::FieldPartialUpdateOp::OpType::ARRAY_APPEND)),
                        resp_upsert);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.upsert({
    collection_name: "users",
    data: [{pk: 1, tags: ["premium"]}],
    field_ops: [{field_name: "tags", op: "ARRAY_APPEND"}],
});
```

</TabItem>

</Tabs>

`ARRAY_REMOVE` では、削除する一致する要素のみを送信します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
client.upsert(
    collection_name="users",
    data=[{"pk": 1, "tags": ["trial"]}],
    field_ops={"tags": FieldOp.array_remove()},
)
```

</TabItem>

<TabItem value='java'>

```java
Gson gson = new Gson();
List<JsonObject> appendData = Collections.singletonList(
        gson.fromJson("{\"pk\": 1, \"tags\": [\"trial\"]}", JsonObject.class)
);
UpsertReq.FieldPartialUpdateOp appendTags = UpsertReq.FieldPartialUpdateOp.builder()
        .fieldName("tags")
        .opType(UpsertReq.FieldPartialUpdateOp.OpType.ARRAY_REMOVE)
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

<TabItem value='go'>

```go
_, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("users").
    WithInt64Column("pk", []int64{1}).
    WithColumns(column.NewColumnVarCharArray("tags", [][]string{{"trial"}})).
    WithArrayRemove("tags"),
)

if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .upsert(
        UpsertRequest::builder()
            .insert(
                InsertRequest::builder()
                    .collection_name("users")
                    .columns(vec![
                        FieldData::Int64 {
                            name: "pk".into(),
                            values: vec![1i64],
                        },
                        FieldData::ArrayVarChar {
                            name: "tags".into(),
                            values: vec![vec!["trial".to_string()]],
                        },
                    ])
                    .build()?,
            )
            .field_ops(vec![
                FieldPartialUpdateOp::new()
                    .field_name("tags")
                    .op_type(FieldPartialUpdateOpType::ArrayRemove),
            ])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
milvus::EntityRows data = {{{"pk", 1}, {"tags", std::vector<std::string>{"trial"}}}};
milvus::UpsertResponse resp_upsert;
status = client->Upsert(milvus::UpsertRequest()
                            .WithCollectionName("users")
                            .WithRowsData(std::move(data))
                            .AddFieldOp(milvus::FieldPartialUpdateOp("tags", milvus::FieldPartialUpdateOp::OpType::ARRAY_REMOVE)),
                        resp_upsert);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.upsert({
    collection_name: "users",
    data: [{pk: 1, tags: ["trial"]}],
    field_ops: [{field_name: "tags", op: "ARRAY_REMOVE"}],
});
```

</TabItem>

</Tabs>

<Admonition type="info" icon="📘" title="Notes">

`field_ops` を介してフィールドにいずれかの演算子を指定すると、部分更新のセマンティクスが暗黙的に有効になります。そのため、`field_ops` と一緒に `partial_update=True` を渡す必要は **ありません**。

</Admonition>

### 制限\{#limits}

- ペイロードの値は、対象の `ARRAY` フィールドの `element_type` と一致している必要があります。例えば、対象フィールドが `ARRAY<VARCHAR>` の場合、ペイロードには文字列値を含める必要があります。

- `ARRAY_APPEND` と `ARRAY_REMOVE` は、`element_type` が `BOOL`、`INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、`DOUBLE`、または `VARCHAR` である `ARRAY` フィールドをサポートしています。

- `ARRAY_APPEND` 操作の後、結果の配列の長さはフィールドの `max_capacity` を超えてはなりません。

- 同じエンティティに対する同時 upsert は、リクエスト間でアトミックではありません。2 つのリクエストが同じ `ARRAY` フィールドを同時に更新すると、後から書き込まれた内容が先の内容を上書きする可能性があります。すべての同時変更を保持する必要がある場合は、アプリケーションレベルで調整してください。

### 例\{#example}

次の例では、プライマリキー `pk`、型が `ARRAY<VARCHAR>` の `tags` フィールド、および `embedding` ベクトルフィールドを持つ小さな `users` コレクションを使用します。まず初期の `tags` 値を持つ 2 つのエンティティを挿入し、次に `ARRAY_APPEND` と `ARRAY_REMOVE` を使用して、各演算子が保存された配列をどのように変更するかを示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
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

<TabItem value='go'>

```go
// 1. Create a collection with an ARRAY<VARCHAR> field

schema := entity.NewSchema().WithDynamicFieldEnabled(false).
    WithField(entity.NewField().WithName("pk").WithIsPrimaryKey(true).WithDataType(entity.FieldTypeInt64)).
    WithField(entity.NewField().WithName("embedding").WithDataType(entity.FieldTypeFloatVector).WithDim(5)).
    WithField(entity.NewField().WithName("tags").WithDataType(entity.FieldTypeArray).
        WithElementType(entity.FieldTypeVarChar).WithMaxCapacity(8).WithMaxLength(32))

if err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("users", schema).WithIndexOptions(
    milvusclient.NewCreateIndexOption("users", "embedding", index.NewAutoIndex(entity.L2)))); err != nil {
    fmt.Println(err.Error())
    // handle error
}

// 2. Seed two entities

if _, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("users").
    WithInt64Column("pk", []int64{1, 2}).
    WithFloatVectorColumn("embedding", 5, [][]float32{{0.1, 0.2, 0.3, 0.4, 0.5}, {0.6, 0.7, 0.8, 0.9, 1.0}}).
    WithColumns(column.NewColumnVarCharArray("tags", [][]string{{"new"}, {"new", "trial"}}))); err != nil {
    fmt.Println(err.Error())
    // handle error
}

// 3. Append tags without reading the existing ARRAY values

if _, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("users").
    WithInt64Column("pk", []int64{1, 2}).
    WithColumns(column.NewColumnVarCharArray("tags", [][]string{{"premium", "vip"}, {"premium"}})).
    WithArrayAppend("tags")); err != nil {
    fmt.Println(err.Error())
    // handle error
}
client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("users"))

res, err := client.Query(ctx, milvusclient.NewQueryOption("users").WithFilter("pk in [1, 2]").WithOutputFields("pk", "tags"))

if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(res)

// Example output:
// pk 1: tags [new premium vip]
// pk 2: tags [new trial premium]
// 4. Remove matching tags without replacing the full ARRAY field

if _, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("users").
    WithInt64Column("pk", []int64{1, 2}).
    WithColumns(column.NewColumnVarCharArray("tags", [][]string{{"new"}, {"trial"}})).
    WithArrayRemove("tags")); err != nil {
    fmt.Println(err.Error())
    // handle error
}
res, err = client.Query(ctx, milvusclient.NewQueryOption("users").WithFilter("pk in [1, 2]").WithOutputFields("pk", "tags"))

if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(res)

// Example output:
// pk 1: tags [premium vip]
// pk 2: tags [new premium]
```

</TabItem>

<TabItem value='rust'>

```rust
// 1. Create a collection with an ARRAY<VARCHAR> field

let schema = CollectionSchema::new()
    .add_field(FieldSchema::new().name("pk").data_type(DataType::Int64).primary_key(true))
    .add_field(FieldSchema::new().name("embedding").data_type(DataType::FloatVector).dimension(5))
    .add_field(
        FieldSchema::new()
            .name("tags")
            .data_type(DataType::Array)
            .element_type(DataType::VarChar)
            .max_capacity(8)
            .max_length(32),
    );
client
    .create_collection(
        CreateCollectionRequest::builder().collection_name("users").schema(schema).build()?,
    )
    .await?;
client
    .create_index(
        CreateIndexRequest::builder()
            .collection_name("users")
            .index_param(
                IndexParam::new()
                    .field_name("embedding")
                    .index_type(IndexType::AutoIndex)
                    .metric_type(MetricType::L2),
            )
            .build()?,
    )
    .await?;
client
    .load_collection(LoadCollectionRequest::builder().collection_name("users").build()?)
    .await?;

// 2. Seed two entities

client
    .insert(
        InsertRequest::builder()
            .collection_name("users")
            .columns(vec![
                FieldData::Int64 {
                    name: "pk".into(),
                    values: vec![1i64, 2],
                },
                FieldData::FloatVector {
                    name: "embedding".into(),
                    values: vec![vec![0.1, 0.2, 0.3, 0.4, 0.5], vec![0.6, 0.7, 0.8, 0.9, 1.0]],
                },
                FieldData::ArrayVarChar {
                    name: "tags".into(),
                    values: vec![vec!["new".to_string()], vec!["new".to_string(), "trial".to_string()]],
                },
            ])
            .build()?,
    )
    .await?;

// 3. Append tags without reading the existing ARRAY values

client
    .upsert(
        UpsertRequest::builder()
            .insert(
                InsertRequest::builder()
                    .collection_name("users")
                    .columns(vec![
                        FieldData::Int64 {
                            name: "pk".into(),
                            values: vec![1i64, 2],
                        },
                        FieldData::ArrayVarChar {
                            name: "tags".into(),
                            values: vec![
                                vec!["premium".to_string(), "vip".to_string()],
                                vec!["premium".to_string()],
                            ],
                        },
                    ])
                    .build()?,
            )
            .field_ops(vec![
                FieldPartialUpdateOp::new()
                    .field_name("tags")
                    .op_type(FieldPartialUpdateOpType::ArrayAppend),
            ])
            .build()?,
    )
    .await?;
let res = client
    .query(
        QueryRequest::builder()
            .collection_name("users")
            .filter("pk in [1, 2]")
            .output_fields(vec!["pk".to_string(), "tags".to_string()])
            .build()?,
    )
    .await?;
println!("{res:?}");

// Example output:
// pk 1: tags [new premium vip]
// pk 2: tags [new trial premium]
// 4. Remove matching tags without replacing the full ARRAY field

client
    .upsert(
        UpsertRequest::builder()
            .insert(
                InsertRequest::builder()
                    .collection_name("users")
                    .columns(vec![
                        FieldData::Int64 {
                            name: "pk".into(),
                            values: vec![1i64, 2],
                        },
                        FieldData::ArrayVarChar {
                            name: "tags".into(),
                            values: vec![vec!["new".to_string()], vec!["trial".to_string()]],
                        },
                    ])
                    .build()?,
            )
            .field_ops(vec![
                FieldPartialUpdateOp::new()
                    .field_name("tags")
                    .op_type(FieldPartialUpdateOpType::ArrayRemove),
            ])
            .build()?,
    )
    .await?;
let res = client
    .query(
        QueryRequest::builder()
            .collection_name("users")
            .filter("pk in [1, 2]")
            .output_fields(vec!["pk".to_string(), "tags".to_string()])
            .build()?,
    )
    .await?;
println!("{res:?}");

// Example output:
// pk 1: tags [premium vip]
// pk 2: tags [new premium]
```

</TabItem>

<TabItem value='c++'>

```cpp
// 1. Create a collection with an ARRAY<VARCHAR> field

milvus::CollectionSchema schema;
schema.AddField(milvus::FieldSchema("pk", milvus::DataType::INT64, "", true, false));
schema.AddField(milvus::FieldSchema("embedding", milvus::DataType::FLOAT_VECTOR).WithDimension(5));
schema.AddField(milvus::FieldSchema("tags", milvus::DataType::ARRAY).WithElementType(milvus::DataType::VARCHAR).WithMaxCapacity(8).WithMaxLength(32));
status = client->CreateCollection(milvus::CreateCollectionRequest().WithCollectionName("users").WithCollectionSchema(std::make_shared<milvus::CollectionSchema>(schema)));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
status = client->CreateIndex(milvus::CreateIndexRequest().WithCollectionName("users").AddIndex(milvus::IndexDesc("embedding", "", milvus::IndexType::AUTOINDEX, milvus::MetricType::L2)));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
status = client->LoadCollection(milvus::LoadCollectionRequest().WithCollectionName("users"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// 2. Seed two entities

milvus::EntityRows seed = {
    {{"pk", 1}, {"embedding", std::vector<float>{0.1, 0.2, 0.3, 0.4, 0.5}}, {"tags", std::vector<std::string>{"new"}}},
    {{"pk", 2}, {"embedding", std::vector<float>{0.6, 0.7, 0.8, 0.9, 1.0}}, {"tags", std::vector<std::string>{"new", "trial"}}},
};
milvus::InsertResponse insert_resp;
status = client->Insert(milvus::InsertRequest().WithCollectionName("users").WithRowsData(std::move(seed)), insert_resp);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// 3. Append tags without reading the existing ARRAY values

milvus::EntityRows append_data = {
    {{"pk", 1}, {"tags", std::vector<std::string>{"premium", "vip"}}},
    {{"pk", 2}, {"tags", std::vector<std::string>{"premium"}}},
};
milvus::UpsertResponse resp_upsert;
status = client->Upsert(milvus::UpsertRequest().WithCollectionName("users").WithRowsData(std::move(append_data))
                            .AddFieldOp(milvus::FieldPartialUpdateOp("tags", milvus::FieldPartialUpdateOp::OpType::ARRAY_APPEND)),
                        resp_upsert);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
milvus::QueryResponse query_resp;
status = client->Query(milvus::QueryRequest().WithCollectionName("users").WithFilter("pk in [1, 2]").WithOutputFields({"pk", "tags"}), query_resp);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << query_resp << std::endl;

// 4. Remove matching tags without replacing the full ARRAY field

milvus::EntityRows remove_data = {
    {{"pk", 1}, {"tags", std::vector<std::string>{"new"}}},
    {{"pk", 2}, {"tags", std::vector<std::string>{"trial"}}},
};
status = client->Upsert(milvus::UpsertRequest().WithCollectionName("users").WithRowsData(std::move(remove_data))
                            .AddFieldOp(milvus::FieldPartialUpdateOp("tags", milvus::FieldPartialUpdateOp::OpType::ARRAY_REMOVE)),
                        resp_upsert);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
status = client->Query(milvus::QueryRequest().WithCollectionName("users").WithFilter("pk in [1, 2]").WithOutputFields({"pk", "tags"}), query_resp);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << query_resp << std::endl;
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 1. Create a collection with an ARRAY<VARCHAR> field

await client.createCollection({
    collection_name: "users",
    schema: [
        { name: "pk", data_type: DataType.Int64, is_primary_key: true },
        { name: "embedding", data_type: DataType.FloatVector, dim: 5 },
        { name: "tags", data_type: DataType.Array, element_type: DataType.VarChar, max_capacity: 8, max_length: 32 },
    ],
    index_params: [{ field_name: "embedding", index_type: "AUTOINDEX", metric_type: "L2" }],
});

// 2. Seed two entities

await client.insert({
    collection_name: "users",
    data: [
        { pk: 1, embedding: [0.1, 0.2, 0.3, 0.4, 0.5], tags: ["new"] },
        { pk: 2, embedding: [0.6, 0.7, 0.8, 0.9, 1.0], tags: ["new", "trial"] },
    ],
});

// 3. Append tags without reading the existing ARRAY values

await client.upsert({
    collection_name: "users",
    data: [
        { pk: 1, tags: ["premium", "vip"] },
        { pk: 2, tags: ["premium"] },
    ],
    field_ops: [{ field_name: "tags", op: "ARRAY_APPEND" }],
});
let res = await client.query({ collection_name: "users", filter: "pk in [1, 2]", output_fields: ["pk", "tags"] });
console.log(res.data);

// Example output:
// [{ pk: 1, tags: ['new', 'premium', 'vip'] },
//  { pk: 2, tags: ['new', 'trial', 'premium'] }]
// 4. Remove matching tags without replacing the full ARRAY field

await client.upsert({
    collection_name: "users",
    data: [
        { pk: 1, tags: ["new"] },
        { pk: 2, tags: ["trial"] },
    ],
    field_ops: [{ field_name: "tags", op: "ARRAY_REMOVE" }],
});
res = await client.query({ collection_name: "users", filter: "pk in [1, 2]", output_fields: ["pk", "tags"] });
console.log(res.data);

// Example output:
// [{ pk: 1, tags: ['premium', 'vip'] },
//  { pk: 2, tags: ['new', 'premium'] }]
```

</TabItem>

</Tabs>

## マージモードでの StructArray フィールドの Upsert\{#upsert-structarray-field-in-merge-mode}


エンティティの StructArray フィールドを upsert すると、そのフィールド値は上書きされます。つまり、StructArray フィールドを upsert するときは、struct スキーマで定義されたすべてのサブフィールドを含める必要があります。Milvus v3.0.x と互換性のある Dedicated クラスターでは、要素レベルで null を許容するサブフィールドを省略するか、Struct 要素内で `None` に設定できます。その場合、Zilliz Cloud はそれらに null を格納します。StructArray フィールドを含むコレクションへの upsert は、On-Demand クラスターではまだ利用できず、そこでは一括インポートが StructArray データの唯一の書き込み経路です。削除されたサブフィールドを依然として含むリクエストは拒否されます。

pymilvus では、StructArray 値の一部を置き換えることもできます。`upsert()` に `field_ops` を渡し、`FieldOp.path_replace()` を指定します。たとえば、`[1][lang]` のようなパスは 1 つの Struct 要素の 1 つのサブフィールドを置き換え、他の Struct 要素とサブフィールドは保持します。`[1]` のようなパスは Struct 要素全体を 1 つ置き換えます。子パスは選択したサブフィールドのみを対象とし、各オペランドにはそのキーを明示的に含める必要があります。要素全体を指定するパスでは、要素レベルで null を許容しないすべてのサブフィールドが必要であり、省略された要素レベルで null を許容するサブフィールドは null に設定されます。

```python
from pymilvus import FieldOp

client.upsert(
    collection_name="tech_articles",
    data=[
        {
            "doc_id": 1,
            "chunks": [{"lang": "zh"}],
        }
    ],
    field_ops={"chunks": FieldOp.path_replace("[1][lang]")},
)
```


次の例では、6 つのサブフィールドを持つ StructArray フィールドである `chunks` フィールドをマージモードで upsert する方法を示します。操作が完了すると、id 1 のエンティティの `chunks` フィールドは、リクエストで指定された 2 要素の struct の配列に設定されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
Gson gson = new Gson();

// Build the StructArray value with all subfields

JsonObject chunk1 = new JsonObject();

chunk1.addProperty("text", "Use HNSW efSearch to trade recall for latency.");
chunk1.addProperty("section", "index");
chunk1.addProperty("page", 1);
chunk1.addProperty("quality_score", 0.92);
chunk1.addProperty("has_code", true);
chunk1.add("emb_list_vector", gson.toJsonTree(new float[]{0.11f, 0.21f, 0.31f, 0.41f}));
JsonObject chunk2 = new JsonObject();
chunk2.addProperty("text", "Range search returns vectors within a distance boundary.");
chunk2.addProperty("section", "search");
chunk2.addProperty("page", 2);
chunk2.addProperty("quality_score", 0.86);
chunk2.addProperty("has_code", false);
chunk2.add("emb_list_vector", gson.toJsonTree(new float[]{0.18f, 0.23f, 0.29f, 0.36f}));
JsonArray chunks = new JsonArray();
chunks.add(chunk1);
chunks.add(chunk2);
JsonObject row = new JsonObject();
row.addProperty("id", 1);
row.add("chunks", chunks);
client.upsert(UpsertReq.builder()
        .collectionName("books")
        .data(Collections.singletonList(row))
        .partialUpdate(true)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// Build the StructArray column with all subfields

chunksColumn := column.NewColumnStructArray("chunks", []column.Column{
    column.NewColumnVarCharArray("text", [][]string{{"Use HNSW efSearch to trade recall for latency.", "Range search returns vectors within a distance boundary."}}),
    column.NewColumnVarCharArray("section", [][]string{{"index", "search"}}),
    column.NewColumnInt64Array("page", [][]int64{{1, 2}}),
    column.NewColumnDoubleArray("quality_score", [][]float64{{0.92, 0.86}}),
    column.NewColumnBoolArray("has_code", [][]bool{{true, false}}),
    column.NewColumnFloatVectorArray("emb_list_vector", 4, [][][]float32{{{0.11, 0.21, 0.31, 0.41}, {0.18, 0.23, 0.29, 0.36}}}),
})

_, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("books").
    WithInt64Column("id", []int64{1}).
    WithColumns(chunksColumn).
    WithPartialUpdate(true),
)

if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
let chunks: Vec<Vec<StructValue>> = vec![vec![
    serde_json::from_value::<StructValue>(serde_json::json!({
        "text": "Use HNSW efSearch to trade recall for latency.",
        "section": "index",
        "page": 1,
        "quality_score": 0.92,
        "has_code": true,
        "emb_list_vector": [0.11, 0.21, 0.31, 0.41]
    })).unwrap(),
    serde_json::from_value::<StructValue>(serde_json::json!({
        "text": "Range search returns vectors within a distance boundary.",
        "section": "search",
        "page": 2,
        "quality_score": 0.86,
        "has_code": false,
        "emb_list_vector": [0.18, 0.23, 0.29, 0.36]
    })).unwrap(),
]];
client
    .upsert(
        UpsertRequest::builder()
            .insert(
                InsertRequest::builder()
                    .collection_name("books")
                    .columns(vec![
                        FieldData::Int64 {
                            name: "id".into(),
                            values: vec![1i64],
                        },
                        FieldData::Struct {
                            name: "chunks".into(),
                            values: chunks,
                        },
                    ])
                    .build()?,
            )
            .partial_update(true)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
// Build the StructArray value with all subfields

milvus::EntityRows data = {
    {{"id", 1},
     {"chunks", std::vector<milvus::EntityRow>{
         {{"text", "Use HNSW efSearch to trade recall for latency."}, {"section", "index"}, {"page", 1}, {"quality_score", 0.92}, {"has_code", true}, {"emb_list_vector", std::vector<float>{0.11, 0.21, 0.31, 0.41}}},
         {{"text", "Range search returns vectors within a distance boundary."}, {"section", "search"}, {"page", 2}, {"quality_score", 0.86}, {"has_code", false}, {"emb_list_vector", std::vector<float>{0.18, 0.23, 0.29, 0.36}}}
     }}}
};
milvus::UpsertResponse resp_upsert;
status = client->Upsert(milvus::UpsertRequest()
                            .WithCollectionName("books")
                            .WithRowsData(std::move(data))
                            .WithPartialUpdate(true),
                        resp_upsert);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.upsert({
    collection_name: "books",
    data: [
        {
            id: 1,
            chunks: [
                {text: "Use HNSW efSearch to trade recall for latency.", section: "index", page: 1, quality_score: 0.92, has_code: true, emb_list_vector: [0.11, 0.21, 0.31, 0.41]},
                {text: "Range search returns vectors within a distance boundary.", section: "search", page: 2, quality_score: 0.86, has_code: false, emb_list_vector: [0.18, 0.23, 0.29, 0.36]},
            ],
        },
    ],
    partial_update: true,
});
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
    "collectionName": "books",
    "data": [
        {
            "id": 1,
            "chunks": [
                {"text": "Use HNSW efSearch to trade recall for latency.", "section": "index", "page": 1, "quality_score": 0.92, "has_code": true, "emb_list_vector": [0.11, 0.21, 0.31, 0.41]},
                {"text": "Range search returns vectors within a distance boundary.", "section": "search", "page": 2, "quality_score": 0.86, "has_code": false, "emb_list_vector": [0.18, 0.23, 0.29, 0.36]}
            ]
        }
    ],
    "partialUpdate": true
}'

# {
#     "code": 0,
#     "data": {
#         "upsertCount": 1,
#         "upsertIds": [
#             1
#         ]
#     }
# }
```

</TabItem>

</Tabs>
