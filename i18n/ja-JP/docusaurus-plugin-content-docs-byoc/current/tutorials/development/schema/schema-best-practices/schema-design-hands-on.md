---
title: "検索のためのデータモデル設計 | BYOC"
slug: /schema-design-hands-on
sidebar_label: "データモデル設計"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "検索エンジンとも呼ばれる情報検索システムは、Retrieval-augmented generation (RAG)、ビジュアル検索、商品レコメンデーションなど、さまざまな AI アプリケーションに不可欠です。これらのシステムの中核には、情報を整理し、インデックス化し、検索するための慎重に設計されたデータモデルがあります。 | BYOC"
type: origin
token: PV2bwNENViEjXWkOgzZcXoKHnce
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 検索のためのデータモデル設計

検索エンジンとも呼ばれる情報検索システムは、Retrieval-augmented generation (RAG)、ビジュアル検索、商品レコメンデーションなど、さまざまな AI アプリケーションに不可欠です。これらのシステムの中核には、情報を整理し、インデックス化し、検索するための慎重に設計されたデータモデルがあります。

Zilliz Cloud では、collection schema を通じて検索データモデルを指定でき、非構造化データ、その dense または sparse vector 表現、および構造化メタデータを整理できます。テキスト、画像、その他のデータ型のいずれを扱う場合でも、このハンズオンガイドは、実践的に検索データモデルを設計するための重要な schema の概念を理解し、適用するのに役立ちます。

