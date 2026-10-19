---
title: "スナップショットをデータソースとして使用する | Cloud"
slug: /use-milvus-snapshot-as-data-source
sidebar_label: "スナップショットをソースとして使用"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スナップショットのメタデータ JSON パスを `externalsource` として使用し、`externalspec.format` を `\"milvus-table\"` に設定すると、Milvus スナップショットから外部コレクションを作成できます。 | Cloud"
type: origin
token: JfJvwdGz0iD9LpkrCMccZ2ypn0g
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スナップショットをデータソースとして使用する

スナップショットのメタデータ JSON パスを `external_source` として使用し、`external_spec.format` を `"milvus-table"` に設定すると、Milvus スナップショットから外部コレクションを作成できます。

外部コレクションを更新すると、Milvus はソースのセグメントマニフェストをターゲットの外部セグメントにマッピングします。メイン列のデータはスナップショットソースから参照されたままになりますが、生成された関数出力や変換された削除ログなど、ターゲットが所有するデータはターゲットコレクションの下に書き込まれます。

## 事前準備\{#before-you-start}

外部コレクションを作成する前に、以下の条件を満たしていることを確認してください。

- ソーススナップショットが、Milvus v3.0.x サーバーと互換性のある Zilliz Cloud クラスター内のコレクションから作成されていること。

- ソースコレクション自体が外部コレクションではないこと。

- `external_source` が、具体的なスナップショットメタデータ JSON ファイル（たとえば `s3://bucket/snapshots/{source_collection_id}/metadata/{snapshot_id}.json`）を指していること。

- 各ターゲットデータフィールドの `external_field` が、対応するソースフィールド名に設定されていること。

- ターゲットスキーマが、マッピングされたデータフィールドについてソーススナップショットのスキーマと一致していること。

ソーススナップショットが、v3.0.x リリースの Milvus インスタンスと互換性のある Zilliz Cloud クラスターで作成されたコレクションからのものではない場合、ソーススキーマがターゲットスキーマと一致しない場合、スナップショットメタデータ JSON にマニフェスト情報がない場合、またはソースが別の外部コレクションである場合、作成または更新は失敗します。

## Milvus スナップショットから外部コレクションを作成する\{#create-an-external-collection-from-a-milvus-snapshot}

次の例では、既存のスナップショットから `milvus-table` 外部コレクションを作成し、更新します。

### ステップ 1: スナップショットのメタデータパスを取得する\{#step-1-get-the-snapshot-metadata-path}

通常の Milvus コレクションからスナップショットを作成するか選択し、そのスナップショットの詳細を取得してオブジェクトストレージのロケーションを取得します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

snapshot_info = client.describe_snapshot(
    snapshot_name="analytics_snapshot_20260321",
    collection_name="analytics",
)
external_source = f"s3://bucket/{snapshot_info.s3_location}"
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.snapshot.request.DescribeSnapshotReq;
import io.milvus.v2.service.snapshot.response.DescribeSnapshotResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

DescribeSnapshotResp snapshotInfo = client.describeSnapshot(DescribeSnapshotReq.builder()
        .snapshotName("analytics_snapshot_20260321")
        .collectionName("analytics")
        .build());

String externalSource = "s3://bucket/" + snapshotInfo.getS3Location();
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal("failed to connect to milvus: ", err.Error())
}
defer client.Close(ctx)

snapshot, err := client.DescribeSnapshot(ctx, milvusclient.NewDescribeSnapshotOption("analytics_snapshot_20260321", "analytics"))
if err != nil {
    log.Fatal("failed to describe snapshot: ", err.Error())
}

externalSource := fmt.Sprintf("s3://bucket/%s", snapshot.GetS3Location())
fmt.Println("External source:", externalSource)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN")).await?;

let snapshot_info = client
    .describe_snapshot(
        DescribeSnapshotRequest::builder()
            .collection_name("analytics")
            .snapshot_name("analytics_snapshot_20260321")
            .build()?,
    )
    .await?;

