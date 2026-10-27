---
title: "管理 Snapshot | Cloud"
slug: /manage-snapshots
sidebar_label: "管理 Snapshot"
beta: ON REQUEST
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

<Admonition type="info" title="说明">

此功能仅限 Dedicated 集群使用。

</Admonition>

## 创建 Snapshot \{#create-snapshot}

创建 Snapshot 前，建议停止向目标 Collection 写入数据，并调用 `flush()`，以避免潜在的数据丢失。

<Admonition type="info" title="说明">

调用 `flush()` 不是强制要求，但强烈建议执行，以避免数据丢失。如果跳过该操作，Snapshot 只会包含已经 flush 的数据。

</Admonition>

为 Snapshot 命名时，请使用清晰、描述性强的名称，例如 `"daily_backup_20240101"` 或 `"v2.1_production_release"`，并避免使用 `"backup1"`、`"test"` 这类泛泛的名称。请合理使用 Snapshot 名称，以区分不同版本、环境和阶段的 Snapshot。

以下代码示例假设你已经有一个名为 `my_collection` 的 Collection。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.FlushReq;
import java.util.Collections;
import io.milvus.v2.service.snapshot.request.CreateSnapshotReq;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

// Recommended: Flush data before creating snapshot to ensure all data is included
client.flush(FlushReq.builder()
        .collectionNames(Collections.singletonList("my_collection"))
        .build());

