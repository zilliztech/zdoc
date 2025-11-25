---
title: "テキストマッチ | Cloud"
slug: /text-match
sidebar_label: "テキストマッチ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudのテキストマッチは、特定の用語に基づいて正確なドキュメント検索を可能にします。この機能は主に特定の条件を満たすためのフィルタ検索に使用され、スカラー検索を組み込むことでクエリ結果を絞り込み、スカラー条件を満たすベクトル内の類似検索を可能にします。| Cloud"
type: origin
token: RQQKwqhZUiubFzkHo4WcR62Gnvh
sidebar_position: 10
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - フィルター
  - フィルタリング式
  - フィルタリング
  - テキストマッチ
  - Faiss
  - ビデオ検索
  - AIの幻覚
  - AIエージェント

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# テキストマッチ

Zilliz Cloudのテキストマッチは、特定の用語に基づいて正確なドキュメント検索を可能にします。この機能は主に特定の条件を満たすためのフィルタ検索に使用され、スカラー検索を組み込むことでクエリ結果を絞り込み、スカラー条件を満たすベクトル内の類似検索を可能にします。

<Admonition type="info" icon="📘" title="注意">

<p>テキストマッチはクエリ用語の正確な出現箇所を検索することに重点を置き、一致したドキュメントの関連性をスコア化しません。クエリ用語の意味的および重要度に基づいて最も関連性の高いドキュメントを取得したい場合は、<a href="./full-text-search">全文検索</a>の使用を推奨します。</p>

</Admonition>

Zilliz Cloudは、プログラムによるテキストマッチの有効化またはWebコンソール経由での有効化をサポートしています。このページはプログラムによるテキストマッチの有効化方法に重点を置いています。Webコンソールでの操作の詳細については、[コレクション管理（コンソール）](./manage-collections-console#text-match)を参照してください。

## 概要\{#overview}

Zilliz Cloudは[Tantivy](https://github.com/quickwit-oss/tantivy)を統合して、基礎となる逆インデックスと用語ベースのテキスト検索を実現しています。各テキストエントリに対して、Zilliz Cloudは以下の手順に従ってインデックスを作成します：

1. [アナライザー](./analyzer-overview): アナライザーは入力されたテキストを個々の単語またはトークンに分割するトークナイズ処理を行い、必要に応じてフィルターを適用します。これにより、Zilliz Cloudはこれらのトークンに基づいてインデックスを構築できます。

1. [インデックス作成](./manage-indexes): テキスト分析後、Zilliz Cloudは各ユニークトークンを含むドキュメントにマッピングする逆インデックスを作成します。

ユーザーがテキストマッチを実行する際、逆インデックスを使用して、用語を含むすべてのドキュメントをすばやく検索できます。これは、各ドキュメントを個別にスキャンするよりもはるかに高速です。

![N43zw7HuGhmCHRbYDDmctO1bnkd](/img/N43zw7HuGhmCHRbYDDmctO1bnkd.png)

## テキストマッチの有効化\{#enable-text-match}

テキストマッチは[`VARCHAR`](./use-string-field)フィールドタイプで動作します。これはZilliz Cloudにおける文字列データ型です。テキストマッチを有効にするには、コレクションスキーマを定義する際に`enable_analyzer`と`enable_match`の両方を`True`に設定し、必要に応じてテキスト分析用に[アナライザー](./analyzer-overview)を設定します。

### `enable_analyzer`と`enable_match`の設定\{#set-enableanalyzer-and-enablematch}

特定の`VARCHAR`フィールドにテキストマッチを有効にするには、フィールドスキーマを定義する際に`enable_analyzer`と`enable_match`パラメータの両方を`True`に設定します。これにより、Zilliz Cloudはテキストをトークナイズし、指定されたフィールド用の逆インデックスを作成し、高速で効率的なテキストマッチを可能にします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema(enable_dynamic_field=False)
schema.add_field(
    field_name="id",
    datatype=DataType.INT64,
    is_primary=True,
    auto_id=True
)
schema.add_field(
    field_name='text',
    datatype=DataType.VARCHAR,
    max_length=1000,
    enable_analyzer=True, # このフィールドに対してテキスト分析を有効にするか
    enable_match=True # テキストマッチを有効にするか
)
schema.add_field(
    field_name="embeddings",
    datatype=DataType.FLOAT_VECTOR,
    dim=5
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .enableDynamicField(false)
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
        .enableMatch(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("embeddings")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/entity"

schema := entity.NewSchema().WithDynamicFieldEnabled(false)
schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true).
    WithIsAutoID(true),
).WithField(entity.NewField().
    WithName("text").
    WithDataType(entity.FieldTypeVarChar).
    WithEnableAnalyzer(true).
    WithEnableMatch(true).
    WithMaxLength(1000),
).WithField(entity.NewField().
    WithName("embeddings").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(5),
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
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
    name: "embeddings",
    data_type: DataType.FloatVector,
    dim: 5,
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
                    "enable_analyzer": true,
                    "enable_match": true
                }
            },
            {
                "fieldName": "embeddings",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "5"
                }
            }
        ]
    }'
