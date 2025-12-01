---
title: "検索のためのデータモデル設計 | BYOC"
slug: /schema-design-hands-on
sidebar_label: "データモデル設計"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "情報検索システム（検索エンジンとも呼ばれる）は、RAG（検索補完生成）、ビジュアル検索、商品推薦などのさまざまなAIアプリケーションに不可欠です。これらのシステムの中核には、情報を整理、インデックス化、検索するために慎重に設計されたデータモデルがあります。 | BYOC"
type: origin
token: PV2bwNENViEjXWkOgzZcXoKHnce
sidebar_position: 1
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - スキーマ
  - スキーマ設計
  - 実践
  - ビデオ検索
  - AIの幻覚
  - AIエージェント
  - セマンティック検索

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 検索のためのデータモデル設計

情報検索システム（検索エンジンとも呼ばれる）は、RAG（検索補完生成）、ビジュアル検索、商品推薦などのさまざまなAIアプリケーションに不可欠です。これらのシステムの中核には、情報を整理、インデックス化、検索するために慎重に設計されたデータモデルがあります。

Zilliz Cloudでは、コレクションスキーマを通じて検索データモデルを指定でき、非構造化データ、それらの密または疎なベクトル表現、および構造化メタデータを整理します。テキスト、画像、またはその他のデータ型を扱う場合でも、この実践的なガイドにより、主要なスキーマ概念を理解し、実際の検索データモデルを設計する際に適用するのに役立ちます。

![Kc3Cweq1AhAmMGbrVgRcTlTKnUf](/img/Kc3Cweq1AhAmMGbrVgRcTlTKnUf.png)

## データモデル\{#data-model}

検索システムのデータモデル設計には、ビジネスニーズを分析し、情報をスキーマ表現されたデータモデルに抽象化することが含まれます。明確に定義されたスキーマは、データモデルがビジネス目標に合うようにすること、データの一貫性とサービス品質を確保するために重要です。さらに、適切なデータ型とインデックスを選択することは、ビジネス目標を経済的に達成するために重要です。

### ビジネスニーズの分析\{#analyzing-business-needs}

ビジネスニーズに効果的に対応するには、ユーザーが実行するクエリの種類を分析し、最も適した検索方法を決定することから始めます。

- **ユーザークエリ:** ユーザーが実行することが予想されるクエリの種類を特定します。これにより、スキーマが実際の使用事例をサポートし、検索パフォーマンスを最適化することを確認できます。これらには以下が含まれます。

    - 自然言語クエリに一致するドキュメントを取得

    - 参照画像と類似する画像やテキスト記述に一致する画像を検索

    - 名前、カテゴリ、ブランドなどの属性による商品検索

    - 構造化メタデータ（例：公開日、タグ、評価）に基づくアイテムのフィルタリング

    - ハイブリッドクエリで複数の基準を組み合わせる（例：ビジュアル検索では、画像とそのキャプションのセマンティック類似性を考慮）

- **検索方法:** ユーザーが実行するクエリの種類に合わせた適切な検索技術を選択します。異なる方法は異なる目的を果たし、多くの場合、より強力な結果を得るために組み合わせることができます。

    - **セマンティック検索**: 密ベクトルの類似性を使用して、類似した意味を持つアイテムを検索します。テキストや画像などの非構造化データに最適です。

    - **全文検索**: キーワードマッチングによるセマンティック検索の補完。全文検索では、語彙解析を利用して長い単語を断片的なトークンに分解することを避け、検索中に特殊用語を把握できます。

    - **メタデータフィルタリング**: ベクトル検索に加えて、日付範囲、カテゴリ、タグなどの制約を適用します。

### ビジネス要件を検索データモデルに変換\{#translates-business-requirements-into-a-search-data-model}

次のステップは、ビジネス要件を具体的なデータモデルに変換することです。情報のコアコンポーネントとその検索方法を特定します。

- 生のコンテンツ（テキスト、画像、音声）、関連メタデータ（タイトル、タグ、著者情報）、コンテキスト属性（タイムスタンプ、ユーザー行動など）など、保存する必要があるデータを定義します。

- 各要素に適したデータ型と形式を決定します。例えば：

    - テキスト記述 → 文字列

    - 画像またはドキュメントの埋め込み → 密または疎なベクトル

    - カテゴリ、タグ、またはフラグ → 文字列、配列、およびブール値

    - 価格や評価などの数値属性 → 整数または浮動小数点数

    - 著者詳細などの構造化情報 → JSON

これらの要素を明確に定義することで、データの整合性、正確な検索結果、および下流のアプリケーションロジックとの統合の容易さを確保できます。

## スキーマ設計\{#schema-design}

