---
title: "GetCompactionState() | Go | v2"
slug: /go/go/v2-Management-GetCompactionState
sidebar_label: "GetCompactionState()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は Compaction 操作の現在の状態を返します。 | Go | v2"
type: docx
token: LLYvdMBa6osxRQx90sHcm02Kn2b
sidebar_position: 11
keywords: 
  - ベクトルデータベースチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルデータベースの比較
  - OpenAI ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - GetCompactionState()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetCompactionState()

この操作は Compaction 操作の現在の状態を返します。

```go
func (c *Client) GetCompactionState(ctx context.Context, option GetCompactionStateOption, callOptions ...grpc.CallOption) (entity.CompactionState, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewGetCompactionStateOption(compactionID)

result, err := client.GetCompactionState(ctx, option)
```

**パラメータ:**

- **compactionID** (*int64*)

    Compaction の ID 値です。

**戻り値の型:**

*entity.CompactionState, error*

**戻り値:**

Compaction 操作の現在の状態を返します。操作に失敗した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細については `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

compactID := int64(123)

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

state, err := cli.GetCompactionState(ctx, milvusclient.NewGetCompactionStateOption(compactID))
if err != nil {
	// handle err
}
fmt.Println(state)
```
