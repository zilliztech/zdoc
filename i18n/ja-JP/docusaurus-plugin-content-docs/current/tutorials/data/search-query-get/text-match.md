---
title: "テキスト一致 | Cloud"
slug: /text-match
sidebar_label: "テキスト一致"
beta: FALSE
notebook: FALSE
description: "テキストマッチZillizクラウド特定の用語に基づく正確なドキュメント検索を可能にします。この機能は、特定の条件を満たすために主にフィルタリングされた検索に使用され、スカラーフィルタリングを組み込んでクエリ結果を絞り込むことができ、スカラー基準を満たすベクトル内の類似検索を可能にします。 | Cloud"
type: origin
token: RQQKwqhZUiubFzkHo4WcR62Gnvh
sidebar_position: 10
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - filter
  - filtering expressions
  - filtering
  - text-match
  - knn
  - Image Search
  - LLMs
  - Machine Learning

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# テキスト一致

テキストマッチZillizクラウド特定の用語に基づく正確なドキュメント検索を可能にします。この機能は、特定の条件を満たすために主にフィルタリングされた検索に使用され、スカラーフィルタリングを組み込んでクエリ結果を絞り込むことができ、スカラー基準を満たすベクトル内の類似検索を可能にします。

<Admonition type="info" icon="📘" title="ノート">

<p>テキストマッチは、一致したドキュメントの関連性をスコアリングせずに、クエリ用語の正確な出現を見つけることに焦点を当てています。クエリ用語の意味と重要性に基づいて最も関連性の高いドキュメントを取得する場合は、<a href="./full-text-search">フルテキスト検索</a>を使用することをお勧めします。</p>

</Admonition>

