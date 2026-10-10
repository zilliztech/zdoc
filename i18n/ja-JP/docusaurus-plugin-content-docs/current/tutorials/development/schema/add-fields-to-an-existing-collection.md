---
title: "コレクションスキーマの変更 | Cloud"
slug: /add-fields-to-an-existing-collection
sidebar_label: "スキーマの変更（マネージドコレクション）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "コレクションが開発から本番環境へ移行するにつれて、そのスキーマはしばしば変化します。フィルタリングやアプリケーションロジックのために `sourceuri` や `reviewstatus` などのスカラーフィールドを追加したり、アプリケーションが生成する埋め込み用の新しいベクトルフィールドを追加したり、既存のテキストに対する字句検索のために BM25 Function とその生成スパースベクトルフィールドを追加したり、不要になったフィールドや Function を削除したりすることがあります。Alter コレクション スキーマ を使用すると、コレクションを再作成せずに、サポートされているフィールドと Function の変更をインプレースで実行できます。 | Cloud"
type: origin
token: UR9SwucAIiQ2TYkc9EucsgvSnng
sidebar_position: 18
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションスキーマの変更

コレクションが開発から本番環境へ移行するにつれて、そのスキーマはしばしば変化します。フィルタリングやアプリケーションロジックのために `source_uri` や `review_status` などのスカラーフィールドを追加したり、アプリケーションが生成する埋め込み用の新しいベクトルフィールドを追加したり、既存のテキストに対する字句検索のために BM25 Function とその生成スパースベクトルフィールドを追加したり、不要になったフィールドや Function を削除したりすることがあります。Alter コレクション スキーマ を使用すると、コレクションを再作成せずに、サポートされているフィールドと Function の変更をインプレースで実行できます。

<Admonition type="info" title="Notes">

- このガイドでは、マネージドコレクションにおけるユーザー定義フィールド、およびその生成ベクトルフィールドを伴う Function のスキーマ変更について説明します。`VARCHAR` フィールドの `max_length` や `ARRAY` フィールドの `max_capacity` の変更など、フィールドプロパティの変更については、[コレクションフィールドの変更](./alter-collection-field) を参照してください。動的フィールドの動作については、[動的フィールド](./enable-dynamic-field) および [コレクションの変更](./modify-collections) を参照してください。

- このページでは、マネージドコレクションにフィールドを追加する方法について説明します。外部コレクションにフィールドを追加する場合は、[外部コレクションスキーマの変更](./alter-external-collection-schema) を参照してください。

</Admonition>

## 制限事項\{#limits}

**ユーザー定義フィールドの追加**

- 追加するユーザー定義フィールドは nullable である必要があります。`add_collection_field()` を呼び出すときに `nullable=True` を設定します。既存のエンティティの場合、`default_value` を指定したスカラーフィールドを追加しない限り、追加されたフィールドは `NULL` になります。

- ユーザー定義のスカラーフィールドの追加は、Milvus 2.6.x 以降でサポートされています。ユーザー定義のベクトルフィールドの追加は、Milvus 2.6.18 以降でサポートされています。

- フィールド名は、コレクション内のフィールド間で一意である必要があります。

**Function とその生成ベクトルフィールドの追加**

- 1 回のスキーマ更新で追加できる Function と生成ベクトルフィールドはそれぞれ 1 つだけです。

- サポートされている Function によって、生成されるベクトルフィールドの型が決まります。`BM25` は `SPARSE_FLOAT_VECTOR` フィールドを生成し、`MINHASH` は `BINARY_VECTOR` フィールドを生成します。

- 生成されるベクトルフィールドは新しいフィールドである必要があります。コレクションスキーマにすでに存在するフィールドを指定することはできません。

- 生成されるベクトルフィールドは nullable にできません。

- Function が使用する入力フィールドは、コレクションにすでに存在している必要があります。この既存コレクション向けのワークフローでは、BM25 と MinHash の入力は `VARCHAR` である必要があります。`TEXT` を使用する BM25 Function は、コレクションの作成時に定義してください。

