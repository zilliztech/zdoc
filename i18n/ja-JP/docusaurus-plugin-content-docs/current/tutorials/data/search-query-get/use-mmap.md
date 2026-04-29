---
title: "mmap の使用 | Cloud"
slug: /use-mmap
sidebar_key: use-mmap
sidebar_label: "mmap の使用"
beta: FALSE
notebook: FALSE
description: "メモリマップ（Mmap）により、ディスク上の大規模ファイルへの直接メモリアクセスが可能になり、Zilliz Cloud はインデックスとデータをメモリとハードドライブの両方に保存できます。このアプローチは、アクセス頻度に基づいてデータ配置ポリシーを最適化し、検索パフォーマンスに影響を与えることなくコレクションのストレージ容量を拡張するのに役立ちます。このページでは、Zilliz Cloud が mmap を使用して高速かつ効率的なデータの保存と取得をどのように実現しているかについて説明します。 | Cloud"
type: origin
token: P3wrwSMNNihy8Vkf9p6cTsWYnTb
sidebar_position: 19
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - mmap
  - 検索の最適化

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# mmapの使用

メモリマッピング（mmap）により、ディスク上の大規模ファイルに直接メモリアクセスが可能になり、Zilliz Cloudはインデックスとデータをメモリおよびハードドライブの両方に格納できます。このアプローチにより、アクセス頻度に基づいたデータ配置ポリシーを最適化し、検索パフォーマンスに影響を与えることなくコレクションのストレージ容量を拡張できます。このページでは、Zilliz Cloudがmmapを使用して高速かつ効率的なデータの保存と取得を実現する方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>異なるプランを持つソースクラスターとターゲットクラスター間でデータを移行または復元する場合、ソースコレクションのmmap設定はターゲットクラスターに移行されません。ターゲットクラスター上で手動でmmap設定を再構成してください。</p>

</Admonition>

