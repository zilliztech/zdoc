---
title: "検索のためのデータモデル設計 | Cloud"
slug: /schema-design-hands-on
sidebar_label: "データモデル設計"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "情報検索システム（検索エンジンとも呼ばれる）は、RAG（検索拡張生成）、ビジュアル検索、商品推薦などのさまざまなAIアプリケーションにとって不可欠です。これらのシステムの核となるのは、情報を整理、インデックス化、検索するための注意深く設計されたデータモデルです。 | Cloud"
type: origin
token: PV2bwNENViEjXWkOgzZcXoKHnce
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - schema design
  - hands-on
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 検索のためのデータモデル設計

情報検索システム（検索エンジンとも呼ばれる）は、RAG（検索拡張生成）、ビジュアル検索、商品推薦などのさまざまなAIアプリケーションにとって不可欠です。これらのシステムの核となるのは、情報を整理、インデックス化、検索するための注意深く設計されたデータモデルです。

Zilliz Cloudでは、コレクションスキーマを通じて検索データモデルを指定し、非構造化データ、その密ベクトルまたは疎ベクトル表現、および構造化メタデータを整理できます。テキスト、画像、または他のデータ型を扱う場合でも、この実践的なガイドにより、キースキーマ概念を理解し、実際の検索データモデル設計に適用するのに役立ちます。

![Kc3Cweq1AhAmMGbrVgRcTlTKnUf](/img/Kc3Cweq1AhAmMGbrVgRcTlTKnUf.png)

## データモデル\{#data-model}

検索システムのデータモデル設計には、ビジネスニーズの分析と、情報をスキーマで表現されたデータモデルに抽象化することが含まれます。明確に定義されたスキーマは、データモデルをビジネス目標に合わせ、データの一貫性とサービス品質を確保するために重要です。さらに、適切なデータ型とインデックスを選択することは、ビジネス目標を経済的に達成するために重要です。

### ビジネスニーズの分析\{#analyzing-business-needs}

ビジネスニーズに効果的に対応するには、まずユーザーが実行するクエリの種類を分析し、最も適切な検索方法を決定することが重要です。

- **ユーザークエリ:** ユーザーが実行すると予想されるクエリの種類を特定します。これにより、スキーマが現実のユースケースをサポートし、検索パフォーマンスを最適化するのに役立ちます。これらには以下が含まれます：
    - 自然言語クエリに一致する文書を取得
    - 参照画像と類似する画像またはテキスト記述に一致する画像を検索
    - 名前、カテゴリ、ブランドなどの属性で商品を検索
    - 構造化メタデータ（例：公開日、タグ、評価）に基づいたアイテムのフィルタリング
    - ハイブリッドクエリで複数の基準を組み合わせる（例：ビジュアル検索では、画像とそのキャプションのセマンティック類似性を考慮）

- **検索方法:** ユーザーが実行するクエリの種類に合致する適切な検索技術を選択します。異なる方法は異なる目的に служит、より強力な結果を得るために組み合わせることができます：
    - **セマンティック検索**: 密ベクトルの類似性を使用して、意味的に類似したアイテムを検索します。テキストや画像などの非構造化データに最適です。
    - **全文検索**: キーワードマッチングによるセマンティック検索の補完。全文検索では、検索時に長単語を断片的なトークンに分割しないように語彙解析を利用できます。
    - **メタデータフィルタリング**: ベクトル検索に加えて、日付範囲、カテゴリ、タグなどの制約を適用します。

### ビジネス要件を検索データモデルに変換\{#translates-business-requirements-into-a-search-data-model}

次のステップは、ビジネス要件を具体的なデータモデルに変換することです。これには、情報のコアコンポーネントとその検索方法を特定します：

- 格納が必要なデータを定義します。これには、生コンテンツ（テキスト、画像、音声）、関連メタデータ（タイトル、タグ、著者）、コンテキスト属性（タイムスタンプ、ユーザービヘイビア等）が含まれます。
- 各要素に適したデータ型と形式を決定します。例えば：
    - テキスト記述 → string
    - 画像または文書の埋め込み → 密ベクトルまたは疎ベクトル
    - カテゴリ、タグ、フラグ → string、array、およびbool
    - 価格や評価などの数値属性 → integerまたはfloat
    - 著者詳細などの構造化情報 → json

これらの要素を明確に定義することで、データの一貫性、正確な検索結果、および下流のアプリケーションロジックとの統合の容易さを確保できます。

## スキーマ設計\{#schema-design}

Zilliz Cloudでは、データモデルはコレクションスキーマで表現されます。コレクションスキーマ内で適切なフィールドを設計することは、効果的な検索を可能にする鍵です。各フィールドは、コレクションに格納される特定のデータ型を定義し、検索プロセスで明確な役割を果たします。大まかに、Zilliz Cloudは2つの主なフィールドタイプをサポートしています：**ベクトルフィールド**と**スカラーフィールド**。

現在、データモデルをベクトルと補助的なスカラーフィールドのスキーマにマッピングできます。各フィールドがデータモデルの属性に関連していることを確認し、特にベクトル型（密または疎）とその次元に注意してください。