**ユーザー定義フィールドの削除**

- コレクションの主キーフィールド、パーティションキーフィールド、クラスタリングキーフィールド、または最後のベクトルフィールドは削除できません。

- `ARRAY<STRUCT>` フィールド全体は削除できますが、`ARRAY<STRUCT>` フィールド内の個々のサブフィールドは削除できません。

- Function の入力フィールドとして使用されているフィールド、または Function の出力フィールドとして生成されたフィールドを直接削除することはできません。Function の出力フィールドを削除するには、それを生成する Function を削除します。

**Function とその生成ベクトルフィールドの削除**

- このスキーマ変更ワークフローでは、Function を削除すると、その Function、生成されたベクトルフィールド、および関連するインデックスが削除されます。Function の入力フィールドはコレクションスキーマに残ります。

- 生成されたベクトルフィールドを削除するとコレクションにベクトルフィールドが 1 つも残らなくなる場合、Function の削除は拒否されます。

<Admonition type="info" title="Notes">

サポートされている追加および削除操作以外のスキーマ変更を行う場合は、コレクションを再作成または移行してください。

</Admonition>

## 既存のコレクションへのフィールドと Function の追加\{#add-fields-and-functions-to-an-existing-collection}

ユーザー定義フィールドを追加するのか、ベクトルフィールドを生成する Function を追加するのかに応じて、ワークフローを選択してください。

- フィルタリング、クエリ出力、またはアプリケーションロジック用の新しいメタデータが必要な場合は、[ユーザー定義のスカラーフィールドの追加](./add-fields-to-an-existing-collection#add-user-defined-scalar-fields) を行います。

- アプリケーションが埋め込みを生成し、ベクトル値を Zilliz Cloud に書き込む場合は、[ユーザー定義のベクトルフィールドの追加](./add-fields-to-an-existing-collection#add-user-defined-vector-fields) を行います。

- テキストからの BM25 スパースベクトルや MinHash シグネチャなど、既存のフィールドから Zilliz Cloud にベクトル値を生成させる場合は、[Function とその生成ベクトルフィールドの追加](./add-fields-to-an-existing-collection#add-a-function-and-its-generated-vector-field) を行います。

これらの場合、フィールドの総数は Zilliz Cloud のフィールド数上限を超えることはできません。詳細については、[Zilliz Cloud の制限事項](./limits#fields) を参照してください。

### ユーザー定義のスカラーフィールドの追加\{#add-user-defined-scalar-fields}

`add_collection_field()` を使用して、既存のコレクションにユーザー定義のスカラーフィールドを追加します。

これは、動的フィールドに任意のキーを格納する場合とは異なります。スキーマの更新が有効になった後は、新しいスカラーフィールドはコレクションスキーマの通常の一部になります。これに対して値の挿入や upsert を実行し、サポートされている場合はインデックスを作成し、クエリや検索フィルターで使用し、クエリまたは検索の出力で返すことができます。

既存のエンティティは新しいフィールドが存在する前に挿入されているため、追加するすべてのユーザー定義スカラーフィールドは nullable である必要があります。

- `nullable=True` を指定し、`default_value` を指定せずにスカラーフィールドを追加すると、既存のエンティティは新しいフィールドに対して `NULL` を返します。

- `nullable=True` と `default_value` を指定してスカラーフィールドを追加すると、既存のエンティティは `NULL` の代わりにデフォルト値を返します。

スカラーフィルター式は `NULL` のスカラー値には一致しません。詳細については、[Nullable フィールド](./nullable-fields) を参照してください。

**例: nullable なスカラーフィールドの追加**

次の例では、`product_catalog` という名前の既存のコレクションに、nullable な `source` フィールドを追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

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

ConnectConfig connectConfig = ConnectConfig.builder()

        .uri("YOUR_CLUSTER_ENDPOINT")

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
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})

if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

newField := entity.NewField().

    WithName("source").

    WithDataType(entity.FieldTypeVarChar).

    WithNullable(true).

    WithMaxLength(128)

err = cli.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("product_catalog", newField))

if err != nil {
    log.Fatal("failed to add field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");

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

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

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

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

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

<TabItem value='bash'>

```bash
curl --request POST \

     --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/add \

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

フィールドの追加後、コレクションにすでに存在していたエンティティは `source` に対して `NULL` を返します。新しいエンティティは、挿入または upsert の際に `source` を設定できます。

**例: デフォルト値を指定したスカラーフィールドの追加**

既存のエンティティが `NULL` ではなく具体的な値を返すようにする場合は、フィールドの追加時に `default_value` を指定します。次の例では、`review_status` フィールドを追加し、デフォルト値として `"unreviewed"` を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionFieldReq;

ConnectConfig connectConfig = ConnectConfig.builder()

        .uri("YOUR_CLUSTER_ENDPOINT")

        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

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
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})

if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

newField := entity.NewField().

    WithName("review_status").

    WithDataType(entity.FieldTypeVarChar).

    WithNullable(true).

    WithMaxLength(32).

    WithDefaultValueString("unreviewed")

err = cli.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("product_catalog", newField))

if err != nil {
    log.Fatal("failed to add field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");

let client = ClientV2::new(&config).await?;

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

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

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
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

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

<TabItem value='bash'>

```bash
curl --request POST \

     --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/add \

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

フィールドの追加後、コレクションにすでに存在していたエンティティは `review_status` に対して `"unreviewed"` を返します。新しいエンティティは、別の値を設定するか、値を指定しない場合にデフォルト値を使用できます。

### StructArray フィールドの追加\{#add-structarray-fields}

`add_collection_struct_field()` を使用して、構造体の配列を受け入れる StructArray フィールドを追加します。StructArray フィールドを追加するには、次のようにします。

1. サポートされているデータ型の必要なサブフィールドを含む StructSchema を作成します。該当するデータ型については、[データ型のサポート](./use-array-of-structs) を参照してください。

1. 上で作成した StructSchema を参照し、`add_collection_struct_field()` でフィールドの最大容量を設定します。

1. リクエストで `nullable` を `True` に設定します。

**例: nullable な StructArray フィールドの追加**

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionStructFieldReq;
import io.milvus.v2.service.collection.request.AddFieldReq;
import java.util.HashMap;
import java.util.Map;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

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
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})

