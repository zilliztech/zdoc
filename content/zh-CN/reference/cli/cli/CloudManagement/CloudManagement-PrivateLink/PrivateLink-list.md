---
title: "list | Cloud"
slug: /cli/cli/PrivateLink-list
sidebar_label: "list"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出项目的 PrivateLink 端点。 | Cloud"
type: docx
token: JQ1JdRsfBo1LdpxdTSpcgrx4n3b
sidebar_position: 4
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
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

此操作列出项目的 PrivateLink 端点。

## 描述\{#description}

列出某个项目的 PrivateLink 端点，包括 JSON 输出中的分页字段和端点条目。

## 概要\{#synopsis}

```bash
zilliz privatelink list
--project-id <value>
[--api-key <value>]
```

## 选项\{#options}

- **--project-id** (*string*) -

    指定要列出其 PrivateLink 端点的项目 ID。

    项目 ID。

- **--api-key** (*string*) -

    为此命令指定 API 密钥。此值会覆盖环境变量或已配置的 API 密钥。

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
