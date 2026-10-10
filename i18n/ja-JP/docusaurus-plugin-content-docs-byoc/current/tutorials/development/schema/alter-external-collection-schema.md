---
title: "外部コレクションのスキーマを変更する | BYOC"
slug: /alter-external-collection-schema
sidebar_label: "スキーマを変更する（外部コレクション）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "外部データソースは、外部コレクションを作成した後で変化することがよくあります。たとえば、すでに埋め込みを格納しているレイクハウステーブルに、後から、クエリ結果で返したりフィルターで使用したりする score、category、timestamp などの新しいスカラーフィールドが含まれることがあります。 | BYOC"
type: origin
token: A9lowWdneiCQbZkgwrocKkT2nxW
sidebar_position: 19
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 外部コレクションのスキーマを変更する

外部データソースは、外部コレクションを作成した後で変化することがよくあります。たとえば、すでに埋め込みを格納しているレイクハウステーブルに、後から、クエリ結果で返したりフィルターで使用したりする score、category、timestamp などの新しいスカラーフィールドが含まれることがあります。

外部コレクションを再作成したり、ソースデータを Zilliz Cloud にコピーしたりする代わりに、外部データソース内の既存のフィールドにマッピングする Zilliz Cloud フィールドを追加します。フィールドを追加した後は、外部コレクションをリフレッシュして、新しいフィールドをクエリと検索で使用できるようにします。

## 制限事項\{#limits}

- 外部コレクションは現在、作成後のフィールド追加をサポートしています。フィールドの削除、フィールドの名前変更、フィールドデータ型の変更、ベクトル次元の変更、`external_field` の再マッピングなど、その他のスキーマ変更はサポートされていません。

- 追加できるのは、外部データソースにすでに存在するフィールドだけです。この操作は、既存の外部フィールドを Zilliz Cloud フィールドにマッピングします。外部データソースに新しいフィールドを作成したり、ソースデータをバックフィルしたりはしません。

- 既存の外部コレクションへの `SPARSE_FLOAT_VECTOR` フィールドの追加はサポートされていません。

- 既存の外部コレクションへの StructArray フィールドの追加はサポートされていません。外部コレクションで StructArray フィールドが必要な場合は、コレクションの作成時にコレクションスキーマで定義してください。

## フィールドを追加する\{#add-a-field}

外部コレクションにフィールドを追加する前に、そのフィールドが外部データソースにすでに存在することを確認してください。次に、`external_field` を外部データソース内のフィールド名に設定して `add_collection_field()` を呼び出し、そのフィールドを Zilliz Cloud に公開します。`data_type` には、外部データソース内のフィールドに一致する Zilliz Cloud データ型を設定します。たとえば、マッピングするフィールドが倍精度値を格納している場合は、`DataType.DOUBLE` を使用します。

マネージドコレクションとは異なり、追加したフィールドの値は、外部コレクションをリフレッシュした後に外部データソースから読み取られます。

### スカラーフィールドを追加する\{#add-a-scalar-field}

クエリ結果でフィールドを返したり、フィルターで使用したりする場合は、`add_collection_field()` を使用してスカラーフィールドを追加します。次の例では、外部データソース内の `score` フィールドにマッピングする `score` フィールドを追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.add_collection_field(
    collection_name="product_embeddings",
    field_name="score",
    data_type=DataType.DOUBLE,
    nullable=True,
    # highlight-next-line
    external_field="score",
)
```

</TabItem>

<TabItem value='java'>

```java
// Note: milvus-sdk-java does not support adding a field to an
// external collection as of v3.0.10 (addCollectionField() routes through
// AlterCollectionSchema, which rejects external collections).
```

</TabItem>

<TabItem value='go'>

```go
// Note: The Go SDK does not support adding a field to an external
// collection as of client/v3.0.0 (AddCollectionField() routes through
// AlterCollectionSchema, which rejects external collections).
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2 as sdk;
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    ).await?;

    client.add_collection_field(
        sdk::request::collection::AddCollectionFieldRequest::builder()
            .collection_name("product_embeddings")
            .field(
                sdk::FieldSchema::new()
                    .name("score")
                    .data_type(sdk::DataType::Double)
                    .nullable(true)
                    .external_field("score"),
            )
            .build()?,
    ).await?;
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
// Note: milvus-sdk-cpp does not support adding a field to an external
// collection as of v3.0.3 (AddCollectionField() routes through
// AlterCollectionSchema, which rejects external collections).
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

await client.addCollectionField({
   collection_name: 'product_embeddings',
   field: {
     name: 'score',
     data_type: DataType.Double,
     nullable: true,
     external_field: 'score',
   },
 });
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The RESTful API does not support adding a field to an external
# collection (POST /v2/vectordb/collections/fields/add routes through
# AlterCollectionSchema, which rejects external collections).
```

</TabItem>
</Tabs>

この例では、`score` は Zilliz Cloud のフィールド名であり、`external_field="score"` によって外部データソース内の `score` フィールドにマッピングされます。`nullable=True` を設定するのは、フィールドがコレクションの作成後に追加されるためです。

### ベクトルフィールドを追加する\{#add-a-vector-field}

外部データソースにすでにベクトル値が含まれている場合は、ベクトルフィールドを追加することもできます。ベクトルの `data_type` と `dim` を、外部データソース内のベクトルフィールドに一致するように設定します。

次の例では、`image_embedding_v2` という名前の密ベクトルフィールドを追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.add_collection_field(
    collection_name="product_embeddings",
    field_name="image_embedding_v2",
    data_type=DataType.FLOAT_VECTOR,
    dim=768,
    nullable=True,
    # highlight-next-line
    external_field="image_embedding_v2",
)
```

