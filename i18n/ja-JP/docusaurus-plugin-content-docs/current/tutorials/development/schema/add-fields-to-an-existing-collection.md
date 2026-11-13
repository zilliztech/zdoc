---
title: "コレクションスキーマの変更 | Cloud"
slug: /add-fields-to-an-existing-collection
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "既存のコレクションスキーマを変更して、ユーザー定義フィールドや、生成ベクトルフィールドを持つ Function を追加または削除します。 | Cloud"
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

コレクションが開発段階から本番環境へ移行するにつれて、そのスキーマはしばしば変化します。フィルタリングやアプリケーションロジック用に `source_uri` や `review_status` などのスカラーフィールドを追加したり、アプリケーションが生成した埋め込み用に新しいベクトルフィールドを追加したり、既存テキストに対する字句検索用に BM25 Function とその生成スパースベクトルフィールドを追加したり、不要になったフィールドや Function を削除したりすることがあります。コレクションスキーマの変更を使用すると、コレクションを再作成せずに、サポートされているフィールドと Function の変更をインプレースで適用できます。

<Admonition type="info" icon="📘" title="Notes">

このガイドでは、マネージドコレクションにおけるユーザー定義フィールドと、生成ベクトルフィールドを持つ Function のスキーマ変更について説明します。外部コレクションにフィールドを追加する場合は、[外部コレクションスキーマの変更](./alter-external-collection-schema) を参照してください。`VARCHAR` フィールドの `max_length` や `ARRAY` フィールドの `max_capacity` を変更するなど、フィールドプロパティを変更する場合は、[コレクションフィールドの変更](./alter-collection-field) を参照してください。ダイナミックフィールドの動作については、[ダイナミックフィールド](./enable-dynamic-field) と [コレクションの変更](https://milvus.io/docs/modify-collection.md) を参照してください。

</Admonition>

## 制限事項\{#limits}

**ユーザー定義フィールドを追加する**

- 追加するユーザー定義フィールドは nullable である必要があります。`add_collection_field()` を呼び出すときは、`nullable=True` を設定します。既存のエンティティでは、`default_value` を指定したスカラーフィールドを追加しない限り、追加したフィールドは `NULL` になります。

- ユーザー定義スカラーフィールドの追加は、Milvus 2.6.x 以降でサポートされています。ユーザー定義ベクトルフィールドの追加は、Milvus 2.6.18 以降でサポートされています。

- Nullable な StructArray フィールド、および StructArray フィールドの動的追加は、Dedicated クラスターと On-Demand クラスターでサポートされています。動的に追加する StructArray フィールドは nullable である必要があります。

- 既存の StructArray フィールドへのサブフィールドの追加は、Milvus v3.0.x と互換性のある Dedicated クラスターでサポートされています。On-Demand クラスターではまだ利用できません。追加するサブフィールドは、要素レベルの null を許可する必要があり（スカラーまたはベクトルのサブフィールドでは `nullable=True`、配列サブフィールドでは `element_nullable=True`）、デフォルト値を持てず、同じリクエスト内でインデックスにバインドすることもできません。

- フィールド名は、コレクション内のフィールド間で一意である必要があります。

**Function とその生成ベクトルフィールドを追加する**

- スキーマの更新ごとに追加できる Function と生成ベクトルフィールドは、それぞれ 1 つだけです。

- サポートされている Function によって、生成されるベクトルフィールドの型が決まります。`BM25` は `SPARSE_FLOAT_VECTOR` フィールドを生成し、`MINHASH` は `BINARY_VECTOR` フィールドを生成します。

- 生成されるベクトルフィールドは新しいフィールドである必要があります。コレクションスキーマにすでに存在するフィールドを指すことはできません。

- 生成されるベクトルフィールドは nullable にできません。

- Function が使用する入力フィールドは、あらかじめコレクションに存在している必要があります。

- 既存のコレクションに BM25 または MinHash Function を追加する場合、Function の入力は `VARCHAR` フィールドである必要があります。このワークフローでは `TEXT` 入力はサポートされていません。これは、Zilliz Cloud がその入力型から既存のエンティティ向けの生成出力をバックフィルできないためです。

**ユーザー定義フィールドを削除する**

- コレクション内の主キーフィールド、パーティションキーフィールド、クラスタリングキーフィールド、または最後のベクトルフィールドは削除できません。

- ARRAY&lt;STRUCT&gt; フィールド全体を削除できます。Milvus v3.0.x と互換性のある Dedicated クラスターでは、ARRAY&lt;STRUCT&gt; フィールドの最後のサブフィールドを除き、`chunks[lang]` などのパスを指定して個々のサブフィールドも削除できます。この機能は On-Demand クラスターではまだ利用できません。

- Function の入力フィールドとして使用されているフィールド、または Function の出力として生成されたフィールドは、直接削除できません。Function の出力フィールドを削除するには、そのフィールドを生成する Function を削除します。

**Function とその生成ベクトルフィールドを削除する**

- このスキーマ変更ワークフローでは、Function を削除すると、その Function、生成ベクトルフィールド、および関連するインデックスが削除されます。Function の入力フィールドはコレクションスキーマに残ります。

- 生成ベクトルフィールドを削除するとコレクションにベクトルフィールドがなくなってしまう場合、その Function の削除は拒否されます。

<Admonition type="info" icon="📘" title="Notes">

サポートされている追加および削除操作以外のスキーマ変更については、コレクションを再作成または移行してください。

</Admonition>

<a id="add-fields-to-an-existing-collection"></a>

## 既存コレクションにフィールドと Function を追加する\{#add-fields-and-functions-to-an-existing-collection}

ユーザー定義フィールドを追加するか、ベクトルフィールドを生成する Function を追加するかに応じて、ワークフローを選択します：

- [ユーザー定義スカラーフィールドを追加する](#add-user-defined-scalar-fields) は、フィルタリング、クエリ出力、またはアプリケーションロジック用の新しいメタデータが必要な場合に使用します。

- [StructArray フィールドを追加する](#add-structarray-fields-or-public) は、要素が同じ Struct スキーマを共有する配列フィールドが必要な場合に使用します。

- [ユーザー定義ベクトルフィールドを追加する](#add-user-defined-vector-fields) は、アプリケーションが埋め込みを生成し、ベクトル値を Zilliz Cloud に書き込む場合に使用します。

- [Function とその生成ベクトルフィールドを追加する](#add-a-function-and-its-generated-vector-field-or-public) は、Zilliz Cloud が既存のフィールドからベクトル値を生成する場合に使用します。たとえば、テキストから BM25 スパースベクトルや MinHash シグネチャを生成する場合です。

- [既存の StructArray フィールドにサブフィールドを追加する](#add-a-sub-field-to-an-existing-structarray-field-or-public) は、既存の Struct 要素に新しい属性が必要な場合に使用します。Milvus v3.0.x と互換性のある Dedicated クラスターでサポートされています。On-Demand クラスターではまだ利用できません。

いずれの場合も、新しいフィールド名はコレクション内にまだ存在していてはならず、フィールドの総数は Zilliz Cloud のフィールド数上限を超えることはできません。詳細については、[Zilliz Cloud の制限事項](./limits) を参照してください。

<a id="add-user-defined-scalar-fields--milvus-26x"></a>

### ユーザー定義スカラーフィールドを追加する\{#add-user-defined-scalar-fields}

既存のコレクションにユーザー定義スカラーフィールドを追加するには、`add_collection_field()` を使用します。

これは、動的フィールドに任意のキーを保存する場合とは異なります。スキーマ更新が利用可能になった後、新しいスカラーフィールドはコレクションスキーマの通常の一部になります。このフィールドに値を挿入または upsert し、サポートされている場合はインデックスを作成し、クエリや検索フィルターで使用し、クエリまたは検索の出力で返すことができます。

既存のエンティティは新しいフィールドが存在する前に挿入されているため、追加するすべてのユーザー定義スカラーフィールドは nullable である必要があります：

- `nullable=True` を指定し、`default_value` を指定せずにスカラーフィールドを追加した場合、既存のエンティティでは新しいフィールドに対して `NULL` が返されます。

- `nullable=True` と `default_value` を指定してスカラーフィールドを追加した場合、既存のエンティティでは `NULL` の代わりにデフォルト値が返されます。

スカラーフィルター式は `NULL` のスカラー値と一致しません。詳細については、[Nullable Fields](./nullable-fields) を参照してください。

**例：nullable なスカラーフィールドを追加する**

次の例では、`product_catalog` という名前の既存のコレクションに、nullable な `source` フィールドを追加します。

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

フィールドの追加後、コレクションにすでに存在していたエンティティでは、`source` に対して `NULL` が返されます。新しいエンティティでは、insert または upsert の際に `source` を設定できます。

**例：デフォルト値を持つスカラーフィールドを追加する**

既存のエンティティで `NULL` の代わりに具体的な値を返す必要がある場合は、スカラーフィールドを追加するときに `default_value` を指定します。次の例では、`review_status` フィールドを追加し、デフォルト値として `"unreviewed"` を使用します。

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

フィールドの追加後、コレクションにすでに存在していたエンティティでは、`review_status` に対して `"unreviewed"` が返されます。新しいエンティティでは、別の値を設定するか、値が指定されていない場合にデフォルト値を使用できます。

<a id="add-structarray-fields--milvus-300"></a>

### StructArray フィールドを追加する | PUBLIC\{#add-structarray-fields-or-public}

`add_collection_struct_field()` を使用して、Struct 要素の配列を受け入れる StructArray フィールドを追加します。StructArray フィールドを追加するには、次の手順を実行します：

1. サポートされているデータ型の必要なサブフィールドを含む Struct スキーマを作成します。該当するデータ型については、[StructArray の制限事項](./struct-array-limits#supported-subfield-data-types) を参照してください。

1. 上で作成した Struct スキーマを参照し、`add_collection_struct_field()` でフィールドの最大容量を設定します。

1. リクエストで `nullable=True` を設定します。

**例：nullable な StructArray フィールドを追加する**

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

StructArray フィールドを追加すると、コレクションにすでに存在するエンティティでは、すべてのサブフィールドにわたって `chunks` に対して `NULL` が返されます。新しいエンティティを挿入する場合、各 Struct 要素はすべてのサブフィールドに値を指定する必要があり、Struct 要素自体を `NULL` にすることはできません。Milvus v3.0.x と互換性のある Dedicated クラスターでは、要素レベルの null を許可するサブフィールドに、個々の Struct 要素内で `NULL` を保持できます。詳細については、[StructArray フィールドの作成](./create-struct-array) を参照してください。


<a id="add-a-sub-field-to-an-existing-structarray-field--milvus-306"></a>

### 既存の StructArray フィールドにサブフィールドを追加する | PUBLIC\{#add-a-sub-field-to-an-existing-structarray-field-or-public}

`add_collection_field()` でフィールド名にサブフィールドパスを指定して、すでにデータを保持している StructArray フィールドにサブフィールドを追加します。このワークフローは、Milvus v3.0.x と互換性のある Dedicated クラスターでサポートされています。On-Demand クラスターではまだ利用できません。サブフィールドを追加するには、次の手順を実行します：

1. フィールド名には、`chunks[lang]` などのパス `structArrayField[subField]` を指定します。

1. StructArray でサポートされているスカラー、ベクトル、またはスカラー配列のデータ型を選択します。

1. 追加するサブフィールドには `nullable=True` を設定します。これは、追加するすべてのサブフィールドに必要であり、要素レベルの null を許可するための設定です。配列のサブフィールドでは、内部配列内の null 値を許可するために `element_nullable=True` も設定します。サブフィールドは、行レベルの `nullable` 設定と StructArray フィールドの `max_capacity` を継承します。

**例：要素レベルの null を許可するサブフィールドを追加する**

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

サブフィールドを追加すると、既存のエンティティでは、各 Struct 要素の `chunks[lang]` に対して `NULL` が返され、`chunks` フィールドが `NULL` であるエンティティは `NULL` のままになります。新しいエンティティでは、サブフィールドを省略するか、任意の Struct 要素で `NULL` に設定できます。

次のルールが適用されます：

- 追加するサブフィールドは `nullable=True` を指定して作成する必要があり、配列のサブフィールドを追加する場合は、内部配列内の null 値を許可するために `element_nullable=True` も指定します。デフォルト値は設定できません。

- サブフィールドの追加時にインデックスをバインドすることはできません。インデックスは、別途 `create_index()` を呼び出して作成します。追加したベクトルサブフィールドは要素レベルのメトリクスのみをサポートし、`MAX_SIM*` はサポートしません。また、新しいサブフィールドを含めてコレクションをロードする前に、そのサブフィールドにインデックスが存在している必要があります。

- 履歴セグメントは、スキーマバージョンの Compaction を通じて、追加されたサブフィールドとそのインデックスを受け取ります。`dataCoord.compaction.bumpSchemaVersion.enabled` を `true` に設定してください（デフォルトは `false` です）。そうでない場合、追加したサブフィールドのインデックスは履歴セグメントをカバーしません。

- ロード済みのコレクションにサブフィールドを追加しても、コレクションはリリースされません。インデックスが存在する前に、クエリが新しいサブフィールドを返す場合があります。


- スキーマのタイムスタンプを固定しているクライアントは、スキーマ不一致エラーを受け取るため、他の追加フィールドの場合と同様に、スキーマを更新する必要があります。

<a id="add-user-defined-vector-fields--milvus-2618"></a>

### ユーザー定義ベクトルフィールドを追加する\{#add-user-defined-vector-fields}

アプリケーションが埋め込みを生成し、ベクトル値を Zilliz Cloud に書き込む場合は、`add_collection_field()` を使用してユーザー定義ベクトルフィールドを追加します。

追加するすべてのユーザー定義ベクトルフィールドは nullable である必要があります。既存のエンティティは、upsert またはバックフィルワークフローを通じてベクトル値を書き込むまで、新しいベクトルフィールドに対して `NULL` を持ちます。新しいエンティティは、insert の際にベクトルフィールドを含めることができます。ベクトル検索では、ベクトル値が `NULL` のエンティティはスキップされます。詳細については、[Nullable Fields](./nullable-fields) を参照してください。

**例：nullable なベクトルフィールドを追加する**

次の例では、`embedding_v2` という名前の nullable な密ベクトルフィールドを既存のコレクションに追加します。`dim` には、アプリケーションが生成する埋め込みの次元数を設定します。

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

フィールドの追加後、新しいベクトルフィールドを検索する前に、そのフィールドにインデックスを作成します：

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

既存のエンティティは `embedding_v2` に `NULL` を持ち、このフィールドで検索するとスキップされます。既存のエンティティを `embedding_v2` で検索可能にするには、upsert またはバックフィルワークフローを通じて NULL 以外のベクトル値を書き込みます。新しいエンティティでは、挿入時に `embedding_v2` を含めることができます。

<a id="add-vector-fields-generated-by-functions--milvus-30x"></a>

<a id="add-a-function-and-its-generated-vector-field--milvus-30x"></a>

### Function とその生成ベクトルフィールドを追加する | PUBLIC\{#add-a-function-and-its-generated-vector-field-or-public}

このワークフローは、Zilliz Cloud が既存のコレクションにすでに保存されているデータから新しいベクトルフィールドを生成する場合に使用します。この操作では、関連する 3 つのスキーマ要素が追加されます：

- 既存の 1 つ以上の入力フィールドから読み取る Function 定義。

- Function の出力を格納する新しいベクトルフィールド。

- 新しいベクトルフィールドにバインドされたインデックス定義。

たとえば、BM25 Function は既存の `VARCHAR` フィールドを読み取り、字句検索用の `SPARSE_FLOAT_VECTOR` フィールドを生成します。MinHash Function は、ほぼ重複するデータの検出用に `BINARY_VECTOR` フィールドを生成します。このワークフローでは、Function の入力フィールドを追加または置換しません。

このスキーマ変更ワークフローは、Zilliz Cloud の On-Demand クラスターで利用できます。

サポートされている Function によって、生成されるベクトルフィールドの型が決まります：

| Function | 生成ベクトルフィールドの型 | 一般的な入力フィールド | 一般的なユースケース |
| --- | --- | --- | --- |
| `BM25` | `SPARSE_FLOAT_VECTOR` | アナライザーが有効な `VARCHAR` フィールド | 字句検索とキーワードの関連性 |
| `MINHASH` | `BINARY_VECTOR` | `VARCHAR` フィールド | ほぼ重複するデータの検出 |

各 Function の動作の詳細については、[BM25 Function](./bm25-function) と [MinHash Function](./minhash-function) を参照してください。

生成されるベクトルフィールドはコレクション内にまだ存在してはならず、nullable にすることもできません。Function の入力フィールドはすでに存在している必要があります。

**例：BM25 Function とその生成スパースベクトルフィールドを追加する**

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

`index_params` オブジェクトには、新しい Function 出力フィールドのインデックス定義を 1 つだけ含める必要があります。Zilliz Cloud は、同じスキーマ変更で Function、その生成ベクトルフィールド、およびバインドされたインデックス定義を追加します。`add_function_field()` の後に `create_index()` を別途呼び出さないでください。

概念的には、この操作では次の Function、生成出力フィールド、およびバインドされたインデックス定義を追加します：

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

リクエストが成功すると、`describe_collection()` はコレクションスキーマ内の新しい `text_bm25` Function と、その生成ベクトルフィールドである `text_sparse` の両方を返します。Zilliz Cloud は、新しいエンティティが書き込まれるときに Function の出力を生成します。既存のエンティティについては、Zilliz Cloud がバックグラウンドの Compaction を通じて生成ベクトルフィールドを非同期で設定します。スキーマの可視性はスキーマ更新が成功したことを確認しますが、すべての既存エンティティでバックフィルが完了したことを示すものではありません。BM25 検索の完全なワークフローについては、[全文検索](./full-text-search) を参照してください。

Zilliz Cloud は、ほぼ重複するデータの検出用に MinHash Function とその生成バイナリベクトルフィールドもサポートしています。MinHash Function は `FunctionType.MINHASH` を使用し、新しい `BINARY_VECTOR` 出力フィールドに書き込みます。設定の詳細については、[MinHash Function](./minhash-function) を参照してください。

<a id="drop-fields-from-an-existing-collection"></a>

## 既存コレクションからフィールドと Function を削除する\{#drop-fields-and-functions-from-an-existing-collection}

ユーザー定義フィールドがコレクションモデルの一部でなくなった場合は、そのフィールドを直接削除できます。Function とその生成ベクトルフィールドを削除するには、Function を削除します。Zilliz Cloud は、同じスキーマ変更で生成フィールドとそのインデックスを削除します。

<a id="drop-user-defined-fields--milvus-30x"></a>

### ユーザー定義フィールドを削除する | PUBLIC\{#drop-user-defined-fields-or-public}

`drop_collection_field()` を使用して、コレクションモデルの一部でなくなったユーザー定義のスカラー、ベクトル、または StructArray フィールドを削除します。

フィールドを削除すると、まずコレクションスキーマとフィールドの可視性が変更されます：

- `drop_collection_field()` が成功すると、コレクションスキーマが更新されます。`describe_collection()` は削除されたフィールドを返さなくなり、クエリや検索では、そのフィールドを `output_fields` で返したり、式で使用したりできなくなります。

- 削除されたフィールドに構築されたインデックスは、スキーマ更新の一部としてクリーンアップされます。

ストレージのクリーンアップは、スキーマのクリーンアップとは別に処理されます。詳細については、[フィールドを削除した後、ストレージ容量はいつ解放されますか？](#when-is-storage-space-reclaimed-after-dropping-a-field) を参照してください。

**例：ユーザー定義スカラーフィールドを削除する**

次の例では、`experiment_tag` が `product_catalog` 内のユーザー定義スカラーフィールドであることを前提とし、これをコレクションから削除します。

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

**例：StructArray フィールドを削除する**

次の例では、`chunks` が `my_collection` 内の StructArray フィールドであることを前提とし、そのフィールドをコレクションから削除します。

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

**例：ユーザー定義ベクトルフィールドを削除する**

同じ `drop_collection_field()` メソッドでベクトルフィールドを削除できますが、削除後もコレクションに少なくとも 1 つのベクトルフィールドが含まれている必要があります。これは、一時的に複数のベクトル表現を保持し、後でそのうちの 1 つに統一するコレクションに役立ちます。

次の例では、`image_vector` が `hybrid_catalog` 内のユーザー定義ベクトルフィールドであり、コレクションに `text_vector` などの別のベクトルフィールドがまだ残っていることを前提としています。

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

### StructArray のサブフィールドを削除する | PUBLIC\{#drop-a-structarray-sub-field-or-public}

Milvus v3.0.x と互換性のある Dedicated クラスターでは、サブフィールドパスを渡すことで、`drop_collection_field()` を使用して StructArray フィールドから個々のサブフィールドを削除できます。この機能は On-Demand クラスターではまだ利用できません。Zilliz Cloud は、そのインデックスとともにサブフィールドをスキーマから削除します。データは、[フィールドを削除した後、ストレージ容量はいつ解放されますか？](#when-is-storage-space-reclaimed-after-dropping-a-field) の説明に従って解放されます。

次の例では、`chunks` が `my_collection` 内の `lang` サブフィールドを持つ StructArray フィールドであることを前提とし、そのサブフィールドのみを削除します。

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

StructArray フィールドの最後のサブフィールド、コレクションの最後のベクトルフィールド、または Function で使用されているサブフィールドは削除できません。StructArray フィールド全体を削除するには、前の例に示すように、名前で削除します。サブフィールドを削除した後、そのサブフィールドを引き続き含む insert および upsert リクエストは拒否されます。

サブフィールドに対するクエリがまだ実行されている間にそのサブフィールドを削除すると、一時的に失敗する場合があります。古いスキーマに基づいて作成されたクエリプランは短時間実行され続け、内部エラーで失敗します。サブフィールドを削除する前に、そのサブフィールドに対するクエリを完了するか、実行中のクエリが終了した後に削除を再試行してください。


<a id="drop-vector-fields-generated-by-functions--milvus-30x"></a>

<a id="drop-a-function-and-its-generated-vector-field--milvus-30x"></a>

### Function とその生成ベクトルフィールドを削除する | PUBLIC\{#drop-a-function-and-its-generated-vector-field-or-public}

Function またはその生成ベクトルフィールド（BM25 Function とその生成スパースベクトルフィールドなど）が不要になった場合は、この操作を使用します。

Function 名を指定して `drop_function_field()` を呼び出します。Zilliz Cloud は、Function の入力フィールドを保持したまま、Function、その生成ベクトルフィールド、および関連するインデックスを削除します。

**例：BM25 Function とその生成スパースベクトルフィールドを削除する**

次の例では、`text_bm25` が `product_catalog` 内の BM25 Function であり、`text_sparse` という名前のスパースベクトル出力フィールドを生成することを前提としています。

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

操作が成功すると、`describe_collection()` は削除された Function またはその生成ベクトルフィールドを返さなくなります。Function の入力フィールドはスキーマに残ります。

Function 出力フィールドを削除するとコレクションにベクトルフィールドがなくなってしまう場合、その操作は拒否されます。

## FAQ\{#faq}

### フィールドまたは Function を追加するにはどの方法を使用すればよいですか？\{#which-method-should-i-use-to-add-a-field-or-function}

ユーザー定義のスカラーまたはベクトルフィールドを追加するには、`add_collection_field()` を使用します。

要素が同じ Struct スキーマを共有する配列フィールドが必要な場合は、`add_collection_struct_field()` を使用して StructArray フィールドを追加します。

同じスキーマ変更で Function、その生成ベクトルフィールド、およびバインドされたインデックス定義を追加するには、`add_function_field()` を使用します。

### 追加するユーザー定義フィールドはなぜ nullable である必要がありますか？\{#why-must-added-user-defined-fields-be-nullable}

既存のエンティティは新しいフィールドが存在する前に挿入されているため、そのフィールドの値を持っていません。`nullable=True` を設定すると、アプリケーションが値を書き込むまで、またはスカラーフィールドの場合はデフォルト値が適用されるまで、Zilliz Cloud は欠落値を `NULL` として表すことができます。

このルールは、`add_collection_field()` で追加するユーザー定義のスカラーフィールドとユーザー定義のベクトルフィールド、および `add_collection_struct_field()` で追加する StructArray フィールドに適用されます。nullable にできない Function の生成ベクトルフィールドには適用されません。

### ユーザー定義フィールドを追加した後、既存のエンティティはどうなりますか？\{#what-happens-to-existing-entities-after-i-add-a-user-defined-field}

ユーザー定義スカラーフィールドの場合、`default_value` を設定しない限り、既存のエンティティは `NULL` を返します。`default_value` を設定した場合は、既存のエンティティはそのデフォルト値を返します。

ユーザー定義ベクトルフィールドの場合、既存のエンティティは新しいベクトルフィールドに `NULL` を持ちます。追加したフィールドでのベクトル検索では、ベクトル値が `NULL` のエンティティはスキップされます。既存のエンティティを新しいベクトルフィールドで検索可能にするには、upsert またはバックフィルワークフローを使用して NULL 以外のベクトル値を書き込みます。新しいエンティティは、insert 時に新しいベクトルフィールドを含めることができます。

StructArray フィールドの場合、既存のエンティティは、新しい StructArray フィールドのすべてのサブフィールドに対して `NULL` を返します。新しいエンティティは、フィールド全体に `NULL` を指定するか、すべての Struct 要素内のすべてのサブフィールドに有効な値を指定する必要があります。ただし、Milvus v3.0.x と互換性のある Dedicated クラスターで要素レベルの null を許可するサブフィールド（On-Demand クラスターではまだ利用できません）は除きます。既存の StructArray フィールドに追加されたサブフィールドの場合、既存のエンティティは各 Struct 要素内のそのサブフィールドに対して `NULL` を返します。

### 既存のコレクションに BM25 字句検索を追加できますか？\{#can-i-add-bm25-lexical-search-to-an-existing-collection}

はい。コレクションにアナライザーが有効な `VARCHAR` フィールドがすでに存在する場合は、BM25 Function とその生成スパースベクトルフィールドを字句検索用に追加できます。このワークフローでは、Zilliz Cloud は同じスキーマ変更で Function、新しい `SPARSE_FLOAT_VECTOR` 出力フィールド、およびバインドされたインデックス定義を追加します。このスキーマ変更ワークフローでは、既存の `TEXT` フィールドを BM25 の入力として使用できません。`TEXT` 入力を使用するには、コレクションの作成時にフィールドと BM25 Function を定義します。

`add_function_field()` を呼び出すときは、新しい出力フィールド用に、`metric_type="BM25"` を指定した `SPARSE_INVERTED_INDEX` インデックスを 1 つ含む `index_params` オブジェクトを指定します。Zilliz Cloud は、同じスキーマ変更の一部として、インデックス定義を生成フィールドにバインドします。

### Function とその生成ベクトルフィールドを削除するにはどうすればよいですか？\{#how-do-i-drop-a-function-and-its-generated-vector-field}

Function 名を指定して `drop_function_field()` を呼び出します。このスキーマ変更ワークフローでは、Zilliz Cloud は Function の入力フィールドを保持したまま、Function、その生成ベクトルフィールド、および関連するインデックスをまとめて削除します。

### コレクションスキーマを変更した後、待機する必要がありますか？\{#do-i-need-to-wait-after-altering-a-collection-schema}

通常、手動で待機する必要はありません。次の操作が更新後のスキーマに依存する場合は、まず `describe_collection()` を呼び出して、Zilliz Cloud が現在返すスキーマを確認できます。

分散デプロイでは、Zilliz Cloud のコンポーネントがコレクションメタデータを更新する間、短い伝播期間が発生することがあります。スキーマ変更直後の操作がスキーマ関連のエラーで失敗した場合は、スキーマを更新して操作を再試行してください。


### 追加したベクトルサブフィールドが FieldNotLoaded エラーで失敗するのはなぜですか？\{#why-does-an-added-vector-sub-field-fail-with-a-fieldnotloaded-error}

ベクトルサブフィールドを追加してそのインデックスを作成した後も、コレクションが準備完了を報告していても、新しいサブフィールドに対するクエリがエラー 2027（`FieldNotLoaded`）で失敗する場合があります。コレクションをリリースしてから再度ロードしてください。クエリはその後、新しいサブフィールドを対象とするようになります。


### フィールドを削除した後、ストレージ容量はいつ解放されますか？\{#when-is-storage-space-reclaimed-after-dropping-a-field}

フィールドを削除すると、そのフィールドは現在のスキーマおよび通常の query/search の可視性から削除されますが、そのフィールドの履歴データがオブジェクトストレージから直ちに物理削除されるわけではありません。

ストレージ容量は、後で Compaction 中に解放される場合があります。Compaction は、既存のデータファイルを再編成して新しい、よりコンパクトなファイルにするバックグラウンドプロセスです。フィールドを削除した後、新しく Compaction されたファイルは現在のスキーマに従い、削除されたフィールドを除外します。Zilliz Cloud は、フィールド削除後にストレージ容量が即座に、または一定時間で削減されることを保証しません。

### ダイナミックフィールドのキーと同じ名前のスカラーフィールドを追加するとどうなりますか？\{#what-happens-if-i-add-a-scalar-field-with-the-same-name-as-a-dynamic-field-key}

ダイナミックフィールドが有効な場合、既存のダイナミックフィールドキーと同じ名前のスカラーフィールドを追加できます。新しいスカラーフィールドは通常のクエリ出力でダイナミックフィールドキーをマスクしますが、元のダイナミックデータは `$meta` に保持されます。

たとえば、既存のエンティティが `source` という名前のダイナミックキーを格納しており、その後で `source` という名前のスカラーフィールドを追加すると、`source` の通常の出力はスカラーフィールドを指します。元のダイナミック値を取得するには、`$meta["source"]` などの `$meta` パス構文を使用します。