Zilliz Cloudは、プログラムまたはWebコンソールを介してテキストマッチを有効にすることをサポートしています。このページでは、プログラムでテキストマッチを有効にする方法について説明します。Webコンソールでの操作の詳細については、[コレクションの管理(コンソール)](./manage-collections-console#text-match)を参照してください。

</include>

## 概要について{#overview}

Zillizクラウド[タンティヴィ](https://github.com/quickwit-oss/tantivy)を統合して、基礎となる転置インデックスと用語ベースのテキスト検索を強化します。各テキストエントリについて、Zillizクラウドプロシージャに従ってインデックス化します:

1. [アナライザ](./analyzer-overview):アナライザは、入力テキストを個々の単語またはトークンにトークン化し、必要に応じてフィルタを適用して処理します。これにより、Zillizクラウドこれらのトークンに基づいてインデックスを構築する。

1. リンク_PLACEHOLDER_0テキスト分析の後、Zillizクラウド各一意のトークンを含むドキュメントにマップする反転インデックスを作成します。

ユーザーがテキストマッチを実行すると、転置インデックスが使用され、用語を含むすべてのドキュメントが迅速に取得されます。これは、各ドキュメントを個別にスキャンするよりもはるかに高速です。

![N43zw7HuGhmCHRbYDDmctO1bnkd](/img/N43zw7HuGhmCHRbYDDmctO1bnkd.png)

## テキストマッチを有効にする{#enable-text-match}

`VARCHAR`フィールドタイプでテキストマッチが機能します。これは基本的に文字列データ型ですZillizクラウドテキストの一致を有効にするには、`enable_analyzer`と`enable_match`の両方を`True`に設定し、コレクションスキーマを定義する際にテキスト解析用の[アナライザ](./analyzer-overview)をオプションで構成します。

### `enable_analyzer`と`enable_match`を設定してください。{#set-inlinecodeplaceholder0-and-inlinecodeplaceholder1}

特定の`VARCHAR`フィールドのテキストマッチを有効にするには、フィールドスキーマを定義する際に、`enable_analyzer`と`enable_match`の両方のパラメータを`True`に設定します。これにより、Zillizクラウドテキストをトークン化し、指定されたフィールドの反転インデックスを作成して、高速かつ効率的なテキスト一致を可能にします。

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
    enable_analyzer=True, # Whether to enable text analysis for this field
    enable_match=True # Whether to enable text match
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

### 任意:アナライザを設定する{#optional-configure-an-analyzer}

キーワードマッチングのパフォーマンスと精度は、選択したアナライザに依存します。異なるアナライザは、さまざまな言語やテキスト構造に合わせて調整されているため、適切なアナライザを選択すると、特定のユースケースの検索結果に大きな影響を与える可能性があります。

デフォルトでは、Zillizクラウド`standard`アナライザを使用します。これは、空白と句読点に基づいてテキストをトークン化し、40文字を超えるトークンを削除し、テキストを小文字に変換します。このデフォルト設定を適用するために追加のパラメータは必要ありません。詳細については、[スタンダード](./standard-analyzer)を参照してください。

他のアナライザが必要な場合は、`analyzer_params`パラメータを使用して設定できます。例えば、英語のテキストを処理するために`english`アナライザを適用するには、次のようにします。

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

Zillizクラウドまた、異なる言語やシナリオに適したさまざまなアナライザも提供しています。詳細については、[アナライザの概要](./analyzer-overview)を参照してください。

## テキストマッチを使用{#use-text-match}

コレクションスキーマのVARCHARフィールドのテキスト一致を有効にしたら、`TEXT_MATCH`式を使用してテキスト一致を実行できます。

### TEXT_MATCH式の構文{#textmatch-expression-syntax}

`TEXT_MATCH`式は、検索するフィールドと用語を指定するために使用されます。その構文は以下の通りです:

```python
TEXT_MATCH(field_name, text)
```

- `field_name`:検索するVARCHARフィールドの名前。

- `text`:検索する用語。複数の用語は、言語と設定されたアナライザに基づいて、スペースまたはその他の適切な区切り文字で区切ることができます。

デフォルトでは、`TEXT_MATCH`は**OR**マッチングロジックを使用します。つまり、指定された用語のいずれかを含むドキュメントを返します。たとえば、`text`フィールドで`machine`または`deep`という用語を含むドキュメントを検索するには、次の式を使用します

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

- `text`フィールドで`machine`と`deep`の両方を含むドキュメントを検索するには、次の式を使用します。

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

- `text`フィールドに`machine`と`learning`の両方を含み、`deep`を含まないドキュメントを検索するには、次の式を使用します。

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

### テキスト一致で検索{#search-with-text-match}

テキスト一致は、ベクトル類似検索と組み合わせて使用することで、検索範囲を狭め、検索パフォーマンスを向上させることができます。ベクトル類似検索の前にテキスト一致を使用してコレクションをフィルタリングすることで、検索する必要があるドキュメントの数を減らし、クエリ時間を短縮することができます。

この例では、`filter`式は、指定された用語`keyword1`または`keyword2`に一致するドキュメントのみを含むように検索結果をフィルタリングします。その後、このフィルタリングされたドキュメントのサブセットに対してベクトル類似性検索が実行されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Match entities with `keyword1` or `keyword2`
filter = "TEXT_MATCH(text, 'keyword1 keyword2')"

# Assuming 'embeddings' is the vector field and 'text' is the VARCHAR field
result = client.search(
    collection_name="my_collection", # Your collection name
    anns_field="embeddings", # Vector field name
    data=[query_vector], # Query vector
    filter=filter,
    search_params={"params": {"nprobe": 10}},
    limit=10, # Max. number of results to return
    output_fields=["id", "text"] # Fields to return
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
// Match entities with `keyword1` or `keyword2`
const filter = "TEXT_MATCH(text, 'keyword1 keyword2')";

// Assuming 'embeddings' is the vector field and 'text' is the VARCHAR field
const result = await client.search(
    collection_name: "my_collection", // Your collection name
    anns_field: "embeddings", // Vector field name
    data: [query_vector], // Query vector
    filter: filter,
    params: {"nprobe": 10},
    limit: 10, // Max. number of results to return
    output_fields: ["id", "text"] //Fields to return
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

### テキストが一致するクエリ{#query-with-text-match}

テキストの一致は、クエリ操作のスカラーフィルタリングにも使用できます。`query()`メソッドの`expr`パラメーターに`TEXT_MATCH`式を指定することで、指定された用語に一致するドキュメントを取得できます。

以下の例では、`text`フィールドに`keyword1`と`keyword2`の両方の用語が含まれているドキュメントを取得します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Match entities with both `keyword1` and `keyword2`
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
// Match entities with both `keyword1` and `keyword2`
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

## 考慮事項{#considerations}

- フィールドの用語マッチングを有効にすると、ストレージリソースを消費する反転インデックスが作成されます。この機能を有効にする場合は、テキストの体格、一意のトークン、使用するアナライザによって異なるため、ストレージへの影響を考慮してください。

- スキーマにアナライザを定義すると、その設定はそのコレクションに対して永続的になります。別のアナライザが必要に応じて適していると判断した場合は、既存のコレクションを削除して、希望のアナライザ構成で新しいコレクションを作成することを検討してください。

- フレーズマッチのパフォーマンスは、テキストのトークン化方法に依存します。コレクション全体にアナライザーを適用する前に、`run_analyzer`メソッドを使用してトークン化出力を確認してください。詳細については、[アナライザの概要](./analyzer-overview#built-in-analyzer)を参照してください。

</include>

- `filter`式のエスケープルール:

    - 二重引用符または単一引用符で囲まれた文字は、文字列定数として解釈されます。文字列定数にエスケープ文字が含まれている場合、エスケープ文字はエスケープシーケンスで表現する必要があります。たとえば、`\\`を使用して`\`を表し、`\\t`を使用してタブ`\t`を表し、`\\n`を使用して改行を表します。

    - 文字列定数がシングルクォートで囲まれている場合、定数内のシングルクォートは`\\'`として表現され、ダブルクォートは`"`または`\\"`として表現できます。例: `'It\\'s milvus'`。

    - 文字列定数が二重引用符で囲まれている場合、定数内の二重引用符は`\\"`として表され、単一引用符は`'`または`\\'`として表されます。例: `"He said \\"Hi\\""`。

