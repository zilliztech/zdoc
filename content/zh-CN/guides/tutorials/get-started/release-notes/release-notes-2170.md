---
title: "版本说明书（2025/06/09） | Cloud"
slug: /release-notes-2170
sidebar_key: release-notes-2170
sidebar_label: "2025/06/09"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "此次发布在 Zilliz Cloud 的多个功能中提供了更精致、更直观的用户体验。从重新设计的迁移控制台到基于策略的告警和改进的 mmap 控制，我们专注于让您的工作流程更快、更灵活且更易于管理。无论是管理基础设施、监控环境还是寻求支持，新的 AI 助手功能都让您与 Zilliz Cloud 的联络更加顺畅。 | Cloud"
type: origin
token: TC2VwH24niqw5wk2S66ccMhxnFe
sidebar_position: 10
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2025/06/09）

此次发布在 Zilliz Cloud 的多个功能中提供了更精致、更直观的用户体验。从重新设计的迁移控制台到基于策略的告警和改进的 mmap 控制，我们专注于让您的工作流程更快、更灵活且更易于管理。无论是管理基础设施、监控环境还是寻求支持，新的 AI 助手功能都让您与 Zilliz Cloud 的联络更加顺畅。

## Milvus 兼容性\{#milvus-compatibility}

本次发布后创建的所有集群均兼容 **Milvus v2.5.x**。同时，所有 Milvus v2.5.x 相关特性在 Zilliz Cloud 上均已全面可用。

## 重新设计的界面和最佳实践文档，提升您的数据迁移体验\{#}

- **新的迁移控制台界面**：清晰简洁的界面帮助您快速定位数据源入口，选择最合适您的迁移方式。

    Zilliz Cloud 支持在 Zilliz Cloud 集群间、从 Milvus、以及从外部数据源迁移数据。关于所有支持的数据源，可以查看[数据迁移](./migrations)。

    ![Q9JWbgdiAoOXpFxl9RScyla6nZb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Q9JWbgdiAoOXpFxl9RScyla6nZb.png "Q9JWbgdiAoOXpFxl9RScyla6nZb")

- **高级 Collection 和字段配置工具**：更完善的数据类型支持、动态字段到静态字段转换能力以及一目了然的字段和 Shard 配置能力让您更加自信地处理从选定数据源到 Zilliz Cloud Collection 间的复杂字段映射关系。所有这一切都包含在这个对用户友好的响应式界面中。 

    ![QCZdbszQXoJ1R6x3EilcYAyynHg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/QCZdbszQXoJ1R6x3EilcYAyynHg.png "QCZdbszQXoJ1R6x3EilcYAyynHg")

    您可以阅读[外部迁移概述](./external-migration-basics)来了解从外部数据源迁移数据到 Zilliz Cloud 集群的基本步骤。然后再针对具体的外部数据源有针对性地了解具体的要求和常用的问题处理规则和方法。目前我们支持如下数据源：[Qdrant](./migrate-from-qdrant)、[ElasticSearch](./migrate-from-elasticsearch)、[PostgreSQL](./migrate-from-pgvector)、[腾讯云向量数据库](./migrate-from-tencent-cloud-vectordb)、[OpenSearch](./migrate-from-opensearch)。

## 基于策略的告警规则，提供细粒度的灵活监控能力\{#}

本次发布带来了基于策略的告警规则体系，为您提供细粒度的灵活监控能力。

- **基于策略的告警**：您现在可以针对具体的 Zilliz Cloud 集群进行精确监控。

- **策略克隆**：单击鼠标，几秒间就可以完成告警策略的复制。

- **OpenAPI 支持**：您可以利用我们提供的 RESTful API 接口通过应用程序实现告警管理的自动化。

- **无感迁移**：所有既有的告警都会无感迁移到新的告警框架。

关于基于策略的告警规则，可以参考[管理项目告警](./manage-project-alerts)以及[创建](/reference/restful/create-alert-rule-v2)、[更新](/reference/restful/update-alert-rule-v2)、[查看](/reference/restful/list-alert-rules-v2)和[删除](/reference/restful/delete-alert-rule-v2)告警规则的相关 RESTful API 参考文档。

## 控制台支持 mmap 设置\{#mmap}

Zilliz Cloud 会根据您集群的 CU 类型和订阅计划为您的集群应用[全局的 mmap 设置](./use-mmap#global-mmap-strategy)。从本次发布开始，您可以通过控制台界面直接管理集群中各 Collection 和 Collection 中各字段的 mmap 设置。

- Collection 级别的设置：简便地完成 Collection 原始数据的 mmap 设置。

- 字段级别的设置：您还可以为某个字段启用、禁用、删除其 mmap 设置。

![DLW4bHqMWo4XkxxkGcfcsEPyn1g](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/DLW4bHqMWo4XkxxkGcfcsEPyn1g.png "DLW4bHqMWo4XkxxkGcfcsEPyn1g")

## 重新设计的 AI 助手，更好地连接您和 Zilliz Cloud\{#ai-zilliz-cloud}

本次发布增强了 Zilliz Cloud AI 助手的界面设计和能力。直观的设计为您带来愉悦的用户体验，还为您带来了如下两项能力提升：

- **连接 Zilliz Cloud 技术支持**：AI 助手在与您的会话中会自动判断您是否需要人工协助，并为您提供联系人工协助的入口 。

- **发现潜在购买意向**：AI 助手在与您的会话中会自动判断您是否需要联系销售。在您提供必要信息后，我们会尽快与您取得联系。

![Y2xQbYjzwod3HDxCim7cbtFcnAb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Y2xQbYjzwod3HDxCim7cbtFcnAb.png "Y2xQbYjzwod3HDxCim7cbtFcnAb")

## 其它增强\{#}

- 提升了告警设计和告警历史信息展示方式。

- 优化了邀请注册和忘记密码的业务流程。

