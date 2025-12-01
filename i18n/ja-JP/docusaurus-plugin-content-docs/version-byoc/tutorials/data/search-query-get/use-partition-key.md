---
title: "パーティションキーの使用 | BYOC"
slug: /use-partition-key
sidebar_label: "パーティションキーの使用"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "パーティションキーは、パーティションに基づく検索最適化ソリューションです。特定のスカラーフィールドをパーティションキーとして指定し、検索中にパーティションキーに基づくフィルター条件を指定することにより、検索範囲をいくつかのパーティションに限定し、検索効率を向上させることができます。この記事では、パーティションキーの使用方法と関連する考慮事項について紹介します。 | BYOC"
type: origin
token: QWqiwrgJViA5AJkv64VcgQX2nKd
sidebar_position: 14
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - 検索最適化
  - パーティションキー
  - ビデオ類似検索
  - ベクトル検索
  - オーディオ類似検索
  - エラスティックベクトルデータベース

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# パーティションキーの使用

パーティションキーは、パーティションに基づく検索最適化ソリューションです。特定のスカラーフィールドをパーティションキーとして指定し、検索中にパーティションキーに基づくフィルター条件を指定することにより、検索範囲をいくつかのパーティションに限定し、検索効率を向上させることができます。この記事では、パーティションキーの使用方法と関連する考慮事項について紹介します。

## 概要\{#overview}

Zilliz Cloudでは、パーティションを使用してデータの分離を実行し、検索範囲を特定のパーティションに限定することで検索パフォーマンスを向上させることができます。パーティションを手動で管理することを選択した場合、1つのコレクションに最大1,024個のパーティションを作成でき、特定のルールに基づいてこれらのパーティションにエンティティを挿入することで、特定の数のパーティション内での検索に検索範囲を限定できます。

Zilliz Cloudでは、パーティションキーを使用して、データ分離におけるパーティションを再利用して、コレクションで作成できるパーティション数の上限を克服できます。コレクション作成時に、スカラーフィールドをパーティションキーとして使用できます。コレクションの準備ができると、Zilliz Cloudはコレクション内に指定された数のパーティションを作成します。挿入されたエンティティを受信すると、Zilliz Cloudはエンティティのパーティションキー値を使用してハッシュ値を計算し、ハッシュ値とコレクションの`partitions_num`プロパティに基づいてモジュロ演算を実行して対象のパーティションIDを取得し、エンティティを対象のパーティションに格納します。

![IXXIwZdOYhRFXmbTMdwcaN6fnPe](/img/IXXIwZdOYhRFXmbTMdwcaN6fnPe.png)

以下の図は、Zilliz Cloudがパーティションキーフィーチャーが有効なコレクションと無効なコレクションで検索要求を処理する方法を示しています。

- パーティションキーが無効になっている場合、Zilliz Cloudはクエリーベクトルに最も類似したエンティティをコレクション内で検索します。最も関連性の高い結果が含まれるパーティションがわかっている場合は、検索範囲を限定できます。

- パーティションキーが有効になっている場合、Zilliz Cloudは検索フィルターで指定されたパーティションキー値に基づいて検索範囲を決定し、一致するパーティション内のエンティティのみをスキャンします。

![RTaqwdaWXhRWPTb4uJTc9Uknn5c](/img/RTaqwdaWXhRWPTb4uJTc9Uknn5c.png)

## パーティションキーの使用\{#use-partition-key}

パーティションキーを使用するには、

