---
title: "MinHash 関数 | Cloud"
slug: /minhash-function
sidebar_label: "MinHash 関数"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "MinHash 関数は、生のテキストを、ドキュメント間の Jaccard 類似度を近似するバイナリベクトルに変換します。テキストのシングリングと複数のハッシュ関数を適用して固定長のシグネチャベクトルを生成し、大規模なニアデュプリケート検出とドキュメントの重複排除を可能にします。 | Cloud"
type: origin
token: EAwdw2ZbtiBKttk66FTctUebn7f
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MinHash 関数

**MinHash 関数**は、生のテキストを、ドキュメント間の [Jaccard 類似度](https://en.wikipedia.org/wiki/Jaccard_index) を近似する**バイナリベクトル**に変換します。テキストのシングリングと複数のハッシュ関数を適用して固定長のシグネチャベクトルを生成し、大規模なニアデュプリケート検出とドキュメントの重複排除を高速に実現します。

組み込み関数として、MinHash は Zilliz Cloud 内で実行され、外部のモデル推論や前処理を必要としません。生のテキストを挿入すると、Zilliz Cloud が MinHash シグネチャベクトルを自動的に生成します。

## 制限事項\{#limits}

- 出力フィールドは、各 MinHash シグネチャが 32 ビットのハッシュ値であるため、`dim % 32 == 0` を満たす次元の `BINARY_VECTOR` である必要があります。

- バイナリベクトルフィールドの `dim` は `32 * num_hashes` と等しくなければなりません。一致しない場合はエラーになります。

- MinHash 関数の出力で `MINHASH_LSH` インデックスを使用する場合、`mh_element_bit_width` を `32` に設定する必要があります。

## MinHash の仕組み\{#how-minhash-works}

<details>

<summary>仕組みを確認するには展開してください</summary>

[MinHash](https://en.wikipedia.org/wiki/MinHash) は、集合間の [Jaccard 類似度](https://en.wikipedia.org/wiki/Jaccard_index) を推定する局所性鋭敏型ハッシュ（LSH）手法です。Zilliz Cloud では、MinHash 関数は次のパイプラインに従います。入力として生のテキストを指定すると、Zilliz Cloud が出力としてバイナリベクトルを生成し、中間のすべてのステップを内部で処理します。

ワークフロー全体は、ドキュメントの取り込みとクエリ処理の両方で使用される**共有テキスト処理パイプライン**と、それに続く保存と取得のフェーズ固有の操作で構成されます。

![IaqkbFEh8oQgGSx6NsocFoSOnDo](https://zdoc-images.s3.us-west-2.amazonaws.com/iaqkbfeh8oqggsx6nsocfosondo.png "IaqkbFEh8oQgGSx6NsocFoSOnDo")

### 共有テキスト処理パイプライン\{#shared-text-processing-pipeline}

ドキュメントの取り込みとクエリ処理はどちらも、同じ 4 段階の変換を通じて生のテキストを処理します。

1. **テキスト分析**: テキストは [アナライザー](./analyzer-overview) によって処理されるか（`token_level` が `"word"` の場合）、そのまま使用されます（`token_level` が `"char"` の場合）。単語レベルのトークン化では、入力フィールドに構成されたアナライザーを適用してテキストをタームに分割します。たとえば、`"milvus is vector db"` は `["milvus", "is", "vector", "db"]` になります。

1. **シングリング**: トークンは、`shingle_size` のサイズの重複する n-gram（シングル）に分割されます。たとえば、単語レベルで 3-gram の場合、トークン `["information", "retrieval", "is", "a", "field"]` は `["information retrieval is", "retrieval is a", "is a field"]` のようなシングルになります。

1. **MinHash シグネチャ生成**: 複数のハッシュ関数（H1、H2、...、Hn。ここで n = `num_hashes`）がシングルの集合に適用されます。各ハッシュ関数について、すべてのシングルにわたる最小のハッシュ値が選択されます。これらの最小値のコレクションが MinHash シグネチャを形成します。これは、元のドキュメントの Jaccard 類似度を近似する固定長の表現です。

1. **バイナリベクトルエンコーディング**: 各シグネチャ値は 32 ビットのハッシュであり、シグネチャ全体は次元 `32 * num_hashes` の `BINARY_VECTOR` にパックされます。

### ドキュメントの取り込み\{#document-ingestion}

挿入時には、共有パイプラインによって生成されたバイナリベクトルが `MINHASH_LSH` インデックスに保存されます。このインデックスは、類似したシグネチャを同じバケットにグループ化する LSH（Locality-Sensitive Hashing）テーブルを保持し、クエリ時に候補を高速に取得できるようにします。

### クエリ処理\{#query-processing}

検索時には、クエリテキストが同じ共有パイプラインを経てバイナリベクトルを生成します。このベクトルは、`MINHASH_LSH` インデックスでの LSH ルックアップに使用され、類似している可能性の高い候補ペアを迅速に特定します。Jaccard リファインメントを使用しない場合、Zilliz Cloud は、推定 Jaccard 類似度でランク付けされていない LSH 候補を返します。Jaccard リファインメントを有効にすると、Zilliz Cloud は保存された生の MinHash シグネチャを使用して、推定 Jaccard 類似度で候補をランク付けし、上位 K 件の結果を返します。

両方のパスが同じ変換ロジックを共有しているため、内容が大きく重複する 2 つのドキュメントは類似した MinHash シグネチャを生成します。このため、ドキュメントの語順、書式、わずかな表現が異なる場合でも、この関数はニアデュプリケートの検出に効果を発揮します。

</details>

## 事前準備\{#before-you-start}

MinHash 関数を使用する前に、コレクションスキーマに以下を含めるよう計画してください。

- **生のコンテンツ用のテキストフィールド**

    コレクションには、生のテキストを格納する `VARCHAR` フィールドを含める必要があります。このフィールドは、MinHash 関数への入力として機能します。

- **テキストフィールド用のアナライザー**（単語レベルのトークン化を使用する場合）

    `token_level` が `"word"`（デフォルト）に設定されている場合、テキストフィールドでアナライザーを有効にする必要があります。アナライザーは、シングリングの前にテキストをどのようにトークン化するかを定義します。デフォルトでは、Zilliz Cloud は `standard` アナライザーを使用します。別のアナライザーを構成するには、[ユースケースに適したアナライザーの選択](./choose-the-right-analyzer-for-your-use-case) を参照してください。

- **MinHash 出力用のバイナリベクトルフィールド**

    コレクションには、MinHash 関数によって生成されたバイナリベクトルを格納する `BINARY_VECTOR` フィールドを含める必要があります。次元は `32 * num_hashes` と等しくなければなりません。

## ステップ 1: MinHash 関数を使用してコレクションを作成する\{#step-1-create-a-collection-with-a-minhash-function}

MinHash 関数を使用するには、コレクションの作成時に定義します。この関数はコレクションスキーマの一部となり、データの挿入時と検索時に自動的に適用されます。

### スキーマフィールドを定義する\{#define-schema-fields}

コレクションスキーマには、少なくとも 3 つのフィールドを含める必要があります。

- **プライマリフィールド**: コレクション内の各エンティティを一意に識別します。

- **テキストフィールド**（`VARCHAR`）: 生のテキストドキュメントを格納します。Zilliz Cloud が MinHash シグネチャ生成のためにテキストを処理できるように、`enable_analyzer=True` を設定します。デフォルトでは、Zilliz Cloud はテキスト分析に `standard` アナライザーを使用します。別のアナライザーを構成するには、[ユースケースに適したアナライザーの選択](./choose-the-right-analyzer-for-your-use-case) を参照してください。

- **バイナリベクトルフィールド**（`BINARY_VECTOR`）: MinHash 関数によって自動的に生成されたバイナリベクトルを格納します。次元は `32 * num_hashes` と等しくなければなりません。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType, Function, FunctionType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

schema = client.create_schema()

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, auto_id=True)
schema.add_field(field_name="document_content", datatype=DataType.VARCHAR, max_length=9000, enable_analyzer=True)
schema.add_field(field_name="binary_vector", datatype=DataType.BINARY_VECTOR, dim=8192)
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

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder().build();
schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("document_content")
        .dataType(DataType.VarChar)
        .maxLength(9000)
        .enableAnalyzer(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("binary_vector")
        .dataType(DataType.BinaryVector)
        .dimension(8192)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal(err)
}

schema := entity.NewSchema().
    WithField(entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true).WithIsAutoID(true)).
    WithField(entity.NewField().WithName("document_content").WithDataType(entity.FieldTypeVarChar).WithMaxLength(9000).WithEnableAnalyzer(true)).
    WithField(entity.NewField().WithName("binary_vector").WithDataType(entity.FieldTypeBinaryVector).WithDim(8192))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");
let client = ClientV2::new(&config).await?;

let schema = CollectionSchema::new()
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(true))
    .add_field(FieldSchema::new().name("document_content").data_type(DataType::VarChar).max_length(9000).enable_analyzer(true))
    .add_field(FieldSchema::new().name("binary_vector").data_type(DataType::BinaryVector).dimension(8192));
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>

auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField(milvus::FieldSchema("id", milvus::DataType::INT64).WithPrimaryKey(true).WithAutoID(true));
schema->AddField(milvus::FieldSchema("document_content", milvus::DataType::VARCHAR).WithMaxLength(9000).EnableAnalyzer(true));
schema->AddField(milvus::FieldSchema("binary_vector", milvus::DataType::BINARY_VECTOR).WithDimension(8192));
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType, FunctionType, IndexType, MetricType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const fields = [
  { name: "id", data_type: DataType.Int64, is_primary_key: true, autoID: true },
  { name: "document_content", data_type: DataType.VarChar, max_length: 9000, enable_analyzer: true },
  { name: "binary_vector", data_type: DataType.BinaryVector, dim: 8192 },
];
```

</TabItem>

<TabItem value='bash'>

```bash
fields='[
  {"fieldName": "id", "dataType": "Int64", "isPrimary": true},
  {"fieldName": "document_content", "dataType": "VarChar", "elementTypeParams": {"max_length": 9000, "enable_analyzer": true}},
  {"fieldName": "binary_vector", "dataType": "BinaryVector", "elementTypeParams": {"dim": 8192}}
]' 
```

</TabItem>
</Tabs>

### MinHash 関数を定義する\{#define-the-minhash-function}

MinHash 関数は、分析済みのテキストを、ドキュメント間の Jaccard 類似度を近似するバイナリベクトルに変換します。

関数を定義してスキーマに追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
minhash_function = Function(
    name="minhash_function",
    input_field_names=["document_content"], # Name of the VARCHAR field containing raw text
    output_field_names=["binary_vector"], # Name of the BINARY_VECTOR field for generated signatures
    function_type=FunctionType.MINHASH,
    params={
        "num_hashes": 256, # Number of hash functions; produces dim = 32 * 256 = 8192
        "shingle_size": 3, # N-gram size for shingling
    }
)

schema.add_function(minhash_function)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import java.util.Collections;

schema.addFunction(CreateCollectionReq.Function.builder()
        .name("minhash_function")
        .functionType(FunctionType.MINHASH)
        .inputFieldNames(Collections.singletonList("document_content"))
        .outputFieldNames(Collections.singletonList("binary_vector"))
        .param("num_hashes", "256")
        .param("shingle_size", "3")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
function := entity.NewFunction().
    WithName("minhash_function").
    WithType(entity.FunctionTypeMinHash).
    WithInputFields("document_content").
    WithOutputFields("binary_vector").
    WithParam("num_hashes", "256").
    WithParam("shingle_size", "3")

schema = schema.WithFunction(function)
```

