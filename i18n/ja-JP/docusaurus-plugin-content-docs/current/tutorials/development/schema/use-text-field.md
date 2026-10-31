---
title: "テキストフィールド | Cloud"
slug: /use-text-field
sidebar_label: "テキストフィールド"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "AI 検索アプリケーションでは、ベクトル検索によって意味的に類似するエンティティを見つけられますが、アプリケーションは多くの場合、各一致結果の背後にある元のソーステキストも必要とします。LLM またはエージェントは、そのテキストをコンテキストとして使用し、読み取り、引用、要約したり、プロンプトに含めたりできます。 | Cloud"
type: origin
token: GBynwwkyBihIHukvJXfc76dMnth
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# テキストフィールド

AI 検索アプリケーションでは、ベクトル検索によって意味的に類似するエンティティを見つけられますが、アプリケーションは多くの場合、各一致結果の背後にある元のソーステキストも必要とします。LLM またはエージェントは、そのテキストをコンテキストとして使用し、読み取り、引用、要約したり、プロンプトに含めたりできます。

Zilliz Cloud では、長いソーステキストをエンティティとともに直接保存するための `TEXT` スカラーフィールド型を提供しています。一般的な値には、パッセージ、長いドキュメント、記事本文、チケット、ログなどがあります。固定の `max_length` が必要な `VARCHAR` とは異なり、`TEXT` ではコレクションスキーマで最大バイト長を設定する必要はありません。

コレクションスキーマで `TEXT` フィールドを定義するには、`datatype` を `DataType.TEXT` に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
schema = client.create_schema(auto_id=False, enable_dynamic_field=False)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(
    field_name="content",
    # highlight-next-line
    datatype=DataType.TEXT,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder().build();
schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("content")
        .dataType(DataType.Text)
        .enableAnalyzer(true)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"
)

schema := entity.NewSchema().WithDynamicFieldEnabled(false).
    WithField(entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
    WithField(entity.NewField().
        WithName("content").
        WithDataType(entity.FieldTypeText).
        WithEnableAnalyzer(true))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let mut schema = CollectionSchema::new();
schema = schema.add_field(
    FieldSchema::new()
        .name("content")
        .data_type(DataType::Text)
        .enable_analyzer(true),
);
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

milvus::FieldSchema content_field("content", milvus::DataType::TEXT);
content_field.EnableAnalyzer(true);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });
const schema = [
    { name: "id", data_type: DataType.Int64, is_primary_key: true },
    { name: "content", data_type: DataType.Text, enable_analyzer: true },
];
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Types;

var schema = new CollectionSchema
{
    Name = "text_bm25_collection",
    EnableDynamicFields = false
};

// DataType.Text is an alias of VarChar with analyzer support for full-text search
schema.Fields.Add(FieldSchema.CreateVarchar("content", maxLength: 65535, enableAnalyzer: true, enableMatch: true));
```

</TabItem>

<TabItem value='bash'>

```bash
export contentField='{
    "fieldName": "content",
    "dataType": "Text",
    "elementTypeParams": {
        "enable_analyzer": true
    }
}'
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

フィールドを定義した後、各エンティティにはそのフィールドの文字列値を含めることができます。値は他のスカラーフィールドと同様に挿入し、`output_fields` にフィールドを指定することで、クエリまたは検索結果から返すことができます。

<Admonition type="info" title="Notes">

TEXT フィールドは null 値をサポートしています。この機能を有効にするには、nullable を True に設定します。詳細については、[Nullable Fields](./nullable-fields) を参照してください。

</Admonition>

## 制限\{#limits}

- `TEXT` フィールドを主フィールドにすることはできません。主フィールドは `INT64` と `VARCHAR` をサポートしています。

- `TEXT` フィールドは `PHRASE_MATCH` をサポートしていません。

- `TEXT` フィールドはデフォルト値をサポートしていません。

- `TEXT` フィールドはスカラーインデックスをサポートしていません。

- `TEXT` は通常のメタデータフィルタリングを目的としたものではありません。短い文字列メタデータでフィルタリングする必要があり、フィールド値が `VARCHAR` の長さ制限内に収まる場合は、`VARCHAR` を使用してください。