![Kc3Cweq1AhAmMGbrVgRcTlTKnUf](https://zdoc-images.s3.us-west-2.amazonaws.com/Kc3Cweq1AhAmMGbrVgRcTlTKnUf.png)

## データモデル\{#data-model}

検索システムのデータモデル設計では、ビジネスニーズを分析し、情報を schema で表現されたデータモデルへと抽象化します。適切に定義された schema は、データモデルをビジネス目標に整合させ、データの一貫性とサービス品質を確保するうえで重要です。また、適切なデータ型と index を選択することは、ビジネス目標を経済的に達成するために重要です。

### ビジネスニーズの分析\{#analyzing-business-needs}

ビジネスニーズに効果的に対応するには、まずユーザーが実行する query の種類を分析し、最適な検索方法を決定することから始まります。 

- **ユーザークエリ:** ユーザーが実行すると想定される query の種類を特定します。これにより、schema が実際のユースケースをサポートし、検索パフォーマンスを最適化できるようになります。例として、以下が挙げられます。

    - 自然言語 query に一致するドキュメントの取得

    - 参照画像に類似する画像、またはテキスト記述に一致する画像の検索

    - 名前、カテゴリ、ブランドなどの属性による商品の検索

    - 構造化メタデータ（例: 公開日、タグ、評価）に基づくアイテムのフィルタリング

    - ハイブリッド query における複数条件の組み合わせ（例: ビジュアル検索で、画像とそのキャプションの両方の意味的類似性を考慮する）

- **検索方法:** ユーザーが実行する query の種類に合った適切な検索手法を選択します。異なる手法は異なる目的に対応し、多くの場合、より強力な結果を得るために組み合わせることができます。

    - **セマンティック検索**: dense vector の類似性を使用して意味の近いアイテムを見つけます。テキストや画像のような非構造化データに最適です。

    - **全文検索**: キーワードマッチングでセマンティック検索を補完します。全文検索では語彙解析を利用して長い単語が断片化された token に分割されるのを防ぎ、検索時に特殊な用語を捉えることができます。

    - **メタデータフィルタリング**: vector 検索に加えて、日付範囲、カテゴリ、タグなどの条件を適用します。

### ビジネス要件を検索データモデルに変換する\{#translates-business-requirements-into-a-search-data-model}

次のステップは、情報の中核となる構成要素とその検索方法を特定し、ビジネス要件を具体的なデータモデルに変換することです。

- 保存する必要があるデータを定義します。たとえば、生コンテンツ（テキスト、画像、音声）、関連メタデータ（タイトル、タグ、著者情報）、コンテキスト属性（タイムスタンプ、ユーザー行動など）があります。

- 各要素に適したデータ型と形式を決定します。たとえば、以下のようになります。

    - テキスト記述 → string

    - 画像またはドキュメントの embedding → dense または sparse vectors

    - カテゴリ、タグ、フラグ → string、array、bool

    - 価格や評価のような数値属性 → integer または float

    - 著者の詳細のような構造化情報 -> json

これらの要素を明確に定義することで、データの一貫性、正確な検索結果、そして下流のアプリケーションロジックとの統合の容易さが確保されます。

## Schema 設計\{#schema-design}

Zilliz Cloud では、データモデルは collection schema を通じて表現されます。collection schema 内で適切な field を設計することは、効果的な検索を実現する鍵です。各 field は collection に保存される特定のデータ型を定義し、検索プロセスでそれぞれ異なる役割を果たします。大まかに言えば、Zilliz Cloud は **vector fields** と **scalar fields** の 2 つの主要な field タイプをサポートしています。

これで、vectors と補助的な scalar fields を含めて、データモデルを field の schema にマッピングできます。各 field がデータモデルの属性に対応していることを確認し、特に vector type（dense または sparse）とその dimension に注意してください。

### Vector Field\{#vector-field}

vector field は、テキスト、画像、音声などの非構造化データ型の embedding を保存します。これらの embedding は、データ型と使用する検索方法に応じて、dense、sparse、または binary のいずれかになります。通常、dense vectors はセマンティック検索に使用され、sparse vectors は全文検索や語彙マッチングにより適しています。binary vectors は、ストレージや計算リソースが限られている場合に有用です。collection には複数の vector field を含めることができ、マルチモーダルまたはハイブリッドな検索戦略を実現できます。このトピックの詳細なガイドについては、[Multi-Vector Hybrid Search](./hybrid-search) を参照してください。

Zilliz Cloud は、[Dense Vector](./use-dense-vector) 用の `FLOAT_VECTOR`、[Sparse Vector](./use-sparse-vector) 用の `SPARSE_FLOAT_VECTOR`、および [Binary Vector](./use-binary-vector) 用の `BINARY_VECTOR` という vector データ型をサポートしています。

### Scalar & Composite Fields\{#scalar-and-composite-fields}

scalar field は、数値、文字列、日付など、一般にメタデータと呼ばれるプリミティブで構造化された値を保存します。これらの値は vector 検索結果とともに返すことができ、フィルタリングやソートに不可欠です。これにより、特定のカテゴリにドキュメントを限定したり、特定の時間範囲に絞ったりするなど、特定の属性に基づいて検索結果を絞り込むことができます。

Zilliz Cloud は、`BOOL`、`INT8/16/32/64`、`FLOAT`、`DOUBLE`、`VARCHAR` などの scalar 型に加え、`JSON` や `ARRAY` のような composite 型もサポートしており、非 vector データの保存とフィルタリングに使用できます。これらの型により、検索操作の精度とカスタマイズ性が向上します。

## Schema 設計で高度な機能を活用する\{#leverage-advanced-features-in-schema-design}

schema を設計する際には、サポートされているデータ型を使用してデータを field に単純にマッピングするだけでは不十分です。field 間の関係性や、設定に利用可能な戦略を十分に理解することが重要です。設計段階で重要な機能を念頭に置くことで、schema は当面のデータ処理要件を満たすだけでなく、将来のニーズに対してもスケーラブルかつ適応可能になります。これらの機能を慎重に統合することで、Zilliz Cloud の能力を最大限に引き出し、より広範なデータ戦略と目標を支える強固なデータアーキテクチャを構築できます。以下は、collection schema を作成する際の主要機能の概要です。

### Primary Key\{#primary-key}

primary key field は schema の基本的な構成要素であり、collection 内の各エンティティを一意に識別します。primary key の定義は必須です。これは整数型または文字列型の scalar field であり、`is_primary=True` としてマークする必要があります。必要に応じて、primary key に `auto_id` を有効化できます。これにより、collection にデータが取り込まれるにつれて単調に増加する整数が自動的に割り当てられます。

詳細については、[Primary Field & AutoID](./primary-field-auto-id) を参照してください。

### Partitioning\{#partitioning}

検索を高速化するために、必要に応じて partitioning を有効にできます。partitioning 用に特定の scalar field を指定し、検索時にその field に基づくフィルタ条件を指定することで、検索範囲を関連する partition のみに効果的に限定できます。この方法により、検索対象の範囲が縮小されるため、検索処理の効率が大幅に向上します。

詳細については、[Use Partition Key](./use-partition-key) を参照してください。

### Analyzer\{#analyzer}

analyzer はテキストデータを処理および変換するための重要なツールです。その主な機能は、生テキストを token に変換し、それらを indexing と検索のために構造化することです。具体的には、文字列を token 化し、ストップワードを除去し、各単語を語幹化して token にします。

詳細については、[Analyzer Overview](./analyzer-overview) を参照してください。

### Function\{#function}

Zilliz Cloud では、schema の一部として組み込み関数を定義し、特定の field を自動的に導出できます。たとえば、`VARCHAR` field から sparse vector を生成する組み込みの BM25 関数を追加して、全文検索をサポートできます。これらの関数由来の field により、前処理が簡素化され、collection を自己完結型かつ query 可能な状態に保つことができます。

詳細については、[Full Text Search](./full-text-search) を参照してください。

## 実世界の例\{#a-real-world-example}

このセクションでは、上図に示したマルチメディアドキュメント検索アプリケーションの schema 設計とコード例を示します。この schema は、以下の field にマッピングされるデータを含む記事データセットを管理するように設計されています。

| **Field** | **Data Source** | **Used By Search Methods** | **Primary Key** | **Partition Key** | **Analyzer** | **Function Input/Output** |
| --- | --- | --- | --- | --- | --- | --- |
| article_id (`INT64`) | `auto_id` を有効にして自動生成 | [Query using Get](./get-and-scalar-query) | Y | N | N | N |
| title (`VARCHAR`) | 記事タイトル | [Text Match](./text-match) | N | N | Y | N |
| timestamp (`INT32`) | 公開日 | [Filter by Partition Key](./use-partition-key) | N | Y | N | N |
| text (`VARCHAR`) | 記事の生テキスト | [Multi-Vector Hybrid Search](./hybrid-search) | N | N | Y | input |
| text_dense_vector (`FLOAT_VECTOR`) | テキスト embedding モデルによって生成された dense vector | [Basic Vector Search](./single-vector-search) | N | N | N | N |
| text_sparse_vector (`SPARSE_FLOAT_VECTOR`) | 組み込み BM25 関数によって自動生成された sparse vector | [Full Text Search](./full-text-search) | N | N | N | output |

schema の詳細や、さまざまな型の field を追加するための詳細なガイダンスについては、[Schema Explained](./schema-explained) を参照してください。

### ステップ 1: schema を初期化する\{#step-1-initialize-schema}

まず、空の schema を作成する必要があります。このステップでは、データモデルを定義するための基礎構造を確立します。

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

この例では、field に対して次の属性が指定されています。

- Primary key: `article_id` は primary key として使用され、受信する entity に対する primary key の自動割り当てを有効にします。

- Partition key: `timestamp` は partition key として割り当てられ、partition によるフィルタリングを可能にします。

- Text analyzer: text analyzer は 2 つの文字列 field `title` と `text` に適用され、それぞれ text match と全文検索をサポートします。

### ステップ 3: （任意）関数を追加する\{#step-3-optional-add-functions}

データクエリ機能を強化するために、スキーマに関数を組み込むことができます。たとえば、特定のフィールドに関連する処理を行う関数を作成できます。

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

この例では、スキーマに組み込みの BM25 関数を追加し、`text` フィールドを入力として使用して、生成されたスパースベクトルを `text_sparse_vector` フィールドに保存します。

## 次のステップ\{#next-steps}

- [コレクションを作成する](./manage-collections-sdks)

- [コレクションフィールドを変更する](./alter-collection-field)

