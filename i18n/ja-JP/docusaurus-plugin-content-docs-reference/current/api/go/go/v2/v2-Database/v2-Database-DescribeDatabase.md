---
title: "DescribeDatabase | Go | v2"
slug: /go/go/v2-Database-DescribeDatabase
sidebar_label: "DescribeDatabase"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、プロパティを含むデータベースの詳細情報を返します。 | Go | v2"
type: docx
token: TA9gd2U0moA7oPx2x9Ocsq8dnud
sidebar_position: 4
keywords: 
  - Zilliz
  - Milvus ベクトルデータベース
  - Milvus データベース
  - Milvus ベクトルデータベース
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - DescribeDatabase
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeDatabase

この操作は、プロパティを含むデータベースの詳細情報を返します。

```go
func (c *Client) DescribeDatabase(ctx context.Context, option DescribeDatabaseOption, callOptions ...grpc.CallOption) (*entity.Database, error)
```

## リクエスト構文\{#request-syntax}

DescribeDatabase() のリクエストを作成します。

```go
option := milvusclient.NewDescribeDatabaseOption(dbName)

result, err := client.DescribeDatabase(ctx, option)
```

**PARAMETERS:**

- **dbName** (*string*) -

    **[REQUIRED]**

    データベースの名前。

**BUILDER METHODS:**

- `NewDescribeDatabaseOption(dbName string)`

    DescribeDatabase() のリクエストを作成します。

**RETURN TYPE:**

&ast;*entity.Database, error*

**RETURNS:**

プロパティを含むデータベースの説明を返します。操作に失敗した場合はエラーを返します。

```go
type Database struct {
    Name       string
    Properties map[string]string
}
```

**PARAMETERS:**

- **Name** (*string*) -

    データベースの名前。

- **Properties** (*map[string]string*) -

    データベースのプロパティ。

**ERROR HANDLING:**

- **error**

    操作が失敗した場合です。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

DescribeDatabase() の使用例を示します。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

dbName := `test_db`
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

db, err := cli.DescribeDatabase(ctx, milvusclient.NewDescribeDatabaseOption(dbName))
if err != nil {
	// handle err
}
log.Println(db)
```
