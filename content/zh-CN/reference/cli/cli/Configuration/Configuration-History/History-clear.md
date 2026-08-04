---
title: "clear | Cloud"
slug: /cli/cli/History-clear
sidebar_label: "clear"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会截断本地命令历史文件。脚本在“截断后删除”的过程中会持有独占锁，因此并发的 CLI 调用不会丢失已追加的记录。 | Cloud"
type: docx
token: I7fKd8mPNoKYEAxmKpxcgaH8nsb
sidebar_position: 1
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - clear
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# clear

此操作会截断本地命令历史文件。脚本在“截断后删除”的过程中会持有独占锁，因此并发的 CLI 调用不会丢失已追加的记录。

## 概要\{#synopsis}

```bash
zilliz history clear
[--force]
```

## 选项\{#options}

- **--force** (*boolean*) -

    跳过交互式 `[y/N]` 确认提示。非交互式脚本必须使用此选项。

## 示例\{#example}

```bash
# Interactive (asks for confirmation)
zilliz history clear

# Non-interactive
zilliz history clear --force
```
