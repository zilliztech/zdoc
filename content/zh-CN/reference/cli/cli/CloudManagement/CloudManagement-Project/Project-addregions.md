---
title: "add-regions | Cloud"
slug: /cli/cli/Project-addregions
sidebar_label: "add-regions"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将附加区域绑定到现有项目。 | Cloud"
type: docx
token: JP80dUdphoM5N9xsTFTccZeRnhp
sidebar_position: 5
keywords: 
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - add-regions
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# add-regions

此操作将附加区域绑定到现有项目。

## 说明\{#description}

将附加区域绑定到现有的 Zilliz Cloud 项目。重复 `--region` 可在一条命令中添加多个区域。

## 摘要\{#synopsis}

```bash
zilliz project add-regions
--project-id <value>
--region <value>
[--api-key <value>]
```

## 选项\{#options}

- **--project-id** (*string*) -

    指定要绑定附加区域的项目 ID。

- **--region** (*array*) -

    **[必需]**

    要添加的区域 ID（可重复，例如 **--region aws-us-east-1 --region gcp-us-west1**）。

- **--api-key** (*string*) -

    为此命令指定 API 密钥。此值会覆盖环境变量中的 API 密钥或已配置的 API 密钥。

## 示例\{#example}

```bash
zilliz project add-regions --project-id proj-xxxx --region aws-us-east-1
zilliz project add-regions --project-id proj-xxxx --region aws-us-east-1 --region gcp-us-west1
```
