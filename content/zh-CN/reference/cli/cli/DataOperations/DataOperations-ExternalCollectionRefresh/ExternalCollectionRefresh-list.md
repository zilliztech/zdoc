---
title: "list | Cloud"
slug: /cli/cli/ExternalCollectionRefresh-list
sidebar_label: "list"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出外部集合刷新任务（可选择按集合筛选）。 | Cloud"
type: docx
token: YRQbd0bSOoMIDixpInlcg05jn4g
sidebar_position: 2
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
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

此操作列出外部集合刷新任务（可选择按集合筛选）。

## 描述\{#description}

列出当前集群上下文中的外部集合刷新任务。使用 `--name` 和 `--database` 可缩小结果范围。

## 概要\{#synopsis}

```bash
zilliz external-collection refresh list
[--name <value>]
[--database <value>]
```

## 选项\{#options}

- **--name** (*string*) -

    按外部集合名称筛选。

- **--database** (*string*) -

    指定数据库名称。

## 示例\{#example}

```bash
zilliz -o json external-collection refresh list --name my_external_coll

# Example output
# {
#   "jobs": []
# }
```
