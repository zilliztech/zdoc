---
title: "手动扩缩容 | BYOC"
slug: /manual-scaling
sidebar_label: "手动扩缩容"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "当您明确知道所需的目标资源配置时，可以使用手动扩缩容来调整 Dedicated 服务集群的规格。您可以增加或减少 Query CU 来调整集群容量，也可以增加或减少 Replica 来调整查询吞吐和可用性。 | BYOC"
type: origin
token: I64FwCeMBi2DmokaO2McbxTQn9f
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 手动扩缩容

当您明确知道所需的目标资源配置时，可以使用手动扩缩容来调整 Dedicated 服务集群的规格。您可以增加或减少 Query CU 来调整集群容量，也可以增加或减少 Replica 来调整查询吞吐和可用性。

手动扩缩容适用于有计划的变更，例如生产发布、压测、迁移窗口、可预测的流量增长，或流量下降后的一次性成本优化。

请注意，手动扩缩容仅适用于服务集群。On-demand 集群会在请求到达时自动扩缩容，并在空闲时缩容到零。

<Admonition type="info" icon="📘" title="📘 说明">

所有版本都支持手动扩缩容 Query CU。

企业版及以上版本支持手动扩缩容 Replica。

企业版及以上版本支持自动扩缩容和定时扩缩容。

</Admonition>

## 开始前\{#before-you-start}

开始前，请阅读 [规划集群扩缩容](./plan-cluster-scaling)，了解关键扩缩容概念，并为您的工作负载选择合适的扩缩容方式。

## 通过 Web 控制台手动扩缩容\{#manual-scaling-via-web-console}

### 手动扩缩容 Query CU\{#scale-query-cu-manually}

<Supademo id="cmd2tmxru37t9c4kjvmhe8n6f" title=""  />

<Procedures>

1. 进入**集群详情**页面。

1. 在 **Query CU 设置**卡片中点击**扩缩容**。

1. 选择**手动**作为扩缩容方式，并配置目标 Query CU 规格。

1. 点击**保存**。

</Procedures>

<Admonition type="info" icon="📘" title="📘 说明">

在 **Scale Query Node CU** 对话框中点击 **Save** 时，系统会提示您检查项目资源配额。如果资源充足，检查完成后对话框会关闭；否则，您可以：

- 点击 **Go To Project Resource Settings** 编辑项目资源设置；或

- 点击 **Back to Last Step** 修改集群设置。

在此过程中，滚动升级会需要一些额外资源；这些资源会在使用后释放。

</Admonition>

### 手动扩缩容 Replica\{#scale-replica-manually}

<Supademo id="cmd2ub5ca38cxc4kjl4ua85dm" title=""  />

<Procedures>

1. 进入**集群详情**页面。

1. 在 **Replica 设置**卡片中点击**扩缩容**。

1. 选择**手动**作为扩缩容方式，并配置目标 Replica 数量。

1. 点击**保存**。

</Procedures>

<Admonition type="info" icon="📘" title="📘 注意">

在 **Scale Cluster Replicas** 对话框中点击 **Save** 时，系统会提示您检查项目资源配额。如果资源充足，检查完成后对话框会关闭；否则，您可以：

- 点击 **Go To Project Resource Settings** 编辑项目资源设置；或

- 点击 **Back to Last Step** 修改集群设置。

在此过程中，滚动升级会需要一些额外资源；这些资源会在使用后释放。

</Admonition>

## 通过 RESTful API 手动扩缩容\{#manual-scaling-via-restful-api}

使用 RESTful API 时，您可以在单个[修改集群配置](https://docs.zilliz.com.cn/reference/restful/modify-cluster-v2)请求中手动扩缩容 Query CU 和 Replica。

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "cuSize": 2,
    "replica": 2
}'
```

## 查看扩缩容进度\{#view-scaling-progress}

提交手动扩缩容请求后，Zilliz Cloud 会创建一条任务记录。

<Procedures>

1. 在 Zilliz Cloud 控制台中，进入目标项目。

1. 进入 **Jobs**。

1. 找到目标集群的扩缩容任务。

1. 查看任务状态。

</Procedures>

当扩缩容任务正在进行时，集群状态为`修改中`。任务成功后，集群状态会变回`运行中`。

## 常见问题\{#faq}

**新配置什么时候开始计费？**

只有扩缩容任务成功完成后，才会按新配置计费。如果任务仍在运行或未完成，计费仍基于之前的配置。

**如果不允许缩容会发生什么？**

如果目标 Query CU 规格无法支撑当前数据量、Collection 数量或 Partition 数量，缩容请求可能会失败。在这种情况下，请保持当前规格，或选择更大的目标配置。

**应该使用手动扩缩容、定时扩缩容还是动态扩缩容？**

当您确切知道何时扩缩容以及扩缩容多少时，使用手动扩缩容。对于周期性流量模式，使用定时扩缩容。对于不可预测的工作负载，并希望 Zilliz Cloud 在配置范围内自动调整资源时，使用动态扩缩容。