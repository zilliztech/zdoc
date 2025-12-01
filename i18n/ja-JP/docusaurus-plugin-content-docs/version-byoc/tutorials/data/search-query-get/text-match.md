---
title: "テキスト一致 | BYOC"
slug: /text-match
sidebar_label: "テキスト一致"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudのテキスト一致機能により、特定の語句に基づいた正確なドキュメント検索が可能になります。この機能は主に特定の条件を満たすためのフィルター検索に使用され、スカラー値のフィルタリングを組み込んでクエリ結果を絞り込むことができ、スカラー基準を満たすベクトル内で類似性検索を可能にします。 | BYOC"
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
  - フィルター式
  - フィルタリング
  - テキスト一致
  - オープンソースベクトルデータベース
  - ベクトルデータベース例
  - RAGベクトルデータベース
  - ベクトルデータベースとは

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# テキスト一致

Zilliz Cloudのテキスト一致機能により、特定の語句に基づいた正確なドキュメント検索が可能になります。この機能は主に特定の条件を満たすためのフィルター検索に使用され、スカラー値のフィルタリングを組み込んでクエリ結果を絞り込むことができ、スカラー基準を満たすベクトル内で類似性検索を可能にします。

<Admonition type="info" icon="📘" title="注釈">

<p>テキスト一致はクエリ語句の正確な出現箇所を検索することに重点を置いており、一致したドキュメントの関連性を評価しません。クエリ語句のセマンティックな意味や重要性に基づいて最も関連性のあるドキュメントを検索したい場合は、<a href="./full-text-search">全文検索</a>をご使用ください。</p>

</Admonition>

