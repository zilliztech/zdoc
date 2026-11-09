---
title: "全文検索 | BYOC"
slug: /full-text-search
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "全文検索は、生のテキスト入力を BM25 アルゴリズムで処理し、ドキュメントに含まれる用語に基づいてドキュメントをランク付けします。埋め込みモデルは不要です。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-full-text-search
sidebar_label: "全文検索"
sidebar_position: 12
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/search-query-get/full-text-search.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 全文検索

全文検索は、クエリに含まれる用語またはフレーズを含むドキュメントを取得し、関連性に基づいて結果をランク付けします。これは、正確な用語を見落とす可能性があるセマンティック検索を補完するものであり、特定の検索用語に密接に一致するドキュメントが最も重要となる検索拡張生成（RAG）シナリオで特に役立ちます。

全文検索では、埋め込みモデルを省略することもできます。生のテキストを指定すると、Zilliz Cloud が自動的にスパース埋め込みに変換します。

<Admonition type="info" icon="📘" title="Notes">

全文検索をセマンティックベースの高密度ベクトル検索と統合すると、検索結果の精度と関連性を高めることができます。詳細については、[ハイブリッド検索](./hybrid-search) を参照してください。

</Admonition>

Zilliz Cloud では、プログラムまたは Web コンソールを使用して全文検索を有効にできます。このページでは、プログラムから全文検索を有効にする方法について説明します。Web コンソールでの操作の詳細については、[コレクションの管理（コンソール）](https://docs.zilliz.com/docs/manage-collections-console#full-text-search) を参照してください。

## BM25 の実装\{#bm25-implementation}

Zilliz Cloud は、情報検索システムで広く採用されているスコアリング関数である BM25 関連性アルゴリズムを使用して全文検索を実装し、それを検索ワークフローに統合することで、正確で関連性に基づいてランク付けされたテキスト結果を提供します。

Zilliz Cloud の全文検索は、以下のワークフローに従います。

1. **生のテキスト入力**: プレーンテキストを使用してテキストドキュメントを挿入するか、クエリを指定します。埋め込みモデルは不要です。

1. **テキスト分析**: Zilliz Cloud は [アナライザー](./analyzer-overview) を使用してテキストを処理し、インデックスを作成して検索できる意味のある用語に変換します。

1. **BM25 関数による処理**: 組み込み関数がこれらの用語を、BM25 スコアリングに最適化されたスパースベクトル表現に変換します。

1. **コレクションへの格納**: Zilliz Cloud は、高速な取得とランキングのために、生成されたスパース埋め込みをコレクションに格納します。

1. **BM25 関連性スコアリング**: 検索時に、Zilliz Cloud は BM25 スコアリング関数を適用してドキュメントの関連性を計算し、クエリの用語に最も適合する結果をランク付けして返します。

![全文検索](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/87421cdfa714907700ceb9768d70ec8a3aebd307d4afb358cdf021f3e3b7f2c0.png)

全文検索を使用するには、以下の主要な手順を実行します。

1. [コレクションの作成](./full-text-search#create-a-collection-for-bm25-full-text-search): 必要なフィールドを設定し、生のテキストをスパース埋め込みに変換する BM25 関数を定義します。

1. [データの挿入](./full-text-search#insert-text-data): 生のテキストドキュメントをコレクションに取り込みます。

1. [検索の実行](./full-text-search#perform-full-text-search): 自然言語のクエリテキストを使用して、BM25 の関連性に基づいてランク付けされた結果を取得します。

## BM25 全文検索用のコレクションの作成\{#create-a-collection-for-bm25-full-text-search}

BM25 を活用した全文検索を有効にするには、必要なフィールドを備えたコレクションを準備し、スパースベクトルを生成する BM25 関数を定義し、インデックスを構成してから、コレクションを作成する必要があります。

### スキーマフィールドの定義\{#define-schema-fields}

コレクションのスキーマには、少なくとも 3つの必須フィールドを含める必要があります。

- **プライマリフィールド**: コレクション内の各エンティティを一意に識別します。

- **文字列フィールド**（`VARCHAR` または `TEXT`）: 生のテキストドキュメントを格納します。BM25 の関連性ランキングのために Zilliz Cloud がテキストを処理できるよう、`enable_analyzer=True` を設定する必要があります。デフォルトでは、Zilliz Cloud は [`standard` アナライザー](./standard-analyzer) を使用します。別のアナライザーを構成するには、[アナライザーの概要](./analyzer-overview) を参照してください。このページの例では `VARCHAR` を使用しています。長いテキストの場合は、フィールドを `TEXT` として定義し、`max_length` を省略します。完全な例については、[テキストフィールド](./use-text-field) を参照してください。

- **スパースベクトルフィールド**（`SPARSE_FLOAT_VECTOR`）: BM25 関数によって自動生成されたスパース埋め込みを格納します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType, Function, FunctionType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

schema = client.create_schema()

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, auto_id=True) # Primary field
# highlight-start
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=1000, enable_analyzer=True) # Text field
schema.add_field(field_name="sparse", datatype=DataType.SPARSE_FLOAT_VECTOR) # Sparse vector field; no dim required for sparse vectors
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .build();
schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .enableAnalyzer(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("sparse")
        .dataType(DataType.SparseFloatVector)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
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

schema := entity.NewSchema()
schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true).
    WithIsAutoID(true),
).WithField(entity.NewField().
    WithName("text").
    WithDataType(entity.FieldTypeVarChar).
    WithEnableAnalyzer(true).
    WithMaxLength(1000),
).WithField(entity.NewField().
    WithName("sparse").
    WithDataType(entity.FieldTypeSparseVector),
)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let schema = CollectionSchema::new()
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(true))
    .add_field(FieldSchema::new().name("text").data_type(DataType::VarChar).max_length(1000).enable_analyzer(true))
    .add_field(FieldSchema::new().name("sparse").data_type(DataType::SparseFloatVector));