Zilliz Cloudでは、mmap設定をプログラムで構成することも、ウェブコンソール経由で構成することも可能です。このページでは、プログラムによるmmap設定の方法に焦点を当てます。ウェブコンソールでの操作の詳細については、[コレクションの管理（コンソール）](./manage-collections-console#mmap)を参照してください。

## 概要\{#overview}

Zilliz Cloudは、ベクトル埋め込みとそのメタデータを整理するためにコレクションを使用し、コレクション内の各行はエンティティを表します。以下の左図に示すように、ベクトルフィールドにはベクトル埋め込みが格納され、スカラーフィールドにはそのメタデータが格納されます。特定のフィールドにインデックスを作成し、コレクションをロードすると、Zilliz Cloudは作成されたインデックスとすべてのフィールドの生データをメモリに読み込みます。

![EPNvwAI7hhCppbbKmuxcW5VRnUh](https://zdoc-images.s3.us-west-2.amazonaws.com/EPNvwAI7hhCppbbKmuxcW5VRnUh.png)

Zilliz Cloudクラスターはメモリ集約型のデータベースシステムであり、利用可能なメモリサイズがコレクションの容量を決定します。AI駆動型アプリケーションでは一般的に、データ量がメモリ容量を超えるため、大量のデータを含むフィールドをメモリに読み込むことは不可能です。

このような問題を解決するために、Zilliz Cloudはコレクション内のホットデータとコールドデータのロードバランスを取るためのmmapを導入しています。上記右図に示すように、容量最適化済みCUを使用するZilliz Cloudクラスターでは、コレクションをロードする際にベクトルインデックスのみをメモリに読み込み、すべてのフィールドの生データとスカラーフィールドのインデックスをメモリマップします。

左図と右図のデータ配置手順を比較すると、左図の方がメモリ使用量がはるかに高いことがわかります。mmapを有効にすることで、本来メモリに読み込まれるべきデータがハードドライブにオフロードされ、オペレーティングシステムのページキャッシュにキャッシュされるため、メモリ使用量が削減されます。ただし、キャッシュヒット失敗が発生するとパフォーマンスが低下する可能性があります。詳細については、[この記事](https://en.wikipedia.org/wiki/Mmap)を参照してください。

## グローバルなmmap戦略\{#global-mmap-strategy}

次の表は、異なるティアのクラスターにおけるグローバルなmmap戦略を示しています。

<table>
   <tr>
     <th rowspan="2"><p>mmap対象</p></th>
     <th colspan="3"><p>専用クラスター</p></th>
     <th rowspan="2"><p>Freeクラスター</p><p>Serverlessクラスター</p></th>
   </tr>
   <tr>
     <td><p>パフォーマンス最適化済み</p></td>
     <td><p>容量最適化済み</p></td>
     <td><p>Tiered-storage</p></td>
   </tr>
   <tr>
     <td><p>スカラーフィールドの生データ</p></td>
     <td><p>無効 & 変更可</p></td>
     <td><p>有効 & 変更可</p></td>
     <td colspan="2"><p>有効 & 変更不可</p></td>
   </tr>
   <tr>
     <td><p>スカラーフィールドのインデックス</p></td>
     <td><p>無効 & 変更可</p></td>
     <td><p>有効 & 変更可</p></td>
     <td colspan="2"><p>有効 & 変更不可</p></td>
   </tr>
   <tr>
     <td><p>ベクトルフィールドの生データ</p></td>
     <td><p>有効 & 変更可</p></td>
     <td><p>有効 & 変更可</p></td>
     <td colspan="2"><p>有効 & 変更不可</p></td>
   </tr>
   <tr>
     <td><p>ベクトルフィールドのインデックス</p></td>
     <td><p>無効 & 変更不可</p></td>
     <td><p>無効 & 変更不可</p></td>
     <td colspan="2"><p>有効 & 変更不可</p></td>
   </tr>
</table>

**パフォーマンス最適化済み** CUを使用する専用クラスターでは、Zilliz Cloudはベクトルフィールドの生データに対してのみmmapを有効にし、スカラーフィールドの生データおよびすべてのフィールドのインデックスをメモリに読み込みます。検索およびクエリ時のメタデータフィルタリングと取得のパフォーマンスを確保するために、グローバル設定を維持することをお勧めします。ただし、メタデータフィルタリングに関与せず出力フィールドとしても使用されないフィールドについては、mmapを有効にすることも可能です。

**容量最適化済み** CUを使用する専用クラスターでは、自動インデックス作成のためにベクトルフィールドのインデックスに対するmmapは無効にされ、スカラーフィールドのインデックスおよびすべてのフィールドの生データはメモリマップされます。これにより最大限のストレージ容量が確保されます。ただし、メタデータフィルタリング条件や出力フィールドに使用される一部のフィールドの生データが非常に大きく、ハードドライブ上に置くことで応答が遅くなったりネットワークが不安定になったりする場合は、これらのフィールドのmmapを無効にして検索パフォーマンスを向上させることを検討してください。

**Free**クラスターや**Serverless**クラスター、および**拡張容量CU**を使用する専用クラスターでは、すべてのフィールドの生データとインデックスに対してmmapが有効になり、システムキャッシュを最大限に活用してホットデータのパフォーマンスを向上させ、コールドデータのコストを削減します。

## コレクション固有のmmap設定\{#collection-specific-mmap-settings}

mmap設定を変更するには、まずコレクションをリリースし、再度ロードする必要があります。特定のフィールド、フィールドインデックス、またはコレクションに対してmmapを構成できます。

<Admonition type="info" icon="📘" title="Notes">

<p>mmap設定を変更する際は注意が必要です。不適切なmmap設定により、以下の問題が発生する可能性があります：</p>
<ul>
<li><p>パフォーマンス最適化済みの専用クラスターでは、検索およびクエリ時のスカラーフィールドの高速取得を保証するために、すべてのスカラーフィールドの生データとベクトルインデックスがデフォルトでメモリに読み込まれます。デフォルトのmmap設定を変更すると、パフォーマンスが低下する可能性があります。</p></li>
<li><p>容量最適化済みの専用クラスターでは、最大ストレージ容量を確保するために、デフォルトでベクトルインデックスのみがメモリに読み込まれます。デフォルトのmmap設定を変更すると、メモリ不足（OOM）によりロードが失敗する可能性があります。</p></li>
</ul>

</Admonition>

### 特定のフィールドに対するmmapの構成\{#configure-mmap-for-specific-fields}

小規模なパフォーマンス最適化済みCUを使用する専用クラスターを利用しており、データセット内の特定フィールドの生データが非常に大きい場合は、mmapを有効にしてそのフィールドをコレクションに追加することを検討してください。

以下の例では、パフォーマンス最適化済みの専用クラスターに接続し、**doc_chunk**という名前のVarCharフィールドを追加する際にmmapを有効にする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
# The following assumes that you have a collection named \`my_collection\`
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

<TabItem value='java'>

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

<TabItem value='java'>

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

<TabItem value='java'>

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
--data "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema
}"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/fields/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "fieldName": "doc_chunk",
    "fieldParams":{
        "mmap.enabled": true
    }
}'

```

</TabItem>
</Tabs>

上記のスキーマを使用して作成されたコレクションをロードする際、Zilliz Cloud は **doc_chunk** フィールドの生データをメモリマップします。フィールドの mmap 設定を変更するには、まずコレクションをリリースし、変更後に再度コレクションをロードする必要があることに注意してください。

### スカラーフィールドのインデックスに対する mmap の設定\{#configure-mmap-for-scalar-indexes}

メタデータフィルタリングに使用される、または出力フィールドとして使用されるスカラーフィールドについては、それらをメモリにロードし、他のスカラーフィールドはハードディスク上に保持することを検討してください。

以下の例では、容量最適化型の専用クラスターに接続していることを前提として、クイックな取得のために **title** という名前の VarChar フィールドのインデックスに対する mmap を無効にする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
# The following assumes that you have a collection named \`my_collection\`
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

<TabItem value='java'>

```javascript
// Create index on the varchar field with mmap settings
await client.createIndex({
    collection_name: "my_collection",
    field_name: "title",
    params: { "mmap.enabled": false }
});

// Change mmap settings for an index
// The following assumes that you have a collection named \`my_collection\`
await client.alterIndexProperties({
    collection_name: "my_collection",
    index_name: "title",
    properties:{"mmap.enabled": true}
});
```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```bash
# restful
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
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
-d '{
    "collectionName": "my_collection",
    "indexName": "title",
    "properties": {
        "mmap.enabled": true
    }
}'
```

</TabItem>
</Tabs>

上記のインデックスパラメータを使用して作成されたコレクションをロードする際、Zilliz Cloud は **title** フィールドのインデックスをメモリに読み込みます。フィールドの mmap 設定を変更するには、まずコレクションをリリースし、変更後に再度コレクションをロードする必要があることに注意してください。

### コレクションでの mmap の設定\{#configure-mmap-in-collection}

コレクションで mmap 設定を無効にすることで、Zilliz Cloud がすべてのフィールドの生データを完全にメモリに読み込むようにできます。

以下の例では、パフォーマンス最適化型の専用クラスターに接続していることを前提として、コレクション作成時に mmap を無効にする方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
await client.createCollection({
    collection_name: "my_collection",
    scheme: schema,
    properties: { "mmap.enabled": false }
});
```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"params\": {
        \"mmap.enabled\": \"false\"
    }
}"
```

</TabItem>
</Tabs>

既存のコレクションのmmap設定を次のように変更することもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

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

<TabItem value='java'>

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

<TabItem value='java'>

```bash
# restful
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/release" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection"
}'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
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
-d '{
    "collectionName": "my_collection"
}'
```

</TabItem>  
</Tabs>

コレクションのプロパティを変更するには、一度コレクションをリリースし、変更を有効にするために再度コレクションをリロードする必要があります。