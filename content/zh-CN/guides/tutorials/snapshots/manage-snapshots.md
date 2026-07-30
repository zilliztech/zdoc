---
title: "管理 Snapshot | Cloud"
slug: /manage-snapshots
sidebar_label: "管理 Snapshot"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本指南介绍如何创建和管理 Snapshot，包括： | Cloud"
type: origin
token: Xq0owDgEpiD2aDkfYBGcxt1ZnNe
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 管理 Snapshot

本指南介绍如何创建和管理 Snapshot，包括：

- [创建 Snapshot](./manage-snapshots#create-snapshot),

- [列出 Snapshot](./manage-snapshots#list-snapshots),

- [查看 Snapshot 详情](./manage-snapshots#describe-snapshot),

- [Pin/unpin Snapshot](./manage-snapshots#pin-unpin-snapshot-data),

- [恢复 Snapshot](./manage-snapshots#restore-snapshot),

- [删除 Snapshot](./manage-snapshots#drop-snapshot),

- [列出恢复任务](./manage-snapshots#list-restoration-jobs)，以及

- [获取恢复状态](./manage-snapshots#get-restoration-state)。

## 创建 Snapshot \{#create-snapshot}

创建 Snapshot 前，建议停止向目标 Collection 写入数据，并调用 `flush()`，以避免潜在的数据丢失。

<Admonition type="info" icon="📘" title="说明">

调用 `flush()` 不是强制要求，但强烈建议执行，以避免数据丢失。如果跳过该操作，Snapshot 只会包含已经 flush 的数据。

</Admonition>

为 Snapshot 命名时，请使用清晰、描述性强的名称，例如 `"daily_backup_20240101"` 或 `"v2.1_production_release"`，并避免使用 `"backup1"`、`"test"` 这类泛泛的名称。请合理使用 Snapshot 名称，以区分不同版本、环境和阶段的 Snapshot。

以下代码示例假设你已经有一个名为 `my_collection` 的 Collection。

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

## 列出 Snapshot \{#list-snapshots}

你可以列出现有 Snapshot 的名称。

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

## 查看 Snapshot 详情 \{#describe-snapshot}

你可以获取指定 Snapshot 的详细信息。

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

## Pin/unpin Snapshot 数据 \{#pin-unpin-snapshot-data}

恢复期间，你可以 pin 一个 Snapshot，以临时保护其底层数据不被垃圾回收；也可以 unpin 该 Snapshot，以释放这些数据。

你还可以为 pin 操作设置生存时间（TTL），使被 pin 的数据在 TTL 到期后自动释放。

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

## 恢复 Snapshot \{#restore-snapshot}

你可以将 Snapshot 恢复到一个新的 Collection。该操作是异步的，并会返回一个任务 ID，用于跟踪恢复进度。

恢复过程使用 **copy-segment** 机制，而不是数据导入，因此效率更高，原因如下：

- 直接从 Snapshot 存储中复制 Segment 文件（binlogs、deltalogs、Index 文件）

- 保留 Field ID 和 Index ID，以确保与现有数据文件兼容

- 避免数据重写和 Index 重建，从而显著缩短恢复时间

- 相比传统 Backup 和 Restore 方法，性能提升 10 到 100 倍

如需恢复 Snapshot，请执行以下操作：

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

有关如何监控恢复任务进度的详细信息，请参阅 [获取恢复状态](./manage-snapshots#get-restoration-state)。

## 删除 Snapshot \{#drop-snapshot}

如果不再需要某个 Snapshot，你可以将其删除。建议定期删除旧 Snapshot，以节省存储空间。

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

## 列出恢复任务 \{#list-restoration-jobs}

你可以使用该 API 获取目标 Collection 已创建的 Snapshot 列表。

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

## 获取恢复状态 \{#get-restoration-state}

获得恢复任务 ID 后，你可以使用该 ID 查询恢复进度。

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