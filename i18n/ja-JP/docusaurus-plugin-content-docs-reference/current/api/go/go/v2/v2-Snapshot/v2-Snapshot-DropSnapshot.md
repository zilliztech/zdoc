---
title: "DropSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-DropSnapshot
sidebar_label: "DropSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はスナップショットを完全に削除します。削除されると、スナップショットデータは復元できません。 | Go | v2"
type: docx
token: YP0vdMHw9oDlrcxjvg0cihgSnJb
sidebar_position: 3
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - DropSnapshot()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropSnapshot()

この操作はスナップショットを完全に削除します。削除されると、スナップショットデータは復元できません。

```go
func (c *Client) DropSnapshot(ctx context.Context, opt DropSnapshotOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := client.NewDropSnapshotOption(snapshotName, collectionName).
    WithDbName(dbName string)

err := client.DropSnapshot(option)
```

**PARAMETERS:**

- **snapshotName** (*string*) - 

    削除するスナップショットの名前。

- **collectionName** (*string*) - 

    スナップショットが属するコレクションの名前。

**BUILDER METHODS:**

- `WithDbName(dbName string)`

    これは、指定されたコレクションが属するデータベースの名前を設定します。

**RETURN TYPE:**

*error*

**RETURNS:**

成功時は nil を返します。スナップショットが存在しない場合、または操作が失敗した場合はエラーを返します。

**EXCEPTIONS:**

- **error**

    失敗の詳細は err != nil を確認してください。

## Example\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal(err)
}

defer cli.Close(ctx)

option := milvusclient.NewDropSnapshotOption("backup_20260401", "my_collection")

err = cli.DropSnapshot(ctx, option)
if err != nil {
	// handle error
}

fmt.Println("Snapshot dropped successfully")
```