- [パーティションキーの設定](./use-partition-key#set-partition-key)、

- [作成するパーティション数の設定](./use-partition-key#set-partition-numbers)（オプション）、および

- [パーティションキーに基づくフィルター条件の作成](./use-partition-key#create-filtering-condition)が必要です。

### パーティションキーの設定\{#set-partition-key}

特定のスカラーフィールドをパーティションキーとして指定するには、スカラーフィールドを追加する際にその`is_partition_key`属性を`true`に設定する必要があります。

<Admonition type="info" icon="📘" title="注釈">

<p>スカラーフィールドをパーティションキーとして設定する際、フィールド値を空にしたりNULLにしたりすることはできません。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient, DataType
)

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

schema = client.create_schema()

schema.add_field(field_name="id",
    datatype=DataType.INT64,
    is_primary=True)

schema.add_field(field_name="vector",
    datatype=DataType.FLOAT_VECTOR,
    dim=5)

# パーティションキーを追加
schema.add_field(
    field_name="my_varchar",
    datatype=DataType.VARCHAR,
    max_length=512,
    # highlight-next-line
    is_partition_key=True,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

// スキーマを作成
CreateCollectionReq.CollectionSchema schema = client.createSchema();

schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("vector")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());

// パーティションキーを追加
schema.addField(AddFieldReq.builder()
        .fieldName("my_varchar")
        .dataType(DataType.VarChar)
        .maxLength(512)
        // highlight-next-line
        .isPartitionKey(true)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
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

schema := entity.NewSchema().WithDynamicFieldEnabled(false)
schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("my_varchar").
    WithDataType(entity.FieldTypeVarChar).
    WithIsPartitionKey(true).
    WithMaxLength(512),
).WithField(entity.NewField().
    WithName("vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(5),
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 3. カスタマイズ設定モードでコレクションを作成
// 3.1 フィールドを定義
const fields = [
    {
        name: "my_varchar",
        data_type: DataType.VarChar,
        max_length: 512,
        // highlight-next-line
        is_partition_key: true
    }
]
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
        "autoId": true,
        "enabledDynamicField": false,
        "fields": [
            {
                "fieldName": "id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "vector",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "5"
                }
            },
            {
                "fieldName": "my_varchar",
                "dataType": "VarChar",
                "isPartitionKey": true,
                "elementTypeParams": {
                    "max_length": 512
                }
            }
        ]
    }'
```

</TabItem>
</Tabs>

### パーティション数の設定\{#set-partition-numbers}

コレクション内のスカラーフィールドをパーティションキーとして指定すると、Zilliz Cloudは自動的に16個のパーティションをコレクション内に作成します。エンティティを受信すると、Zilliz Cloudはこのエンティティのパーティションキー値に基づいてパーティションを選択し、そのパーティションにエンティティを格納します。これにより、いくつかまたはすべてのパーティションが異なるパーティションキー値を持つエンティティを保持することになります。

コレクションと一緒に作成するパーティション数を指定することもできます。これは、パーティションキーとして指定されたスカラーフィールドがある場合にのみ有効です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    # highlight-next-line
    num_partitions=128
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
                .collectionName("my_collection")
                .collectionSchema(schema)
                .numPartitions(128)
                .build();
        client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithNumPartitions(128))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.create_collection({
    collection_name: "my_collection",
    schema: schema,
    num_partitions: 128
})
```

</TabItem>

<TabItem value='bash'>

```bash
export params='{
    "partitionsNum": 128
}'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

### フィルター条件の作成\{#create-filtering-condition}

パーティションキーフィーチャーが有効なコレクションでANN検索を実行する際には、検索リクエストにパーティションキーを含んだフィルター式を含める必要があります。フィルター式では、パーティションキー値を特定の範囲内に制限することで、Zilliz Cloudが検索範囲を対応するパーティション内に限定できます。

削除操作を実行する際には、パーティションキーを1つ指定するフィルター式を含めることで、より効率的な削除を実現することをお勧めします。この方法により、削除操作は特定のパーティションに限定され、コンパクション中の書き込み増幅を減らし、コンパクションおよびインデックス作成のためのリソースを節約できます。

以下の例では、特定のパーティションキー値およびパーティションキーセットに基づくパーティションキーによるフィルタリングを示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 単一のパーティションキー値に基づくフィルター、または
filter='partition_key == "x" && <other conditions>'

# 複数のパーティションキー値に基づくフィルター
filter='partition_key in ["x", "y", "z"] && <other conditions>'
```

</TabItem>

<TabItem value='java'>

```java
// 単一のパーティションキー値に基づくフィルター、または
String filter = "partition_key == 'x' && <other conditions>";

// 複数のパーティションキー値に基づくフィルター
String filter = "partition_key in ['x', 'y', 'z'] && <other conditions>";
```

</TabItem>

<TabItem value='go'>

```go
// 単一のパーティションキー値に基づくフィルター、または
filter = "partition_key == 'x' && <other conditions>"

// 複数のパーティションキー値に基づくフィルター
filter = "partition_key in ['x', 'y', 'z'] && <other conditions>"
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 単一のパーティションキー値に基づくフィルター、または
const filter = 'partition_key == "x" && <other conditions>'

// 複数のパーティションキー値に基づくフィルター
const filter = 'partition_key in ["x", "y", "z"] && <other conditions>'
```

</TabItem>

<TabItem value='bash'>

```bash
# 単一のパーティションキー値に基づくフィルター、または
export filter='partition_key == "x" && <other conditions>'

# 複数のパーティションキー値に基づくフィルター
export filter='partition_key in ["x", "y", "z"] && <other conditions>'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="注釈">

<p><code>partition_key</code>をパーティションキーとして指定されたフィールドの名前に置き換える必要があります。</p>

</Admonition>

## パーティションキーアイソレーションの使用\{#use-partition-key-isolation}

マルチテナンシーのシナリオでは、テナントIDに関連するスカラーフィールドをパーティションキーとして指定し、このスカラーフィールドの特定の値に基づくフィルターを作成できます。同様のシナリオでの検索パフォーマンスをさらに向上させるために、Zilliz Cloudはパーティションキーアイソレーション機能を導入しています。

![BVotwv5BvhBWXXbvotUccowZnng](/img/BVotwv5BvhBWXXbvotUccowZnng.png)

上図に示すように、Zilliz Cloudはパーティションキー値に基づいてエンティティをグループ化し、これらのグループごとに別々のインデックスを作成します。検索要求を受信すると、Zilliz Cloudはフィルター条件で指定されたパーティションキー値に基づいてインデックスを特定し、そのインデックスに含まれるエンティティ内の検索範囲を限定することで、検索中に無関係なエンティティをスキャンすることを避け、検索パフォーマンスを大幅に向上させます。

パーティションキーアイソレーションを有効にすると、パーティションキーに基づくフィルターには1つの特定の値のみを含める必要があり、Zilliz Cloudが検索範囲を一致するインデックスに含まれるエンティティ内に限定できるようになります。

### パーティションキーアイソレーションの有効化\{#enable-partition-key-isolation}

以下のコード例は、パーティションキーアイソレーションを有効にする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    # highlight-next-line
    properties={"partitionkey.isolation": True}
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

Map<String, String> properties = new HashMap<>();
properties.put("partitionkey.isolation", "true");

CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .properties(properties)
        .build();
client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithProperty("partitionkey.isolation", true))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.alterCollection({
    collection_name: "my_collection",
    properties: {
        "partitionkey.isolation": true
    }
})
```

</TabItem>

<TabItem value='bash'>

```bash
export params='{
    "partitionKeyIsolation": true
}'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

パーティションキーアイソレーションを有効にすると、[パーティション数の設定](./use-partition-key#set-partition-numbers)で説明したように、パーティションキーとパーティション数を設定できます。パーティションキーに基づくフィルターは、単一の特定のパーティションキー値のみを含むべきであることに注意してください。