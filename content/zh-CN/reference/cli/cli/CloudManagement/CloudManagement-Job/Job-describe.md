---
title: "describe | Cloud"
slug: /cli/cli/Job-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取异步作业（备份、恢复、迁移、导入等）的状态。 | Cloud"
type: docx
token: HrwTdhnBeoZwoBxokBJcQZWznKh
sidebar_position: 1
keywords: 
  - 稠密嵌入
  - Faiss 向量 Database
  - Chroma 向量 Database
  - NLP 搜索
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

此操作用于获取异步作业（备份、恢复、迁移、导入等）的状态。

## 概要\{#synopsis}

```bash
zilliz job describe
--job-id <value>
[--wait]
[--timeout <value>]
[--interval <value>]
[--output <value>]
```

## 选项\{#options}

- **--job-id** (*string*) -

    **[必需]**

    表示 Job ID。例如，`job-xxxxxxxxxxxxxxxxxxxx`。

- **--wait** (*boolean*) -

    表示是否等待直到作业达到终止状态。

- **--timeout** (*integer*) -

    表示等待的最长秒数。默认值为 `1800`。

- **--interval** (*integer*) -

    表示轮询间隔（秒）。默认值为 5，这表示 Zilliz Cloud 每 5 秒检索一次指定作业的状态。

- **--output, -o** (*string*) -

    表示输出格式。可选值：`json`、`table`、`text`、`yaml`、`csv`。

## 示例\{#example}

```bash
zilliz job describe --job-id job-xxxxxx
```
