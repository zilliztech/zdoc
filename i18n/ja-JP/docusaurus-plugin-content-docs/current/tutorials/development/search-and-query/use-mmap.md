---
title: "mmap を使用する | Cloud"
slug: /use-mmap
sidebar_label: "mmap を使用する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "メモリマッピング（Mmap）は、ディスク上の大きなファイルへの直接的なメモリアクセスを可能にし、Zilliz Cloud がインデックスとデータをメモリとハードドライブの両方に保存できるようにします。このアプローチは、アクセス頻度に基づいてデータ配置ポリシーを最適化し、検索パフォーマンスに影響を与えることなくコレクションのストレージ容量を拡張するのに役立ちます。このページは、Zilliz Cloud が mmap を使用して高速かつ効率的なデータの保存と取得を実現する仕組みを理解するのに役立ちます。 | Cloud"
type: origin
token: P3wrwSMNNihy8Vkf9p6cTsWYnTb
sidebar_position: 20
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# mmap を使用する

メモリマッピング（Mmap）は、ディスク上の大きなファイルへの直接的なメモリアクセスを可能にし、Zilliz Cloud がインデックスとデータをメモリとハードドライブの両方に保存できるようにします。このアプローチは、アクセス頻度に基づいてデータ配置ポリシーを最適化し、検索パフォーマンスに影響を与えることなくコレクションのストレージ容量を拡張するのに役立ちます。このページは、Zilliz Cloud が mmap を使用して高速かつ効率的なデータの保存と取得を実現する仕組みを理解するのに役立ちます。

<Admonition type="info" title="Notes">

異なるプランのソースクラスターとターゲットクラスター間でデータを移行または復元する場合、ソースコレクションの mmap 設定はターゲットクラスターに移行されません。ターゲットクラスターで mmap 設定を手動で再構成してください。

</Admonition>