// Create snapshot for entire collection
client.createSnapshot(CreateSnapshotReq.builder()
        .collectionName("my_collection")
        .snapshotName("backup_20240101")
        .description("Daily backup for January 1st, 2024")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

client, err := milvusclient.New(context.Background(), &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal(err)
}
defer client.Close(context.Background())

// Recommended: Flush data before creating snapshot to ensure all data is included
_, err = client.Flush(context.Background(), milvusclient.NewFlushOption("my_collection"))
if err != nil {
    log.Fatal(err)
}

// Create snapshot
createOpt := milvusclient.NewCreateSnapshotOption("backup_20240101", "my_collection").
    WithDescription("Daily backup for January 1st, 2024")

err = client.CreateSnapshot(context.Background(), createOpt)
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

// Recommended: Flush data before creating snapshot to ensure all data is included
client.flush(
    FlushRequest::builder()
        .collection_names(["my_collection"])
        .build()?,
).await?;

// Create snapshot for entire collection
client.create_snapshot(
    CreateSnapshotRequest::builder()
        .collection_name("my_collection")
        .snapshot_name("backup_20240101")
        .description("Daily backup for January 1st, 2024")
        .build()?,
).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <memory>

auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Recommended: Flush data before creating snapshot to ensure all data is included
status = client->Flush(milvus::FlushRequest().WithCollectionNames({"my_collection"}));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Create snapshot for entire collection
status = client->CreateSnapshot(milvus::CreateSnapshotRequest()
                                    .WithCollectionName("my_collection")
                                    .WithSnapshotName("backup_20240101")
                                    .WithDescription("Daily backup for January 1st, 2024"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN'
});

// Recommended: Flush data before creating snapshot to ensure all data is included
await client.flush({ collection_names: ['my_collection'] });

// Create snapshot for entire collection
await client.createSnapshot({
  collection_name: 'my_collection',
  snapshot_name: 'backup_20240101',
  description: 'Daily backup for January 1st, 2024'
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Snapshot;
using Milvus.Client.V2.Requests.Utility;
using Milvus.Client.V2.Types;

var config = new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    Username = "root",
    Password = "Milvus"
};
using var client = new MilvusClientV2(config);
await client.ConnectAsync();

// Recommended: Flush data before creating snapshot to ensure all data is included
await client.FlushAsync(new FlushReq { CollectionNames = ["my_collection"] });

// Create snapshot for entire collection
await client.CreateSnapshotAsync(new CreateSnapshotReq
{
    CollectionName = "my_collection",
    SnapshotName = "backup_20240101",
    Description = "Daily backup for January 1st, 2024"
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/flush" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  -d '{
    "collectionName": "my_collection"
  }'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/snapshots/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  -d '{
    "collectionName": "my_collection",
    "snapshotName": "backup_20240101",
    "description": "Daily backup for January 1st, 2024"
  }'
```

</TabItem>
</Tabs>

## 列出 Snapshot \{#list-snapshots}

你可以列出现有 Snapshot 的名称。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.service.snapshot.request.ListSnapshotsReq;

// List all snapshots for a collection
client.listSnapshots(ListSnapshotsReq.builder()
        .collectionName("my_collection")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

// List snapshots for collection
listOpt := milvusclient.NewListSnapshotsOption("my_collection")

snapshots, err := client.ListSnapshots(context.Background(), listOpt)
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// List all snapshots for a collection
let snapshots = client.list_snapshots(
    ListSnapshotsRequest::builder()
        .collection_name("my_collection")
        .build()?,
).await?;
println!("{:?}", snapshots);
```

</TabItem>

<TabItem value='c++'>

```c++
// List snapshots for collection
milvus::ListSnapshotsResponse snapshots;
status = client->ListSnapshots(milvus::ListSnapshotsRequest()
                                    .WithCollectionName("my_collection"),
                               snapshots);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
// List all snapshots for a collection
const snapshots = await client.listSnapshots({
  collection_name: 'my_collection'
});
console.log(snapshots);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Snapshot;

// List all snapshots for a collection
ListSnapshotsResp snapshots = await client.ListSnapshotsAsync(new ListSnapshotsReq
{
    CollectionName = "my_collection"
});
foreach (string name in snapshots.Snapshots)
{
    Console.WriteLine(name);
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/snapshots/list" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  -d '{
    "collectionName": "my_collection"
  }'
```

</TabItem>
</Tabs>

## 查看 Snapshot 详情 \{#describe-snapshot}

你可以获取指定 Snapshot 的详细信息。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
snapshot_info = client.describe_snapshot(
    snapshot_name="backup_20240101",
    collection_name="my_collection",
)

print(f"Snapshot name: {snapshot_info.name}")
print(f"Collection: {snapshot_info.collection_name}")
print(f"Created: {snapshot_info.create_ts}")
print(f"Description: {snapshot_info.description}")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.snapshot.request.DescribeSnapshotReq;

// Describe a snapshot
client.describeSnapshot(DescribeSnapshotReq.builder()
        .collectionName("my_collection")
        .snapshotName("backup_20240101")
        .build());
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

describeOpt := milvusclient.NewDescribeSnapshotOption("backup_20240101", "my_collection")

resp, err := client.DescribeSnapshot(context.Background(), describeOpt)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Snapshot ID: %s\n", resp.GetName())
fmt.Printf("Collection: %s\n", resp.GetCollectionName())
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// Describe a snapshot
let snapshot_info = client.describe_snapshot(
    DescribeSnapshotRequest::builder()
        .collection_name("my_collection")
        .snapshot_name("backup_20240101")
        .build()?,
).await?;
println!("{:?}", snapshot_info);
```

</TabItem>

<TabItem value='c++'>

```c++
// Describe a snapshot
milvus::DescribeSnapshotResponse snapshot_info;
status = client->DescribeSnapshot(milvus::DescribeSnapshotRequest()
                                      .WithCollectionName("my_collection")
                                      .WithSnapshotName("backup_20240101"),
                                  snapshot_info);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
// Describe a snapshot
const snapshot_info = await client.describeSnapshot({
  collection_name: 'my_collection',
  snapshot_name: 'backup_20240101'
});
console.log(snapshot_info);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Snapshot;

// Describe a snapshot
DescribeSnapshotResp snapshotInfo = await client.DescribeSnapshotAsync(new DescribeSnapshotReq
{
    CollectionName = "my_collection",
    SnapshotName = "backup_20240101"
});
Console.WriteLine($"Snapshot name: {snapshotInfo.Name}");
Console.WriteLine($"Collection: {snapshotInfo.CollectionName}");
Console.WriteLine($"Created: {snapshotInfo.CreateTs}");
Console.WriteLine($"Description: {snapshotInfo.Description}");
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/snapshots/describe" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  -d '{
    "collectionName": "my_collection",
    "snapshotName": "backup_20240101"
  }'
```

</TabItem>
</Tabs>

## Pin/unpin Snapshot 数据 \{#pin-unpin-snapshot-data}

恢复期间，你可以 pin 一个 Snapshot，以临时保护其底层数据不被垃圾回收；也可以 unpin 该 Snapshot，以释放这些数据。

你还可以为 pin 操作设置生存时间（TTL），使被 pin 的数据在 TTL 到期后自动释放。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.service.snapshot.request.PinSnapshotDataReq;
import io.milvus.v2.service.snapshot.request.UnpinSnapshotDataReq;

Long pinId = client.pinSnapshotData(PinSnapshotDataReq.builder()
        .collectionName("my_collection")
        .snapshotName("backup_20240101")
        .ttlSeconds(3600L)
        .build()).getPinId();

client.unpinSnapshotData(UnpinSnapshotDataReq.builder()
        .pinId(pinId)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

pinID, err := client.PinSnapshotData(
    context.Background(),
    milvusclient.NewPinSnapshotDataOption("backup_20240101", "my_collection").WithTTL(3600),
)
if err != nil {
    log.Fatal(err)
}

defer func() {
    _ = client.UnpinSnapshotData(context.Background(), milvusclient.NewUnpinSnapshotDataOption(pinID))
}()

// do work with pinned snapshot data
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// Pin snapshot data
let pin_id = client.pin_snapshot_data(
    PinSnapshotDataRequest::builder()
        .collection_name("my_collection")
        .snapshot_name("backup_20240101")
        .ttl_seconds(3600)
        .build()?,
).await?.pin_id();

// Unpin snapshot data
client.unpin_snapshot_data(
    UnpinSnapshotDataRequest::builder()
        .pin_id(pin_id)
        .build()?,
).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
// Pin snapshot data
milvus::PinSnapshotDataResponse pin_resp;
status = client->PinSnapshotData(milvus::PinSnapshotDataRequest()
                                     .WithCollectionName("my_collection")
                                     .WithSnapshotName("backup_20240101")
                                     .WithTtlSeconds(3600),
                                 pin_resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Unpin snapshot data
status = client->UnpinSnapshotData(milvus::UnpinSnapshotDataRequest()
                                        .WithPinID(pin_resp.PinID()));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
// Pin snapshot data
const pin_resp = await client.pinSnapshotData({
  collection_name: 'my_collection',
  snapshot_name: 'backup_20240101',
  ttl_seconds: 3600
});

// Unpin snapshot data
await client.unpinSnapshotData({
  pin_id: pin_resp.pin_id
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Snapshot;

// Pin snapshot data
long pinId = (await client.PinSnapshotDataAsync(new PinSnapshotDataReq
{
    CollectionName = "my_collection",
    SnapshotName = "backup_20240101",
    TtlSeconds = 3600
})).PinId;

// Unpin snapshot data
await client.UnpinSnapshotDataAsync(new UnpinSnapshotDataReq
{
    PinId = pinId
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/snapshots/pin" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  -d '{
    "collectionName": "my_collection",
    "snapshotName": "backup_20240101",
    "ttlSeconds": 3600
  }'
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

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Restore snapshot to new collection
job_id = client.restore_snapshot(
    snapshot_name="backup_20240101",
    source_collection_name="my_collection",
    target_collection_name="restored_collection",
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.snapshot.request.RestoreSnapshotReq;

// Restore snapshot to new collection
client.restoreSnapshot(RestoreSnapshotReq.builder()
        .sourceCollectionName("my_collection")
        .targetCollectionName("restored_collection")
        .snapshotName("backup_20240101")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

restoreOpt := milvusclient.NewRestoreSnapshotOption(
    "backup_20240101",
    "my_collection",
    "restored_collection",
)

jobID, err := client.RestoreSnapshot(context.Background(), restoreOpt)
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// Restore snapshot to new collection
let job_id = client.restore_snapshot(
    RestoreSnapshotRequest::builder()
        .snapshot_name("backup_20240101")
        .source_collection_name("my_collection")
        .target_collection_name("restored_collection")
        .build()?,
).await?.job_id();
println!("job id: {}", job_id);
```

</TabItem>

<TabItem value='c++'>

```c++
// Restore snapshot to new collection
milvus::RestoreSnapshotResponse restore_resp;
status = client->RestoreSnapshot(milvus::RestoreSnapshotRequest()
                                      .WithSourceCollectionName("my_collection")
                                      .WithSnapshotName("backup_20240101")
                                      .WithTargetCollectionName("restored_collection"),
                                  restore_resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
// Restore snapshot to new collection
const restore_resp = await client.restoreSnapshot({
  source_collection_name: 'my_collection',
  target_collection_name: 'restored_collection',
  snapshot_name: 'backup_20240101'
});
console.log(restore_resp);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Snapshot;

// Restore snapshot to new collection
long jobId = (await client.RestoreSnapshotAsync(new RestoreSnapshotReq
{
    SnapshotName = "backup_20240101",
    SourceCollectionName = "my_collection",
    TargetCollectionName = "restored_collection"
})).JobId;
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/snapshots/restore" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  -d '{
    "sourceCollectionName": "my_collection",
    "targetCollectionName": "restored_collection",
    "snapshotName": "backup_20240101"
  }'
```

</TabItem>
</Tabs>

有关如何监控恢复任务进度的详细信息，请参阅 [获取恢复状态](./manage-snapshots#get-restoration-state)。

## 删除 Snapshot \{#drop-snapshot}

如果不再需要某个 Snapshot，你可以将其删除。建议定期删除旧 Snapshot，以节省存储空间。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_snapshot(
    snapshot_name="backup_20240101",
    collection_name="my_collection"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.snapshot.request.DropSnapshotReq;

client.dropSnapshot(DropSnapshotReq.builder()
        .collectionName("my_collection")
        .snapshotName("backup_20240101")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

dropOpt := milvusclient.NewDropSnapshotOption("backup_20240101", "my_collection")

err := client.DropSnapshot(context.Background(), dropOpt)
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client.drop_snapshot(
    DropSnapshotRequest::builder()
        .collection_name("my_collection")
        .snapshot_name("backup_20240101")
        .build()?,
).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->DropSnapshot(milvus::DropSnapshotRequest()
                                     .WithCollectionName("my_collection")
                                     .WithSnapshotName("backup_20240101"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
await client.dropSnapshot({
  collection_name: 'my_collection',
  snapshot_name: 'backup_20240101'
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Snapshot;

await client.DropSnapshotAsync(new DropSnapshotReq
{
    CollectionName = "my_collection",
    SnapshotName = "backup_20240101"
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/snapshots/drop" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  -d '{
    "collectionName": "my_collection",
    "snapshotName": "backup_20240101"
  }'
```

</TabItem>
</Tabs>

## 列出恢复任务 \{#list-restoration-jobs}

你可以使用该 API 获取目标 Collection 已创建的 Snapshot 列表。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# List all restore jobs
jobs = client.list_restore_snapshot_jobs()

for job in jobs:
    print(f"Job {job.job_id}: {job.snapshot_name} -> Collection {job.collection_name}")
    print(f"  State: {job.state}, Progress: {job.progress}%")

# List restore jobs for a specific collection
jobs = client.list_restore_snapshot_jobs(collection_name="my_collection")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.snapshot.request.ListRestoreSnapshotJobsReq;

// List all restore jobs
client.listRestoreSnapshotJobs(ListRestoreSnapshotJobsReq.builder()
        .collectionName("my_collection")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
for _, job := range jobs {
    fmt.Printf("Job %d: %s -> Collection %s\n",
        job.GetJobId(), job.GetSnapshotName(), job.GetCollectionName())
    fmt.Printf("  State: %s, Progress: %d%%\n",
        job.GetState().String(), job.GetProgress())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// List all restore jobs
let jobs = client.list_restore_snapshot_jobs(
    ListRestoreSnapshotJobsRequest::builder()
        .collection_name("my_collection")
        .build()?,
).await?;
for job in jobs.jobs() {
    println!("Job {}: {} -> Collection {}", job.get_job_id(), job.get_snapshot_name(), job.get_collection_name());
    println!("  State: {:?}, Progress: {}%", job.get_state(), job.get_progress());
}
```

</TabItem>

<TabItem value='c++'>

```c++
// List all restore jobs
milvus::ListRestoreSnapshotJobsResponse jobs;
status = client->ListRestoreSnapshotJobs(milvus::ListRestoreSnapshotJobsRequest()
                                             .WithCollectionName("my_collection"),
                                         jobs);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
// List all restore jobs
const jobs = await client.listRestoreSnapshotJobs({
  collection_name: 'my_collection'
});
console.log(jobs);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Snapshot;

// List all restore jobs
ListRestoreSnapshotJobsResp jobs = await client.ListRestoreSnapshotJobsAsync(new ListRestoreSnapshotJobsReq
{
    CollectionName = "my_collection"
});
foreach (RestoreSnapshotJobInfo job in jobs.Jobs)
{
    Console.WriteLine($"Job {job.JobId}: {job.SnapshotName} -> Collection {job.CollectionName}");
    Console.WriteLine($"  State: {job.State}, Progress: {job.Progress}%");
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/jobs/snapshot/list" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  -d '{
    "collectionName": "my_collection"
  }'
```

</TabItem>
</Tabs>

## 获取恢复状态 \{#get-restoration-state}

获得恢复任务 ID 后，你可以使用该 ID 查询恢复进度。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
state = client.get_restore_snapshot_state(job_id=12345)

print(f"Job ID: {state.job_id}")
print(f"Snapshot Name: {state.snapshot_name}")
print(f"Collection: {state.collection_name}")
print(f"State: {state.state}")
print(f"Progress: {state.progress}%")
if state.state == "RestoreSnapshotFailed":
    print(f"Failure Reason: {state.reason}")
print(f"Time Cost: {state.time_cost}ms")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.snapshot.request.GetRestoreSnapshotStateReq;

// Get restoration state
client.getRestoreSnapshotState(GetRestoreSnapshotStateReq.builder()
        .jobId(12345L)
        .build());
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

stateOpt := milvusclient.NewGetRestoreSnapshotStateOption(12345)

state, err := client.GetRestoreSnapshotState(context.Background(), stateOpt)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Job ID: %d\n", state.GetJobId())
fmt.Printf("Snapshot Name: %s\n", state.GetSnapshotName())
fmt.Printf("Collection: %s\n", state.GetCollectionName())
fmt.Printf("State: %s\n", state.GetState().String())
fmt.Printf("Progress: %d%%\n", state.GetProgress())
fmt.Printf("Time Cost: %dms\n", state.GetTimeCost())
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// Get restoration state
let state = client.get_restore_snapshot_state(
    GetRestoreSnapshotStateRequest::builder()
        .job_id(12345)
        .build()?,
).await?;
println!("Job ID: {}", state.job_info().get_job_id());
println!("Snapshot Name: {}", state.job_info().get_snapshot_name());
println!("State: {:?}", state.job_info().get_state());
println!("Progress: {}%", state.job_info().get_progress());
```

</TabItem>

<TabItem value='c++'>

```c++
// Get restoration state
milvus::GetRestoreSnapshotStateResponse state;
status = client->GetRestoreSnapshotState(milvus::GetRestoreSnapshotStateRequest()
                                              .WithJobID(12345),
                                          state);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
// Get restoration state
const state = await client.getRestoreSnapshotState({
  job_id: 12345
});
console.log(state);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Snapshot;

// Get restoration state
GetRestoreSnapshotStateResp state = await client.GetRestoreSnapshotStateAsync(new GetRestoreSnapshotStateReq
{
    JobId = 12345
});
RestoreSnapshotJobInfo jobInfo = state.JobInfo;
Console.WriteLine($"Job ID: {jobInfo.JobId}");
Console.WriteLine($"Snapshot Name: {jobInfo.SnapshotName}");
Console.WriteLine($"Collection: {jobInfo.CollectionName}");
Console.WriteLine($"State: {jobInfo.State}");
Console.WriteLine($"Progress: {jobInfo.Progress}%");
Console.WriteLine($"Time Cost: {jobInfo.TimeCost}ms");
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/jobs/snapshot/describe" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  -d '{
    "jobId": "12345"
  }'
```

</TabItem>
</Tabs>