```

</TabItem>

<TabItem value='c++'>

```cpp
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"id", milvus::DataType::INT64, "", true, true});
schema->AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR).WithMaxLength(1000).EnableAnalyzer(true));
schema->AddField(milvus::FieldSchema("sparse", milvus::DataType::SPARSE_FLOAT_VECTOR));
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});
const schema = [
  {
    name: "id",
    data_type: DataType.Int64,
    is_primary_key: true,
  },
  {
    name: "text",
    data_type: "VarChar",
    enable_analyzer: true,
    enable_match: true,
    max_length: 1000,
  },
  {
    name: "sparse",
    data_type: DataType.SparseFloatVector,
  },
];

console.log(schema);
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
                "fieldName": "text",
                "dataType": "VarChar",
                "elementTypeParams": {
                    "max_length": 1000,
                    "enable_analyzer": true
                }
            },
            {
                "fieldName": "sparse",
                "dataType": "SparseFloatVector"
            }
        ]
    }'
```

</TabItem>

</Tabs>

上記の構成では、

- `id`: プライマリキーとして機能し、`auto_id=True` で自動的に生成されます。

- `text`: 全文検索操作用の生のテキストデータを格納します。このフィールドでは、長さに上限のあるテキストには `VARCHAR`、長いソースコンテンツには `TEXT` を使用できます。

- `sparse`: 全文検索操作用に内部で生成されたスパース埋め込みを格納するために予約されたベクトルフィールドです。データ型は `SPARSE_FLOAT_VECTOR` である必要があります。

### BM25 関数の定義\{#define-the-bm25-function}

BM25 関数は、トークン化されたテキストを BM25 スコアリングをサポートするスパースベクトルに変換します。

関数を定義してスキーマに追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
bm25_function = Function(
    name="text_bm25_emb", # Function name
    input_field_names=["text"], # Name of the VARCHAR or TEXT field containing raw text data
    output_field_names=["sparse"], # Name of the SPARSE_FLOAT_VECTOR field reserved to store generated embeddings
    # highlight-next-line
    function_type=FunctionType.BM25, # Set to `BM25`
)

schema.add_function(bm25_function)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;

import java.util.*;

schema.addFunction(Function.builder()
        .functionType(FunctionType.BM25)
        .name("text_bm25_emb")
        .inputFieldNames(Collections.singletonList("text"))
        .outputFieldNames(Collections.singletonList("sparse"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
function := entity.NewFunction().
    WithName("text_bm25_emb").
    WithInputFields("text").
    WithOutputFields("sparse").
    WithType(entity.FunctionTypeBM25)
schema.WithFunction(function)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let bm25_function = Function::new()
    .name("text_bm25_emb")
    .function_type(FunctionType::Bm25)
    .input_fields(["text"])
    .output_fields(["sparse"]);

let schema = schema.add_function(bm25_function);
```

