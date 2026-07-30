---
title: "修改字段设置 | BYOC"
slug: /alter-collection-field
sidebar_label: "修改字段设置"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "您可以更改 Collection 字段的属性以更改列约束或强制执行更严格的数据完整性规则。 | BYOC"
type: origin
token: ZcogwnZR6iN4fikl98QcjQgQnQe
sidebar_position: 17
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 修改字段设置

您可以更改 Collection 字段的属性以更改列约束或强制执行更严格的数据完整性规则。 

<Admonition type="info" icon="📘" title="说明">

- 每个 Collection 仅包含一个主键。一旦在 Collection 创建期间完成设置，您就无法更换主键或更改其属性。

- 每个 Collection 仅包含一个 Partition Key。一旦在 Collection 创建其它完成设置，您就无法更换 Partition Key。

</Admonition>

## 修改 VarChar 字段设置\{#alter-varchar-field}

VarChar 字段有一个名为 `max_length` 的属性，决定了该字段值的长度。您可以根据需要修改 VarChar 字段的这个属性。

如下示例假设您的 Collection 中有一个名为 `varchar` 的字段，并修改了该字段的 `max_length` 属性。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='javascript'>

```javascript
await client.alterCollectionFieldProperties({
  collection_name: LOAD_COLLECTION_NAME,
  field_name: 'varchar',
  properties: { max_length: 1024 },
});
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
    "github.com/milvus-io/milvus/pkg/v2/common"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

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

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/collections/fields/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
--data '{
    "collectionName": "my_collection",
    "field_name": "varchar",
    "properties": {
        "max_length": "1024"
    }
}'
```

</TabItem>
</Tabs>

## 修改 Array 字段设置\{#alter-array-field}

Array 字段有两个属性，分别为 `element_type` 和 `max_capacity`。前者决定了字段值列表中各元素的数据类型，后者决定了字段值列表中的元素数量。您可以修改 Array 字段的 `max_capacity` 属性。

如下示例假设您的 Collection 中有一个名为 `array` 的字段并修改了它的 `max_capacity` 属性。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/collections/fields/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
--data '{
    "collectionName": "my_collection",
    "field_name": "array",
    "properties": {
        "max_capacity": "64"
    }
}'
```

</TabItem>
</Tabs>

## 修改字段级 mmap 设置\{#alter-field-level-mmap-settings}

Mmap 允许在不将磁盘上的文件加载到内存的情况下通过内存访问这些文件。通过配置 mmap，Zilliz Cloud 可以根据访问频次的不同将索引和数据分别存放到内存或磁盘上，不仅优化了数据加载行为，扩大了 Collection 的容量，也不会给搜索性能带来负面影响。

如下示例假设您的 Collection 中有一个名为 `doc_chunk` 的字段并设置了其 `mmap_enabled` 属性。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.alter_collection_field(
    collection="my_collection",
    field_name="doc_chunk",
    properties={"mmap.enabled": True}
)
```

</TabItem>

<TabItem value='java'>

```java
client.alterCollectionField(AlterCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("doc_chunk")
        .property("mmap.enabled", "True")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionProperties({
  collection_name: "my_collection",
  field_name: 'doc_chunk',
  properties: { 
      'mmap.enabled': true, 
  }
});
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

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/collections/fields/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
--data '{
    "collectionName": "my_collection",
    "field_name": "doc_chunk",
    "properties": {
        "mmap.enabled": True
    }
}'
```

</TabItem>
</Tabs>

