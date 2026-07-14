---
title: "Alias | Go | v2"
slug: /go/go/v2-Collection-Alias
sidebar_label: "Alias"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "関連付けられたデータベース名とコレクション名を持つコレクションエイリアスを表します。 | Go | v2"
type: docx
token: GwIxdz90jojeBNx965VcTJHnnFd
sidebar_position: 2
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - Alias
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Alias

関連付けられたデータベース名とコレクション名を持つコレクションエイリアスを表します。

```go
type Alias struct {
    DbName string
    Alias string
    CollectionName string
}
```

**FIELDS:**

- **DbName** (*string*)

    関連付けられたデータベースの名前。

- **Alias** (*string*)

    エイリアス名。

- **CollectionName** (*string*)

    関連付けられたコレクションの名前。
