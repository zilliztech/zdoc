---
title: "エイリアスの管理 | クラウド"
slug: /manage-aliases
sidebar_label: "エイリアスの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、エイリアスはコレクションの二次的で変更可能な名前です。エイリアスを使用すると、アプリケーションコードを変更せずにコレクション間を動的に切り替えることができる抽象化レイヤーが提供されます。これは、サービスの中断なしでのシームレスなデータ更新、A/Bテスト、その他の運用作業に特に役立ちます。 | Cloud"
type: origin
token: OLn1wMgW0iceBlkuey2cBD91neb
sidebar_position: 9
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - エイリアス
  - エイリアス群
  - ビデオ類似検索
  - ベクトル検索
  - 石声類似検索
  - エラスティックベクトルデータベース

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# エイリアスの管理

Zilliz Cloudでは、エイリアスはコレクションの二次的で変更可能な名前です。エイリアスを使用すると、アプリケーションコードを変更せずにコレクション間を動的に切り替えることができる抽象化レイヤーが提供されます。これは、サービスの中断なしでのシームレスなデータ更新、A/Bテスト、その他の運用作業に特に役立ちます。

このページでは、コレクションエイリアスの作成、一覧表示、再割り当て、削除方法を説明します。

## なぜエイリアスを使用するのか\{#why-use-an-alias}

エイリアスを使用する主な利点は、クライアントアプリケーションを特定の物理的なコレクション名から切り離すことにある。

`prod_data`という名前のエイリアスを持つコレクションをクエリする本番アプリケーションがあると想像してください。基盤データを更新する必要がある場合、サービスの中断なしに更新を実行できます。作業手順は以下のとおりです。

1. **新しいコレクションの作成**: 例えば、`prod_data_v2` という新しいコレクションを作成します。

1. **データの準備**: `prod_data_v2` に新しいデータをインデックス化し、ロードします。

1. **エイリアスの切り替え**: 新しいコレクションがサービスの準備ができたら、`prod_data` エイリアスを古いコレクションから `prod_data_v2` に原子的に再割り当てします。

アプリケーションは引き続き `prod_data` エイリアスにリクエストを送信し、ダウンタイムはゼロになります。このメカニズムにより、シームレスな更新が可能になり、ベクトル検索サービスのブルーグリーンデプロイのような運用作業が簡素化されます。

**エイリアスの主な特性:**

- 1つのコレクションに複数のエイリアスを付けることができます。

- 1つのエイリアスは一度に1つのコレクションのみを指すことができます。

- リクエストを処理する際、Zilliz Cloudはまず提供された名前を持つコレクションが存在するかどうかを確認します。存在しない場合、その名前がコレクションのエイリアスかどうかを確認します。

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

# 9. エイリアスの管理
# 9.1. エイリアスの作成
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

// 1. Milvusサーバーに接続
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 9. エイリアスの管理

// 9.1 エイリアスの作成
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

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 9. エイリアスの管理
// 9.1 エイリアスの作成
res = await client.createAlias({
    collection_name: "my_collection_1",
    alias: "bob"
})

console.log(res.error_code)

// 出力
//
// Success
//

res = await client.createAlias({
    collection_name: "my_collection_1",
    alias: "alice"
})

console.log(res.error_code)

// 出力
//
// Success
//
```

</TabItem>

<TabItem value='go'>

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
    // エラー処理
}
defer client.Close(ctx)

err = client.CreateAlias(ctx, milvusclient.NewCreateAliasOption("my_collection_1", "bob"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}

err = client.CreateAlias(ctx, milvusclient.NewCreateAliasOption("my_collection_1", "alice"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
```

</TabItem>

<TabItem value='bash'>

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

## エイリアスの一覧表示\{#list-aliases}

以下のコードスニペットは、特定のコレクションに割り当てられたエイリアスを一覧表示する手順を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 9.2. エイリアスの一覧表示
res = client.list_aliases(
    collection_name="my_collection_1"
)

print(res)

# 出力
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

