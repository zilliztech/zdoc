---
title: "外部コレクションの作成 | Cloud"
slug: /create-external-collection
sidebar_key: create-external-collection
sidebar_label: "外部コレクションの作成"
beta: PUBLIC
notebook: FALSE
description: "外部コレクションは、AWS S3 や Iceberg などの外部ストレージシステムやデータベーステーブルからデータを Zilliz Cloud 内にコピーすることなくアクセスできる、Zilliz Cloud におけるデータコレクションの一種です。これは、Zilliz Cloud のクエリインターフェースとの互換性を維持しつつ、データレイク上のクエリ層として機能します。 | Cloud"
type: origin
token: RsGAwmgAYiE6fgkOiokcijsBnEg
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - external collection

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 外部コレクションの作成

外部コレクションは、AWS S3 や Iceberg などの外部ストレージシステムやデータベーステーブルからデータをコピーせずにアクセスできる、Zilliz Cloud におけるデータコレクションの一種です。これは、Zilliz Cloud のクエリインターフェースとの互換性を維持しつつ、データレイク上のクエリ層として機能します。

## 概要\{#overview}

典型的な AI データパイプラインでは、ユーザーはすでに Parquet やその他の形式でデータを AWS S3 などのストレージシステムに保存している場合があります。Zilliz Cloud でこの外部に保存されたデータを消費させるには、通常、Extract-Transform-Load (ETL) パイプラインを使用して Zilliz Cloud 独自のストレージにインポートする必要があります。

この「データを Zilliz Cloud に持ち込む」ワークフローは、同期が困難な冗長なデータを生み出し、データの一貫性を確保するためのエンジニアリングメンテナンス負担を増大させます。

![YQXWwPQ3vheYa4b8398cWoPNnyN](https://zdoc-images.s3.us-west-2.amazonaws.com/YQXWwPQ3vheYa4b8398cWoPNnyN.png)

これらの問題を解決するため、Zilliz Cloud は外部コレクションを提供します。これにより、データの同期や ETL パイプラインを心配することなく、Zilliz Cloud から外部に保存されたデータにアクセスできます。

![Q6F4wtcd2h3PnKbnMxncw3urn3f](https://zdoc-images.s3.us-west-2.amazonaws.com/Q6F4wtcd2h3PnKbnMxncw3urn3f.png)

一度作成されると、外部コレクションはデータに直接アクセスし、データを保存している場所にそのまま保持します。バックグラウンドでは、Zilliz Cloud がマニフェストファイルを作成して、Zilliz Cloud のメタデータと外部データファイル内の行との間のマッピングを記録します。マニフェストファイルの準備が整えば、管理対象コレクションの場合と同様に、外部コレクション内にインデックスを作成できます。

データが変更された場合、手動でサブ秒単位の更新をトリガーすることでメタデータが更新され、Zilliz Cloud を常に最新の状態に保つことができます。

外部コレクションは、オンデマンドコンピューティング用のサービングクラスターとデータベースの両方で利用可能です。

## ステップ 1: スキーマの作成\{#step-1-create-schema}

管理対象コレクションの作成と同様に、外部コレクションを作成する前にもスキーマを作成する必要があります。ただし、そのスキーマは管理対象コレクションのものとはわずかに異なります。

### 準備\{#preparation}

- オンデマンドコンピューティング用データベース内で外部コレクションを作成するのに十分な権限を持つ API キーを取得済みであること。

    詳細については、[API キー](./manage-api-keys) を参照してください。

- オブジェクトストレージバケットを Zilliz Cloud と統合済みであること。

    詳細については、[サードパーティとの統合](./integrate-with-third-parties) 内の AWS、GCP、および Azure のドキュメントを参照してください。

- バケット統合に基づいて外部ボリュームを作成済みであること。そのボリュームに対象のデータファイルが含まれていることを確認してください。

    詳細については、[外部ボリューム](./external-volume) を参照してください。

### サポートされるデータソース\{#support-data-sources}

Zilliz Cloud は以下のデータソースをサポートしており、選択した形式に対応する外部ソースを提供する必要があります。

- `parquet`

    `external_source` を、対象の Parquet ファイルを含むフォルダーに設定します。

- `vortex`,

    `external_source` を、バージョン 0.56 用の Vortex 列指向ファイルを含むフォルダーに設定します。

- `lance-table`

    `external_source` を、**_transactions**、**_versions**、**data** などのサブフォルダーを含むフォルダーパスに設定します。

- `iceberg-table`

    `external_source` を Iceberg テーブルの `metadata.json` ファイルに設定し、スナップショット ID を渡します（例：

    ```python
    external_spec={
        "format": "iceberg-table",
        "snapshot_id": "473984310232959286"
    }
    ```

### スキーマの設定\{#set-up-schema}

ターゲットデータファイルを含む外部ボリュームが準備できたら、コレクションの列を Parquet ファイル (`parquet`)、Lance テーブル (`lance-table`)、Iceberg テーブル (`iceberg-table`)、または 0.56.0 形式の Vortex ファイル (`vortex`) にマッピングするスキーマを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema(
    external_source='volume://my_volume/path/to/a/file/or/folder',
    external_spec='{
        "format": "parquet"
    }'
)
```

</TabItem>

<TabItem value='java'>

```java
// Java
```

</TabItem>

<TabItem value='java'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
    client "github.com/milvus-io/milvus/client/v2/milvusclient"
)

schema := entity.NewSchema().
    WithName("product_embeddings").
    WithExternalSource("volume://my_volume/path/to/a/file/or/folder"). 
    WithExternalSpec(\`{"format": "parquet"}\`)
```

</TabItem>

<TabItem value='java'>

```javascript
// node
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

## Step 2: Add fields\{#step-2-add-fields}

スキーマの準備が整ったら、次のようにフィールドを追加できます。

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
    max_length=256,
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
// Java
```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```javascript
// node
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

## ステップ 3: コレクションの作成\{#step-3-create-a-collection}

すべてのフィールドをスキーマに追加した後、外部コレクションを作成できます。

<Admonition type="info" icon="📘" title="Notes">

<p>プロジェクトレベルのデータベースで外部コレクションを作成できます。これは通常、オンデマンドクラスターに関連付けられています。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# connect the database
client = MilvusClient(
    uri="https://{project-id}.{region}.api.zillizcloud.com",
    token="YOUR_API_KEY"
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
// Java
```

</TabItem>

<TabItem value='java'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
    client "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "https://{project-id}.{region}.api.zillizcloud.com"
token := "YOUR_API_KEY"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey: token
})

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("test_collection", schema).
    WithIndexOptions(indexOptions...))
    
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='java'>

