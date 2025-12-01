---
title: "データベース | Cloud"
slug: /database
sidebar_label: "データベース"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudはクラスターとコレクションの間にデータベース層を導入し、マルチテナンシーをサポートしながらデータをより効率的に管理および整理する方法を提供します。 | Cloud"
type: origin
token: Z0oiwVpsliiW1zksnlFc3ZsVnxf
sidebar_position: 6
keywords:
  - zilliz
  - vector database
  - cloud
  - milvus
  - knn
  - Image Search
  - LLMs
  - Machine Learning

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# データベース

Zilliz Cloudは、クラスターとコレクションの間に**データベース**層を導入し、マルチテナンシーをサポートしながらデータをより効率的に管理および整理する方法を提供します。

## データベースとは\{#what-is-a-database}

Zilliz Cloudでは、データベースはデータを整理および管理するための論理単位として機能します。データセキュリティを強化しマルチテナンシーを実現するために、複数のデータベースを作成して、異なるアプリケーションまたはテナントのデータを論理的に分離できます。たとえば、ユーザーAのデータを保存するデータベースを作成し、ユーザーB用に別のデータベースを作成できます。

リソースはZilliz Cloudで以下の階層的順序で構成されています。

![KkS9wtS5IhcP9obYvc1cK10snfg](/img/KkS9wtS5IhcP9obYvc1cK10snfg.png)

データベースの概念は専用クラスターでのみ利用可能であることに注意してください。サーバーレスおよび無料クラスターにはデータベースがありません。

## 前提条件\{#prerequisites}

データベースを管理するには、**組織オーナー**または**プロジェクト管理者**としてのアクセス権が必要です。

## データベースを作成\{#create-database}

データベースは専用クラスターでのみ作成できます。クラスターを作成すると、デフォルトデータベースが作成されます。

コンソールで手動またはプログラムで、専用クラスターに最大1,024個のデータベースを作成できます。

### コンソールでデータベースを作成\{#create-a-database-on-the-console}

以下の図に示すように、コンソールでデータベースを作成できます。

![create-database](/img/create-database.png)

作成したコレクションをあるデータベースから別のデータベースに移動することもできます。詳細については、[コレクションを管理（コンソール）](./manage-collections-console#manage-collection)を参照してください。

### プログラムでデータベースを作成\{#create-a-database-programmatically}

Milvus RESTful APIまたはSDKを使用して、プログラムでデータを作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    Username: "Milvus",
    Password: "root",
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

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/databases/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database_1"
}'
```

</TabItem>
</Tabs>

データベースを作成するときにプロパティを設定することもできます。以下の例では、データベースのレプリカ数を設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
err := cli.CreateDatabase(ctx, milvusclient.NewCreateDatabaseOption("my_database_2").WithProperty("database.replica.number", 3))
if err != nil {
    // handle err
}
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
-d '{
    "dbName": "my_database_2",
    "properties": {
        "database.replica.number": 3
    }
}'
```

</TabItem>
</Tabs>

## データベースを表示\{#view-databases}

Milvus RESTful APIまたはSDKを使用して、すべての既存データベースを一覧表示し、その詳細を表示できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# すべての既存データベースを一覧表示
client.list_databases()

# 出力
# ['default', 'my_database_1', 'my_database_2']

# データベースの詳細を確認
client.describe_database(
    db_name="default"
)

# 出力
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

<TabItem value='javascript'>

```javascript
await client.describeDatabase({ 
    db_name: 'default'
});
```

</TabItem>

<TabItem value='go'>

```go
// すべての既存データベースを一覧表示
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

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/databases/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "default"
}'
```

</TabItem>
</Tabs>

## データベースプロパティを管理\{#manage-database-properties}

