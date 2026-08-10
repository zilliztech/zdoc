---
title: "列出 | Cloud"
slug: /cli/cli/PrivateLink-list
sidebar_label: "列出"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出项目的 PrivateLink Endpoint。| Cloud"
type: docx
token: JQ1JdRsfBo1LdpxdTSpcgrx4n3b
sidebar_position: 4
keywords: 
  - milvus 开源
  - milvus 的工作原理
  - Zilliz 向量 Database
  - Zilliz Database
  - zilliz
  - zilliz cloud
  - cloud
  - 列出
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# 列出

此操作列出项目的 PrivateLink Endpoint。

## 说明\{#description}

列出项目的 PrivateLink Endpoint，包括 JSON 输出中的分页字段和 Endpoint 条目。

## 概要\{#synopsis}

```bash
zilliz privatelink list
--project-id <value>
[--api-key <value>]
```

## 选项\{#options}

- **--project-id** (*string*) -

    指定您要列出其 PrivateLink Endpoint 的项目 ID。

    项目 ID。

- **--api-key** (*string*) -

    为此命令指定 API 密钥。此值会覆盖环境变量中的 API 密钥或已配置的 API 密钥。

## 示例\{#example}

```bash
zilliz -o json privatelink list --project-id proj-xxxx

# Example output
# {
#   "count": 0,
#   "currentPage": 1,
#   "endpoints": [],
#   "pageSize": 10
# }
```
