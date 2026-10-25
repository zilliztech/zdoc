---
title: "インデックス | Go | v2"
slug: /go/go/v2-Management-Index
sidebar_label: "インデックス"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "インデックス設定のインターフェースです。インスタンスを作成するには、NewAutoIndex() や NewHNSWIndex() などのコンストラクター関数を使用します。 | Go | v2"
type: docx
token: ERQodkjAzotUQ3xKvA8c6jmLn3e
sidebar_position: 1
keywords: 
  - ベクトル埋め込みとは
  - ベクトルデータベースのチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルデータベースの比較
  - zilliz
  - zilliz cloud
  - クラウド
  - インデックス
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# インデックス

インデックス設定のインターフェースです。インスタンスを作成するには、NewAutoIndex() や NewHNSWIndex() などのコンストラクター関数を使用します。

```go
type Index interface {
    Name() string
    IndexType() IndexType
    Params() map[string]string
}
```

**メソッド:**

- `Name() string`

    インデックス名を返します。

- `IndexType() IndexType`

    インデックスのアルゴリズムタイプを返します。

- `Params() map[string]string`

    インデックスのパラメーターをキーと値のマップとして返します。
