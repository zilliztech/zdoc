---
title: "PrivilegeGroup | Go | v2"
slug: /go/go/v2-Authentication-PrivilegeGroup
sidebar_label: "PrivilegeGroup"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "一緒に付与できる権限の名前付きグループを表します。 | Go | v2"
type: docx
token: IPv6dB9pdoGXeRxdoL4c70pWnmg
sidebar_position: 17
keywords: 
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - PrivilegeGroup
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# PrivilegeGroup

一緒に付与できる権限の名前付きグループを表します。

```go
type PrivilegeGroup struct {
    GroupName string
    Privileges []string
}
```

**FIELDS:**

- **GroupName** (*string*)

    権限グループの名前。

- **Privileges** (*[]string*)

    付与された権限の一覧。