Zilliz Cloud では、mmap 設定をプログラムまたは Web コンソールから構成できます。このページでは、mmap をプログラムで設定する方法に焦点を当てます。Web コンソールでの操作の詳細については、[Manage Collections (Console)](./manage-collections-console#mmap) を参照してください。

## 概要\{#overview}

Zilliz Cloud はコレクションを使用してベクトル埋め込みとそのメタデータを整理し、コレクション内の各行は 1 つのエンティティを表します。以下の左図に示すように、ベクトルフィールドにはベクトル埋め込みが格納され、スカラーフィールドにはそのメタデータが格納されます。特定のフィールドにインデックスを作成してコレクションをロードすると、Zilliz Cloud は作成されたインデックスとすべてのフィールドの生データをメモリにロードします。

![EPNvwAI7hhCppbbKmuxcW5VRnUh](https://zdoc-images.s3.us-west-2.amazonaws.com/EPNvwAI7hhCppbbKmuxcW5VRnUh.png)

Zilliz Cloud のクラスターはメモリ集約型のデータベースシステムであり、利用可能なメモリサイズがコレクションの容量を決定します。大量のデータを含むフィールドをメモリにロードすることは、データサイズがメモリ容量を超える場合には不可能であり、これは AI 駆動型アプリケーションでは一般的なケースです。

このような問題を解決するために、Zilliz Cloud はコレクション内のホットデータとコールドデータのロードのバランスを取るために mmap を導入しています。上の右図に示すように、容量最適化 CU を備えた Zilliz Cloud クラスターを使用している場合は、コレクションをロードするときに、Zilliz Cloud はベクトルインデックスのみをメモリにロードし、すべてのフィールドの生データとスカラーインデックスをメモリマップします。

左図と右図のデータ配置手順を比較すると、左図のメモリ使用量が右図よりもはるかに多いことがわかります。mmap を有効にすると、本来メモリにロードされるはずのデータがハードドライブにオフロードされ、オペレーティングシステムのページキャッシュにキャッシュされるため、メモリフットプリントが削減されます。ただし、キャッシュヒットに失敗すると、パフォーマンスが低下する可能性があります。詳細については、[こちらの記事](https://en.wikipedia.org/wiki/Mmap) を参照してください。

## グローバル mmap 戦略\{#global-mmap-strategy}

次の表は、異なるティアのクラスターにおけるグローバル mmap 戦略を示しています。

<table>
   <tr>
     <th rowspan="2"><p>Mmap 対象</p></th>
     <th colspan="3"><p>Dedicated クラスター</p></th>
     <th rowspan="2"><p>Free クラスター</p><p>Serverless クラスター</p></th>
   </tr>
   <tr>
     <td><p>Performance-optimized</p></td>
     <td><p>Capacity-optimized</p></td>
     <td><p>Tiered-storage</p></td>
   </tr>
   <tr>
     <td><p>スカラーフィールドの生データ</p></td>
     <td><p>無効・変更可能</p></td>
     <td><p>有効・変更可能</p></td>
     <td colspan="2"><p>有効・変更不可</p></td>
   </tr>
   <tr>
     <td><p>スカラーフィールドのインデックス</p></td>
     <td><p>無効・変更可能</p></td>
     <td><p>有効・変更可能</p></td>
     <td colspan="2"><p>有効・変更不可</p></td>
   </tr>
   <tr>
     <td><p>ベクトルフィールドの生データ</p></td>
     <td><p>有効・変更可能</p></td>
     <td><p>有効・変更可能</p></td>
     <td colspan="2"><p>有効・変更不可</p></td>
   </tr>
   <tr>
     <td><p>ベクトルフィールドのインデックス</p></td>
     <td><p>無効・変更不可</p></td>
     <td><p>無効・変更不可</p></td>
     <td colspan="2"><p>有効・変更不可</p></td>
   </tr>
</table>

Dedicated クラスターで **Performance-optimized** CU を使用する場合、Zilliz Cloud はベクトルフィールドの生データに対してのみ mmap を有効にし、スカラーフィールドの生データとすべてのフィールドインデックスをメモリにロードします。検索およびクエリ時のメタデータフィルタリングと取得のパフォーマンスを確保するために、グローバル設定を維持することをお勧めします。ただし、メタデータフィルタリングに関与していないフィールドや、出力フィールドとして使用されていないフィールドについては、mmap を有効にすることができます。

Dedicated クラスターで **Capacity-optimized** CU を使用する場合、Zilliz Cloud は自動インデックス作成のためにベクトルフィールドインデックスの mmap を無効にし、スカラーフィールドのインデックスとすべてのフィールドの生データをメモリマップして、ストレージ容量を最大化します。メタデータフィルタリング条件で使用されるフィールドや出力フィールドにリストされている一部のフィールドの生データが非常に大きく、それらをハードドライブ上に残すことで応答の遅延やネットワークのジッターが発生する場合は、これらのフィールドの mmap を無効にして検索パフォーマンスを向上させることを検討できます。

**Free** クラスターと **Serverless** クラスター、および **Extended-capacity CUs** を使用する Dedicated クラスターでは、Zilliz Cloud はすべてのフィールドの生データとインデックスに対して mmap を有効にし、システムキャッシュを最大限に活用してホットデータのパフォーマンスを向上させ、コールドデータのコストを削減します。

## コレクション固有の mmap 設定\{#collection-specific-mmap-settings}

mmap 設定を変更するにはコレクションを解放し、mmap 設定の変更を有効にするにはコレクションを再度ロードする必要があります。mmap は、特定のフィールド、フィールドインデックス、またはコレクションに対して構成できます。

<Admonition type="info" title="Notes">

mmap 設定を変更する際は注意が必要です。不適切な mmap 設定は、以下の問題を引き起こす可能性があります。

- Performance-optimized の Dedicated クラスターでは、検索およびクエリ時にスカラーフィールドを高速に取得できるように、すべてのスカラーフィールドの生データとベクトルインデックスがデフォルトでメモリにロードされます。デフォルトの mmap 設定を変更すると、パフォーマンスが低下する可能性があります。

- Capacity-optimized の Dedicated クラスターでは、ストレージ容量を最大化するために、デフォルトではベクトルインデックスのみがメモリにロードされます。デフォルトの mmap 設定を変更すると、メモリ不足（OOM）によるロード失敗が発生する可能性があります。

</Admonition>

### 特定のフィールドに mmap を構成する\{#configure-mmap-for-specific-fields}

小規模な Performance-optimized CU の Dedicated クラスターを使用していて、データセット内のフィールドの生データが大きい場合は、mmap を有効にしてそのフィールドをコレクションに追加することを検討してください。

次の例では、Performance-optimized の Dedicated クラスターに接続することを前提とし、**doc_chunk** という名前の VarChar フィールドを追加するときに、そのフィールドで mmap を有効にする方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
TOKEN="YOUR_CLUSTER_TOKEN"

client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN
)

schema = MilvusClient.create_schema()
schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("vector", DataType.FLOAT_VECTOR, dim=5)

# Disable mmap on a field upon creating the schema for a collection
schema.add_field(
    field_name="doc_chunk",
    datatype=DataType.INT64,
    max_length=512,
    # highlight-next-line
    mmap_enabled=False,
)

client.create_collection(collection_name="my_collection", schema=schema)

# Disable mmap on an existing field
# The following assumes that you have a collection named `my_collection`
client.alter_collection_field(
    collection_name="my_collection",
    field_name="doc_chunk",
    field_params={"mmap.enabled": True}
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.Constant;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.*;

import java.util.*;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";
client = new MilvusClientV2(ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build());
        
CreateCollectionReq.CollectionSchema schema = client.createSchema();

schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(false)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("vector")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());

Map<String, String> typeParams = new HashMap<String, String>() {{
    put(Constant.MMAP_ENABLED, "false");
}};
schema.addField(AddFieldReq.builder()
        .fieldName("doc_chunk")
        .dataType(DataType.VarChar)
        .maxLength(512)
        .typeParams(typeParams)
        .build());

CreateCollectionReq req = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .build();
client.createCollection(req);

client.alterCollectionField(AlterCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("doc_chunk")
        .property(Constant.MMAP_ENABLED, "true")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

const CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT";
const TOKEN="YOUR_TOKEN";

const client = await MilvusClient({
    address: CLUSTER_ENDPOINT,
    token: TOKEN
});

const schema = [
{
    name: 'vector',
    data_type: DataType.FloatVector
},
{
    name: "doc_chunk",
    data_type: DataType.VarChar,
    max_length: 512,
    'mmap.enabled': false,
}
];

await client.createCollection({
    collection_name: "my_collection",
    schema: schema
});

await client.alterCollectionFieldProperties({
    collection_name: "my_collection",
    field_name: "doc_chunk",
    properties: {"mmap_enable": true}
});
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
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
    WithName("vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(5),
).WithField(entity.NewField().
    WithName("doc_chunk").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(512).
    WithTypeParams(common.MmapEnabledKey, "false"),
)

err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = client.AlterCollectionFieldProperty(ctx, milvusclient.NewAlterCollectionFieldPropertiesOption("my_collection", "doc_chunk").
    WithProperty(common.MmapEnabledKey, "true"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
#restful
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export idField='{
    "fieldName": "id",
    "dataType": "Int64",
    "isPrimary": true,
    "auto_id": false
}'

export vectorField='{
    "fieldName": "vector",
    "dataType": "FloatVector",
    "elementTypeParams": {
       "dim": 5
    }
}'

export docChunkField='{
    "fieldName": "doc_chunk",
    "dataType": "Varchar",
    "elementTypeParams": {
        "max_length": 512,
        "mmap.enabled": false
    }
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $idField,
        $docChunkField,
        $vectorField
    ]
}"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
--data "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema
}"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/fields/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "fieldName": "doc_chunk",
    "fieldParams":{
        "mmap.enabled": true
    }
}'
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

