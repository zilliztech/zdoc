---
title: "NewBloomFilterBlob | Go | v2"
slug: /go/go/v2-FileResources-NewBloomFilterBlob
sidebar_label: "NewBloomFilterBlob"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、対象の偽陽性率で、メンバーシップセットからシリアル化された安定した Bloom フィルターブロブを構築します。大きなメンバーシップセットがプロキシの gRPC 受信制限を通過できるようにサイズが調整されます。 | Go | v2"
type: docx
token: VTwWd4echo5yvmx4QhscJOvendh
sidebar_position: 4
keywords: 
  - スパースと密
  - 密ベクトル
  - Hierarchical Navigable Small Worlds
  - 密埋め込み
  - zilliz
  - zilliz cloud
  - cloud
  - NewBloomFilterBlob
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewBloomFilterBlob

この操作は、対象の偽陽性率で、メンバーシップセットからシリアル化された安定した Bloom フィルターブロブを構築します。大きなメンバーシップセットがプロキシの gRPC 受信制限を通過できるようにサイズが調整されます。

このブロブは `membership_match(field, {blob}, type=bloom)` フィルター式に渡されます。`members` は、整数フィールドまたは JSON パスに対して `[]int64` を受け入れ、文字列のメンバーセットでは NewRoaringBitmapBlob() を使用します。

```go
func NewBloomFilterBlob(members any, fpr float64) (BloomFilterBlob, error)
```

## リクエスト構文\{#request-syntax}

指定されたメンバーから、指定された偽陽性率で Bloom フィルターブロブを構築します。

```go
NewBloomFilterBlob(members any, fpr float64) (BloomFilterBlob, error)
```

**戻り値の型：**

*(BloomFilterBlob, error)*

**戻り値：**

シリアル化された Bloom フィルターブロブを返します。members がサポートされているメンバーシップセットでない場合は、エラーを返します。

**パラメーター：**

- **blob** (*BloomFilterBlob*) -

    フィルター式から参照される、シリアル化された Bloom フィルターブロブのバイトです。

**エラー処理：**

- **error**

    検証、リクエストの構築、または RPC が失敗します。失敗の詳細については、返されたエラーを確認してください。

## 例\{#example}

NewBloomFilterBlob の使用例を示します。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

blob, err := milvusclient.NewBloomFilterBlob([]int64{1, 2, 3}, 0.01)
if err != nil {
	// handle error
}

fmt.Println(len(blob))
```
