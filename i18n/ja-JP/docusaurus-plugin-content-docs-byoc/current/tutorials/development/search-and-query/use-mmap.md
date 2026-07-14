---
title: "mmap を使用する | BYOC"
slug: /use-mmap
sidebar_label: "mmap を使用する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "メモリマッピング（Mmap）により、ディスク上の大きなファイルへ直接メモリアクセスできるようになり、Zilliz Cloud は index とデータをメモリとハードドライブの両方に保存できます。このアプローチは、アクセス頻度に基づくデータ配置ポリシーの最適化に役立ち、検索性能に影響を与えることなく collection のストレージ容量を拡張します。このページでは、Zilliz Cloud が mmap を使用して高速かつ効率的なデータ保存と取得をどのように実現しているかを理解できます。 | BYOC"
type: origin
token: P3wrwSMNNihy8Vkf9p6cTsWYnTb
sidebar_position: 20
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# mmap を使用する

メモリマッピング（Mmap）により、ディスク上の大きなファイルへ直接メモリアクセスできるようになり、Zilliz Cloud は index とデータをメモリとハードドライブの両方に保存できます。このアプローチは、アクセス頻度に基づくデータ配置ポリシーの最適化に役立ち、検索性能に影響を与えることなく collection のストレージ容量を拡張します。このページでは、Zilliz Cloud が mmap を使用して高速かつ効率的なデータ保存と取得をどのように実現しているかを理解できます。

<Admonition type="info" icon="📘" title="注意">

異なるプランを持つソース cluster とターゲット cluster の間でデータを移行または復元する場合、ソース collection の mmap 設定はターゲット cluster に移行されません。ターゲット cluster で mmap 設定を手動で再構成してください。

</Admonition>