const std::string CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
const std::string TOKEN = "YOUR_CLUSTER_TOKEN";

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{CLUSTER_ENDPOINT, TOKEN};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"id", milvus::DataType::INT64, "", true, false});
schema->AddField(milvus::FieldSchema("vector", milvus::DataType::FLOAT_VECTOR).WithDimension(5));
schema->AddField(milvus::FieldSchema("doc_chunk", milvus::DataType::VARCHAR).WithMaxLength(512).AddProperty("mmap.enabled", "true"));
```

</TabItem>
</Tabs>

上記のスキーマを使用して作成したコレクションをロードすると、Zilliz Cloud は **doc_chunk** フィールドの生データをメモリマップします。フィールドの mmap 設定を変更するにはコレクションを解放し、変更後にコレクションを再度ロードする必要があることに注意してください。

### スカラーインデックスに mmap を構成する\{#configure-mmap-for-scalar-indexes}

メタデータフィルタリングに関与するスカラーフィールドや、出力フィールドとして使用されるスカラーフィールドについては、他のスカラーフィールドをハードドライブ上に保持しつつ、それらをメモリにロードすることを検討してください。

次の例では、Capacity-optimized の Dedicated クラスターに接続することを前提とし、高速に取得するために **title** という名前の VarChar フィールドのインデックスで mmap を無効にする方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Add a varchar field
schema.add_field(
    field_name="title",
    datatype=DataType.VARCHAR,
    max_length=512   
)

index_params = MilvusClient.prepare_index_params()

# Create index on the varchar field with mmap settings
index_params.add_index(
    field_name="title",
    index_type="AUTOINDEX",
    # highlight-next-line
    params={ "mmap.enabled": "false" }
)

# Change mmap settings for an index
# The following assumes that you have a collection named `my_collection`
client.alter_index_properties(
    collection_name="my_collection",
    index_name="title",
    properties={"mmap.enabled": True}
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("title")
        .dataType(DataType.VarChar)
        .maxLength(512)
        .build());
        
List<IndexParam> indexParams = new ArrayList<>();
Map<String, Object> extraParams = new HashMap<String, Object>() {{
    put(Constant.MMAP_ENABLED, false);
}};
indexParams.add(IndexParam.builder()
        .fieldName("title")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams)
        .build());
        
client.alterIndexProperties(AlterIndexPropertiesReq.builder()
        .collectionName("my_collection")
        .indexName("title")
        .property(Constant.MMAP_ENABLED, "true")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Create index on the varchar field with mmap settings
await client.createIndex({
    collection_name: "my_collection",
    field_name: "title",
    params: { "mmap.enabled": false }
});

// Change mmap settings for an index
// The following assumes that you have a collection named `my_collection`
await client.alterIndexProperties({
    collection_name: "my_collection",
    index_name: "title",
    properties:{"mmap.enabled": true}
});
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().
    WithName("title").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(512),
)

indexOption := milvusclient.NewCreateIndexOption("my_collection", "title",
    index.NewInvertedIndex())
indexOption.WithExtraParam(common.MmapEnabledKey, "false")

err = client.AlterIndexProperties(ctx, milvusclient.NewAlterIndexPropertiesOption("my_collection", "title").
    WithProperty(common.MmapEnabledKey, "true"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "indexParams": [
        {
            "fieldName": "title",
            "params": {
                "index_type": "AUTOINDEX",
                "mmap.enabled": false
            }
        }
    ]
}'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "indexName": "title",
    "properties": {
        "mmap.enabled": true
    }
}'
```