```

</TabItem>
</Tabs>

### オプション: アナライザーの設定\{#optional-configure-an-analyzer}

キーワードマッチングのパフォーマンスと精度は、選択したアナライザーに依存します。異なるアナライザーはさまざまな言語やテキスト構造に合わせて調整されているため、適切なものを選択することで特定のユースケースにおける検索結果に大きな影響を与えることができます。

デフォルトでZilliz Cloudは`standard`アナライザーを使用します。これは空白と句読点に基づいてテキストをトークナイズし、40文字を超えるトークンを削除し、テキストを小文字に変換します。このデフォルト設定を適用するために追加のパラメータは必要ありません。詳細については、[標準アナライザー](./standard-analyzer)を参照してください。

異なるアナライザーが必要な場合、`analyzer_params`パラメータを使用して設定できます。たとえば、英語テキストの処理には`english`アナライザーを適用します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "english"
}
schema.add_field(
    field_name='text',
    datatype=DataType.VARCHAR,
    max_length=200,
    enable_analyzer=True,
    analyzer_params = analyzer_params,
    enable_match = True,
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "english");
schema.addField(AddFieldReq.builder()
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(200)
        .enableAnalyzer(true)
        .analyzerParams(analyzerParams)
        .enableMatch(true)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"type": "english"}
schema.WithField(entity.NewField().
    WithName("text").
    WithDataType(entity.FieldTypeVarChar).
    WithEnableAnalyzer(true).
    WithEnableMatch(true).
    WithAnalyzerParams(analyzerParams).
    WithMaxLength(200),
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
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
    analyzer_params: { type: 'english' },
  },
  {
    name: "embeddings",
    data_type: DataType.FloatVector,
    dim: 5,
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
                    "max_length": 200,
                    "enable_analyzer": true,
                    "enable_match": true,
                    "analyzer_params": {"type": "english"}
                }
            },
            {
                "fieldName": "embeddings",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "5"
                }
            }
        ]
    }'
```

</TabItem>
</Tabs>

Zilliz Cloudは異なる言語やシナリオに適したさまざまな他のアナライザーも提供しています。詳細については、[アナライザー概要](./analyzer-overview)を参照してください。

## テキストマッチの使用\{#use-text-match}

コレクションスキーマのVARCHARフィールドに対してテキストマッチを有効にすると、`TEXT_MATCH`式を使用してテキストマッチを実行できます。

### TEXT_MATCH式の構文\{#textmatch-expression-syntax}

`TEXT_MATCH`式は、検索対象のフィールドと検索用語を指定するために使用されます。構文は以下の通りです：

```python
TEXT_MATCH(field_name, text)
```

- `field_name`: 検索対象のVARCHARフィールドの名前です。

