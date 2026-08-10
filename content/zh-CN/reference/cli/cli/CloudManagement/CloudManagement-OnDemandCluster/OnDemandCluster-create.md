---
title: "创建 | Cloud"
slug: /cli/cli/OnDemandCluster-create
sidebar_label: "创建"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于在 Zilliz Cloud 中创建按需集群。| Cloud"
type: docx
token: IqkTduvaBo7477xaW1Hc1wBTn9c
sidebar_position: 1
keywords: 
  - RAG LLM 架构
  - 私有 LLM
  - 近邻搜索
  - LLM 评估
  - zilliz
  - zilliz cloud
  - cloud
  - 创建
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# 创建

此操作用于在 Zilliz Cloud 中创建按需集群。

## 说明\{#description}

在 Zilliz Cloud 中创建按需集群。按需集群在空闲时可以挂起，并在查询工作负载到来时恢复。

## 概述\{#synopsis}

```bash
zilliz on-demand-cluster create
--project-id <value>
--region-id <value>
--cu-size <value>
--cluster-name <value>
[--session-ttl <value>]
[--max-query-node-cu <value>]
[--max-query-node-replicas <value>]
```

## 选项\{#options}

- **--project-id** (*string*) -

    **[必需]**

    指定项目 ID。

- **--region-id** (*string*) -

    **[必需]**

    指定云区域（例如 `aws-us-east-1`）。

- **--cu-size** (*integer*) -

    **[必需]**

    指定计算单元数量。最小值：`8`。

- **--cluster-name** (*string*) -

    **[必需]**

    指定集群显示名称。最多 64 个字符。允许的字符包括：字母、数字、空格、`_`、`-` 和中文字符。

- **--session-ttl** (*string*) -

    指定自动挂起 TTL。格式：`<number><s|m|h>`（例如 `30m`、`1h`、`90s`）。最小值：`60s`。默认值：`60s`。

- **--max-query-node-cu** (*integer*) -

    指定最大查询节点 CU。

- **--max-query-node-replicas** (*integer*) -

    指定最大查询节点副本数。

## 示例\{#example}

```bash
# Create with minimum requirements
zilliz on-demand-cluster create --project-id proj-xxxx --region-id aws-us-east-1 --cu-size 8 --cluster-name my-on-demand

# Create with custom TTL and query node limits
zilliz on-demand-cluster create --project-id proj-xxxx --region-id aws-us-east-1 --cu-size 16 --cluster-name my-cluster --session-ttl 30m --max-query-node-cu 4 --max-query-node-replicas 2
```
