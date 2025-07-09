---
title: "パーティションキーを使う | BYOC"
slug: /use-partition-key
sidebar_label: "パーティションキーを使う"
beta: FALSE
notebook: FALSE
description: "パーティションキーは、パーティションに基づく検索最適化ソリューションです。特定のスカラーフィールドをパーティションキーとして指定し、検索中にパーティションキーに基づくフィルタリング条件を指定することで、検索範囲を複数のパーティションに絞り込むことができ、検索効率を向上させることができます。この記事では、パーティションキーの使用方法と関連する考慮事項を紹介します。 | BYOC"
type: origin
token: QWqiwrgJViA5AJkv64VcgQX2nKd
sidebar_position: 14
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search optimization
  - partition key
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# パーティションキーを使う

パーティションキーは、パーティションに基づく検索最適化ソリューションです。特定のスカラーフィールドをパーティションキーとして指定し、検索中にパーティションキーに基づくフィルタリング条件を指定することで、検索範囲を複数のパーティションに絞り込むことができ、検索効率を向上させることができます。この記事では、パーティションキーの使用方法と関連する考慮事項を紹介します。

## 概要について{#overview}

にZillizクラウドパーティションを使用してデータの分離を実装し、検索範囲を特定のパーティションに制限することで検索パフォーマンスを向上させることができます。パーティションを手動で管理する場合、コレクション内に最大1,024のパーティションを作成し、特定のルールに基づいてこれらのパーティションにエンティティを挿入して、特定のパーティション数内で検索を制限することで検索範囲を狭めることができます。

Zillizクラウドコレクションに作成できるパーティションの数の制限を克服するために、データ分離でパーティションを再利用するためのパーティションキーを紹介します。コレクションを作成するときは、スカラーフィールドをパーティションキーとして使用できます。コレクションの準備ができたら、Zillizクラウドコレクション内に指定された数のパーティションを作成します。挿入されたエンティティを受け取ると、Zillizクラウドエンティティのパーティションキー値を使用してハッシュ値を計算し、ハッシュ値とコレクションの`partitions_num`プロパティに基づいてモジュロ演算を実行してターゲットパーティションIDを取得し、エンティティをターゲットパーティションに格納します。

![IXXIwZdOYhRFXmbTMdwcaN6fnPe](/img/IXXIwZdOYhRFXmbTMdwcaN6fnPe.png)

次の図は、方法を示していますZillizクラウドパーティションキー機能が有効になっているかどうかにかかわらず、コレクション内の検索要求を処理します。 

- パーティションキーが無効になっている場合、Zillizクラウドコレクション内のクエリベクトルに最も類似したエンティティを検索します。最も関連性の高い結果が含まれるパーティションがわかっている場合は、検索範囲を絞り込むことができます。

- パーティションキーが有効になっている場合、Zillizクラウド検索フィルターで指定されたパーティションキーの値に基づいて検索範囲を決定し、一致するパーティション内のエンティティのみをスキャンします。

![RTaqwdaWXhRWPTb4uJTc9Uknn5c](/img/RTaqwdaWXhRWPTb4uJTc9Uknn5c.png)

## パーティションキーを使う{#use-partition-key}

パーティションキーを使用するには、

- リンク_PLACEHOLDER_0,