- `text`: 検索対象の用語です。複数の用語は、言語と設定されたアナライザーに基づいてスペースまたはその他の適切な区切り文字で区切ることができます。

デフォルトでは、`TEXT_MATCH`は**OR**マッチングロジックを使用し、指定された用語のいずれかを含むドキュメントを返します。たとえば、`text`フィールドに`machine`または`deep`という用語を含むドキュメントを検索するには、以下の式を使用します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = "TEXT_MATCH(text, 'machine deep')"
```

</TabItem>

<TabItem value='java'>

```java
String filter = "TEXT_MATCH(text, 'machine deep')";
```

</TabItem>

<TabItem value='go'>

```go
filter := "TEXT_MATCH(text, 'machine deep')"
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = "TEXT_MATCH(text, 'machine deep')";
```

</TabItem>

<TabItem value='bash'>

```bash
export filter="\"TEXT_MATCH(text, 'machine deep')\""
```

</TabItem>
</Tabs>

論理演算子を使用して複数の`TEXT_MATCH`式を組み合わせて、**AND**マッチングを実行することもできます。

- `text`フィールドに`machine`と`deep`の両方を含むドキュメントを検索するには、以下の式を使用します：

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    filter = "TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'deep')"
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    String filter = "TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'deep')";
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    filter := "TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'deep')"
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    const filter = "TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'deep')"
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export filter="\"TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'deep')\""
    ```

    </TabItem>
    </Tabs>

- `text`フィールドに`machine`と`learning`の両方を含みながら`deep`を含まないドキュメントを検索するには、以下の式を使用します：

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    filter = "not TEXT_MATCH(text, 'deep') and TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'learning')"
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    String filter = "not TEXT_MATCH(text, 'deep') and TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'learning')";
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    filter := "not TEXT_MATCH(text, 'deep') and TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'learning')"
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    const filter = "not TEXT_MATCH(text, 'deep') and TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'learning')"
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export filter="\"not TEXT_MATCH(text, 'deep') and TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'learning')\""
    ```

    </TabItem>
    </Tabs>

### テキストマッチによる検索\{#search-with-text-match}

テキストマッチは、検索範囲を狭め、検索パフォーマンスを向上させるためにベクトル類似性検索と組み合わせて使用できます。ベクトル類似性検索の前にテキストマッチを使用してコレクションをフィルタリングすることで、検索する必要のあるドキュメント数を減らし、より高速なクエリ時間を実現できます。

この例では、`filter`式を使用して検索結果を`keyword1`または`keyword2`という指定された用語に一致するドキュメントのみにフィルタリングします。その後、このフィルタリングされたドキュメントのサブセットに対してベクトル類似性検索が実行されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# `keyword1`または`keyword2`に一致するエンティティ
filter = "TEXT_MATCH(text, 'keyword1 keyword2')"

# 'embeddings'がベクトルフィールドで'text'がVARCHARフィールドと仮定
result = client.search(
    collection_name="my_collection", # あなたのコレクション名
    anns_field="embeddings", # ベクトルフィールド名
    data=[query_vector], # クエリベクトル
    filter=filter,
    search_params={"params": {"nprobe": 10}},
    limit=10, # 返す結果の最大数
    output_fields=["id", "text"] # 返すフィールド
)
```

</TabItem>

<TabItem value='java'>

```java
String filter = "TEXT_MATCH(text, 'keyword1 keyword2')";

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("embeddings")
        .data(Collections.singletonList(queryVector)))
        .filter(filter)
        .topK(10)
        .outputFields(Arrays.asList("id", "text"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
filter := "TEXT_MATCH(text, 'keyword1 keyword2')"

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    10,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("embeddings").
    WithFilter(filter).
    WithOutputFields("id", "text"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// `keyword1`または`keyword2`に一致するエンティティ
const filter = "TEXT_MATCH(text, 'keyword1 keyword2')";

// 'embeddings'がベクトルフィールドで'text'がVARCHARフィールドと仮定
const result = await client.search(
    collection_name: "my_collection", // あなたのコレクション名
    anns_field: "embeddings", // ベクトルフィールド名
    data: [query_vector], // クエリベクトル
    filter: filter,
    params: {"nprobe": 10},
    limit: 10, // 返す結果の最大数
    output_fields: ["id", "text"] //返すフィールド
);
```

