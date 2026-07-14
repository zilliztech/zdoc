---
title: "DescribeSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-DescribeSnapshot
sidebar_label: "DescribeSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ソース collection、partition 名、作成タイムスタンプ、保存場所など、特定のスナップショットに関する詳細なメタデータを取得します。 | Go | v2"
type: docx
token: NM44dNuQtoKR9UxlEbqcZrVUnpb
sidebar_position: 2
keywords: 
  - 自然言語検索
  - 類似検索
  - マルチモーダルRAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - クラウド
  - DescribeSnapshot()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeSnapshot()

この操作は、ソース collection、partition 名、作成タイムスタンプ、保存場所など、特定のスナップショットに関する詳細なメタデータを取得します。

```go
func (c *Client) DescribeSnapshot(ctx context.Context, opt DescribeSnapshotOption, callOptions ...grpc.CallOption) (*milvuspb.DescribeSnapshotResponse, error)
```

## リクエスト構文\{#request-syntax}

```go
option := client.NewDescribeSnapshotOption(snapshotName, collectionName).
    WithDbName(dbName string)

result, err := client.DescribeSnapshot(option)
```

**パラメータ:**

- **snapshotName** (*string*) - 

    説明対象のスナップショット名。

- **collectionName** (*string*) - 

    スナップショットが属する collection の名前。

**ビルダーメソッド:**

- `WithDbName(dbName string)`

    指定した collection が属するデータベースを設定します。

**戻り値の型:**

*milvuspb.DescribeSnapshotResponse, error*

**戻り値:**

詳細なスナップショットメタデータを含む DescribeSnapshotResponse オブジェクト。

```go
type DescribeSnapshotResponse struct {
    Name           string
    Description    string
    CollectionName string
    CreateTs       int64
    S3Location     string
    PartitionNames []string
}
```

**ビルダーメソッド:**

- **Name** (*string*) -

    スナップショット名。

- **Description** (*string*) -

    スナップショットの説明。

- **CollectionName** (*string*) -

    ソース collection 名。

- **CreateTs** (*int64*) -

    ミリ秒単位の作成タイムスタンプ。

- **S3Location** (*string*) -

    スナップショットデータの S3 保存場所。

- **PartitionNames** (*[]string*) -

    スナップショットに含まれる partition 名のリスト。

**例外:**

- **error**

    失敗の詳細は err != nil を確認してください。

## 例\{#example}

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

option := milvusclient.NewDescribeSnapshotOption("backup_20260418", "my_collection")

resp, err := cli.DescribeSnapshot(ctx, option)
if err != nil {
	// handle error
}

fmt.Println(resp.GetName())
fmt.Println(resp.GetCollectionName())
fmt.Println(resp.GetPartitionNames())
fmt.Println(resp.GetCreateTs())
fmt.Println(resp.GetS3Location())
```
