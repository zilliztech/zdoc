---
title: "Collection | Go | v2"
slug: /go/go/v2-Collection
sidebar_label: "Collection"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "DescribeCollection によって返されるコレクションの説明を表し、スキーマ、シャード、およびプロパティを含みます。 | Go | v2"
type: docx
token: PNwFdxMMdo6rtIxERDHcVFgdnxc
sidebar_position: 6
keywords: 
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - オーディオ検索
  - zilliz
  - zilliz cloud
  - cloud
  - Collection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Collection

DescribeCollection によって返されるコレクションの説明を表し、スキーマ、シャード、およびプロパティを含みます。

```go
type Collection struct {
    ID int64
    Name string
    Schema *Schema
    PhysicalChannels []string
    VirtualChannels []string
    Loaded bool
    ConsistencyLevel ConsistencyLevel
    ShardNum int32
    Properties map[string]string
    UpdateTimestamp uint64
}
```

**FIELDS:**

- **ID** (*int64*)

    コレクション ID

- **Name** (*string*)

    コレクション名

- **[Schema](./v2-Collection-Schema)** (**[Schema](./v2-Collection-Schema)*)

    フィールドスキーマと主キー定義を含むコレクションスキーマ

- **PhysicalChannels** (*[]string*)

    物理チャネル。

- **VirtualChannels** (*[]string*)

    仮想チャネル。

- **Loaded** (*bool*)

    リソースがメモリに読み込まれているかどうか。

- **[ConsistencyLevel](./v2-Collection-ConsistencyLevel)** (*[ConsistencyLevel](./v2-Collection-ConsistencyLevel)*)

    読み取り操作の整合性レベル。

- **ShardNum** (*int32*)

    データ分散のためのシャード数。

- **Properties** (*map[string]string*)

    カスタムのキーと値のプロパティ。

- **UpdateTimestamp** (*uint64*)

    変更検出のための最終更新タイムスタンプ。
