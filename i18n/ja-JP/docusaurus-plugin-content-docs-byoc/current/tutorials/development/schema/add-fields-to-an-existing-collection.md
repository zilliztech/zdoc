---
title: "コレクションスキーマの変更 | BYOC"
slug: /add-fields-to-an-existing-collection
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ユーザー定義フィールド、または生成ベクトルフィールドを持つ Function を追加または削除して、既存のコレクションスキーマを変更します。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-add-fields-to-an-existing-collection
sidebar_label: "スキーマの変更（マネージドコレクション）"
sidebar_position: 18
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/add-fields-to-an-existing-collection.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションスキーマの変更

コレクションが開発から本番環境へ移行するにつれて、そのスキーマは頻繁に変更されます。フィルタリングやアプリケーションロジック用に `source_uri` や `review_status` などのスカラーフィールドを追加したり、アプリケーションが生成する埋め込み用に新しいベクトルフィールドを追加したり、既存のテキストに対する語彙検索用に BM25 Function とその生成スパースベクトルフィールドを追加したり、不要になったフィールドや Function を削除したりします。コレクションスキーマの変更機能を使用すると、コレクションを再作成するのではなく、サポート対象のフィールドと Function の変更をインプレースで実行できます。

<Admonition type="info" icon="📘" title="Notes">

