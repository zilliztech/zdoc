---
title: "search | Cloud"
slug: /cli/cli/History-search
sidebar_label: "search"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会筛选命令历史记录，找出命令行中包含给定关键字的条目（不区分大小写的子字符串匹配），并按从新到旧的顺序排序。 | Cloud"
type: docx
token: FVmwd1ishoRaqUxQQNNch019nOf
sidebar_position: 3
keywords: 
  - 混合搜索
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - search
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# search

此操作会筛选命令历史记录，找出命令行中包含给定关键字的条目（不区分大小写的子字符串匹配），并按从新到旧的顺序排序。

## 概要\{#synopsis}

```bash
zilliz history search
--keyword <string>
```

## 选项\{#options}

- **--keyword** (*string*) -

    **[必需]**

    指定搜索词。系统会针对已记录的命令行执行不区分大小写的子字符串匹配。

## 示例\{#example}

```bash
# Find every recorded `cluster create` invocation
zilliz history search --keyword "cluster create"

# Find any command that mentioned a specific cluster ID
zilliz history search --keyword inxx-1234567890ab
```
