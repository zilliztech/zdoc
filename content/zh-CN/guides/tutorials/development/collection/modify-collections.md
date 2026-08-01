---
title: "修改 Collection | Cloud"
slug: /modify-collections
sidebar_label: "修改 Collection"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Collection 创建完成后，您还可以对 Collection 的名称及相关设置进行修改。本文主要介绍如何修改 Collection 及进行修改操作时的注意事项。 | Cloud"
type: origin
token: QB61wPMzoik03uk2r3ScJdaEnNf
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 修改 Collection

在 Collection 创建完成后，您还可以对 Collection 的名称及相关设置进行修改。本文主要介绍如何修改 Collection 及进行修改操作时的注意事项。

## 重命名 Collection\{#rename-collection}

如果您需要重命名 Collection，可以参考如下代码进行操作：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.rename_collection(
    old_name="my_collection",
    new_name="my_new_collection"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.RenameCollectionReq;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();
    
MilvusClientV2 client = new MilvusClientV2(connectConfig);

RenameCollectionReq renameCollectionReq = RenameCollectionReq.builder()
        .collectionName("my_collection")
        .newCollectionName("my_new_collection")
        .build();

client.renameCollection(renameCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

const res = await client.renameCollection({
    oldName: "my_collection",
    newName: "my_new_collection"
});
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey:  token,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

err = client.RenameCollection(ctx, milvusclient.NewRenameCollectionOption("my_collection", "my_new_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/rename" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "newCollectionName": "my_new_collection"
}'
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->RenameCollection(milvus::RenameCollectionRequest()
                                    .WithCollectionName("my_collection")
                                    .WithNewCollectionName("my_new_collection"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## 设置 Collection 属性\{#set-collection-properties}

### 支持的属性\{#supported-properties}

<table>
   <tr>
     <th><p>Property</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>collection.ttl.seconds</code></p></td>
     <td><p>如果您需要 Zilliz Cloud 在 Collection 创建完成后的一段时间内自动删除该 Collection 中的所有数据。可以考虑为 Collection 设置 TTL。这样当 Collection 的生存时间超过指定时间（单位为秒）后，Zilliz Cloud 就会开始删除 Collection 中的数据。</p><p>由于删除操作是异步的，在数据完全删除前，您仍旧可以搜索到部分数据。</p><p>更多内容，可以参考<a href="./set-collection-ttl">设置 Collection 生存时间</a>。</p></td>
   </tr>
   <tr>
     <td><p><code>ttl_field</code></p></td>
     <td><p>指定一个 TIMESTAMPTZ 类型字段，存储每个 Entity 的<strong>绝对过期时间戳</strong>。当系统当前的墙上时钟时间到达该字段中的时间点时，对应的 Entity 会立即过期；如果该字段值为 NULL，则表示该 Entity 永不过期。该字段与 <code>collection.ttl.seconds</code> 互斥。</p><p>更多内容，可以参考<a href="./set-collection-ttl">设置 Collection 生存时间</a>。</p></td>
   </tr>
   <tr>
     <td><p><code>mmap.enabled</code></p></td>
     <td><p>Memory mapping 支持通过内存来访问存放在磁盘上的数据和文件，从而使得 Zilliz Cloud 即可以将索引和原始数据存放在内存中，也可以将它们存放在磁盘上。您可以根据访问频率优化数据存放策略，在扩大 Collection 容量的同时保证搜索性能。</p><p>Zilliz Cloud 为您的集群提供了<a href="./use-mmap#global-mmap-strategy">全局 mmap 策略</a>。您可以为某个具体字段或该字段上的索引设置不同的 mmap 策略。</p><p>更多内容，可以参考<a href="./use-mmap">使用 mmap</a>。</p></td>
   </tr>
   <tr>
     <td><p><code>partitionkey.isolation</code></p></td>
     <td><p>在开启 Partition Key 之后，Zilliz Cloud 会根据 Partition Key 的取值对 Collection 内的 Entity 进行分组并为每个组创建单独的索引。在收到搜索请求后，Zilliz Cloud 会根据搜索请求中的过滤条件里指定的 Partition Key 值定位到相应的索引，并将搜索范围限定在该索引对应的 Entity 中，从而避免在搜索过程中扫描与当前搜索请求不相关的 Entity，提升搜索效率。</p><p>更多内容，可以参考<a href="./use-partition-key#use-partition-key-isolation">使用 Partition Key Isolation</a>。</p></td>
   </tr>
   <tr>
     <td><p><code>dynamicfield.enabled</code></p></td>
     <td><p>为在创建时未启用 Dynamic Field 的 Collection 启用该功能。启用后，您可以插入包含原始 Schema 中未定义字段的 Entity。详情请参阅 <a href="./enable-dynamic-field">Dynamic Field</a>。</p></td>
   </tr>
   <tr>
     <td><p><code>allow_insert_auto_id</code></p></td>
     <td><p>用于控制在 Collection 已启用 Auto ID 时，是否允许该 Collection 接受用户提供的主键值。</p><ul><li><p>设置为 “<strong>true</strong>”：insert、upsert 和 bulk insert 在用户提供主键值时使用该值；否则自动生成主键值。</p></li><li><p>设置为 “<strong>false</strong>”：拒绝或忽略用户提供的主键值，主键值始终自动生成。默认值为 “<strong>false</strong>”。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>timezone</code></p></td>
     <td><p>为该 Collection 指定默认时区，用于处理时间敏感操作，尤其是 <code>TIMESTAMPTZ</code> 字段。时间戳在内部以 UTC 存储，系统会根据该设置进行展示与比较时的转换。若配置了 Collection 级别的时区，它将覆盖 Database 的默认时区；Query 级别的 timezone 参数可临时覆盖两者。取值必须是有效的 <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones">IANA 时区标识符</a>（如 <strong>Asia/Shanghai</strong>、<strong>America/Chicago</strong> 或 <strong>UTC</strong>）。关于 <code>TIMESTAMPTZ</code> 字段的用法，请参阅 <a href="./use-timestamptz-field">TIMESTAMPTZ 类型</a>。</p></td>
   </tr>
</table>

### 示例 1：设置 Collection 级别 TTL\{#example-1-set-collection-ttl}

如下代码演示了如何设置 Collection 的生存时间（TTL）。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.alter_collection_properties(
    collection_name="my_collection",
    properties={"collection.ttl.seconds": 60}
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.Constant;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;

AlterCollectionPropertiesReq alterCollectionReq = AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .property(Constant.TTL_SECONDS, "60")
        .build();

client.alterCollectionProperties(alterCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.alterCollection({
    collection_name: "my_collection",
    properties: {
        "collection.ttl.seconds": 60
    }
})
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty(common.CollectionTTLConfigKey, 60))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "properties": {
        "collection.ttl.seconds": 60
    }
}'
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                                   .WithCollectionName("my_collection")
                                                   .AddProperty(milvus::COLLECTION_TTL_SECONDS, "60"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### 示例 2：设置 Entity 级别 TTL \{#example-2-set-entity-ttl}

下面的代码片段将一个已有的 `TIMESTAMPTZ` 字段（`expire_at`）指定为 Entity 级别 TTL 的 TTL 字段。Collection 中必须已经包含 `TIMESTAMPTZ` 字段，并且不能同时设置 `collection.ttl.seconds`，这两种 TTL 模式互斥。

如需了解完整的 Entity 级别 TTL 工作流（包括 schema 配置、插入、查询、刷新与删除），请参见[设置 Collection 生存时间](./set-collection-ttl)。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.alter_collection_properties(
    collection_name="my_collection",
    # highlight-next-line
    properties={"ttl_field": "expire_at"}
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

### 示例 3：开启 mmap\{#example-3-enable-mmap}

如下代码演示了如何开启 mmap。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.alter_collection_properties(
    collection_name="my_collection",
    properties={"mmap.enabled": True}
)
```

</TabItem>

<TabItem value='java'>

```java
AlterCollectionPropertiesReq alterCollectionReq = AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .property(Constant.MMAP_ENABLED, "True")
        .build();

client.alterCollectionProperties(alterCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionProperties({
    collection_name: "my_collection",
    properties: {
        "mmap.enabled": true
    }
});
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty(common.MmapEnabledKey, true))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/alter_properties" \
  -H "Content-Type: application/json" \
  -d '{
    "collectionName": "my_collection",
    "properties": {
      "mmap.enabled": "true"
    }
  }'
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                                   .WithCollectionName("my_collection")
                                                   .AddProperty(milvus::MMAP_ENABLED, "true"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### 示例 4：开启 Partition Key\{#example-4-enable-partition-key}

如下代码演示了如何开启 Partition Key。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.alter_collection_properties(
    collection_name="my_collection",
    properties={"partitionkey.isolation": True}
)
```

</TabItem>

<TabItem value='java'>

```java
AlterCollectionPropertiesReq alterCollectionReq = AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .property("partitionkey.isolation", "True")
        .build();

client.alterCollectionProperties(alterCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionProperties({
    collection_name: "my_collection",
    properties: {
        "partitionkey.isolation": true
    }
});
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty(common.PartitionKeyIsolationKey, true))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/alter_properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "my_collection",
    "properties": {
      "partitionkey.isolation": "true"
    }
  }'
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                                   .WithCollectionName("my_collection")
                                                   .AddProperty("partitionkey.isolation", "true"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### 示例 5：开启 Dynamic Field\{#example-5-enable-dynamic-field}

如下代码演示了如何开启 Dynamic Field。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.alter_collection_properties(
    collection_name="my_collection",
    properties={"dynamicfield.enabled": True}
)
```

</TabItem>

<TabItem value='java'>

```java
AlterCollectionPropertiesReq alterCollectionReq = AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .property("dynamicfield.enabled", "True")
        .build();

client.alterCollectionProperties(alterCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionProperties({
    collection_name: "my_collection",
    properties: {
        "dynamicfield.enabled": true
    }
});
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty(common.EnableDynamicSchemaKey, true))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/alter_properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "my_collection",
    "properties": {
      "dynamicfield.enabled": "true"
    }
  }'
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                                   .WithCollectionName("my_collection")
                                                   .AddProperty("dynamicfield.enabled", "true"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### 示例 6：开启 allow_insert_auto_id\{#example-6-enable-allow_insert_auto_id}

`allow_insert_auto_id` 属性允许在启用 AutoID 的 Collection 中，在执行 insert、upsert 和 bulk import 操作时接收用户提供的主键值。当该属性设置为 **"true"** 时，Zilliz Cloud 会在检测到用户提供主键值时使用该值；若未提供，则自动生成主键值。默认值为 **"false"**。

以下示例展示了如何启用 `allow_insert_auto_id` 属性：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
client.alter_collection_properties(
    collection_name="my_collection",
    # highlight-next-line
    properties={"allow_insert_auto_id": "true"}
)
# After enabling, inserts with a PK column will use that PK; otherwise Zilliz Cloud auto-generates.
```

</TabItem>

<TabItem value='java'>

```java
AlterCollectionPropertiesReq alterCollectionReq = AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .property("allow_insert_auto_id", "True")
        .build();

client.alterCollectionProperties(alterCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionProperties({
    collection_name: "my_collection",
    properties: {
        "allow_insert_auto_id": true
    }
});
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty(common.AllowInsertAutoIDKey, true))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/alter_properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "my_collection",
    "properties": {
      "allow_insert_auto_id": "true"
    }
  }'
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                                   .WithCollectionName("my_collection")
                                                   .AddProperty("allow_insert_auto_id", "true"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### 示例 7：设置 Collection 时区\{#example-7-set-collection-time-zone}

您可以使用 `timezone` 属性为 Collection 设置默认时区。该属性决定了在 Collection 内进行所有操作（包括数据插入、查询和结果展示）时，时间相关数据的解释和显示方式。

<Admonition type="info" icon="📘" title="Notes">

`timezone` 的值必须是有效的 [IANA 时区标识符](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)，例如 **Asia/Shanghai**、**America/Chicago** 或 **UTC**。如果使用了无效或非标准的时区值，在修改 Collection 属性时会报错。

</Admonition>

下面的示例演示如何将 Collection 的时区设置为 **Asia/Shanghai**：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
client.alter_collection_properties(
    collection_name="my_collection",
    # highlight-next-line
    properties={"timezone": "Asia/Shanghai"}
)
```

</TabItem>

<TabItem value='java'>

```java
AlterCollectionPropertiesReq alterCollectionReq = AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .property("timezone", "Asia/Shanghai")
        .build();

client.alterCollectionProperties(alterCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty(common.CollectionDefaultTimezone, true))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/alter_properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "my_collection",
    "properties": {
      "timezone": "Asia/Shanghai"
    }
  }'
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                                   .WithCollectionName("my_collection")
                                                   .AddProperty("timezone", "Asia/Shanghai"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## 删除 Collection 属性\{#drop-collection-properties}

你还可以参考如下代码示例删除 Collection 相关属性。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
client.drop_collection_properties(
    collection_name="my_collection",
    property_keys=[
        "collection.ttl.seconds"
    ]
)
```

</TabItem>

<TabItem value='java'>

```java
client.dropCollectionProperties(DropCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .propertyKeys(Collections.singletonList("collection.ttl.seconds"))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.dropCollectionProperties({
    collection_name:"my_collection",
    properties: ['collection.ttl.seconds'],
});
```

</TabItem>

<TabItem value='go'>

```go
err = client.DropCollectionProperties(ctx, milvusclient.NewDropCollectionPropertiesOption("my_collection", common.CollectionTTLConfigKey))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "propertyKeys": [
        "collection.ttl.seconds"
    ]
}'
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->DropCollectionProperties(milvus::DropCollectionPropertiesRequest()
                                                  .WithCollectionName("my_collection")
                                                  .AddPropertyKey(milvus::COLLECTION_TTL_SECONDS));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