このガイドでは、マネージドコレクション内のユーザー定義フィールドと、生成ベクトルフィールドを持つ Function のスキーマ変更について説明します。外部コレクションにフィールドを追加する場合は、[外部コレクションスキーマの変更](./alter-external-collection-schema) を参照してください。`VARCHAR` フィールドの `max_length` や `ARRAY` フィールドの `max_capacity` の変更など、フィールドプロパティの変更については、[コレクションフィールドの変更](./alter-collection-field) を参照してください。動的フィールドの動作については、[動的フィールド](./enable-dynamic-field) と [コレクションの変更](https://milvus.io/docs/modify-collection.md) を参照してください。

</Admonition>

## 制限\{#limits}

**ユーザー定義フィールドの追加**

- 追加するユーザー定義フィールドは Null 許容である必要があります。`add_collection_field()` を呼び出すときに `nullable=True` を設定してください。既存のエンティティでは、`default_value` を持つスカラーフィールドを追加しない限り、追加したフィールドは `NULL` になります。

- ユーザー定義スカラーフィールドの追加は Milvus 2.6.x 以降でサポートされています。ユーザー定義ベクトルフィールドの追加は Milvus 2.6.18 以降でサポートされています。

- Null 許容の StructArray フィールド、および動的な StructArray フィールドの追加は、Dedicated クラスターとオンデマンドクラスターでサポートされています。動的に追加する StructArray フィールドは Null 許容である必要があります。

- 既存の StructArray フィールドへのサブフィールドの追加は、Milvus v3.0.x と互換性のある Dedicated クラスターでサポートされていますが、オンデマンドクラスターではまだ利用できません。追加するサブフィールドでは、要素レベルの null を許可する必要があり（スカラーまたはベクトルのサブフィールドでは `nullable=True`、配列のサブフィールドでは `element_nullable=True`）、デフォルト値を持たせることはできず、同じリクエストでインデックスにバインドすることもできません。

- フィールド名は、コレクション内のフィールド間で一意である必要があります。

**Function とその生成ベクトルフィールドの追加**

- 各スキーマ更新で追加できる Function と生成ベクトルフィールドはそれぞれ 1つだけです。

- サポートされる Function によって、生成されるベクトルフィールドの型が決まります。`BM25` は `SPARSE_FLOAT_VECTOR` フィールドを生成し、`MINHASH` は `BINARY_VECTOR` フィールドを生成します。

- 生成されるベクトルフィールドは新しいフィールドである必要があります。コレクションスキーマにすでに存在するフィールドを指定することはできません。

- 生成されるベクトルフィールドは Null 許容にできません。

- Function が使用する入力フィールドは、すでにコレクションに存在している必要があります。

- 既存のコレクションに BM25 または MinHash Function を追加する場合、Function の入力は `VARCHAR` フィールドである必要があります。このワークフローでは `TEXT` 入力をサポートしていません。Zilliz Cloud は、この入力タイプから既存のエンティティに対して生成出力をバックフィルできないためです。

**ユーザー定義フィールドの削除**

- コレクション内の主キーフィールド、パーティションキーフィールド、クラスタリングキーフィールド、または最後のベクトルフィールドは削除できません。

- ARRAY&lt;STRUCT&gt; フィールド全体を削除できます。Milvus v3.0.x と互換性のある Dedicated クラスターでは、`chunks[lang]` などのパスを指定して個々のサブフィールドを削除することもできます。ただし、ARRAY&lt;STRUCT&gt; フィールドの最後のサブフィールドは削除できません。この機能は、オンデマンドクラスターではまだ利用できません。

- Function の入力フィールドとして使用されているフィールドや、Function の出力として生成されるフィールドを直接削除することはできません。Function の出力フィールドを削除するには、そのフィールドを生成する Function を削除してください。

**Function とその生成ベクトルフィールドの削除**

- このスキーマ変更ワークフローでは、Function を削除すると、Function、その生成ベクトルフィールド、および関連するインデックスが削除されます。Function の入力フィールドはコレクションスキーマに残ります。

- 生成ベクトルフィールドを削除した結果、コレクションにベクトルフィールドが 1 つも残らなくなる場合、Function の削除は拒否されます。

<Admonition type="info" icon="📘" title="Notes">

サポート対象の追加・削除操作以外のスキーマ変更を行う場合は、コレクションを再作成または移行してください。

</Admonition>

<a id="add-fields-to-an-existing-collection"></a>

## 既存コレクションへのフィールドと Function の追加\{#add-fields-and-functions-to-an-existing-collection}

ユーザー定義フィールドを追加するか、ベクトルフィールドを生成する Function を追加するかに応じて、ワークフローを選択してください。

- フィルタリング、クエリ出力、またはアプリケーションロジック用の新しいメタデータが必要な場合は、[ユーザー定義スカラーフィールドの追加](#add-user-defined-scalar-fields) を使用します。

- 要素が同じ Struct スキーマを共有する配列フィールドが必要な場合は、[StructArray フィールドの追加](#add-structarray-fields-or-public) を使用します。

- アプリケーションが埋め込みを生成し、ベクトル値を Zilliz Cloud に書き込む場合は、[ユーザー定義ベクトルフィールドの追加](#add-user-defined-vector-fields) を使用します。

- Zilliz Cloud が既存のフィールドから、テキストからの BM25 スパースベクトルや MinHash 署名などのベクトル値を生成する必要がある場合は、[Function とその生成ベクトルフィールドの追加](#add-a-function-and-its-generated-vector-field-or-public) を使用します。

- 既存の Struct 要素に新しい属性が必要な場合は、[既存の StructArray フィールドへのサブフィールドの追加](#add-a-sub-field-to-an-existing-structarray-field-or-public) を使用します。Milvus v3.0.x と互換性のある Dedicated クラスターでサポートされていますが、オンデマンドクラスターではまだ利用できません。

いずれの場合も、新しいフィールド名はコレクション内にまだ存在していない必要があり、フィールドの総数は Zilliz Cloud のフィールド数上限を超えることはできません。詳細は、[Zilliz Cloud の制限](./limits) を参照してください。

<a id="add-user-defined-scalar-fields--milvus-26x"></a>

### ユーザー定義スカラーフィールドの追加\{#add-user-defined-scalar-fields}

`add_collection_field()` を使用して、既存のコレクションにユーザー定義スカラーフィールドを追加します。

これは、動的フィールドに任意のキーを格納する場合とは異なります。スキーマ更新が反映されると、新しいスカラーフィールドはコレクションスキーマの通常の一部になります。値の挿入または upsert、サポートされている場合のインデックスの作成、クエリや検索フィルターでの使用、クエリまたは検索出力での返却が可能です。

既存のエンティティは新しいフィールドが存在する前に挿入されているため、追加するすべてのユーザー定義スカラーフィールドは Null 許容である必要があります。

- `nullable=True` を指定し、`default_value` を指定せずにスカラーフィールドを追加した場合、既存のエンティティは新しいフィールドに対して `NULL` を返します。

- `nullable=True` と `default_value` を指定してスカラーフィールドを追加した場合、既存のエンティティは `NULL` ではなくデフォルト値を返します。

スカラーフィルター式は `NULL` のスカラー値に一致しません。詳細は、[Null 許容フィールド](./nullable-fields) を参照してください。

**例：Null 許容スカラーフィールドの追加**

次の例では、`product_catalog` という名前の既存のコレクションに Null 許容の `source` フィールドを追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient, Function, FunctionType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

# highlight-start
client.add_collection_field(
    collection_name="product_catalog",
    field_name="source",
    data_type=DataType.VARCHAR,
    max_length=128,
    nullable=True,
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionFieldReq;
import io.milvus.v2.service.collection.request.AddCollectionStructFieldReq;
import io.milvus.v2.service.collection.request.AddFieldReq;
import java.util.HashMap;
import java.util.Map;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.Collections;
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.AddFunctionFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionFieldReq;
import io.milvus.v2.service.collection.request.DropFunctionFieldReq;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("product_catalog")
        .fieldName("source")
        .dataType(DataType.VarChar)
        .maxLength(128)
        .isNullable(true)
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
    "github.com/milvus-io/milvus/client/v3/index"
)

ctx := context.Background()
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey: "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

newField := entity.NewField().
    WithName("source").
    WithDataType(entity.FieldTypeVarChar).
    WithNullable(true).
    WithMaxLength(128)
err = client.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("product_catalog", newField))
if err != nil {
    log.Fatal("failed to add field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;
client
    .add_collection_field(
        AddCollectionFieldRequest::builder()
            .collection_name("product_catalog")
            .field(
                FieldSchema::new()
                    .name("source")
                    .data_type(DataType::VarChar)
                    .max_length(128)
                    .nullable(true),
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::FieldSchema field = milvus::FieldSchema("source", milvus::DataType::VARCHAR)
                                .WithMaxLength(128)
                                .WithNullable(true);
status = client->AddCollectionField(
    milvus::AddCollectionFieldRequest().WithCollectionName("product_catalog").WithField(std::move(field)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

await client.addCollectionField({
    collection_name: "product_catalog",
    field: {
        name: "source",
        data_type: "VarChar",
        max_length: 128,
        nullable: true,
    },
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Types;
using Milvus.Client.V2.Requests.Index;

using var client = new MilvusClientV2(new ConnectConfig { Uri = "YOUR_CLUSTER_ENDPOINT", ApiKey = "YOUR_CLUSTER_TOKEN" });
await client.ConnectAsync();

await client.AddCollectionFieldAsync(new AddCollectionFieldReq
{
    CollectionName = "product_catalog",
    Field = FieldSchema.CreateVarchar("source", maxLength: 128, nullable: true)
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/add" \
     --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
     --header "Content-Type: application/json" \
     -d '{
       "collectionName": "product_catalog",
       "schema": {
         "fieldName": "source",
         "dataType": "VarChar",
         "nullable": true,
         "elementTypeParams": {
           "max_length": 128
         }
       }
     }'
```

</TabItem>

</Tabs>

フィールドが追加されると、コレクションにすでに存在していたエンティティは `source` に対して `NULL` を返します。新しいエンティティは、挿入または upsert 時に `source` を設定できます。

**例：デフォルト値を持つスカラーフィールドの追加**

既存のエンティティが `NULL` ではなく具体的な値を返す必要がある場合は、スカラーフィールドを追加するときに `default_value` を指定します。次の例では、`review_status` フィールドを追加し、デフォルト値として `"unreviewed"` を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# highlight-start
client.add_collection_field(
    collection_name="product_catalog",
    field_name="review_status",
    data_type=DataType.VARCHAR,
    max_length=32,
    nullable=True,
    default_value="unreviewed",
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("product_catalog")
        .fieldName("review_status")
        .dataType(DataType.VarChar)
        .maxLength(32)
        .isNullable(true)
        .defaultValue("unreviewed")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
newField := entity.NewField().
    WithName("review_status").
    WithDataType(entity.FieldTypeVarChar).
    WithNullable(true).
    WithMaxLength(32).
    WithDefaultValueString("unreviewed")
err = client.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("product_catalog", newField))
if err != nil {
    log.Fatal("failed to add field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .add_collection_field(
        AddCollectionFieldRequest::builder()
            .collection_name("product_catalog")
            .field(
                FieldSchema::new()
                    .name("review_status")
                    .data_type(DataType::VarChar)
                    .max_length(32)
                    .nullable(true)
                    .default_value(DefaultValue::String("unreviewed".into())),
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
milvus::FieldSchema field = milvus::FieldSchema("review_status", milvus::DataType::VARCHAR)
                                .WithMaxLength(32)
                                .WithNullable(true)
                                .WithDefaultValue("unreviewed");
status = client->AddCollectionField(
    milvus::AddCollectionFieldRequest().WithCollectionName("product_catalog").WithField(std::move(field)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.addCollectionField({
    collection_name: "product_catalog",
    field: {
        name: "review_status",
        data_type: "VarChar",
        max_length: 32,
        nullable: true,
        default_value: "unreviewed",
    },
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
await client.AddCollectionFieldAsync(new AddCollectionFieldReq
{
    CollectionName = "product_catalog",
    Field = FieldSchema.CreateVarchar("review_status", maxLength: 32, nullable: true, defaultValue: "unreviewed")
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/add" \
     --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
     --header "Content-Type: application/json" \
     -d '{
       "collectionName": "product_catalog",
       "schema": {
         "fieldName": "review_status",
         "dataType": "VarChar",
         "nullable": true,
         "defaultValue": "unreviewed",
         "elementTypeParams": {
           "max_length": 32
         }
       }
     }'
```

</TabItem>

</Tabs>

フィールドが追加されると、コレクションにすでに存在していたエンティティは `review_status` に対して `"unreviewed"` を返します。新しいエンティティは、別の値を設定することも、値を指定しない場合にデフォルト値を使用することもできます。

<a id="add-structarray-fields--milvus-300"></a>

### StructArray フィールドの追加 | PUBLIC\{#add-structarray-fields-or-public}

`add_collection_struct_field()` を使用して、Struct 要素の配列を受け入れる StructArray フィールドを追加します。StructArray フィールドを追加するには、次の手順に従います。

1. サポートされているデータ型の必要なサブフィールドを含む Struct スキーマを作成します。該当するデータ型については、[StructArray の制限](./struct-array-limits#supported-subfield-data-types) を参照してください。

1. 上で作成した Struct スキーマを参照し、`add_collection_struct_field()` でフィールドの最大容量を設定します。

1. リクエストで `nullable=True` を設定します。

**例：Null 許容 StructArray フィールドの追加**

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"}]}>
<TabItem value='python'>

```python
# Create a struct schema
struct_schema = client.create_struct_field_schema()

# add a scalar field to the struct
struct_schema.add_field("text", DataType.VARCHAR, max_length=65535)
struct_schema.add_field("chapter", DataType.VARCHAR, max_length=512)

# add a vector field to the struct with mmap enabled
struct_schema.add_field("text_vector", DataType.FLOAT_VECTOR, mmap_enabled=True, dim=5)
struct_schema.add_field("chapter_vector", DataType.FLOAT_VECTOR, mmap_enabled=True, dim=5)

# highlight-start
client.add_collection_struct_field(
    collection_name="books",
    field_name="chunks",
    struct_schema=struct_schema,
    max_capacity=1024,
    nullable=True
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
// Create a struct schema and add its subfields
// add a vector subfield with mmap enabled
Map<String, String> mmapParams = new HashMap<>();
mmapParams.put("mmap.enabled", "true");
client.addCollectionStructField(AddCollectionStructFieldReq.builder()
        .collectionName("books")
        .fieldName("chunks")
        .maxCapacity(1024)
        .nullable(true)
        .addStructField(AddFieldReq.builder()
                .fieldName("text")
                .dataType(DataType.VarChar)
                .maxLength(65535)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("chapter")
                .dataType(DataType.VarChar)
                .maxLength(512)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("text_vector")
                .dataType(DataType.FloatVector)
                .dimension(5)
                .typeParams(mmapParams)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("chapter_vector")
                .dataType(DataType.FloatVector)
                .dimension(5)
                .typeParams(mmapParams)
                .build())
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// Create a struct schema and add its subfields
// add a vector subfield with mmap enabled
structSchema := entity.NewStructSchema().
    WithField(entity.NewField().WithName("text").WithDataType(entity.FieldTypeVarChar).WithMaxLength(65535)).
    WithField(entity.NewField().WithName("chapter").WithDataType(entity.FieldTypeVarChar).WithMaxLength(512)).
    WithField(entity.NewField().WithName("text_vector").WithDataType(entity.FieldTypeFloatVector).WithDim(5).WithTypeParams("mmap.enabled", "true")).
    WithField(entity.NewField().WithName("chapter_vector").WithDataType(entity.FieldTypeFloatVector).WithDim(5).WithTypeParams("mmap.enabled", "true"))
newField := entity.NewField().
    WithName("chunks").
    WithDataType(entity.FieldTypeArray).
    WithElementType(entity.FieldTypeStruct).
    WithNullable(true).
    WithMaxCapacity(1024).
    WithStructSchema(structSchema)
err = client.AddCollectionStructField(ctx, milvusclient.NewAddCollectionStructFieldOption("books", newField))
if err != nil {
    log.Fatal("failed to add struct field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
// Create a struct schema and add its subfields
// add a vector subfield with mmap enabled
let struct_schema = StructFieldSchema::new()
    .name("chunks")
    .max_capacity(1024)
    .nullable(true)
    .add_field(
        FieldSchema::new()
            .name("text")
            .data_type(DataType::VarChar)
            .max_length(65535),
    )
    .add_field(
        FieldSchema::new()
            .name("chapter")
            .data_type(DataType::VarChar)
            .max_length(512),
    )
    .add_field(
        FieldSchema::new()
            .name("text_vector")
            .data_type(DataType::FloatVector)
            .dimension(5)
            .type_params(
                std::collections::HashMap::from([("mmap.enabled".to_string(), "true".to_string())]),
            ),
    )
    .add_field(
        FieldSchema::new()
            .name("chapter_vector")
            .data_type(DataType::FloatVector)
            .dimension(5)
            .type_params(
                std::collections::HashMap::from([("mmap.enabled".to_string(), "true".to_string())]),
            ),
    );
client
    .add_collection_struct_field(
        AddCollectionStructFieldRequest::builder()
            .collection_name("books")
            .struct_field(struct_schema)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
// Create a struct schema and add its subfields
// add a vector subfield with mmap enabled
milvus::StructFieldSchema struct_schema = milvus::StructFieldSchema("chunks")
                                              .WithMaxCapacity(1024)
                                              .WithNullable(true)
                                              .AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR).WithMaxLength(65535))
                                              .AddField(milvus::FieldSchema("chapter", milvus::DataType::VARCHAR).WithMaxLength(512))
                                              .AddField(milvus::FieldSchema("text_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(5).AddTypeParam("mmap.enabled", "true"))
                                              .AddField(milvus::FieldSchema("chapter_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(5).AddTypeParam("mmap.enabled", "true"));
status = client->AddCollectionStructField(
    milvus::AddCollectionStructFieldRequest().WithCollectionName("books").WithStructField(std::move(struct_schema)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Create a struct schema and add its subfields
// add a vector subfield with mmap enabled

await client.addCollectionField({
    collection_name: "books",
    field: {
        name: "chunks",
        data_type: "Array",
        element_type: "Struct",
        max_capacity: 1024,
        nullable: true,
        fields: [
            { name: "text", data_type: "VarChar", max_length: 65535 },
            { name: "chapter", data_type: "VarChar", max_length: 512 },
            { name: "text_vector", data_type: "FloatVector", dim: 5, "mmap.enabled": true },
            { name: "chapter_vector", data_type: "FloatVector", dim: 5, "mmap.enabled": true },
        ],
    },
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
// Create a struct schema
var structSchema = new StructFieldSchema("chunks")
{
    MaxCapacity = 1024,
    Nullable = true
};

// add a scalar field to the struct
structSchema.Fields.Add(FieldSchema.CreateVarchar("text", maxLength: 65535));
structSchema.Fields.Add(FieldSchema.CreateVarchar("chapter", maxLength: 512));

// add a vector field to the struct with mmap enabled
var textVector = FieldSchema.CreateFloatVector("text_vector", dimension: 5);
textVector.TypeParams["mmap.enabled"] = "true";
structSchema.Fields.Add(textVector);

var chapterVector = FieldSchema.CreateFloatVector("chapter_vector", dimension: 5);
chapterVector.TypeParams["mmap.enabled"] = "true";
structSchema.Fields.Add(chapterVector);

await client.AddCollectionStructFieldAsync(new AddCollectionStructFieldReq
{
    CollectionName = "books",
    StructField = structSchema
});
```

</TabItem>

</Tabs>

StructArray フィールドが追加されると、コレクションにすでに存在するエンティティは、`chunks` のすべてのサブフィールドに対して `NULL` を返します。新しいエンティティを挿入する場合、すべての Struct 要素はすべてのサブフィールドに値を指定する必要があり、Struct 要素自体を `NULL` にすることはできません。Milvus v3.0.x と互換性のある Dedicated クラスターでは、要素レベルで Null 許容のサブフィールドは個々の Struct 要素で `NULL` を保持できます。詳細は、[StructArray フィールドの作成](./create-struct-array) を参照してください。


<a id="add-a-sub-field-to-an-existing-structarray-field--milvus-306"></a>

### 既存の StructArray フィールドへのサブフィールドの追加 | PUBLIC\{#add-a-sub-field-to-an-existing-structarray-field-or-public}

データがすでに格納されている StructArray フィールドにサブフィールドを追加するには、フィールド名としてサブフィールドのパスを指定して `add_collection_field()` を使用します。このワークフローは、Milvus v3.0.x と互換性のある Dedicated クラスターでサポートされていますが、オンデマンドクラスターではまだ利用できません。サブフィールドを追加するには、次の手順に従います。

1. フィールド名には、`chunks[lang]` などのパス `structArrayField[subField]` を指定します。

1. StructArray でサポートされているスカラー、ベクトル、またはスカラー配列のデータ型を選択します。

1. 追加するサブフィールドに `nullable=True` を設定します。これは、追加するすべてのサブフィールドに必要であり、要素レベルの null を許可するための設定です。配列のサブフィールドでは、内側の配列で null 値を許可するために、さらに `element_nullable=True` を設定します。サブフィールドは、StructArray フィールドの行レベルの `nullable` 設定と `max_capacity` を継承します。

**例：要素レベルの null を許容するサブフィールドの追加**

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.add_collection_field(
    collection_name="books",
    field_name="chunks[lang]",
    data_type=DataType.VARCHAR,
    max_length=16,
    nullable=True,
)
# highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err)
    return
}

// highlight-start
err = cli.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("books",
        entity.NewField().
                WithName("chunks[lang]").
                WithDataType(entity.FieldTypeVarChar).
                WithMaxLength(16).
                WithNullable(true)))
// highlight-end
if err != nil {
    fmt.Println(err)
    return
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/add" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "collectionName": "books",
    "schema": {
      "fieldName": "chunks[lang]",
      "dataType": "Array",
      "elementDataType": "VarChar",
      "nullable": true,
      "elementNullable": true,
      "elementTypeParams": {"max_length": "16"}
    }
  }'
```

</TabItem>

</Tabs>

サブフィールドを追加すると、既存のエンティティは各 Struct 要素の `chunks[lang]` に対して `NULL` を返し、`chunks` フィールドが `NULL` であるエンティティは `NULL` のままです。新しいエンティティでは、サブフィールドを省略するか、任意の Struct 要素で `NULL` に設定できます。

次のルールが適用されます。

- 追加するサブフィールドは `nullable=True` を指定して作成する必要があります。さらに、追加する配列のサブフィールドでは、内側の配列で null 値を許可するために `element_nullable=True` を指定します。デフォルト値を持つことはできません。

- サブフィールドの追加中にインデックスをバインドすることはできません。インデックスは、別途 `create_index()` を呼び出して作成します。追加されたベクトルサブフィールドでは要素レベルのメトリクスのみをサポートし、`MAX_SIM*` はサポートしません。また、新しいサブフィールドを含めてコレクションをロードする前に、コレクションにそのインデックスが存在している必要があります。

- 履歴セグメントは、スキーマバージョン Compaction を通じて、追加されたサブフィールドとそのインデックスを受け取ります。`dataCoord.compaction.bumpSchemaVersion.enabled` を `true` に設定してください（デフォルトは `false` です）。設定しない場合、追加されたサブフィールドのインデックスは履歴セグメントをカバーしません。

- ロード済みのコレクションにサブフィールドを追加しても、コレクションは解放されません。クエリは、インデックスが作成される前に新しいサブフィールドを返すことができます。


- スキーマのタイムスタンプを固定しているクライアントはスキーマ不一致エラーを受け取るため、他の追加フィールドの場合と同様に、スキーマを更新する必要があります。

<a id="add-user-defined-vector-fields--milvus-2618"></a>

### ユーザー定義ベクトルフィールドの追加\{#add-user-defined-vector-fields}

アプリケーションが埋め込みを生成し、ベクトル値を Zilliz Cloud に書き込む場合は、`add_collection_field()` を使用してユーザー定義ベクトルフィールドを追加します。

追加するすべてのユーザー定義ベクトルフィールドは Null 許容である必要があります。既存のエンティティは、upsert またはバックフィルワークフローを通じてベクトル値を書き込むまで、新しいベクトルフィールドに対して `NULL` を持ちます。新しいエンティティは、挿入時にベクトルフィールドを含めることができます。ベクトル検索では、ベクトル値が `NULL` のエンティティはスキップされます。詳細は、[Null 許容フィールド](./nullable-fields) を参照してください。

**例：Null 許容ベクトルフィールドの追加**

次の例では、`embedding_v2` という名前の Null 許容の密ベクトルフィールドを既存のコレクションに追加します。`dim` には、アプリケーションが生成する埋め込みの次元数を設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# highlight-start
client.add_collection_field(
    collection_name="product_catalog",
    field_name="embedding_v2",
    data_type=DataType.FLOAT_VECTOR,
    dim=768,
    nullable=True,
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("product_catalog")
        .fieldName("embedding_v2")
        .dataType(DataType.FloatVector)
        .dimension(768)
        .isNullable(true)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
newField := entity.NewField().
    WithName("embedding_v2").
    WithDataType(entity.FieldTypeFloatVector).
    WithNullable(true).
    WithDim(768)
err = client.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("product_catalog", newField))
if err != nil {
    log.Fatal("failed to add field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .add_collection_field(
        AddCollectionFieldRequest::builder()
            .collection_name("product_catalog")
            .field(
                FieldSchema::new()
                    .name("embedding_v2")
                    .data_type(DataType::FloatVector)
                    .dimension(768)
                    .nullable(true),
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
milvus::FieldSchema field = milvus::FieldSchema("embedding_v2", milvus::DataType::FLOAT_VECTOR)
                                .WithDimension(768)
                                .WithNullable(true);
status = client->AddCollectionField(
    milvus::AddCollectionFieldRequest().WithCollectionName("product_catalog").WithField(std::move(field)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.addCollectionField({
    collection_name: "product_catalog",
    field: {
        name: "embedding_v2",
        data_type: "FloatVector",
        dim: 768,
        nullable: true,
    },
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
var embeddingV2 = FieldSchema.CreateFloatVector("embedding_v2", dimension: 768);
embeddingV2.Nullable = true;

await client.AddCollectionFieldAsync(new AddCollectionFieldReq
{
    CollectionName = "product_catalog",
    Field = embeddingV2
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/add" \
     --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
     --header "Content-Type: application/json" \
     -d '{
       "collectionName": "product_catalog",
       "schema": {
         "fieldName": "embedding_v2",
         "dataType": "FloatVector",
         "nullable": true,
         "elementTypeParams": {
           "dim": 768
         }
       }
     }'
```

</TabItem>

</Tabs>

フィールドが追加されたら、新しいベクトルフィールドを検索する前にインデックスを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="embedding_v2",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_index(
    collection_name="product_catalog",
    index_params=index_params,
)
```

</TabItem>

<TabItem value='java'>

```java
client.createIndex(CreateIndexReq.builder()
        .collectionName("product_catalog")
        .indexParams(Collections.singletonList(IndexParam.builder()
                .fieldName("embedding_v2")
                .indexType(IndexParam.IndexType.AUTOINDEX)
                .metricType(IndexParam.MetricType.COSINE)
                .build()))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
indexOpt := milvusclient.NewCreateIndexOption("product_catalog", "embedding_v2", index.NewAutoIndex(entity.COSINE))
_, err = client.CreateIndex(ctx, indexOpt)
if err != nil {
    log.Fatal("failed to create index: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .create_index(
        CreateIndexRequest::builder()
            .collection_name("product_catalog")
            .index_param(
                IndexParam::new()
                    .field_name("embedding_v2")
                    .index_type(IndexType::AutoIndex)
                    .metric_type(MetricType::Cosine),
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
milvus::IndexDesc index_desc("embedding_v2", "", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE);
status = client->CreateIndex(
    milvus::CreateIndexRequest().WithCollectionName("product_catalog").AddIndex(std::move(index_desc)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex({
    collection_name: "product_catalog",
    field_name: "embedding_v2",
    index_type: "AUTOINDEX",
    metric_type: "COSINE",
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
await client.CreateIndexAsync(new CreateIndexReq
{
    CollectionName = "product_catalog",
    Indexes = new[]
    {
        new IndexParam("embedding_v2", "embedding_v2", IndexType.AutoIndex, MetricType.Cosine)
    }
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/indexes/create" \
     --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
     --header "Content-Type: application/json" \
     -d '{
       "collectionName": "product_catalog",
       "indexParams": [
         {
           "fieldName": "embedding_v2",
           "params": {"index_type": "AUTOINDEX"},
           "metricType": "COSINE"
         }
       ]
     }'
```

</TabItem>

</Tabs>

既存のエンティティは `embedding_v2` に対して `NULL` を持ち、このフィールドで検索するとスキップされます。既存のエンティティを `embedding_v2` で検索可能にするには、upsert またはバックフィルワークフローを通じて NULL 以外のベクトル値を書き込みます。新しいエンティティは、挿入時に `embedding_v2` を含めることができます。

<a id="add-vector-fields-generated-by-functions--milvus-30x"></a>

<a id="add-a-function-and-its-generated-vector-field--milvus-30x"></a>

### Function とその生成ベクトルフィールドの追加 | PUBLIC\{#add-a-function-and-its-generated-vector-field-or-public}

Zilliz Cloud が既存のコレクションにすでに格納されているデータから新しいベクトルフィールドを生成する必要がある場合は、このワークフローを使用します。この操作では、関連する 3 つのスキーマ要素を追加します。

- 1 つ以上の既存の入力フィールドから読み取る Function 定義。

- Function の出力を格納する新しいベクトルフィールド。

- 新しいベクトルフィールドにバインドされたインデックス定義。

たとえば、BM25 Function は既存の `VARCHAR` フィールドを読み取り、語彙検索用の `SPARSE_FLOAT_VECTOR` フィールドを生成します。MinHash Function は、近似重複検出用の `BINARY_VECTOR` フィールドを生成します。このワークフローは、Function の入力フィールドを追加または置換するものではありません。

このスキーマ変更ワークフローは、Zilliz Cloud のオンデマンドクラスターで利用できます。

サポートされる Function によって、生成されるベクトルフィールドの型が決まります。

| Function | 生成されるベクトルフィールドの型 | 一般的な入力フィールド | 一般的なユースケース |
| --- | --- | --- | --- |
| `BM25` | `SPARSE_FLOAT_VECTOR` | アナライザーが有効な `VARCHAR` フィールド | 語彙検索とキーワードの関連性 |
| `MINHASH` | `BINARY_VECTOR` | `VARCHAR` フィールド | 近似重複の検出 |

各 Function の動作の詳細については、[BM25 Function](./bm25-function) と [MinHash Function](./minhash-function) を参照してください。

生成されるベクトルフィールドはコレクションにまだ存在していてはならず、Null 許容にすることもできません。Function の入力フィールドは、すでに存在している必要があります。

**例：BM25 Function とその生成スパースベクトルフィールドの追加**

次の例では、`text_bm25` という名前の BM25 Function と、その生成スパースベクトルフィールドである `text_sparse` を既存のコレクションに追加します。コレクションには、アナライザーが有効な `text` という名前の `VARCHAR` フィールドがすでに存在している必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"}]}>
<TabItem value='python'>

```python
sparse_field = client.create_field_schema(
    name="text_sparse",
    data_type=DataType.SPARSE_FLOAT_VECTOR,
    desc="BM25-generated sparse vector field",
)

bm25_function = Function(
    name="text_bm25",
    input_field_names=["text"],
    output_field_names=["text_sparse"],
    function_type=FunctionType.BM25,
)

index_params = client.prepare_index_params()

index_params.add_index(
    field_name="text_sparse",
    index_type="SPARSE_INVERTED_INDEX",
    metric_type="BM25",
    params={
        "inverted_index_algo": "DAAT_MAXSCORE",
        "bm25_k1": 1.2,
        "bm25_b": 0.75,
    },
)

# highlight-start
client.add_function_field(
    collection_name="product_catalog",
    field_schema=sparse_field,
    func=bm25_function,
    index_params=index_params,
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
// Add a BM25 function, its generated sparse vector field, and the bound index
client.addFunctionField(AddFunctionFieldReq.builder()
        .collectionName("product_catalog")
        .fieldName("text_sparse")
        .dataType(DataType.SparseFloatVector)
        .indexParam(IndexParam.builder()
                .fieldName("text_sparse")
                .indexType(IndexParam.IndexType.SPARSE_INVERTED_INDEX)
                .metricType(IndexParam.MetricType.BM25)
                .build())
        .function(CreateCollectionReq.Function.builder()
                .name("text_bm25")
                .functionType(FunctionType.BM25)
                .inputFieldNames(Collections.singletonList("text"))
                .outputFieldNames(Collections.singletonList("text_sparse"))
                .build())
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// Add a BM25 function, its generated sparse vector field, and the bound index
field := entity.NewField().
    WithName("text_sparse").
    WithDataType(entity.FieldTypeSparseVector)
function := entity.NewFunction().
    WithName("text_bm25").
    WithType(entity.FunctionTypeBM25).
    WithInputFields("text").
    WithOutputFields("text_sparse")
boundIndex := index.NewSparseInvertedIndex(entity.BM25, 0.2)
err = client.AddFunctionField(ctx, milvusclient.NewAddFunctionFieldOption("product_catalog", field, function, boundIndex))
if err != nil {
    log.Fatal("failed to add function field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
// Add a BM25 function, its generated sparse vector field, and the bound index
client
    .add_function_field(
        AddFunctionFieldRequest::builder()
            .collection_name("product_catalog")
            .field(
                FieldSchema::new()
                    .name("text_sparse")
                    .data_type(DataType::SparseFloatVector),
            )
            .function(
                Function::new()
                    .name("text_bm25")
                    .function_type(FunctionType::Bm25)
                    .input_fields(["text"])
                    .output_fields(["text_sparse"]),
            )
            .index(
                IndexParam::new()
                    .field_name("text_sparse")
                    .index_type(IndexType::SparseInvertedIndex)
                    .metric_type(MetricType::Bm25),
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
// Add a BM25 function, its generated sparse vector field, and the bound index
milvus::FieldSchema sparse_field("text_sparse", milvus::DataType::SPARSE_FLOAT_VECTOR);
milvus::FunctionPtr function = std::make_shared<milvus::Function>("text_bm25", milvus::FunctionType::BM25);
function->AddInputFieldName("text");
function->AddOutputFieldName("text_sparse");
milvus::IndexDesc index("text_sparse", "", milvus::IndexType::SPARSE_INVERTED_INDEX, milvus::MetricType::BM25);
status = client->AddFunctionField(milvus::AddFunctionFieldRequest()
                                      .WithCollectionName("product_catalog")
                                      .WithField(std::move(sparse_field))
                                      .WithFunction(function)
                                      .WithIndex(std::move(index)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Add a BM25 function, its generated sparse vector field, and the bound index

await client.addFunctionField({
    collection_name: "product_catalog",
    field: {
        name: "text_sparse",
        data_type: "SparseFloatVector",
    },
    function: {
        name: "text_bm25",
        type: "BM25",
        input_field_names: ["text"],
        output_field_names: ["text_sparse"],
    },
    extra_params: {
        index_type: "SPARSE_INVERTED_INDEX",
        metric_type: "BM25",
        params: {
            inverted_index_algo: "DAAT_MAXSCORE",
            bm25_k1: 1.2,
            bm25_b: 0.75,
        },
    },
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
await client.AddFunctionFieldAsync(new AddFunctionFieldReq
{
    CollectionName = "product_catalog",
    Field = FieldSchema.CreateSparseFloatVector("text_sparse", description: "BM25-generated sparse vector field"),
    Function = FunctionSchema.CreateBm25("text_bm25", "text", "text_sparse"),
    IndexParam = new IndexParam("text_sparse", "text_sparse", IndexType.SparseInvertedIndex, MetricType.Bm25)
    {
        ExtraParams = { ["inverted_index_algo"] = "DAAT_MAXSCORE", ["bm25_k1"] = "1.2", ["bm25_b"] = "0.75" }
    }
});
```

</TabItem>

</Tabs>

`index_params` オブジェクトには、新しい Function 出力フィールドのインデックス定義を正確に 1 つ含める必要があります。Zilliz Cloud は、Function、その生成ベクトルフィールド、およびバインドされたインデックス定義を同じスキーマ変更で追加します。`add_function_field()` の後に `create_index()` を別途呼び出さないでください。

概念的には、この操作は次の Function、生成出力フィールド、およびバインドされたインデックスの定義を追加します。

```plaintext
New Function:
  name: "text_bm25"
  type: BM25
  input_field_names: ["text"]
  output_field_names: ["text_sparse"]

New generated output field:
  name: "text_sparse"
  data_type: SPARSE_FLOAT_VECTOR
  nullable: false

Bound index:
  field_name: "text_sparse"
  index_type: SPARSE_INVERTED_INDEX
  metric_type: BM25
```

リクエストが成功すると、`describe_collection()` は新しい `text_bm25` Function とその生成された `text_sparse` ベクトルフィールドの両方をコレクションスキーマに返します。Zilliz Cloud は、新しいエンティティが書き込まれるときにその Function 出力を生成します。既存のエンティティについては、Zilliz Cloud がバックグラウンド Compaction を通じて生成ベクトルフィールドを非同期に設定します。スキーマの可視性はスキーマ更新が成功したことを示しますが、すべての既存エンティティのバックフィルが完了したことを示すものではありません。BM25 検索の完全なワークフローについては、[全文検索](./full-text-search) を参照してください。

Zilliz Cloud は、近似重複検出用の MinHash Function とその生成バイナリベクトルフィールドもサポートしています。MinHash Function は `FunctionType.MINHASH` を使用し、新しい `BINARY_VECTOR` 出力フィールドに書き込みます。設定の詳細については、[MinHash Function](./minhash-function) を参照してください。

<a id="drop-fields-from-an-existing-collection"></a>

## 既存コレクションからのフィールドと Function の削除\{#drop-fields-and-functions-from-an-existing-collection}

ユーザー定義フィールドは、コレクションモデルの一部でなくなったときに直接削除できます。Function とその生成ベクトルフィールドを削除するには、Function を削除します。Zilliz Cloud は、同じスキーマ変更で生成フィールドとそのインデックスを削除します。

<a id="drop-user-defined-fields--milvus-30x"></a>

### ユーザー定義フィールドの削除 | PUBLIC\{#drop-user-defined-fields-or-public}

コレクションモデルの一部でなくなったユーザー定義のスカラー、ベクトル、または StructArray フィールドを削除するには、`drop_collection_field()` を使用します。

フィールドを削除すると、まずコレクションスキーマとフィールドの可視性が変更されます。

- `drop_collection_field()` が成功すると、コレクションスキーマが更新されます。`describe_collection()` は削除されたフィールドを返さなくなり、クエリや検索では `output_fields` でそのフィールドを返したり、式で使用したりできなくなります。

- 削除されたフィールドに構築されたインデックスは、スキーマ更新の一部としてクリーンアップされます。

ストレージのクリーンアップは、スキーマのクリーンアップとは別に処理されます。詳細は、[フィールドの削除後にストレージ容量が再利用されるのはいつですか？](#when-is-storage-space-reclaimed-after-dropping-a-field) を参照してください。

**例：ユーザー定義スカラーフィールドの削除**

次の例では、`experiment_tag` が `product_catalog` のユーザー定義スカラーフィールドであると想定し、コレクションから削除します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"}]}>
<TabItem value='python'>

```python
# highlight-start
client.drop_collection_field(
    collection_name="product_catalog",
    field_name="experiment_tag",
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
client.dropCollectionField(DropCollectionFieldReq.builder()
        .collectionName("product_catalog")
        .fieldName("experiment_tag")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err = client.DropCollectionField(ctx, milvusclient.NewDropCollectionFieldOption("product_catalog", "experiment_tag"))
if err != nil {
    log.Fatal("failed to drop field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .drop_collection_field(
        DropCollectionFieldRequest::builder()
            .collection_name("product_catalog")
            .field_name("experiment_tag")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
status = client->DropCollectionField(milvus::DropCollectionFieldRequest()
                                         .WithCollectionName("product_catalog")
                                         .WithFieldName("experiment_tag"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.dropCollectionField({
    collection_name: "product_catalog",
    field_name: "experiment_tag",
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
await client.DropCollectionFieldAsync(new DropCollectionFieldReq
{
    CollectionName = "product_catalog",
    FieldName = "experiment_tag"
});
```

</TabItem>

</Tabs>

フィールドを削除した後、`describe_collection()` を呼び出して、そのフィールドがスキーマの一部でなくなったことを確認できます。

**例：StructArray フィールドの削除**

次の例では、`chunks` が `my_collection` の StructArray フィールドであると想定し、コレクションから削除します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"}]}>
<TabItem value='python'>

```python
# highlight-start
client.drop_collection_field(
    collection_name="my_collection",
    field_name="chunks",
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
client.dropCollectionField(DropCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("chunks")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err = client.DropCollectionField(ctx, milvusclient.NewDropCollectionFieldOption("my_collection", "chunks"))
if err != nil {
    log.Fatal("failed to drop field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .drop_collection_field(
        DropCollectionFieldRequest::builder()
            .collection_name("my_collection")
            .field_name("chunks")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
status = client->DropCollectionField(milvus::DropCollectionFieldRequest()
                                         .WithCollectionName("my_collection")
                                         .WithFieldName("chunks"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.dropCollectionField({
    collection_name: "my_collection",
    field_name: "chunks",
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
await client.DropCollectionFieldAsync(new DropCollectionFieldReq
{
    CollectionName = "my_collection",
    FieldName = "chunks"
});
```

</TabItem>

</Tabs>

**例：ユーザー定義ベクトルフィールドの削除**

同じ `drop_collection_field()` メソッドでベクトルフィールドを削除できますが、削除後もコレクションに少なくとも 1つのベクトルフィールドが含まれている必要があります。これは、一時的に複数のベクトル表現を持ち、後でそのうちの 1つに統一するコレクションに役立ちます。

次の例では、`image_vector` が `hybrid_catalog` のユーザー定義ベクトルフィールドであり、コレクションに `text_vector` などの別のベクトルフィールドがまだ残っていると想定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"}]}>
<TabItem value='python'>

```python
# highlight-start
client.drop_collection_field(
    collection_name="hybrid_catalog",
    field_name="image_vector",
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
client.dropCollectionField(DropCollectionFieldReq.builder()
        .collectionName("hybrid_catalog")
        .fieldName("image_vector")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err = client.DropCollectionField(ctx, milvusclient.NewDropCollectionFieldOption("hybrid_catalog", "image_vector"))
if err != nil {
    log.Fatal("failed to drop field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .drop_collection_field(
        DropCollectionFieldRequest::builder()
            .collection_name("hybrid_catalog")
            .field_name("image_vector")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
status = client->DropCollectionField(milvus::DropCollectionFieldRequest()
                                         .WithCollectionName("hybrid_catalog")
                                         .WithFieldName("image_vector"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.dropCollectionField({
    collection_name: "hybrid_catalog",
    field_name: "image_vector",
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
await client.DropCollectionFieldAsync(new DropCollectionFieldReq
{
    CollectionName = "hybrid_catalog",
    FieldName = "image_vector"
});
```

</TabItem>

</Tabs>

`image_vector` がコレクション内の最後のベクトルフィールドである場合、削除操作は拒否されます。


<a id="drop-a-structarray-sub-field--milvus-306"></a>

### StructArray のサブフィールドの削除 | PUBLIC\{#drop-a-structarray-sub-field-or-public}

Milvus v3.0.x と互換性のある Dedicated クラスターでは、サブフィールドのパスを渡して `drop_collection_field()` を使用することで、StructArray フィールドから個々のサブフィールドを削除できます。この機能は、オンデマンドクラスターではまだ利用できません。Zilliz Cloud は、スキーマからサブフィールドをそのインデックスとともに削除します。そのデータは、[フィールドの削除後にストレージ容量が再利用されるのはいつですか？](#when-is-storage-space-reclaimed-after-dropping-a-field) で説明されているように再利用されます。

次の例では、`chunks` が `my_collection` の `lang` サブフィールドを持つ StructArray フィールドであると想定し、そのサブフィールドのみを削除します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.drop_collection_field(
    collection_name="my_collection",
    field_name="chunks[lang]",
)
# highlight-end
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

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err)
    return
}

// highlight-start
err = cli.DropCollectionField(ctx, milvusclient.NewDropCollectionFieldOption("my_collection", "chunks[lang]"))
// highlight-end
if err != nil {
    fmt.Println(err)
    return
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/drop" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "collectionName": "my_collection",
    "fieldName": "chunks[lang]"
  }'
```

</TabItem>

</Tabs>

StructArray フィールドの最後のサブフィールド、コレクションの最後のベクトルフィールド、または Function で使用されているサブフィールドは削除できません。StructArray フィールド全体を削除するには、前の例に示すように、フィールド名を指定して削除します。サブフィールドを削除した後、そのサブフィールドをまだ含む挿入リクエストおよび upsert リクエストは拒否されます。

そのサブフィールドに対してクエリがまだ実行されている間に削除すると、一時的に失敗する場合があります。古いスキーマに基づいて構築されたクエリプランは、短時間引き続き実行され、内部エラーで失敗します。サブフィールドを削除する前に、そのサブフィールドに対するクエリを完了するか、実行中のクエリが終了した後に削除を再試行してください。


<a id="drop-vector-fields-generated-by-functions--milvus-30x"></a>

<a id="drop-a-function-and-its-generated-vector-field--milvus-30x"></a>

### Function とその生成ベクトルフィールドの削除 | PUBLIC\{#drop-a-function-and-its-generated-vector-field-or-public}

Function やその生成ベクトルフィールド（BM25 Function とその生成スパースベクトルフィールドなど）が不要になった場合は、この操作を使用します。

Function 名を指定して `drop_function_field()` を呼び出します。Zilliz Cloud は、Function の入力フィールドを保持したまま、Function、その生成ベクトルフィールド、および関連するインデックスを削除します。

**例：BM25 Function とその生成スパースベクトルフィールドの削除**

次の例では、`text_bm25` が `product_catalog` の BM25 Function であり、`text_sparse` という名前のスパースベクトル出力フィールドを生成すると想定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"}]}>
<TabItem value='python'>

```python
# highlight-start
client.drop_function_field(
    collection_name="product_catalog",
    function_name="text_bm25",
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
client.dropFunctionField(DropFunctionFieldReq.builder()
        .collectionName("product_catalog")
        .functionName("text_bm25")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err = client.DropFunctionField(ctx, milvusclient.NewDropFunctionFieldOption("product_catalog", "text_bm25"))
if err != nil {
    log.Fatal("failed to drop function field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .drop_function_field(
        DropFunctionFieldRequest::builder()
            .collection_name("product_catalog")
            .function_name("text_bm25")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
status = client->DropFunctionField(milvus::DropFunctionFieldRequest()
                                       .WithCollectionName("product_catalog")
                                       .WithFunctionName("text_bm25"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.dropFunctionField({
    collection_name: "product_catalog",
    function_name: "text_bm25",
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
await client.DropFunctionFieldAsync(new DropFunctionFieldReq
{
    CollectionName = "product_catalog",
    FunctionName = "text_bm25"
});
```

</TabItem>

</Tabs>

操作が成功すると、`describe_collection()` は削除された Function やその生成ベクトルフィールドを返さなくなります。Function の入力フィールドはスキーマに残ります。

Function の出力フィールドを削除した結果、コレクションにベクトルフィールドが 1つも残らなくなる場合、操作は拒否されます。

## よくある質問\{#faq}

### フィールドまたは Function を追加するには、どのメソッドを使用すればよいですか？\{#which-method-should-i-use-to-add-a-field-or-function}

ユーザー定義のスカラーまたはベクトルフィールドを追加するには、`add_collection_field()` を使用します。

要素が同じ Struct スキーマを共有する配列フィールドが必要な場合は、`add_collection_struct_field()` を使用して StructArray フィールドを追加します。

Function、その生成ベクトルフィールド、およびバインドされたインデックス定義を同じスキーマ変更で追加するには、`add_function_field()` を使用します。

### 追加するユーザー定義フィールドを Null 許容にする必要があるのはなぜですか？\{#why-must-added-user-defined-fields-be-nullable}

既存のエンティティは新しいフィールドが存在する前に挿入されているため、そのフィールドの値を持っていません。`nullable=True` を設定すると、アプリケーションが値を書き込むまで、またはスカラーフィールドの場合はデフォルト値が適用されるまで、Zilliz Cloud は欠損値を `NULL` として表現できます。

このルールは、`add_collection_field()` で追加するユーザー定義スカラーフィールドとユーザー定義ベクトルフィールド、および `add_collection_struct_field()` で追加する StructArray フィールドに適用されます。Null 許容にできない Function の生成ベクトルフィールドには適用されません。

### ユーザー定義フィールドを追加すると、既存のエンティティはどうなりますか？\{#what-happens-to-existing-entities-after-i-add-a-user-defined-field}

ユーザー定義スカラーフィールドの場合、`default_value` を設定しない限り、既存のエンティティは `NULL` を返します。`default_value` を設定すると、既存のエンティティはそのデフォルト値を返します。

ユーザー定義ベクトルフィールドの場合、既存のエンティティは新しいベクトルフィールドに対して `NULL` を持ちます。追加されたフィールドでのベクトル検索では、ベクトル値が `NULL` のエンティティはスキップされます。既存のエンティティを新しいベクトルフィールドで検索可能にするには、upsert またはバックフィルワークフローを通じて NULL 以外のベクトル値を書き込みます。新しいエンティティは、挿入時に新しいベクトルフィールドを含めることができます。

StructArray フィールドの場合、既存のエンティティは新しい StructArray フィールドのすべてのサブフィールドに対して `NULL` を返します。新しいエンティティは、フィールド全体に `NULL` を指定するか、すべての Struct 要素のすべてのサブフィールドに有効な値を指定する必要があります。ただし、Milvus v3.0.x と互換性のある Dedicated クラスターの要素レベルで Null 許容のサブフィールドは除きます（オンデマンドクラスターではまだ利用できません）。既存の StructArray フィールドに追加されたサブフィールドの場合、既存のエンティティは各 Struct 要素のそのサブフィールドに対して `NULL` を返します。

### 既存のコレクションに BM25 語彙検索を追加できますか？\{#can-i-add-bm25-lexical-search-to-an-existing-collection}

はい。コレクションにアナライザーが有効な `VARCHAR` フィールドがすでに存在する場合、語彙検索用の BM25 Function とその生成スパースベクトルフィールドを追加できます。このワークフローでは、Zilliz Cloud が Function、新しい `SPARSE_FLOAT_VECTOR` 出力フィールド、およびバインドされたインデックス定義を同じスキーマ変更で追加します。このスキーマ変更ワークフローでは、既存の `TEXT` フィールドを BM25 の入力として使用できません。`TEXT` 入力を使用するには、コレクションの作成時にフィールドと BM25 Function を定義してください。

`add_function_field()` を呼び出すときは、新しい出力フィールド用に、`metric_type="BM25"` を指定した 1 つの `SPARSE_INVERTED_INDEX` インデックスを含む `index_params` オブジェクトを指定します。Zilliz Cloud は、同じスキーマ変更の一部としてインデックス定義を生成フィールドにバインドします。

### Function とその生成ベクトルフィールドを削除するにはどうすればよいですか？\{#how-do-i-drop-a-function-and-its-generated-vector-field}

Function 名を指定して `drop_function_field()` を呼び出します。このスキーマ変更ワークフローでは、Zilliz Cloud が Function の入力フィールドを保持したまま、Function、その生成ベクトルフィールド、および関連するインデックスをまとめて削除します。

### コレクションスキーマを変更した後、待機する必要がありますか？\{#do-i-need-to-wait-after-altering-a-collection-schema}

通常、手動で待機する必要はありません。次の操作が更新されたスキーマに依存する場合は、先に `describe_collection()` を呼び出して、Zilliz Cloud が現在返すスキーマを確認できます。

分散デプロイメントでは、Zilliz Cloud のコンポーネントがコレクションメタデータを更新する間、短い伝播期間が発生することがあります。スキーマ変更直後の操作がスキーマ関連のエラーで失敗する場合は、スキーマを更新して操作を再試行してください。


### 追加したベクトルサブフィールドが FieldNotLoaded エラーで失敗するのはなぜですか？\{#why-does-an-added-vector-sub-field-fail-with-a-fieldnotloaded-error}

ベクトルサブフィールドを追加してそのインデックスを作成した後も、コレクションが準備完了を報告していても、新しいサブフィールドに対するクエリはエラー 2027（`FieldNotLoaded`）で失敗する場合があります。コレクションを解放して再ロードしてください。その後、クエリは新しいサブフィールドを対象にするようになります。


### フィールドの削除後にストレージ容量が再利用されるのはいつですか？\{#when-is-storage-space-reclaimed-after-dropping-a-field}

フィールドを削除すると、そのフィールドは現在のスキーマおよび通常のクエリ/search 可視性から削除されますが、そのフィールドの履歴データがオブジェクトストレージから直ちに物理削除されるわけではありません。

ストレージ容量は、後で Compaction 中に再利用されることがあります。Compaction は、既存のデータファイルを新しくよりコンパクトなファイルに再編成するバックグラウンドプロセスです。フィールドが削除されると、新しく Compaction されたファイルは現在のスキーマに従い、削除されたフィールドを含めません。Zilliz Cloud は、フィールドの削除後にストレージ容量が直ちに、または一定時間内に削減されることを保証しません。

### 動的フィールドのキーと同じ名前のスカラーフィールドを追加するとどうなりますか？\{#what-happens-if-i-add-a-scalar-field-with-the-same-name-as-a-dynamic-field-key}

動的フィールドが有効な場合、既存の動的フィールドキーと同じ名前のスカラーフィールドを追加できます。新しいスカラーフィールドは通常のクエリ出力で動的フィールドキーをマスクしますが、元の動的データは `$meta` に保持されます。

たとえば、既存のエンティティが `source` という名前の動的キーを格納しており、後で `source` という名前のスカラーフィールドを追加するとします。この場合、`source` の通常の出力はスカラーフィールドを参照します。元の動的値にアクセスするには、`$meta["source"]` などの `$meta` パス構文を使用します。
