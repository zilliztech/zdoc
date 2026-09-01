---
title: "外部コレクションの作成 | BYOC"
slug: /create-external-collection
sidebar_label: "外部コレクション"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "外部コレクションは、Zilliz Cloud におけるデータコレクションの一種であり、AWS S3 や Iceberg などの外部ストレージシステムやデータベーステーブルのデータを、Zilliz Cloud にコピーすることなく参照できます。データレイクに対するクエリレイヤーとして機能し、Zilliz Cloud のクエリインターフェイスとの互換性を維持します。 | BYOC"
type: origin
token: RsGAwmgAYiE6fgkOiokcijsBnEg
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 外部コレクションの作成

外部コレクションは、Zilliz Cloud におけるデータコレクションの一種であり、AWS S3 や Iceberg などの外部ストレージシステムやデータベーステーブルのデータを、Zilliz Cloud にコピーすることなく参照できます。データレイクに対するクエリレイヤーとして機能し、Zilliz Cloud のクエリインターフェイスとの互換性を維持します。

<Admonition type="info" icon="📘" title="Notes">

外部コレクションを作成できるのは、オンデマンドコンピューティング用データベースに限られます。サービング Dedicated クラスターでの外部コレクション作成サポートは、近日公開予定です。

</Admonition>

## 概要\{#overview}

一般的な AI データパイプラインでは、AWS S3 などのストレージシステムに Parquet 形式などでデータがすでに保存されているケースが多く見られます。Zilliz Cloud でこれらの外部データを利用するには、通常、Extract-Transform-Load（ETL）パイプラインを用いて Zilliz Cloud 独自のストレージにデータをインポートする必要があります。

このようにデータを Zilliz Cloud に取り込むワークフローでは、同期が困難な冗長なデータが生じ、データの一貫性を保つためのエンジニアリング上の保守負担も増大します。