Zilliz Cloud は、mmap 設定をプログラムから、または Web コンソール経由で構成することをサポートしています。このページでは、mmap をプログラムから設定する方法に焦点を当てています。Web コンソールでの操作の詳細については、[Manage Collections (Console)](./manage-collections-console#mmap) を参照してください。

## 概要\{#overview}

Zilliz Cloud は、vector 埋め込みとそのメタデータを整理するために collection を使用し、collection 内の各行が 1 つのエンティティを表します。以下の左図に示すように、vector field には vector 埋め込みが保存され、scalar field にはそのメタデータが保存されます。特定の field に index を作成して collection をロードすると、Zilliz Cloud は作成された index とすべての field の生データをメモリに読み込みます。

![EPNvwAI7hhCppbbKmuxcW5VRnUh](https://zdoc-images.s3.us-west-2.amazonaws.com/EPNvwAI7hhCppbbKmuxcW5VRnUh.png)

Zilliz Cloud の cluster はメモリ集約型のデータベースシステムであり、利用可能なメモリサイズが collection の容量を決定します。大量のデータを含む field をメモリに読み込むことは、データサイズがメモリ容量を超える場合には不可能であり、これは AI 駆動アプリケーションでは一般的なケースです。 

このような問題を解決するために、Zilliz Cloud は collection 内のホットデータとコールドデータの読み込みのバランスを取るために mmap を導入しています。上の右図に示すように、容量最適化 CUs を持つ Zilliz Cloud cluster を使用している場合、collection をロードすると、Zilliz Cloud は vector index のみをメモリに読み込み、すべての field の生データと scalar index をメモリマップします。

左図と右図のデータ配置手順を比較すると、左図のほうが右図よりもはるかにメモリ使用量が大きいことがわかります。mmap を有効にすると、本来メモリに読み込まれるはずだったデータはハードドライブにオフロードされ、オペレーティングシステムのページキャッシュにキャッシュされるため、メモリフットプリントが削減されます。ただし、キャッシュヒットに失敗するとパフォーマンス低下が発生する可能性があります。詳細については、[この記事](https://en.wikipedia.org/wiki/Mmap) を参照してください。

## グローバル mmap 戦略\{#global-mmap-strategy}

以下の表は、異なるティアの cluster におけるグローバル mmap 戦略を示しています。

|  | Performance-optimized | Capacity-optimized | Tiered-storage |
| --- | --- | --- | --- |
| Scalar field の生データ | Disabled & Changeable | Enabled & Changeable | Enabled & Unchangeable |
| Scalar field index | Disabled & Changeable | Enabled & Changeable | Enabled & Unchangeable |
| Vector field の生データ | Enabled & Changeable | Enabled & Changeable | Enabled & Unchangeable |
| Vector field index | Disabled & Unchangeable | Disabled & Unchangeable | Enabled & Unchangeable |

**Performance-optimized** CUs を使用する cluster では、Zilliz Cloud は vector field の生データに対してのみ mmap を有効にし、scalar field の生データとすべての field index をメモリに読み込みます。検索およびクエリ中のメタデータフィルタリングと取得のパフォーマンスを確保するため、グローバル設定を維持することを推奨します。ただし、メタデータフィルタリングに関与しない field や、出力 field として使用されない field については、引き続き mmap を有効にできます。

**Capacity-optimized** CUs を使用する cluster では、Zilliz Cloud は自動 index 作成のために vector field index に対する mmap を無効にし、scalar field の index とすべての field の生データをメモリマップして、最大のストレージ容量を確保します。メタデータフィルタリング条件で使用される field や出力 field に含まれる一部の field の生データが大きすぎて、それらをハードドライブ上に置くことで応答遅延やネットワークジッタが発生する場合は、検索パフォーマンスを向上させるために、これらの field について mmap を無効にすることを検討できます。 

**Extended-capacity CUs** を使用する cluster および dedicated cluster では、Zilliz Cloud はすべての field の生データと index に対して mmap を有効にし、システムキャッシュを最大限活用してホットデータのパフォーマンスを向上させ、コールドデータのコストを削減します。

## Collection 固有の mmap 設定\{#collection-specific-mmap-settings}

mmap 設定を変更するには collection を release する必要があり、変更を有効にするには再度ロードする必要があります。特定の field、field index、または collection に対して mmap を構成できます。

<Admonition type="info" icon="📘" title="注意">

mmap 設定を変更する際は十分注意してください。不適切な mmap 設定は、次の問題を引き起こす可能性があります。

- パフォーマンス最適化された dedicated cluster では、検索およびクエリ中に scalar field を高速に取得できるよう、すべての scalar field の生データと vector index がデフォルトでメモリに読み込まれます。デフォルトの mmap 設定を変更すると、パフォーマンス低下を引き起こす可能性があります。

- 容量最適化された dedicated cluster では、最大のストレージ容量を確保するため、デフォルトでは vector index のみがメモリに読み込まれます。デフォルトの mmap 設定を変更すると、メモリ不足（OOM）によりロードに失敗する可能性があります。

</Admonition>

### 特定の field に対して mmap を構成する\{#configure-mmap-for-specific-fields}

小規模な Performance-optimized CUs を持つ dedicated cluster を使用していて、データセット内のある field の生データが大きい場合は、mmap を有効にした collection にその field を追加することを検討してください。

以下の例では、Performance-optimized dedicated cluster に接続することを前提とし、**doc_chunk** という名前の VarChar field を追加する際に mmap を有効にする方法を示します。

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

上記の schema を使用して作成された collection をロードすると、Zilliz Cloud は **doc_chunk** field の生データをメモリマップします。field の mmap 設定を変更するには collection を release し、変更後に再度 collection をロードする必要がある点に注意してください。

### Scalar index に対して mmap を構成する\{#configure-mmap-for-scalar-indexes}

メタデータフィルタリングに関与する scalar field、または出力 field として使用される scalar field については、それらをメモリに読み込みつつ、ほかの scalar field はハードドライブ上に維持することを検討してください。 

以下の例では、Capacity-optimized dedicated cluster に接続することを前提とし、高速な取得のために **title** という名前の VarChar field の index で mmap を無効にする方法を示します。 

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

上記の index パラメータを使用して作成された collection をロードすると、Zilliz Cloud は **title** field の index をメモリに読み込みます。field の mmap 設定を変更するには collection を release し、変更後に再度 collection をロードする必要がある点に注意してください。

### Collection で mmap を構成する\{#configure-mmap-in-collection}

collection で mmap 設定を無効にすると、Zilliz Cloud はすべての field の生データを完全にメモリへ読み込みます。 

以下の例では、Performance-optimized dedicated cluster に接続することを前提とし、collection 作成時に mmap を無効にする方法を示します。

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

既存の collection の mmap 設定も次のように変更できます。 

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

そのプロパティを変更するには collection を release する必要があり、変更を有効にするには collection を再ロードする必要があります。
