---
title: "mmapの使用 | Cloud"
slug: /use-mmap
sidebar_label: "mmapの使用"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "メモリマッピング（mmap）により、ディスク上の大きなファイルに直接メモリアクセスできるようになり、Zilliz Cloudがインデックスとデータをメモリとハードディスクの両方に保存できるようになります。このアプローチにより、アクセス頻度に基づいたデータ配置ポリシーの最適化が可能となり、検索パフォーマンスに影響を与えることなくコレクションのストレージ容量を拡張できます。このページでは、Zilliz Cloudがmmapを使用して高速で効率的なデータ保存と検索を実現する方法について説明します。| Cloud"
type: origin
token: P3wrwSMNNihy8Vkf9p6cTsWYnTb
sidebar_position: 15
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - mmap
  - 検索最適化
  - 自然言語検索
  - 類似検索
  - マルチモーダルRAG
  - llmの幻覚

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# mmapの使用

メモリマッピング（mmap）により、ディスク上の大きなファイルに直接メモリアクセスできるようになり、Zilliz Cloudがインデックスとデータをメモリとハードディスクの両方に保存できるようになります。このアプローチにより、アクセス頻度に基づいたデータ配置ポリシーの最適化が可能となり、検索パフォーマンスに影響を与えることなくコレクションのストレージ容量を拡張できます。このページでは、Zilliz Cloudがmmapを使用して高速で効率的なデータ保存と検索を実現する方法について説明します。

<Admonition type="info" icon="📘" title="注意">

<p>異なるプランを持つソースクラスターとターゲットクラスター間でデータを移行または復元する場合、ソースコレクションのmmap設定はターゲットクラスターに移行されません。ターゲットクラスターでmmap設定を手動で再構成してください。</p>

</Admonition>

