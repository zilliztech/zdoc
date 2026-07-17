---
title: "Serving Clusters の Database | Cloud"
slug: /database
sidebar_label: "Serving Clusters の Database"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Serving cluster の database は、Dedicated serving cluster でホストされる collection の論理コンテナです。このページでは、serving cluster エンドポイントを通じて database を作成、表示、設定、使用、削除する方法を説明します。 | Cloud"
type: origin
token: DtLVw8EUyi6MqMkXh3Cc3rfZnic
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Serving Clusters の Database

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Enterprise プラン以上でのみ利用できます。

</FeatureNote>

Serving cluster の database は、Dedicated serving cluster でホストされる collection の論理コンテナです。このページでは、serving cluster エンドポイントを通じて database を作成、表示、設定、使用、削除する方法を説明します。

<Admonition type="info" icon="📘" title="Note">

このページは serving cluster 内の database を対象としています。オンデマンドコンピュートでクエリされるプロジェクトレベルの database については、[オンデマンド検索向け Database](./on-demand-database) を参照してください。database モデルの比較については、[Database Explained](./database-concept) を参照してください。

</Admonition>

## 始める前に\{#before-you-begin}

以下を確認してください。

- Dedicated serving cluster を作成済みであること。

- serving cluster エンドポイントを取得していること。例: `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`。

- 認証トークンを取得していること。これは、対象 cluster へのアクセス権を持つ API key、または `username:password` 形式の cluster credential を使用できます。

- database を管理するための **Organization Owner** または **Project Admin** アクセス権を持っていること。

Dedicated cluster が作成されると、デフォルトの database が自動的に作成されます。Dedicated cluster では最大 1,024 個の database を作成できます。

## Database を作成する\{#create-database}

Zilliz Cloud コンソールから、またはプログラムで database を作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

database の作成時にプロパティを設定することもできます。次の例では replica の数を設定しています。

```plaintext
client.create_database(
    db_name="my_database_2",
    properties={
        "database.replica.number": 3,
    },
)
```

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

## Database を表示する\{#view-databases}

database の一覧を取得するか、特定の database の詳細を表示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
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
</Tabs>

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

<Tabs groupId="code" defaultValue='javascript' values={[{"label":"JavaScript","value":"javascript"}]}>
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

## Database プロパティを管理する\{#manage-database-properties}

Serving cluster 内の database では、以下の database プロパティを設定できます。

| Property | Description |
| --- | --- |
| `database.replica.number` | database の replica 数。 |
| `database.max.collections` | database で許可される collection の最大数。 |
| `database.force.deny.writing` | database の書き込み操作を拒否するかどうか。 |
| `database.force.deny.reading` | database の読み取り操作を拒否するかどうか。 |

### Database プロパティを変更する\{#alter-database-properties}

次の例では、database で作成できる collection の数を制限しています。

```plaintext
client.alter_database_properties(
    db_name="my_database_1",
    properties={
        "database.max.collections": 10,
    },
)
```

```java
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

### Database プロパティを削除する\{#drop-database-properties}

次の例では、database から collection 数の制限を削除しています。

```plaintext
client.drop_database_properties(
    db_name="my_database_1",
    property_keys=[
        "database.max.collections",
    ],
)
```

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

## Database を使用する\{#use-database}

SDK を使用する場合、再接続せずに 1 つの database から別の database へ切り替えることができます。

<Admonition type="info" icon="📘" title="Note">

RESTful API は永続接続上での database 切り替えをサポートしていません。RESTful API リクエストでは、操作が `dbName` をサポートしている場合、各リクエスト本文で対象 database を指定してください。

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

## Database を削除する\{#drop-database}

デフォルトの database は削除できません。database を削除する前に、まずその database 内のすべての collection を削除してください。

```plaintext
client.drop_database(
    db_name="my_database_2",
)
```

```java
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

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/databases/drop" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "dbName": "my_database_2"
  }'
```

## 次のステップ\{#next-steps}

- [Database Explained](./database-concept)

- [オンデマンド検索向け Database](./on-demand-database)