</TabItem>

<TabItem value='c++'>

```cpp
milvus::FunctionPtr function = std::make_shared<milvus::Function>("text_bm25_emb", milvus::FunctionType::BM25);
function->AddInputFieldName("text");
function->AddOutputFieldName("sparse");
schema->AddFunction(function);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const functions = [
    {
      name: 'text_bm25_emb',
      description: 'bm25 function',
      type: FunctionType.BM25,
      input_field_names: ['text'],
      output_field_names: ['sparse'],
      params: {},
    },
];
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
                "fieldName": "text",
                "dataType": "VarChar",
                "elementTypeParams": {
                    "max_length": 1000,
                    "enable_analyzer": true
                }
            },
            {
                "fieldName": "sparse",
                "dataType": "SparseFloatVector"
            }
        ],
        "functions": [
            {
                "name": "text_bm25_emb",
                "type": "BM25",
                "inputFieldNames": ["text"],
                "outputFieldNames": ["sparse"],
                "params": {}
            }
        ]
    }'
```

</TabItem>

</Tabs>

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>関数の名前です。この関数は、<code>text</code> フィールドの生のテキストを、<code>sparse</code> フィールドに格納される BM25 互換のスパースベクトルに変換します。</p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>テキストからスパースベクトルへの変換が必要な <code>VARCHAR</code> または <code>TEXT</code> フィールドの名前です。<code>FunctionType.BM25</code> の場合、このパラメーターは 1つのフィールド名のみを受け付けます。</p></td>
   </tr>
   <tr>
     <td><p><code>output_field_names</code></p></td>
     <td><p>内部で生成されたスパースベクトルを格納するフィールドの名前です。<code>FunctionType.BM25</code> の場合、このパラメーターは 1つのフィールド名のみを受け付けます。</p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>使用する関数の種類です。<code>FunctionType.BM25</code> である必要があります。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

複数のテキストフィールドで BM25 処理が必要な場合は、**フィールドごとに 1つの BM25 関数**を定義し、それぞれに一意の名前と出力フィールドを設定します。

</Admonition>

### インデックスの構成\{#configure-the-index}

必要なフィールドと組み込み関数を備えたスキーマを定義したら、コレクションのインデックスを設定します。このプロセスを簡素化するには、`index_type` として `AUTOINDEX` を使用します。これは、データの構造に基づいて Zilliz Cloud が最適なインデックスタイプを選択して構成できるようにするオプションです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="sparse",

    index_type="SPARSE_INVERTED_INDEX",
    metric_type="BM25",
    params={
        "inverted_index_algo": "DAAT_MAXSCORE",
        "bm25_k1": 1.2,
        "bm25_b": 0.75
    }

)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;

Map<String,Object> params = new HashMap<>();
params.put("inverted_index_algo", "DAAT_MAXSCORE");
params.put("bm25_k1", 1.2);
params.put("bm25_b", 0.75);

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("sparse")
        .indexType(IndexParam.IndexType.SPARSE_INVERTED_INDEX)
        .metricType(IndexParam.MetricType.BM25)
        .extraParams(params)
        .build());    
```

</TabItem>

<TabItem value='go'>

```go
indexOption := milvusclient.NewCreateIndexOption("my_collection", "sparse",
    index.NewSparseInvertedIndex(entity.BM25, 0.05))
indexOption.WithExtraParam("inverted_index_algo", "DAAT_MAXSCORE")
indexOption.WithExtraParam("bm25_k1", 1.2)
indexOption.WithExtraParam("bm25_b", 0.75)
```

</TabItem>

<TabItem value='rust'>

```rust
use std::collections::HashMap;

