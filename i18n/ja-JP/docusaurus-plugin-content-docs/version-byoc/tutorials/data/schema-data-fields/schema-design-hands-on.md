---
title: "検索のためのデータモデル設計 | BYOC"
slug: /schema-design-hands-on
sidebar_label: "Data Model Design"
beta: FALSE
notebook: FALSE
description: "情報検索システムは、検索エンジンとしても知られており、検索拡張生成(RAG)、ビジュアル検索、製品推薦など、さまざまなAIアプリケーションに必要不可欠です。これらのシステムの中心には、情報を整理、インデックス化、取得するために注意深く設計されたデータモデルがあります。 | BYOC"
type: origin
token: PV2bwNENViEjXWkOgzZcXoKHnce
sidebar_position: 15
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - schema design
  - hands-on
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 検索のためのデータモデル設計

情報検索システムは、検索エンジンとしても知られており、検索拡張生成(RAG)、ビジュアル検索、製品推薦など、さまざまなAIアプリケーションに必要不可欠です。これらのシステムの中心には、情報を整理、インデックス化、取得するために注意深く設計されたデータモデルがあります。

Zillizクラウドコレクションスキーマを通じて検索データモデルを指定し、非構造化データ、その密集または疎なベクトル表現、および構造化メタデータを整理することができます。テキスト、画像、またはその他のデータタイプで作業している場合でも、この実践的なガイドは、キースキーマの概念を理解し、実践的に検索データモデルを設計するのに役立ちます。

![Kc3Cweq1AhAmMGbrVgRcTlTKnUf](/img/Kc3Cweq1AhAmMGbrVgRcTlTKnUf.png)

## データモデル{#data-model}

検索システムのデータモデル設計には、ビジネスニーズを分析し、情報をスキーマ表現のデータモデルに抽象化することが含まれます。明確に定義されたスキーマは、データモデルをビジネス目標に合わせ、データの一貫性とサービス品質を確保するために重要です。さらに、適切なデータタイプとインデックスを選択することは、ビジネス目標を経済的に達成するために重要です。

### 事業ニーズの分析{#analyzing-business-needs}

ビジネスニーズに効果的に対処するには、ユーザーが実行するクエリの種類を分析し、最適な検索方法を決定することから始めます。 

- ユーザーが実行することが期待されるクエリの種類を特定してください。これにより、スキーマが現実世界のユースケースをサポートし、検索パフォーマンスを最適化することができます。これらには、次のものが含まれる場合があります:

    - 自然言語クエリに一致するドキュメントを取得する

    - 参照画像に似た画像やテキストの説明に一致する画像を見つける

    - 名前、カテゴリー、ブランドなどの属性で製品を検索する

    - 構造化されたメタデータに基づいてアイテムをフィルタリングする(例:公開日、タグ、評価)

    - ハイブリッドクエリで複数の基準を組み合わせる（例えば、ビジュアル検索では、両方の画像とキャプションの意味的類似性を考慮する）

- **検索方法:**ユーザーが実行するクエリの種類に合わせた適切な検索手法を選択してください。異なる方法は異なる目的を果たし、より強力な結果を得るためにしばしば組み合わせることができます

    - 意味検索:密集したベクトル類似性を使用して、意味が似ているアイテムを見つけます。これは、テキストや画像などの非構造化データに最適です。

    - 全文検索:キーワードマッチングによる意味検索の補完。全文検索は語彙解析を利用して、長い単語を断片化されたトークンに分割することを避け、検索中に特別な用語を把握することができます。

    - メタデータフィルタリング:ベクトル検索に加えて、日付範囲、カテゴリ、タグなどの制約を適用します。

### ビジネス要件を検索データモデルに変換する{#translates-business-requirements-into-a-search-data-model}

次のステップは、情報のコアコンポーネントとその検索方法を特定することによって、ビジネス要件を具体的なデータモデルに変換することです。

- 保存する必要のあるデータを定義します。例えば、生のコンテンツ(テキスト、画像、音声)、関連するメタデータ(タイトル、タグ、著者)、およびコンテキスト属性(タイムスタンプ、ユーザーの行動など)があります。

- 各要素に適切なデータ型と形式を決定してください。例えば:

    - テキストの説明→文字列

    - 画像またはドキュメントの埋め込み→密ベクトルまたは疎ベクトル

    - カテゴリ、タグ、またはフラグ→文字列、配列、ブール値

    - 価格や評価などの数値属性→整数または浮動小数点数

    - 著者の詳細などの構造化情報->json

これらの要素を明確に定義することで、データの一貫性、正確な検索結果、および下流のアプリケーションロジックとの統合が容易になります。

