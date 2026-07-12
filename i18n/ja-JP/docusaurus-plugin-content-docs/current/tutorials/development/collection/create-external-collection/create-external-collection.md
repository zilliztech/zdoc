---
title: "External Collection の作成 | Cloud"
slug: /create-external-collection
sidebar_label: "External Collection"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "external collection は、AWS S3 や Iceberg などの外部ストレージシステムまたはデータベーステーブルから、Zilliz Cloud にコピーすることなくデータへアクセスする Zilliz Cloud のデータ collection の一種です。Zilliz Cloud のクエリインターフェイスとの互換性を維持しながら、データレイク上のクエリレイヤーとして機能します。 | Cloud"
type: origin
token: RsGAwmgAYiE6fgkOiokcijsBnEg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# External Collection の作成

external collection は、AWS S3 や Iceberg などの外部ストレージシステムまたはデータベーステーブルから、Zilliz Cloud にコピーすることなくデータへアクセスする Zilliz Cloud のデータ collection の一種です。Zilliz Cloud のクエリインターフェイスとの互換性を維持しながら、データレイク上のクエリレイヤーとして機能します。

## 概要\{#overview}

一般的な AI データパイプラインでは、ユーザーはすでに AWS S3 などのストレージシステム上に、Parquet またはその他の形式でデータを保存している場合があります。Zilliz Cloud がこの外部に保存されたデータを利用できるようにするには、通常、Extract-Transform-Load（ETL）パイプラインを使用して Zilliz Cloud 独自のストレージにインポートする必要があります。 

この「データを Zilliz Cloud に持ち込む」ワークフローでは、同期が困難な冗長データが作成され、データの一貫性を確保するためのエンジニアリング保守負荷が増加します。

![YQXWwPQ3vheYa4b8398cWoPNnyN](https://zdoc-images.s3.us-west-2.amazonaws.com/YQXWwPQ3vheYa4b8398cWoPNnyN.png)

これらの問題を解決するため、Zilliz Cloud は、データ同期や ETL パイプラインを心配することなく、Zilliz Cloud から外部に保存されたデータへアクセスできる external collection を提供します。

![Q6F4wtcd2h3PnKbnMxncw3urn3f](https://zdoc-images.s3.us-west-2.amazonaws.com/Q6F4wtcd2h3PnKbnMxncw3urn3f.png)

作成後、external collection はデータに直接アクセスし、データを保存している場所にそのまま保持できます。バックグラウンドでは、Zilliz Cloud が Zilliz Cloud のメタデータと外部データファイル内の行とのマッピングを記録する manifest ファイルを作成します。manifest ファイルの準備が完了すると、任意の managed collection と同様に external collection 内に index を作成できます。 

データが変更された場合、サブ秒単位の refresh を手動でトリガーすることでメタデータが更新され、Zilliz Cloud を常に最新の状態に保てます。

external collection は、オンデマンドコンピューティング用のデータベースで利用できます。

## ステップ 1: schema の作成\{#step-1-create-schema}

managed collection を作成する場合と同様に、external collection を作成する前にも schema を作成する必要があります。ただし、schema は managed collection のものとは少し異なります。

### 準備\{#preparation}

- オンデマンドコンピューティング用のデータベースで external collection を作成するための十分な権限を持つ API key を取得済みであること。

    詳細については、[API Keys](./manage-api-keys) を参照してください。

- オブジェクトストレージバケットを Zilliz Cloud と統合済みであること。

    詳細については、[AWS](./integrate-with-aws-s3)、[GCP](./integrate-with-gcp)、および [Azure](./integrate-with-azure-blob-storage) のドキュメントを参照してください。

- バケット統合から external volume を作成済みであること。volume に対象のデータファイルが含まれていることを確認してください。

    詳細については、[External Volumes](./external-volume) を参照してください。

### サポートされるデータソース\{#support-data-sources}

Zilliz Cloud は次のデータソースをサポートしており、選択した形式に対応する外部ソースを指定する必要があります。

- `parquet`

    `external_source` を対象の Parquet ファイルを含むフォルダーに設定します。

- `vortex`,

    `external_source` を version 0.56 の Vortex columnar ファイルを含むフォルダーに設定します。

- `lance-table`

    `external_source` を、**_transactions**、**_versions**、**data** などのサブフォルダーを含むフォルダーパスに設定します。

- `iceberg-table`

    `external_source` を Iceberg table の `metadata.json` ファイルに設定し、次のように snapshot ID を渡します。

    ```python
    external_spec={
        "format": "iceberg-table",
        "snapshot_id": "473984310232959286"
    }
    ```

- `milvus-table`

    `external_source` を具体的な Milvus snapshot メタデータ JSON ファイルに設定します。詳細については、[Snapshot をデータソースとして使用する](./use-milvus-snapshot-as-data-source) を参照してください。

### schema の設定\{#set-up-schema}

対象のデータファイルを含む external volume を用意したら、collection の列を Parquet ファイル（`parquet`）、lance table（`lance-table`）、Iceberg table（`iceberg-table`）、または 0.56.0 形式の Vortex ファイル（`vortex`）にマッピングする schema を作成します。

<Admonition type="info" icon="📘" title="Notes">

外部ソースは、これがフォルダーであることを示すためにスラッシュ（/）で終わる必要があります。

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

## ステップ 2: field の追加\{#step-2-add-fields}

schema の準備ができたら、次のように field を追加できます。

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

## ステップ 3: collection の作成\{#step-3-create-a-collection}

すべての field を schema に追加したら、external collection を作成できます。

<Admonition type="info" icon="📘" title="Notes">

external collection はプロジェクトレベルのデータベース内に作成でき、通常はオンデマンド cluster に関連付けられます。

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

## ステップ 4: index の作成\{#step-4-create-indexes}

managed collection の場合と同様に、external collection の列に index を作成できます。

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

## ステップ 5: データの refresh\{#step-5-refresh-data}

collection の準備ができたら、それを refresh してデータのメタデータと index を作成します。

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

refresh 操作は非同期であるため、その進行状況を監視するための反復処理を設定する必要があります。

<Admonition type="info" icon="📘" title="Notes">

- refresh 操作はデータファイルのメタデータをスキャンし、それに応じて manifest ファイルを生成します。通常、150〜250 ms かかります。

- manifest ファイルは、Milvus 内のメタデータと外部ファイル内の行とのマッピングを記録します。

- ソースデータに更新があった場合、Zilliz Cloud を最新の状態に保つために refresh を再度手動で呼び出す必要があります。

- 挿入を伴わず、すべてのアクティブなメタデータを削除する必要がある refresh は拒否されます。

- オンデマンドコンピューティング用のデータベース内の external collection については、手動で load および release する必要はありません。

</Admonition>

## 次のステップ\{#follow-ups}

external collection を refresh した後は、任意の managed collection と同様に external collection で類似検索やクエリを実行できます。ただし、オンデマンドコンピューティング用のデータベース内の collection は、検索やクエリのためにオンデマンド cluster にアタッチされている必要があります。詳細については、[On-Demand Cluster の作成](./on-demand-cluster) とその関連ページを参照してください。

search、query、get、hybrid search などの DQL 操作を実行する前に、オンデマンド cluster のコンピューティングリソースをアタッチする session を作成する必要があります。詳細については、[On-Demand DQL Operations](./dql-sessions-external-collection) を参照してください。



import DocCardList from '@theme/DocCardList';

<DocCardList />
