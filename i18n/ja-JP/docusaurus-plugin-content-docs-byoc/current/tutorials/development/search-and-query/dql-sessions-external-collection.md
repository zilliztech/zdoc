---
title: "オンデマンド DQL 操作 | BYOC"
slug: /dql-sessions-external-collection
sidebar_label: "DQL セッション"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "オンデマンドコンピューティング用のコレクションで search、query、get、hybrid search などの DQL 操作を実行するには、オンデマンドクラスターからコンピュートリソースをアタッチする必要があります。Zilliz Cloud を使用すると、オンデマンドのコンピュートニーズを満たすセッションを作成できます。| BYOC"
type: origin
token: BcjLwmXTni1fiMkkyx9ct5iWngc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# オンデマンド DQL 操作

オンデマンドコンピューティング用のコレクションで search、query、get、hybrid search などの DQL 操作を実行するには、オンデマンドクラスターからコンピュートリソースをアタッチする必要があります。Zilliz Cloud を使用すると、オンデマンドのコンピュートニーズを満たすセッションを作成できます。

この記事では、プロジェクトエンドポイントを使用してデータベースにコレクションが作成済みであることを前提としています。詳細については、[外部コレクションの作成](./create-external-collection)を参照してください。

## プロジェクトエンドポイントへの接続\{#connect-to-a-project-endpoint}

プロジェクトエンドポイントは、オンデマンドコンピュートリソースへのアクセスを提供するために設計されています。これを使用して、オンデマンドクラスターやデータベースの管理、およびコレクションに格納されたデータの操作を行えます。

以下のコード例では、デフォルトデータベースに `my_collection` という名前の外部コレクションが存在することを前提としています。また、接続の確立時には、常に十分な権限を持つ有効な API キーを使用してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client = MilvusClient(
    uri="https://{project-id}.{region}.vectordb.zillizcloud.com",
    token="YOUR_API_KEY"
)

client.has_collection(
    collection_name="my_collection"
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const client = new MilvusClient({
    address: "https://{project-id}.{region}.vectordb.zillizcloud.com",
    token: "YOUR_API_KEY"
});

client.has_collection({
    collection_name: "my_collection"
});
```

</TabItem>

<TabItem value='bash'>

```bash
export PROJECT_ENDPOINT='https://{project-id}.{region}.vectordb.zillizcloud.com'
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/has" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## セッションの作成\{#create-a-session}

プロジェクトエンドポイントへの接続を確立したら、指定したオンデマンドクラスターのコンピュートリソースをアタッチするためのセッションを作成します。

以下の例では、ID が `inxx-xxxxxxxxxxxxxxxxx` のオンデマンドクラスターが作成済みであることを前提としています。

<Admonition type="info" icon="📘" title="Notes">

RESTful リクエストの場合、セッションを作成する代わりに、クラスター ID をクエリパラメーターとして DQL 呼び出しに渡します。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
session = client.session(
    cluster_id="inxx-xxxxxxxxxxxxxxxxx"
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const session = client.session("inxx-xxxxxxxxxxxxxxxxx");
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxxxx"
```

</TabItem>
</Tabs>

## DQL 操作の実行\{#conduct-dql-operations}

セッションの準備ができたら、検索を実行できます。以下の例では基本的なベクトル検索を紹介していますが、query、get、hybrid search にも同様に適用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, ..., 0.9029438446296592]
res = session.search(
    db_name="my_database",
    collection_name="my_collection",
    anns_field="vector",
    data=[query_vector],
    limit=3,
    output_fields=["product_id", "title", "main_category", "price", "average_rating", "rating_number"]
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, ..., 0.9029438446296592];
const res = session.search({
    db_name: "my_database",
    collection_name: "my_collection",
    anns_field: "vector",
    data: [query_vector],
    limit: 3,
    output_fields: ["product_id", "title", "main_category", "price", "average_rating", "rating_number"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/entities/search?cluster_id=inxx-xxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "my_collection",
    "data": [
        [
            0.3580376395471989,
            -0.6023495712049978,
            0.18414012509913835,
            -0.26286205330961354,
            0.9029438446296592
        ]
    ],
    "annsField": "vector",
    "limit": 3,
    "outputFields": [
        "product_id",
        "title",
        "main_category",
        "price",
        "average_rating",
        "rating_number"
    ]
}'
```

</TabItem>
</Tabs>

## セッションの終了\{#close-a-session}

オンデマンドコンピューティングタスクが完了したら、セッションを終了できます。終了したセッションは、それ以降の DQL 操作には使用できません。

<Admonition type="info" icon="📘" title="Notes">

RESTful 呼び出しではこの手順は不要です。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
session.close()
```

</TabItem>

<TabItem value='javascript'>

```javascript
session.close();
```

</TabItem>
</Tabs>

