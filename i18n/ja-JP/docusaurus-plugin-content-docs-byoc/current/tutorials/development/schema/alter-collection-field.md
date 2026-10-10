---
title: "コレクションフィールドの変更 | BYOC"
slug: /alter-collection-field
sidebar_label: "フィールドの変更"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "コレクションフィールドのプロパティを変更して、列の制約を変更したり、より厳格なデータ整合性ルールを適用したりできます。 | BYOC"
type: origin
token: PLjFwlcT8ilFBakYXyfcg6S2n7d
sidebar_position: 17
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションフィールドの変更

コレクションフィールドのプロパティを変更して、列の制約を変更したり、より厳格なデータ整合性ルールを適用したりできます。

このページでは、フィールドのプロパティ変更について説明します。フィールドの追加や削除などのスキーマ形状の変更は対象外です。既存のコレクションにスカラーフィールドを追加したり、フィールドを削除したりするには、[コレクションスキーマの変更](./add-fields-to-an-existing-collection) を参照してください。

<Admonition type="info" title="Notes">

- 各コレクションにはプライマリフィールドが 1 つだけ存在します。コレクション作成時に設定した後は、プライマリフィールドを変更したり、そのプロパティを変更したりすることはできません。

- 各コレクションに設定できるパーティションキーは 1 つだけです。コレクション作成時に設定した後は、パーティションキーを変更することはできません。

</Admonition>

## VarChar フィールドの変更\{#alter-varchar-field}

VarChar フィールドには `max_length` というプロパティがあり、フィールド値に含めることができる最大文字数を制約します。`max_length` プロパティは変更できます。

次の例では、コレクションに `varchar` という名前の VarChar フィールドが存在することを前提とし、その `max_length` プロパティを設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='bash'>

```bash
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

配列フィールドには `element_type` と `max_capacity` という 2 つのプロパティがあります。前者は配列内の要素のデータ型を決定し、後者は配列内の要素の最大数を制約します。変更できるのは `max_capacity` プロパティのみです。

次の例では、コレクションに `array` という名前の配列フィールドが存在することを前提とし、その `max_capacity` プロパティを設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='bash'>

```bash
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

メモリマッピング（Mmap）は、ディスク上の大容量ファイルへの直接メモリアクセスを可能にし、Zilliz Cloud がインデックスとデータをメモリとハードドライブの両方に保存できるようにします。このアプローチは、アクセス頻度に基づいてデータ配置ポリシーを最適化し、検索パフォーマンスに影響を与えることなくコレクションのストレージ容量を拡張するのに役立ちます。

次の例では、コレクションに `doc_chunk` という名前のフィールドが存在することを前提とし、その `mmap_enabled` プロパティを設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='bash'>

```bash
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