## スキーマ設計{#schema-design}

にZillizクラウドデータモデルはコレクションスキーマを通じて表現されます。コレクションスキーマ内の適切なフィールドを設計することは、効果的な取得を可能にするための鍵です。各フィールドは、コレクションに格納された特定のタイプのデータを定義し、検索過程で明確な役割を果たします。高レベルでは、Zillizクラウド2つの主要なフィールドタイプ、ベクトルフィールドとスカラーフィールドをサポートしています。

今では、ベクトルや補助スカラーフィールドを含むフィールドのスキーマにデータモデルをマップできます。各フィールドがデータモデルの属性と相関していることを確認し、特にベクトルタイプ(密集または空間)とその次元に注意してください。

### ベクトル場{#vector-field}

ベクトルフィールドは、テキスト、画像、音声などの非構造化データタイプの埋め込みを格納します。これらの埋め込みは、データタイプと使用される検索方法に応じて、密集、疎、またはバイナリになる場合があります。通常、密集ベクトルは意味検索に使用され、疎ベクトルは全文検索またはレキシカルマッチングに適しています。バイナリベクトルは、ストレージと計算リソースが限られている場合に役立ちます。コレクションには、マルチモーダルまたはハイブリッド検索戦略を可能にするために、複数のベクトルフィールドが含まれる場合があります。このトピックの詳細なガイドについては、[マルチベクトルハイブリッド検索](./hybrid-search)を参照してください。

Zillizクラウド[密ベクトル](./use-dense-vector)の場合は`FLOAT_VECTOR`、[疎ベクトル](./use-sparse-vector)の場合は`SPARSE_FLOAT_VECTOR`、[バイナリベクトル](./use-binary-vector)の場合は`BINARY_VECTOR`のベクトルデータ型をサポートしています。

### スカラー場{#scalar-field}

スカラーフィールドには、数値、文字列、または日付などのプリミティブで構造化された値(一般的にメタデータと呼ばれる)が格納されます。これらの値はベクトル検索結果と一緒に返すことができ、フィルタリングやソートに不可欠です。これらの値により、ドキュメントを特定のカテゴリや定義された時間範囲に制限するなど、特定の属性に基づいて検索結果を絞り込むことができます。

Zillizクラウド`BOOL`、`INT8/16/32/64`、`FLOAT`、`DOUBLE`、`VARCHAR`、`JSON`、および`ARRAY`などのスカラー型をサポートしています。これらの型は、検索操作の精度とカスタマイズを向上させます。

## スキーマ設計で高度な機能を活用する{#leverage-advanced-features-in-schema-design}

スキーマを設計する際には、サポートされているデータ型を使用してデータをフィールドに単純にマッピングするだけでは十分ではありません。フィールド間の関係と構成に利用可能な戦略を徹底的に理解することが不可欠です。設計フェーズ中に主要な機能を念頭に置くことで、スキーマが即時のデータ処理要件を満たすだけでなく、将来のニーズにもスケーラブルかつ適応可能であることが保証されます。これらの機能を注意深く統合することで、強力なデータアーキテクチャを構築し、機能を最大限に活用することができますZillizクラウドそして、より広範なデータ戦略と目的をサポートします。以下は、コレクションスキーマを作成する主要な機能の概要です:

### プライマリキー{#primary-key}

プライマリキーフィールドは、コレクション内の各エンティティを一意に識別するため、スキーマの基本的なコンポーネントです。プライマリキーの定義は必須です。整数または文字列型のスカラーフィールドであり、`is_primary=True`としてマークされます。オプションで、プライマリキーに`auto_id`を有効にすることができます。これにより、コレクションに取り込まれるデータが増えるにつれてモノリシックに成長する整数が自動的に割り当てられます。

詳細については、[プライマリフィールドとAutoID](./primary-field-auto-id)を参照してください。

### パーティショニング{#partitioning}

検索を高速化するために、パーティショニングをオプションでオンにすることができます。パーティショニングに特定のスカラーフィールドを指定し、検索中にこのフィールドに基づくフィルタリング条件を指定することで、検索範囲を関連するパーティションに効果的に制限することができます。この方法により、検索ドメインを減らすことで、検索操作の効率が大幅に向上します。

詳細については、[パーティションキーを使う](./use-partition-key)を参照してください。

### アナライザ{#analyzer}

アナライザーは、テキストデータを処理および変換するための必須ツールです。その主な機能は、生のテキストをトークンに変換し、インデックス化および検索のために構造化することです。それは、文字列をトークン化し、ストップワードを削除し、個々の単語をトークンにステミングすることによって行われます。

