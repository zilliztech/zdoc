---
title: "upgrade | Cloud"
slug: /cli/cli/Project-upgrade
sidebar_label: "upgrade"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会升级项目的订阅计划。 | Cloud"
type: docx
token: QIhWdtFpNotKksx7KmxcTdwXnEh
sidebar_position: 4
keywords: 
  - 检索增强生成
  - 大语言模型
  - 向量化
  - k 近邻算法
  - zilliz
  - zilliz cloud
  - cloud
  - upgrade
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# upgrade

此操作会升级项目的订阅计划。

## 摘要\{#synopsis}

```bash
zilliz project upgrade [OPTIONS]
```

**选项：**

- **--project-id** (*string*) -

    **[必填]**

    表示项目 ID，类似于 `proj-xxxxx`。

- **--plan** (*string*) -

    表示目标订阅计划。可能的值包括：<include lang="en-US">`Serverless`、`Standard`、</include>`Enterprise`。

## 示例\{#example}

```bash
zilliz project upgrade --project-id proj-xxxxxxxxxxxx --plan Enterprise
```
