---
title: "DropDatabaseProperties | Go | v2"
slug: /go/go/v2-Database-DropDatabaseProperties
sidebar_label: "DropDatabaseProperties"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、データベースから指定されたプロパティを削除します。 | Go | v2"
type: docx
token: RDOmdzzj2o4a6XxHcNZcmR2fnVh
sidebar_position: 6
keywords: 
  - マルチモーダル RAG
  - LLM ハルシネーション
  - ハイブリッド検索
  - レキシカル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - DropDatabaseProperties
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DropDatabaseProperties

この操作は、データベースから指定されたプロパティを削除します。

```go
func (c *Client) DropDatabaseProperties(ctx context.Context, option DropDatabasePropertiesOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

DropDatabaseProperties() のリクエストを作成します。

```go
option := milvusclient.NewDropDatabasePropertiesOption(dbName, propertyKeys)

err := client.DropDatabaseProperties(ctx, option)
```

**パラメーター:**

- **dbName** (*string*) -

    **[REQUIRED]**

    データベースの名前です。

- **propertyKeys** (*...string*) -

    **[REQUIRED]**

    プロパティキーです。

**ビルダーメソッド:**

- `NewDropDatabasePropertiesOption(dbName string, propertyKeys ...string)`

    DropDatabaseProperties() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示す error を返します。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

DropDatabaseProperties() の使用例を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
	"github.com/milvus-io/milvus/pkg/v2/common"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle err
}
defer cli.Close(ctx)

err = cli.DropDatabaseProperties(ctx, milvusclient.NewDropDatabasePropertiesOption("my_database", common.DatabaseReplicaNumber))
if err != nil {
	// handle err
}
```
