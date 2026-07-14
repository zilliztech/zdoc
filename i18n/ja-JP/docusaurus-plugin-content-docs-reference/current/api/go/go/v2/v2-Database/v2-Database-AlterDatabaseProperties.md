---
title: "AlterDatabaseProperties() | Go | v2"
slug: /go/go/v2-Database-AlterDatabaseProperties
sidebar_label: "AlterDatabaseProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は既存のデータベースのプロパティを変更します。 | Go | v2"
type: docx
token: TxGQdsN2noPbRixebWycWSe0nYt
sidebar_position: 1
keywords: 
  - セマンティック検索
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - zilliz
  - zilliz cloud
  - クラウド
  - AlterDatabaseProperties()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterDatabaseProperties()

この操作は既存のデータベースのプロパティを変更します。

```go
func (c *Client) AlterDatabaseProperties(ctx context.Context, option AlterDatabasePropertiesOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewAlterDatabasePropertiesOption(dbName).
    WithProperty(key, value)

err := client.AlterDatabaseProperties(ctx, option)
```

**パラメータ:**

- **dbName** (*string*)

    データベースの名前。

**オプションメソッド:**

- `WithProperty(key string, value any)`

    リソースにカスタムプロパティのキーと値のペアを設定します。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil、失敗した場合は問題の内容を示す error を返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

err = cli.AlterDatabaseProperties(ctx, milvusclient.NewAlterDatabasePropertiesOption("my_database").
	WithProperty(common.DatabaseReplicaNumber, 2))
if err != nil {
	// handle err
}
```