let index_params = IndexParam::new()
    .field_name("sparse")
    .index_type(IndexType::SparseInvertedIndex)
    .metric_type(MetricType::Bm25)
    .extra_params(HashMap::from([
        ("inverted_index_algo".into(), "DAAT_MAXSCORE".into()),
        ("bm25_k1".into(), "1.2".into()),
        ("bm25_b".into(), "0.75".into()),
    ]));
```

</TabItem>

<TabItem value='c++'>

```cpp
auto index_params = milvus::IndexDesc("sparse", "", milvus::IndexType::SPARSE_INVERTED_INDEX, milvus::MetricType::BM25);
index_params.AddExtraParam("inverted_index_algo", "DAAT_MAXSCORE");
index_params.AddExtraParam("bm25_k1", "1.2");
index_params.AddExtraParam("bm25_b", "0.75");
```

</TabItem>

<TabItem value='javascript'>

```javascript
const index_params = [
  {
    field_name: "sparse",
    metric_type: "BM25",
    index_type: "SPARSE_INVERTED_INDEX",
    params: {
        "inverted_index_algo": "DAAT_MAXSCORE",
        "bm25_k1": 1.2,
        "bm25_b": 0.75
    }
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "sparse",
            "metricType": "BM25",
            "indexType": "SPARSE_INVERTED_INDEX",
            "params":{
               "inverted_index_algo": "DAAT_MAXSCORE",
               "bm25_k1": 1.2,
               "bm25_b": 0.75
            }
        }
    ]'
```

</TabItem>

</Tabs>

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>field_name</code></p></td>
     <td><p>インデックスを作成するベクトルフィールドの名前。全文検索の場合は、生成されたスパースベクトルを格納するフィールドを指定します。この例では、値を <code>sparse</code> に設定します。</p></td>
   </tr>
   <tr>
     <td><p><code>index_type</code></p></td>
     <td><p>作成するインデックスの種類。<code>AUTOINDEX</code> を使用すると、Zilliz Cloud がインデックス設定を自動的に最適化します。インデックス設定をより細かく制御する必要がある場合は、Zilliz Cloud でスパースベクトルに利用できるさまざまなインデックスタイプから選択できます。 .</p></td>
   </tr>
   <tr>
     <td><p><code>metric_type</code></p></td>
     <td><p>全文検索機能では、このパラメーターの値を <code>BM25</code> に設定する必要があります。</p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>インデックスに固有の追加パラメーターのディクショナリ。</p></td>
   </tr>
   <tr>
     <td><p><code>params.inverted_index_algo</code></p></td>
     <td><p>インデックスの構築とクエリに使用されるアルゴリズム。有効な値:</p><ul><li><p><code>&quot;DAAT_MAXSCORE&quot;</code>（デフォルト）: MaxScore アルゴリズムを使用した最適化された Document-at-a-Time（DAAT）クエリ処理。MaxScore は、影響が最小限になる可能性が高い用語とドキュメントをスキップすることで、大きな <em>k</em> 値や用語数の多いクエリに対して優れたパフォーマンスを提供します。これは、最大影響スコアに基づいて用語を必須グループと非必須グループに分割し、top-k の結果に寄与できる用語に焦点を当てることで実現されます。</p></li><li><p><code>&quot;DAAT_WAND&quot;</code>: WAND アルゴリズムを使用した最適化された DAAT クエリ処理。WAND は、最大影響スコアを活用して競合しないドキュメントをスキップすることで、評価するヒットドキュメントを減らしますが、ヒットごとのオーバーヘッドは大きくなります。そのため WAND は、小さな <em>k</em> 値のクエリや短いクエリなど、スキップがより現実的な場合に効率的です。</p></li><li><p><code>&quot;TAAT_NAIVE&quot;</code>: 基本的な Term-at-a-Time（TAAT）クエリ処理。<code>DAAT_MAXSCORE</code> や <code>DAAT_WAND</code> と比較すると低速ですが、<code>TAAT_NAIVE</code> には独自の利点があります。グローバルなコレクションパラメーター（avgdl）の変更に関係なく静的なままであるキャッシュされた最大影響スコアを使用する DAAT アルゴリズムとは異なり、<code>TAAT_NAIVE</code> はそのような変更に動的に適応します。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.bm25_k1</code></p></td>
     <td><p>用語頻度の飽和を制御します。値が大きいほど、ドキュメントのランキングにおける用語頻度の重要度が高くなります。値の範囲: [1.2, 2.0]。</p></td>
   </tr>
   <tr>
     <td><p><code>params.bm25_b</code></p></td>
     <td><p>ドキュメント長が正規化される度合いを制御します。通常は 0 から 1 の間の値が使用され、デフォルト値は 0.75 です。値が 0 の場合は長さの正規化を行わないことを意味し、値が 1 の場合は完全な長さの正規化を意味します。</p></td>
   </tr>
</table>

### コレクションの作成\{#create-the-collection}

次に、定義したスキーマとインデックスパラメーターを使用してコレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name='my_collection', 
    schema=schema, 
    index_params=index_params
)

client.load_collection('my_collection')
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.LoadCollectionReq;

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
client.loadCollection(LoadCollectionReq.builder()
        .collectionName("my_collection")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

_, err = client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client.create_collection(
    CreateCollectionRequest::builder()
        .collection_name("my_collection")
        .schema(schema)
        .index_param(index_params)
        .build()?,
)
.await?;

client.load_collection(LoadCollectionRequest::builder().collection_name("my_collection").build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                    .WithCollectionName("my_collection")
                                    .WithCollectionSchema(schema)
                                    .AddIndex(std::move(index_params)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createCollection({
    collection_name: 'my_collection',
    schema: schema,
    index_params: index_params,
    functions: functions,
});

await client.loadCollection({ collection_name: 'my_collection' });
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
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
    "collectionName": "my_collection"
}'
```

