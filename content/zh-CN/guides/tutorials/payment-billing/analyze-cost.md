---
title: "分析成本 | Cloud"
slug: /analyze-cost
sidebar_key: analyze-cost
sidebar_label: "分析成本"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 的用量页为您提供可视化的成本分析能力，支持从多个维度查看 Zilliz Cloud 按量计费集群的使用和消费情况以及包年包月集群额外产生的存储和备份费用。 | Cloud"
type: origin
token: DeRWwlqYKiH76okxiaBcVFPjnMg
sidebar_position: 9
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 用量
  - 分析成本

---

import Admonition from '@theme/Admonition';


# 分析成本

Zilliz Cloud 的用量页为您提供可视化的成本分析能力，支持从多个维度查看 Zilliz Cloud **按量计费集群**的使用和消费情况以及**包年包月集群**额外产生的存储和备份费用。

## 前提条件\{#prerequisites}

您需要具备**组织管理员**或**账单管理员**权限才可以通过 Zilliz Cloud **用量**界面查看和分析成本。

## 操作步骤\{#procedures}

Zilliz Cloud 提供两种用量分析的方式：

- [通过 Web 控制台](./analyze-cost#via-web-ui)：Web 控制台提供了可视化的图表，帮助您更直观地分析成本。界面上用量明细中的用量金额精度均为 **10 位小数**。

- [通过 RESTful API](./analyze-cost#via-restful-api)：RESTful API 提供的用量金额数据精度更高，为 **10 位小数**。如需对账，建议您使用 RESTful API。

### 通过 Web 控制台\{#via-web-ui}

在**账单**页面的**用量**板块，您可以查看多类维度下的 Zilliz Cloud 服务用量和成本变化趋势。

<Admonition type="info" icon="📘" title="说明">

用量数据每小时更新。

</Admonition>

![analyze_cost_cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/analyze_cost_cn.png "analyze_cost_cn")

- **根据项目分析用量和成本**

    如果您根据业务或部门创建了多个项目，您可以在筛选条件中，根据项目来查看特定项目的具体用量和费用成本。

    例如您分别为研发部门和市场部门创建了 2 个项目，Default Project 和 Project_01。当您需要查看过去一个月研发部门的用量和费用时，可以在项目选择器中选中 Default Project。**用量趋势**部分的柱状图将可视化研发部门每天的用量情况变化，或者您可以通过**用量明细**部分查看更详细的数据表格。

- **根据集群分析用量和成本**

    如果您根据业务创建了多个不同的集群，您可以在筛选条件中，根据集群来查看特定集群的具体用量和费用成本。

    例如您为用户信息和订单信息分别创建了两个不同的集群，当您需要查看过去一个订单集群的用量和费用时，可以在集群选择器中选中对应的订单集群。

- **根据计费方式分析用量和成本**

    如果您创建了多种计费方式的集群，您可以在筛选条件中选择特定计费方式。

    例如您在同一组织下创建了一个包年包月集群和一个按量计费集群。如果您需要计算包年包月集群的使用成本，您可以在计费类型筛选器中选择包年包月。筛选后，您可以查看所有包年包月集群额外产生的按量计费费用（即存储、备份等费用）。将筛选出的包年包月集群用量费用与包年包月集群的[订单](./manage-order)费用相加后即可得出包年包月集群的总成本费用。

- **根据时间分析用量和成本**

    如果您需要查看某段时间内每天用量和费用成本的变化趋势，您可以在筛选条件中选择特定的时间范围。目前筛选器的默认时间跨度为 1 个月，支持最大时间跨度为 2 个月。

    例如您需要分析 2024 年 8 月整个月每天的用量和消费情况，您可以在时间选择器中选择 2024 年 8 月 1 日至 2024 年 8 月 31 日。用量趋势部分的柱状图将可视化每天的消费金额变化趋势。

- **根据计费项分析用量和成本**

    如果您需要查看某一计费项的用量和成本变化，您可以在筛选条件中选择特定计费项。可筛选的计费项包含：CU 费用、写入费用、读取费用、存储费用（Serverless）、存储费用（Dedicated）、备份费用、Pipelines 费用。

    例如，您需要分析过去一个月所有项目花费的备份费用总和时，可以在计费项筛选器中选择备份费用。用量趋势的柱状图将可视化过去一个月每天的备份费用总和。

- **根据云服务地域分析用量和成本**

    如果您在多个云服务地域部署了服务，您可以根据云服务地域来筛选。

    例如您在一个项目内，同时在阿里云华东1（杭州）和亚马逊云科技中国（宁夏）分别部署了集群。你可以筛选并查看在亚马逊云科技中国（宁夏）地区的用量和费用。

您可以根据您的分析需求，组合多种上述筛选条件，查看可视化的用量和成本数据。

### 通过 RESTful API\{#via-restful-api}

<Admonition type="info" icon="📘" title="说明">

查询日用量的 RESTful API 目前还处于公测阶段，如需使用请[联系我们](http://support.zilliz.com.cn)。

</Admonition>

您还可以通过[查询日用量](/reference/restful/query-daily-usage-v2)的 API 接口来获取组织的用量信息。通过 API 接口获取的用量信息中，金额精度均为 8 位小数。如需对账，建议您通过 RESTful API 获取精度为 8 位小数的日用量明细。将每日用量的金额加总后，您将获取一个精度为 8 位的用量总金额，对该金额从第 3 位小数进行四舍五入后，您可以获得一个精度为 2 位小数的月用量总金额，该金额与界面上账单详情页展示的总用量金额一致。

以下示例展示了如何使用查询日用量的 API 接口获取组织用量信息。

```bash
curl --request POST \
--url "https://api.cloud.zilliz.com.cn/v2/usage/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "start": "2024-01-01",
    "end": "2024-02-01"
}'
```

以下为参数说明：

- `start`：查询时间段开始日期，格式为 `YYYY-MM-DD`。

- `end`：查询时间段开始日期，格式为 `YYYY-MM-DD`。

## 常见问题\{#faq}

- **Zilliz Cloud 用量明细中的金额精度为多少？**

    Zilliz Cloud 的计费精度为 **10 位小数**，所有账单均按此精度计算。每日费用会先进行汇总，并在计费过程中四舍五入至 10 位小数。

    - **RESTful API**：所有数值（如单价、用量、用量金额）始终返回**精确到 10 位小数**。如果不足 10 位小数，则会在末尾补零以保持 10 位。更多关于如何使用 RESTful API 的信息，请参阅[查询日用量](/reference/restful/query-daily-usage-v2) 。

    - **Web 控制台**：展示的数值与 API 保持一致，但为了便于阅读，界面会省略末尾的连续零。例如，`0.1234000000` 会在界面上显示为 `0.1234`。

