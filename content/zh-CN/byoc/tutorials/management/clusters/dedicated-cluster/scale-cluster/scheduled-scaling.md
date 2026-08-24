---
title: "定时扩缩容 | BYOC"
slug: /scheduled-scaling
sidebar_label: "定时扩缩容"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "定时扩缩容允许您在预定义时间调整 Dedicated Serving 集群的规格。当工作负载具有周期性模式时，可以使用定时扩缩容，例如工作日办公时间流量、周末低流量时段，或可预测的批量/查询窗口。 | BYOC"
type: origin
token: Dm7dwQQvxib74AkgoITcfy5Wnfe
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 定时扩缩容

定时扩缩容允许您在预定义时间调整 Dedicated Serving 集群的规格。当工作负载具有周期性模式时，可以使用定时扩缩容，例如工作日办公时间流量、周末低流量时段，或可预测的批量/查询窗口。

<Admonition type="info" icon="📘" title="📘 说明">

所有版本都支持手动扩缩容 Query CU。

企业版及以上版本支持手动扩缩容 Replica。

企业版及以上版本支持自动扩缩容和定时扩缩容。

</Admonition>

## 开始前\{#before-you-start}

开始前，请阅读 [规划集群扩缩容](./plan-cluster-scaling)了解关键扩缩容概念，并为您的工作负载选择合适的扩缩容方式。

## 定时扩缩容的工作方式\{#how-scheduled-scaling-works}

定时扩缩容会根据您定义的计划更改集群资源。每个计划包含一个时间表达式和一个目标资源值。

| 资源 | 计划会更改什么 | 适用场景 |
| --- | --- | --- |
| Query CU | 将集群 Query CU 数量更改为计划中的目标值。 | 您需要在周期性高峰期增加容量，或在可预测的低流量时段降低容量。 |
| Replica | 将集群 Replica 数量更改为计划中的目标值。 | 您需要在周期性流量高峰期间获得更多查询吞吐或可用性。 |

定时扩缩容不同于[自动扩缩容](./auto-scaling)。定时扩缩容会在您配置的时间运行。自动扩缩容会基于工作负载指标，在最小值和最大值范围内自动调整资源。

## 何时使用定时扩缩容\{#when-to-use-scheduled-scaling}

| 场景 | 建议计划 |
| --- | --- |
| 应用在工作日办公时间有更高流量。 | 设置定时扩缩容，在办公时间前触发扩容，并在办公时间后触发缩容。 |
| 工作负载在周末较轻。 | 设置定时扩缩容，在周末触发缩容，并在周一流量开始前恢复容量。 |
| 运行周期性的批量搜索、评测或分析任务。 | 设置定时扩缩容，在任务窗口前触发扩容，并在任务完成后触发缩容。 |
| 流量峰值可预测，但不需要基于指标的自动扩缩容。 | 使用定时扩缩容进行确定性的资源变更，而不是自动扩缩容。 |

## 通过 Web 控制台配置定时扩缩容\{#configure-scheduled-scaling-via-web-console}

计划之间的间隔应大于 30 分钟。

### Query CU 定时扩缩容\{#query-cu-scheduled-scaling}

<Supademo id="cmjmbp8n709chyb0hzmb2cwdt" title=""  />

<Procedures>

1. 进入**集群详情**页面。

1. 在 **CU 设置**卡片中点击**扩缩容**。

1. 启用定时扩缩容。

1. 配置时区和计划。您可以使用基础模式，也可以使用高级模式（编写 Cron 表达式）来设置计划。有关如何在高级模式中编写 Cron 表达式，请参阅[了解 Cron 表达式](./cron-expression)。

1. 点击**保存**。

</Procedures>

### Replica 定时扩缩容\{#replica-scheduled-scaling}

<Supademo id="cmd2ujs5s38dlc4kjgbm3gkui" title=""  />

<Procedures>

1. 进入**集群详情**页面。

1. 在 **Replica 设置**卡片中点击**扩缩容**。

1. 启用定时扩缩容。

1. 配置时区和计划。您可以使用基础模式，也可以使用高级模式（编写 Cron 表达式）来设置计划。有关如何在高级模式中编写 Cron 表达式，请参阅[了解 Cron 表达式](./cron-expression)。

1. 点击**保存**。

</Procedures>

## 通过 RESTful API 配置定时扩缩容\{#configure-scheduled-scaling-via-restful-api}

使用 RESTful API 时，您可以在单个[修改集群配置](https://docs.zilliz.com.cn/reference/restful/modify-cluster-v2)请求中为 Query CU 和 Replica 配置定时扩缩容。

有关如何在高级模式中编写 Cron 表达式，请参阅[了解 Cron 表达式](./cron-expression)。

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
  --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Accept: application/json" \
  --header "Content-Type: application/json" \
  -d '{
    "autoscaling": {
      "cu": {
        "schedules": [
          {
            "cron": "0 9 * * 1-5",
            "target": 2
          }
        ]
      },
      "replica": {
        "schedules": [
          {
            "cron": "0 9 * * 1-5",
            "target": 2
          }
        ]
      }
    }
  }'
```

## 查看扩缩容进度\{#view-scaling-progress}

当扩缩容事件被触发后，Zilliz Cloud 会生成任务记录。您可以在任务中心页面查看进度。

<Procedures>

1. 在 Zilliz Cloud 控制台中，进入目标项目。

1. 进入 **Jobs**。

1. 找到目标集群的扩缩容任务。

1. 查看任务状态。

</Procedures>

当扩缩容任务正在进行时，集群状态为`修改中`。任务成功后，集群状态会变回`运行中`。

<Admonition type="info" icon="📘" title="说明">

扩缩容任务期间，Zilliz Cloud 会继续按之前的配置对集群计费。只有扩缩容任务成功完成后，新的 Query CU 或 Replica 配置才会用于计费。该规则适用于扩容和缩容操作。

</Admonition>

## 常见问题\{#faq}

**如果两个计划间隔太近会发生什么？**

计划之间的间隔应大于 30 分钟。避免创建触发过于频繁或相互重叠的计划。

**Cron 使用哪个时区？**

Cron 计划会按您配置定时扩缩容时选择的时区进行评估。