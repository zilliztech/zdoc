---
title: "パーティションキーの使用 | BYOC"
slug: /use-partition-key
sidebar_label: "パーティションキーの使用"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "パーティションキーは、パーティションに基づく検索最適化解決です。特定のスカラー領域をパーティションキーとして指定し、検索中にパーティションキーに基づくフィルタリング条件を指定することで、検索範囲をいくつかのパーティションに絞り込み、検索効率を向上させることができます。この記事では、パーティションキーの使用方法と関連する検討事項を紹介します。| BYOC"
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
  - 音声類似検索
  - エラスティックベクトルデータベース

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# パーティションキーの使用

パーティションキーは、パーティションに基づく検索最適化解決です。特定のスカラー領域をパーティションキーとして指定し、検索中にパーティションキーに基づくフィルタリング条件を指定することで、検索範囲をいくつかのパーティションに絞り込み、検索効率を向上させることができます。この記事では、パーティションキーの使用方法と関連する検討事項を紹介します。

## 概要\{#overview}

Zilliz Cloudでは、パーティションを使用してデータの分離を実装し、検索範囲を特定のパーティションに制限することで検索パフォーマンスを向上させることができます。パーティションを手動で管理することを選択した場合、コレクション内に最大1,024個のパーティションを作成し、特定のルールに基づいてこれらのパーティションにエンティティを挿入することで、特定の数のパーティション内での検索を制限することにより検索範囲を絞り込むことができます。

Zilliz Cloudは、データ分離におけるパーティションの再利用を可能にするためにパーティションキーを導入し、コレクションで作成できるパーティション数の制限を克服します。コレクションを作成する際、スカラー領域をパーティションキーとして使用できます。一度コレクションが準備されると、Zilliz Cloudはコレクション内部に指定された数のパーティションを作成します。挿入されたエンティティを受け取ると、Zilliz Cloudはエンティティのパーティションキー値を使用してハッシュ値を計算し、そのハッシュ値とコレクションの`partitions_num`プロパティに基づいてモジュロ演算を実行してターゲットパーティションIDを取得し、エンティティをターゲットパーティションに保存します。

![IXXIwZdOYhRFXmbTMdwcaN6fnPe](/img/IXXIwZdOYhRFXmbTMdwcaN6fnPe.png)

以下の図は、パーティションキーフィーチャーの有効/無効に関わらず、Zilliz Cloudがコレクション内の検索要求をどのように処理するかを示しています。

- パーティションキーが無効な場合、Zilliz Cloudはコレクション内でクエリーベクトルに最も類似したエンティティを検索します。最も関連性の高い結果が含まれているパーティションが分かっていれば検索範囲を絞り込むことができます。

- パーティションキーが有効な場合、Zilliz Cloudは検索フィルターで指定されたパーティションキー値に基づいて検索範囲を決定し、一致するパーティション内のエンティティのみをスキャンします。

![RTaqwdaWXhRWPTb4uJTc9Uknn5c](/img/RTaqwdaWXhRWPTb4uJTc9Uknn5c.png)

## パーティションキーの使用\{#use-partition-key}

パーティションキーを使用するには、以下を行う必要があります。