Zilliz Cloudは、mmap設定をプログラム的に構成するか、Webコンソール経由で構成することをサポートしています。このページでは、mmapをプログラム的に設定する方法に重点を置いています。Webコンソールでの操作の詳細については、[コレクション管理（コンソール）](./manage-collections-console#mmap)を参照してください。

## 概要\{#overview}

Zilliz Cloudはコレクションを使用してベクトル埋め込みとそのメタデータを整理し、コレクション内の各行がエンティティを表します。以下の左図に示すように、ベクトルフィールドはベクトル埋め込みを保存し、スカラーフィールドはそれらのメタデータを保存します。特定のフィールドにインデックスを作成し、コレクションをロードすると、Zilliz Cloudは作成したインデックスとすべてのフィールドから生データをメモリにロードします。

![EPNvwAI7hhCppbbKmuxcW5VRnUh](/img/EPNvwAI7hhCppbbKmuxcW5VRnUh.png)

Zilliz Cloudクラスターはメモリ集約型のデータベースシステムであり、利用可能なメモリサイズがコレクションの容量を決定します。大量のデータを含むフィールドをメモリにロードすることは、データサイズがメモリ容量を超える場合不可能です。これはAI駆動アプリケーションでは通常のケースです。

このような問題を解決するために、Zilliz Cloudはmmapを導入してコレクション内のホットデータとコールドデータのロードをバランスさせます。上記の右図に示すように、容量最適化CUを備えたZilliz Cloudクラスターを使用している場合、コレクションをロードする際、Zilliz Cloudはベクトルインデックスのみをメモリにロードし、すべてのフィールドの生データとスカラーインデックスをメモリマッピングします。

左図と右図のデータ配置手順を比較することで、左図の方が右図よりもメモリ使用量がはるかに多いことがわかります。mmapが有効になっている場合、メモリにロードされるべきデータはハードディスクにオフロードされ、オペレーティングシステムのページキャッシュにキャッシュされるため、メモリの使用量が削減されます。ただし、キャッシュヒットの失敗はパフォーマンスの低下を引き起こす可能性があります。詳細については、[この記事](https://ja.wikipedia.org/wiki/Mmap)を参照してください。

## グローバルmmap戦略\{#global-mmap-strategy}

以下の表は、異なるティアのクラスターに対するグローバルmmap戦略を示しています。

<table>
   <tr>
     <th rowspan="2"><p>mmapターゲット</p></th>
     <th colspan="3"><p>専用クラスター</p></th>
     <th rowspan="2"><p>無料クラスター</p><p>サーバーレスクラスター</p></th>
   </tr>
   <tr>
     <td><p>パフォーマンス最適化型</p></td>
     <td><p>容量最適化型</p></td>
     <td><p>拡張容量型</p></td>
   </tr>
   <tr>
     <td><p>スカラー領域の生データ</p></td>
     <td><p>無効 &amp; 変更可能</p></td>
     <td><p>有効 &amp; 変更可能</p></td>
     <td colspan="2"><p>有効 &amp; 不変</p></td>
   </tr>
   <tr>
     <td><p>スカラー領域インデックス</p></td>
     <td><p>無効 &amp; 変更可能</p></td>
     <td><p>有効 &amp; 変更可能</p></td>
     <td colspan="2"><p>有効 &amp; 不変</p></td>
   </tr>
   <tr>
     <td><p>ベクトル領域の生データ</p></td>
     <td><p>有効 &amp; 変更可能</p></td>
     <td><p>有効 &amp; 変更可能</p></td>
     <td colspan="2"><p>有効 &amp; 不変</p></td>
   </tr>
   <tr>
     <td><p>ベクトル領域インデックス</p></td>
     <td><p>無効 &amp; 不変</p></td>
     <td><p>無効 &amp; 不変</p></td>
     <td colspan="2"><p>有効 &amp; 不変</p></td>
   </tr>
</table>

**パフォーマンス最適化型**CUを使用する専用クラスターでは、Zilliz Cloudはベクトルフィールドの生データに対してのみmmapを有効にし、スカラーフィールドの生データとすべてのフィールドインデックスをメモリにロードします。検索およびクエリ時のメタデータフィルタリングと取得のパフォーマンスを確保するためにグローバル設定を維持することをお勧めします。ただし、メタデータフィルタリングに使用されない、または出力フィールドとして使用されていないフィールドに対しては、引き続きmmapを有効にすることができます。

**容量最適化型**CUを使用する専用クラスターでは、自動インデックス作成のため、ベクトルフィールドインデックスに対してmmapを無効にし、スカラーインデックスとすべてのフィールドの生データをメモリマップして最大ストレージ容量を確保します。メタデータフィルタリング条件で使用される、または出力フィールドにリストされているフィールドの生データが大きすぎてハードドライブ上に置かれたままでは応答が遅くなったりネットワークが不安定になったりする場合は、これらのフィールドのmmapを無効にして検索パフォーマンスを向上させることを検討できます。

**無料**クラスターや**サーバーレス**クラスター、および**拡張容量CU**を使用する専用クラスターでは、Zilliz Cloudはすべてのフィールドの生データとインデックスに対してmmapを有効にしてシステムキャッシュを完全に活用し、ホットデータのパフォーマンスを向上させ、コールドデータのコストを削減します。

## コレクション固有のmmap設定\{#collection-specific-mmap-settings}

mmap設定を変更するにはコレクションをリリースし、変更が有効になるようにコレクションを再度ロードする必要があります。特定のフィールド、フィールドインデックス、またはコレクションに対してmmapを構成できます。

<Admonition type="info" icon="📘" title="注意">

<p>mmap設定を変更する際は注意が必要です。不適切なmmap設定は以下の問題を引き起こす可能性があります：</p>
<ul>
<li><p>パフォーマンス最適化型専用クラスターでは、すべてのスカラーフィールドの生データとベクトルインデックスが検索およびクエリ時のスカラーフィールドの高速取得を確実にするためにデフォルトでメモリにロードされます。デフォルトのmmap設定を変更するとパフォーマンスが低下する可能性があります。</p></li>
<li><p>容量最適化型専用クラスターでは、最大ストレージ容量を確保するためにデフォルトでベクトルインデックスのみがメモリにロードされます。デフォルトのmmap設定を変更すると、メモリ不足（OOM）の問題によりロードが失敗する可能性があります。</p></li>
</ul>

</Admonition>

### 特定のフィールドのmmap構成\{#configure-mmap-for-specific-fields}

パフォーマンス最適化型の小さなCUを備えた専用クラスターを使用していて、データセット内のフィールドの生データが大きい場合は、mmapを有効にしてそのフィールドをコレクションに追加することを検討してください。

以下の例では、パフォーマンス最適化型の専用クラスターに接続していることを前提として、フィールドを追加する際、**doc_chunk**という名前のVarCharフィールドでmmapを有効にする方法を示しています。

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

# コレクションのスキーマ作成時にフィールドでmmapを無効化
schema.add_field(
    field_name="doc_chunk",
    datatype=DataType.INT64,
    max_length=512,
    # highlight-next-line
    mmap_enabled=False,
)

client.create_collection(collection_name="my_collection", schema=schema)

# 既存のフィールドでmmapを無効化
# 以下では`my_collection`という名前のコレクションがあると仮定
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
    // エラー処理
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
    // エラー処理
}

err = client.AlterCollectionFieldProperty(ctx, milvusclient.NewAlterCollectionFieldPropertiesOption("my_collection", "doc_chunk").
    WithProperty(common.MmapEnabledKey, "true"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
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
    "elementTypeParams": {
        "max_length": 512
    },
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
    "dataType": "Int64",
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

上記のスキーマを使用して作成されたコレクションをロードする際、Zilliz Cloudは**doc_chunk**フィールドの生データをメモリマップします。フィールドのmmap設定を変更するにはコレクションをリリースし、変更後にコレクションを再度ロードする必要があることに注意してください。

### スカラーインデックスのmmap構成\{#configure-mmap-for-scalar-indexes}

メタデータフィルタリングに関与するスカラーフィールドまたは出力フィールドとして使用されるスカラーフィールドについては、他のスカラーフィールドをハードドライブ上に保持しながらメモリにロードすることを検討してください。

以下の例では、容量最適化型の専用クラスターに接続していることを前提として、高速で取得するために**title**という名前のVarCharフィールドのインデックスでmmapを無効にする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# varcharフィールドを追加
schema.add_field(
    field_name="title",
    datatype=DataType.VARCHAR,
    max_length=512
)

index_params = MilvusClient.prepare_index_params()

# mmap設定を使用してvarcharフィールドにインデックスを作成
index_params.add_index(
    field_name="title",
    index_type="AUTOINDEX",
    # highlight-next-line
    params={ "mmap.enabled": "false" }
)

# インデックスのmmap設定を変更
# 以下では`my_collection`という名前のコレクションがあると仮定
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
// mmap設定を使用してvarcharフィールドにインデックスを作成
await client.createIndex({
    collection_name: "my_collection",
    field_name: "title",
    params: { "mmap.enabled": false }
});

// インデックスのmmap設定を変更
// 以下では`my_collection`という名前のコレクションがあると仮定
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
    // エラー処理
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

上記のインデックスパラメータを使用して作成されたコレクションをロードする際、Zilliz Cloudは**title**フィールドのインデックスをメモリにロードします。フィールドのmmap設定を変更するにはコレクションをリリースし、変更後にコレクションを再度ロードする必要があることに注意してください。

### コレクション内のmmap構成\{#configure-mmap-in-collection}

コレクション内でmmap設定を無効にすることで、Zilliz Cloudがすべてのフィールドの生データを完全にメモリにロードするようにできます。

以下の例では、パフォーマンス最適化型の専用クラスターに接続していることを前提として、コレクションを作成する際にmmapを無効にする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# コレクション作成時にmmapを有効化
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
    // エラー処理
}
```

</TabItem>

<TabItem value='bash'>

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

既存のコレクションのmmap設定も以下のように変更できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# mmap設定を変更する前にコレクションをリリース
client.release_collection("my_collection")

# コレクションが既にリリースされていることを確認
# そして以下を実行
client.alter_collection_properties(
    collection_name="my_collection",
    properties={
        "mmap.enabled": false
    }
)

# 変更が有効になるようにコレクションをロード
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
// mmap設定を変更する前にコレクションをリリース
await client.releaseCollection({
    collection_name: "my_collection"
});

# コレクションが既にリリースされていることを確認
# そして以下を実行
await client.alterCollectionProperties({
    collection_name: "my_collection",
    properties: {
        "mmap.enabled": false
    }
});

# 変更が有効になるようにコレクションをロード
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
    // エラー処理
}

err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").
    WithProperty(common.MmapEnabledKey, "false"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}

_, err := client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
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

変更を反映するにはコレクションをリリースし、変更が有効になるようにコレクションを再度ロードする必要があります。