if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

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

err = cli.AddCollectionStructField(ctx, milvusclient.NewAddCollectionStructFieldOption("books", newField))

if err != nil {
    log.Fatal("failed to add struct field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");

let client = ClientV2::new(&config).await?;

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

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

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
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

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

<TabItem value='bash'>

```bash
# Note: The REST API does not expose a StructArray add-field operation as of v3.0.x. Use the gRPC SDKs instead.
```

</TabItem>
</Tabs>

StructArray フィールドの追加後、コレクションにすでに存在するエンティティは、`chunks` のすべてのサブフィールドに対して null を返します。新しいエンティティを挿入する際は、すべてのサブフィールドが null であるか、有効な値を持つようにしてください。一部のサブフィールドを null に設定し、その他を有効な値に設定してエンティティを挿入すると、エラーが発生します。

### ユーザー定義のベクトルフィールドの追加\{#add-user-defined-vector-fields}

アプリケーションが埋め込みを生成し、ベクトル値を Zilliz Cloud に書き込む場合は、`add_collection_field()` を使用してユーザー定義のベクトルフィールドを追加します。

追加するすべてのユーザー定義ベクトルフィールドは nullable である必要があります。upsert またはバックフィルのワークフローでベクトル値を書き込むまで、既存のエンティティは新しいベクトルフィールドに対して `NULL` を持ちます。新しいエンティティは、挿入の際にそのベクトルフィールドを含めることができます。ベクトル検索は、ベクトル値が `NULL` であるエンティティをスキップします。詳細については、[Nullable フィールド](./nullable-fields) を参照してください。

**例: nullable なベクトルフィールドの追加**

次の例では、`embedding_v2` という名前の nullable な密ベクトルフィールドを既存のコレクションに追加します。`dim` には、アプリケーションが生成する埋め込みの次元数を設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionFieldReq;

ConnectConfig connectConfig = ConnectConfig.builder()

        .uri("YOUR_CLUSTER_ENDPOINT")

        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

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
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})