</TabItem>

</Tabs>

## テキストデータの挿入\{#insert-text-data}

コレクションとインデックスを設定したら、テキストデータを挿入できます。指定が必要なのは生のテキストのみです。先ほど定義した BM25 関数が、各テキストエントリに対応するスパースベクトルを自動的に生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.insert('my_collection', [
    {'text': 'information retrieval is a field of study.'},
    {'text': 'information retrieval focuses on finding relevant information in large datasets.'},
    {'text': 'data mining and information retrieval overlap in research.'},
])
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import io.milvus.v2.service.vector.request.InsertReq;

Gson gson = new Gson();
List<JsonObject> rows = Arrays.asList(
        gson.fromJson("{\"text\": \"information retrieval is a field of study.\"}", JsonObject.class),
        gson.fromJson("{\"text\": \"information retrieval focuses on finding relevant information in large datasets.\"}", JsonObject.class),
        gson.fromJson("{\"text\": \"data mining and information retrieval overlap in research.\"}", JsonObject.class)
);

client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithVarcharColumn("text", []string{
        "information retrieval is a field of study.",
        "information retrieval focuses on finding relevant information in large datasets.",
        "data mining and information retrieval overlap in research.",
    }),
)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

client.insert(
    InsertRequest::builder()
        .collection_name("my_collection")
        .rows(vec![
            json!({"text": "information retrieval is a field of study."}),
            json!({"text": "information retrieval focuses on finding relevant information in large datasets."}),
            json!({"text": "data mining and information retrieval overlap in research."}),
        ])
        .build()?,
)
.await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
milvus::EntityRows data = {
    {{"text", "information retrieval is a field of study."}},
    {{"text", "information retrieval focuses on finding relevant information in large datasets."}},
    {{"text", "data mining and information retrieval overlap in research."}}
};

