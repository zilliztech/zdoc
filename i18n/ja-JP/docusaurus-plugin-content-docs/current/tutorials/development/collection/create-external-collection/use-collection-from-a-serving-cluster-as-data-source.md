---
title: "サービングクラスターのコレクションをデータソースとして使用する | Cloud"
slug: /use-collection-from-a-serving-cluster-as-data-source
sidebar_label: "ソースとしてのコレクション"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
channel: next
sidebar_custom_props:
  channel: next
description: "別の Zilliz Cloud サービングクラスター上のコレクションを、外部コレクションのデータソースとして使用できます。 | Cloud"
type: origin
token: AzxFwQpn4iRElfkDrbVcorGqnYd
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# サービングクラスターのコレクションをデータソースとして使用する

別の Zilliz Cloud サービングクラスター上のコレクションを、外部コレクションのデータソースとして使用できます。

Zilliz Cloud では、`external_source` は `volume://<volume_name>/<path>` と `milvus://<instance_id>/<db_name>/<collection_name>` の 2 つのスキームを受け付けます。`milvus://` スキームは、同じプロジェクトおよびリージョン内にある、Milvus v3.0.x と互換性のある別のサービングクラスター上のコレクションを指します。スキームは小文字で指定する必要があり、3 つのセグメントはすべて必須です（データベース名として `default` を含む）。末尾のスラッシュは 1 つだけ許容されます。

## 事前準備\{#before-you-start}

- 十分な権限を持つ **API キー**を取得していること（ターゲットに対する読み取り/write 権限と、クロスクラスターソースの場合はソースに対する読み取り権限）。ユーザー名とパスワードによるトークンは受け付けられません。

- 別のサービングクラスターのコレクションを使用する場合、ソースは、ターゲットと同じ**プロジェクトおよびリージョン**にある **Milvus v3.0.x と互換性のあるサービングクラスター**上の通常のコレクション（別の外部コレクションではない）であり、ターゲットは、クエリクラスターを備えたプロジェクトエンドポイントを介してアクセスされるオンデマンド検索用データベースです。

- クロスクラスターソース（`milvus://`）は、現在のリリースでは SDK および RESTful API からのみ利用できます。コンソールはこのソースタイプをサポートしていません。`milvus://` スキームは **AWS および Azure のリージョンでのみ**サポートされることに注意してください。

## コレクションを作成する\{#create-the-collection}

`external_source` をソースコレクションの `milvus://` URI に設定してスキーマを作成します。各フィールドの `external_field` には、ソースコレクション内の対応するフィールド名を設定します。この例では、ソースのフィールド名をそのまま使用します。`milvus://` ソースの形式はデフォルトで `milvus-table` になるため、`external_spec` は省略できます。

<Admonition type="info" title="Notes">

Python では、API キーと `option={"cluster_id": "<query cluster id>"}` を使用してプロジェクトエンドポイントに接続します。ここで、`<query cluster id>` は、ターゲットデータベースにコンピュートを提供するオンデマンドクラスターの ID です。プロジェクトエンドポイントの詳細については、[オンデマンド検索のための接続](./connect-for-on-demand-search) を参照してください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# Connect to the project endpoint with an API key and the query cluster ID
client = MilvusClient(
    uri="https://{project-id}.{region}.api.zillizcloud.com",
    token="YOUR_API_KEY",
    db_name="my_database",
    option={"cluster_id": "<query cluster id>"},
)

# Point the schema to the source collection; external_spec is omitted
schema = MilvusClient.create_schema(
    external_source="milvus://in01-xxxxxxxxxxxxxxx/default/products",
)

# Map each field to the field with the same name in the source collection
schema.add_field(
    field_name="product_id",
    datatype=DataType.INT64,
    external_field="product_id",
)
schema.add_field(
    field_name="product_name",
    datatype=DataType.VARCHAR,
    max_length=512,
    external_field="product_name",
)
schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=768,
    external_field="embedding",
)

client.create_collection(
    collection_name="products_external",
    schema=schema,
)
```

</TabItem>

<TabItem value='bash'>

```bash
export PROJECT_ENDPOINT="https://{project-id}.{region}.api.zillizcloud.com"
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "products_external",
    "schema": {
        "externalSource": "milvus://in01-xxxxxxxxxxxxxxx/default/products",
        "fields": [
            {
                "fieldName": "product_id",
                "dataType": "Int64",
                "externalField": "product_id"
            },
            {
                "fieldName": "product_name",
                "dataType": "VarChar",
                "elementTypeParams": {
                    "max_length": "512"
                },
                "externalField": "product_name"
            },
            {
                "fieldName": "embedding",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "768"
                },
                "externalField": "embedding"
            }
        ]
    }
}'
```

</TabItem>
</Tabs>

## Describe で確認する\{#verify-with-describe}

コレクションを作成したら、その詳細を取得して、ソースコレクションにバインドされていることを確認します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.describe_collection(
    collection_name="products_external",
)

print(res)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/collections/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "products_external"
}'
```

</TabItem>
</Tabs>

`describe_collection` は、渡したとおりの `external_source` URI を返します。`external_spec` には、`format`（`milvus-table`）とソースのバインド情報（ソースインスタンス、データベース、コレクション）が含まれます。フィールド ID はソースコレクションから引き継がれます（`preserve_field_ids=true`）。認証情報は返されません。

## データをリフレッシュする\{#refresh-data}

リフレッシュでは、外部コレクションをリクエストで渡された `external_source` に再バインドし、最新データを同期します。すべてのリフレッシュリクエストで `external_source` を渡す必要があります。省略した場合、コレクションは以前に同期されたデータを提供し続けます。

リフレッシュジョブは、`RefreshInProgress` から `RefreshCompleted` または `RefreshFailed` に遷移します。進行中に送信された 2 つ目のリフレッシュは拒否されます。リフレッシュはインデックス構築の完了を待機するため、所要時間はデータサイズに応じて増加し、大規模なコレクションでは数秒から数時間に及ぶことがあります。

リフレッシュリクエストを送信して進行状況を追跡する方法については、外部コレクションを作成するの [ステップ 5: データをリフレッシュする](./create-external-collection#step-5-refresh-data) を参照してください。

## トラブルシューティング\{#troubleshooting}

次の表に、発生する可能性のあるエラーとその解決方法を示します。

| シナリオ | エラーメッセージ | 解決方法 |
| --- | --- | --- |
| URI の形式が不正、またはセグメントが欠落している | `invalid external_source: external_source must be milvus://<instance_id>/<db_name>/<collection_name>` | URI を 3 つのセグメントからなる形式に修正します。 |
| ソースインスタンスが存在しない、または読み取り権限がない | `Source cluster <id> does not exist or you do not have permission to read it.` | インスタンス ID と API キーの権限を確認します。 |
| ソースコレクションが存在しない | `Source collection <name> on cluster <id> is unavailable: ... collection not found ...` | データベース名とコレクション名を確認します。 |
| 形式の競合 | `external_spec.format must be "milvus-table" (or omitted) for a milvus:// source, got "parquet"` | `external_spec` を省略するか、その形式を `milvus-table` に設定します。 |
| リフレッシュの同時実行 | `Refresh job <id> is already in progress for collection <name>; wait for it to complete before refreshing again.` | 現在のリフレッシュジョブが完了するまで待機します。 |