</TabItem>

<TabItem value='rust'>

```rust
let schema = schema.add_function(
    Function::new()
        .name("minhash_function")
        .function_type(FunctionType::MinHash)
        .input_fields(vec!["document_content"])
        .output_fields(vec!["binary_vector"])
        .param("num_hashes", "256")
        .param("shingle_size", "3"),
);
```

</TabItem>

<TabItem value='c++'>

```c++
auto function = std::make_shared<milvus::Function>("minhash_function", milvus::FunctionType::MINHASH);
function->AddInputFieldName("document_content");
function->AddOutputFieldName("binary_vector");
function->AddParam("num_hashes", "256");
function->AddParam("shingle_size", "3");
schema->AddFunction(function);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const functions = [
  {
    name: "minhash_function",
    type: FunctionType.MINHASH,
    input_field_names: ["document_content"],
    output_field_names: ["binary_vector"],
    params: { num_hashes: 256, shingle_size: 3 },
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
function='{
  "name": "minhash_function",
  "type": "MinHash",
  "inputFieldNames": ["document_content"],
  "outputFieldNames": ["binary_vector"],
  "params": {"num_hashes": 256, "shingle_size": 3}
}' 
```

</TabItem>
</Tabs>

**構成オプション**

MinHash 関数の `params` 辞書は、次のパラメーターを受け付けます。すべてのパラメーター名は**大文字と小文字を区別しません**。