- [パーティションキーの設定](./use-partition-key#set-partition-key)、

- [作成するパーティション数の設定](./use-partition-key#set-partition-numbers)（オプション）、および

- [パーティションキーに基づくフィルタリング条件の作成](./use-partition-key#create-filtering-condition)。

### パーティションキーの設定\{#set-partition-key}

スカラー領域をパーティションキーとして指定するには、スカラー領域を追加するときにその`is_partition_key`属性を`true`に設定する必要があります。

<Admonition type="info" icon="📘" title="注意">

<p>スカラー領域をパーティションキーとして設定する際、そのフィールド値は空またはnullにすることはできません。</p>

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

// スキーマ作成
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
    // エラー処理
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

コレクション内のスカラー領域をパーティションキーとして指定すると、Zilliz Cloudはコレクション内に自動的に16個のパーティションを作成します。エンティティを受け取ると、Zilliz Cloudはこのエンティティのパーティションキー値に基づいてパーティションを選択し、エンティティをそのパーティションに保存することで、一部またはすべてのパーティションが異なるパーティションキー値を持つエンティティを保持することになります。

コレクションとともに作成するパーティション数を指定することもできます。これは、パーティションキーとして指定されたスカラー領域がある場合にのみ有効です。

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
    // エラー処理
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

### フィルタリング条件の作成\{#create-filtering-condition}

パーティションキーフィーチャーが有効なコレクションでANN検索を実行する際は、検索要求にパーティションキーを含むフィルタリング式を含める必要があります。フィルタリング式では、パーティションキー値を特定の範囲に制限することで、Zilliz Cloudが対応するパーティション内に検索範囲を制限するようにします。

削除操作を実行する際は、より効率的な削除を実現するために、単一のパーティションキーを指定するフィルター式を含めることをお勧めします。この方法により、削除操作が特定のパーティションに限定され、コンパクション時の書き込み増幅を削減し、コンパクションとインデックス作成のためのリソースを節約します。

以下の例では、特定のパーティションキー値および一連のパーティションキー値に基づくパーティションキーベースのフィルタリングを示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 単一のパーティションキー値に基づいてフィルターする、または
filter='partition_key == "x" && <other conditions>'

# 複数のパーティションキー値に基づいてフィルターする
filter='partition_key in ["x", "y", "z"] && <other conditions>'
```

</TabItem>

<TabItem value='java'>

```java
// 単一のパーティションキー値に基づいてフィルターする、または
String filter = "partition_key == 'x' && <other conditions>";

// 複数のパーティションキー値に基づいてフィルターする
String filter = "partition_key in ['x', 'y', 'z'] && <other conditions>";
```

</TabItem>

<TabItem value='go'>

```go
// 単一のパーティションキー値に基づいてフィルターする、または
filter = "partition_key == 'x' && <other conditions>"

// 複数のパーティションキー値に基づいてフィルターする
filter = "partition_key in ['x', 'y', 'z'] && <other conditions>"
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 単一のパーティションキー値に基づいてフィルターする、または
const filter = 'partition_key == "x" && <other conditions>'

// 複数のパーティションキー値に基づいてフィルターする
const filter = 'partition_key in ["x", "y", "z"] && <other conditions>'
```

</TabItem>

<TabItem value='bash'>

```bash
# 単一のパーティションキー値に基づいてフィルターする、または
export filter='partition_key == "x" && <other conditions>'

# 複数のパーティションキー値に基づいてフィルターする
export filter='partition_key in ["x", "y", "z"] && <other conditions>'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="注意">

<p><code>partition_key</code>は、パーティションキーとして指定されたフィールドの名前に置き換える必要があります。</p>

</Admonition>

## パーティションキーアイソレーションの使用\{#use-partition-key-isolation}

マルチテナントシナリオでは、テナントIDに関連するスカラー領域をパーティションキーとして指定し、このスカラー領域の特定の値に基づいてフィルターを作成できます。同様のシナリオで検索パフォーマンスをさらに向上させるために、Zilliz Cloudはパーティションキーアイソレーション機能を導入しています。

![BVotwv5BvhBWXXbvotUccowZnng](/img/BVotwv5BvhBWXXbvotUccowZnng.png)

上図に示すように、Zilliz Cloudはパーティションキー値に基づいてエンティティをグループ化し、これらの各グループに個別のインデックスを作成します。検索要求を受け取ると、Zilliz Cloudはフィルタリング条件で指定されたパーティションキー値に基づいてインデックスを特定し、そのインデックスに含まれるエンティティ内に検索範囲を制限することで、検索中に無関係なエンティティをスキャンするのを避け、検索パフォーマンスを大幅に向上させます。

パーティションキーアイソレーションを有効にした後は、パーティションキーベースのフィルターに一致するインデックスに含まれるエンティティ内に検索範囲を制限するために、単一の特定の値のみを含める必要があります。

### パーティションキーアイソレーションの有効化\{#enable-partition-key-isolation}

以下のコード例では、パーティションキーアイソレーションの有効化方法を示しています。

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
    // エラー処理
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

パーティションキーアイソレーションを有効にした後も、[パーティション数の設定](./use-partition-key#set-partition-numbers)で説明されているようにパーティションキーとパーティション数を設定できます。パーティションキーベースのフィルターには特定のパーティションキー値のみを含める必要があることに注意してください。