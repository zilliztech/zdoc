---
title: "功能支持情况 | Cloud"
slug: /feature-availability
sidebar_key: feature-availability
sidebar_label: "功能支持情况"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "最后更新时间：2025 年 10 月 13 日 | Cloud"
type: origin
token: EZ2jwCJD7iazqKkmSGRcBfjWnCh
sidebar_position: 14
keywords: 
  - zilliz
  - 向量数据库
  - milvus
  - feature availability

---

import Admonition from '@theme/Admonition';


# 功能支持情况

*最后更新时间：2025 年 10 月 13 日*

功能的可用性阶段表示其在 Zilliz Cloud 中的**成熟度、稳定性和推荐使用程度**。以下内容介绍了各功能生命周期阶段的定义及其对用户的意义：

![ChEdwtmeQhlfcib0zTAcH05Pnec](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/ChEdwtmeQhlfcib0zTAcH05Pnec.png)

- **内测版**

    - **定义**：内测版功能仍在开发中，可能会发生变更。虽已在 Zilliz Cloud 内实现并经过初步测试，但在完整性和边缘场景的支持上尚未完善。

    - **功能使用**：功能默认不可见。如需体验内测版功能，请[提交工单](http://support.zilliz.com.cn)申请开通功能。

    - **使用建议**：不适用于生产环境。

- **公测版**

    - **定义**：公测版功能已接近稳定，进入 GA（正式可用）前一般不会发生重大变更。

    - **功能使用**：通常在升级 Milvus 版本后默认可用。若当前集群版本较旧，可能需[提交工单](http://support.zilliz.com.cn)先进行升级。

    - **使用建议**：不建议在生产环境中使用。

- **正式可用（General Availability, GA）**

    - **定义**：功能已全面发布，具备生产环境可用性，官方提供稳定支持。

    - **功能使用**：大部分功能默认启用。部分企业功能需[联系销售](http://zilliz.com.cn/contact-sales)单独开通。

    - **使用建议**：推荐用于生产环境。

- **停用预告**

    - **定义**：该阶段的功能仍可使用，但已不再持续迭代，仅保留关键问题修复。

    - **功能使用**：功能仍旧可用，用户将通过邮件收到停用预告。

    - **使用建议**：请尽快[联系技术专家团队](http://zilliz.com.cn/contact-sales)，迁移至新功能或替代方案。

- **已停用（Deprecated）**

    - **定义**：功能已完全下线，无法再使用或获取与功能相关的技术支持。

    - **功能使用**：不可用。

## 如何识别功能支持情况\{#}

Zilliz Cloud 文档中，每个功能会以标签形式标注其当前支持阶段。如无特别说明，默认为正式可用（GA）。

## 当前功能支持情况\{#}

### 内测版\{#}

- [导出备份文件](./export-backup-files)

- [托管模型](./hosted-models)

<Admonition type="info" icon="📘" title="说明">

如需使用上述功能，请[提交工单](http://support.zilliz.com.cn)申请开通功能。

</Admonition>

### 公测版\{#}

- [Text Embedding](./model-based-functions) 和 [Rerank](./reranking) Function

<Admonition type="info" icon="📘" title="说明">

如需使用上述功能，请升级集群的 Milvus 版本。

</Admonition>

- [访问日志](./access-logs)

- 按需计算

<Admonition type="info" icon="📘" title="说明">

如果您项目所在的云地域不支持此功能，请[联系我们](http://zilliz.com.cn/contact-sales)。

</Admonition>

### 停用预告\{#}

- [从 NumPy 文件导入数据](./data-import-numpy)

- [RESTful API（V1 版本）](/reference/restful/v1)

- [合并数据](./merge-data)

### 已停用\{#}

- Pipelines

