---
title: "serving クラスターのデータベース | Cloud"
slug: /database
sidebar_label: "serving クラスターのデータベース"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "serving クラスターのデータベースは、Dedicated serving クラスターがホストするコレクションの論理コンテナーです。このページでは、serving クラスターのエンドポイントを通じてデータベースを作成、表示、構成、使用、削除する方法について説明します。 | Cloud"
type: origin
token: DtLVw8EUyi6MqMkXh3Cc3rfZnic
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# serving クラスターのデータベース

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Enterprise プラン以上でのみ利用できます。

</FeatureNote>

serving クラスターのデータベースは、Dedicated serving クラスターがホストするコレクションの論理コンテナーです。このページでは、serving クラスターのエンドポイントを通じてデータベースの作成、表示、構成、使用、削除を行う方法について説明します。

<Admonition type="info" title="Note">

このページは、serving クラスター内のデータベースを対象としています。オンデマンドコンピューティングでクエリされるプロジェクトレベルのデータベースについては、[オンデマンド検索用のデータベース](./on-demand-database) を参照してください。データベースモデルの比較については、[データベースの解説](./database-concept) を参照してください。

</Admonition>

## 事前準備\{#before-you-begin}

以下を満たしていることを確認してください。

- Dedicated serving クラスターを作成していること。

- serving クラスターのエンドポイント（例: `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`）があること。

- 認証トークンがあること。これは、対象クラスターにアクセスできる API キー、または `username:password` 形式のクラスター認証情報です。

- データベースを管理するための **Organization Owner** または **Project Admin** の権限があること。

Dedicated クラスターを作成すると、デフォルトのデータベースが自動的に作成されます。Dedicated クラスターには最大 1,024 個のデータベースを作成できます。

## データベースを作成する\{#create-database}

データベースは、Zilliz Cloud コンソールから、またはプログラムで作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.create_database(
    db_name="my_database_1",
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.CreateDatabaseReq;

ConnectConfig config = ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build();

MilvusClientV2 client = new MilvusClientV2(config);

CreateDatabaseReq request = CreateDatabaseReq.builder()
    .databaseName("my_database_1")
    .build();

client.createDatabase(request);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    // handle error
}

err = client.CreateDatabase(ctx, milvusclient.NewCreateDatabaseOption("my_database_1"))
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    )
    .await?;

    client
        .create_database(
            CreateDatabaseRequest::builder()
                .database_name("my_database_1")
                .build()?,
        )
        .await?;

    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cerr << status.Message() << std::endl;
}