<table>
   <tr>
     <th><p><strong>パラメーター</strong></p></th>
     <th><p><strong>型</strong></p></th>
     <th><p><strong>デフォルト</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p><code>num_hashes</code></p></td>
     <td><p>int</p></td>
     <td><p><code>dim / 32</code> から導出</p></td>
     <td><p>シグネチャ生成用のハッシュ関数の数です。出力バイナリベクトルの次元は <code>32 &ast; num_hashes</code> と等しくなります。値を大きくすると類似度推定の分散が減少しますが、計算量が増加します。推奨: <code>256</code>（dim = 8192）。</p></td>
   </tr>
   <tr>
     <td><p><code>shingle_size</code></p></td>
     <td><p>int</p></td>
     <td><p><code>3</code></p></td>
     <td><p>シングリングの N-gram サイズです。単語レベル: 通常 1〜3。文字レベル: 通常 2〜6。</p></td>
   </tr>
   <tr>
     <td><p><code>hash_function</code></p></td>
     <td><p>str</p></td>
     <td><p><code>&quot;xxhash&quot;</code></p></td>
     <td><p>使用するハッシュ関数です。オプション:</p><ul><li><p><code>&quot;xxhash&quot;</code>（高速）</p></li><li><p><code>&quot;sha1&quot;</code>（低速ですが衝突耐性が高くなります）。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>token_level</code></p></td>
     <td><p>str</p></td>
     <td><p><code>&quot;word&quot;</code></p></td>
     <td><p>トークン化のレベルです。オプション:</p><ul><li><p><code>&quot;word&quot;</code>: フィールドのアナライザーを使用してトークン化し、その後 n-gram シングリングを適用します。</p></li><li><p><code>&quot;char&quot;</code> / <code>&quot;character&quot;</code>: 生の文字に直接 n-gram シングリングを適用します（アナライザーは使用しません）。</p></li></ul><p>単語レベルはより強力なセマンティクスと高い効率を提供しますが、言語固有のトークン化に依存します。文字レベルは言語に依存しませんが、より高次元のシングルを生成し、セマンティクスは弱くなります。</p></td>
   </tr>
   <tr>
     <td><p><code>seed</code></p></td>
     <td><p>int</p></td>
     <td><p><code>1234</code></p></td>
     <td><p>MinHash 関数の初期化用のランダムシードです。</p></td>
   </tr>
</table>

### インデックスを構成する\{#configure-the-index}

MinHash バイナリベクトルに推奨されるインデックスタイプは `MINHASH_LSH` で、メトリクスタイプは `MHJACCARD` です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="binary_vector",
    index_type="MINHASH_LSH",
    metric_type="MHJACCARD",
    params={
        "mh_lsh_band": 128,
        "mh_element_bit_width": 32,
        "with_raw_data": True,
    },
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.HashMap;

IndexParam indexParam = IndexParam.builder()
        .fieldName("binary_vector")
        .indexType(IndexParam.IndexType.MINHASH_LSH)
        .metricType(IndexParam.MetricType.MHJACCARD)
        .extraParams(new HashMap<String, Object>() {{
            put("mh_lsh_band", 128);
            put("mh_element_bit_width", 32);
            put("with_raw_data", true);
        }})
        .build();
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"

    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

