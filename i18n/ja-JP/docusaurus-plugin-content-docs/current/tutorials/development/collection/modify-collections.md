---
title: "コレクションを変更する | Cloud"
slug: /modify-collections
sidebar_label: "変更"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "コレクションの名前を変更したり、その設定を変更したりできます。このページでは、コレクションを変更する方法について説明します。 | Cloud"
type: origin
token: WMh8w3tbKiBhukk3ICMc4ctznEg
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションを変更する

コレクションの名前を変更したり、その設定を変更したりできます。このページでは、コレクションを変更する方法について説明します。

## コレクションの名前を変更する\{#rename-collection}

コレクションの名前は次のようにして変更します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/common"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
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

<TabItem value='rust'>

```rust
client.rename_collection(
    RenameCollectionRequest::builder()
        .collection_name("my_collection")
        .new_collection_name("my_new_collection")
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

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

const res = await client.renameCollection({
    collection_name: "my_collection",
    new_collection_name: "my_new_collection"
});
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
</Tabs>

## コレクションプロパティを設定する\{#set-collection-properties}

コレクションの作成後に、コレクションレベルのプロパティを変更できます。

<Admonition type="info" title="Notes">

このセクションに記載されているすべてのプロパティは、マネージドコレクションにのみ適用されます。

</Admonition>

### サポートされているプロパティ\{#supported-properties}

<table>
   <tr>
     <th><p>プロパティ</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>collection.ttl.seconds</code></p></td>
     <td><p>コレクションのデータを特定の期間後に削除する必要がある場合は、Time-To-Live（TTL）を秒単位で設定することを検討してください。TTL がタイムアウトすると、Zilliz Cloud はコレクションからすべてのエンティティを削除します。</p><p>削除は非同期で行われるため、削除が完了するまでは検索とクエリを引き続き実行できます。</p><p>詳細については、<a href="./set-collection-ttl#set-collection-level-ttl">コレクションレベルの TTL を設定する</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>ttl_field</code></p></td>
     <td><p>各エンティティの絶対有効期限タイムスタンプ（<strong>エンティティレベルの TTL</strong>）を格納する <code>TIMESTAMPTZ</code> フィールドの名前です。各エンティティは、実時間がこのフィールドに格納された値に達した時点で正確に期限切れになります。フィールドの値が <code>NULL</code> の場合は、そのエンティティが期限切れになることはありません。<code>collection.ttl.seconds</code> とは相互に排他的です。</p><p>詳細については、<a href="./set-collection-ttl#set-entity-level-ttl">エンティティレベルの TTL を設定する</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>mmap.enabled</code></p></td>
     <td><p>メモリマッピング（Mmap）は、ディスク上の大きなファイルへの直接メモリアクセスを可能にし、Zilliz Cloud がインデックスとデータをメモリとハードドライブの両方に保存できるようにします。このアプローチは、アクセス頻度に基づいてデータ配置ポリシーを最適化し、検索パフォーマンスに影響を与えずにコレクションのストレージ容量を拡張するのに役立ちます。</p><p>Zilliz Cloud は、クラスターに対して<a href="./use-mmap#global-mmap-strategy">グローバル mmap 設定</a>を実装します。特定のフィールドまたはそのインデックスの設定を変更できます。</p><p>詳細については、<a href="./use-mmap">mmap の使用</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>partitionkey.isolation</code></p></td>
     <td><p>Partition Key Isolation を有効にすると、Zilliz Cloud は Partition Key の値に基づいてエンティティをグループ化し、これらのグループごとに個別のインデックスを作成します。検索リクエストを受信すると、Zilliz Cloud はフィルター条件で指定された Partition Key の値に基づいてインデックスを特定し、そのインデックスに含まれるエンティティ内に検索スコープを制限します。これにより、検索時に無関係なエンティティをスキャンせずに済み、検索パフォーマンスが大幅に向上します。</p><p>詳細については、<a href="./use-partition-key#use-partition-key-isolation">Partition Key Isolation の使用</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>dynamicfield.enabled</code></p></td>
     <td><p>動的フィールドを有効にせずに作成されたコレクションに対して、動的フィールドを有効にします。有効にすると、元のスキーマで定義されていないフィールドを持つエンティティを挿入できます。詳細については、<a href="./enable-dynamic-field">動的フィールド</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>allow_insert_auto_id</code></p></td>
     <td><p>コレクションで AutoID が有効になっている場合に、ユーザーが指定した主キー値を受け入れるかどうか。</p><ul><li><p><strong>&quot;true&quot;</strong> に設定した場合：挿入、アップサート、および一括インポートでは、ユーザーが指定した主キーが存在すればそれが使用され、存在しなければ主キー値が自動生成されます。</p></li><li><p><strong>&quot;false&quot;</strong> に設定した場合：ユーザーが指定した主キー値は拒否または無視され、主キー値は常に自動生成されます。デフォルトは <strong>&quot;false&quot;</strong> です。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>timezone</code></p></td>
     <td><p>時間に関連する操作、特に <code>TIMESTAMPTZ</code> フィールドを処理する際に、このコレクションのデフォルトのタイムゾーンを指定します。タイムスタンプは内部的に UTC で保存され、Milvus はこの設定に従って表示と比較のために値を変換します。設定した場合、コレクションのタイムゾーンはデータベースのデフォルトタイムゾーンを上書きします。クエリの timezone パラメーターは、その両方を一時的に上書きできます。値は有効な <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones">IANA タイムゾーン識別子</a>（たとえば <strong>Asia/Shanghai</strong>、<strong>America/Chicago</strong>、または <strong>UTC</strong>）である必要があります。<code>TIMESTAMPTZ</code> フィールドの使用方法については、<a href="./use-timestamptz-field">TIMESTAMPTZ フィールド</a>を参照してください。</p></td>
   </tr>
</table>

### 例 1: コレクションレベルの TTL を設定する\{#example-1-set-collection-level-ttl}

次のコードスニペットは、コレクションの TTL を設定する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty(common.CollectionTTLConfigKey, 60))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client.alter_collection_properties(
    AlterCollectionPropertiesRequest::builder()
        .collection_name("my_collection")
        .property("collection.ttl.seconds", "60")
        .build()?,
)
.await?;
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

<TabItem value='javascript'>

```javascript
await client.alterCollectionProperties({
    collection_name: "my_collection",
    properties: {
        "collection.ttl.seconds": 60
    }
});
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
</Tabs>