```javascript
// node
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

## Step 4: Create indexes\{#step-4-create-indexes}

マネージドコレクションの場合と同様に、外部コレクションの列に対してインデックスを作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

# Add indexes
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX"
)

index_params.add_index(
    field_name="product_name", 
    index_type="AUTOINDEX",
    metric_type="COSINE"
)

client.create_index(
    collection_name="test_collection",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.*;

// 3.3 Prepare index parameters
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
        .collectionName("test_collection")
        .indexParams(Collections.singletonList(indexParams))
        .build();
client.createIndex(createIndexReq);
```

</TabItem>

<TabItem value='java'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

collectionName := "customized_setup_1"
indexOptions := []milvusclient.CreateIndexOption{
    milvusclient.NewCreateIndexOption(collectionName, "embedding", index.NewAutoIndex(entity.COSINE)),
    milvusclient.NewCreateIndexOption(collectionName, "product_name", index.NewAutoIndex(entity.COSINE)),
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

<TabItem value='java'>

```javascript
// 3.2 Prepare index parameters
const index_params = [{
    field_name: "product_name",
    index_type: "AUTOINDEX"
},{
    field_name: "embedding",
    index_type: "AUTOINDEX",
    metric_type: "COSINE"
}]
```

</TabItem>

<TabItem value='java'>

```bash
export indexParams='[
        {
            "fieldName": "embedding",
            "metricType": "COSINE",
            "indexName": "my_vector",
            "indexType": "AUTOINDEX"
        },
        {
            "fieldName": "product_name",
            "indexName": "my_id",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

## ステップ 5: データの更新\{#step-5-refresh-data}

コレクションの準備が整ったら、それを更新してデータのメタデータとインデックスを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
job_id = client.refresh_external_collection(
    collection_name="test_collection"
)

while True:
    progress = client.get_refresh_external_collection_progress(job_id=job_id)
    print(f"  {progress.state}: {progress.progress}%")

    if progress.state == "RefreshCompleted":
        elapsed = progress.end_time - progress.start_time
        print(f"  Completed in {elapsed}ms")
        return job_id
    elif progress.state == "RefreshFailed":
        print(f"  Failed: {progress.reason}")
        return job_id

    time.sleep(2)
```

</TabItem>

<TabItem value='java'>

```java
// Java
```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```javascript
// node
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

refresh 操作は非同期であるため、その進捗状況を監視するためのイテレーションを設定する必要があります。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>refresh 操作はデータファイルのメタデータをスキャンし、それに応じてマニフェストファイルを生成します。通常、150～250 ms かかります。</p></li>
<li><p>マニフェストファイルには、Milvus 内のメタデータと外部ファイル内の行との対応関係が記録されます。</p></li>
<li><p>ソースデータに更新がある場合は、Zilliz Cloud を最新の状態に保つために、手動で再度 refresh を呼び出す必要があります。</p></li>
<li><p>挿入なしですべてのアクティブなメタデータを削除する必要がある refresh は拒否されます。</p></li>
<li><p>オンデマンドコンピューティング用データベース内の外部コレクションの場合、手動でロードおよびリリースする必要はありません。</p></li>
</ul>

</Admonition>

## 後続処理\{#follow-ups}

外部コレクションを refresh した後、オンデマンドコンピューティング用データベース内のコレクションは検索およびクエリ実行のためにオンデマンドクラスターにアタッチされている必要がある点を除けば、管理対象コレクションと同様に、外部コレクションに対して類似度検索やクエリを実行できます。詳細については、[オンデマンドコンピューティング](./on-demand-compute) を参照してください。

