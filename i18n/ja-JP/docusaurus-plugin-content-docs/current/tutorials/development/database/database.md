---
title: "Serving クラスターのデータベース | Cloud"
slug: /database
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Serving クラスターのデータベースは、Dedicated Serving クラスターでホストされるコレクションの論理コンテナです。このページでは、Serving クラスターのエンドポイントを通じて、データベースの作成、表示、設定、使用、削除を行います。 | Cloud"
type: origin
displayed_sidebar: default
token: shared-database
sidebar_label: "Serving クラスターのデータベース"
sidebar_position: 2
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/manage_databases.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Serving クラスターのデータベース

Serving クラスターのデータベースは、Dedicated Serving クラスターでホストされるコレクションの論理コンテナです。このページでは、Serving クラスターのエンドポイントを通じて、データベースの作成、表示、設定、使用、削除を行います。

<Admonition type="info" icon="📘" title="Notes">

この機能は、Enterprise プラン以上でのみ利用できます。

</Admonition>

<Admonition type="info" icon="📘" title="Notes">

このページは、Serving クラスターのデータベースを対象としています。オンデマンドコンピューティングでクエリされるプロジェクトレベルのデータベースについては、[オンデマンド検索用のデータベース](./on-demand-database) を参照してください。データベースモデルの比較については、[データベースの解説](./database-concept) を参照してください。

</Admonition>

## 事前準備\{#before-you-begin}

以下を満たしていることを確認してください。

- Dedicated Serving クラスターを作成済みであること。

- Serving クラスターのエンドポイント（例: `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`）があること。

- 認証トークンがあること。これは、ターゲットクラスターへのアクセス権を持つ API キー、または `username:password` 形式のクラスター認証情報です。

- データベースを管理するための **Organization Owner** または **Project Admin** アクセス権があること。

Dedicated クラスターが作成されると、デフォルトのデータベースが自動的に作成されます。Dedicated クラスター内には最大 1,024 個のデータベースを作成できます。

## データベースを作成する\{#create-database}

Zilliz Cloud RESTful API または SDK を使用すると、データベースをプログラムで作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.create_database(
    db_name="my_database_1"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.service.database.request.*;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

CreateDatabaseReq createDatabaseReq = CreateDatabaseReq.builder()
        .databaseName("my_database_1")
        .build();
client.createDatabase(createDatabaseReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    // handle err
}

err = cli.CreateDatabase(ctx, milvusclient.NewCreateDatabaseOption("my_database_1"))
if err != nil {
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

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
import {MilvusClient} from '@zilliz/milvus2-sdk-node';
const client = new MilvusClient({
    address: "YOUR_CLUSTER_ENDPOINT",
    token: 'YOUR_CLUSTER_TOKEN'
});

await client.createDatabase({
    db_name: "my_database_1"
 });
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Database;
using Milvus.Client.V2.Types;

MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});