if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

newField := entity.NewField().

    WithName("embedding_v2").

    WithDataType(entity.FieldTypeFloatVector).

    WithNullable(true).

    WithDim(768)

err = cli.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("product_catalog", newField))

if err != nil {
    log.Fatal("failed to add field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");

let client = ClientV2::new(&config).await?;

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

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

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
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

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

<TabItem value='bash'>

```bash
curl --request POST \

     --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/add \

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

フィールドの追加後、検索する前に新しいベクトルフィールドにインデックスを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.Collections;

ConnectConfig connectConfig = ConnectConfig.builder()

        .uri("YOUR_CLUSTER_ENDPOINT")

        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

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
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})

if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

indexOpt := milvusclient.NewCreateIndexOption("product_catalog", "embedding_v2", index.NewAutoIndex(entity.COSINE))

_, err = cli.CreateIndex(ctx, indexOpt)

if err != nil {
    log.Fatal("failed to create index: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");

let client = ClientV2::new(&config).await?;

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

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

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
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

await client.createIndex({
    collection_name: "product_catalog",
    field_name: "embedding_v2",
    index_type: "AUTOINDEX",
    metric_type: "COSINE",
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \

     --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/indexes/create \

     --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \

     --header "Content-Type: application/json" \

     -d '{
       "collectionName": "product_catalog",
       "indexParams": [
         {
           "fieldName": "embedding_v2",
           "indexType": "AUTOINDEX",
           "metricType": "COSINE"
         }
       ]
     }'
```

</TabItem>
</Tabs>

既存のエンティティは `embedding_v2` に対して `NULL` を持ち、このフィールドで検索する際はスキップされます。`embedding_v2` を通じて既存のエンティティを検索可能にするには、upsert ワークフローで非 NULL のベクトル値を書き込みます。新しいエンティティは、挿入の際に `embedding_v2` を含めることができます。

### Function とその生成ベクトルフィールドの追加\{#add-a-function-and-its-generated-vector-field}

この Milvus 3.0 のスキーマ変更ワークフローは、現在 Zilliz Cloud のオンデマンドクラスター向けに文書化されています。このページは、最初にサポートされる Cloud パッチや Serving クラスター の提供可否を示すものではありません。

このワークフローを使用すると、既存のコレクションにすでに格納されているデータから新しいベクトルフィールドを生成できます。たとえば、BM25 Function は既存の `VARCHAR` フィールドを読み取り、字句検索用の `SPARSE_FLOAT_VECTOR` フィールドを生成します。一方、MinHash Function はニアデュプリケート検出用の `BINARY_VECTOR` フィールドを生成します。このワークフローは、Function の入力フィールドを追加または置換しません。

この操作では、Function 定義、新しいベクトル出力フィールド、およびバインドされたインデックス定義を追加します。

- 既存の入力フィールドから読み取る、`text_bm25` などの Function 定義。

- Function の出力を格納する、`text_sparse` などの新しいベクトル出力フィールド、およびそのフィールドにバインドされたインデックス定義。

サポートされている Function によって、生成されるベクトルフィールドの型が決まります。

| **Function** | **生成されるベクトルフィールドの型** | **一般的な入力フィールド** |
| --- | --- | --- |
| `BM25` | `SPARSE_FLOAT_VECTOR` | アナライザーが有効な `VARCHAR` フィールド |
| `MINHASH` | `BINARY_VECTOR` | `VARCHAR` フィールド |

各 Function の動作の詳細については、[BM25 Function](./bm25-function) および [MinHash Function](./minhash-function) を参照してください。

生成されるベクトルフィールドはコレクションにまだ存在していてはならず、nullable にすることもできません。Function の入力フィールドはすでに存在している必要があります。この既存コレクション向けのワークフローでは、`VARCHAR` の入力を使用します。`TEXT` 入力を使用する BM25 Function は、コレクションの作成時に定義する必要があります。そうでない場合は、その Function をスキーマに含めた状態でコレクションを再作成または移行してください。

**例: BM25 Function とその生成スパースベクトルフィールドの追加**

次の例では、`text_bm25` という名前の BM25 Function と、`text_sparse` という名前のその生成スパースベクトルフィールドを既存のコレクションに追加します。コレクションには、アナライザーが有効な `text` という名前の `VARCHAR` フィールドがすでに存在している必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, Function, FunctionType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

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
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFunctionFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import java.util.Collections;

ConnectConfig connectConfig = ConnectConfig.builder()

        .uri("YOUR_CLUSTER_ENDPOINT")

        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

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
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})