indexOption := milvusclient.NewCreateIndexOption("dedup_collection", "binary_vector", index.NewMinHashLSHIndex(entity.MHJACCARD, 128).
    WithElementBitWidth(32).
    WithRawData(true)).
    WithIndexName("minhash_index")
```

</TabItem>

<TabItem value='rust'>

```rust
use std::collections::HashMap;

let index_param = IndexParam::new()
    .field_name("binary_vector")
    .index_name("minhash_index")
    .index_type(IndexType::MinhashLsh)
    .metric_type(MetricType::MhJaccard)
    .extra_params(HashMap::from([
        ("mh_lsh_band".to_string(), "128".to_string()),
        ("mh_element_bit_width".to_string(), "32".to_string()),
        ("with_raw_data".to_string(), "true".to_string()),
    ]));
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc index("binary_vector", "minhash_index", milvus::IndexType::MINHASH_LSH, milvus::MetricType::MHJACCARD);
index.AddExtraParam("mh_lsh_band", "128");
index.AddExtraParam("mh_element_bit_width", "32");
index.AddExtraParam("with_raw_data", "true");
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParam = {
  field_name: "binary_vector",
  index_type: IndexType.MINHASH_LSH,
  metric_type: MetricType.MHJACCARD,
  params: { mh_lsh_band: 128, mh_element_bit_width: 32, with_raw_data: true },
};
```

</TabItem>

<TabItem value='bash'>

```bash
indexParams='[
  {"fieldName": "binary_vector", "indexType": "MINHASH_LSH", "metricType": "MHJACCARD", "params": {"mh_lsh_band": 128, "mh_element_bit_width": 32, "with_raw_data": true}}
]' 
```

</TabItem>
</Tabs>

検索で Jaccard リファインメントを使用する場合は、`with_raw_data` を `True` に設定します。LSH ルックアップによって返された候補について推定 Jaccard 類似度を計算するには、生の MinHash シグネチャが必要です。

### コレクションを作成する\{#create-the-collection}

上で定義したスキーマとインデックスパラメーターを使用してコレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="dedup_collection",
    schema=schema,
    index_params=index_params,
)
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;

client.createCollection(CreateCollectionReq.builder()
        .collectionName("dedup_collection")
        .collectionSchema(schema)
        .indexParams(Collections.singletonList(indexParam))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("dedup_collection", schema).
    WithIndexOptions(indexOption))
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
client.create_collection(CreateCollectionRequest::builder()
    .collection_name("dedup_collection")
    .schema(schema)
    .index_params(vec![index_param])
    .build()?)
.await?;
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->CreateCollection(milvus::CreateCollectionRequest()
                                 .WithCollectionName("dedup_collection")
                                 .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createCollection({
  collection_name: "dedup_collection",
  fields: fields,
  functions: functions,
});

await client.createIndex({
  collection_name: "dedup_collection",
  ...indexParam,
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "dedup_collection",
    "schema": {
        "fields": [
            {"fieldName": "id", "dataType": "Int64", "isPrimary": true},
            {"fieldName": "document_content", "dataType": "VarChar", "elementTypeParams": {"max_length": 9000, "enable_analyzer": true}},
            {"fieldName": "binary_vector", "dataType": "BinaryVector", "elementTypeParams": {"dim": 8192}}
        ],
        "functions": [
            {"name": "minhash_function", "type": "MinHash", "inputFieldNames": ["document_content"], "outputFieldNames": ["binary_vector"], "params": {"num_hashes": 256, "shingle_size": 3}}
        ],
        "autoID": true
    },
    "indexParams": [
        {"fieldName": "binary_vector", "indexType": "MINHASH_LSH", "metricType": "MHJACCARD", "params": {"mh_lsh_band": 128, "mh_element_bit_width": 32, "with_raw_data": true}}
    ]
}' 
```

</TabItem>
</Tabs>

## ステップ 2: ドキュメントを挿入する\{#step-2-insert-documents}

