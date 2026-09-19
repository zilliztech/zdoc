---
title: "検索のためのデータモデル設計 | BYOC"
slug: /schema-design-hands-on
sidebar_label: "データモデル設計"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "情報検索システムは検索エンジンとも呼ばれ、Retrieval-augmented generation（RAG）、ビジュアル検索、商品レコメンデーションなど、さまざまな AI アプリケーションに欠かせない存在です。こうしたシステムの中核にあるのは、情報を整理し、インデックスを作成し、取得するための、慎重に設計されたデータモデルです。 | BYOC"
type: origin
token: PV2bwNENViEjXWkOgzZcXoKHnce
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 検索のためのデータモデル設計

情報検索システムは検索エンジンとも呼ばれ、Retrieval-augmented generation（RAG）、ビジュアル検索、商品レコメンデーションなど、さまざまな AI アプリケーションに欠かせない存在です。こうしたシステムの中核にあるのは、情報を整理し、インデックス化し、取得するための、慎重に設計されたデータモデルです。

Zilliz Cloud では、コレクションスキーマを通じて検索データモデルを指定でき、非構造化データ、その密またはスパースなベクトル表現、および構造化メタデータを整理できます。テキスト、画像、その他のデータ型を扱う場合でも、このハンズオンガイドは、主要なスキーマの概念を理解し、実際に検索データモデルを設計するために応用するのに役立ちます。