if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

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

err = cli.AddFunctionField(ctx, milvusclient.NewAddFunctionFieldOption("product_catalog", field, function, boundIndex))

if err != nil {
    log.Fatal("failed to add function field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");

let client = ClientV2::new(&config).await?;

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

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

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
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

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

<TabItem value='bash'>

```bash
# Note: The REST /v2/vectordb/collections/add_function endpoint maps to the

# deprecated AddCollectionFunction RPC, which Milvus 3.0 rejects. Adding a

# Function together with its generated vector field and bound index is not

# exposed via the REST API as of v3.0.x; use the gRPC SDKs instead.
```

</TabItem>
</Tabs>

`index_params` オブジェクトには、新しい Function 出力フィールド用のインデックス定義を正確に 1 つ含める必要があります。Function、その生成ベクトルフィールド、およびバインドされたインデックス定義は、同じスキーマ変更で送信されます。`add_function_field()` の後に `create_index()` を別途呼び出さないでください。

概念的には、この操作は次の Function、生成出力フィールド、およびバインドされたインデックス定義を追加します。

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

リクエストが成功すると、`describe_collection()` は新しい `text_bm25` Function とその生成 `text_sparse` ベクトルフィールドの両方をコレクションスキーマに返します。BM25 検索の完全なワークフローについては、[全文検索](./full-text-search) を参照してください。

MinHash Function とその生成バイナリベクトルフィールドは、ニアデュプリケート検出をサポートします。MinHash Function は `FunctionType.MINHASH` を使用し、新しい `BINARY_VECTOR` 出力フィールドに書き込みます。構成の詳細については、[MinHash Function](./minhash-function) を参照してください。

## 既存のコレクションからのフィールドと Function の削除\{#drop-fields-and-functions-from-an-existing-collection}

ユーザー定義フィールドがコレクションモデルの一部でなくなった場合は、それらを直接削除できます。Function とその生成ベクトルフィールドを削除するには、その Function を削除します。生成フィールドとそのインデックスは、同じスキーマ変更で削除されます。

### ユーザー定義フィールドの削除\{#drop-user-defined-fields}

`drop_collection_field()` を使用して、コレクションモデルの一部でなくなったユーザー定義のスカラーまたはベクトルフィールドを削除します。

フィールドを削除すると、まずコレクションスキーマとフィールドの可視性が変更されます。

- `drop_collection_field()` が成功すると、コレクションスキーマが更新されます。`describe_collection()` は削除されたフィールドを返さなくなり、クエリや検索はそのフィールドを `output_fields` で返したり、式で使用したりできなくなります。

- 削除されたフィールドに構築されたインデックスは、スキーマ更新の一部としてクリーンアップされます。

ストレージのクリーンアップはスキーマのクリーンアップとは別に処理されます。詳細については、[フィールドの削除後、ストレージ領域はいつ解放されますか？](./add-fields-to-an-existing-collection) を参照してください。

**例: ユーザー定義スカラーフィールドの削除**

次の例では、`experiment_tag` が `product_catalog` 内のユーザー定義スカラーフィールドであると仮定し、それをコレクションから削除します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DropCollectionFieldReq;

ConnectConfig connectConfig = ConnectConfig.builder()

        .uri("YOUR_CLUSTER_ENDPOINT")

        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

client.dropCollectionField(DropCollectionFieldReq.builder()

        .collectionName("product_catalog")

        .fieldName("experiment_tag")

        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})

