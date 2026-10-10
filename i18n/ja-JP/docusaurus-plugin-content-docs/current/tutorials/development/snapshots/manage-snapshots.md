---
title: "スナップショットの管理 | Cloud"
slug: /manage-snapshots
sidebar_label: "スナップショットの管理"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、スナップショットの作成と管理の方法について説明します。以下を含みます | Cloud"
type: origin
token: J0jDwYQb8il1biknRo4cazHPn5d
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スナップショットの管理

このガイドでは、スナップショットの作成と管理の方法について説明します。以下を含みます。

- [スナップショットを作成する](./manage-snapshots#create-snapshot),

- [スナップショットを一覧表示する](./manage-snapshots#list-snapshots),

- [スナップショットの詳細を取得する](./manage-snapshots#describe-snapshot),

- [Pin/unpin スナップショット](./manage-snapshots#pinunpin-snapshot-data),

- [スナップショットをリストアする](./manage-snapshots#restore-snapshot),

- [スナップショットをドロップする](./manage-snapshots#drop-snapshot),

- [リストアジョブを一覧表示する](./manage-snapshots#list-restoration-jobs), および

- [リストア状態を取得する](./manage-snapshots#get-restoration-state).

## スナップショットを作成する\{#create-snapshot}

スナップショットを作成する前に、データ損失の可能性を回避するため、対象コレクションへのデータの書き込みを停止して `flush()` を呼び出すことをお勧めします。

`flush()` の呼び出しは必須ではありませんが、データ損失を回避するために強く推奨されます。これを省略した場合、スナップショットにはすでにフラッシュされたデータのみが含まれます。

スナップショットに名前を付けるときは、`"daily_backup_20240101"` や `"v2.1_production_release"` のような明確で説明的な名前を使用し、`"backup1"` や `"test"` のような一般的な用語は避けてください。バージョン、環境、ステージをまたいでスナップショットを区別できるよう、スナップショット名を賢く使用してください。

以下に示すコード例では、`my_collection` という名前のコレクションがすでに存在することを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

#[tokio::main]
async fn main() -> Result<()> {
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
    Ok(())
}
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

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/flush" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  -d '{
    "collectionNames": ["my_collection"]
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

## スナップショットを一覧表示する\{#list-snapshots}

既存のスナップショットの名前を一覧表示できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

## スナップショットの詳細を取得する\{#describe-snapshot}

特定のスナップショットの詳細情報を取得できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
snapshot_info = client.describe_snapshot(
    snapshot_name="backup_20240101",
    collection_name="my_collection",
    include_collection_info=True
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

## Pin/unpin スナップショットデータ\{#pinunpin-snapshot-data}

リストア中にスナップショットをピン留めすると、基になるデータをガベージコレクションから一時的に保護でき、ピン留めを解除するとデータが解放されます。

また、ピン操作に time-to-live（TTL）の期間を設定すると、期間の満了時にピン留めされたデータが解放されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

## スナップショットをリストアする\{#restore-snapshot}

スナップショットを新しいコレクションにリストアできます。この操作は非同期で実行され、リストアの進行状況を追跡するためのジョブ ID を返します。

リストアでは、データインポートではなく **copy-segment** メカニズムが使用され、次の理由からより効率的です。

- スナップショットストレージからセグメントファイル（binlog、deltalog、インデックスファイル）を直接コピーします。

- 既存のデータファイルとの互換性を確保するために、フィールド ID とインデックス ID を保持します。

- データの書き換えとインデックスの再構築を回避し、リストア時間を大幅に短縮します。

- 従来のバックアップおよびリストア方法と比較して、10～100 倍のパフォーマンス向上を実現します。

スナップショットをリストアするには、次のように操作します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

For details on monitoring the progress of a restoration job, refer to Monitor restoration progress.

## スナップショットをドロップする\{#drop-snapshot}

不要になったスナップショットはドロップできます。ストレージを節約するために、古いスナップショットを定期的に削除することをお勧めします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
dropOpt := milvusclient.NewDropSnapshotOption("backup_20240101", "my_collection")

err := client.DropSnapshot(context.Background(), dropOpt)
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
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

## リストアジョブを一覧表示する\{#list-restoration-jobs}

この API を使用すると、対象コレクションに対してすでに作成されたスナップショットの一覧を取得できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
// List all restore jobs
listOpt := milvusclient.NewListRestoreSnapshotJobsOption()

jobs, err := client.ListRestoreSnapshotJobs(context.Background(), listOpt)
if err != nil {
    log.Fatal(err)
}

for _, job := range jobs {
    fmt.Printf("Job %d: %s -> Collection %d\n",
        job.GetJobId(), job.GetSnapshotName(), job.GetCollectionName())
    fmt.Printf("  State: %s, Progress: %d%%\n",
        job.GetState(), job.GetProgress())
}

// List restore jobs for a specific collection
listOpt = milvusclient.NewListRestoreSnapshotJobsOption().
    WithCollectionName("my_collection")
jobs, err = client.ListRestoreSnapshotJobs(context.Background(), listOpt)
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
// List all restore jobs
let jobs = client.list_restore_snapshot_jobs(
    ListRestoreSnapshotJobsRequest::builder()
        .collection_name("my_collection")
        .build()?,
).await?;
for job in &jobs {
    println!("Job {}: {} -> Collection {}", job.job_id(), job.snapshot_name(), job.collection_name());
    println!("  State: {}, Progress: {}%", job.state(), job.progress());
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

## リストア状態を取得する\{#get-restoration-state}

リストアジョブ ID を取得したら、それを使用してリストアの進行状況を取得できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
// Get restoration state
let state = client.get_restore_snapshot_state(
    GetRestoreSnapshotStateRequest::builder()
        .job_id(12345)
        .build()?,
).await?;
println!("Job ID: {}", state.job_id());
println!("Snapshot Name: {}", state.snapshot_name());
println!("State: {:?}", state.state());
println!("Progress: {}%", state.progress());
```

</TabItem>

<TabItem value='c++'>

```c++
// Get restoration state
milvus::GetRestoreSnapshotStateResponse state;
status = client->GetRestoreSnapshotState(milvus::GetRestoreSnapshotStateRequest()
                                              .WithJobId(12345),
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

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/jobs/snapshot/describe" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  -d '{
    "jobId": 12345
  }'
```

</TabItem>
</Tabs>
