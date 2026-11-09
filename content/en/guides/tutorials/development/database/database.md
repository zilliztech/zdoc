---
title: "Database in Serving Clusters | Cloud"
slug: /database
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A database in a serving cluster is a logical container for collections hosted by a Dedicated serving cluster. Use this page to create, view, configure, use, and drop databases through a serving cluster endpoint. | Cloud"
type: origin
displayed_sidebar: default
token: shared-database
sidebar_label: "Database in Serving Clusters"
sidebar_position: 2
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/manage_databases.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Database in Serving Clusters

A database in a serving cluster is a logical container for collections hosted by a Dedicated serving cluster. Use this page to create, view, configure, use, and drop databases through a serving cluster endpoint.

<Admonition type="info" icon="📘" title="Notes">

This feature is available only with the Enterprise plan or higher.

</Admonition>

<Admonition type="info" icon="📘" title="Notes">

This page is for databases in serving clusters. For project-level databases queried with on-demand compute, see [Database for On-Demand Search](./on-demand-database). For a comparison of database models, see [Database Explained](./database-concept).

</Admonition>

## Before you begin\{#before-you-begin}

Ensure that:

- You have created a Dedicated serving cluster.

- You have the serving cluster endpoint, for example `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`.

- You have an authentication token. This can be an API key with access to the target cluster or a cluster credential in `username:password` format.

- You have **Organization Owner** or **Project Admin** access to manage databases.

When a Dedicated cluster is created, a default database is created automatically. You can create up to 1,024 databases in a Dedicated cluster.

## Create database\{#create-database}

You can use the Zilliz Cloud RESTful API or SDKs to create a database programmatically.

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

```cpp
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


You can also set properties for the database when you create it. The following example sets the number of replicas of the database.

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

```cpp
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


## View databases\{#view-databases}

You can use the Zilliz Cloud RESTful API or SDKs to list all existing databases and view their details.

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

```cpp
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


## Manage database properties\{#manage-database-properties}

Each database has its own properties, you can set the properties of a database when you create the database as described in [Create database](./database#create-database) or you can alter and drop the properties of any existing database.

The following database properties can be configured for databases in serving clusters.

| Property | Description |
| --- | --- |
| `database.replica.number` | The number of replicas for the database. |
| `database.max.collections` | The maximum number of collections allowed in the database. |
| `database.force.deny.writing` | Whether to deny write operations for the database. |
| `database.force.deny.reading` | Whether to deny read operations for the database. |

### Alter database properties\{#alter-database-properties}

You can alter the properties of an existing database as follows. The following example limits the number of collections you can create in the database.

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

```cpp
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


### Drop database properties\{#drop-database-properties}

You can also reset a database property by dropping it as follows. The following example removes the limit on the number of collections you can create in the database.

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

```cpp
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


## Use database\{#use-database}

You can switch from one database to another without disconnecting from Zilliz Cloud.

<Admonition type="info" icon="📘" title="Notes">

RESTful API does not support switching databases on a persistent connection. For RESTful API requests, specify the target database in each request body when the operation supports `dbName`.

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

```cpp
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


## Drop database\{#drop-database}

Once a database is no longer needed, you can drop the database. Note that:

- Default databases cannot be dropped.

- Before dropping a database, you need to drop all collections in the database first.

You can use the Zilliz Cloud RESTful API or SDKs to drop a database programmatically.

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

```cpp
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


## FAQ\{#faq}

### How do I manage permissions for a database?\{#how-do-i-manage-permissions-for-a-database}

Zilliz Cloud uses Role-Based Access Control (RBAC) to manage permissions. You can create roles with specific privileges and assign them to users, thus controlling their access to different databases. For more details, refer to the [RBAC documentation](./access-control-overview).

### Are there any quota limitations for a database?\{#are-there-any-quota-limitations-for-a-database}

Yes, Zilliz Cloud allows you to set quota limitations for a database, such as the maximum number of collections. For a comprehensive list of limitations, please refer to the [Zilliz Cloud Limits documentation](./limits).

## Next steps\{#next-steps}

- [Database Explained](./database-concept)

- [Database for On-Demand Search](./on-demand-database)