</TabItem>

<TabItem value='java'>

```java
// Note: milvus-sdk-java does not support adding a field to an
// external collection as of v3.0.10 (addCollectionField() routes through
// AlterCollectionSchema, which rejects external collections).
```

</TabItem>

<TabItem value='go'>

```go
// Note: The Go SDK does not support adding a field to an external
// collection as of client/v3.0.0 (AddCollectionField() routes through
// AlterCollectionSchema, which rejects external collections).
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2 as sdk;
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    ).await?;

    client.add_collection_field(
        sdk::request::collection::AddCollectionFieldRequest::builder()
            .collection_name("product_embeddings")
            .field(
                sdk::FieldSchema::new()
                    .name("image_embedding_v2")
                    .data_type(sdk::DataType::FloatVector)
                    .dimension(768)
                    .nullable(true)
                    .external_field("image_embedding_v2"),
            )
            .build()?,
    ).await?;
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
// Note: milvus-sdk-cpp does not support adding a field to an external
// collection as of v3.0.3 (AddCollectionField() routes through
// AlterCollectionSchema, which rejects external collections).
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

await client.addCollectionField({
   collection_name: 'product_embeddings',
   field: {
     name: 'image_embedding_v2',
     data_type: DataType.FloatVector,
     dim: 768,
     nullable: true,
     external_field: 'image_embedding_v2',
   },
 });
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The RESTful API does not support adding a field to an external
# collection (POST /v2/vectordb/collections/fields/add routes through
# AlterCollectionSchema, which rejects external collections).
```

</TabItem>
</Tabs>

追加したベクトルフィールドでベクトル検索を実行する予定がある場合は、外部コレクションをリフレッシュする前に、そのフィールドのインデックスを作成してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="image_embedding_v2",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_index(
    collection_name="product_embeddings",
    index_params=index_params,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.Collections;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

IndexParam indexParam = IndexParam.builder()
        .fieldName("image_embedding_v2")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build();
client.createIndex(CreateIndexReq.builder()
        .collectionName("product_embeddings")
        .indexParams(Collections.singletonList(indexParam))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

_, err = client.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "product_embeddings", "image_embedding_v2",
    index.NewAutoIndex(index.MetricType(entity.COSINE))))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2 as sdk;
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    ).await?;

    client.create_index(
        sdk::request::index::CreateIndexRequest::builder()
            .collection_name("product_embeddings")
            .index_param(
                sdk::IndexParam::new()
                    .field_name("image_embedding_v2")
                    .index_type(sdk::IndexType::AutoIndex)
                    .metric_type(sdk::MetricType::Cosine),
            )
            .build()?,
    ).await?;
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::IndexDesc index_desc("image_embedding_v2", "", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE);
status = client->CreateIndex(milvus::CreateIndexRequest()
                                 .WithCollectionName("product_embeddings")
                                 .AddIndex(std::move(index_desc)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

await client.createIndex({
   collection_name: 'product_embeddings',
   field_name: 'image_embedding_v2',
   index_type: 'AUTOINDEX',
   metric_type: 'COSINE',
 });
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "product_embeddings",
    "indexParams": [
        {
            "fieldName": "image_embedding_v2",
            "indexType": "AUTOINDEX",
            "metricType": "COSINE"
        }
    ]
}' 
```

</TabItem>
</Tabs>

## 外部コレクションをリフレッシュする\{#refresh-the-external-collection}

外部コレクションのスキーマを変更した後は、外部コレクションをリフレッシュして、Zilliz Cloud が外部コレクションのメタデータを更新し、スキーマ変更がクエリ、検索、フィルターの結果に反映されるようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.refresh_external_collection(
    collection_name="product_embeddings"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.RefreshExternalCollectionReq;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

RefreshExternalCollectionResp resp = client.refreshExternalCollection(
        RefreshExternalCollectionReq.builder()
                .collectionName("product_embeddings")
                .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

res, err := client.RefreshExternalCollection(ctx, milvusclient.NewRefreshExternalCollectionOption("product_embeddings"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2 as sdk;
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    ).await?;

    let response = client.refresh_external_collection(
        sdk::request::utility::RefreshExternalCollectionRequest::builder()
            .collection_name("product_embeddings")
            .build()?,
    ).await?;
    println!("job_id: {}", response.job_id());
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::RefreshExternalCollectionRequest request;
request.WithCollectionName("product_embeddings");
milvus::RefreshExternalCollectionResponse response;
status = client->RefreshExternalCollection(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

await client.refreshExternalCollection({
   collection_name: 'product_embeddings',
 });
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/jobs/external_collection/refresh" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "product_embeddings"
}' 
```

</TabItem>
</Tabs>