auto request = milvus::CreateDatabaseRequest().WithDatabaseName("my_database_1");
status = client->CreateDatabase(request);
if (!status.IsOk()) {
    std::cerr << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

await client.createDatabase({
  db_name: "my_database_1",
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/databases/create" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "dbName": "my_database_1"
  }'
```

</TabItem>
</Tabs>

データベースの作成時にプロパティを設定することもできます。次の例では、レプリカの数を設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_database(
    db_name="my_database_2",
    properties={
        "database.replica.number": 3,
    },
)
```

</TabItem>

<TabItem value='java'>

```java
import java.util.HashMap;
import java.util.Map;

Map<String, String> properties = new HashMap<>();
properties.put("database.replica.number", "3");

CreateDatabaseReq request = CreateDatabaseReq.builder()
    .databaseName("my_database_2")
    .properties(properties)
    .build();

client.createDatabase(request);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateDatabase(
    ctx,
    milvusclient.NewCreateDatabaseOption("my_database_2").
        WithProperty("database.replica.number", 3),
)
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use std::collections::HashMap;

client
    .create_database(
        CreateDatabaseRequest::builder()
            .database_name("my_database_2")
            .properties(HashMap::from([
                ("database.replica.number".into(), "3".into()),
            ]))
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::CreateDatabaseRequest()
    .WithDatabaseName("my_database_2")
    .AddProperty("database.replica.number", "3");
status = client->CreateDatabase(request);
if (!status.IsOk()) {
    std::cerr << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createDatabase({
  db_name: "my_database_2",
  properties: {
    "database.replica.number": 3,
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/databases/create" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "dbName": "my_database_2",
    "properties": {
      "database.replica.number": 3
    }
  }'
```

</TabItem>
</Tabs>

## データベースを表示する\{#view-databases}

データベースを一覧表示するか、特定のデータベースの情報を表示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
databases = client.list_databases()
print(databases)

database = client.describe_database(
    db_name="default",
)
print(database)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.database.request.DescribeDatabaseReq;
import io.milvus.v2.service.database.response.DescribeDatabaseResp;
import io.milvus.v2.service.database.response.ListDatabasesResp;

ListDatabasesResp databases = client.listDatabases();

DescribeDatabaseResp database = client.describeDatabase(
    DescribeDatabaseReq.builder()
        .databaseName("default")
        .build()
);
```

</TabItem>

<TabItem value='go'>

```go
databases, err := client.ListDatabase(ctx, milvusclient.NewListDatabaseOption())
if err != nil {
    // handle error
}
log.Println(databases)

database, err := client.DescribeDatabase(ctx, milvusclient.NewDescribeDatabaseOption("default"))
if err != nil {
    // handle error
}
log.Println(database)
```

</TabItem>

<TabItem value='rust'>

```rust
let databases = client
    .list_databases(ListDatabasesRequest::builder().build()?)
    .await?;
println!("{:?}", databases);

let database = client
    .describe_database(
        DescribeDatabaseRequest::builder()
            .database_name("default")
            .build()?,
    )
    .await?;
println!("{:?}", database);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::ListDatabasesResponse listResponse;
status = client->ListDatabases(milvus::ListDatabasesRequest(), listResponse);
if (!status.IsOk()) {
    std::cerr << status.Message() << std::endl;
}

milvus::DescribeDatabaseResponse describeResponse;
status = client->DescribeDatabase(
    milvus::DescribeDatabaseRequest().WithDatabaseName("default"),
    describeResponse);
if (!status.IsOk()) {
    std::cerr << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const databases = await client.listDatabases();
console.log(databases);

const database = await client.describeDatabase({
  db_name: "default",
});
console.log(database);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/databases/describe" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "dbName": "default"
  }'
```

</TabItem>
</Tabs>

## データベースプロパティを管理する\{#manage-database-properties}

serving クラスター内のデータベースでは、以下のデータベースプロパティを構成できます。

| プロパティ | 説明 |
| --- | --- |
| `database.replica.number` | データベースのレプリカ数です。 |
| `database.max.collections` | データベース内で許可されるコレクションの最大数です。 |
| `database.force.deny.writing` | データベースの書き込み操作を拒否するかどうかを指定します。 |
| `database.force.deny.reading` | データベースの読み取り操作を拒否するかどうかを指定します。 |

### データベースプロパティを変更する\{#alter-database-properties}

次の例では、データベース内で作成できるコレクションの数を制限します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.alter_database_properties(
    db_name="my_database_1",
    properties={
        "database.max.collections": 10,
    },
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.database.request.AlterDatabasePropertiesReq;

client.alterDatabaseProperties(
    AlterDatabasePropertiesReq.builder()
        .databaseName("my_database_1")
        .property("database.max.collections", "10")
        .build()
);
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterDatabaseProperties(
    ctx,
    milvusclient.NewAlterDatabasePropertiesOption("my_database_1").
        WithProperty("database.max.collections", 10),
)
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .alter_database_properties(
        AlterDatabasePropertiesRequest::builder()
            .database_name("my_database_1")
            .property("database.max.collections", "10")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::AlterDatabasePropertiesRequest()
    .WithDatabaseName("my_database_1")
    .AddProperty("database.max.collections", "10");
status = client->AlterDatabaseProperties(request);
if (!status.IsOk()) {
    std::cerr << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterDatabaseProperties({
  db_name: "my_database_1",
  properties: {
    "database.max.collections": 10,
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/databases/alter" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "dbName": "my_database_1",
    "properties": {
      "database.max.collections": 10
    }
  }'
```

</TabItem>
</Tabs>

### データベースプロパティを削除する\{#drop-database-properties}

次の例では、データベースからコレクションの制限を解除します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_database_properties(
    db_name="my_database_1",
    property_keys=[
        "database.max.collections",
    ],
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.database.request.DropDatabasePropertiesReq;
import java.util.Collections;

client.dropDatabaseProperties(
    DropDatabasePropertiesReq.builder()
        .databaseName("my_database_1")
        .propertyKeys(Collections.singletonList("database.max.collections"))
        .build()
);
```

</TabItem>

<TabItem value='go'>

```go
err = client.DropDatabaseProperties(
    ctx,
    milvusclient.NewDropDatabasePropertiesOption("my_database_1", "database.max.collections"),
)
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .drop_database_properties(
        DropDatabasePropertiesRequest::builder()
            .database_name("my_database_1")
            .property_keys(["database.max.collections"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::DropDatabasePropertiesRequest()
    .WithDatabaseName("my_database_1")
    .AddPropertyKey("database.max.collections");
status = client->DropDatabaseProperties(request);
if (!status.IsOk()) {
    std::cerr << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.dropDatabaseProperties({
  db_name: "my_database_1",
  property_keys: ["database.max.collections"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/databases/alter" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "dbName": "my_database_1",
    "propertyKeys": [
      "database.max.collections"
    ]
  }'
```

</TabItem>
</Tabs>

## データベースを使用する\{#use-database}

SDK を使用する場合、再接続せずにデータベース間を切り替えることができます。

<Admonition type="info" title="Note">

RESTful API は、永続接続上でのデータベースの切り替えをサポートしていません。RESTful API リクエストでは、操作が dbName をサポートしている場合、各リクエストボディで対象データベースを指定してください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.use_database(
    db_name="my_database_2",
)
```

</TabItem>

<TabItem value='java'>

```java
client.useDatabase("my_database_2");
```

</TabItem>

<TabItem value='go'>

```go
err = client.UseDatabase(ctx, milvusclient.NewUseDatabaseOption("my_database_2"))
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client.use_database("my_database_2").await?;
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->UseDatabase("my_database_2");
if (!status.IsOk()) {
    std::cerr << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.useDatabase({
  db_name: "my_database_2",
});
```

</TabItem>

<TabItem value='bash'>

```bash
# RESTful API does not provide a persistent connection to switch.
# Specify "dbName" in the request body of each operation when supported.
```

</TabItem>
</Tabs>

## データベースを削除する\{#drop-database}

デフォルトのデータベースは削除できません。データベースを削除する前に、まずデータベース内のすべてのコレクションを削除してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_database(
    db_name="my_database_2",
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.database.request.DropDatabaseReq;

client.dropDatabase(
    DropDatabaseReq.builder()
        .databaseName("my_database_2")
        .build()
);
```

</TabItem>

<TabItem value='go'>

```go
err = client.DropDatabase(ctx, milvusclient.NewDropDatabaseOption("my_database_2"))
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .drop_database(
        DropDatabaseRequest::builder()
            .database_name("my_database_2")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::DropDatabaseRequest().WithDatabaseName("my_database_2");
status = client->DropDatabase(request);
if (!status.IsOk()) {
    std::cerr << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.dropDatabase({
  db_name: "my_database_2",
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/databases/drop" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "dbName": "my_database_2"
  }'
```

</TabItem>
</Tabs>

## 次のステップ\{#next-steps}

- [データベースの解説](./database-concept)

- [オンデマンド検索用のデータベース](./on-demand-database)
