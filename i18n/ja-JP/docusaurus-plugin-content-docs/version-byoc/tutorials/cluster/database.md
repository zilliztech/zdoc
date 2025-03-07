---
title: "データベース | BYOC"
slug: /database
sidebar_label: "データベース"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、クラスタとコレクションの間にデータベースレイヤーを導入し、マルチテナントをサポートしながら、データをより効率的に管理および整理する方法を提供します。 | BYOC"
type: origin
token: Pj1dwyk1SibbFPkknVUcFtK3nKe
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# データベース

Zilliz Cloudは、クラスタとコレクションの間に**データベース**レイヤーを導入し、マルチテナントをサポートしながら、データをより効率的に管理および整理する方法を提供します。

## データベースとは何ですか{#what-is-a-database}

Zilliz Cloudでは、データベースがデータの整理と管理のための論理ユニットとして機能します。データセキュリティを強化し、マルチテナントを実現するために、複数のデータベースを作成して、異なるアプリケーションやテナントのデータを論理的に分離することができます。例えば、ユーザーAのデータを保存するデータベースと、ユーザーBのデータを保存する別のデータベースを作成します。

Zilliz Cloudでは、リソースは以下の階層順序で構成されています。

![Ucc1wbR4Eh3vLbbGE5PcutU8nzf](/byoc/ja-JP/Ucc1wbR4Eh3vLbbGE5PcutU8nzf.png)

データベースの概念は専用クラスタにのみ利用可能であることに注意することができます。サーバーレスおよびフリークラスタにはデータベースがありません。

## 前提条件{#prerequisites}

データベースを管理するには、**組織オーナー**または**プロジェクト管理者**のアクセスが必要です。

## データベースの作成{#create-database}

データベースは専用クラスタでのみ作成できます。クラスタを作成すると、デフォルトのデータベースが作成されます。

コンソールで手動またはプログラムで、専用クラスタに最大1,024個のデータベースを作成できます。

### コンソールでデータベースを作成する{#create-a-database-on-the-console}

次の図に示すように、コンソールでデータベースを作成できます。

![create-database](/byoc/ja-JP/create-database.png)

作成したコレクションを別のデータベースに移動することもできます。詳細については、「[コレクションの管理(コンソール)](./manage-collections-console)」を参照してください。

### プログラムでデータベースを作成する{#create-a-database-programmatically}

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
// TODO
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

作成時にデータベースのプロパティを設定することもできます。次の例では、データベースのレプリカの数を設定します。

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
// TODO
```

</TabItem>

<TabItem value='go'>

```go
// TODO
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

## データベースの表示{#view-databases}

Milvus RESTful APIまたはSDKを使用して、既存のすべてのデータベースをリストし、詳細を表示できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='javascript'>

```javascript
await client.describeDatabase({ 
    db_name: 'default'
});
```

</TabItem>

<TabItem value='go'>

```go
// TODO
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

## データベースのプロパティを管理する{#manage-database-properties}

各データベースには独自のプロパティがあります。[プログラムでデータベース](./database#create-a-database-programmatically)を作成するで説明されているように、データベースを作成するときにデータベースのプロパティを設定することができます。また、既存のデータベースのプロパティを変更して削除することもできます。

次の表に、使用可能なデータベースプロパティを示します。

<table>
   <tr>
     <th><p>プロパティ名</p></th>
     <th><p>タイプ</p></th>
     <th><p>プロパティの説明</p></th>
   </tr>
   <tr>
     <td><p><code>database.replica.number</code></p></td>
     <td><p>integer</p></td>
     <td><p>指定したデータベースのレプリカ数。</p></td>
   </tr>
   <tr>
     <td><p><code>database.max.collections</code></p></td>
     <td><p>integer</p></td>
     <td><p>指定されたデータベースで許可されるコレクションの最大数。</p></td>
   </tr>
   <tr>
     <td><p><code>database.force.deny.writing</code></p></td>
     <td><p>boolean</p></td>
     <td><p>指定されたデータベースに書き込み操作を拒否するかどうか。</p></td>
   </tr>
   <tr>
     <td><p><code>database.force.deny.reading</code></p></td>
     <td><p>boolean</p></td>
     <td><p>指定されたデータベースに対して読み取り操作を拒否するかどうか。</p></td>
   </tr>
</table>

### データベースのプロパティを変更する{#alter-database-properties}

以下のように既存のデータベースのプロパティを変更することができます。以下の例では、データベースに作成できるコレクションの数を制限しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.alter_database_properties(
    db_name: "my_database_1",
    properties: {
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
// TODO
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

### データベースのプロパティを削除{#drop-database-properties}

以下のように、データベースのプロパティを削除することでリセットすることもできます。次の例では、データベースに作成できるコレクションの数の制限を解除しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_database_properties(
    db_name: "my_database_1",
    property_keys: [
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
// TODO
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

## データベースを削除{#drop-database}

データベースが不要になったら、データベースを削除できます。注意:

- デフォルトのデータベースは削除できません。

- データベースを削除する前に、まずデータベース内のすべてのコレクションを削除する必要があります。

### コンソールにデータベースをドロップする{#drop-a-database-on-the-console}

次の図の手順に従って、コンソールにデータベースをドロップできます。

![drop-database](/byoc/ja-JP/drop-database.png)

### プログラムでデータベースを削除する{#drop-a-database-programmatically}

Milvus RESTful APIまたはSDKを使用して、プログラムでデータを作成できます。

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
// TODO
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