### ベクトルフィールド\{#vector-field}

ベクトルフィールドは、テキスト、画像、音声などの非構造化データ型の埋め込みを保存します。これらの埋め込みは、データ型や使用する検索方法に応じて、密、疎、またはバイナリになることがあります。通常、密ベクトルはセマンティック検索に使用され、疎ベクトルは全文または語彙一致に最適です。バイナリベクトルは、ストレージや計算リソースが限られているときに有用です。コレクションには、マルチモーダルまたはハイブリッド検索戦略を可能にするために複数のベクトルフィールドを含めることができます。このトピックの詳細ガイドについては、[マルチベクトルハイブリッド検索](./hybrid-search)を参照してください。

Zilliz Cloudは、`FLOAT_VECTOR`（[密ベクトル](./use-dense-vector)用）、`SPARSE_FLOAT_VECTOR`（[疎ベクトル](./use-sparse-vector)用）、`BINARY_VECTOR`（[バイナリベクトル](./use-binary-vector)用）のベクトルデータ型をサポートしています。

### スカラーおよび複合フィールド\{#scalar-and-composite-fields}

スカラーフィールドは、数値、文字列、日付などの基本的な構造化値（一般的にメタデータと呼ばれる）を保存します。これらはベクトル検索結果と一緒に返すことができ、フィルタリングやソートに不可欠です。特定の属性（たとえば、特定のカテゴリや定義された時間範囲に文書を限定する）に基づいて検索結果を絞り込むことができます。

Zilliz Cloudは、`BOOL`、`INT8/16/32/64`、`FLOAT`、`DOUBLE`、`VARCHAR`などのスカラータイプと、非ベクトルデータを保存およびフィルタリングするための`JSON`や`ARRAY`などの複合タイプをサポートしています。これらの型により、検索操作の精度とカスタマイズ性が向上します。

## スキーマ設計における高度な機能の活用\{#leverage-advanced-features-in-schema-design}

スキーマを設計する際には、サポートされているデータ型を使用してデータをフィールドにマッピングするだけでは十分ではありません。フィールド間の関係性と、構成可能な戦略を十分に理解することが重要です。設計段階で主要機能に注意を払うことで、スキーマが即時のデータ処理要件を満たすだけでなく、将来のニーズに応じてスケーラブルで柔軟性を持つことを保証できます。これらの機能を慎重に統合することで、Zilliz Cloudの機能を最大限に引き出し、より広範なデータ戦略と目標をサポートする強固なデータアーキテクチャを構築できます。コレクションスキーマを作成する際の主要機能の概要は以下の通りです：

### 主キー\{#primary-key}

主キーは、コレクション内の各エンティティを一意に識別するスキーマの基本的なコンポーネントです。主キーの定義は必須です。これは整数または文字列型のスカラーフィールドであり、`is_primary=True`としてマークする必要があります。オプションとして、主キーに対して`auto_id`を有効にできます。これは、コレクションにデータがより多く取り込まれるにつれて単調に増加する自動割り当ての整数番号です。

詳細については、[主フィールド & AutoID](./primary-field-auto-id)を参照してください。

### パーティショニング\{#partitioning}

検索を高速化するために、オプションでパーティショニングを有効にすることができます。特定のスカラーフィールドをパーティショニング用に指定し、検索時にこのフィールドに基づいてフィルタリング基準を指定することで、検索範囲を関連するパーティションのみに効果的に限定できます。この方法により、検索領域を削減することで検索操作の効率を大幅に向上させます。

詳細については、[パーティションキーの使用](./use-partition-key)を参照してください。

### アナライザー\{#analyzer}

アナライザーは、テキストデータを処理および変換するための基本的なツールです。その主な機能は、生のテキストをトークンに変換し、インデックス作成と検索用に構造化することです。文字列をトークン化し、ストップワードを削除し、個々の単語をトークンに語幹化することで行います。

詳細については、[アナライザー概要](./analyzer-overview)を参照してください。

### 関数\{#function}

Zilliz Cloudでは、スキーマの一部として組み込み関数を定義し、特定のフィールドを自動的に派生させることができます。たとえば、`VARCHAR`フィールドから疎ベクトルを生成する組み込みBM25関数を追加し、全文検索をサポートできます。これらの関数によって派生したフィールドは、前処理を効率化し、コレクションが自己完結的でクエリ準備ができていることを保証します。

詳細については、[全文検索](./full-text-search)を参照してください。

## 実世界の例\{#a-real-world-example}

このセクションでは、上記の図に示すマルチメディア文書検索アプリケーションのスキーマ設計とコード例を示します。このスキーマは、以下のようなフィールドにマッピングされたデータを含むデータセットを管理するように設計されています：