### 例 2: エンティティレベルの TTL を設定する | PRIVATE\{#example-2-set-entity-level-ttl}

次のコードスニペットは、既存の `TIMESTAMPTZ` フィールド（`expire_at`）を、エンティティレベルの TTL の TTL フィールドとして指定します。コレクションには、その名前の `TIMESTAMPTZ` フィールドがすでに含まれている必要があり、`collection.ttl.seconds` を設定してはなりません。2 つの TTL モードは相互に排他的です。

エンティティレベルの TTL のワークフロー全体（スキーマの設定、挿入、クエリ、更新、削除）については、[エンティティレベルの TTL を設定する](./modify-collections#example-2-set-entity-level-ttl) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;

AlterCollectionPropertiesReq alterCollectionReq = AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .property("ttl_field", "expire_at")
        .build();

client.alterCollectionProperties(alterCollectionReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty("ttl_field", "expire_at"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client.alter_collection_properties(
    AlterCollectionPropertiesRequest::builder()
        .collection_name("my_collection")
        .property("ttl_field", "expire_at")
        .build()?,
)
.await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                                   .WithCollectionName("my_collection")
                                                   .AddProperty("ttl_field", "expire_at"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionProperties({
    collection_name: "my_collection",
    properties: {
        "ttl_field": "expire_at"
    }
});
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
        "ttl_field": "expire_at"
    }
}'
```

</TabItem>
</Tabs>

### 例 3: mmap を有効にする\{#example-3-enable-mmap}

次のコードスニペットは、mmap を有効にする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.param.Constant;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;

AlterCollectionPropertiesReq alterCollectionReq = AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .property(Constant.MMAP_ENABLED, "True")
        .build();

client.alterCollectionProperties(alterCollectionReq);
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

<TabItem value='rust'>

```rust
client.alter_collection_properties(
    AlterCollectionPropertiesRequest::builder()
        .collection_name("my_collection")
        .property("mmap.enabled", "true")
        .build()?,
)
.await?;
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
        "mmap.enabled": "true"
    }
}'
```

</TabItem>
</Tabs>

### 例 4: パーティションキーを有効にする\{#example-4-enable-partition-key}

次のコードスニペットは、パーティションキーを有効にする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;

AlterCollectionPropertiesReq alterCollectionReq = AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .property("partitionkey.isolation", "True")
        .build();

client.alterCollectionProperties(alterCollectionReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty("partitionkey.isolation", true))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client.alter_collection_properties(
    AlterCollectionPropertiesRequest::builder()
        .collection_name("my_collection")
        .property("partitionkey.isolation", "true")
        .build()?,
)
.await?;
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
        "partitionkey.isolation": "true"
    }
}'
```

