---
title: "スナップショットの管理 | Cloud"
slug: /manage-snapshots
sidebar_label: "スナップショットの管理"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、スナップショットの作成と管理について学びます | Cloud"
type: origin
token: J0jDwYQb8il1biknRo4cazHPn5d
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スナップショットの管理

このガイドでは、以下を含むスナップショットの作成と管理について学びます。

- [スナップショットの作成](./manage-snapshots#create-snapshot),

- [スナップショットの一覧表示](./manage-snapshots#list-snapshots),

- [スナップショットの詳細表示](./manage-snapshots#describe-snapshot),

- [スナップショットデータの pin/unpin](./manage-snapshots#pinunpin-snapshot-data),

- [スナップショットの復元](./manage-snapshots#restore-snapshot),

- [スナップショットの削除](./manage-snapshots#drop-snapshot),

- [復元ジョブの一覧表示](./manage-snapshots#list-restoration-jobs), および

- [復元状態の取得](./manage-snapshots#get-restoration-state)。

## スナップショットの作成\{#create-snapshot}

スナップショットを作成する前に、データ損失の可能性を避けるため、対象のコレクションへのデータ書き込みを停止し、`flush()` を呼び出すことを推奨します。

`flush()` の呼び出しは必須ではありませんが、データ損失を避けるために強く推奨されます。これを省略した場合、スナップショットにはすでに flush 済みのデータのみが含まれます。

スナップショットに名前を付ける際は、`"daily_backup_20240101"` や `"v2.1_production_release"` のような明確で説明的な名前を使用し、`"backup1"` や `"test"` のような一般的な名称は避けてください。バージョン、環境、ステージごとにスナップショットを区別できるよう、スナップショット名を適切に使用してください。

以下のコード例では、すでに `my_collection` という名前のコレクションが存在することを前提としています。

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Recommended: Flush data before creating snapshot to ensure all data is included
client.flush(collection_name="my_collection")

# Create snapshot for entire collection
client.create_snapshot(
    collection_name="my_collection",
    snapshot_name="backup_20240101",
    description="Daily backup for January 1st, 2024"
)
```

```plaintext
// java
```

```go
import (
    "context"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

client, err := milvusclient.New(context.Background(), &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    Token: "YOUR_CLUSTER_TOKEN",
})

// Recommended: Flush data before creating snapshot to ensure all data is included
err = client.Flush(context.Background(), milvusclient.NewFlushOption("my_collection"))
if err != nil {
    log.Fatal(err)
}

// Create snapshot
createOpt := milvusclient.NewCreateSnapshotOption("backup_20240101", "my_collection").
    WithDescription("Daily backup for January 1st, 2024")

err = client.CreateSnapshot(context.Background(), createOpt)
```

```plaintext
// node.js
```

```plaintext
# restful
```

## スナップショットの一覧表示\{#list-snapshots}

既存のスナップショット名を一覧表示できます。

```plaintext
# List all snapshots for a collection
snapshots = client.list_snapshots(
    collection_name="my_collection"
)
```

```plaintext
// java
```

```plaintext
// List snapshots for collection
listOpt := milvusclient.NewListSnapshotsOption().
    WithCollectionName("my_collection")

snapshots, err := client.ListSnapshots(context.Background(), listOpt)
```

```plaintext
// node.js
```

```plaintext
# bash
```

## スナップショットの詳細表示\{#describe-snapshot}

特定のスナップショットに関する詳細情報を取得できます。

```python
snapshot_info = client.describe_snapshot(
    snapshot_name="backup_20240101",
    include_collection_info=True
)

print(f"Snapshot ID: {snapshot_info.id}")
print(f"Collection: {snapshot_info.collection_name}")
print(f"Created: {snapshot_info.create_ts}")
print(f"Description: {snapshot_info.description}")
```

```plaintext
// java
```

```plaintext
describeOpt := milvusclient.NewDescribeSnapshotOption("backup_20240101")
resp, err := client.DescribeSnapshot(context.Background(), describeOpt)

fmt.Printf("Snapshot ID: %d\n", resp.GetSnapshotInfo().GetId())
fmt.Printf("Collection: %s\n", resp.GetSnapshotInfo().GetCollectionName())
```

```plaintext
// node.js
```

```plaintext
# restful
```

## スナップショットデータの pin/unpin\{#pinunpin-snapshot-data}

復元中は、スナップショットを pin してその基盤データをガベージコレクションから一時的に保護し、unpin してデータを解放できます。

また、pin 操作に対して有効期限 (TTL) を設定することもでき、その期間が切れると pin されたデータは解放されます。

```plaintext
pin_id = client.pin_snapshot_data(
    snapshot_name="backup_20240101",
    collection_name="my_collection",
    ttl_seconds=3600,
)

client.unpin_snapshot_data(
    pin_id=pin_id
)
```

```plaintext
// java
```

```plaintext
pinID, err := cli.PinSnapshotData(
    ctx,
    client.NewPinSnapshotDataOption("backup_20240101", "my_collection").WithTTLSeconds(3600),
)

if err != nil {
    return err
}

defer func() {
    _ = cli.UnpinSnapshotData(ctx, client.NewUnpinSnapshotDataOption(pinID))
}()

// do work with pinned snapshot data
```

```plaintext
// node.js
```

```plaintext
# restful
```

## スナップショットの復元\{#restore-snapshot}

スナップショットを新しいコレクションに復元できます。この操作は非同期で実行され、復元の進行状況を追跡するためのジョブ ID が返されます。

復元ではデータインポートではなく **copy-segment** メカニズムを使用します。これは、次の理由によりより効率的です。

- スナップショットストレージからセグメントファイル（binlogs、deltalogs、インデックスファイル）を直接コピーする

- フィールド ID とインデックス ID を保持して、既存のデータファイルとの互換性を確保する

- データの再書き込みやインデックスの再構築を回避することで、復元時間を大幅に短縮する

- 従来のバックアップおよび復元方法と比較して、10 倍から 100 倍のパフォーマンス向上を実現する

スナップショットを復元するには、以下を実行します。

```plaintext
# Restore snapshot to new collection
job_id = client.restore_snapshot(
    snapshot_name="backup_20240101",
    collection_name="restored_collection",
)
```

```plaintext
// java
```

```plaintext
restoreOpt := milvusclient.NewRestoreSnapshotOption(
    "backup_20240101", 
    "restored_collection"
)

jobID, err := client.RestoreSnapshot(context.Background(), restoreOpt)
if err != nil {
    log.Fatal(err)
}
```

```plaintext
// node.js
```

```plaintext
# restful
```

復元ジョブの進行状況を監視する方法の詳細については、「復元の進行状況を監視する」を参照してください。

## スナップショットの削除\{#drop-snapshot}

不要になったスナップショットは削除できます。ストレージを節約するため、古いスナップショットは定期的に削除することを推奨します。

```plaintext
client.drop_snapshot(
    snapshot_name="backup_20240101"
)
```

```plaintext
// java
```

```plaintext
dropOpt := milvusclient.NewDropSnapshotOption("backup_20240101")
err := client.DropSnapshot(context.Background(), dropOpt)
```

```plaintext
// node.js
```

```plaintext
# restful
```

## 復元ジョブの一覧表示\{#list-restoration-jobs}

この API を使用すると、対象のコレクションに対してすでに作成されたスナップショットの一覧を取得できます。

```plaintext
# List all restore jobs
jobs = client.list_restore_snapshot_jobs()

for job in jobs:
    print(f"Job {job.job_id}: {job.snapshot_name} -> Collection {job.collection_id}")
    print(f"  State: {job.state}, Progress: {job.progress}%")

# List restore jobs for a specific collection
jobs = client.list_restore_snapshot_jobs(collection_name="my_collection")
```

```plaintext
// java
```

```plaintext
// List all restore jobs
listOpt := milvusclient.NewListRestoreSnapshotJobsOption()
jobs, err := client.ListRestoreSnapshotJobs(context.Background(), listOpt)
if err != nil {
    log.Fatal(err)
}

for _, job := range jobs {
    fmt.Printf("Job %d: %s -> Collection %d\n", 
        job.GetJobId(), job.GetSnapshotName(), job.GetCollectionId())
    fmt.Printf("  State: %s, Progress: %d%%\n", 
        job.GetState(), job.GetProgress())
}

// List restore jobs for a specific collection
listOpt = milvusclient.NewListRestoreSnapshotJobsOption().
    WithCollectionName("my_collection")
jobs, err = client.ListRestoreSnapshotJobs(context.Background(), listOpt)
```

```plaintext
// node.js
```

```plaintext
# restful
```

## 復元状態の取得\{#get-restoration-state}

復元ジョブ ID を取得したら、それを使用して復元の進行状況を取得できます。

```python
state = client.get_restore_snapshot_state(job_id=12345)

print(f"Job ID: {state.job_id}")
print(f"Snapshot Name: {state.snapshot_name}")
print(f"Collection ID: {state.collection_id}")
print(f"State: {state.state}")
print(f"Progress: {state.progress}%")
if state.state == "RestoreSnapshotFailed":
    print(f"Failure Reason: {state.reason}")
print(f"Time Cost: {state.time_cost}ms")
```

```plaintext
// java
```

```plaintext
stateOpt := milvusclient.NewGetRestoreSnapshotStateOption(12345)
state, err := client.GetRestoreSnapshotState(context.Background(), stateOpt)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Job ID: %d\n", state.GetJobId())
fmt.Printf("Snapshot Name: %s\n", state.GetSnapshotName())
fmt.Printf("Collection ID: %d\n", state.GetCollectionId())
fmt.Printf("State: %s\n", state.GetState())
fmt.Printf("Progress: %d%%\n", state.GetProgress())
if state.GetState() == milvuspb.RestoreSnapshotState_RestoreSnapshotFailed {
    fmt.Printf("Failure Reason: %s\n", state.GetReason())
}
fmt.Printf("Time Cost: %dms\n", state.GetTimeCost())
```

```plaintext
// node.js
```

```plaintext
# restful
```