if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

err = cli.DropCollectionField(ctx, milvusclient.NewDropCollectionFieldOption("product_catalog", "experiment_tag"))

if err != nil {
    log.Fatal("failed to drop field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");

let client = ClientV2::new(&config).await?;

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

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

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
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

await client.dropCollectionField({
    collection_name: "product_catalog",
    field_name: "experiment_tag",
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The REST API does not expose a drop-field operation as of v3.0.x. Use the gRPC SDKs instead.
```

</TabItem>
</Tabs>

フィールドを削除した後、`describe_collection()` を呼び出して、そのフィールドがスキーマの一部でなくなったことを確認できます。

**例: StructArray フィールドの削除**

次の例では、`chunks` フィールドが `my_collection` 内の StructArray フィールドであると仮定し、それをコレクションから削除します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DropCollectionFieldReq;

ConnectConfig connectConfig = ConnectConfig.builder()

        .uri("YOUR_CLUSTER_ENDPOINT")

        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

client.dropCollectionField(DropCollectionFieldReq.builder()

        .collectionName("my_collection")

        .fieldName("chunks")

        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})

if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

err = cli.DropCollectionField(ctx, milvusclient.NewDropCollectionFieldOption("my_collection", "chunks"))

if err != nil {
    log.Fatal("failed to drop field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");

let client = ClientV2::new(&config).await?;

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

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

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
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

await client.dropCollectionField({
    collection_name: "my_collection",
    field_name: "chunks",
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The REST API does not expose a drop-field operation as of v3.0.x. Use the gRPC SDKs instead.
```

</TabItem>
</Tabs>

**例: ユーザー定義ベクトルフィールドの削除**

同じ `drop_collection_field()` メソッドでベクトルフィールドを削除できますが、削除後もコレクションに少なくとも 1 つのベクトルフィールドが含まれている必要があります。これは、一時的に複数のベクトル表現を持ち、後でそのうちの 1 つに統一するコレクションに役立ちます。

次の例では、`image_vector` が `hybrid_catalog` 内のユーザー定義ベクトルフィールドであり、コレクションに `text_vector` などの別のベクトルフィールドがまだ保持されていると仮定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DropCollectionFieldReq;

ConnectConfig connectConfig = ConnectConfig.builder()

        .uri("YOUR_CLUSTER_ENDPOINT")

        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

client.dropCollectionField(DropCollectionFieldReq.builder()

        .collectionName("hybrid_catalog")

        .fieldName("image_vector")

        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})

if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

err = cli.DropCollectionField(ctx, milvusclient.NewDropCollectionFieldOption("hybrid_catalog", "image_vector"))

if err != nil {
    log.Fatal("failed to drop field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");

let client = ClientV2::new(&config).await?;

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

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

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
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

await client.dropCollectionField({
    collection_name: "hybrid_catalog",
    field_name: "image_vector",
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The REST API does not expose a drop-field operation as of v3.0.x. Use the gRPC SDKs instead.
```

</TabItem>
</Tabs>

`image_vector` がコレクション内の最後のベクトルフィールドである場合、削除操作は拒否されます。

### Function とその生成ベクトルフィールドの削除\{#drop-a-function-and-its-generated-vector-field}

BM25 Function とその生成スパースベクトルフィールドなど、Function やその生成ベクトルフィールドが不要になった場合は、この操作を使用します。

Function 名を指定して `drop_function_field()` を呼び出します。この操作では、Function の入力フィールドを保持したまま、Function、その生成ベクトルフィールド、および関連するインデックスを削除します。

**例: BM25 Function とその生成スパースベクトルフィールドの削除**

次の例では、`text_bm25` が `product_catalog` 内の BM25 Function であり、`text_sparse` という名前のスパースベクトル出力フィールドを生成すると仮定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DropFunctionFieldReq;

ConnectConfig connectConfig = ConnectConfig.builder()

        .uri("YOUR_CLUSTER_ENDPOINT")

        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

client.dropFunctionField(DropFunctionFieldReq.builder()

        .collectionName("product_catalog")

        .functionName("text_bm25")

        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})

if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

err = cli.DropFunctionField(ctx, milvusclient.NewDropFunctionFieldOption("product_catalog", "text_bm25"))

if err != nil {
    log.Fatal("failed to drop function field: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");

let client = ClientV2::new(&config).await?;

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

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

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
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

await client.dropFunctionField({
    collection_name: "product_catalog",
    function_name: "text_bm25",
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The REST /v2/vectordb/collections/drop_function endpoint maps to the

# deprecated DropCollectionFunction RPC, which Milvus 3.0 rejects. Dropping a

# Function together with its generated vector field is not exposed via the

# REST API as of v3.0.x; use the gRPC SDKs instead.
```

</TabItem>
</Tabs>

操作が成功すると、`describe_collection()` は削除された Function やその生成ベクトルフィールドを返さなくなります。Function の入力フィールドはスキーマに残ります。

Function の出力フィールドを削除するとコレクションにベクトルフィールドが 1 つも残らなくなる場合、操作は拒否されます。

## FAQ\{#faq}

### フィールドまたは Function を追加するにはどのメソッドを使用すべきですか？\{#which-method-should-i-use-to-add-a-field-or-function}

アプリケーションがフィルタリング、クエリ出力、またはアプリケーションロジック用のスカラー値を提供する場合は、`add_collection_field()` を使用してユーザー定義のスカラーフィールドを追加します。

アプリケーションが埋め込みを生成し、ベクトル値を Zilliz Cloud に書き込む場合は、`add_collection_field()` を使用してユーザー定義のベクトルフィールドを追加します。

既存のフィールドからベクトル値を生成する場合は、`add_function_field()` を使用します。これは、同じスキーマ変更で Function、その生成ベクトルフィールド、およびバインドされたインデックス定義を追加します。このガイドでは字句検索用の BM25 のパスを示します。MinHash Function は、ニアデュプリケート検出用のバイナリベクトルフィールドを生成します。

### 追加するユーザー定義フィールドはなぜ nullable でなければならないのですか？\{#why-must-added-user-defined-fields-be-nullable}

既存のエンティティは新しいフィールドが存在する前に挿入されているため、そのフィールドの値を持っていません。`nullable=True` を設定すると、アプリケーションが値を書き込むまで、またはスカラーフィールドの場合はデフォルト値が適用されるまで、Zilliz Cloud は欠損値を `NULL` として表現できます。

このルールは、`add_collection_field()` で追加するユーザー定義スカラーフィールドとユーザー定義ベクトルフィールドに適用されます。nullable にできない Function の生成ベクトルフィールドには適用されません。

### ユーザー定義フィールドを追加した後、既存のエンティティはどうなりますか？\{#what-happens-to-existing-entities-after-i-add-a-user-defined-field}

ユーザー定義スカラーフィールドの場合、`default_value` を設定しない限り、既存のエンティティは `NULL` を返します。`default_value` を設定した場合、既存のエンティティはそのデフォルト値を返します。

ユーザー定義ベクトルフィールドの場合、既存のエンティティは新しいベクトルフィールドに対して `NULL` を持ちます。追加されたフィールドに対するベクトル検索は、ベクトル値が `NULL` であるエンティティをスキップします。新しいベクトルフィールドを通じて既存のエンティティを検索可能にするには、upsert またはバックフィルのワークフローで非 NULL のベクトル値を書き込みます。新しいエンティティは、挿入の際に新しいベクトルフィールドを含めることができます。

### 既存のコレクションに BM25 Function とその生成スパースベクトルフィールドを追加できますか？\{#can-i-add-a-bm25-function-and-its-generated-sparse-vector-field-to-an-existing-collection}

はい。コレクションにアナライザーが有効な `VARCHAR` フィールドがすでにある場合は、字句検索用の BM25 Function とその生成スパースベクトルフィールドを追加できます。この操作では、Function、新しい `SPARSE_FLOAT_VECTOR` 出力フィールド、およびバインドされたインデックス定義を同じスキーマ変更で追加します。このスキーマ変更ワークフローでは、既存の `TEXT` フィールドを BM25 の入力として使用することはできません。`TEXT` を使用するには、コレクションの作成時にフィールドと BM25 Function を定義してください。そうでない場合は、その Function をスキーマに含めた状態でコレクションを再作成または移行してください。

`add_function_field()` を呼び出すときは、新しい出力フィールド用に `metric_type="BM25"` を持つ 1 つの `SPARSE_INVERTED_INDEX` インデックスを含む `index_params` オブジェクトを指定します。インデックス定義は、同じスキーマ変更の一部として生成フィールドにバインドされます。

### Function とその生成ベクトルフィールドを削除するにはどうすればよいですか？\{#how-do-i-drop-a-function-and-its-generated-vector-field}

Function 名を指定して `drop_function_field()` を呼び出します。この操作では、Function の入力フィールドを保持したまま、Function、その生成ベクトルフィールド、および関連するインデックスをまとめて削除します。

### コレクションスキーマの変更後に待機する必要はありますか？\{#do-i-need-to-wait-after-altering-a-collection-schema}

通常、手動で待機する必要はありません。次の操作が更新されたスキーマに依存する場合は、先に `describe_collection()` を呼び出して、Zilliz Cloud が現在返すスキーマを確認できます。

分散デプロイでは、Zilliz Cloud のコンポーネントがコレクションメタデータを更新する間に、短い伝播ウィンドウが存在することがあります。スキーマ変更の直後の操作がスキーマ関連のエラーで失敗した場合は、スキーマを更新して操作を再試行してください。

### フィールドの削除後、ストレージ領域はいつ解放されますか？\{#when-is-storage-space-reclaimed-after-dropping-a-field}

フィールドを削除すると、そのフィールドは現在のスキーマおよび通常のクエリ/search の可視性から削除されますが、そのフィールドの履歴データはオブジェクトストレージから直ちに物理的に削除されるわけではありません。

ストレージ領域は、後で Compaction の実行中に解放されることがあります。Compaction は、既存のデータファイルをよりコンパクトな新しいファイルに再編成するバックグラウンドプロセスです。フィールドが削除されると、新しく Compaction されたファイルは現在のスキーマに従い、削除されたフィールドを含みません。Zilliz Cloud は、フィールドの削除後にストレージ領域が即座に、または一定の時間で削減されることを保証しません。

### 動的フィールドのキーと同じ名前のスカラーフィールドを追加するとどうなりますか？\{#what-happens-if-i-add-a-scalar-field-with-the-same-name-as-a-dynamic-field-key}

動的フィールドが有効な場合、既存の動的フィールドのキーと同じ名前のスカラーフィールドを追加できます。新しいスカラーフィールドは通常のクエリ出力で動的フィールドのキーをマスクしますが、元の動的データは `$meta` に保持されます。

たとえば、既存のエンティティが `source` という名前の動的キーを格納しており、後で `source` という名前のスカラーフィールドを追加すると、`source` の通常の出力はそのスカラーフィールドを参照します。元の動的な値にアクセスするには、`$meta["source"]` などの &#36;meta パス構文を使用します。