milvus::InsertResponse response;
auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName("my_collection")
                                .WithRowsData(std::move(data))
                                , response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.insert({
    collection_name: 'my_collection',
    data: [
        {'text': 'information retrieval is a field of study.'},
        {'text': 'information retrieval focuses on finding relevant information in large datasets.'},
        {'text': 'data mining and information retrieval overlap in research.'},
    ],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "data": [
        {"text": "information retrieval is a field of study."},
        {"text": "information retrieval focuses on finding relevant information in large datasets."},
        {"text": "data mining and information retrieval overlap in research."}       
    ],
    "collectionName": "my_collection"
}'

```

</TabItem>

</Tabs>

## 全文検索の実行\{#perform-full-text-search}

コレクションにデータを挿入したら、生のテキストクエリで検索できます。Zilliz Cloud はクエリを自動的にスパースベクトルに変換し、BM25 アルゴリズムを使用して一致した結果をランク付けし、上位 `limit` 件の結果を返します。

<Admonition type="info" icon="📘" title="Notes">

テキストハイライターを構成すると、検索結果内の一致した用語をハイライトできます。詳細については、[テキストハイライター](./text-highlighter) を参照してください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name='my_collection', 
    # highlight-start
    data=['whats the focus of information retrieval?'],
    anns_field='sparse',
    output_fields=['text'], # Fields to return in search results; sparse field cannot be output
    # highlight-end
    limit=3,
    search_params={"metric_type": "BM25", "params": {"level": 10}},
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;

Map<String,Object> searchParams = new HashMap<>();
searchParams.put("metric_type", "BM25");
searchParams.put("level", 10);

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new EmbeddedText("whats the focus of information retrieval?")))
        .annsField("sparse")
        .topK(3)
        .searchParams(searchParams)
        .outputFields(Collections.singletonList("text"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
annSearchParams := index.NewCustomAnnParam()
annSearchParams.WithExtraParam("metric_type", "BM25")
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    3,               // limit
    []entity.Vector{entity.Text("whats the focus of information retrieval?")},
).WithConsistencyLevel(entity.ClStrong).
    WithANNSField("sparse").
    WithAnnParam(annSearchParams).
    WithOutputFields("text"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("text: ", resultSet.GetColumn("text").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let res = client.search(
    SearchRequest::builder()
        .collection_name("my_collection")
        .vector_field("sparse")
        .vectors(SearchVectors::EmbeddedText(vec!["whats the focus of information retrieval?".to_string()]))
        .metric_type(MetricType::Bm25)
        .limit(3)
        .output_fields(["text"])
        .build()?,
)
.await?;

println!("{:?}", res.results());
```

</TabItem>

<TabItem value='c++'>

```cpp
auto request = milvus::SearchRequest()
                       .WithCollectionName("my_collection")
                       .AddEmbeddedText("whats the focus of information retrieval?")
                       .WithLimit(3)
                       .WithAnnsField("sparse")
                       .AddExtraParam("metric_type", "BM25")
                       .AddOutputField("text");

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search({
    collection_name: 'my_collection',
    data: ['whats the focus of information retrieval?'],
    anns_field: 'sparse',
    output_fields: ['text'],
    params: { metric_type: 'BM25' },
    limit: 3,
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
--data-raw '{
    "collectionName": "my_collection",
    "data": [
        "whats the focus of information retrieval?"
    ],
    "annsField": "sparse",
    "limit": 3,
    "outputFields": [
        "text"
    ],
    "searchParams":{
        "metric_type": "BM25",
        "params":{}
    }
}'
```

</TabItem>

</Tabs>

| パラメーター | 説明 |
| --- | --- |
| `search_params` | 検索パラメーターを含むディクショナリ。 |
| `params.level` | 簡素化された検索最適化によって検索精度を制御します。詳細については、[再現率の調整](https://docs.zilliz.com/docs/tune-recall-rate) を参照してください。 |
| `data` | 自然言語の生のクエリテキスト。Zilliz Cloud は、BM25 関数を使用してテキストクエリを自動的にスパースベクトルに変換します。事前に計算されたベクトルは指定しないでください。 |
| `anns_field` | 内部で生成されたスパースベクトルを含むフィールドの名前。 |
| `output_fields` | 検索結果で返すフィールド名のリストです。BM25 によって生成された埋め込みを含む**スパースベクトルフィールドを除く**すべてのフィールドをサポートします。一般的な出力フィールドには、プライマリキーフィールド（例: `id`）と元のテキストフィールド（例: `text`）が含まれます。詳細については、[FAQ](https://docs.zilliz.com/docs/full-text-search#can-i-output-or-access-the-sparse-vectors-generated-by-the-bm25-function-in-full-text-search) を参照してください。 |
| `limit` | 返す上位一致の最大数。 |

## FAQ\{#faq}

### 全文検索で BM25 関数によって生成されるスパースベクトルを出力または参照できますか？\{#can-i-output-or-access-the-sparse-vectors-generated-by-the-bm25-function-in-full-text-search}

いいえ、BM25 関数によって生成されたスパースベクトルは、全文検索で直接アクセスしたり返したりすることはできません。詳細は以下の通りです。

- BM25 関数は、ランキングと取得のためにスパースベクトルを内部で生成します。

- これらのベクトルはスパースフィールドに格納されますが、`output_fields` に含めることはできません。

- 出力できるのは、元のテキストフィールドとメタデータ（`id`、`text` など）のみです。

例:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
search_params = {"metric_type": "BM25"}

# ❌ This throws an error - you cannot output the sparse field
client.search(
    collection_name='my_collection',
    data=['query text'],
    anns_field='sparse',
    # highlight-next-line
    output_fields=['text', 'sparse'],  # 'sparse' causes an error
    limit=3,
    search_params=search_params
)

# ✅ This works - output text fields only
client.search(
    collection_name='my_collection',
    data=['query text'],
    anns_field='sparse',
    # highlight-next-line
    output_fields=['text'],
    limit=3,
    search_params=search_params
)
```

</TabItem>

<TabItem value='java'>

```java
// Searching with the sparse field in outputFields throws an error.
// Only output the original text and metadata fields.
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new EmbeddedText("query text")))
        .annsField("sparse")
        .topK(3)
        .outputFields(Collections.singletonList("text"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// Searching with the sparse field in output_fields throws an error.
// Only output the original text and metadata fields.
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection",
    3,
    []entity.Vector{entity.Text("query text")},
).WithConsistencyLevel(entity.ClStrong).
    WithANNSField("sparse").
    WithAnnParam(index.NewCustomAnnParam()).
    WithOutputFields("text"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// Searching with the sparse field in output_fields throws an error.
// Only output the original text and metadata fields.
let request = SearchRequest::builder()
    .collection_name("my_collection")
    .vector_field("sparse")
    .vectors(SearchVectors::EmbeddedText(vec!["query text".to_string()]))
    .limit(3)
    .output_fields(["text"])
    .build()?;
```

</TabItem>

<TabItem value='c++'>

```cpp
// Searching with the sparse field in output_fields throws an error.
// Only output the original text and metadata fields.
milvus::SearchRequest request = milvus::SearchRequest()
    .WithCollectionName("my_collection")
    .AddEmbeddedText("query text")
    .WithLimit(3)
    .WithAnnsField("sparse")
    .AddOutputField("text");
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Searching with the sparse field in output_fields throws an error.
// Only output the original text and metadata fields.
await client.search({
    collection_name: 'my_collection',
    data: ['query text'],
    anns_field: 'sparse',
    output_fields: ['text'],
    limit: 3,
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
--data-raw '{
    "collectionName": "my_collection",
    "data": ["query text"],
    "annsField": "sparse",
    "limit": 3,
    "outputFields": ["text"]
}'
```

</TabItem>

</Tabs>

### アクセスできないのに、スパースベクトルフィールドを定義する必要があるのはなぜですか？\{#why-do-i-need-to-define-a-sparse-vector-field-if-i-cant-access-it}

スパースベクトルフィールドは、ユーザーが直接操作しないデータベースのインデックスと同様に、内部的な検索インデックスとして機能します。

**設計上の理由**:

- **関心の分離**: 入出力にはテキストを扱い、ベクトルは Zilliz Cloud が内部で処理します。

- **パフォーマンス**: 事前計算されたスパースベクトルにより、クエリ時の BM25 ランキングを高速化できます。

- **ユーザーエクスペリエンス**: 複雑なベクトル操作は、シンプルなテキストインターフェースの背後に抽象化されています。

**ベクトルへのアクセスが必要な場合**:

- 全文検索ではなく、手動のスパースベクトル操作を使用します。

- カスタムのスパースベクトルワークフロー用に別のコレクションを作成します。

詳細については、[スパースベクトル](./use-sparse-vector) を参照してください。