</TabItem>

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("title", milvus::DataType::VARCHAR).WithMaxLength(512));

milvus::IndexDesc index("title", "", milvus::IndexType::AUTOINDEX);
index.AddExtraParam("mmap.enabled", "false");
auto status = client->CreateIndex(milvus::CreateIndexRequest()
                                    .WithCollectionName("my_collection")
                                    .AddIndex(std::move(index)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->AlterIndexProperties(milvus::AlterIndexPropertiesRequest()
                                    .WithCollectionName("my_collection")
                                    .WithIndexName("title")
                                    .AddProperty("mmap.enabled", "true"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

上記のインデックスパラメーターを使用して作成したコレクションをロードすると、Zilliz Cloud は **title** フィールドのインデックスをメモリにロードします。フィールドの mmap 設定を変更するにはコレクションを解放し、変更後にコレクションを再度ロードする必要があることに注意してください。

### コレクションで mmap を構成する\{#configure-mmap-in-collection}

コレクションで mmap 設定を無効にすると、Zilliz Cloud はすべてのフィールドの生データを完全にメモリにロードします。

次の例では、Performance-optimized の Dedicated クラスターに接続することを前提とし、コレクションを作成するときに mmap を無効にする方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Enable mmap when creating a collection
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    properties={ "mmap.enabled": "false" }
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq req = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .property(Constant.MMAP_ENABLED, "false")
        .build();
client.createCollection(req);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createCollection({
    collection_name: "my_collection",
    scheme: schema,
    properties: { "mmap.enabled": false }
});
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithProperty(common.MmapEnabledKey, "false"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
--data "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"params\": {
        \"mmap.enabled\": \"false\"
    }
}"
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                          .WithCollectionName("my_collection")
                                          .WithCollectionSchema(schema)
                                          .AddProperty("mmap.enabled", "false"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

既存のコレクションの mmap 設定は、次のように変更することもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Release collection before change mmap settings
client.release_collection("my_collection")

# Ensure that the collection has already been released 
# and run the following
client.alter_collection_properties(
    collection_name="my_collection",
    properties={
        "mmap.enabled": false
    }
)

# Load the collection to make the above change take effect
client.load_collection("my_collection")
```

</TabItem>

<TabItem value='java'>

```java
client.releaseCollection(ReleaseCollectionReq.builder()
        .collectionName("my_collection")
        .build());
        
client.alterCollectionProperties(AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .property(Constant.MMAP_ENABLED, "false")
        .build());

client.loadCollection(LoadCollectionReq.builder()
        .collectionName("my_collection")
        .build());
       
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Release collection before change mmap settings
await client.releaseCollection({
    collection_name: "my_collection"
});

// Ensure that the collection has already been released 
// and run the following
await client.alterCollectionProperties({
    collection_name: "my_collection",
    properties: {
        "mmap.enabled": false
    }
});

// Load the collection to make the above change take effect
await client.loadCollection({
    collection_name: "my_collection"
});
```

</TabItem>

<TabItem value='go'>

```go
err = client.ReleaseCollection(ctx, milvusclient.NewReleaseCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").
    WithProperty(common.MmapEnabledKey, "false"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

_, err := client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/release" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection"
}'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "properties": {
        "mmmap.enabled": false
    }
}'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection"
}'
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->ReleaseCollection(milvus::ReleaseCollectionRequest()
                                            .WithCollectionName("my_collection"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                            .WithCollectionName("my_collection")
                                            .AddProperty("mmmap.enabled", "false"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->LoadCollection(milvus::LoadCollectionRequest()
                                    .WithCollectionName("my_collection"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
                                         
```

</TabItem>
</Tabs>

プロパティを変更するにはコレクションを解放し、変更を有効にするにはコレクションを再度ロードする必要があります。
