---
title: "スナップショットの管理 | Cloud"
slug: /manage-snapshots
sidebar_label: "スナップショットの管理"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、スナップショットの作成と管理の方法について学習します。内容には以下が含まれます | Cloud"
type: origin
token: J0jDwYQb8il1biknRo4cazHPn5d
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スナップショットの管理

このガイドでは、以下を含むスナップショットの作成と管理方法を学びます。

- [スナップショットの作成](./manage-snapshots#create-snapshot),

- [スナップショットの一覧表示](./manage-snapshots#list-snapshots),

- [スナップショットの詳細表示](./manage-snapshots#describe-snapshot),

- [スナップショットデータの pin/unpin](./manage-snapshots#pinunpin-snapshot-data),

- [スナップショットの復元](./manage-snapshots#restore-snapshot),

- [スナップショットの削除](./manage-snapshots#drop-snapshot),

- [復元ジョブの一覧表示](./manage-snapshots#list-restoration-jobs), および

- [復元状態の取得](./manage-snapshots#get-restoration-state)。

## スナップショットの作成\{#create-snapshot}

スナップショットを作成する前に、データ損失の可能性を避けるため、対象の collection へのデータ書き込みを停止し、`flush()` を呼び出すことを推奨します。

`flush()` の呼び出しは必須ではありませんが、データ損失を避けるため強く推奨されます。これをスキップした場合、スナップショットにはすでに flush 済みのデータのみが含まれます。

スナップショットに名前を付ける際は、`"daily_backup_20240101"` や `"v2.1_production_release"` のような明確で説明的な名前を使用し、`"backup1"` や `"test"` のような汎用的な用語は避けてください。バージョン、環境、段階をまたいでスナップショットを区別できるよう、スナップショット名を適切に使用してください。

以下のコード例では、すでに `my_collection` という名前の collection が存在していることを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

## スナップショットの一覧表示\{#list-snapshots}

既存のスナップショットの名前を一覧表示できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# List all snapshots for a collection
snapshots = client.list_snapshots(
    collection_name="my_collection"
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
// List snapshots for collection
listOpt := milvusclient.NewListSnapshotsOption().
    WithCollectionName("my_collection")

snapshots, err := client.ListSnapshots(context.Background(), listOpt)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
```

</TabItem>

<TabItem value='bash'>

```bash
# bash
```

</TabItem>
</Tabs>

## スナップショットの詳細表示\{#describe-snapshot}

特定のスナップショットに関する詳細情報を取得できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='go'>

```go
describeOpt := milvusclient.NewDescribeSnapshotOption("backup_20240101")
resp, err := client.DescribeSnapshot(context.Background(), describeOpt)

fmt.Printf("Snapshot ID: %d\n", resp.GetSnapshotInfo().GetId())
fmt.Printf("Collection: %s\n", resp.GetSnapshotInfo().GetCollectionName())
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

## スナップショットデータの pin/unpin\{#pinunpin-snapshot-data}

復元中は、スナップショットを pin して、その基盤となるデータをガベージコレクションから一時的に保護し、unpin してデータを解放できます。

また、pin 操作に対して有効期限（TTL）を設定することもでき、その期間が切れると pin されたデータは解放されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
pin_id = client.pin_snapshot_data(
    snapshot_name="backup_20240101",
    collection_name="my_collection",
    ttl_seconds=3600,
)

client.unpin_snapshot_data(
    pin_id=pin_id
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

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

## スナップショットの復元\{#restore-snapshot}

スナップショットを新しい collection に復元できます。この操作は非同期で実行され、復元の進行状況を追跡するためのジョブ ID が返されます。

復元ではデータ import の代わりに **copy-segment** メカニズムを使用します。これは、以下の理由によりより効率的です。

- スナップショットストレージから segment ファイル（binlogs、deltalogs、index ファイル）を直接コピーする

- 既存のデータファイルとの互換性を確保するため、field ID と index ID を保持する

- データの再書き込みや index の再構築を回避し、復元時間を大幅に短縮する、および

- 従来のバックアップおよび復元方法と比較して、10 倍から 100 倍の性能向上を実現する

スナップショットを復元するには、以下の手順を実行します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Restore snapshot to new collection
job_id = client.restore_snapshot(
    snapshot_name="backup_20240101",
    collection_name="restored_collection",
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
restoreOpt := milvusclient.NewRestoreSnapshotOption(
    "backup_20240101", 
    "restored_collection"
)

jobID, err := client.RestoreSnapshot(context.Background(), restoreOpt)
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

復元ジョブの進行状況の監視に関する詳細については、「Monitor restoration progress」を参照してください。

## スナップショットの削除\{#drop-snapshot}

不要になったスナップショットは削除できます。ストレージを節約するため、古いスナップショットは定期的に削除することを推奨します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_snapshot(
    snapshot_name="backup_20240101"
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
dropOpt := milvusclient.NewDropSnapshotOption("backup_20240101")
err := client.DropSnapshot(context.Background(), dropOpt)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

## 復元ジョブの一覧表示\{#list-restoration-jobs}

この API を使用して、対象の collection に対してすでに作成されたスナップショットの一覧を取得できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# List all restore jobs
jobs = client.list_restore_snapshot_jobs()

for job in jobs:
    print(f"Job {job.job_id}: {job.snapshot_name} -> Collection {job.collection_id}")
    print(f"  State: {job.state}, Progress: {job.progress}%")

# List restore jobs for a specific collection
jobs = client.list_restore_snapshot_jobs(collection_name="my_collection")
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='go'>

```go
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

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

## 復元状態の取得\{#get-restoration-state}

復元ジョブ ID を取得したら、それを使用して復元の進行状況を取得できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='go'>

```go
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

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>
