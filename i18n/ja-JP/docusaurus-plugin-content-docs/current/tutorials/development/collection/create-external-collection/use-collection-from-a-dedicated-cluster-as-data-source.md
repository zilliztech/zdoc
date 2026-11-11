---
title: "Dedicated クラスターのコレクションをデータソースとして使用する | Cloud"
slug: /use-collection-from-a-dedicated-cluster-as-data-source
sidebar_label: "データソースとしてのコレクション"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "別の Zilliz Cloud Dedicated クラスター上のコレクションを、外部コレクションのデータソースとして使用できます。 | Cloud"
type: origin
token: AzxFwQpn4iRElfkDrbVcorGqnYd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Dedicated クラスターのコレクションをデータソースとして使用する

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Enterprise（SaaS）でのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は AWS で利用できます。Google Cloud および Microsoft Azure では利用できません。

</FeatureNote>

別の Zilliz Cloud Dedicated クラスター上のコレクションを、外部コレクションのデータソースとして使用できます。

Zilliz Cloud では、`external_source` は `volume://<volume_name>/<path>` と `milvus://<instance_id>/<db_name>/<collection_name>` の 2 つのスキームを受け入れます。`milvus://` スキームは、同じプロジェクトおよびリージョン内にある、Milvus v3.0.x と互換性のある別の Dedicated クラスター上のコレクションを指します。スキームは小文字で指定する必要があり、3 つのセグメントはすべて必須です（データベース名として `default` を指定する場合も含みます）。また、末尾のスラッシュは 1 つまで許容されます。

## 事前準備\{#before-you-start}

- 十分な権限（クロスクラスターソースの場合は、ターゲットに対する read/write 権限とソースに対する読み取り権限）を持つ **API キー** を取得していること。ユーザー名とパスワードで構成されるトークンは使用できません。

- 別の Dedicated クラスターからのコレクションの場合、ソースは、ターゲットと同じプロジェクトおよびリージョンにある **Milvus v3.0.x と互換性のある Dedicated クラスター** 上の通常のコレクション（別の外部コレクションではない）であり、ターゲットは、クエリクラスターを備えたプロジェクトエンドポイントを介してアクセスするオンデマンド検索用データベースです。

- クロスクラスターソース（`milvus://`）は、現在のリリースでは SDK および RESTful API を通じてのみ利用できます。コンソールはこのソースタイプをサポートしていません。`milvus://` スキームは **AWS リージョン** でのみサポートされていることに注意してください。

## コレクションを作成する\{#create-the-collection}

ソースコレクションの `milvus://` URI を `external_source` に設定してスキーマを作成します。各フィールドについて、`external_field` をソースコレクションの対応するフィールド名に設定します。この例ではソースのフィールド名をそのまま使用します。`milvus://` ソースの形式はデフォルトで `milvus-table` になるため、`external_spec` は省略できます。

<Admonition type="info" title="Notes">

Python では、API キーと `option={"cluster_id": "<query cluster id>"}` を使用してプロジェクトエンドポイントに接続します。ここで、`<query cluster id>` は、ターゲットデータベースのコンピュートを提供するオンデマンドクラスターの ID です。プロジェクトエンドポイントの詳細については、[オンデマンド検索への接続](./connect-for-on-demand-search) を参照してください。

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

## describe で確認する\{#verify-with-describe}

コレクションを作成したら、describe を実行して、ソースコレクションにバインドされていることを確認します。

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

`describe_collection` は、渡したとおりの `external_source` URI を返します。`external_spec` には、`format`（`milvus-table`）とソースバインディング（ソースインスタンス、データベース、コレクション）が含まれます。フィールド ID はソースコレクションから保持されます（`preserve_field_ids=true`）。認証情報は返されません。

## データを更新する\{#refresh-data}

更新では、リクエストで渡された `external_source` に外部コレクションを再バインドし、最新データを同期します。`external_source` を省略すると、永続化されたソースが再利用され、更新時もそのソースから最新データが同期されます。

更新ジョブは `RefreshInProgress` から `RefreshCompleted` または `RefreshFailed` に遷移します。実行中に送信された 2 回目の更新は拒否されます。更新はインデックスの構築が完了するまで待機するため、所要時間はデータサイズに比例します。大規模なコレクションでは、数秒から数時間かかります。

更新リクエストの送信方法と進捗の追跡方法については、外部コレクションの作成の[ステップ 5: データを更新する](./create-external-collection#step-5-refresh-data) を参照してください。

## トラブルシューティング\{#troubleshooting}

次の表に、発生する可能性のあるエラーとその解決方法を示します。

| シナリオ | エラーメッセージ | 解決方法 |
| --- | --- | --- |
| URI の形式が不正、またはセグメントが欠落している | `invalid external_source: external_source must be milvus://<instance_id>/<db_name>/<collection_name>` | URI を 3 セグメントの形式に修正します。 |
| ソースインスタンスが存在しない、または読み取り可能でない | `Source cluster <id> does not exist or you do not have permission to read it.` | インスタンス ID と API キーの権限を確認します。 |
| ソースコレクションが存在しない | `Source collection <name> on cluster <id> is unavailable: ... collection not found ...` | データベース名とコレクション名を確認します。 |
| 形式の競合 | `external_spec.format must be "milvus-table" (or omitted) for a milvus:// source, got "parquet"` | `external_spec` を省略するか、形式を `milvus-table` に設定します。 |
| 同時更新 | `Refresh job <id> is already in progress for collection <name>; wait for it to complete before refreshing again.` | 現在の更新ジョブが完了するまで待機します。 |