各データベースには独自のプロパティがあり、[プログラムでデータベースを作成](./database#create-a-database-programmatically)で説明したようにデータベースを作成するときにプロパティを設定するか、既存の任意のデータベースのプロパティを変更または削除できます。

以下の表は、考えられるデータベースプロパティをリストしています。

<table>
   <tr>
     <th><p>プロパティ名</p></th>
     <th><p>タイプ</p></th>
     <th><p>プロパティの説明</p></th>
   </tr>
   <tr>
     <td><p><code>database.replica.number</code></p></td>
     <td><p>整数</p></td>
     <td><p>指定されたデータベースのレプリカ数。</p></td>
   </tr>
   <tr>
     <td><p><code>database.max.collections</code></p></td>
     <td><p>整数</p></td>
     <td><p>指定されたデータベースで許可されるコレクションの最大数。</p></td>
   </tr>
   <tr>
     <td><p><code>database.force.deny.writing</code></p></td>
     <td><p>ブール値</p></td>
     <td><p>指定されたデータベースに書き込み操作を強制的に拒否するかどうか。</p></td>
   </tr>
   <tr>
     <td><p><code>database.force.deny.reading</code></p></td>
     <td><p>ブール値</p></td>
     <td><p>指定されたデータベースに読み取り操作を強制的に拒否するかどうか。</p></td>
   </tr>
</table>

### データベースプロパティを変更\{#alter-database-properties}

既存のデータベースのプロパティを以下のように変更できます。以下の例では、データベースで作成できるコレクション数を制限します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
client.alterDatabaseProperties(AlterDatabasePropertiesReq.builder()
        .databaseName("my_database_1")
        .property("database.max.collections", "10")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await milvusClient.alterDatabaseProperties({
  db_name: "my_database_1",
  properties: {"database.max.collections", "10" },
})
```

</TabItem>

<TabItem value='go'>

```go
err := cli.AlterDatabaseProperties(ctx, milvusclient.NewAlterDatabasePropertiesOption("my_database_1").
    WithProperty("database.max.collections", 1))
if err != nil {
    // handle err
}
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
-d '{
    "dbName": "my_database",
    "properties": {
        "database.max.collections": 10
    }
}'
```

</TabItem>
</Tabs>

### データベースプロパティを削除\{#drop-database-properties}

以下のようにプロパティを削除することにより、データベースプロパティをリセットすることもできます。以下の例では、データベースで作成できるコレクション数の制限を解除します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
client.dropDatabaseProperties(DropDatabasePropertiesReq.builder()
        .databaseName("my_database_1")
        .propertyKeys(Collections.singletonList("database.max.collections"))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await milvusClient.dropDatabaseProperties({
  db_name: my_database_1,
  properties: ["database.max.collections"],
});
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

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/databases/alter" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "propertyKeys": [
        "database.max.collections"
    ]
}'
```

</TabItem>
</Tabs>

## データベースを使用\{#use-database}

Zilliz Cloudから切断することなく、あるデータベースから別のデータベースに切り替えることができます。

<Admonition type="info" icon="📘" title="注意">

<p>RESTful APIはこの操作をサポートしていません。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='javascript'>

```javascript
await milvusClient.useDatabase({
  db_name: "my_database_2",
});
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

<TabItem value='bash'>

```bash
# この操作はサポートされていません。RESTfulでは永続的な接続を提供しないためです。
# 代替として、ターゲットデータベースを使用して必要なリクエストを再発行してください。
```

</TabItem>
</Tabs>

## データベースを削除\{#drop-database}

データベースが不要になったら、データベースを削除できます。注意点：

- デフォルトデータベースは削除できません。

- データベースを削除する前に、まずデータベース内のすべてのコレクションを削除する必要があります。

### コンソールでデータベースを削除\{#drop-a-database-on-the-console}

以下の図の手順に従い、コンソールでデータベースを削除できます。

![drop-database](/img/drop-database.png)

### プログラムでデータベースを削除\{#drop-a-database-programmatically}

Milvus RESTful APIまたはSDKを使用して、プログラムでデータを削除できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='javascript'>

```javascript
await milvusClient.dropDatabase({
  db_name: "my_database_2",
});
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

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/databases/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database"
}'
```

</TabItem>
</Tabs>