![YQXWwPQ3vheYa4b8398cWoPNnyN](https://zdoc-images.s3.us-west-2.amazonaws.com/YQXWwPQ3vheYa4b8398cWoPNnyN.png)

こうした課題を解決するため、Zilliz Cloud は外部コレクションを提供しています。これにより、データの同期や ETL パイプラインを意識することなく、Zilliz Cloud から外部ストレージ上のデータにアクセスできます。

![Q6F4wtcd2h3PnKbnMxncw3urn3f](https://zdoc-images.s3.us-west-2.amazonaws.com/Q6F4wtcd2h3PnKbnMxncw3urn3f.png)

外部コレクションを作成すると、データは元の保存場所に保持されたまま直接アクセスできるようになります。バックグラウンドでは、Zilliz Cloud がマニフェストファイルを作成し、Zilliz Cloud のメタデータと外部データファイル内の行の対応関係を記録します。マニフェストファイルの準備が整えば、通常のマネージドコレクションと同様に、外部コレクションにもインデックスを作成できます。

データに変更があった場合は、手動でサブ秒級のリフレッシュを実行することでメタデータが更新され、Zilliz Cloud を常に最新の状態に保てます。

外部コレクションは、オンデマンドコンピューティング用データベースで利用可能です。

## ステップ 1: スキーマの作成\{#step-1-create-schema}

マネージドコレクションの場合と同様に、外部コレクションの作成前にもスキーマを定義する必要があります。ただし、その内容はマネージドコレクションのスキーマとは一部異なります。

### 事前準備\{#preparation}

- オンデマンドコンピューティング用データベースに外部コレクションを作成できる十分な権限を持つ API キーを取得していること。

    詳細については、[API キー](./manage-api-keys) を参照してください。

- オブジェクトストレージバケットが Zilliz Cloud と連携済みであること。

    詳細については、[AWS](./integrate-with-aws-s3)、[GCP](./integrate-with-gcp)、および [Azure](./integrate-with-azure-blob-storage) のドキュメントを参照してください。

- バケット連携に基づき外部ボリュームを作成済みであること。また、当該ボリュームに対象のデータファイルが含まれていることを確認してください。

    詳細については、[外部ボリューム](./external-volume) を参照してください。

### サポートされるデータソース\{#support-data-sources}

Zilliz Cloud は以下のデータソースに対応しています。選択した形式に応じて、対応する外部ソースを指定してください。

- `parquet`

    `external_source` には、対象の Parquet ファイルが格納されたフォルダーを指定します。

- `vortex`,

    `external_source` には、バージョン 0.56 の Vortex カラムナーファイルが格納されたフォルダーを指定します。

- `lance-table`

    `external_source` には、**_transactions**、**_versions**、**data** といったサブフォルダーを含むフォルダーパスを指定します。

- `iceberg-table`

    `external_source` には Iceberg テーブルの `metadata.json` ファイルを指定し、以下のようにスナップショット ID を渡します。

    ```python
    external_spec={
        "format": "iceberg-table",
        "snapshot_id": "473984310232959286"
    }
    ```

- `milvus-table`

    `external_source` には、具体的な Milvus スナップショットメタデータ JSON ファイルを指定します。詳細については、[スナップショットをデータソースとして使用する](./use-milvus-snapshot-as-data-source) を参照してください。

### スキーマの設定\{#set-up-schema}

対象データファイルを含む外部ボリュームを用意したら、コレクションのカラムを Parquet ファイル（`parquet`）、Lance テーブル（`lance-table`）、Iceberg テーブル（`iceberg-table`）、または 0.56.0 形式の Vortex ファイル（`vortex`）にマッピングするためのスキーマを作成します。

<Admonition type="info" icon="📘" title="Notes">

外部ソースの末尾には、フォルダーであることを示すスラッシュ（/)）を付ける必要があります。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema(
    external_source='volume://my_volume/path/to/a/folder/',
    external_spec='{"format": "parquet"}'
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.JsonObject;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

JsonObject externalSpec = new JsonObject();
externalSpec.addProperty("format", "parquet");
CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .externalSource("volume://my_volume/path/to/a/folder/")
        .externalSpec(externalSpec)
        .build();
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
    client "github.com/milvus-io/milvus/client/v2/milvusclient"
)

schema := entity.NewSchema().
    WithName("product_embeddings").
    WithExternalSource("volume://my_volume/path/to/a/folder/").
    WithExternalSpec(\`{"format": "parquet"}\`)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
export fields='[
    {
        "fieldName": "product_id",
        "dataType": "Int64",
        "isPrimary": true
    },
    {
        "fieldName": "embedding",
        "dataType": "FloatVector",
        "elementTypeParams": {
            "dim": "768"
        }
    },
    {
        "fieldName": "product_name",
        "dataType": "VarChar",
        "elementTypeParams": {
            "max_length": 512
        }
    }
]'
```

</TabItem>
</Tabs>

## ステップ 2: フィールドの追加\{#step-2-add-fields}

スキーマの準備ができたら、以下のようにフィールドを追加できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="product_id",
    datatype=DataType.INT64,
    # highlight-next
    external_field="id" # field name in the external data file
)
schema.add_field(
    field_name="product_name",
    datatype=DataType.VARCHAR,
    max_length=512,
    # highlight-next
    external_field="name"
)
schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=768,
    # highlight-next
    external_field="vector"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;

schema.addField(AddFieldReq.builder()
        .fieldName("product_id")
        .dataType(DataType.Int64)
        .externalField("id")
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("product_name")
        .dataType(DataType.VarChar)
        .maxLength(512)
        .externalField("name")
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(768)
        .externalField("vector")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
    client "github.com/milvus-io/milvus/client/v2/milvusclient"
)

schema = schema.
    WithField(
        entity.NewField().
            WithName("product_id").
            WithDataType(entity.FieldTypeInt64).
            WithExternalField("id"),
    ).
    WithField(
        entity.NewField().
            WithName("product_name").
            WithDataType(entity.FieldTypeVarChar).
            WithMaxLength(512).
            WithExternalField("name"),
    ).
    WithField(
        entity.NewField().
            WithName("embedding").
            WithDataType(entity.FieldTypeFloatVector).
            WithDim(768).
            WithExternalField("vector"),
    )
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
export schema="{
    \"externalSource\": \"volume://my_volume/path/to/a/folder\",
    \"externalSpec\": \"{\\\"format\\\": \\\"parquet\\\"}\",
    \"fields\": $fields
}"
```

</TabItem>
</Tabs>

## ステップ3: コレクションの作成\{#step-3-create-a-collection}

スキーマにすべてのフィールドを追加したら、外部コレクションを作成できます。

<Admonition type="info" icon="📘" title="Notes">

外部コレクションは、通常オンデマンドクラスターに関連付けられているプロジェクトレベルのデータベースに作成できます。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# connect the database
client = MilvusClient(
    uri="https://{project-id}.{region}.vectordb.zillizcloud.com",
    token="YOUR_API_KEY"
)

client.use_database(
    db_name="my_database"
)
# create the collection
client.create_collection(
    collection_name="test_collection",
    schema=schema
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("https://{project-id}.{region}.vectordb.zillizcloud.com")
        .token("YOUR_API_KEY")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);
CreateCollectionReq createReq = CreateCollectionReq.builder()
        .dbName("my_database")
        .collectionName("test_collection")
        .collectionSchema(schema)
        .build();
client.createCollection(createReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
    client "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()
milvusAddr := "https://{project-id}.{region}.vectordb.zillizcloud.com"
token := "YOUR_API_KEY"
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey: token
})
err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("test_collection", schema).
    WithDBName("my_database").
    WithIndexOptions(indexOptions...))

if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
export PROJECT_ENDPOINT='https://{project-id}.{region}.vectordb.zillizcloud.com'
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"dbName\": \"my_database\",
    \"collectionName\": \"test_collection\",
    \"schema\": $schema
}"
```

