---
title: "Database in Serving Clusters | Cloud"
slug: /database
sidebar_label: "Database in Serving Clusters"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A database in a serving cluster is a logical container for collections hosted by a Dedicated serving cluster. Use this page to create, view, configure, use, and drop databases through a serving cluster endpoint. | Cloud"
type: origin
token: DtLVw8EUyi6MqMkXh3Cc3rfZnic
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Database in Serving Clusters

A database in a serving cluster is a logical container for collections hosted by a Dedicated serving cluster. Use this page to create, view, configure, use, and drop databases through a serving cluster endpoint.

<Admonition type="info" icon="📘" title="This page is for databases in serving clusters. For project-level databases queried with on-demand compute, see [Database for On-Demand Search](./on-demand-database). For a comparison of database models, see [Database Explained](./database-concept).">

</Admonition>

## Before you begin\{#before-you-begin}

Ensure that:

- You have created a Dedicated serving cluster.

- You have the serving cluster endpoint, for example `<i>http</i>s://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`.

- You have an authentication token. This can be an API key with access to the target cluster or a cluster credential in `username:password` format.

- You have **Organization Owner** or **Project Admin** access to manage databases.

When a Dedicated cluster is created, a default database is created automatically. You can create up to 1,024 databases in a Dedicated cluster.

## Create database\{#create-database}

You can create a database from the Zilliz Cloud console or programmatically.

```plaintext
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.create_database(
    db_name="my_database_1",
)
```

```plaintext
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

```plaintext
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

```plaintext
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

await client.createDatabase({
  db_name: "my_database_1",
});
```

```plaintext
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/databases/create" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "dbName": "my_database_1"
  }'
```

You can also set properties when creating a database. The following example sets the number of replicas.

```plaintext
client.create_database(
    db_name="my_database_2",
    properties={
        "database.replica.number": 3,
    },
)
```

```plaintext
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

```plaintext
err = client.CreateDatabase(
    ctx,
    milvusclient.NewCreateDatabaseOption("my_database_2").
        WithProperty("database.replica.number", 3),
)
if err != nil {
    // handle error
}
```

```plaintext
await client.createDatabase({
  db_name: "my_database_2",
  properties: {
    "database.replica.number": 3,
  },
});
```

```plaintext
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

## View databases\{#view-databases}

List databases or describe a specific database.

```plaintext
databases = client.list_databases()
print(databases)

database = client.describe_database(
    db_name="default",
)
print(database)
```

```plaintext
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

```plaintext
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

```plaintext
const databases = await client.listDatabases();
console.log(databases);

const database = await client.describeDatabase({
  db_name: "default",
});
console.log(database);
```

```plaintext
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/databases/describe" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "dbName": "default"
  }'
```

## Manage database properties\{#manage-database-properties}

The following database properties can be configured for databases in serving clusters.

| Property | Description |
| --- | --- |
| `database.replica.number` | The number of replicas for the database. |
| `database.max.collections` | The maximum number of collections allowed in the database. |
| `database.force.deny.writing` | Whether to deny write operations for the database. |
| `database.force.deny.reading` | Whether to deny read operations for the database. |

### Alter database properties\{#alter-database-properties}

The following example limits the number of collections that can be created in a database.

```plaintext
client.alter_database_properties(
    db_name="my_database_1",
    properties={
        "database.max.collections": 10,
    },
)
```

```plaintext
import io.milvus.v2.service.database.request.AlterDatabasePropertiesReq;

client.alterDatabaseProperties(
    AlterDatabasePropertiesReq.builder()
        .databaseName("my_database_1")
        .property("database.max.collections", "10")
        .build()
);
```

```plaintext
err = client.AlterDatabaseProperties(
    ctx,
    milvusclient.NewAlterDatabasePropertiesOption("my_database_1").
        WithProperty("database.max.collections", 10),
)
if err != nil {
    // handle error
}
```

```plaintext
await client.alterDatabaseProperties({
  db_name: "my_database_1",
  properties: {
    "database.max.collections": 10,
  },
});
```

```plaintext
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

### Drop database properties\{#drop-database-properties}

The following example removes the collection limit from a database.

```plaintext
client.drop_database_properties(
    db_name="my_database_1",
    property_keys=[
        "database.max.collections",
    ],
)
```

```plaintext
import io.milvus.v2.service.database.request.DropDatabasePropertiesReq;
import java.util.Collections;

client.dropDatabaseProperties(
    DropDatabasePropertiesReq.builder()
        .databaseName("my_database_1")
        .propertyKeys(Collections.singletonList("database.max.collections"))
        .build()
);
```

```plaintext
err = client.DropDatabaseProperties(
    ctx,
    milvusclient.NewDropDatabasePropertiesOption("my_database_1", "database.max.collections"),
)
if err != nil {
    // handle error
}
```

```plaintext
await client.dropDatabaseProperties({
  db_name: "my_database_1",
  property_keys: ["database.max.collections"],
});
```

```plaintext
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

## Use database\{#use-database}

You can switch from one database to another without reconnecting when using an SDK.

<Admonition type="info" icon="📘" title="RESTful API does not support switching databases on a persistent connection. For RESTful API requests, specify the target database in each request body when the operation supports `dbName`.">

</Admonition>

```plaintext
client.use_database(
    db_name="my_database_2",
)
```

```plaintext
client.useDatabase("my_database_2");
```

```plaintext
err = client.UseDatabase(ctx, milvusclient.NewUseDatabaseOption("my_database_2"))
if err != nil {
    // handle error
}
```

```plaintext
await client.useDatabase({
  db_name: "my_database_2",
});
```

```plaintext
# RESTful API does not provide a persistent connection to switch.
# Specify "dbName" in the request body of each operation when supported.
```

## Drop database\{#drop-database}

Default databases cannot be dropped. Before dropping a database, drop all collections in the database first.

```plaintext
client.drop_database(
    db_name="my_database_2",
)
```

```plaintext
import io.milvus.v2.service.database.request.DropDatabaseReq;

client.dropDatabase(
    DropDatabaseReq.builder()
        .databaseName("my_database_2")
        .build()
);
```

```plaintext
err = client.DropDatabase(ctx, milvusclient.NewDropDatabaseOption("my_database_2"))
if err != nil {
    // handle error
}
```

```plaintext
await client.dropDatabase({
  db_name: "my_database_2",
});
```

```plaintext
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/databases/drop" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "dbName": "my_database_2"
  }'
```

## Next steps\{#next-steps}

- [Database Explained](./database-concept)

- [Database for On-Demand Search](./on-demand-database)

