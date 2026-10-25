---
title: "NewRoaringBitmapBlob | Go | v2"
slug: /go/go/v2-FileResources-NewRoaringBitmapBlob
sidebar_label: "NewRoaringBitmapBlob"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、メンバーシップセットからシリアル化された roaring bitmap blob を構築します。この blob は、`membershipmatch(field, {blob}, type=roaring)` フィルター式に渡されます。 | Go | v2"
type: docx
token: O8dIdQuMyofLmVxGXYScUSK0nOe
sidebar_position: 5
keywords: 
  - Serverless ベクトルデータベース
  - Milvus オープンソース
  - Milvus の仕組み
  - Zilliz ベクトルデータベース
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - NewRoaringBitmapBlob
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewRoaringBitmapBlob

この操作は、メンバーシップセットからシリアル化された roaring bitmap blob を構築します。この blob は、`membership_match(field, {blob}, type=roaring)` フィルター式に渡されます。

```go
func NewRoaringBitmapBlob(members any) (RoaringBitmapBlob, error)
```

## リクエスト構文\{#request-syntax}

指定されたメンバーから roaring bitmap blob を構築します。

```go
NewRoaringBitmapBlob(members any) (RoaringBitmapBlob, error)
```

**戻り値の型:**

*(RoaringBitmapBlob, error)*

**戻り値:**

シリアル化された roaring bitmap blob を返します。members がサポートされているメンバーシップセットでない場合は、エラーを返します。

**パラメーター:**

- **blob** (*RoaringBitmapBlob*) -

    フィルター式から参照される、シリアル化された roaring bitmap blob のバイトです。

**エラーハンドリング:**

- **error**

    検証、リクエストの構築、または RPC が失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

NewRoaringBitmapBlob の使用方法を示します。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

blob, err := milvusclient.NewRoaringBitmapBlob([]string{"user-a", "user-b"})
if err != nil {
	// handle error
}

fmt.Println(len(blob))
```