Zilliz Cloudでは、プログラマチックにテキスト一致を有効にするか、Webコンソール経由で有効にすることができます。このページでは、プログラマチックにテキスト一致を有効にする方法に重点を置いています。Webコンソールでの操作の詳細については、[コレクションの管理（コンソール）](./manage-collections-console#text-match)を参照してください。

## 概要\{#overview}

Zilliz Cloudは[Tantivy](https://github.com/quickwit-oss/tantivy)を統合し、その基盤となる逆インデックスと語句ベースのテキスト検索を実現しています。各テキストエントリについて、Zilliz Cloudは以下の手順でインデックス作成を行います：

1. [アナライザー](./analyzer-overview): アナライザーは入力テキストを個々の単語やトークンにトークナイズし、必要に応じてフィルターを適用して処理します。これにより、Zilliz Cloudはこれらのトークンに基づいてインデックスを構築できます。

1. [インデックス作成](./manage-indexes): テキスト分析後、Zilliz Cloudは各固有のトークンをそのトークンを含むドキュメントにマッピングする逆インデックスを作成します。

ユーザーがテキスト一致を実行すると、逆インデックスが使用されて、条件を満たすすべてのドキュメントを迅速に検索できます。これは、各ドキュメントを個別にスキャンするよりもはるかに高速です。

![N43zw7HuGhmCHRbYDDmctO1bnkd](/img/N43zw7HuGhmCHRbYDDmctO1bnkd.png)

## テキスト一致の有効化\{#enable-text-match}

テキスト一致は[ZILLIZのVARCHAR](./use-string-field)フィールドタイプで動作し、これはZilliz Cloudの文字列データ型です。テキスト一致を有効にするには、`enable_analyzer`と`enable_match`の両方を`True`に設定し、オプションでコレクションスキーマを定義する際に[アナライザー](./analyzer-overview)を設定してテキスト分析を構成します。

### `enable_analyzer`と`enable_match`の設定\{#set-enableanalyzer-and-enablematch}

特定の`VARCHAR`フィールドに対してテキスト一致を有効にするには、フィールドスキーマを定義する際に`enable_analyzer`パラメータと`enable_match`パラメータの両方を`True`に設定してください。これにより、Zilliz Cloudはテキストをトークナイズし、指定されたフィールドに対して逆インデックスを作成するよう指示され、高速で効率的なテキスト一致が可能になります。

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
    enable_analyzer=True, # テキスト分析をこのフィールドに対して有効にするかどうか
    enable_match=True # テキスト一致を有効にするかどうか
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

### オプション：アナライザーの構成\{#optional-configure-an-analyzer}

キーワード一致のパフォーマンスと精度は、選択されたアナライザーに依存します。さまざまな言語やテキスト構造に合わせてさまざまなアナライザーが最適化されており、そのため適切なものを選ぶことが特定の使用ケースにおける検索結果に大きな影響を与える可能性があります。

デフォルトで、Zilliz Cloudは`standard`アナライザーを使用し、これは空白文字と句読点に基づいてテキストをトークナイズし、40文字より長いトークンを削除し、テキストを小文字に変換します。このデフォルト設定を適用するには追加のパラメータは必要ありません。詳細については、[Standard](./standard-analyzer)を参照してください。

異なるアナライザーが必要な場合は、`analyzer_params`パラメータを使用して構成できます。たとえば、英語テキストを処理するための`english`アナライザーを適用するには：

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

Zilliz Cloudはまた、さまざまな言語やシナリオに適したさまざまなアナライザーを提供しています。詳細については、[Analyzer Overview](./analyzer-overview)を参照してください。

## テキスト一致の使用\{#use-text-match}

コレクションスキーマでVARCHARフィールドに対してテキスト一致を有効にした後、`TEXT_MATCH`式を使用してテキスト一致を実行できます。

### TEXT_MATCH式の構文\{#textmatch-expression-syntax}

`TEXT_MATCH`式は、検索するフィールドと検索語句を指定するために使用されます。その構文は以下の通りです：

```python
TEXT_MATCH(field_name, text)
```

- `field_name`: 検索するVARCHARフィールドの名前です。

- `text`: 検索する語句です。複数の語句は、言語と構成されたアナライザーに基づいてスペースまたはその他の適切な区切り文字で区切ることができます。

デフォルトでは、`TEXT_MATCH`は**OR**マッチング論理を使用し、指定された語句のいずれかを含むドキュメントを返します。たとえば、`text`フィールドで`machine`または`deep`を含むドキュメントを検索するには、以下の式を使用します：

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

論理演算子を使用して複数の`TEXT_MATCH`式を組み合わせて**AND**一致を実行することもできます。

- `text`フィールドで`machine`と`deep`の両方を含むドキュメントを検索するには、以下の式を使用します：

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

- `text`フィールドで`machine`と`learning`の両方を含むが`deep`を含まないドキュメントを検索するには、以下の式を使用します：

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
    const filter = "not TEXT_MATCH(text, 'deep') and TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'learning')";
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export filter="\"not TEXT_MATCH(text, 'deep') and TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'learning')\""
    ```

    </TabItem>
    </Tabs>

### テキスト一致での検索\{#search-with-text-match}

テキスト一致は、ベクトル類似性検索と組み合わせて使用して、検索範囲を狭め、検索パフォーマンスを向上させることができます。ベクトル類似性検索の前にテキスト一致を使用してコレクションをフィルタリングすることで、検索が必要なドキュメント数を削減し、より速いクエリ時間を実現できます。

この例では、`filter`式を使用して検索結果をフィルタリングし、指定された語句`keyword1`または`keyword2`に一致するドキュメントのみを含むようにします。その後、このフィルターされたドキュメントのサブセットに対してベクトル類似性検索が実行されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# `keyword1`または`keyword2`に一致するエンティティをマッチ
filter = "TEXT_MATCH(text, 'keyword1 keyword2')"

# `embeddings`がベクトルフィールド、`text`がVARCHARフィールドだと仮定
result = client.search(
    collection_name="my_collection", # あなたのコレクション名
    anns_field="embeddings", # ベクトルフィールド名
    data=[query_vector], # クエリベクトル
    filter=filter,
    search_params={"params": {"nprobe": 10}},
    limit=10, # 戻り値の最大数
    output_fields=["id", "text"] # 戻り値のフィールド
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
    // handle error
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// `keyword1`または`keyword2`に一致するエンティティをマッチ
const filter = "TEXT_MATCH(text, 'keyword1 keyword2')";

// `embeddings`がベクトルフィールド、`text`がVARCHARフィールドだと仮定
const result = await client.search(
    collection_name: "my_collection", // あなたのコレクション名
    anns_field: "embeddings", // ベクトルフィールド名
    data: [query_vector], // クエリベクトル
    filter: filter,
    params: {"nprobe": 10},
    limit: 10, // 戻り値の最大数
    output_fields: ["id", "text"] //戻り値のフィールド
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

### テキスト一致でのクエリ\{#query-with-text-match}

テキスト一致は、クエリ操作でスカラー値のフィルタリングにも使用できます。`query()`メソッドの`expr`パラメータに`TEXT_MATCH`式を指定することで、指定された語句に一致するドキュメントを取得できます。

以下の例では、`text`フィールドに`keyword1`と`keyword2`の両方の語句を含むドキュメントを取得しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# `keyword1`と`keyword2`の両方に一致するエンティティをマッチ
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
    // handle error
}

```

</TabItem>

<TabItem value='javascript'>

```javascript
// `keyword1`と`keyword2`の両方に一致するエンティティをマッチ
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

- フィールドに対して語句一致を有効にすると、逆インデックスの作成がトリガーされ、ストレージリソースを消費します。この機能を有効にする際には、テキストサイズ、一意のトークン、および使用されるアナライザーに基づいてストレージへの影響を検討してください。

- スキーマでアナライザーを定義すると、その設定はそのコレクションに対して永続的になります。別のアナライザーの方がニーズにより適していると判断した場合は、既存のコレクションを削除し、望ましいアナライザー構成で新しいコレクションを作成することを検討できます。

- `filter`式でのエスケープルール：

    - 式内で二重引用符または一重引用符で囲まれた文字は、文字列定数として解釈されます。文字列定数にエスケープ文字が含まれている場合、エスケープ文字はエスケープシーケンスで表す必要があります。たとえば、`\\`を`\`、`\\t`をタブ`\t`、`\\n`を改行として使用します。

    - 文字列定数が一重引用符で囲まれている場合、定数内の一重引用符は`\\'`として表される必要があります。一方、二重引用符は`"`または`\\"`として表すことができます。例：`'It\\'s milvus'`。

    - 文字列定数が二重引用符で囲まれている場合、定数内の二重引用符は`\\"`として表される必要があります。一方、一重引用符は`'`または`\\'`として表すことができます。例：`"He said \\"Hi\\"" `。