- 外部コレクションでは `TEXT` フィールドはサポートされていません。

## TEXT または VARCHAR を選択する\{#choose-text-or-varchar}

`TEXT` と `VARCHAR` はどちらも文字列値を保存しますが、サポートするアプリケーションのニーズは異なります。`VARCHAR` は、エンティティを識別、分類、フィルタリングするための短く上限のあるメタデータに使用します。`TEXT` は、LLM またはエージェントが読み取り、引用、要約、あるいはプロンプトを構築するための十分なコンテキストを得られる、より長いソースコンテンツに使用します。

| **観点** | **`VARCHAR`** | **`TEXT`** |
| --- | --- | --- |
| 最適な用途 | エンティティを識別、分類、フィルタリングするために使用する短いメタデータ。例: `title`、`tag`、`category`、`external_id`。 | LLM またはエージェントのワークフローで使用するより長いソースコンテンツ。例: `content`、`passage`、`article_body`、`log_message`。 |
| 長さの設定 | フィールドが保存できる最大バイト数を定義する `max_length` が必要です。最大値は 65,535 バイトです。値がこの制限を超える可能性がある場合は、`TEXT` を使用します。 | `max_length` が不要なため、スキーマでテキスト値の固定バイト制限を設定する必要はありません。 |
| ストレージの動作 | 各値をフィールドの設定済み `max_length` 内に保存します。 | より大きなテキスト値には自動ストレージ選択を使用します。 |
| 主フィールドのサポート | 主フィールドとして使用できます。 | 主フィールドとして使用できません。 |
| フィルタリング | `category == "news"` や `tag in ["ai", "database"]` など、フィルタ式に含める必要がある短い文字列メタデータに使用します。 | 通常のメタデータフィルタリングを目的としたものではありません。 |

