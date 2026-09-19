---
title: "サービングクラスター内のデータベース | BYOC"
slug: /database
sidebar_label: "サービングクラスター内のデータベース"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "サービングクラスター内のデータベースは、Dedicated サービングクラスターでホストされるコレクションの論理コンテナです。このページでは、サービングクラスターのエンドポイント経由でデータベースの作成、参照、設定、使用、削除を行う方法について説明します。 | BYOC"
type: origin
token: DtLVw8EUyi6MqMkXh3Cc3rfZnic
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# サービングクラスター内のデータベース

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Enterprise プラン以上でのみ利用できます。

</FeatureNote>

サービングクラスター内のデータベースは、Dedicated サービングクラスターでホストされるコレクションの論理コンテナです。このページでは、サービングクラスターのエンドポイント経由でデータベースの作成、参照、設定、使用、削除を行う方法について説明します。

<Admonition type="info" title="Note">

このページでは、サービングクラスター内のデータベースについて説明します。オンデマンドコンピュートでクエリするプロジェクトレベルのデータベースについては、[オンデマンド検索用データベース](./on-demand-database) を参照してください。データベースモデルの比較については、[データベースの概要](./database-concept) を参照してください。

</Admonition>

## 事前準備\{#before-you-begin}

以下の条件を満たしていることを確認してください。

- Dedicated サービングクラスターを作成済みであること。

- サービングクラスターのエンドポイントを取得していること（例: `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`）。

- 認証トークンを取得していること。これは、対象クラスターへのアクセス権を持つ API キー、または `username:password` 形式のクラスター認証情報です。

- データベースを管理するための **Organization Owner** または **Project Admin** 権限を持っていること。

Dedicated クラスターを作成すると、デフォルトのデータベースが自動的に作成されます。Dedicated クラスターには最大 1,024 個のデータベースを作成できます。

## データベースの作成\{#create-database}

Zilliz Cloud コンソールから、またはプログラムからデータベースを作成できます。

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

データベースの作成時にプロパティを設定することもできます。次の例では、レプリカ数を設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

## データベースの参照\{#view-databases}

データベースを一覧表示するか、特定のデータベースの詳細を取得します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

## データベースプロパティの管理\{#manage-database-properties}

サービングクラスター内のデータベースでは、以下のデータベースプロパティを設定できます。

| プロパティ | 説明 |
| --- | --- |
| `database.replica.number` | データベースのレプリカ数。 |
| `database.max.collections` | データベース内で許可されるコレクションの最大数。 |
| `database.force.deny.writing` | データベースの書き込み操作を拒否するかどうか。 |
| `database.force.deny.reading` | データベースの読み取り操作を拒否するかどうか。 |

### データベースプロパティの変更\{#alter-database-properties}

次の例では、データベース内に作成できるコレクション数を制限します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

### データベースプロパティの削除\{#drop-database-properties}

次の例では、データベースからコレクション数の上限を削除します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

## データベースの使用\{#use-database}

SDK を使用する場合は、再接続することなく、あるデータベースから別のデータベースに切り替えることができます。

<Admonition type="info" title="Note">

RESTful API では、持続接続上でのデータベースの切り替えはサポートされていません。RESTful API リクエストでは、操作が dbName をサポートしている場合、各リクエストボディで対象のデータベースを指定してください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

## データベースの削除\{#drop-database}

デフォルトのデータベースは削除できません。データベースを削除する前に、まずそのデータベース内のすべてのコレクションを削除してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

- [データベースの概要](./database-concept)

- [オンデマンド検索用データベース](./on-demand-database)

