---
title: "エイリアスの管理 | Cloud"
slug: /manage-aliases
sidebar_key: manage-aliases
sidebar_label: "エイリアス"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、エイリアスはコレクションの二次的で変更可能な名前です。エイリアスを使用することで、アプリケーションコードを変更せずにコレクションを動的に切り替えることができる抽象化レイヤーが提供されます。これは、本番環境におけるシームレスなデータ更新、A/B テスト、その他の運用タスクに特に役立ちます。| Cloud"
type: origin
token: OLn1wMgW0iceBlkuey2cBD91neb
sidebar_position: 9
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - alias
  - aliases

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# エイリアスの管理

Zilliz Cloud では、エイリアスはコレクションに対する変更可能な別名です。エイリアスを使用することで、アプリケーションコードを変更せずに動的にコレクションを切り替えることができる抽象化レイヤーが提供されます。これは特に本番環境において、シームレスなデータ更新や A/B テスト、その他の運用タスクに役立ちます。

このページでは、コレクションのエイリアスを作成・一覧表示・再割り当て・削除する方法を説明します。

## エイリアスを使用する理由\{#why-use-an-alias}

エイリアスを使用する主な利点は、クライアントアプリケーションを特定の物理的なコレクション名から切り離すことです。

たとえば、`prod_data` というエイリアスを持つコレクションに対してクエリを実行している稼働中のアプリケーションがあるとします。基盤となるデータを更新する必要がある場合でも、サービスを中断することなく更新を実施できます。そのワークフローは以下のようになります。

1. **新しいコレクションの作成**: `prod_data_v2` のような新しいコレクションを作成します。

1. **データの準備**: `prod_data_v2` に新しいデータをインデックス作成し、ロードします。

1. **エイリアスの切り替え**: 新しいコレクションの準備が完了したら、エイリアス `prod_data` を古いコレクションから `prod_data_v2` にアトミックに再割り当てします。

これにより、アプリケーションは引き続きエイリアス `prod_data` に対してリクエストを送信し、ダウンタイムをゼロに抑えることができます。この仕組みにより、ベクター検索サービスのブルー・グリーンデプロイメントなどの運用が容易になります。

**エイリアスの主な特性:**

- 1つのコレクションには複数のエイリアスを設定できます。

- 1つのエイリアスは一度に1つのコレクションのみを指すことができます。

- リクエストを処理する際、Zilliz Cloud はまず指定された名前のコレクションが存在するかを確認します。存在しない場合は、その名前がコレクションのエイリアスであるかどうかをチェックします。

## エイリアスの作成\{#create-alias}

以下のコードスニペットは、コレクションのエイリアスを作成する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 9. Manage aliases
# 9.1. Create aliases
client.create_alias(
    collection_name="my_collection_1",
    alias="bob"
)

