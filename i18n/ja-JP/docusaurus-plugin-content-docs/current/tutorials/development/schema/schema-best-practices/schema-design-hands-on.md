---
title: "検索のためのデータモデル設計 | Cloud"
slug: /schema-design-hands-on
sidebar_label: "データモデル設計"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "検索エンジンとも呼ばれる情報検索システムは、Retrieval-augmented generation (RAG)、ビジュアル検索、製品レコメンデーションなど、さまざまなAIアプリケーションに不可欠です。これらのシステムの中核には、情報を整理・インデックス化・取得するために慎重に設計されたデータモデルがあります。 | Cloud"
type: origin
token: PV2bwNENViEjXWkOgzZcXoKHnce
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 検索のためのデータモデル設計

検索エンジンとも呼ばれる情報検索システムは、Retrieval-augmented generation (RAG)、ビジュアル検索、製品レコメンデーションなど、さまざまなAIアプリケーションに不可欠です。これらのシステムの中核には、情報を整理し、インデックス化し、取得するために慎重に設計されたデータモデルがあります。

Zilliz Cloud では、collection schema を通じて検索データモデルを指定でき、非構造化データ、その dense または sparse vector 表現、そして構造化メタデータを整理できます。テキスト、画像、またはその他のデータ型を扱う場合でも、このハンズオンガイドは、実践的に検索データモデルを設計するための主要な schema の概念を理解し、適用するのに役立ちます。

