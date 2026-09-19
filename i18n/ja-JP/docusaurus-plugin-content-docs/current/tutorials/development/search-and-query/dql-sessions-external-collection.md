---
title: "オンデマンド DQL 操作 | Cloud"
slug: /dql-sessions-external-collection
sidebar_label: "DQL セッション"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "オンデマンドコンピューティング向けのコレクションでの DQL 操作（search、query、get、ハイブリッド検索など）では、オンデマンドクラスターのコンピュートリソースをアタッチする必要があります。Zilliz Cloud では、セッションを作成してオンデマンドコンピューティングのニーズを満たすことができます。 | Cloud"
type: origin
token: BcjLwmXTni1fiMkkyx9ct5iWngc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# オンデマンド DQL 操作

オンデマンドコンピューティング向けのコレクションでの DQL 操作（search、query、get、ハイブリッド検索など）では、オンデマンドクラスターのコンピュートリソースをアタッチする必要があります。Zilliz Cloud では、セッションを作成してオンデマンドコンピューティングのニーズを満たすことができます。

この記事では、プロジェクトエンドポイントを使用してデータベースにコレクションを作成済みであることを前提としています。詳細については、[外部コレクションの作成](./create-external-collection) を参照してください。

## project endpoint に接続する\{#connect-to-a-project-endpoint}

プロジェクトエンドポイントは、オンデマンドコンピュートリソースへのアクセスを提供するために設計されています。これを使用して、オンデマンドクラスターとデータベースを管理できるほか、コレクションに格納されたデータを操作できます。

以下のコード例では、デフォルトのデータベースに `my_collection` という名前の外部コレクションがあることを前提としています。また、接続を設定する際には、十分な権限を持つ有効な API キーを常に使用してください。

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

## セッションを作成する\{#create-a-session}

プロジェクトエンドポイントへの接続を設定したら、指定したオンデマンドクラスターのコンピュートリソースをアタッチするためのセッションを作成します。

以下の例では、ID が `inxx-xxxxxxxxxxxxxxxxx` のオンデマンドクラスターをすでに作成済みであることを前提としています。

<Admonition type="info" title="Notes">

RESTful リクエストの場合、セッションを作成する代わりに、クラスター ID をクエリパラメーターとして DQL 呼び出しに渡してください。

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

## DQL 操作を実行する\{#conduct-dql-operations}

セッションの準備ができたら、検索を実行できます。以下の例では、基本的なベクトル検索を例として使用しています。これは、query、get、およびハイブリッド検索にも適用されます。

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

## セッションを閉じる\{#close-a-session}

オンデマンドコンピューティングのタスクが完了したら、セッションを閉じることができます。閉じられたセッションは、その後の DQL 操作には使用できません。

<Admonition type="info" title="Notes">

RESTful 呼び出しでは、これは不要です。

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

