---
title: "パーティションキーを使う | BYOC"
slug: /use-partition-key
sidebar_label: "パーティションキーを使う"
beta: FALSE
notebook: FALSE
description: "パーティションキーは、パーティションに基づく検索最適化ソリューションです。特定のスカラーフィールドをパーティションキーとして指定し、検索中にパーティションキーに基づくフィルタリング条件を指定することで、検索範囲を複数のパーティションに絞り込むことができ、検索効率を向上させることができます。この記事では、パーティションキーの使用方法と関連する考慮事項を紹介します。 | BYOC"
type: origin
token: LBGuwDfViiZHc5k0ETRcJ4tJnvg
sidebar_position: 13
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search optimization
  - partition key
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# パーティションキーを使う

パーティションキーは、パーティションに基づく検索最適化ソリューションです。特定のスカラーフィールドをパーティションキーとして指定し、検索中にパーティションキーに基づくフィルタリング条件を指定することで、検索範囲を複数のパーティションに絞り込むことができ、検索効率を向上させることができます。この記事では、パーティションキーの使用方法と関連する考慮事項を紹介します。

## 概要について{#overview}

Zilliz Cloudでは、パーティションを使用してデータの分離を実装し、検索範囲を特定のパーティションに制限することで検索パフォーマンスを向上させることができます。パーティションを手動で管理する場合、コレクション内に最大1,024のパーティションを作成し、特定のルールに基づいてこれらのパーティションにエンティティを挿入して、特定のパーティション数内で検索を制限することで検索範囲を狭めることができます。

Zilliz Cloudは、データ分離においてパーティションを再利用し、コレクション内で作成できるパーティションの数の制限を克服するためのパーティションキーを導入しました。コレクションを作成する際には、スカラーフィールドをパーティションキーとして使用できます。コレクションが準備できたら、Zilliz Cloudは、パーティションキーの値の範囲に対応する各パーティションをコレクション内に指定された数作成します。Zilliz Cloudは、挿入されたエンティティを受け取ると、エンティティのPartition Key値を使用してハッシュ値を計算し、ハッシュ値とコレクションのpartitions_numプロパティに基づいてモジュロ演算を実行してターゲットパーティションIDを取得し、エンティティをターゲットパーティションに格納します。

![CBlIwLuElhntQDbtL9ncOvxBnke](/byoc/ja-JP/CBlIwLuElhntQDbtL9ncOvxBnke.png)

次の図は、Zilliz Cloudが、パーティションキー機能を有効にしているかどうかにかかわらず、コレクション内の検索リクエストを処理する方法を示しています。

- パーティションキーが無効になっている場合、Zilliz Cloudは、コレクション内のクエリベクトルに最も類似したエンティティを検索します。最も関連性の高い結果を含むパーティションがわかっている場合は、検索範囲を狭めることができます。

- パーティションキーが有効になっている場合、Zilliz Cloudは、検索フィルターで指定されたパーティションキーの値に基づいて検索範囲を決定し、一致するパーティション内のエンティティのみをスキャンします。

![SMKhwOsK0hu7mrbLc9LcTexdnVc](/byoc/ja-JP/SMKhwOsK0hu7mrbLc9LcTexdnVc.png)

## パーティションキーを使う{#use-partition-key}

パーティションキーを使用するには、

- パーティションキーを設定します。

- 作成するパーティションの数を設定します（オプション）。

- パーティションキーに基づいてフィルタリング条件を作成してください。

### パーティションキーを設定{#set-partition-key}

スカラーフィールドをパーティションキーとして指定するには、スカラーフィールドを追加するときにその`is_artition_key`属性を`true`に設定する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
                "fieldName": "my_id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "my_vector",
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

コレクション内のスカラーフィールドをパーティションキーとして指定すると、Zilliz Cloudは自動的にコレクション内に16のパーティションを作成します。エンティティを受け取ると、Zilliz Cloudはこのエンティティのパーティションキー値に基づいてパーティションを選択し、エンティティをパーティションに保存します。その結果、いくつかまたはすべてのパーティションに異なるパーティションキー値を持つエンティティが保持されます。

コレクションと一緒に作成するパーティションの数を決定することもできます。これは、パーティションキーとして指定されたスカラーフィールドがある場合にのみ有効です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    # highlight-next-line
    num_partitions=1024
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
                .collectionName("my_collection")
                .collectionSchema(schema)
                .numPartitions(1024)
                .build();
        client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.create_collection({
    collection_name: "my_collection",
    schema: schema,
    num_partitions: 1024
})
```

</TabItem>

<TabItem value='bash'>

```bash
export params='{
    "partitionsNum": 1024
}'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"myCollection\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

### フィルタリング条件の作成{#create-filtering-condition}

パーティションキー機能を有効にしてコレクション内でANN検索を実行する場合、検索要求にパーティションキーを含むフィルタリング式を含める必要があります。フィルタリング式では、Zilliz Cloudが対応するパーティション内の検索範囲を制限するように、パーティションキーの値を特定の範囲内に制限できます。

削除操作を実行する場合、より効率的な削除を実現するために、単一のパーティションキーを指定するフィルタ式を含めることをお勧めします。このアプローチでは、削除操作を特定のパーティションに制限し、圧縮中の書き込み増幅を減らし、圧縮とインデックスのためのリソースを節約します。

次の例は、特定のパーティションキー値と一連のパーティションキー値に基づくパーティションキーベースのフィルタリングを示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

\<ターゲットを含める="zilliz">

## パーティションキーの分離を使用する{#use-partition-key-isolation}

マルチテナントシナリオでは、テナントIDに関連するスカラーフィールドをパーティションキーとして指定し、このスカラーフィールドの特定の値に基づいてフィルタを作成できます。同様のシナリオで検索パフォーマンスをさらに向上させるために、Zilliz Cloudにはパーティションキー分離機能が導入されています。

![SYAKwuWqThNNg0banPLcqkhhn3e](/byoc/ja-JP/SYAKwuWqThNNg0banPLcqkhhn3e.png)

上記の図に示すように、Zilliz Cloudは、パーティションキーの値に基づいてエンティティをグループ化し、これらのグループごとに別々のインデックスを作成します。検索リクエストを受け取ると、Zilliz Cloudは、フィルタリング条件で指定されたパーティションキーの値に基づいてインデックスを検索し、インデックスに含まれるエンティティ内で検索範囲を制限するため、検索中に関係のないエンティティをスキャンすることを回避し、検索パフォーマンスを大幅に向上させます。

パーティションキーの分離を有効にすると、パーティションキーベースのフィルターに特定の値のみを含めることができます。これにより、Zilliz Cloudは、一致するインデックスに含まれるエンティティ内の検索範囲を制限できます。

<Admonition type="info" icon="📘" title="ノート">

<p>現在、パーティションキーの分離機能は<strong>Performance-optimized</strong>クラスタにのみ適用されます。</p>

</Admonition>

### パーティションキーの分離を有効にする{#enable-partition-key-isolation}

次のコード例は、パーティションキー分離を有効にする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
        .numPartitions(1024)
        .properties(properties)
        .build();
client.createCollection(createCollectionReq);
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
    \"collectionName\": \"myCollection\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

「パーティションキーの分離」を有効にした後でも、「[パーティション番号を設定する](./use-partition-key#set-partition-numbers)」で説明されているように、パーティションキーとパーティション数を設定できます。パーティションキーベースのフィルタには、特定のパーティションキー値のみを含める必要があることに注意してください。

\</include>