`VARCHAR` フィールドの詳細については、[VARCHAR Field](https://milvus.io/docs/string.md) を参照してください。

`TEXT` の一般的な用途は、BM25 を使用した全文検索です。このパターンでは、`TEXT` フィールドに元のソースコンテンツを保存し、BM25 がテキストを分析して、キーワードに基づく一致をランク付けするためのスパースベクトルを生成します。検索結果は、LLM またはエージェントのワークフローのコンテキストとして一致した `TEXT` 値を返すことができます。次の例は、`TEXT` フィールドを BM25 の入力フィールドとして使用する方法を示しています。全文検索の概念とクエリオプションについては、[Full Text Search](./full-text-search) を参照してください。

## ステップ 1：TEXT フィールドを含むコレクションを作成する\{#step-1-create-a-collection-with-a-text-field}

次の例では、ソースコンテンツ用の `TEXT` フィールドと、BM25 で生成されたスパースベクトル用のスパースベクトルフィールドを含むコレクションを作成します。BM25 関数は、`content` からトークン化されたテキストを、`sparse` に保存されるスパースベクトルに変換します。

BM25 全文検索では、入力 `TEXT` フィールドに `enable_analyzer=True` を設定する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, Function, FunctionType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
COLLECTION_NAME = "text_bm25_collection"

if client.has_collection(COLLECTION_NAME):
    client.drop_collection(COLLECTION_NAME)

schema = client.create_schema(auto_id=False, enable_dynamic_field=False)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
# highlight-start
schema.add_field(
    field_name="content",
    datatype=DataType.TEXT,
    enable_analyzer=True,
)
# highlight-end
schema.add_field(field_name="sparse", datatype=DataType.SPARSE_FLOAT_VECTOR)

# highlight-start
bm25_function = Function(
    name="content_bm25",
    input_field_names=["content"],
    output_field_names=["sparse"],
    function_type=FunctionType.BM25,
)
schema.add_function(bm25_function)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import java.util.*;
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionReq;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

String COLLECTION_NAME = "text_bm25_collection";
client.dropCollection(DropCollectionReq.builder()
        .collectionName(COLLECTION_NAME)
        .async(false)
        .build());

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .build();
schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("content")
        .dataType(DataType.Text)
        .enableAnalyzer(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("sparse")
        .dataType(DataType.SparseFloatVector)
        .build());

schema.addFunction(CreateCollectionReq.Function.builder()
        .name("content_bm25")
        .functionType(FunctionType.BM25)
        .inputFieldNames(Collections.singletonList("content"))
        .outputFieldNames(Collections.singletonList("sparse"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

const COLLECTION_NAME = "text_bm25_collection"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    log.Fatal(err)
}
defer cli.Close(ctx)

if has, _ := cli.HasCollection(ctx, milvusclient.NewHasCollectionOption(COLLECTION_NAME)); has {
    _ = cli.DropCollection(ctx, milvusclient.NewDropCollectionOption(COLLECTION_NAME))
}

schema := entity.NewSchema().WithDynamicFieldEnabled(false).
    WithField(entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
    WithField(entity.NewField().WithName("content").WithDataType(entity.FieldTypeText).WithEnableAnalyzer(true)).
    WithField(entity.NewField().WithName("sparse").WithDataType(entity.FieldTypeSparseVector)).
    WithFunction(entity.NewFunction().
        WithName("content_bm25").
        WithType(entity.FunctionTypeBM25).
        WithInputFields("content").
        WithOutputFields("sparse"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(
    &ConnectConfig::new()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN"),
)
.await?;

let collection_name = "text_bm25_collection";

if client
    .has_collection(
        HasCollectionRequest::builder()
            .collection_name(collection_name)
            .build()?,
    )
    .await?
    .exists()
{
    client
        .drop_collection(
            DropCollectionRequest::builder()
                .collection_name(collection_name)
                .build()?,
        )
        .await?;
}

let schema = CollectionSchema::new()
    .add_field(
        FieldSchema::new()
            .name("id")
            .data_type(DataType::Int64)
            .primary_key(true),
    )
    .add_field(
        FieldSchema::new()
            .name("content")
            .data_type(DataType::Text)
            .enable_analyzer(true),
    )
    .add_field(
        FieldSchema::new()
            .name("sparse")
            .data_type(DataType::SparseFloatVector),
    )
    .add_function(
        Function::new()
            .name("content_bm25")
            .function_type(FunctionType::Bm25)
            .input_fields(["content"])
            .output_fields(["sparse"]),
    );
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <memory>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const std::string COLLECTION_NAME = "text_bm25_collection";
milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->SetEnableDynamicField(false);
schema->AddField(milvus::FieldSchema("id", milvus::DataType::INT64, "", true));
schema->AddField(milvus::FieldSchema("content", milvus::DataType::TEXT).EnableAnalyzer(true));
schema->AddField(milvus::FieldSchema("sparse", milvus::DataType::SPARSE_FLOAT_VECTOR));

auto function = std::make_shared<milvus::Function>("content_bm25", milvus::FunctionType::BM25);
function->AddInputFieldName("content");
function->AddOutputFieldName("sparse");
schema->AddFunction(function);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType, FunctionType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });
const COLLECTION_NAME = "text_bm25_collection";

if (await client.hasCollection({ collection_name: COLLECTION_NAME })) {
    await client.dropCollection({ collection_name: COLLECTION_NAME });
}

const schema = [
    { name: "id", data_type: DataType.Int64, is_primary_key: true },
    { name: "content", data_type: DataType.Text, enable_analyzer: true },
    { name: "sparse", data_type: DataType.SparseFloatVector }
];

const functions = [{
    name: "content_bm25",
    type: FunctionType.BM25,
    input_field_names: ["content"],
    output_field_names: ["sparse"],
    params: {}
}];
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Types;

var config = new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT"
};
using var client = new MilvusClientV2(config);
await client.ConnectAsync();

const string COLLECTION_NAME = "text_bm25_collection";

if ((await client.HasCollectionAsync(new HasCollectionReq { CollectionName = COLLECTION_NAME })).Has)
{
    await client.DropCollectionAsync(new DropCollectionReq { CollectionName = COLLECTION_NAME });
}

var schema = new CollectionSchema { Name = COLLECTION_NAME };
schema.Fields.Add(new FieldSchema("id", DataType.Int64, isPrimaryKey: true));
// DataType.Text is an alias of VarChar with analyzer support for full-text search
schema.Fields.Add(FieldSchema.CreateVarchar("content", maxLength: 65535, enableAnalyzer: true, enableMatch: true));
schema.Fields.Add(new FieldSchema("sparse", DataType.SparseFloatVector));
schema.Functions.Add(FunctionSchema.CreateBm25("content_bm25", "content", "sparse"));
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"
export COLLECTION_NAME="text_bm25_collection"

# Drop an old copy if this example is run repeatedly.
curl --request POST \
--url "${BASE_URL}/v2/vectordb/collections/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{\"collectionName\": \"${COLLECTION_NAME}\"}"

export schema='{
    "fields": [
        {"fieldName": "id", "dataType": "Int64", "isPrimary": true},
        {"fieldName": "content", "dataType": "Text", "elementTypeParams": {"enable_analyzer": true}},
        {"fieldName": "sparse", "dataType": "SparseFloatVector"}
    ],
    "functions": [
        {
            "name": "content_bm25",
            "type": "BM25",
            "inputFieldNames": ["content"],
            "outputFieldNames": ["sparse"]
        }
    ]
}'
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

## ステップ 2：スパースベクトルインデックスを作成する\{#step-2-create-a-sparse-vector-index}

BM25 関数によって生成されたスパースベクトルフィールドにインデックスを作成します。メトリクスタイプは `BM25` に設定する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()
# highlight-start
index_params.add_index(
    field_name="sparse",
    index_type="SPARSE_INVERTED_INDEX",
    metric_type="BM25",
    params={
        "inverted_index_algo": "DAAT_MAXSCORE",
        "bm25_k1": 1.2,
        "bm25_b": 0.75,
    },
)
# highlight-end

client.create_collection(
    collection_name=COLLECTION_NAME,
    schema=schema,
    index_params=index_params,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import java.util.*;

List<IndexParam> indexParams = new ArrayList<>();
Map<String, Object> bm25Params = new HashMap<>();
bm25Params.put("inverted_index_algo", "DAAT_MAXSCORE");
bm25Params.put("bm25_k1", 1.2);
bm25Params.put("bm25_b", 0.75);
indexParams.add(IndexParam.builder()
        .fieldName("sparse")
        .indexName("sparse_bm25_index")
        .indexType(IndexParam.IndexType.SPARSE_INVERTED_INDEX)
        .metricType(IndexParam.MetricType.BM25)
        .extraParams(bm25Params)
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("text_bm25_collection")
        .collectionSchema(schema)
        .indexParams(indexParams)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

sparseIndex := milvusclient.NewCreateIndexOption("text_bm25_collection", "sparse",
    index.NewGenericIndex("sparse", map[string]string{
        index.IndexTypeKey:     string(index.SparseInverted),
        index.MetricTypeKey:    string(entity.BM25),
        "inverted_index_algo":  "DAAT_MAXSCORE",
        "bm25_k1":              "1.2",
        "bm25_b":               "0.75",
    })).WithIndexName("sparse_bm25_index")

err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("text_bm25_collection", schema).
    WithIndexOptions(sparseIndex))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use std::collections::HashMap;

let index_param = IndexParam::new()
    .field_name("sparse")
    .index_type(IndexType::SparseInvertedIndex)
    .metric_type(MetricType::Bm25)
    .extra_params(HashMap::from([
        (
            "inverted_index_algo".to_string(),
            "DAAT_MAXSCORE".to_string(),
        ),
        ("bm25_k1".to_string(), "1.2".to_string()),
        ("bm25_b".to_string(), "0.75".to_string()),
    ]));

client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name(collection_name)
            .schema(schema)
            .build()?,
    )
    .await?;

client
    .create_index(
        CreateIndexRequest::builder()
            .collection_name(collection_name)
            .index_param(index_param)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <utility>
#include <vector>
#include "milvus/MilvusClientV2.h"

std::vector<milvus::IndexDesc> indexes = {
    milvus::IndexDesc("sparse", "sparse_bm25_index", milvus::IndexType::SPARSE_INVERTED_INDEX, milvus::MetricType::BM25)
};

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                      .WithCollectionName("text_bm25_collection")
                                      .WithIndexes(std::move(indexes))
                                      .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [{
    field_name: "sparse",
    index_name: "sparse_bm25_index",
    index_type: "SPARSE_INVERTED_INDEX",
    metric_type: "BM25",
    params: {
        inverted_index_algo: "DAAT_MAXSCORE",
        bm25_k1: 1.2,
        bm25_b: 0.75
    }
}];

const res = await client.createCollection({
    collection_name: "text_bm25_collection",
    schema: schema,
    functions: functions,
    index_params: indexParams
});

console.log(res);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var indexParam = new IndexParam(
    fieldName: "sparse",
    indexType: IndexType.SparseInvertedIndex,
    metricType: MetricType.Bm25)
{
    ExtraParams =
    {
        ["inverted_index_algo"] = "DAAT_MAXSCORE",
        ["bm25_k1"] = 1.2,
        ["bm25_b"] = 0.75
    }
};

await client.CreateCollectionAsync(new CreateCollectionReq
{
    CollectionName = COLLECTION_NAME,
    Schema = schema,
    Indexes = [indexParam]
});
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
    {
        "fieldName": "sparse",
        "indexName": "sparse_bm25_index",
        "indexType": "SPARSE_INVERTED_INDEX",
        "metricType": "BM25",
        "params": {
            "inverted_index_algo": "DAAT_MAXSCORE",
            "bm25_k1": 1.2,
            "bm25_b": 0.75
        }
    }
]'

curl --request POST \
--url "${BASE_URL}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 30" \
-d "{
    \"collectionName\": \"text_bm25_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

## ステップ 3：TEXT データを挿入する\{#step-3-insert-text-data}

`TEXT` フィールドにテキストを直接挿入します。`sparse` フィールドには値を指定しないでください。Milvus は、`content` に BM25 関数を適用して、スパースベクトルを内部的に生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
data = [
    {
        "id": 1,
        "content": "Milvus stores vector embeddings and scalar fields in collections. It supports vector search, full text search, and metadata filtering for retrieval applications.",
    },
    {
        "id": 2,
        "content": "Long documents are often split into passages before embedding. Store each passage in a TEXT field so search results can return the source text.",
    },
    {
        "id": 3,
        "content": "Operational logs and support tickets often contain long natural-language text. TEXT fields can store these values without a fixed max_length setting.",
    },
]

client.insert(collection_name=COLLECTION_NAME, data=data)
client.load_collection(collection_name=COLLECTION_NAME)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;
import java.util.Arrays;
import java.util.List;

Gson gson = new Gson();
List<JsonObject> rows = Arrays.asList(
        gson.fromJson("{\"id\": 1, \"content\": \"Milvus stores vector embeddings and scalar fields in collections. It supports vector search, full text search, and metadata filtering for retrieval applications.\"}", JsonObject.class),
        gson.fromJson("{\"id\": 2, \"content\": \"Long documents are often split into passages before embedding. Store each passage in a TEXT field so search results can return the source text.\"}", JsonObject.class),
        gson.fromJson("{\"id\": 3, \"content\": \"Operational logs and support tickets often contain long natural-language text. TEXT fields can store these values without a fixed max_length setting.\"}", JsonObject.class)
);

client.insert(InsertReq.builder()
        .collectionName("text_bm25_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

_, err = cli.Insert(ctx, milvusclient.NewColumnBasedInsertOption("text_bm25_collection").
    WithInt64Column("id", []int64{1, 2, 3}).
    WithColumns(column.NewColumnText("content", []string{
        "Milvus stores vector embeddings and scalar fields in collections. It supports vector search, full text search, and metadata filtering for retrieval applications.",
        "Long documents are often split into passages before embedding. Store each passage in a TEXT field so search results can return the source text.",
        "Operational logs and support tickets often contain long natural-language text. TEXT fields can store these values without a fixed max_length setting.",
    })))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

_, err = cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("text_bm25_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let rows = [
    json!({"id": 1, "content": "Milvus stores vector embeddings and scalar fields in collections. It supports vector search, full text search, and metadata filtering for retrieval applications."}),
    json!({"id": 2, "content": "Long documents are often split into passages before embedding. Store each passage in a TEXT field so search results can return the source text."}),
    json!({"id": 3, "content": "Operational logs and support tickets often contain long natural-language text. TEXT fields can store these values without a fixed max_length setting."}),
];

client
    .insert(
        InsertRequest::builder()
            .collection_name(collection_name)
            .rows(rows)
            .build()?,
    )
    .await?;

client
    .load_collection(
        LoadCollectionRequest::builder()
            .collection_name(collection_name)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <utility>
#include "milvus/MilvusClientV2.h"

milvus::EntityRows rows = {
    {{"id", static_cast<int64_t>(1)},
     {"content", "Milvus stores vector embeddings and scalar fields in collections. It supports vector search, full text search, and metadata filtering for retrieval applications."}},
    {{"id", static_cast<int64_t>(2)},
     {"content", "Long documents are often split into passages before embedding. Store each passage in a TEXT field so search results can return the source text."}},
    {{"id", static_cast<int64_t>(3)},
     {"content", "Operational logs and support tickets often contain long natural-language text. TEXT fields can store these values without a fixed max_length setting."}}
};

milvus::InsertResponse response;
status = client->Insert(milvus::InsertRequest()
                            .WithCollectionName("text_bm25_collection")
                            .WithRowsData(std::move(rows)),
                         response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    {
        id: 1,
        content: "Milvus stores vector embeddings and scalar fields in collections. It supports vector search, full text search, and metadata filtering for retrieval applications."
    },
    {
        id: 2,
        content: "Long documents are often split into passages before embedding. Store each passage in a TEXT field so search results can return the source text."
    },
    {
        id: 3,
        content: "Operational logs and support tickets often contain long natural-language text. TEXT fields can store these values without a fixed max_length setting."
    }
];

const res = await client.insert({
    collection_name: "text_bm25_collection",
    data: data
});

console.log(res);

await client.flushSync({ collection_names: ["text_bm25_collection"] });
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Types;

var contents = new[]
{
    "Milvus stores vector embeddings and scalar fields in collections. It supports vector search, full text search, and metadata filtering for retrieval applications.",
    "Long documents are often split into passages before embedding. Store each passage in a TEXT field so search results can return the source text.",
    "Operational logs and support tickets often contain long natural-language text. TEXT fields can store these values without a fixed max_length setting."
};

await client.InsertAsync(new InsertReq
{
    CollectionName = COLLECTION_NAME,
    ColumnsData =
    [
        FieldData.Create("id", new long[] { 1, 2, 3 }),
        FieldData.CreateVarChar("content", contents)
    ]
});
await client.LoadCollectionAsync(new LoadCollectionReq { CollectionName = COLLECTION_NAME });
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${BASE_URL}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 30" \
-d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"data\": [
        {
            \"id\": 1,
            \"content\": \"Milvus stores vector embeddings and scalar fields in collections. It supports vector search, full text search, and metadata filtering for retrieval applications.\"
        },
        {
            \"id\": 2,
            \"content\": \"Long documents are often split into passages before embedding. Store each passage in a TEXT field so search results can return the source text.\"
        },
        {
            \"id\": 3,
            \"content\": \"Operational logs and support tickets often contain long natural-language text. TEXT fields can store these values without a fixed max_length setting.\"
        }
    ]
}"
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

## ステップ 4：BM25 全文検索を実行する\{#step-4-perform-bm25-full-text-search}

生のクエリテキストを検索データとして使用し、スパースベクトルフィールドに対して検索します。Milvus はクエリテキストをスパースベクトルに変換し、BM25 で一致をランク付けして、要求された `TEXT` フィールドを `output_fields` で返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
results = client.search(
    collection_name=COLLECTION_NAME,
    # highlight-start
    data=["how does Milvus store source text for retrieval"],
    anns_field="sparse",
    limit=2,
    output_fields=["content"],
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Collections;

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("text_bm25_collection")
        .data(Collections.singletonList(new EmbeddedText("how does Milvus store source text for retrieval")))
        .annsField("sparse")
        .limit(2)
        .outputFields(Collections.singletonList("content"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "text_bm25_collection",
    2,
    []entity.Vector{entity.Text("how does Milvus store source text for retrieval")},
).WithANNSField("sparse").
    WithOutputFields("content"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
let response = client
    .search(
        SearchRequest::builder()
            .collection_name(collection_name)
            .vector_field("sparse")
            .vectors(SearchVectors::EmbeddedText(vec![
                "how does Milvus store source text for retrieval".into(),
            ]))
            .output_fields(["id", "content"])
            .limit(2)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <string>
#include "milvus/MilvusClientV2.h"

std::string query_text = "how does Milvus store source text for retrieval";
auto request = milvus::SearchRequest()
                   .WithCollectionName("text_bm25_collection")
                   .WithAnnsField("sparse")
                   .WithLimit(2)
                   .AddOutputField("content")
                   .AddEmbeddedText(query_text);

milvus::SearchResponse search_response;
status = client->Search(request, search_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
    collection_name: "text_bm25_collection",
    data: ["how does Milvus store source text for retrieval"],
    anns_field: "sparse",
    limit: 2,
    output_fields: ["id", "content"]
});

console.log(JSON.stringify(res.results, null, 2));
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Responses.Dql;
using Milvus.Client.V2.Types;

SearchResp results = await client.SearchAsync(new SearchReq
{
    CollectionName = COLLECTION_NAME,
    Texts = ["how does Milvus store source text for retrieval"],
    VectorFieldName = "sparse",
    Limit = 2,
    Parameters = new SearchParameters
    {
        OutputFields = { "content" }
    }
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${BASE_URL}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 30" \
-d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"data\": [\"how does Milvus store source text for retrieval\"],
    \"annsField\": \"sparse\",
    \"limit\": 2,
    \"outputFields\": [\"content\"]
}"
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

## ステップ 5：返された TEXT 値を読み取る\{#step-5-read-the-returned-text-values}

各検索ヒットには、BM25 スコアと元の `TEXT` 値が含まれます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
for hit in results[0]:
    print(f"id: {hit['id']}, score: {hit['distance']}")
    print(hit["entity"]["content"])
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.List;

for (List<SearchResp.SearchResult> hits : searchResp.getSearchResults()) {
    for (SearchResp.SearchResult hit : hits) {
        System.out.println("id: " + hit.getId() + ", score: " + hit.getScore());
        System.out.println(hit.getEntity().get("content"));
    }
}
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("content: ", resultSet.GetColumn("content"))
}
```

</TabItem>

<TabItem value='rust'>

```rust
for result in response.results() {
    for row in result.rows()? {
        let row = serde_json::Value::Object(row.to_entity_row()?);
        println!(
            "id: {}, score: {}, content: {}",
            row["id"], row["score"], row["content"]
        );
    }
}
```

</TabItem>

<TabItem value='c++'>

```c++
auto search_results = search_response.Results();
for (auto& result : search_results.Results()) {
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
        continue;
    }
    for (const auto& row : output_rows) {
        std::cout << row << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
for (const hit of res.results) {
    console.log(`id: ${hit.id}, score: ${hit.score}`);
    console.log(hit.content);
}
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Responses.Dql;

SingleResult? single = results.SingleResults?.FirstOrDefault();
if (single is not null)
{
    for (int i = 0; i < single.Scores.Count; i++)
    {
        IReadOnlyDictionary<string, object?> row = single.GetRow(i);
        long id = results.Ids.LongIds?[i] ?? 0;
        Console.WriteLine($"id: {id}, score: {single.Scores[i]}");
        Console.WriteLine(row["content"]);
    }
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${BASE_URL}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"text_bm25_collection\",
    \"data\": [\"how does Milvus store source text for retrieval\"],
    \"annsField\": \"sparse\",
    \"limit\": 2,
    \"outputFields\": [\"content\"]
}"
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

BM25 関数、スパースベクトルインデックス、全文検索のクエリ構文の詳細については、[全文検索](./full-text-search) を参照してください。