// 9.2 エイリアスの一覧表示
ListAliasesReq listAliasesReq = ListAliasesReq.builder()
    .collectionName("my_collection_1")
    .build();

ListAliasResp listAliasRes = client.listAliases(listAliasesReq);

System.out.println(listAliasRes.getAlias());

// 出力:
// [bob, alice]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 9.2 エイリアスの一覧表示
res = await client.listAliases({
    collection_name: "my_collection_1"
})

console.log(res.aliases)

// 出力
//
// [ 'bob', 'alice' ]
//
```

</TabItem>

<TabItem value='go'>

```go
aliases, err := client.ListAliases(ctx, milvusclient.NewListAliasesOption("my_collection_1"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
fmt.Println(aliases)
```

</TabItem>

<TabItem value='bash'>

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

## エイリアスの詳細表示\{#describe-alias}

以下のコードスニペットは、割り当て先コレクション名を含む特定のエイリアスの詳細を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 9.3. エイリアスの詳細表示
res = client.describe_alias(
    alias="bob"
)

print(res)

# 出力
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

// 9.3 エイリアスの詳細表示
DescribeAliasReq describeAliasReq = DescribeAliasReq.builder()
    .alias("bob")
    .build();

DescribeAliasResp describeAliasRes = client.describeAlias(describeAliasReq);

System.out.println(describeAliasRes);

// 出力:
// DescribeAliasResp(collectionName=my_collection_1, alias=bob)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 9.3 エイリアスの詳細表示
res = await client.describeAlias({
    collection_name: "my_collection_1",
    alias: "bob"
})

console.log(res)

// 出力
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

<TabItem value='go'>

```go
alias, err := client.DescribeAlias(ctx, milvusclient.NewDescribeAliasOption("bob"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
fmt.Println(alias)
```

</TabItem>

<TabItem value='bash'>

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

## エイリアスの変更\{#alter-alias}

特定のコレクションに既に割り当てられているエイリアスを別のコレクションに再割り当てできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 9.4 他のコレクションにエイリアスを再割り当て
client.alter_alias(
    collection_name="my_collection_2",
    alias="alice"
)

res = client.list_aliases(
    collection_name="my_collection_2"
)

print(res)

# 出力
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

# 出力
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

// 9.4 他のコレクションにエイリアスを再割り当て
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

// 出力:
// [bob]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 9.4 他のコレクションにエイリアスを再割り当て
res = await client.alterAlias({
    collection_name: "my_collection_2",
    alias: "alice"
})

console.log(res.error_code)

// 出力
//
// Success
//

res = await client.listAliases({
    collection_name: "my_collection_2"
})

console.log(res.aliases)

// 出力
//
// [ 'alice' ]
//

res = await client.listAliases({
    collection_name: "my_collection_1"
})

console.log(res.aliases)

// 出力
//
// [ 'bob' ]
//

```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterAlias(ctx, milvusclient.NewAlterAliasOption("alice", "my_collection_2"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}

aliases, err := client.ListAliases(ctx, milvusclient.NewListAliasesOption("my_collection_2"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
fmt.Println(aliases)

aliases, err = client.ListAliases(ctx, milvusclient.NewListAliasesOption("my_collection_1"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
fmt.Println(aliases)
```

</TabItem>

<TabItem value='bash'>

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

## エイリアスの削除\{#drop-alias}

以下のコードスニペットは、エイリアスを削除する手順を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 9.5 エイリアスの削除
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

// 9.5 エイリアスの削除
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

<TabItem value='javascript'>

```javascript
// 9.5 エイリアスの削除
res = await client.dropAlias({
    alias: "bob"
})

console.log(res.error_code)

// 出力
//
// Success
//

res = await client.dropAlias({
    alias: "alice"
})

console.log(res.error_code)

// 出力
//
// Success
//
```

</TabItem>

<TabItem value='go'>

```go
err = client.DropAlias(ctx, milvusclient.NewDropAliasOption("bob"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}

err = client.DropAlias(ctx, milvusclient.NewDropAliasOption("alice"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
```

</TabItem>

<TabItem value='bash'>

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