---
title: "Text Match | BYOC"
slug: /text-match
sidebar_label: "テキストマッチ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のテキストマッチでは、特定の用語に基づいて正確にドキュメントを取得できます。この機能は主に、特定の条件を満たすためのフィルタ付き検索に使用され、クエリ結果を絞り込むために scalar フィルタリングを組み合わせることができます。これにより、scalar 条件を満たす vector 内で類似検索を実行できます。 | BYOC"
type: origin
token: RQQKwqhZUiubFzkHo4WcR62Gnvh
sidebar_position: 13
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Text Match

Zilliz Cloud のテキストマッチでは、特定の用語に基づいて正確にドキュメントを取得できます。この機能は主に、特定の条件を満たすためのフィルタ付き検索に使用され、クエリ結果を絞り込むために scalar フィルタリングを組み合わせることができます。これにより、scalar 条件を満たす vector 内で類似検索を実行できます。

<Admonition type="info" icon="📘" title="注意">

テキストマッチは、一致したドキュメントの関連性をスコアリングすることなく、クエリ用語の完全一致箇所を見つけることに重点を置いています。クエリ用語の意味や重要度に基づいて、最も関連性の高いドキュメントを取得したい場合は、[Full Text Search](./full-text-search) の使用をおすすめします。

</Admonition>

Zilliz Cloud では、プログラムまたは Web コンソール経由でテキストマッチを有効にできます。このページでは、プログラムでテキストマッチを有効にする方法に焦点を当てています。Web コンソールでの操作の詳細については、[Manage Collections (Console)](./manage-collections-console#text-match) を参照してください。

## Overview\{#overview}

Zilliz Cloud は、基盤となる inverted index と用語ベースのテキスト検索を実現するために [Tantivy](https://github.com/quickwit-oss/tantivy) を統合しています。各テキストエントリについて、Zilliz Cloud は以下の手順に従ってインデックス化を行います。

1. [Analyzer](./analyzer-overview): analyzer は入力テキストを個々の単語、すなわち token に分割し、必要に応じてフィルタを適用して処理します。これにより、Zilliz Cloud はこれらの token に基づく index を構築できます。

1. [Indexing](./indexes): テキスト解析の後、Zilliz Cloud は各一意の token を、その token を含むドキュメントに対応付ける inverted index を作成します。

ユーザーがテキストマッチを実行すると、inverted index を使用して、その用語を含むすべてのドキュメントをすばやく取得します。これは各ドキュメントを個別に走査するよりもはるかに高速です。

![N43zw7HuGhmCHRbYDDmctO1bnkd](https://zdoc-images.s3.us-west-2.amazonaws.com/N43zw7HuGhmCHRbYDDmctO1bnkd.png)

## Enable text match\{#enable-text-match}

テキストマッチは [`VARCHAR`](./use-string-field) field type で動作します。これは Zilliz Cloud における文字列データ型です。テキストマッチを有効にするには、collection schema を定義する際に `enable_analyzer` と `enable_match` の両方を `True` に設定し、その後必要に応じてテキスト解析用の [analyzer](./analyzer-overview) を構成します。

### Set `enable_analyzer` and `enable_match`\{#set-enableanalyzer-and-enablematch}

特定の `VARCHAR` field に対してテキストマッチを有効にするには、field schema を定義する際に `enable_analyzer` と `enable_match` の両方のパラメータを `True` に設定します。これにより、Zilliz Cloud はテキストを token 化し、指定された field に対して inverted index を作成するようになり、高速かつ効率的なテキストマッチが可能になります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"id", milvus::DataType::INT64, "", true, true});
schema->AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR).WithMaxLength(1000).EnableAnalyzer(true).EnableMatch(true));
schema->AddField(milvus::FieldSchema("embeddings", milvus::DataType::FLOAT_VECTOR).WithDimension(5));
```

</TabItem>
</Tabs>

### Optional: Configure an analyzer\{#optional-configure-an-analyzer}

キーワードマッチングの性能と精度は、選択した analyzer に依存します。異なる analyzer はさまざまな言語やテキスト構造に合わせて設計されているため、適切なものを選ぶことで、特定のユースケースにおける検索結果に大きな影響を与える可能性があります。

デフォルトでは、Zilliz Cloud は `standard` analyzer を使用します。これは空白と句読点に基づいてテキストを token 化し、40 文字を超える token を削除し、テキストを小文字に変換します。このデフォルト設定を適用するために追加のパラメータは不要です。詳細については、[Standard](./standard-analyzer) を参照してください。

別の analyzer が必要な場合は、`analyzer_params` パラメータを使用して構成できます。たとえば、英語テキストの処理に `english` analyzer を適用するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {{"type", "english"}};

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"id", milvus::DataType::INT64, "", true, true});
schema->AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR).WithMaxLength(1000)
                    .EnableAnalyzer(true).EnableMatch(true).WithAnalyzerParams(analyzer_params));
schema->AddField(milvus::FieldSchema("embeddings", milvus::DataType::FLOAT_VECTOR).WithDimension(5));
```

</TabItem>
</Tabs>

Zilliz Cloud は、異なる言語やシナリオに適したさまざまな analyzer も提供しています。詳細については、[Analyzer Overview](./analyzer-overview) を参照してください。

## Use text match\{#use-text-match}

collection schema 内の VARCHAR field に対してテキストマッチを有効にすると、`TEXT_MATCH` 式を使用してテキストマッチを実行できます。

### TEXT_MATCH expression syntax\{#textmatch-expression-syntax}

`TEXT_MATCH` 式は、検索対象の field と検索する用語を指定するために使用されます。構文は次のとおりです。

```python
TEXT_MATCH(field_name, text)
```

