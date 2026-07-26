---
title: "模型供应商 | Cloud"
slug: /integrate-with-model-providers
sidebar_label: "模型供应商"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "模型供应商集成用于将 Zilliz Cloud 连接到第三方模型服务，并将该模型供应商提供的能力引入到你的项目中。 | Cloud"
type: origin
token: Psarw6886iSZAvkYGnnclLBgnVd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 模型供应商

**模型供应商集成**用于将 **Zilliz Cloud** 连接到第三方模型服务，并将该模型供应商提供的能力引入到你的项目中。

一个模型供应商集成可以：

- 存储访问模型供应商所需的认证信息

- 集成使用模型供应商支持的能力（例如文本向量化或重排序）

## 何时需要模型供应商集成\{#when-you-need-a-model-provider-integration}

仅当你希望在 Zilliz Cloud 中使用**基于模型的能力**时，才需要创建模型供应商集成，包括：

- **Text Embedding Function**：使用外部模型将原始文本转换为稠密向量。详情请参阅 [Text Embedding Function](./undefined)。

- **Model Ranker**：使用外部重排序模型对搜索结果进行重新排序。详情请参阅 [Model Ranker](./undefined)。

本地能力（如 BM25、混合排序器以及基于规则的排序器）**不需要**模型供应商集成。

## 计费说明\{#billing-considerations}

创建模型供应商集成本身不会产生费用。但在使用外部模型供应商时，可能会产生以下额外成本：

- 模型供应商收取的费用

- 在进行向量化或重排序时产生的数据传输费用。详情请参阅[数据传输费用](./data-transfer-cost)。

仅当实际执行基于模型的函数或排序器时，才会产生计费。

## 开始前\{#before-you-start}

在创建模型供应商集成之前，请确保满足以下条件：

- 你在目标 Zilliz Cloud 项目中拥有**组织管理员**或**项目管理员**权限。如果权限不足，请联系你的 Zilliz Cloud 组织所有者。

- 你已准备好要集成的模型供应商所需的有效 API Key。

## 创建模型供应商集成\{#create-a-model-provider-integration}

<Supademo id="cmk3s8sl64hrogmn877ukcb7i" title=""  />

创建模型供应商集成的步骤如下：

<Procedures>

1. 登录 Zilliz Cloud 控制台。

1. 在项目页面中，从左侧导航栏进入**集成中心**。

1. 在**模型供应商**区域，点击 **+ 添加配置**。

1. 在弹出的对话框中完成**基础设置**：

    - **模型供应商**：选择要集成的模型供应商

    - **集成名称**：为该集成指定一个唯一名称（例如：**test**）

    - **集成描述（可选）**：填写该集成的说明（例如：**用于模型供应商**）

1. 点击**下一步**，进入**凭证信息**配置：

    1. 在 **API 密钥**字段中输入模型供应商提供的 API Key

    1. 点击**校验集成**验证连接。当状态变为**成功**后，继续下一步

1. 点击**添加**完成创建。

</Procedures>

## 管理集成\{#manage-integrations}

集成创建完成后，你可以在**集成中心**页面中对其进行管理，包括：

- 获取集成 ID

    在使用 Text Embedding Function 或 Rerank Function 时，需要提供该集成 ID

- 查看集成详情

- 编辑集成名称或描述

- 在不再需要时删除该集成

<Admonition type="info" icon="📘" title="说明">

如果某个集成被移除或变为无效，引用该集成的 Collection 或 Ranker 在执行插入或搜索操作时可能会失败，直到该集成被更新或替换。

</Admonition>

<Supademo id="cmk3u8h1j00eqxo0ivkhk7ozo" title="" isShowcase />

## 下一步\{#next-steps}

创建模型供应商集成后，你可以：

- 将其与 **Text Embedding Function** 结合使用，将文本转换为稠密向量

- 将其与 **Model Ranker** 结合使用，对搜索结果进行重排序

详细操作请参阅：

- [Text Embedding Function](./undefined)

- [Model Ranker](./undefined)