Zilliz Cloudでは、データモデルはコレクションスキーマによって表現されます。コレクションスキーマ内で適切なフィールドを設計することは、効果的な検索を可能にする鍵です。各フィールドはコレクションに保存される特定のデータ型を定義し、検索プロセスで異なる役割を果たします。大まかに、Zilliz Cloudは2つの主なフィールドタイプをサポートしています：**ベクトルフィールド**と**スカラーフィールド**。

これで、データモデルをベクトルと任意の補助スカラーフィールドから構成されるスキーマにマッピングできます。各フィールドがデータモデルの属性と関連していることを確認し、特にベクトル型（密または疎）とその次元に注意してください。

### ベクトルフィールド\{#vector-field}

ベクトルフィールドには、テキスト、画像、音声などの非構造化データ型の埋め込みを格納します。これらの埋め込みは、データ型と使用される検索方法に応じて、密、疎、またはバイナリのいずれかになります。通常、密ベクトルはセマンティック検索に使用され、疎ベクトルは全文検索または語彙一致に適しています。バイナリベクトルは、ストレージと計算リソースが限られている場合に役立ちます。コレクションには、マルチモーダルまたはハイブリッド検索戦略を可能にするために複数のベクトルフィールドを含めることができます。このトピックの詳細ガイドについては、[マルチベクトルハイブリッド検索](./hybrid-search)を参照してください。

Zilliz Cloudは以下のベクトルデータ型をサポートしています：[密ベクトル](./use-dense-vector)用の`FLOAT_VECTOR`、[疎ベクトル](./use-sparse-vector)用の`SPARSE_FLOAT_VECTOR`、[バイナリベクトル](./use-binary-vector)用の`BINARY_VECTOR`。

### スカラーおよび複合フィールド\{#scalar-and-composite-fields}

スカラーフィールドには、数値、文字列、日付などの原始的・構造化された値（一般的にメタデータと呼ばれる）を格納します。これらの値はベクトル検索結果とともに返すことができ、フィルタリングとソートに不可欠です。これらを使用すると、特定の属性に基づいて検索結果を絞り込むことができ、たとえばドキュメントを特定のカテゴリや定義された時間範囲に限定できます。

Zilliz Cloudは、`BOOL`、`INT8/16/32/64`、`FLOAT`、`DOUBLE`、および`VARCHAR`などのスカラータイプ、および非ベクトルデータの格納とフィルタリングのための`JSON`および`ARRAY`などの複合型をサポートしています。これらの型は検索操作の精度とカスタマイズ性を高めます。

## スキーマ設計で高度な機能を活用\{#leverage-advanced-features-in-schema-design}

スキーマを設計する際、サポートされているデータ型を使用してデータをフィールドに単にマッピングするだけでは不十分です。フィールド間の関係性と利用可能な構成戦略を十分に理解することが重要です。設計段階で主要な機能を念頭に置くことで、スキーマが即時のデータ処理要件を満たすだけでなく、将来のニーズにも対応できるスケーラブルで適応性のあるものになります。これらの機能を慎重に統合することで、Zilliz Cloudの機能を最大限に引き出し、より広範なデータ戦略と目標をサポートする強固なデータアーキテクチャを構築できます。コレクションスキーマを作成する際の主な機能の概要は以下の通りです。

### 主キー\{#primary-key}

主キーフィールドは、スキーマの基本コンポーネントであり、コレクション内の各エンティティを一意に識別します。主キーの定義は必須です。整数型または文字列型のスカラーフィールドであり、`is_primary=True`とマークされる必要があります。オプションとして、主キーに対して`auto_id`を有効にできます。これは、より多くのデータがコレクションに取り込まれるにつれて単調に増加する整数番号を自動的に割り当てます。

詳細については、[主フィールドとAutoID](./primary-field-auto-id)を参照してください。

### パーティショニング\{#partitioning}

検索を高速化するために、オプションでパーティショニングを有効にできます。検索時にこのフィールドに基づいたフィルタリング条件を指定し、パーシングに特定のスカラーフィールドを指定することで、検索範囲を関連するパーティションのみに効果的に制限できます。この方法により、検索範囲を削減することで検索操作の効率を大幅に向上させます。

詳細については、[パーティションキーの使用](./use-partition-key)を参照してください。

### アナライザー\{#analyzer}

アナライザーは、テキストデータを処理および変換するための基本的なツールです。その主な機能は、生のテキストをトークンに変換し、インデックス作成と検索用に構造化することです。文字列をトークン化し、ストップワードを削除し、個々の単語をトークンに語幹化することで実現します。

詳細については、[アナライザー概要](./analyzer-overview)を参照してください。

### 関数\{#function}