client.create_alias(
    collection_name="my_collection_1",
    alias="alice"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.CreateAliasReq;
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

// 9. Manage aliases

// 9.1 Create alias
CreateAliasReq createAliasReq = CreateAliasReq.builder()
        .collectionName("my_collection_1")
        .alias("bob")
        .build();

client.createAlias(createAliasReq);

createAliasReq = CreateAliasReq.builder()
        .collectionName("my_collection_1")
        .alias("alice")
        .build();

client.createAlias(createAliasReq);
```

</TabItem>

<TabItem value='java'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 9. Manage aliases
// 9.1 Create aliases
res = await client.createAlias({
    collection_name: "my_collection_1",
    alias: "bob"
})

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.createAlias({
    collection_name: "my_collection_1",
    alias: "alice"
})

console.log(res.error_code)

// Output
// 
// Success
// 
```

</TabItem>

<TabItem value='java'>

```go
import (
    "context"
    "fmt"
    
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)
ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

err = client.CreateAlias(ctx, milvusclient.NewCreateAliasOption("my_collection_1", "bob"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = client.CreateAlias(ctx, milvusclient.NewCreateAliasOption("my_collection_1", "alice"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='java'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "bob",
    "collectionName": "my_collection_1"
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "alice",
    "collectionName": "my_collection_1"
}'

# {
#     "code": 0,
#     "data": {}
# }
```

</TabItem>
</Tabs>

## エイリアスの一覧\{#list-aliases}

次のコードスニペットは、特定のコレクションに割り当てられたエイリアスを一覧表示する手順を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 9.2. List aliases
res = client.list_aliases(
    collection_name="my_collection_1"
)

print(res)

# Output
#
# {
#     "aliases": [
#         "bob",
#         "alice"
#     ],
#     "collection_name": "my_collection_1",
#     "db_name": "default"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.ListAliasesReq;
import io.milvus.v2.service.utility.response.ListAliasResp;

// 9.2 List alises
ListAliasesReq listAliasesReq = ListAliasesReq.builder()
    .collectionName("my_collection_1")
    .build();

ListAliasResp listAliasRes = client.listAliases(listAliasesReq);

System.out.println(listAliasRes.getAlias());

// Output:
// [bob, alice]
```

</TabItem>

<TabItem value='java'>

```javascript
// 9.2 List aliases
res = await client.listAliases({
    collection_name: "my_collection_1"
})

console.log(res.aliases)

// Output
// 
// [ 'bob', 'alice' ]
// 
```

</TabItem>

<TabItem value='java'>

```go
aliases, err := client.ListAliases(ctx, milvusclient.NewListAliasesOption("my_collection_1"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(aliases)
```

</TabItem>

<TabItem value='java'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}'

# {
#     "code": 0,
#     "data": [
#         "bob",
#         "alice"
#     ]
# }
```

</TabItem>
</Tabs>

## エイリアスの詳細\{#describe-alias}

以下のコードスニペットは、特定のエイリアスについて、それが割り当てられているコレクションの名前を含めて詳細に記述しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 9.3. Describe aliases
res = client.describe_alias(
    alias="bob"
)

print(res)

# Output
#
# {
#     "alias": "bob",
#     "collection_name": "my_collection_1",
#     "db_name": "default"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.DescribeAliasReq;
import io.milvus.v2.service.utility.response.DescribeAliasResp;

// 9.3 Describe alias
DescribeAliasReq describeAliasReq = DescribeAliasReq.builder()
    .alias("bob")
    .build();

DescribeAliasResp describeAliasRes = client.describeAlias(describeAliasReq);

System.out.println(describeAliasRes);

// Output:
// DescribeAliasResp(databaseName=default, collectionName=my_collection_1, alias=bob)
```

</TabItem>

<TabItem value='java'>

```javascript
// 9.3 Describe aliases
res = await client.describeAlias({
    collection_name: "my_collection_1",
    alias: "bob"
})

console.log(res)

// Output
// 
// {
//   status: {
//     extra_info: {},
//     error_code: 'Success',
//     reason: '',
//     code: 0,
//     retriable: false,
//     detail: ''
//   },
//   db_name: 'default',
//   alias: 'bob',
//   collection: 'my_collection_1'
// }
// 
```

</TabItem>

<TabItem value='java'>

```go
alias, err := client.DescribeAlias(ctx, milvusclient.NewDescribeAliasOption("bob"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(alias)
```

</TabItem>

<TabItem value='java'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "bob"
}'

# {
#     "code": 0,
#     "data": {
#         "aliasName": "bob",
#         "collectionName": "my_collection_1",
#         "dbName": "default"
#     }
# }
```

</TabItem>
</Tabs>

## Alter エイリアス\{#alter-alias}

特定のコレクションにすでに割り当てられているエイリアスを別のコレクションに再割り当てできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 9.4 Reassign aliases to other collections
client.alter_alias(
    collection_name="my_collection_2",
    alias="alice"
)

res = client.list_aliases(
    collection_name="my_collection_2"
)

print(res)

# Output
#
# {
#     "aliases": [
#         "alice"
#     ],
#     "collection_name": "my_collection_2",
#     "db_name": "default"
# }

res = client.list_aliases(
    collection_name="my_collection_1"
)

print(res)

# Output
#
# {
#     "aliases": [
#         "bob"
#     ],
#     "collection_name": "my_collection_1",
#     "db_name": "default"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.AlterAliasReq;

// 9.4 Reassign alias to other collections
AlterAliasReq alterAliasReq = AlterAliasReq.builder()
        .collectionName("my_collection_2")
        .alias("alice")
        .build();

client.alterAlias(alterAliasReq);

ListAliasesReq listAliasesReq = ListAliasesReq.builder()
        .collectionName("my_collection_2")
        .build();

ListAliasResp listAliasRes = client.listAliases(listAliasesReq);

System.out.println(listAliasRes.getAlias());

listAliasesReq = ListAliasesReq.builder()
        .collectionName("my_collection_1")
        .build();

listAliasRes = client.listAliases(listAliasesReq);

System.out.println(listAliasRes.getAlias());

// Output:
// [bob]
```

</TabItem>

<TabItem value='java'>

```javascript
// 9.4 Reassign aliases to other collections
res = await client.alterAlias({
    collection_name: "my_collection_2",
    alias: "alice"
})

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.listAliases({
    collection_name: "my_collection_2"
})

console.log(res.aliases)

// Output
// 
// [ 'alice' ]
// 

res = await client.listAliases({
    collection_name: "my_collection_1"
})

console.log(res.aliases)

// Output
// 
// [ 'bob' ]
// 

```

</TabItem>

<TabItem value='java'>

```go
err = client.AlterAlias(ctx, milvusclient.NewAlterAliasOption("alice", "my_collection_2"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

aliases, err := client.ListAliases(ctx, milvusclient.NewListAliasesOption("my_collection_2"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(aliases)

aliases, err = client.ListAliases(ctx, milvusclient.NewListAliasesOption("my_collection_1"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(aliases)
```

</TabItem>

<TabItem value='java'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/alter" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "alice",
    "collectionName": "my_collection_2"
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "alice"
}'

# {
#     "code": 0,
#     "data": {
#         "aliasName": "alice",
#         "collectionName": "my_collection_2",
#         "dbName": "default"
#     }
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "bob"
}'

# {
#     "code": 0,
#     "data": {
#         "aliasName": "alice",
#         "collectionName": "my_collection_1",
#         "dbName": "default"
#     }
# }
```

</TabItem>
</Tabs>

## Drop エイリアス\{#drop-alias}

次のコードスニペットは、エイリアスを削除する手順を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 9.5 Drop aliases
client.drop_alias(
    alias="bob"
)

client.drop_alias(
    alias="alice"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.DropAliasReq;

// 9.5 Drop alias
DropAliasReq dropAliasReq = DropAliasReq.builder()
    .alias("bob")
    .build();

client.dropAlias(dropAliasReq);

dropAliasReq = DropAliasReq.builder()
    .alias("alice")
    .build();

client.dropAlias(dropAliasReq);
```

</TabItem>

<TabItem value='java'>

```javascript
// 9.5 Drop aliases
res = await client.dropAlias({
    alias: "bob"
})

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.dropAlias({
    alias: "alice"
})

console.log(res.error_code)

// Output
// 
// Success
// 
```

</TabItem>

<TabItem value='java'>

```go
err = client.DropAlias(ctx, milvusclient.NewDropAliasOption("bob"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = client.DropAlias(ctx, milvusclient.NewDropAliasOption("alice"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='java'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "bob"
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "alice"
}'

# {
#     "code": 0,
#     "data": {}
# }
```

</TabItem>
</Tabs>

