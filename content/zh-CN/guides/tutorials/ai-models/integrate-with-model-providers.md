---
title: "模型供应商 | Cloud"
slug: /integrate-with-model-providers
sidebar_label: "模型供应商"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在外部服务商托管的文本 Embedding 模型或重新排序模型，必须先让该服务商能够对来自你项目的请求进行身份验证，Zilliz Cloud 才能调用该模型。模型服务集成在项目级别存储服务商颁发的凭证，并为 Zilliz Cloud 提供一个可供文本 Embedding 和重新排序功能引用的集成 ID。这样便无需在各个 Function 或 Ranker 配置中分别填写凭证。 | Cloud"
type: origin
token: Psarw6886iSZAvkYGnnclLBgnVd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 模型供应商

在外部服务商托管的文本 Embedding 模型或重新排序模型，必须先让该服务商能够对来自你项目的请求进行身份验证，Zilliz Cloud 才能调用该模型。**模型服务集成**在项目级别存储服务商颁发的凭证，并为 Zilliz Cloud 提供一个可供文本 Embedding 和重新排序功能引用的集成 ID。这样便无需在各个 Function 或 Ranker 配置中分别填写凭证。

<Admonition type="info" icon="📘" title="说明">

创建模型服务集成不会产生费用。外部服务商可能会收取模型推理费用，向服务商发送数据也可能产生[数据传输费用](./data-transfer-cost)。

</Admonition>

## 支持的模型服务提供商\{#supported-model-providers}

以下模型服务提供商可与 Zilliz Cloud 集成：

| **模型服务提供商** | **支持的 Zilliz Cloud 功能** | **所需凭证** |
| --- | --- | --- |
| **OpenAI** | Text Embedding Function | API 密钥。获取方法请参阅 [OpenAI API 快速入门](https://developers.openai.com/api/docs/quickstart#create-and-export-an-api-key)。 |
| **Cohere** | Text Embedding Function 和基于模型的 Ranker | API 密钥。获取方法请参阅 [API 密钥和速率限制](https://docs.cohere.com/docs/rate-limits)。 |
| **Voyage AI** | Text Embedding Function 和基于模型的 Ranker | API 密钥。获取方法请参阅 [API 密钥和 Python 客户端](https://docs.voyageai.com/docs/api-key-and-installation)。 |
| **Hugging Face** | [Text Embedding Function](./hugging-face) 和 [Hugging Face Ranker](./hugging-face-ranker) | 具有 Make calls to Inference Providers 权限的用户访问令牌。获取方法请参阅[用户访问令牌](https://huggingface.co/docs/hub/en/security-tokens)。 |

<Admonition type="info" icon="📘" title="说明">

从外部服务提供商选择模型时，请确认该服务商当前为所需任务提供此模型。模型可用性、任务支持情况、稳定性、延迟和输出质量取决于服务商及所选模型。在生产环境中使用模型之前，请针对你的工作负载评估这些属性。

</Admonition>

## 开始前\{#before-you-start}

创建模型服务集成前，请确保：

- 你对目标 Zilliz Cloud 项目拥有 Organization Owner 或 Project Admin 权限。如果权限不足，请联系你的 Zilliz Cloud Organization Owner。

- 你已获得所选模型服务提供商要求的凭证。请参阅[支持的模型服务提供商](./integrate-with-model-providers#supported-model-providers)。

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

    - **Provider（仅适用于 Hugging Face）**：保留默认值 `hf-inference`。Hugging Face Text Embedding 和 Hugging Face Ranker 目前仅支持此 Inference Provider。

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

创建模型服务集成后，你可以：

- 将其与 Text Embedding Function 配合使用，将文本转换为密集向量。

- 使用基于模型的 Ranker 对搜索结果重新排序。

有关详细操作说明，请参阅：

- [硅基流动](./siliconflow)

- [Hugging Face](./hugging-face)

- [硅基流动 Ranker](./siliconflow-model-ranker)

- [Hugging Face Ranker](./hugging-face-ranker)