</TabItem>
</Tabs>

### 例 5: 動的フィールドを有効にする\{#example-5-enable-dynamic-field}

次のコードスニペットは、動的フィールドを有効にする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;

AlterCollectionPropertiesReq alterCollectionReq = AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .property("dynamicfield.enabled", "True")
        .build();

client.alterCollectionProperties(alterCollectionReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty("dynamicfield.enabled", true))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client.alter_collection_properties(
    AlterCollectionPropertiesRequest::builder()
        .collection_name("my_collection")
        .property("dynamicfield.enabled", "true")
        .build()?,
)
.await?;
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
        "dynamicfield.enabled": "true"
    }
}'
```

</TabItem>
</Tabs>

### 例 6: allow_insert_auto_id を有効にする\{#example-6-enable-allowinsertautoid}

`allow_insert_auto_id` プロパティを使用すると、AutoID が有効なコレクションが、挿入、アップサート、および一括インポートの際に、ユーザーが指定した主キー値を受け入れることができます。**"true"** に設定した場合、Zilliz Cloud はユーザーが指定した主キー値が存在すればそれを使用し、存在しなければ自動生成します。デフォルトは **"false"** です。

次の例では、`allow_insert_auto_id` を有効にする方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

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
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;

AlterCollectionPropertiesReq alterCollectionReq = AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .property("allow_insert_auto_id", "True")
        .build();

client.alterCollectionProperties(alterCollectionReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty("allow_insert_auto_id", "true"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client.alter_collection_properties(
    AlterCollectionPropertiesRequest::builder()
        .collection_name("my_collection")
        .property("allow_insert_auto_id", "true")
        .build()?,
)
.await?;
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
        "allow_insert_auto_id": "true"
    }
}'
```

</TabItem>
</Tabs>

### 例 7: コレクションのタイムゾーンを設定する\{#example-7-set-collection-time-zone}

`timezone` プロパティを使用して、コレクションのデフォルトのタイムゾーンを設定できます。これは、データの挿入、クエリ、結果の表示など、コレクション内のすべての操作で時間関連データがどのように解釈および表示されるかを決定します。

`timezone` の値は、`Asia/Shanghai`、`America/Chicago`、`UTC` など、有効な [IANA タイムゾーン識別子](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) である必要があります。無効または非標準の値を使用すると、コレクションプロパティの変更時にエラーが発生します。

次の例では、コレクションのタイムゾーンを **Asia/Shanghai**: に設定する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.alter_collection_properties(
    collection_name="my_collection",
    # highlight-next-line
    properties={"timezone": "Asia/Shanghai"}
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;

AlterCollectionPropertiesReq alterCollectionReq = AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .property("timezone", "Asia/Shanghai")
        .build();

client.alterCollectionProperties(alterCollectionReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty("timezone", "Asia/Shanghai"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client.alter_collection_properties(
    AlterCollectionPropertiesRequest::builder()
        .collection_name("my_collection")
        .property("timezone", "Asia/Shanghai")
        .build()?,
)
.await?;
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

<TabItem value='javascript'>

```javascript
await client.alterCollectionProperties({
    collection_name: "my_collection",
    properties: {
        "timezone": "Asia/Shanghai"
    }
});
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
        "timezone": "Asia/Shanghai"
    }
}'
```

</TabItem>
</Tabs>

## コレクションプロパティを削除する\{#drop-collection-properties}

次のようにコレクションプロパティを削除してリセットすることもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

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
import io.milvus.v2.service.collection.request.DropCollectionPropertiesReq;
import java.util.Collections;

client.dropCollectionProperties(DropCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .propertyKeys(Collections.singletonList("collection.ttl.seconds"))
        .build());
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

<TabItem value='rust'>

```rust
client.drop_collection_properties(
    DropCollectionPropertiesRequest::builder()
        .collection_name("my_collection")
        .property_keys(["collection.ttl.seconds"])
        .build()?,
)
.await?;
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

<TabItem value='javascript'>

```javascript
client.dropCollectionProperties({
    collection_name:"my_collection",
    properties: ['collection.ttl.seconds'],
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

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
</Tabs>