- [作成するパーティションの数を設定する](./use-partition-key#set-partition-numbers)(オプション)

- リンク_PLACEHOLDER_0.

### パーティションキーを設定{#set-partition-key}

スカラーフィールドをパーティションキーとして指定するには、スカラーフィールドを追加するときに、その`is_partition_key`属性を`true`に設定する必要があります。

<Admonition type="info" icon="📘" title="ノート">

<p>スカラーフィールドをパーティションキーとして設定する場合、フィールド値は空またはnullにすることはできません。</p>

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

# Add the partition key
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

// Create schema
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
        
// Add the partition key
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

// 3. Create a collection in customized setup mode
// 3.1 Define fields
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

### パーティション番号を設定する{#set-partition-numbers}

コレクション内のスカラーフィールドをパーティションキーとして指定する場合、Zillizクラウドコレクションに自動的に16のパーティションを作成します。エンティティを受信すると、Zillizクラウドこのエンティティのパーティションキー値に基づいてパーティションを選択し、エンティティをパーティションに格納します。 

コレクションと一緒に作成するパーティションの数を決定することもできます。これは、パーティションキーとして指定されたスカラーフィールドがある場合にのみ有効です。

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

### フィルタリング条件の作成{#create-filtering-condition}

パーティションキー機能を有効にしてコレクション内でANN検索を実行する場合、検索要求にパーティションキーを含むフィルタリング式を含める必要があります。フィルタリング式では、パーティションキーの値を特定の範囲内に制限することができます。Zillizクラウド対応するパーティション内の検索範囲を制限します。 

削除操作を実行する場合、より効率的な削除を実現するために、単一のパーティションキーを指定するフィルタ式を含めることをお勧めします。このアプローチでは、削除操作を特定のパーティションに制限し、圧縮中の書き込み増幅を減らし、圧縮とインデックスのためのリソースを節約します。

次の例は、特定のパーティションキー値と一連のパーティションキー値に基づくパーティションキーベースのフィルタリングを示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Filter based on a single partition key value, or
filter='partition_key == "x" && <other conditions>'

# Filter based on multiple partition key values
filter='partition_key in ["x", "y", "z"] && <other conditions>'
```

</TabItem>

<TabItem value='java'>

```java
// Filter based on a single partition key value, or
String filter = "partition_key == 'x' && <other conditions>";

// Filter based on multiple partition key values
String filter = "partition_key in ['x', 'y', 'z'] && <other conditions>";
```

</TabItem>

<TabItem value='go'>

```go
// Filter based on a single partition key value, or
filter = "partition_key == 'x' && <other conditions>"

// Filter based on multiple partition key values
filter = "partition_key in ['x', 'y', 'z'] && <other conditions>"
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Filter based on a single partition key value, or
const filter = 'partition_key == "x" && <other conditions>'

// Filter based on multiple partition key values
const filter = 'partition_key in ["x", "y", "z"] && <other conditions>'
```

</TabItem>

<TabItem value='bash'>

```bash
# Filter based on a single partition key value, or
export filter='partition_key == "x" && <other conditions>'

# Filter based on multiple partition key values
export filter='partition_key in ["x", "y", "z"] && <other conditions>'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="ノート">

<p><code>partition_key</code>をパーティションキーとして指定されたフィールドの名前に置き換える必要があります。</p>

</Admonition>

## パーティションキーの分離を使用する{#use-partition-key-isolation}

マルチテナントシナリオでは、テナントIDに関連するスカラーフィールドをパーティションキーとして指定し、このスカラーフィールドの特定の値に基づいてフィルターを作成できます。同様のシナリオで検索パフォーマンスをさらに向上させるには、Zillizクラウドパーティションキー分離機能を導入します。

![BVotwv5BvhBWXXbvotUccowZnng](/img/BVotwv5BvhBWXXbvotUccowZnng.png)

上の図に示すように、Zillizクラウドパーティションキーの値に基づいてエンティティをグループ化し、これらのグループごとに個別のインデックスを作成します。検索リクエストを受け取ると、Zillizクラウドフィルタリング条件で指定されたパーティションキー値に基づいてインデックスを検索し、インデックスに含まれるエンティティ内で検索範囲を制限することで、検索中に関係のないエンティティをスキャンすることを回避し、検索パフォーマンスを大幅に向上させます。

Partition Key Isolationを有効にしたら、Partition-key-based filterに特定の値を1つだけ含める必要があります。Zillizクラウド一致するインデックスに含まれるエンティティ内で検索範囲を制限できます。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、Milvus v 2.4. xと互換性があり、Performance-optimizedCUを使用するクラスターで使用できます。
他のCUタイプのクラスターとすべてのサブスクリプションプランについては、この機能を使用する前にMilvus v 2.5. xとの互換性を確認してください。</p>
<p></include></p>
<p>現在、パーティションキーの分離機能は、インデックスタイプがHNSWに設定された検索にのみ適用されます。</p>
<p></include></p>

</Admonition>

### パーティションキーの分離を有効にする{#enable-partition-key-isolation}

次のコード例は、パーティションキー分離を有効にする方法を示しています。

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

パーティションキーの分離を有効にした後でも、[パーティション番号を設定する](./use-partition-key#set-partition-numbers)で説明されているように、パーティションキーとパーティション数を設定できます。ただし、パーティションキーベースのフィルターには、特定のパーティションキー値のみを含める必要があります。