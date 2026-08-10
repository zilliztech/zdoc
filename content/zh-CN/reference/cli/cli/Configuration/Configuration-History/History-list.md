---
title: "list | Cloud"
slug: /cli/cli/History-list
sidebar_label: "list"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出本地历史记录日志中记录的最近命令，并按最新优先排序。每条记录都包含时间戳、命令行、命令类型和成功标志。 | Cloud"
type: docx
token: JsXAdb04GodEnVxihb5csm28nze
sidebar_position: 2
keywords: 
  - 分层可导航小世界
  - 稠密嵌入
  - Faiss 向量 Database
  - Chroma 向量 Database
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

此操作会列出本地历史记录日志中记录的最近命令，并按最新优先排序。每条记录都包含时间戳、命令行、命令类型和成功标志。

## 概要\{#synopsis}

```bash
zilliz history list
[--limit <integer>]
[--all]
```

## 选项\{#options}

- **--limit** (*integer*) -

    指示要显示的最大条目数。默认值：50。当设置 `--all` 时将忽略此选项。

- **--all** (*boolean*) -

    显示所有已记录的条目，而不是仅显示最近的 `--limit` 条。

## 示例\{#example}

```bash
# Last 50 entries
zilliz history list

# Last 10 entries as JSON
zilliz history list --limit 10 -o json

# Full history
zilliz history list --all
```