- `field_name`: 検索対象の VARCHAR field の名前。

- `text`: 検索する用語。複数の用語は、言語や構成された analyzer に応じて、スペースまたはその他の適切な区切り文字で区切ることができます。

デフォルトでは、`TEXT_MATCH` は **OR** のマッチングロジックを使用します。つまり、指定した用語のいずれかを含むドキュメントを返します。たとえば、`text` field 内で `machine` または `deep` という用語を含むドキュメントを検索するには、次の式を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
const auto filter = R"(TEXT_MATCH(text, "machine deep"))";
```

</TabItem>
</Tabs>

複数の `TEXT_MATCH` 式を論理演算子で組み合わせて、**AND** マッチングを実行することもできます。 

- `text` field 内で `machine` と `deep` の両方を含むドキュメントを検索するには、次の式を使用します。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

    <TabItem value='c++'>

    ```c++
    const auto filter = R"(TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'deep'))";
    ```

    </TabItem>
    </Tabs>

- `text` field 内で `machine` と `learning` の両方を含み、`deep` は含まないドキュメントを検索するには、次の式を使用します。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

    <TabItem value='c++'>

    ```c++
    const auto filter = R"(not TEXT_MATCH(text, 'deep') and TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'learning'))";
    ```

    </TabItem>
    </Tabs>

### Search with text match\{#search-with-text-match}

テキストマッチは、vector 類似検索と組み合わせて使用することで、検索範囲を絞り込み、検索性能を向上させることができます。vector 類似検索の前にテキストマッチで collection をフィルタリングすることで、検索対象となるドキュメント数を減らし、クエリ時間を短縮できます。

この例では、`filter` 式によって、指定した用語 `keyword1` または `keyword2` に一致するドキュメントのみが検索結果に含まれるようにフィルタリングしています。その後、このフィルタ済みのドキュメント部分集合に対して vector 類似検索が実行されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Match entities with `keyword1` or `keyword2`
filter = "TEXT_MATCH(text, 'keyword1 keyword2')"

# Assuming 'embeddings' is the vector field and 'text' is the VARCHAR field
result = client.search(
    collection_name="my_collection", # Your collection name
    anns_field="embeddings", # Vector field name
    data=[query_vector], # Query vector
    # highlight-next-line
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
        // highlight-next-line
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
    // highlight-next-line
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
--header "Request-Timeout: 10" \
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

<TabItem value='c++'>

```c++
const auto filter = R"(TEXT_MATCH(text, 'keyword1 keyword2'))";
std::vector<float> query_vector = {0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104};
auto request = milvus::SearchRequest()
                   .WithCollectionName("my_collection")
                   .WithAnnsField("embeddings")
                   .WithFilter(filter)
                   .WithLimit(10)
                   .AddOutputField("text")
                   .AddOutputField("id")
                   .AddFloatVector(query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### テキストマッチを使用したクエリ\{#query-with-text-match}

テキストマッチは、クエリ操作における scalar フィルタリングにも使用できます。`query()` メソッドの `expr` パラメータに `TEXT_MATCH` 式を指定することで、指定された用語に一致するドキュメントを取得できます。

以下の例では、`text` フィールドに `keyword1` と `keyword2` の両方が含まれるドキュメントを取得します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Match entities with both `keyword1` and `keyword2`
filter = "TEXT_MATCH(text, 'keyword1') and TEXT_MATCH(text, 'keyword2')"

result = client.query(
    collection_name="my_collection",
    # highlight-next-line
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
        // highlight-next-line
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
    // highlight-next-line
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
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "filter": '"$filter"',
    "outputFields": ["id", "text"]
}'
```

</TabItem>

<TabItem value='c++'>

```c++
const auto filter = R"(TEXT_MATCH(text, 'keyword1') and TEXT_MATCH(text, 'keyword2'))";

auto request = milvus::QueryRequest()
                       .WithCollectionName("my_collection")
                       .WithFilter(filter)
                       .AddOutputField("id")
                       .AddOutputField("text");

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## 考慮事項\{#considerations}

- フィールドに対して用語マッチングを有効にすると、反転 index が作成され、ストレージリソースを消費します。この機能を有効にするかどうかを判断する際には、ストレージへの影響を考慮してください。影響は、テキストサイズ、一意のトークン数、使用する analyzer によって異なります。

- スキーマで analyzer を定義すると、その設定はその collection に対して永続的になります。別の analyzer の方が要件に適していると判断した場合は、既存の collection を削除し、目的の analyzer 設定で新しい collection を作成することを検討してください。

- フレーズマッチのパフォーマンスは、テキストがどのようにトークン化されるかに依存します。analyzer を collection 全体に適用する前に、`run_analyzer` メソッドを使用してトークン化の出力を確認してください。詳細については、[Analyzer Overview](./analyzer-overview#built-in-analyzer) を参照してください。

- `filter` 式におけるエスケープ規則:

    - 式内でダブルクォートまたはシングルクォートで囲まれた文字は、文字列定数として解釈されます。文字列定数にエスケープ文字が含まれている場合、エスケープ文字はエスケープシーケンスで表現する必要があります。たとえば、`\` を表すには `\\`、タブ `\t` を表すには `\\t`、改行を表すには `\\n` を使用します。

    - 文字列定数がシングルクォートで囲まれている場合、定数内のシングルクォートは `\\'` として表現する必要があります。一方、ダブルクォートは `"` または `\\"` のいずれでも表現できます。例: `'It\\'s milvus'`。

    - 文字列定数がダブルクォートで囲まれている場合、定数内のダブルクォートは `\\"` として表現する必要があります。一方、シングルクォートは `'` または `\\'` のいずれでも表現できます。例: `"He said \\"Hi\\""`。