![Kc3Cweq1AhAmMGbrVgRcTlTKnUf](https://zdoc-images.s3.us-west-2.amazonaws.com/Kc3Cweq1AhAmMGbrVgRcTlTKnUf.png)

## データモデル\{#data-model}

検索システムのデータモデル設計では、ビジネスニーズを分析し、情報をスキーマで表現されたデータモデルとして抽象化します。適切に定義されたスキーマは、データモデルをビジネス目標に整合させ、データの一貫性とサービスの品質を確保するうえで重要です。また、適切なデータ型とインデックスを選択することは、ビジネス目標を経済的に達成するうえで重要です。

### ビジネスニーズの分析\{#analyzing-business-needs}

ビジネスニーズに効果的に対応するには、まずユーザーが実行するクエリの種類を分析し、最も適切な検索方法を決定することから始まります。

- **ユーザークエリ：** ユーザーが実行すると想定されるクエリの種類を特定します。これは、スキーマが実際のユースケースをサポートし、検索パフォーマンスを最適化することを確実にするのに役立ちます。クエリには次のようなものがあります：

    - 自然言語クエリに一致するドキュメントを取得する

    - 参照画像に類似する画像、またはテキスト記述に一致する画像を検索する

    - 名前、カテゴリ、ブランドなどの属性で商品を検索する

    - 構造化メタデータ（公開日、タグ、評価など）に基づいてアイテムをフィルタリングする

    - ハイブリッドクエリで複数の条件を組み合わせる（例：ビジュアル検索で、画像とそのキャプションの両方の意味的類似性を考慮する）

- <strong>検索方法：</strong> ユーザーが実行するクエリの種類に合った適切な検索手法を選択します。手法ごとに目的が異なり、多くの場合、より強力な結果を得るために組み合わせることができます：

    - **セマンティック検索**： 密ベクトルの類似性を使用して、意味が類似するアイテムを検索します。テキストや画像などの非構造化データに適しています。

    - **全文検索**： キーワードマッチングによってセマンティック検索を補完します。全文検索では字句解析を利用して、長い単語が断片化されたトークンに分割されるのを防ぎ、取得時に特殊な用語を捉えることができます。

    - **メタデータフィルタリング**： ベクトル検索に加えて、日付範囲、カテゴリ、タグなどの制約を適用します。

### ビジネス要件を検索データモデルに変換する\{#translates-business-requirements-into-a-search-data-model}

次のステップは、情報の中核となるコンポーネントとその検索方法を特定することで、ビジネス要件を具体的なデータモデルに変換することです：

- 保存する必要があるデータを定義します。たとえば、生のコンテンツ（テキスト、画像、音声）、関連するメタデータ（タイトル、タグ、著者情報）、コンテキスト属性（タイムスタンプ、ユーザー行動など）です。

- 各要素に適切なデータ型とフォーマットを決定します。たとえば、次のとおりです：

    - テキスト記述 → string

    - 画像またはドキュメントの埋め込み → 密またはスパースベクトル

    - カテゴリ、タグ、フラグ → string、array、bool

    - 価格や評価などの数値属性 → integer、float

    - 著者情報などの構造化情報 -> json

こうした要素を明確に定義することで、データの一貫性、正確な検索結果、およびダウンストリームのアプリケーションロジックとの統合の容易さが確保されます。

## スキーマ設計\{#schema-design}

Zilliz Cloud では、データモデルはコレクションスキーマで表現されます。コレクションスキーマ内で適切なフィールドを設計することが、効果的な取得を可能にする鍵となります。各フィールドは、コレクションに格納される特定の種類のデータを定義し、検索プロセスにおいて独自の役割を果たします。大まかに言うと、Zilliz Cloud は **ベクトルフィールド** と **スカラーフィールド** という 2 つの主要なタイプのフィールドをサポートしています。

ここで、データモデルを、ベクトルと任意の補助スカラーフィールドを含むフィールドのスキーマにマッピングできます。各フィールドがデータモデルの属性と対応していることを確認し、特にベクトルの種類（密またはスパース）とその次元に注意してください。

### ベクトルフィールド\{#vector-field}

ベクトルフィールドには、テキスト、画像、音声などの非構造化データ型の埋め込みが格納されます。これらの埋め込みは、データ型と使用する取得方法に応じて、密、スパース、またはバイナリになります。通常、密ベクトルはセマンティック検索に使用され、スパースベクトルは全文検索や字句マッチングにより適しています。バイナリベクトルは、ストレージと計算リソースが限られている場合に役立ちます。コレクションには、マルチモーダルまたはハイブリッドな取得戦略を可能にするために、複数のベクトルフィールドを含めることができます。このトピックの詳細なガイドについては、[マルチベクトルハイブリッド検索](./hybrid-search) を参照してください。

Zilliz Cloud は、[密ベクトル](./use-dense-vector) 用の `FLOAT_VECTOR`、[スパースベクトル](./use-sparse-vector) 用の `SPARSE_FLOAT_VECTOR`、[バイナリベクトル](./use-binary-vector) 用の `BINARY_VECTOR` というベクトルデータ型をサポートしています。

### スカラーおよび複合フィールド\{#scalar-and-composite-fields}

スカラーフィールドには、数値、文字列、日付など、一般にメタデータと呼ばれるプリミティブで構造化された値が格納されます。これらの値はベクトル検索結果とともに返すことができ、フィルタリングと並べ替えに欠かせません。これらにより、ドキュメントを特定のカテゴリや定義された期間に限定するなど、特定の属性に基づいて検索結果を絞り込むことができます。

Zilliz Cloud は、`BOOL`、`INT8/16/32/64`、`FLOAT`、`DOUBLE`、`VARCHAR` などのスカラー型に加え、`JSON` や `ARRAY` などの複合型をサポートしており、ベクトル以外のデータの格納とフィルタリングに利用できます。これらの型は、検索操作の精度とカスタマイズ性を高めます。

## スキーマ設計で高度な機能を活用する\{#leverage-advanced-features-in-schema-design}

スキーマを設計する際には、サポートされているデータ型を使用してデータをフィールドにマッピングするだけでは十分ではありません。フィールド間の関係と、構成に利用できる戦略を十分に理解しておくことが不可欠です。設計段階で主要な機能を念頭に置くことで、スキーマが当面のデータ処理要件を満たすだけでなく、将来のニーズに対してスケーラブルかつ適応可能であることを確保できます。これらの機能を慎重に統合することで、Zilliz Cloud の機能を最大限に引き出し、より広範なデータ戦略と目標を支える強固なデータアーキテクチャを構築できます。以下は、コレクションスキーマを作成する主要な機能の概要です：

### 主キー\{#primary-key}

主キーフィールドは、コレクション内の各エンティティを一意に識別するため、スキーマの基本的な構成要素です。主キーの定義は必須です。主キーは整数型または文字列型のスカラーフィールドであり、`is_primary=True` とマークする必要があります。オプションで、主キーに対して `auto_id` を有効にできます。この場合、コレクションに取り込まれるデータが増えるにつれて単調に増加する整数値が自動的に割り当てられます。

詳細については、[プライマリフィールドと AutoID](./primary-field-auto-id) を参照してください。

### パーティショニング\{#partitioning}

検索を高速化するために、オプションでパーティショニングを有効にできます。パーティショニング用に特定のスカラーフィールドを指定し、検索時にこのフィールドに基づくフィルタリング条件を指定することで、検索範囲を関連するパーティションのみに効果的に限定できます。この方法では、検索対象のドメインを減らすことで、取得操作の効率が大幅に向上します。

詳細については、[Partition Key を使用する](./use-partition-key) を参照してください。

### アナライザー\{#analyzer}

アナライザーは、テキストデータを処理および変換するための不可欠なツールです。その主な機能は、生のテキストをトークンに変換し、インデックス作成と取得のために構造化することです。これは、文字列をトークン化し、ストップワードを削除し、個々の単語をステミングしてトークンにすることで行います。

詳細については、[アナライザーの概要](./analyzer-overview) を参照してください。

### 関数\{#function}

Zilliz Cloud では、スキーマの一部として組み込み関数を定義し、特定のフィールドを自動的に生成できます。たとえば、`VARCHAR` フィールドからスパースベクトルを生成して全文検索をサポートする組み込みの BM25 関数を追加できます。これらの関数によって生成されるフィールドは前処理を合理化し、コレクションが自己完結的でクエリ可能な状態に保たれることを確保します。

詳細については、[全文検索](./full-text-search) を参照してください。

## 実際の例\{#a-real-world-example}

このセクションでは、上の図に示すマルチメディアドキュメント検索アプリケーションのスキーマ設計とコード例を概説します。このスキーマは、次のフィールドにデータがマッピングされた記事を含むデータセットを管理するように設計されています：

| **フィールド** | **データソース** | **使用される検索方法** | **主キー** | **パーティションキー** | **アナライザー** | **関数の Input/Output** |
| --- | --- | --- | --- | --- | --- | --- |
| article_id (`INT64`) | `auto_id` を有効にして自動生成 | [Get を使用したクエリ](./get-and-scalar-query) | Y | N | N | N |
| title (`VARCHAR`) | 記事のタイトル | [テキストマッチ](./text-match) | N | N | Y | N |
| timestamp (`INT32`) | 公開日 | [Partition Key によるフィルタリング](./use-partition-key) | N | Y | N | N |
| text (`VARCHAR`) | 記事の生テキスト | [マルチベクトルハイブリッド検索](./hybrid-search) | N | N | Y | input |
| text_dense_vector (`FLOAT_VECTOR`) | テキスト埋め込みモデルによって生成された密ベクトル | [基本ベクトル検索](./single-vector-search) | N | N | N | N |
| text_sparse_vector (`SPARSE_FLOAT_VECTOR`) | 組み込みの BM25 関数によって自動生成されたスパースベクトル | [全文検索](./full-text-search) | N | N | N | output |

スキーマの詳細と、さまざまな種類のフィールドを追加するための詳しいガイダンスについては、[スキーマの解説](./schema-explained) を参照してください。

### ステップ 1: スキーマを初期化する\{#step-1-initialize-schema}

まず、空のスキーマを作成する必要があります。このステップでは、データモデルを定義するための基盤となる構造を確立します。

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

### ステップ 2: フィールドを追加する\{#step-2-add-fields}

スキーマを作成したら、次のステップは、データを構成するフィールドを指定することです。各フィールドは、それぞれのデータ型と属性に関連付けられています。

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

この例では、フィールドに対して次の属性が指定されています：

- 主キー： `article_id` が主キーとして使用され、受信するエンティティの主キーを自動的に割り当てられるようにします。

- パーティションキー： `timestamp` がパーティションキーとして割り当てられ、パーティションによるフィルタリングを可能にします。

- テキストアナライザー： テキストアナライザーが 2 つの文字列フィールド `title` と `text` に適用され、それぞれテキストマッチと全文検索をサポートします。

### ステップ 3:（任意）関数を追加する\{#step-3-optional-add-functions}

データのクエリ機能を強化するために、関数をスキーマに組み込むことができます。たとえば、特定のフィールドに関連する処理を行う関数を作成できます。

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

この例では、スキーマに組み込みの BM25 関数を追加し、`text` フィールドを入力として使用して、生成されたスパースベクトルを `text_sparse_vector` フィールドに格納します。

## 次のステップ\{#next-steps}

- [コレクションの作成](./manage-collections-sdks)

- [コレクションフィールドの変更](./alter-collection-field)