Zilliz Cloudでは、スキーマの一部として組み込み関数を定義し、特定のフィールドを自動的に導出できます。たとえば、`VARCHAR`フィールドから疎ベクトルを生成して全文検索をサポートするための組み込みBM25関数を追加できます。これらの関数から導出されるフィールドは前処理を簡略化し、コレクションが自己完結的でクエリ準備済みの状態を保つことを保証します。

詳細については、[全文検索](./full-text-search)を参照してください。

## 実際の例\{#a-real-world-example}

このセクションでは、上記の図に示されたマルチメディアドキュメント検索アプリケーションのスキーマ設計とコード例を概説します。このスキーマは、以下のフィールドにマッピングされるデータを含む記事のデータセットを管理するように設計されています。

<table>
   <tr>
     <th><p><strong>フィールド</strong></p></th>
     <th><p><strong>データソース</strong></p></th>
     <th><p><strong>検索方法で使用</strong></p></th>
     <th><p><strong>主キー</strong></p></th>
     <th><p><strong>パーティションキー</strong></p></th>
     <th><p><strong>アナライザー</strong></p></th>
     <th><p><strong>関数入力/出力</strong></p></th>
   </tr>
   <tr>
     <td><p>article_id (<code>INT64</code>)</p></td>
     <td><p><code>auto_id</code>が有効になっている自動生成</p></td>
     <td><p><a href="./get-and-scalar-query">Getを使用したクエリ</a></p></td>
     <td><p>はい</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
   </tr>
   <tr>
     <td><p>title (<code>VARCHAR</code>)</p></td>
     <td><p>記事のタイトル</p></td>
     <td><p><a href="./text-match">テキストマッチ</a></p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>いいえ</p></td>
   </tr>
   <tr>
     <td><p>timestamp (<code>INT32</code>)</p></td>
     <td><p>公開日</p></td>
     <td><p><a href="./use-partition-key">パーティションキーによるフィルタリング</a></p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
   </tr>
   <tr>
     <td><p>text (<code>VARCHAR</code>)</p></td>
     <td><p>記事の生テキスト</p></td>
     <td><p><a href="./hybrid-search">マルチベクトルハイブリッド検索</a></p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>入力</p></td>
   </tr>
   <tr>
     <td><p>text_dense_vector (<code>FLOAT_VECTOR</code>)</p></td>
     <td><p>テキスト埋め込みモデルによって生成された密ベクトル</p></td>
     <td><p><a href="./single-vector-search">基本ベクトル検索</a></p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
   </tr>
   <tr>
     <td><p>text_sparse_vector (<code>SPARSE_FLOAT_VECTOR</code>)</p></td>
     <td><p>組み込みBM25関数によって自動生成された疎ベクトル</p></td>
     <td><p><a href="./full-text-search">全文検索</a></p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>出力</p></td>
   </tr>
</table>

スキーマの詳細とさまざまなタイプのフィールドを追加するための詳細なガイドについては、[スキーマの説明](./schema-explained)を参照してください。

### ステップ1: スキーマの初期化\{#step-1-initialize-schema}

まず、空のスキーマを作成する必要があります。このステップにより、データモデルを定義するための基本的な構造が確立されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

// 1. Milvusサーバーに接続
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. 空のスキーマを作成
CreateCollectionReq.CollectionSchema schema = client.createSchema();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

//JavaScriptを使用する場合、このステップはスキップ
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
# cURLを使用する場合、このステップをスキップ
```

</TabItem>
</Tabs>

### ステップ2: フィールドの追加\{#step-2-add-fields}

スキーマが作成されたら、次はデータを構成するフィールドを指定するステップです。各フィールドはそれぞれのデータ型と属性に関連付けられます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
</Tabs>

この例では、フィールドに以下の属性が指定されています。

- 主キー: `article_id` は主キーとして使用され、受信するエンティティに自動的に主キーが割り当てられるようになります。

- パーティションキー: `timestamp` はパーティションキーとして割り当てられ、パーティションによるフィルタリングを可能にします。

- テキストアナライザー: テキストアナライザーは、`title` と `text` の2つの文字列フィールドに適用され、それぞれテキストマッチと全文検索をサポートします。

### ステップ3: （任意）関数の追加\{#step-3-optional-add-functions}

データクエリ機能を強化するために、関数をスキーマに組み込むことができます。たとえば、特定のフィールドに関連する処理を行う関数を作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
</Tabs>

この例では、スキーマに組み込みBM25関数を追加し、`text` フィールドを入力として使用し、結果として得られる疎ベクトルを `text_sparse_vector` フィールドに保存します。

## 次のステップ\{#next-steps}

- [コレクション作成](./manage-collections-sdks)

- [コレクションフィールドの変更](./alter-collection-field)