コレクションを設定したら、テキストデータを挿入します。生のテキストを指定するだけで、MinHash 関数が各ドキュメントのバイナリベクトルを自動的に生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.insert(
    "dedup_collection",
    [
        {"document_content": "information retrieval is a field of study that helps users find relevant information in large datasets"},
        {"document_content": "information retrieval is a research field focused on helping users find relevant data in large collections"},
        {"document_content": "information retrieval is a field of research helping users search for relevant information in large datasets"},
    ],
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;
import java.util.ArrayList;
import java.util.List;

List<JsonObject> data = new ArrayList<>();

JsonObject row1 = new JsonObject();
row1.addProperty("document_content", "information retrieval is a field of study that helps users find relevant information in large datasets");
data.add(row1);

JsonObject row2 = new JsonObject();
row2.addProperty("document_content", "information retrieval is a research field focused on helping users find relevant data in large collections");
data.add(row2);

JsonObject row3 = new JsonObject();
row3.addProperty("document_content", "information retrieval is a field of research helping users search for relevant information in large datasets");
data.add(row3);

client.insert(InsertReq.builder()
        .collectionName("dedup_collection")
        .data(data)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("dedup_collection").
    WithVarcharColumn("document_content", []string{
        "information retrieval is a field of study that helps users find relevant information in large datasets",
        "information retrieval is a research field focused on helping users find relevant data in large collections",
        "information retrieval is a field of research helping users search for relevant information in large datasets",
    }))
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let insert_req = InsertRequest::builder()
    .collection_name("dedup_collection")
    .rows(vec![
        json!({"document_content": "information retrieval is a field of study that helps users find relevant information in large datasets"}),
        json!({"document_content": "information retrieval is a research field focused on helping users find relevant data in large collections"}),
        json!({"document_content": "information retrieval is a field of research helping users search for relevant information in large datasets"}),
    ])
    .build()?;

client.insert(insert_req).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::EntityRows rows;
rows.emplace_back(milvus::EntityRow{{"document_content", "information retrieval is a field of study that helps users find relevant information in large datasets"}});
rows.emplace_back(milvus::EntityRow{{"document_content", "information retrieval is a research field focused on helping users find relevant data in large collections"}});
rows.emplace_back(milvus::EntityRow{{"document_content", "information retrieval is a field of research helping users search for relevant information in large datasets"}});

milvus::InsertResponse insert_response;
status = client->Insert(milvus::InsertRequest()
                            .WithCollectionName("dedup_collection")
                            .WithRowsData(std::move(rows)),
                        insert_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.insert({
  collection_name: "dedup_collection",
  data: [
    { document_content: "information retrieval is a field of study that helps users find relevant information in large datasets" },
    { document_content: "information retrieval is a research field focused on helping users find relevant data in large collections" },
    { document_content: "information retrieval is a field of research helping users search for relevant information in large datasets" },
  ],
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "dedup_collection",
    "data": [
        {"document_content": "information retrieval is a field of study that helps users find relevant information in large datasets"},
        {"document_content": "information retrieval is a research field focused on helping users find relevant data in large collections"},
        {"document_content": "information retrieval is a field of research helping users search for relevant information in large datasets"}
    ]
}' 
```

</TabItem>
</Tabs>

## ステップ 3: MinHash で検索する\{#step-3-search-with-minhash}

データを挿入したら、生のテキストクエリを指定してニアデュプリケートドキュメントを検索します。Zilliz Cloud は各クエリを MinHash バイナリベクトルに自動的に変換します。推定 Jaccard 類似度で LSH 候補をランク付けするには、Jaccard リファインメントを有効にします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
search_params = {
    "metric_type": "MHJACCARD",
    "params": {
        "mh_search_with_jaccard": True,
        "refine_k": 3,
    },
}

results = client.search(
    collection_name="dedup_collection",
    data=["information retrieval is a research field focused on helping users find relevant data in large collections"],
    anns_field="binary_vector",
    limit=3,
    output_fields=["document_content"],
    search_params=search_params,
)

for hits in results:
    for hit in hits:
        print(f"ID: {hit['id']}, Distance: {hit['distance']}")
        print(f"Document: {hit['entity']['document_content']}")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.common.IndexParam;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("dedup_collection")
        .annsField("binary_vector")
        .data(Collections.singletonList(new EmbeddedText("information retrieval is a research field focused on helping users find relevant data in large collections")))
        .metricType(IndexParam.MetricType.MHJACCARD)
        .searchParams(new HashMap<String, Object>() {{
            put("mh_search_with_jaccard", true);
            put("refine_k", 3);
        }})
        .limit(3)
        .outputFields(Collections.singletonList("document_content"))
        .build());

for (SearchResp.SearchResult hit : resp.getSearchResults().get(0)) {
    System.out.println("ID: " + hit.getEntity().get("id") + ", Distance: " + hit.getScore());
    System.out.println("Document: " + hit.getEntity().get("document_content"));
}
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
)

results, err := client.Search(ctx, milvusclient.NewSearchOption(
    "dedup_collection", 3,
    []entity.Vector{entity.Text("information retrieval is a research field focused on helping users find relevant data in large collections")}).
    WithANNSField("binary_vector").
    WithOutputFields("document_content").
    WithSearchParam("metric_type", "MHJACCARD").
    WithSearchParam("mh_search_with_jaccard", "true").
    WithSearchParam("refine_k", "3"))
if err != nil {
    log.Fatal(err)
}

for _, rs := range results {
    fmt.Printf("ID: %v, Distance: %v\n", rs.IDs, rs.Scores)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use std::collections::HashMap;

let search_req = SearchRequest::builder()
    .collection_name("dedup_collection")
    .vector_field("binary_vector")
    .vectors(SearchVectors::EmbeddedText(vec!["information retrieval is a research field focused on helping users find relevant data in large collections".to_string()]))
    .metric_type(MetricType::MhJaccard)
    .extra_params(HashMap::from([
        ("mh_search_with_jaccard".to_string(), "true".to_string()),
        ("refine_k".to_string(), "3".to_string()),
    ]))
    .output_fields(vec!["document_content"])
    .limit(3)
    .build()?;

let res = client.search(search_req).await?;
println!("{:?}", res.results());
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::SearchResponse response;
status = client->Search(milvus::SearchRequest()
                            .WithCollectionName("dedup_collection")
                            .WithAnnsField("binary_vector")
                            .AddEmbeddedText("information retrieval is a research field focused on helping users find relevant data in large collections")
                            .WithMetricType(milvus::MetricType::MHJACCARD)
                            .AddExtraParam("mh_search_with_jaccard", "true")
                            .AddExtraParam("refine_k", "3")
                            .WithLimit(3)
                            .AddOutputField("document_content"),
                        response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const results = await client.search({
  collection_name: "dedup_collection",
  anns_field: "binary_vector",
  data: ["information retrieval is a research field focused on helping users find relevant data in large collections"],
  output_fields: ["document_content"],
  search_params: {
    metric_type: "MHJACCARD",
    topk: 3,
    params: JSON.stringify({ mh_search_with_jaccard: true, refine_k: 3 }),
  },
});
console.log(results);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "dedup_collection",
    "annsField": "binary_vector",
    "data": ["information retrieval is a research field focused on helping users find relevant data in large collections"],
    "limit": 3,
    "outputFields": ["document_content"],
    "searchParams": {"metric_type": "MHJACCARD", "params": {"mh_search_with_jaccard": true, "refine_k": 3}}
}' 
```

</TabItem>
</Tabs>

`mh_search_with_jaccard` を `True` に設定すると、Jaccard リファインメントが有効になります。`refine_k` は、リファインメントに使用される候補プールの容量を制御します。Zilliz Cloud は `max(refine_k, limit)` を容量として使用しますが、LSH ルックアップが返す一致数が少ない場合は、より少ない候補のみをリファインすることがあります。`refine_k` を大きくすると、追加の計算と引き換えに結果の品質を向上させることができます。

## 次のステップ\{#whats-next}

- [全文検索](./full-text-search): ニアデュプリケート検出の代わりに、字句的な関連性ランキングに BM25 を使用します。

- [アナライザーの概要](./analyzer-overview): テキストのトークン化用のカスタムアナライザーを構成します。

- [MINHASH_LSH インデックス](./minhash-lsh): 再現率とパフォーマンスのために LSH パラメーターをチューニングする方法を説明します。

