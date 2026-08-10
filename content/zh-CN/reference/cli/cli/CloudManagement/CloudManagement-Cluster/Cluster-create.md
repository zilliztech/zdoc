---
title: "create | Cloud"
slug: /cli/cli/Cluster-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将创建一个新集群。 | Cloud"
type: docx
token: GZ2jdLkKAojfofxm9BTcvwVCn4b
sidebar_position: 1
keywords: 
  - 向量嵌入
  - 向量存储
  - 开源向量 Database
  - 向量索引
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

此操作将创建一个新集群。

## 说明\{#description}

对于 Dedicated 集群，Zilliz Cloud 提供以下集群类型：**Performance-optimized、Capacity-optimized** 和 **Tiered-storage。**

### Performance-optimized 集群\{#performance-optimized-cluster}

- 专为强调低延迟和高吞吐的场景设计。

- 非常适合生成式 AI、推荐系统、聊天机器人等实时应用。

### Capacity-optimized 集群\{#capacity-optimized-cluster}

- 专为处理海量数据集而设计，数据容量是 Performance-optimized 类型的 5 倍，但搜索性能相对较弱。

- 非常适合大规模非结构化数据搜索、版权检测和身份验证。

### Tiered-storage 集群\{#tiered-storage-cluster}

- 最适合超大规模且对成本敏感的工作负载。

- 非常适合需要以低成本存储海量数据的应用。Tiered-storage 集群的容量是 Capacity-optimized 集群的 4 倍。

运行此命令时如果不带任何选项，将触发一组交互式提示。

<Admonition type="info" icon="📘" title="Notes">

BYOC 项目中不可使用 Tiered-storage 集群。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz cluster create
--name <value>
--type <serverless | free | dedicated>
[--project-id <value>]
[--region <value>]
[--cu-type <Performance-optimized | Capacity-optimized | Tiered-storage>]
[--cu-size <value>]
[--plan <Free | Serverless | Standard | Enterprise>]
[--output <value>]
```

## 选项\{#options}

- **--name** (*string*) -

    **[必需]**

    表示集群显示名称。

    该值必须是以字母开头、长度不超过 **255** 个字符的字母数字字符串。

- **--type** (*string*) -

    **[必需]**

    表示集群类型。

    可能的值：

    - `serverless`，

    - `free`，以及

    - `dedicated`。

- **--project-id** (*string*) -

    表示要在其中创建集群的项目。

- **--region** (*string*) -

    表示云区域。

    可能的值：

    - `aws-us-east-1`

    - `aws-us-east-2`

    - `aws-us-west-2`

    - `aws-ca-central-1`

    - `aws-eu-central-1`

    - `aws-eu-west-1`

    - `aws-ap-northeast-1`

    - `aws-ap-southeast-1`

    - `aws-ap-southeast-2`

    - `gcp-us-west1`

    - `gcp-us-east4`

    - `gcp-us-central1`

    - `gcp-asia-southeast1`

    - `az-eastus`

    - `az-eastus2`

    - `az-centralus`

    - `az-germanywestcentral`

    - `az-northeurope`

    - `az-centralindia`

    <Admonition type="info" icon="📘" title="Notes">

    如需了解您的 BYOC 项目中可用的区域，请咨询您的组织所有者。

    </Admonition>

- **--cu-type** (*string*) -

    表示计算单元类型（仅 Dedicated）。

    可能的值：

    - `Performance-optimized`，

    - `Capacity-optimized`，

    - `Tiered-storage`。

- **--cu-size** (*integer*) -

    表示计算单元数量（仅 Dedicated）。

    CU 是用于并行处理数据的计算资源基本单位，不同的 CU 类型由不同组合的 CPU、内存和存储构成。CU 的概念仅适用于 **Dedicated** 集群。

    - 对于 **Standard** 项目中的 **Dedicated** 集群，其 CU 大小与副本数的乘积必须小于或等于 32。

    - 对于 **Enterprise** 项目中的 **Dedicated** 集群，其 CU 大小与副本数的乘积必须小于或等于 1,024。

- **--plan** (*string*) -

    表示订阅计划（仅 Dedicated）。

    可能的值：

    - `Free`，

    - `Serverless`，

    - `Standard`，

    - `Enterprise`。

- **--output, -o** (*string*) -

    输出格式。

    可能的值：

    - `json`，

    - `table`，

    - `text`。

## 示例\{#example}

```bash
zilliz cluster create --name my-cluster \
--type serverless \
--region aws-us-west-2
```