</TabItem>

<TabItem value='bash'>

```bash
export filter="\"TEXT_MATCH(text, 'keyword1 keyword2')\""

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "annsField": "embeddings",
    "data": [[0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104]],
    "filter": '"$filter"',
    "searchParams": {
        "params": {
            "nprobe": 10
        }
    },
    "limit": 10,
    "outputFields": ["text","id"]
}'
```

</TabItem>
</Tabs>

### テキストマッチによるクエリ\{#query-with-text-match}

テキストマッチはクエリ操作におけるスカラー検索にも使用できます。`query()`メソッドの`expr`パラメータに`TEXT_MATCH`式を指定することで、与えられた用語に一致するドキュメントを取得できます。

以下の例では、`text`フィールドに`keyword1`と`keyword2`の両方の用語を含むドキュメントを取得しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# `keyword1`と`keyword2`の両方に一致するエンティティ
filter = "TEXT_MATCH(text, 'keyword1') and TEXT_MATCH(text, 'keyword2')"

result = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["id", "text"]
)
```

</TabItem>

<TabItem value='java'>

```java
String filter = "TEXT_MATCH(text, 'keyword1') and TEXT_MATCH(text, 'keyword2')";

QueryResp queryResp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("id", "text"))
        .build()
);
```

</TabItem>

<TabItem value='go'>

```go
filter = "TEXT_MATCH(text, 'keyword1') and TEXT_MATCH(text, 'keyword2')"
resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("id", "text"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}

```

</TabItem>

<TabItem value='javascript'>

```javascript
// `keyword1`と`keyword2`の両方に一致するエンティティ
const filter = "TEXT_MATCH(text, 'keyword1') and TEXT_MATCH(text, 'keyword2')";

const result = await client.query(
    collection_name: "my_collection",
    filter: filter,
    output_fields: ["id", "text"]
)
```

</TabItem>

<TabItem value='bash'>

```bash
export filter="\"TEXT_MATCH(text, 'keyword1') and TEXT_MATCH(text, 'keyword2')\""

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "filter": '"$filter"',
    "outputFields": ["id", "text"]
}'
```

</TabItem>
</Tabs>

## 考慮事項\{#considerations}

- フィールドに対して用語マッチングを有効にすると、逆インデックスの作成がトリガーされ、ストレージリソースを消費します。この機能を有効にする際には、テキストサイズ、ユニークトークン、使用するアナライザーに基づいてストレージへの影響を考慮してください。

- スキーマでアナライザーを定義すると、その設定はそのコレクションに対して永続的になります。異なるアナライザーの方がニーズにより適していると判断した場合、既存のコレクションを削除して、希望するアナライザー構成を持つ新しいコレクションを作成することを検討できます。

- `filter`式内のエスケープルール：

    - 式内で二重引用符または一重引用符で囲まれた文字は、文字列定数として解釈されます。文字列定数にエスケープ文字が含まれる場合、エスケープ文字はエスケープシーケンスで表す必要があります。たとえば、`\\`を使用して`\`を表し、`\\t`を使用してタブ`\t`を表し、`\\n`を使用して改行を表します。

    - 文字列定数が一重引用符で囲まれている場合、定数内の一重引用符は`\\'`で表されるのに対し、二重引用符は`"`または`\\"`のいずれかで表すことができます。例：`'It\\'s milvus'`。

    - 文字列定数が二重引用符で囲まれている場合、定数内の二重引用符は`\\"`で表されるのに対し、一重引用符は`'`または`\\'`のいずれかで表すことができます。例：`"He said \\"Hi\\""`.