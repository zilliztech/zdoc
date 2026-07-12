---
title: "Snapshot をデータソースとして使用 | Cloud"
slug: /use-milvus-snapshot-as-data-source
sidebar_label: "ソースとしての Snapshot"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Milvus snapshot から external collection を作成するには、snapshot metadata JSON path を `externalsource` として使用し、`externalspec.format` を `\"milvus-table\"` に設定します。 | Cloud"
type: origin
token: JfJvwdGz0iD9LpkrCMccZ2ypn0g
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Snapshot をデータソースとして使用

Milvus snapshot から external collection を作成するには、snapshot metadata JSON path を `external_source` として使用し、`external_spec.format` を `"milvus-table"` に設定します。 

external collection を refresh すると、Milvus はソースの segment manifests をターゲットの external segments にマッピングします。メインの column data は snapshot source から参照されたままになり、生成された function outputs や変換された delete logs など、ターゲット所有のデータはターゲット collection 配下に書き込まれます。

## 始める前に\{#before-you-start}

external collection を作成する前に、以下を確認してください。

- ソース snapshot が、Milvus v3.0.x server と互換性のある Zilliz Cloud cluster 内の collection から作成されていること。

- ソース collection 自体が external collection ではないこと。

- `external_source` が具体的な snapshot metadata JSON file を指していること。例: `s3://bucket/snapshots/{source_collection_id}/metadata/{snapshot_id}.json`

- 各ターゲット data field が、対応するソース field name に `external_field` を設定していること。

- ターゲット schema が、マッピングされた data fields についてソース snapshot schema と一致していること。

ソース snapshot が、v3.0.x release の Milvus instance と互換性のある Zilliz Cloud cluster 上で作成された collection からのものではない場合、ソース schema がターゲット schema と一致しない場合、snapshot metadata JSON に manifest 情報がない場合、またはソースが別の external collection である場合、作成または refresh は失敗します。

## Milvus snapshot から external collection を作成する\{#create-an-external-collection-from-a-milvus-snapshot}

次の例では、既存の snapshot から `milvus-table` external collection を作成し、それを refresh します。

### Step 1: snapshot metadata path を取得する\{#step-1-get-the-snapshot-metadata-path}

通常の Milvus collection から snapshot を作成または選択し、その後 describe して object-storage location を取得します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

snapshot_info = client.describe_snapshot(
    snapshot_name="analytics_snapshot_20260321",
    include_collection_info=True
)

external_source = f"s3://bucket/{snapshot_info.s3_location}"
```

</TabItem>

<TabItem value='java'>

```java
//java
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
# rest
```

</TabItem>
</Tabs>

### Step 2: `milvus-table` external collection を作成して refresh する\{#step-2-create-and-refresh-a-milvus-table-external-collection}

schema が snapshot source collection と一致する external collection を作成します。`external_spec.format` を `"milvus-table"` に設定し、各ターゲット data field の `external_field` を対応するソース field name に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
// java
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "time"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    Token:   "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    panic(err)
}

snapshot, err := client.DescribeSnapshot(
    ctx,
    milvusclient.NewDescribeSnapshotOption("analytics_snapshot_20260321", "source_collection"),
)
if err != nil {
    panic(err)
}

externalSource := fmt.Sprintf("s3://bucket/%s", snapshot.GetS3Location())
externalSpec := `{
  "format": "milvus-table",
  "extfs": {
    "cloud_provider": "aws",
    "region": "us-west-2",
    "access_key_id": "YOUR_ACCESS_KEY",
    "access_key_value": "YOUR_SECRET_KEY"
  }
}`

schema := entity.NewSchema().
    WithName("snapshot_external_collection").
    WithExternalSource(externalSource).
    WithExternalSpec(externalSpec).
    WithField(entity.NewField().
        WithName("id").
        WithDataType(entity.FieldTypeInt64).
        WithIsPrimaryKey(true).
        WithExternalField("id")).
    WithField(entity.NewField().
        WithName("embedding").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(768).
        WithExternalField("embedding"))

err = client.CreateCollection(
    ctx,
    milvusclient.NewCreateCollectionOption("snapshot_external_collection", schema),
)
if err != nil {
    panic(err)
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
# rest
```

</TabItem>
</Tabs>

## データを refresh する\{#refresh-data}

collection の準備ができたら、refresh してデータの metadata と indexes を作成します。詳細については、[External Collection を作成する](./create-external-collection#step-5-refresh-data) を参照してください。