詳細については、[アナライザの概要](./analyzer-overview)を参照してください。

### 機能する{#function}

Zillizクラウドスキーマの一部として組み込み関数を定義して、特定のフィールドを自動的に派生させることができます。たとえば、`VARCHAR`フィールドから疎ベクトルを生成する組み込みBM 25関数を追加して、全文検索をサポートすることができます。これらの関数派生フィールドは、前処理を簡素化し、コレクションが自己完結型でクエリ対応であることを保証します。

詳細については、[フルテキスト検索](./full-text-search)を参照してください。

## 現実世界の例{#a-real-world-example}

このセクションでは、上の図に示すマルチメディアドキュメント検索アプリケーションのスキーマデザインとコード例を概説します。このスキーマは、次のフィールドにデータマッピングされた記事を含むデータセットを管理するために設計されています。

<table>
   <tr>
     <th><p><strong>フィールド</strong></p></th>
     <th><p><strong>データソース</strong></p></th>
     <th><p><strong>検索方法で使用</strong></p></th>
     <th><p><strong>プライマリキー</strong></p></th>
     <th><p><strong>パーティションキー</strong></p></th>
     <th><p><strong>アナライザー</strong></p></th>
     <th><p><strong>機能の入力/出力</strong></p></th>
   </tr>
   <tr>
     <td><p>アーティクルID(<code>INT64</code>)</p></td>
     <td><p><code>auto_id</code>を有効にして自動生成</p></td>
     <td><p><a href="./get-and-scalar-query">Getを使用したクエリ</a></p></td>
     <td><p>Y</p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
   </tr>
   <tr>
     <td><p>タイトル(<code>VARCHAR</code>)</p></td>
     <td><p>記事のタイトル</p></td>
     <td><p><a href="./text-match">テキスト一致</a></p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>Y</p></td>
     <td><p>N</p></td>
   </tr>
   <tr>
     <td><p>タイムスタンプ(<code>INT32</code>)</p></td>
     <td><p>日付を公開</p></td>
     <td><p><a href="./use-partition-key">パーティションキーでフィルター</a></p></td>
     <td><p>N</p></td>
     <td><p>Y</p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>記事の生のテキスト</p></td>
     <td><p><a href="./hybrid-search">マルチベクトルハイブリッド検索</a></p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>Y</p></td>
     <td><p>入力</p></td>
   </tr>
   <tr>
     <td><p>テキスト密度ベクトル(<code>FLOAT_VECTOR</code>)</p></td>
     <td><p>テキスト埋め込みモデルによって生成された密ベクトル</p></td>
     <td><p><a href="./single-vector-search">基本的なベクトル検索</a></p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
   </tr>
   <tr>
     <td><p>スパースベクトル(<code>SPARSE_FLOAT_VECTOR</code>)</p></td>
     <td><p>組み込みBM 25関数によって自動生成された疎ベクトル</p></td>
     <td><p><a href="./full-text-search">フルテキスト検索</a></p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>出力する</p></td>
   </tr>
</table>

スキーマの詳細や、さまざまな種類のフィールドの追加に関する詳細なガイダンスについては、[スキーマの説明](./schema-explained)を参照してください。

### スキーマの初期化{#initialize-schema}

まず、空のスキーマを作成する必要があります。このステップでは、データモデルを定義するための基本的な構造を確立します。

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
</Tabs>

### フィールドを追加{#add-fields}

スキーマが作成されたら、次のステップはデータを構成するフィールドを指定することです。各フィールドは、それぞれのデータタイプと属性に関連付けられています。

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

この例では、フィールドに次の属性が指定されています

- 主キー: `article_id`が主キーとして使用され、受信エンティティの主キーが自動的に割り当てられます。

- パーティションキー: `timestamp`がパーティションキーとして割り当てられ、パーティションによるフィルタリングが可能になります。

- テキストアナライザ: `title`と`text`の2つの文字列フィールドにテキストアナライザを適用し、それぞれテキスト一致と全文検索をサポートします。

### (オプション)関数を追加する{#optional-add-functions}

データクエリの機能を向上させるために、関数をスキーマに組み込むことができます。例えば、特定のフィールドに関連する過程を処理するための関数を作成することができます。

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

この例では、`text`フィールドを入力として使用し、結果のスパースベクトルを`text_sparse_vector`フィールドに格納して、スキーマに組み込みBM 25関数を追加します。

## 次のステップ{#next-steps}

- (オプション)[インデックスの選択と設定](null)

</include>

- [コレクションを作成](./manage-collections-sdks)

- [コレクションフィールドを変更する](./alter-collection-field)