await client.CreateDatabaseAsync(new CreateDatabaseReq
{
    DatabaseName = "my_database_1"
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/databases/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "dbName": "my_database_1"
}'
```

</TabItem>

</Tabs>


データベースの作成時にプロパティを設定することもできます。次の例では、データベースのレプリカ数を設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_database(
    db_name="my_database_2",
    properties={
        "database.replica.number": 3
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, String> properties = new HashMap<>();
properties.put("database.replica.number", "3");
CreateDatabaseReq createDatabaseReq = CreateDatabaseReq.builder()
        .databaseName("my_database_2")
        .properties(properties)
        .build();
client.createDatabase(createDatabaseReq);
```

</TabItem>

<TabItem value='go'>

```go
err := cli.CreateDatabase(ctx, milvusclient.NewCreateDatabaseOption("my_database_2").WithProperty("database.replica.number", 3))
if err != nil {
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
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
        "database.replica.number": 3
    }
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Database;

await client.CreateDatabaseAsync(new CreateDatabaseReq
{
    DatabaseName = "my_database_2",
    Properties =
    {
        ["database.replica.number"] = "3"
    }
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/databases/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "dbName": "my_database_2",
    "properties": {
        "database.replica.number": 3
    }
}'
```

</TabItem>

</Tabs>


## データベースを表示する\{#view-databases}

Zilliz Cloud RESTful API または SDK を使用すると、既存のすべてのデータベースを一覧表示し、その詳細を確認できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# List all existing databases
client.list_databases()

# Output
# ['default', 'my_database_1', 'my_database_2']

# Check database details
client.describe_database(
    db_name="default"
)

# Output
# {"name": "default"}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.database.response.*;

ListDatabasesResp listDatabasesResp = client.listDatabases();

DescribeDatabaseResp descDBResp = client.describeDatabase(DescribeDatabaseReq.builder()
        .databaseName("default")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// List all existing databases
databases, err := cli.ListDatabase(ctx, milvusclient.NewListDatabaseOption())
if err != nil {
    // handle err
}
log.Println(databases)

db, err := cli.DescribeDatabase(ctx, milvusclient.NewDescribeDatabaseOption("default"))
if err != nil {
    // handle err
}
log.Println(db)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

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
await client.describeDatabase({
    db_name: 'default'
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Database;
using Milvus.Client.V2.Responses.Database;

ListDatabasesResp databases = await client.ListDatabasesAsync(new ListDatabasesReq());
Console.WriteLine(string.Join(",", databases.DatabaseNames));

DescribeDatabaseResp database = await client.DescribeDatabaseAsync(new DescribeDatabaseReq
{
    DatabaseName = "default"
});
Console.WriteLine(database.DatabaseName);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/databases/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "dbName": "default"
}'
```

</TabItem>

</Tabs>


## データベースプロパティを管理する\{#manage-database-properties}

各データベースには独自のプロパティがあります。[データベースの作成](./database#create-database) の説明に従ってデータベースを作成するときにプロパティを設定するか、既存のデータベースのプロパティを変更および削除できます。

Serving クラスターのデータベースでは、以下のデータベースプロパティを設定できます。

| プロパティ | 説明 |
| --- | --- |
| `database.replica.number` | データベースのレプリカ数です。 |
| `database.max.collections` | データベースで許可されるコレクションの最大数です。 |
| `database.force.deny.writing` | データベースの書き込み操作を拒否するかどうかです。 |
| `database.force.deny.reading` | データベースの読み取り操作を拒否するかどうかです。 |

### データベースプロパティを変更する\{#alter-database-properties}

既存のデータベースのプロパティは、次のように変更できます。次の例では、データベース内に作成できるコレクション数を制限します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.alter_database_properties(
    db_name="my_database_1",
    properties={
        "database.max.collections": 10
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.database.request.AlterDatabasePropertiesReq;

client.alterDatabaseProperties(AlterDatabasePropertiesReq.builder()
        .databaseName("my_database_1")
        .property("database.max.collections", "10")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err := cli.AlterDatabaseProperties(ctx, milvusclient.NewAlterDatabasePropertiesOption("my_database_1").
    WithProperty("database.max.collections", 10))
if err != nil {
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

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
})
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Database;

await client.AlterDatabasePropertiesAsync(new AlterDatabasePropertiesReq
{
    DatabaseName = "my_database_1",
    Properties =
    {
        ["database.max.collections"] = "10"
    }
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/databases/alter" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "dbName": "my_database_1",
    "properties": {
        "database.max.collections": 10
    }
}'
```

</TabItem>

</Tabs>


### データベースプロパティを削除する\{#drop-database-properties}

また、次のようにプロパティを削除して、データベースプロパティをリセットすることもできます。次の例では、データベース内に作成できるコレクション数の制限を解除します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_database_properties(
    db_name="my_database_1",
    property_keys=[
        "database.max.collections"
    ]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.database.request.DropDatabasePropertiesReq;
import java.util.Collections;

client.dropDatabaseProperties(DropDatabasePropertiesReq.builder()
        .databaseName("my_database_1")
        .propertyKeys(Collections.singletonList("database.max.collections"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err := cli.DropDatabaseProperties(ctx, milvusclient.NewDropDatabasePropertiesOption("my_database_1", "database.max.collections"))
if err != nil {
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Database;

await client.DropDatabasePropertiesAsync(new DropDatabasePropertiesReq
{
    DatabaseName = "my_database_1",
    DeleteKeys = ["database.max.collections"]
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/databases/alter" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "dbName": "my_database_1",
    "propertyKeys": [
        "database.max.collections"
    ]
}'
```

</TabItem>

</Tabs>


## データベースを使用する\{#use-database}

Zilliz Cloud から切断せずに、あるデータベースから別のデータベースに切り替えることができます。

<Admonition type="info" icon="📘" title="Notes">

RESTful API は、永続接続でのデータベースの切り替えをサポートしていません。RESTful API リクエストでは、操作が `dbName` をサポートしている場合、各リクエスト本文でターゲットデータベースを指定します。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.use_database(
    db_name="my_database_2"
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
err = cli.UseDatabase(ctx, milvusclient.NewUseDatabaseOption("my_database_2"))
if err != nil {
    // handle err
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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Utility;

await client.UseDatabaseAsync(new UseDatabaseReq
{
    DatabaseName = "my_database_2"
});
```

</TabItem>

<TabItem value='bash'>

```bash
# This operation is unsupported because RESTful does not provide a persistent connection.
# As a workaround, initiate the required request again with the target database.
```

</TabItem>

</Tabs>


## データベースを削除する\{#drop-database}

データベースが不要になったら、データベースを削除できます。次の点に注意してください。

- デフォルトのデータベースは削除できません。

- データベースを削除する前に、データベース内のすべてのコレクションを先に削除する必要があります。

Zilliz Cloud RESTful API または SDK を使用すると、データベースをプログラムで削除できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_database(
    db_name="my_database_2"
)
```

</TabItem>

<TabItem value='java'>

```java
client.dropDatabase(DropDatabaseReq.builder()
        .databaseName("my_database_2")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err = cli.DropDatabase(ctx, milvusclient.NewDropDatabaseOption("my_database_2"))
if err != nil {
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Database;

await client.DropDatabaseAsync(new DropDatabaseReq
{
    DatabaseName = "my_database_2"
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/databases/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "dbName": "my_database_2"
}'
```

</TabItem>

</Tabs>


## よくある質問\{#faq}

### データベースの権限はどのように管理しますか？\{#how-do-i-manage-permissions-for-a-database}

Zilliz Cloud では、ロールベースアクセス制御（RBAC）を使用して権限を管理します。特定の権限を持つロールを作成してユーザーに割り当てることで、さまざまなデータベースへのアクセスを制御できます。詳細は、[RBAC ドキュメント](./access-control-overview) を参照してください。

### データベースにクォータ制限はありますか？\{#are-there-any-quota-limitations-for-a-database}

はい。Zilliz Cloud では、コレクションの最大数など、データベースにクォータ制限を設定できます。制限の包括的な一覧については、[Zilliz Cloud の制限事項ドキュメント](./limits) を参照してください。

## 次のステップ\{#next-steps}

- [データベースの解説](./database-concept)

- [オンデマンド検索用のデータベース](./on-demand-database)
