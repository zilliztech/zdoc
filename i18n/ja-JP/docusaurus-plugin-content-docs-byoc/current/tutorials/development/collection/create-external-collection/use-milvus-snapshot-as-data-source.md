---
title: "スナップショットをデータソースとして使用する | BYOC"
slug: /use-milvus-snapshot-as-data-source
sidebar_label: "Snapshot as Source"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スナップショットのメタデータ JSON パスを `externalsource` として使用し、`externalspec.format` を `\"milvus-table\"` に設定することで、Milvus スナップショットから外部コレクションを作成できます。 | BYOC"
type: origin
token: JfJvwdGz0iD9LpkrCMccZ2ypn0g
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スナップショットをデータソースとして使用する

スナップショットのメタデータ JSON パスを `external_source` として使用し、`external_spec.format` を `"milvus-table"` に設定することで、Milvus スナップショットから外部コレクションを作成できます。

外部コレクションをリフレッシュすると、Milvus はソースセグメントのマニフェストをターゲットの外部セグメントにマッピングします。主要なカラムデータはスナップショットソースから参照されたまま維持され、生成された関数出力や変換された削除ログなどターゲットが所有するデータはターゲットコレクション配下に書き込まれます。

## 開始前に\{#before-you-start}

外部コレクションを作成する前に、以下の点を確認してください。

- ソーススナップショットが、Milvus v3.0.x サーバーと互換性のある Zilliz Cloud クラスター内のコレクションから作成されていること。

- ソースコレクション自体が外部コレクションではないこと。

- `external_source` が具体的なスナップショットメタデータ JSON ファイル（例: `s3://bucket/snapshots/{source_collection_id}/metadata/{snapshot_id}.json`）を指していること。

- 各ターゲットデータフィールドの `external_field` が対応するソースフィールド名に設定されていること。

- ターゲットスキーマが、マッピング対象のデータフィールドについてソーススナップショットのスキーマと一致していること。

ソーススナップショットが v3.0.x リリースの Milvus インスタンスと互換性のある Zilliz Cloud クラスター上のコレクションから作成されていない場合、ソーススキーマがターゲットスキーマと一致しない場合、スナップショットメタデータ JSON にマニフェスト情報がない場合、またはソースが別の外部コレクションである場合は、作成またはリフレッシュに失敗します。

## Milvus スナップショットから外部コレクションを作成する\{#create-an-external-collection-from-a-milvus-snapshot}

以下の例では、既存のスナップショットから `milvus-table` 外部コレクションを作成し、それをリフレッシュします。

### ステップ 1: スナップショットメタデータのパスを取得する\{#step-1-get-the-snapshot-metadata-path}

通常の Milvus コレクションからスナップショットを作成または選択し、describe コマンドを実行してオブジェクトストレージ上の場所を取得します。

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

### ステップ 2: `milvus-table` 外部コレクションの作成とリフレッシュ\{#step-2-create-and-refresh-a-milvus-table-external-collection}

スナップショットのソースコレクションと一致するスキーマを持つ外部コレクションを作成します。`external_spec.format` を `"milvus-table"` に設定し、各ターゲットデータフィールドの `external_field` を対応するソースフィールド名に設定します。

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

## データをリフレッシュする\{#refresh-data}

コレクションの準備ができたら、リフレッシュを実行してデータのメタデータとインデックスを作成します。詳細については、「[外部コレクションの作成](./create-external-collection#step-5-refresh-data)」を参照してください。