<table>
   <tr>
     <th><p><strong>フィールド</strong></p></th>
     <th><p><strong>データソース</strong></p></th>
     <th><p><strong>使用される検索方法</strong></p></th>
     <th><p><strong>主キー</strong></p></th>
     <th><p><strong>パーティションキー</strong></p></th>
     <th><p><strong>アナライザー</strong></p></th>
     <th><p><strong>関数入力/出力</strong></p></th>
   </tr>
   <tr>
     <td><p>article_id (<code>INT64</code>)</p></td>
     <td><p><code>auto_id</code>を有効にした自動生成</p></td>
     <td><p><a href="./get-and-scalar-query">Getを使用したクエリ</a></p></td>
     <td><p>Y</p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
   </tr>
   <tr>
     <td><p>title (<code>VARCHAR</code>)</p></td>
     <td><p>記事のタイトル</p></td>
     <td><p><a href="./text-match">テキストマッチ</a></p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>Y</p></td>
     <td><p>N</p></td>
   </tr>
   <tr>
     <td><p>timestamp (<code>INT32</code>)</p></td>
     <td><p>公開日</p></td>
     <td><p><a href="./use-partition-key">パーティションキーによるフィルタリング</a></p></td>
     <td><p>N</p></td>
     <td><p>Y</p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
   </tr>
   <tr>
     <td><p>text (<code>VARCHAR</code>)</p></td>
     <td><p>記事の生テキスト</p></td>
     <td><p><a href="./hybrid-search">マルチベクトルハイブリッド検索</a></p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>Y</p></td>
     <td><p>入力</p></td>
   </tr>
   <tr>
     <td><p>text_dense_vector (<code>FLOAT_VECTOR</code>)</p></td>
     <td><p>テキスト埋め込みモデルによって生成された密ベクトル</p></td>
     <td><p><a href="./single-vector-search">基本ベクトル検索</a></p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
   </tr>
   <tr>
     <td><p>text_sparse_vector (<code>SPARSE_FLOAT_VECTOR</code>)</p></td>
     <td><p>組み込みBM25関数によって自動生成された疎ベクトル</p></td>
     <td><p><a href="./full-text-search">全文検索</a></p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>出力</p></td>
   </tr>
</table>

スキーマの詳細情報およびさまざまなタイプのフィールドを追加するための詳細なガイドについては、[スキーマの説明](./schema-explained)を参照してください。

### ステップ1: スキーマを初期化\{#step-1-initialize-schema}

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
# cURLを使用する場合、このステップはスキップ
```

</TabItem>
</Tabs>

### ステップ2: フィールドを追加\{#step-2-add-fields}

スキーマを作成したら、次にデータ構成を指定するフィールドを追加します。各フィールドは、それぞれのデータ型と属性に関連付けられます。

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
const schema = [
  {
    name: "article_id",
    data_type: DataType.Int64,
    is_primary_key: true,
    autoID: true,
    description: "article id"
  },
  {
    name: "title",
    data_type: DataType.VarChar,
    enable_analyzer: true,
    enable_match: true,
    type_params: {
      max_length: 200
    },
    description: "article title"
  },
  {
    name: "timestamp",
    data_type: DataType.Int32,
    description: "publish date"
  },
  {
    name: "text",
    data_type: DataType.VarChar,
    enable_analyzer: true,
    type_params: {
      max_length: 2000
    },
    description: "article text content"
  },
  {
    name: "text_dense_vector",
    data_type: DataType.FloatVector,
    type_params: {
      dim: 768
    },
    description: "text dense vector"
  },
  {
    name: "text_sparse_vector",
    data_type: DataType.SparseFloatVector,
    description: "text sparse vector"
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
    WithAutoID(true)).
    WithField(entity.NewField().
    WithName("title").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(200).
    WithEnableAnalyzer(true).
    WithMatchEnable(true)).
    WithField(entity.NewField().
    WithName("timestamp").
    WithDataType(entity.FieldTypeInt32)).
    WithField(entity.NewField().
    WithName("text").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(2000).
    WithEnableAnalyzer(true)).
    WithField(entity.NewField().
    WithName("text_dense_vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(768)).
    WithField(entity.NewField().
    WithName("text_sparse_vector").
    WithDataType(entity.FieldTypeSparseFloatVector))
```

</TabItem>

<TabItem value='bash'>

```bash
export articleIdField='{
    "fieldName": "article_id",
    "dataType": "Int64",
    "isPrimary": true,
    "autoID": true
}'

export titleField='{
    "fieldName": "title",
    "dataType": "VarChar",
    "typeParams": {
        "max_length": "200"
    },
    "indexParams": {
        "enable_analyzer": "true",
        "enable_match": "true"
    }
}'

export timestampField='{
    "fieldName": "timestamp",
    "dataType": "Int32"
}'

export textField='{
    "fieldName": "text",
    "dataType": "VarChar",
    "typeParams": {
        "max_length": "2000"
    },
    "indexParams": {
        "enable_analyzer": "true"
    }
}'

export denseVectorField='{
    "fieldName": "text_dense_vector",
    "dataType": "FloatVector",
    "typeParams": {
        "dim": "768"
    }
}'

export sparseVectorField='{
    "fieldName": "text_sparse_vector",
    "dataType": "SparseFloatVector"
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $articleIdField,
        $titleField,
        $timestampField,
        $textField,
        $denseVectorField,
        $sparseVectorField
    ]
}"
```

</TabItem>
</Tabs>