</TabItem>
</Tabs>

## ステップ4: インデックスの作成\{#step-4-create-indexes}

マネージドコレクションと同様に、外部コレクションのカラムに対してもインデックスを作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()
# Add indexes
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",
    metric_type="COSINE"
)
index_params.add_index(
    field_name="product_name",
    index_type="AUTOINDEX"
)
client.create_index(
    db_name="my_database",
    collection_name="test_collection",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.*;

IndexParam indexParamForIdField = IndexParam.builder()
        .fieldName("product_name")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build();
IndexParam indexParamForVectorField = IndexParam.builder()
        .fieldName("embedding")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build();
List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(indexParamForIdField);
indexParams.add(indexParamForVectorField);
CreateIndexReq createIndexReq = CreateIndexReq.builder()
        .dbName("my_database")
        .collectionName("test_collection")
        .indexParams(indexParams)
        .build();
client.createIndex(createIndexReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

collectionName := "test_collection"
indexOptions := []milvusclient.CreateIndexOption{
    milvusclient.NewCreateIndexOption(collectionName, "embedding", index.NewAutoIndex(entity.COSINE)),
    milvusclient.NewCreateIndexOption(collectionName, "product_name", index.NewAutoIndex(index.AUTOINDEX)),
}
indexTask, err := client.CreateIndex(ctx, indexOptions)
if err != nil {
    // handler err
}
err = indexTask.Await(ctx)
if err != nil {
    // handler err
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.createIndex({
    db_name: "my_database",
    collection_name: "test_collection",
    field_name: "product_name",
    index_type: "AUTOINDEX"
})
client.createIndex({
    db_name: "my_database",
    collection_name: "test_collection",
    field_name: "embedding",
    index_type: "AUTOINDEX",
    metric_type: "COSINE"
})
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "embedding",
            "indexName": "my_vector",
            "indexType": "AUTOINDEX"
        },
        {
            "fieldName": "product_name",
            "indexName": "my_id",
            "indexType": "AUTOINDEX"
        }
    ]'

curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"dbName\": \"my_database\",
    \"collectionName\": \"test_collection\",
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## ステップ5: データのリフレッシュ\{#step-5-refresh-data}

コレクションの準備ができたら、データのメタデータとインデックスを作成するためにリフレッシュを実行します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
job_id = client.refresh_external_collection(
    db_name="my_database",
    collection_name="test_collection"
)
while True:
    progress = client.get_refresh_external_collection_progress(job_id=job_id)
    print(f"  {progress.state}: {progress.progress}%")
    if progress.state == "RefreshCompleted":
        elapsed = progress.end_time - progress.start_time
        print(f"  Completed in {elapsed}ms")
        break
    elif progress.state == "RefreshFailed":
        print(f"  Failed: {progress.reason}")
        break
    time.sleep(2)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.GetRefreshExternalCollectionProgressReq;
import io.milvus.v2.service.utility.request.ListRefreshExternalCollectionJobsReq;
import io.milvus.v2.service.utility.request.RefreshExternalCollectionReq;
import io.milvus.v2.service.utility.response.GetRefreshExternalCollectionProgressResp;
import io.milvus.v2.service.utility.response.ListRefreshExternalCollectionJobsResp;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionJobInfo;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionResp;

while (true) {
    GetRefreshExternalCollectionProgressResp resp = client.getRefreshExternalCollectionProgress(
            GetRefreshExternalCollectionProgressReq.builder()
                    .jobId(jobId)
                    .build());
    RefreshExternalCollectionJobInfo jobInfo = resp.getJobInfo();
    if ("RefreshCompleted".equals(jobInfo.getState())) {
        long elapsed = jobInfo.getEndTime() - jobInfo.getStartTime();
        System.out.printf("  Refresh completed in %dms%n", elapsed);
        break;
    } else if ("RefreshFailed".equals(jobInfo.getState())) {
        System.out.printf("  Refresh failed: %s%n", jobInfo.getReason());
    }
    TimeUnit.SECONDS.sleep(2);
}
```

</TabItem>

<TabItem value='go'>

```go
refreshResult, err := client.RefreshExternalCollection(ctx,
    client.NewRefreshExternalCollectionOption("test_collection"))
jobID := refreshResult.JobID
for {
    progress, _ := client.GetRefreshExternalCollectionProgress(ctx,
        client.NewGetRefreshExternalCollectionProgressOption(jobID))
    fmt.Printf("State: %s\n", progress.State)
    if progress.State == entity.RefreshStateCompleted {
        fmt.Println("Refresh completed!")
        break
    }
    if progress.State == entity.RefreshStateFailed {
        fmt.Printf("Refresh failed: %s\n", progress.Reason)
        break
    }
    time.Sleep(2 * time.Second)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/jobs/external_collection/refresh" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"dbName\": \"my_database\",
    \"collectionName\": \"test_collection\",
    \"externalSource\": \"volume://my_volume/path/to/a/folder\",
    \"externalSpec\": \"{\\\"format\\\": \\\"parquet\\\"}\"
}"
```

</TabItem>
</Tabs>

リフレッシュ操作は非同期で実行されるため、進行状況を監視する反復処理を設定する必要があります。

<Admonition type="info" icon="📘" title="Notes">

- リフレッシュ操作ではデータファイルのメタデータをスキャンし、それに基づいてマニフェストファイルを生成します。通常、150〜250 ms かかります。

- マニフェストファイルには、Milvus 内のメタデータと外部ファイル内の行とのマッピングが記録されます。

- ソースデータが更新された場合は、手動でリフレッシュを再実行して Zilliz Cloud を最新の状態に保つ必要があります。

- 挿入を伴わずにすべてのアクティブなメタデータを削除するリフレッシュは拒否されます。

- オンデマンドコンピューティング用データベース内の外部コレクションは、手動でロードおよびリリースする必要はありません。

</Admonition>

## 次のステップ\{#follow-ups}

外部コレクションをリフレッシュすると、オンデマンドコンピューティング用のデータベース内のコレクションは、検索とクエリのためにオンデマンドクラスターにアタッチする必要がある点を除き、任意のマネージドコレクションと同様に、外部コレクションで類似検索とクエリを実行できます。詳細については、[オンデマンドクラスターの作成](./on-demand-cluster)とその関連ページを参照してください。

search、query、get、ハイブリッド検索などの DQL 操作を実行する前に、オンデマンドクラスターのコンピューティングリソースをアタッチするためのセッションを作成する必要があります。詳細については、[オンデマンド DQL 操作](./dql-sessions-external-collection)を参照してください。



import DocCardList from '@theme/DocCardList';

<DocCardList />
