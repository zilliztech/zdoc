---
title: "コレクションフィールドの変更 | BYOC"
slug: /alter-collection-field
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "コレクションフィールドのプロパティを変更して、列の制約を変更したり、より厳格なデータ整合性ルールを適用したりできます。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-alter-collection-field
sidebar_label: "フィールドの変更"
sidebar_position: 17
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/alter-collection-field.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションフィールドの変更

コレクションフィールドのプロパティを変更することで、列の制約を変更したり、より厳格なデータ整合性ルールを適用したりできます。

このページでは、フィールドのプロパティの変更について説明します。フィールドの追加や削除などのスキーマ構造の変更は対象外です。スカラーフィールドを追加したり、既存のコレクションからフィールドを削除したりする方法については、[コレクションスキーマの変更](./add-fields-to-an-existing-collection) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

- 各コレクションは、プライマリフィールドを 1 つだけ持ちます。コレクションの作成時に設定したプライマリフィールドは、変更したり、そのプロパティを変更したりすることはできません。

- 各コレクションは、パーティションキーを 1 つだけ持つことができます。コレクションの作成時に設定したパーティションキーは変更できません。

</Admonition>

## VarChar フィールドの変更\{#alter-varchar-field}

VarChar フィールドには `max_length` というプロパティがあり、各フィールド値に許可される最大バイト数を定義します。`max_length` プロパティは変更できます。

次の例では、コレクションに `varchar` という名前の VarChar フィールドがあることを前提に、その `max_length` プロパティを設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.alter_collection_field(
    collection_name="my_collection",
    field_name="varchar",
    field_params={
        "max_length": 1024
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.service.collection.request.*;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

client.alterCollectionField(AlterCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("varchar")
        .property("max_length", "1024")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/common"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey: "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

err = client.AlterCollectionFieldProperty(ctx, milvusclient.NewAlterCollectionFieldPropertiesOption(
    "my_collection", "varchar").WithProperty(common.MaxLengthKey, 1024))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

client
    .alter_collection_field_properties(
        AlterCollectionFieldPropertiesRequest::builder()
            .collection_name("my_collection")
            .field_name("varchar")
            .property("max_length", "1024")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->AlterCollectionFieldProperties(milvus::AlterCollectionFieldPropertiesRequest()
                    .WithCollectionName("my_collection")
                    .WithFieldName("varchar")
                    .AddProperty("max_length", "1024"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({ address: 'YOUR_CLUSTER_ENDPOINT', token: 'YOUR_CLUSTER_TOKEN' });

await client.alterCollectionFieldProperties({
  collection_name: 'my_collection',
  field_name: 'varchar',
  properties: { max_length: 1024 },
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Types;
using Milvus.Client.V2.Requests.Collection;

using var client = new MilvusClientV2(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});
await client.ConnectAsync();

await client.AlterCollectionFieldAsync(new AlterCollectionFieldReq
{
    CollectionName = "my_collection",
    FieldName = "varchar",
    Properties = { ["max_length"] = "1024" }
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/fields/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
--data '{
    "collectionName": "my_collection",
    "fieldName": "varchar",
    "fieldParams": {
        "max_length": "1024"
    }
}'
```

</TabItem>

</Tabs>

## ARRAY フィールドの変更\{#alter-array-field}

配列フィールドには、`element_type` と `max_capacity` という 2 つのプロパティがあります。前者は配列内の要素のデータ型を決定し、後者は配列内の要素の最大数を制限します。変更できるのは `max_capacity` プロパティだけです。

次の例では、コレクションに `array` という名前の配列フィールドがあることを前提に、その `max_capacity` プロパティを設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.alter_collection_field(
    collection_name="my_collection",
    field_name="array",
    field_params={
        "max_capacity": 64
    }
)
```

</TabItem>

<TabItem value='java'>

```java
client.alterCollectionField(AlterCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("array")
        .property("max_capacity", "64")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/common"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

err = client.AlterCollectionFieldProperty(ctx, milvusclient.NewAlterCollectionFieldPropertiesOption(
    "my_collection", "array").WithProperty(common.MaxCapacityKey, 64))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .alter_collection_field_properties(
        AlterCollectionFieldPropertiesRequest::builder()
            .collection_name("my_collection")
            .field_name("array")
            .property("max_capacity", "64")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto status = client->AlterCollectionFieldProperties(milvus::AlterCollectionFieldPropertiesRequest()
                                                .WithCollectionName("my_collection")
                                                .WithFieldName("array")
                                                .AddProperty("max_capacity", "64"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionFieldProperties({
  collection_name: "my_collection",
  field_name: 'array',
  properties: { 
      max_capacity: 64 
  }
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Collection;

await client.AlterCollectionFieldAsync(new AlterCollectionFieldReq
{
    CollectionName = "my_collection",
    FieldName = "array",
    Properties = { ["max_capacity"] = "64" }
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/fields/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
--data '{
    "collectionName": "my_collection",
    "fieldName": "array",
    "fieldParams": {
        "max_capacity": "64"
    }
}'
```

</TabItem>

</Tabs>

## フィールドレベルの mmap 設定の変更\{#alter-field-level-mmap-settings}

メモリマッピング（Mmap）を使用すると、ディスク上の大きなファイルに直接メモリアクセスできるようになり、Zilliz Cloud はインデックスとデータをメモリとハードドライブの両方に保存できます。このアプローチは、アクセス頻度に基づいてデータ配置ポリシーを最適化し、検索パフォーマンスに影響を与えずにコレクションのストレージ容量を拡張するのに役立ちます。

次の例では、コレクションに `doc_chunk` という名前のフィールドがあることを前提に、その `mmap_enabled` プロパティを設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.alter_collection_field(
    collection_name="my_collection",
    field_name="doc_chunk",
    field_params={"mmap.enabled": True}
)
```

</TabItem>

<TabItem value='java'>

```java
client.alterCollectionField(AlterCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("doc_chunk")
        .property("mmap.enabled", "true")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/common"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

err = client.AlterCollectionFieldProperty(ctx, milvusclient.NewAlterCollectionFieldPropertiesOption(
    "my_collection", "doc_chunk").WithProperty(common.MmapEnabledKey, true))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .alter_collection_field_properties(
        AlterCollectionFieldPropertiesRequest::builder()
            .collection_name("my_collection")
            .field_name("doc_chunk")
            .property("mmap.enabled", "true")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto status = client->AlterCollectionFieldProperties(milvus::AlterCollectionFieldPropertiesRequest()
                                                    .WithCollectionName("my_collection")
                                                    .WithFieldName("doc_chunk")
                                                    .AddProperty("mmap.enabled", "true"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionFieldProperties({
  collection_name: 'my_collection',
  field_name: 'doc_chunk',
  properties: { 'mmap.enabled': true },
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Collection;

await client.AlterCollectionFieldAsync(new AlterCollectionFieldReq
{
    CollectionName = "my_collection",
    FieldName = "doc_chunk",
    Properties = { ["mmap.enabled"] = "true" }
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/fields/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
--data '{
    "collectionName": "my_collection",
    "fieldName": "doc_chunk",
    "fieldParams": {
        "mmap.enabled": true
    }
}'
```

</TabItem>

</Tabs>