let external_source = format!("s3://bucket/{}", snapshot_info.s3_location());
println!("External source: {external_source}");
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <stdexcept>
#include <string>

#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}

milvus::DescribeSnapshotResponse response;
status = client->DescribeSnapshot(milvus::DescribeSnapshotRequest()
                                      .WithSnapshotName("analytics_snapshot_20260321")
                                      .WithCollectionName("analytics"),
                                  response);
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}

std::string external_source = "s3://bucket/" + response.S3Location();
std::cout << "External source: " << external_source << std::endl;
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const snapshotInfo = await client.describeSnapshot({
  collection_name: "analytics",
  snapshot_name: "analytics_snapshot_20260321",
});

const externalSource = `s3://bucket/${snapshotInfo.s3_location}`;
```

</TabItem>

<TabItem value='bash'>

```bash
curl 'YOUR_CLUSTER_ENDPOINT/v2/vectordb/snapshots/describe' \
  -H 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "collectionName": "analytics",
    "snapshotName": "analytics_snapshot_20260321"
  }'
```

</TabItem>
</Tabs>

### ステップ 2: `milvus-table` 外部コレクションを作成して更新する\{#step-2-create-and-refresh-a-milvus-table-external-collection}

スナップショットのソースコレクションとスキーマが一致する外部コレクションを作成します。`external_spec.format` を `"milvus-table"` に設定し、各ターゲットデータフィールドの `external_field` を対応するソースフィールド名に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema = client.create_schema(
    external_source=external_source,
    external_spec="""{
        "format": "milvus-table",
        "extfs": {
            "cloud_provider": "aws",
            "region": "us-west-2",
            "access_key_id": "YOUR_ACCESS_KEY",
            "access_key_value": "YOUR_SECRET_KEY"
        }
    }""",
)
schema.add_field(
    field_name="id",
    datatype=DataType.INT64,
    is_primary=True,
    external_field="id",
)
schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=768,
    external_field="embedding",
)
client.create_collection(
    collection_name="snapshot_external_collection",
    schema=schema,
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// The snapshot metadata path obtained in Step 1
String externalSource = "s3://bucket/snapshots/{source_collection_id}/metadata/{snapshot_id}.json";

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .externalSource(externalSource)
        .externalSpec(new Gson().fromJson(
                "{\"format\":\"milvus-table\",\"extfs\":{\"cloud_provider\":\"aws\",\"region\":\"us-west-2\",\"access_key_id\":\"YOUR_ACCESS_KEY\",\"access_key_value\":\"YOUR_SECRET_KEY\"}}",
                JsonObject.class))
        .build();
schema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(true).externalField("id").build());
schema.addField(AddFieldReq.builder().fieldName("embedding").dataType(DataType.FloatVector).dimension(768).externalField("embedding").build());

client.createCollection(CreateCollectionReq.builder()
        .collectionName("snapshot_external_collection")
        .collectionSchema(schema)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal("failed to connect to milvus: ", err.Error())
}
defer client.Close(ctx)

// The snapshot metadata path obtained in Step 1
externalSource := "s3://bucket/snapshots/{source_collection_id}/metadata/{snapshot_id}.json"

schema := entity.NewSchema().
    WithExternalSource(externalSource).
    WithExternalSpec(`{
  "format": "milvus-table",
  "extfs": {
    "cloud_provider": "aws",
    "region": "us-west-2",
    "access_key_id": "YOUR_ACCESS_KEY",
    "access_key_value": "YOUR_SECRET_KEY"
  }
}`).
    WithField(entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true).WithExternalField("id")).
    WithField(entity.NewField().WithName("embedding").WithDataType(entity.FieldTypeFloatVector).WithDim(768).WithExternalField("embedding"))

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("snapshot_external_collection", schema))
if err != nil {
    log.Fatal("failed to create external collection: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN")).await?;

// The snapshot metadata path obtained in Step 1
let external_source = "s3://bucket/snapshots/{source_collection_id}/metadata/{snapshot_id}.json";

let schema = CollectionSchema::new()
    .enable_dynamic_field(false) // external collections do not support dynamic fields
    .external_source(external_source)
    .external_spec(serde_json::json!({
        "format": "milvus-table",
        "extfs": {
            "cloud_provider": "aws",
            "region": "us-west-2",
            "access_key_id": "YOUR_ACCESS_KEY",
            "access_key_value": "YOUR_SECRET_KEY"
        }
    }))
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).external_field("id"))
    .add_field(FieldSchema::new().name("embedding").data_type(DataType::FloatVector).dimension(768).external_field("embedding"));

client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name("snapshot_external_collection")
            .schema(schema)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <memory>
#include <stdexcept>
#include <string>

#include "milvus/MilvusClientV2.h"
#include <milvus/thirdparty/nlohmann/json.hpp>

auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}

// The snapshot metadata path obtained in Step 1
std::string external_source = "s3://bucket/snapshots/{source_collection_id}/metadata/{snapshot_id}.json";

auto schema = std::make_shared<milvus::CollectionSchema>();
schema->SetEnableDynamicField(false); // external collections do not support dynamic fields
schema->WithExternalSource(external_source);
schema->WithExternalSpec(nlohmann::json::parse(R"({
        "format": "milvus-table",
        "extfs": {
            "cloud_provider": "aws",
            "region": "us-west-2",
            "access_key_id": "YOUR_ACCESS_KEY",
            "access_key_value": "YOUR_SECRET_KEY"
        }
    })"));
schema->AddField(milvus::FieldSchema("id", milvus::DataType::INT64, "", true).WithExternalField("id"));
schema->AddField(milvus::FieldSchema("embedding", milvus::DataType::FLOAT_VECTOR).WithDimension(768).WithExternalField("embedding"));

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                      .WithCollectionName("snapshot_external_collection")
                                      .WithCollectionSchema(schema));
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

// The snapshot metadata path obtained in Step 1
const externalSource = "s3://bucket/snapshots/{source_collection_id}/metadata/{snapshot_id}.json";

await client.createCollection({
  collection_name: "snapshot_external_collection",
  schema: [
    // Note: milvus-sdk-node does not allow is_primary_key on external collection fields.
    { name: "id", data_type: DataType.Int64, external_field: "id" },
    { name: "embedding", data_type: DataType.FloatVector, dim: 768, external_field: "embedding" },
  ],
  external_source: externalSource,
  external_spec: JSON.stringify({
    format: "milvus-table",
    extfs: {
      cloud_provider: "aws",
      region: "us-west-2",
      access_key_id: "YOUR_ACCESS_KEY",
      access_key_value: "YOUR_SECRET_KEY",
    },
  }),
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl 'YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create' \
  -H 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "collectionName": "snapshot_external_collection",
    "schema": {
      "externalSource": "s3://bucket/snapshots/{source_collection_id}/metadata/{snapshot_id}.json",
      "externalSpec": "{\"format\": \"milvus-table\", \"extfs\": {\"cloud_provider\": \"aws\", \"region\": \"us-west-2\", \"access_key_id\": \"YOUR_ACCESS_KEY\", \"access_key_value\": \"YOUR_SECRET_KEY\"}}",
      "enableDynamicField": false,
      "fields": [
        {"fieldName": "id", "dataType": "Int64", "isPrimary": true, "externalField": "id"},
        {"fieldName": "embedding", "dataType": "FloatVector", "elementTypeParams": {"dim": "768"}, "externalField": "embedding"}
      ]
    }
  }'
```

</TabItem>
</Tabs>

## データを更新する\{#refresh-data}

コレクションの準備ができたら、それを更新してデータのメタデータとインデックスを作成します。詳細については、[Create an External コレクション](./create-external-collection#step-5-refresh-data) を参照してください。