![Kc3Cweq1AhAmMGbrVgRcTlTKnUf](https://zdoc-images.s3.us-west-2.amazonaws.com/Kc3Cweq1AhAmMGbrVgRcTlTKnUf.png)

## データモデル\{#data-model}

検索システムのデータモデル設計では、ビジネスニーズを分析し、情報を schema で表現されたデータモデルへと抽象化します。適切に定義された schema は、データモデルをビジネス目標に整合させ、データの一貫性とサービス品質を確保するうえで重要です。さらに、適切なデータ型と index を選択することは、コスト効率よくビジネス目標を達成するために重要です。

### ビジネスニーズの分析\{#analyzing-business-needs}

ビジネスニーズに効果的に対応するには、まずユーザーが実行する query の種類を分析し、最適な検索方法を判断することから始まります。

- **ユーザー query:** ユーザーが実行すると想定される query の種類を特定します。これにより、schema が現実のユースケースをサポートし、検索パフォーマンスを最適化できるようになります。たとえば、以下が含まれます。

    - 自然言語 query に一致するドキュメントを取得する

    - 参照画像に類似する画像、またはテキスト記述に一致する画像を見つける

    - 名前、カテゴリ、ブランドなどの属性で製品を検索する

    - 構造化メタデータ（例: 公開日、タグ、評価）に基づいて項目をフィルタリングする

    - ハイブリッド query で複数の条件を組み合わせる（例: ビジュアル検索で、画像とそのキャプションの両方の意味的類似性を考慮する）

- **検索方法:** ユーザーが実行する query の種類に適した検索手法を選択します。異なる手法は異なる目的に適しており、より強力な結果を得るために組み合わせて使える場合も多くあります。

    - **セマンティック検索**: dense vector の類似性を使用して、意味が近い項目を見つけます。テキストや画像などの非構造化データに最適です。

    - **全文検索**: キーワードマッチングでセマンティック検索を補完します。全文検索では語彙解析を利用して、長い単語が断片化された token に分割されるのを防ぎ、取得時に特殊な用語を捉えることができます。

    - **メタデータフィルタリング**: vector 検索に加えて、日付範囲、カテゴリ、タグなどの条件を適用します。

### ビジネス要件を検索データモデルに変換する\{#translates-business-requirements-into-a-search-data-model}

次のステップは、情報の中核となる構成要素とその検索方法を特定し、ビジネス要件を具体的なデータモデルへ変換することです。

- 保存する必要があるデータを定義します。たとえば、生のコンテンツ（テキスト、画像、音声）、関連するメタデータ（タイトル、タグ、著者情報）、およびコンテキスト属性（タイムスタンプ、ユーザー行動など）が含まれます。

- 各要素に適したデータ型と形式を決定します。例:

    - テキスト説明 → string

    - 画像またはドキュメントの embedding → dense または sparse vectors

    - カテゴリ、タグ、またはフラグ → string、array、bool

    - 価格や評価などの数値属性 → integer または float

    - 著者の詳細などの構造化情報 -> json

これらの要素を明確に定義することで、データの一貫性、正確な検索結果、および下流のアプリケーションロジックとの統合のしやすさが確保されます。

## Schema 設計\{#schema-design}

Zilliz Cloud では、データモデルは collection schema を通じて表現されます。collection schema 内で適切な field を設計することが、効果的な検索を実現する鍵です。各 field は collection に保存される特定の種類のデータを定義し、検索プロセスにおいてそれぞれ異なる役割を果たします。高レベルでは、Zilliz Cloud は主に 2 種類の field、**vector fields** と **scalar fields** をサポートしています。

ここで、vector と補助的な scalar fields を含む field の schema に、データモデルをマッピングできます。各 field がデータモデル内の属性と対応していることを確認し、特に vector type（dense または spase）とその dimension に注意してください。

### Vector Field\{#vector-field}

vector field は、テキスト、画像、音声などの非構造化データ型の embedding を保存します。これらの embedding は、データ型と使用される取得方法に応じて、dense、sparse、または binary になります。通常、dense vector はセマンティック検索に使用され、sparse vector は全文検索や語彙マッチングにより適しています。binary vector は、ストレージと計算リソースが限られている場合に有用です。collection には複数の vector field を含めることができ、マルチモーダルまたはハイブリッドな取得戦略を実現できます。このトピックの詳細なガイドについては、[Multi-Vector Hybrid Search](./hybrid-search) を参照してください。

Zilliz Cloud は、[Dense Vector](./use-dense-vector) のための `FLOAT_VECTOR`、[Sparse Vector](./use-sparse-vector) のための `SPARSE_FLOAT_VECTOR`、および [Binary Vector](./use-binary-vector) のための `BINARY_VECTOR` をサポートしています。

### Scalar & Composite Fields\{#scalar-and-composite-fields}

scalar field は、数値、文字列、日付などの基本的で構造化された値、一般にメタデータと呼ばれるものを保存します。これらの値は vector 検索結果と一緒に返すことができ、フィルタリングやソートに不可欠です。これにより、特定のカテゴリのドキュメントに限定したり、定義された時間範囲に絞ったりするなど、特定の属性に基づいて検索結果を絞り込めます。

Zilliz Cloud は、`BOOL`、`INT8/16/32/64`、`FLOAT`、`DOUBLE`、`VARCHAR` などの scalar type に加え、vector 以外のデータを保存およびフィルタリングするための `JSON` や `ARRAY` などの composite type もサポートしています。これらの型により、検索操作の精度とカスタマイズ性が向上します。

## Schema 設計で高度な機能を活用する\{#leverage-advanced-features-in-schema-design}

schema を設計する際、サポートされているデータ型を使って単純にデータを field にマッピングするだけでは不十分です。field 間の関係性と、利用可能な設定戦略を十分に理解することが重要です。設計段階で重要な機能を念頭に置くことで、schema は目先のデータ処理要件を満たすだけでなく、将来のニーズに対してもスケーラブルかつ適応可能になります。これらの機能を慎重に統合することで、Zilliz Cloud の機能を最大限に活用し、より広範なデータ戦略と目標を支える堅牢なデータアーキテクチャを構築できます。以下は collection schema を作成する際の主要機能の概要です。

### Primary Key\{#primary-key}

primary key field は schema の基本構成要素であり、collection 内の各エンティティを一意に識別します。primary key の定義は必須です。これは integer または string type の scalar field であり、`is_primary=True` としてマークする必要があります。必要に応じて、primary key に `auto_id` を有効化できます。これにより、collection にさらにデータが取り込まれるにつれて単調増加する integer 値が自動的に割り当てられます。

詳細については、[Primary Field & AutoID](./primary-field-auto-id) を参照してください。

### Partitioning\{#partitioning}

検索を高速化するために、必要に応じて partitioning を有効にできます。partitioning 用に特定の scalar field を指定し、検索時にその field に基づくフィルタ条件を指定することで、検索範囲を関連する partition のみに効果的に制限できます。この方法により、検索対象領域が削減されるため、取得操作の効率が大幅に向上します。

詳細については、[Use Partition Key](./use-partition-key) を参照してください。

### Analyzer\{#analyzer}

analyzer は、テキストデータを処理および変換するための重要なツールです。主な機能は、生のテキストを token に変換し、インデックス作成と取得のために構造化することです。これは、文字列の tokenization、ストップワードの除去、および個々の単語を stemming して token にすることで実現されます。

詳細については、[Analyzer Overview](./analyzer-overview) を参照してください。

### Function\{#function}

Zilliz Cloud では、特定の field を自動的に導出するための組み込み function を schema の一部として定義できます。たとえば、`VARCHAR` field から sparse vector を生成する組み込み BM25 function を追加して、全文検索をサポートできます。これらの function 由来の field により、前処理が簡素化され、collection が自己完結型で query に対応可能な状態に保たれます。

詳細については、[Full Text Search](./full-text-search) を参照してください。

## 実世界の例\{#a-real-world-example}

このセクションでは、上図に示したマルチメディアドキュメント検索アプリケーションの schema 設計とコード例を紹介します。この schema は、以下の field にマッピングされるデータを持つ記事データセットを管理するように設計されています。

| **Field** | **Data Source** | **Used By Search Methods** | **Primary Key** | **Partition Key** | **Analyzer** | **Function Input/Output** |
| --- | --- | --- | --- | --- | --- | --- |
| article_id (`INT64`) | `auto_id` を有効にして自動生成 | [Get を使用した query](./get-and-scalar-query) | Y | N | N | N |
| title (`VARCHAR`) | 記事タイトル | [Text Match](./text-match) | N | N | Y | N |
| timestamp (`INT32`) | 公開日 | [Partition Key でフィルタ](./use-partition-key) | N | Y | N | N |
| text (`VARCHAR`) | 記事の生テキスト | [Multi-Vector Hybrid Search](./hybrid-search) | N | N | Y | input |
| text_dense_vector (`FLOAT_VECTOR`) | テキスト embedding モデルによって生成された dense vector | [Basic Vector Search](./single-vector-search) | N | N | N | N |
| text_sparse_vector (`SPARSE_FLOAT_VECTOR`) | 組み込み BM25 function によって自動生成された sparse vector | [Full Text Search](./full-text-search) | N | N | N | output |

schema に関する詳細情報と、さまざまな種類の field を追加するための詳細なガイダンスについては、[Schema Explained](./schema-explained) を参照してください。

### ステップ 1: schema を初期化する\{#step-1-initialize-schema}

まず、空の schema を作成する必要があります。このステップでは、データモデルを定義するための基盤となる構造を確立します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

schema = MilvusClient.create_schema()
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create an empty schema
CreateCollectionReq.CollectionSchema schema = client.createSchema();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

//Skip this step using JavaScript
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/entity"

schema := entity.NewSchema()
```

</TabItem>

<TabItem value='bash'>

```bash
# Skip this step using cURL
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
```

</TabItem>
</Tabs>

### ステップ 2: field を追加する\{#step-2-add-fields}

schema が作成されたら、次のステップはデータを構成する field を指定することです。各 field は、それぞれのデータ型と属性に関連付けられます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType

schema.add_field(field_name="article_id", datatype=DataType.INT64, is_primary=True, auto_id=True, description="article id")
schema.add_field(field_name="title", datatype=DataType.VARCHAR, enable_analyzer=True, enable_match=True, max_length=200, description="article title")
schema.add_field(field_name="timestamp", datatype=DataType.INT32, description="publish date")
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=2000, enable_analyzer=True, description="article text content")
schema.add_field(field_name="text_dense_vector", datatype=DataType.FLOAT_VECTOR, dim=768, description="text dense vector")
schema.add_field(field_name="text_sparse_vector", datatype=DataType.SPARSE_FLOAT_VECTOR, description="text sparse vector")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;

schema.addField(AddFieldReq.builder()
        .fieldName("article_id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("title")
        .dataType(DataType.VarChar)
        .maxLength(200)
        .enableAnalyzer(true)
        .enableMatch(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("timestamp")
        .dataType(DataType.Int32)
        .build())
schema.addField(AddFieldReq.builder()
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(2000)
        .enableAnalyzer(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("text_dense_vector")
        .dataType(DataType.FloatVector)
        .dimension(768)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("text_sparse_vector")
        .dataType(DataType.SparseFloatVector)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const fields = [
    {
        name: "article_id",
        data_type: DataType.Int64,
        is_primary_key: true,
        auto_id: true
    },
    {
        name: "title",
        data_type: DataType.VarChar,
        max_length: 200,
        enable_analyzer: true,
        enable_match: true
    },
    {
        name: "timestamp",
        data_type: DataType.Int32
    },
    {
        name: "text",
        data_type: DataType.VarChar,
        max_length: 2000,
        enable_analyzer: true
    },
    {
        name: "text_dense_vector",
        data_type: DataType.FloatVector,
        dim: 768
    },
    {
        name: "text_sparse_vector",
        data_type: DataType.SparseFloatVector
    }
]
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().
    WithName("article_id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true).
    WithIsAutoID(true).
    WithDescription("article id"),
).WithField(entity.NewField().
    WithName("title").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(200).
    WithEnableAnalyzer(true).
    WithEnableMatch(true).
    WithDescription("article title"),
).WithField(entity.NewField().
    WithName("timestamp").
    WithDataType(entity.FieldTypeInt32).
    WithDescription("publish date"),
).WithField(entity.NewField().
    WithName("text").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(2000).
    WithEnableAnalyzer(true).
    WithDescription("article text content"),
).WithField(entity.NewField().
    WithName("text_dense_vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(768).
    WithDescription("text dense vector"),
).WithField(entity.NewField().
    WithName("text_sparse_vector").
    WithDataType(entity.FieldTypeSparseVector).
    WithDescription("text sparse vector"),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export fields='[
    {
        "fieldName": "article_id",
        "dataType": "Int64",
        "isPrimary": true
    },
    {
        "fieldName": "title",
        "dataType": "VarChar",
        "elementTypeParams": {
            "max_length": 200,
            "enable_analyzer": true,
            "enable_match": true
        }
    },
    {
        "fieldName": "timestamp",
        "dataType": "Int32"
    },
    {
       "fieldName": "text",
       "dataType": "VarChar",
       "elementTypeParams": {
            "max_length": 2000,
            "enable_analyzer": true
        }
    },
    {
       "fieldName": "text_dense_vector",
       "dataType": "FloatVector",
       "elementTypeParams": {
            "dim": 768
        }
    },
    {
       "fieldName": "text_sparse_vector",
       "dataType": "SparseFloatVector",
    }
]'

export schema="{
    \"autoID\": true,
    \"fields\": $fields
}"
```

</TabItem>

<TabItem value='c++'>

```c++
schema->AddField({"article_id", milvus::DataType::INT64, "", true, true});
schema->AddField(milvus::FieldSchema("title", milvus::DataType::VARCHAR)
                    .WithMaxLength(200).EnableAnalyzer(true).EnableMatch(true));
schema->AddField(milvus::FieldSchema("timestamp", milvus::DataType::INT32));
schema->AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR)
                    .WithMaxLength(2000).EnableAnalyzer(true));
schema->AddField(milvus::FieldSchema("text_dense_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(768));
schema->AddField(milvus::FieldSchema("text_sparse_vector", milvus::DataType::SPARSE_FLOAT_VECTOR));
```

</TabItem>
</Tabs>

この例では、field に対して以下の属性が指定されています。

- Primary key: `article_id` は primary key として使用され、受信するエンティティに対する primary key の自動割り当てを有効にします。

- Partition key: `timestamp` は partition key として割り当てられ、partition によるフィルタリングを可能にします。

- Text analyzer: テキスト analyzer は 2 つの string field `title` と `text` に適用され、それぞれ text match と全文検索をサポートします。

### ステップ 3: （オプション）関数を追加する\{#step-3-optional-add-functions}

データクエリ機能を強化するために、関数を schema に組み込むことができます。たとえば、特定のフィールドに関連する処理を行う関数を作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

bm25_function = Function(
    name="text_bm25",
    input_field_names=["text"],
    output_field_names=["text_sparse_vector"],
    function_type=FunctionType.BM25,
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
        .name("text_bm25")
        .inputFieldNames(Collections.singletonList("text"))
        .outputFieldNames(Collections.singletonList("text_sparse_vector"))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import FunctionType from "@zilliz/milvus2-sdk-node";

const functions = [
    {
      name: 'text_bm25',
      description: 'bm25 function',
      type: FunctionType.BM25,
      input_field_names: ['text'],
      output_field_names: ['text_sparse_vector'],
      params: {},
    },
]；
```

</TabItem>

<TabItem value='go'>

```go
function := entity.NewFunction().
    WithName("text_bm25").
    WithInputFields("text").
    WithOutputFields("text_sparse_vector").
    WithType(entity.FunctionTypeBM25)
schema.WithFunction(function)
```

</TabItem>

<TabItem value='bash'>

```bash
export myFunctions='[
    {
        "name": "text_bm25",
        "type": "BM25",
        "inputFieldNames": ["text"],
        "outputFieldNames": ["text_sparse_vector"],
        "params": {}
    }
]'

export schema="{
    \"autoID\": true,
    \"fields\": $fields
    \"functions\": $myFunctions
}"
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::FunctionPtr function = std::make_shared<milvus::Function>("text_bm25", milvus::FunctionType::BM25);
function->AddInputFieldName("text");
function->AddOutputFieldName("text_sparse_vector");
schema->AddFunction(function);
```

</TabItem>
</Tabs>

この例では、schema に組み込みの BM25 関数を追加し、`text` フィールドを入力として使用して、生成されたスパースベクトルを `text_sparse_vector` フィールドに保存します。

## 次のステップ\{#next-steps}

- [Collection を作成する](./manage-collections-sdks)

- [Collection フィールドを変更する](./alter-collection-field)

