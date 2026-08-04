---
title: "list | Cloud"
slug: /cli/cli/History-list
sidebar_label: "list"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出记录在本地历史日志中的最近命令，按最新优先排序。每条记录包括时间戳、命令行、命令类型和成功标志。 | Cloud"
type: docx
token: JsXAdb04GodEnVxihb5csm28nze
sidebar_position: 2
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
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

此操作列出记录在本地历史日志中的最近命令，按最新优先排序。每条记录包括时间戳、命令行、命令类型和成功标志。

## 概要\{#synopsis}

```bash
zilliz history list
[--limit <integer>]
[--all]
```

## 选项\{#options}

- **--limit** (*integer*) -

    指定要显示的最大条目数。默认值：50。设置了 `--all` 时将忽略此选项。

- **--all** (*boolean*) -

    显示所有已记录的条目，而不是最近的 `--limit` 条目。

## 示例\{#example}

```bash
# Last 50 entries
zilliz history list

# Last 10 entries as JSON
zilliz history list --limit 10 -o json

# Full history
zilliz history list --all
```
