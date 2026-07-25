---
title: "版本说明书（2023/06/14） | Cloud"
slug: /release-notes-200
sidebar_key: release-notes-200
sidebar_label: "2023/06/14"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 2.0.0 的发布为向量数据库管理设立了新的标准。它大大增强了初学者的用户体验，提供了更实惠和灵活的定价选项，实现了无缝的团队协作，并提供了灵活的模式管理。这次更新的主要特性包括多样化的订阅方案、全新的 CU 类型、组织和协作支持、RBAC 支持、动态 Schema 和 JSON 类型支持。今天就试试这个改变游戏规则的更新吧! | Cloud"
type: origin
token: X91KwMsQyiAv1Ukze3IcHxQgnic
sidebar_position: 27
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2023/06/14）

Zilliz Cloud 2.0.0 的发布为向量数据库管理设立了新的标准。它大大增强了初学者的用户体验，提供了更实惠和灵活的定价选项，实现了无缝的团队协作，并提供了灵活的模式管理。这次更新的主要特性包括多样化的订阅方案、全新的 CU 类型、组织和协作支持、RBAC 支持、动态 Schema 和 JSON 类型支持。今天就试试这个改变游戏规则的更新吧!

## Milvus 兼容性\{#milvus}

此次发布兼容 **Milvus 2.1.x**。

## Zililz Cloud 订阅方案：企业版和专有部署\{#zilliz-cloud-plan-tiers}

我们很高兴为中国用户提供企业版和专有部署两种订阅方案。每个方案都经过精心设计，以平衡成本、服务和安全方面的考虑，以确保满足每个用户的需求。通过Zilliz Cloud，您可以根据业务的发展需求灵活地管理您的向量数据库。

- **企业版**专为大型企业或组织提供高用可、数据安全和专家技术支持的订阅方案。通过阿里云提供的公有云服务向用户提供具有完整功能和高级配置的专用集群。

- **专有部署**是注重数据安全与合规管理的企业的理想选择。Zilliz Cloud 可在你的虚拟私有云（VPC）内提供完全由您管理的向量数据库服务。

前往[定价](https://zilliz.com/pricing)页面了解更多。

## 全新的 CU 类型\{#cost-optimized-compute-unit-cu}

CU 是用于数据并行处理的计算资源的基本计量单位。Zilliz Cloud 提供**性能型**、**容量型**和**经济型**三种 CU 供您选择。

- **性能型**：适用于需要低延迟和高吞吐量的向量相似性检索场景。您对延迟有较高要求，性能型 CU 是一个合适的选择。因为性能型 CU 不仅可以提供更快速的响应，而且可以同时处理更多的请求。

- **容量型**：专为在固态硬盘（SSD）上搜索海量数据设计，相比性能型 CU 能够存储多 5 倍的数据，但延迟可能会增加。如果您需要处理大量数据，可以考虑选择容量型 CU。

- **经济型**：适用于需要节约成本的场景。经济型 CU 的存储容量与容量型相同，可存储约5 百万 768 维向量。但经济型 CU 的价格比容量型 CU 的价格低 30％。这意味着您可以以更低的价格使用向量数据库处理大型数据集。如果您预算有限且对延迟或查询吞吐量的要求不高，可以考虑选择经济型 CU。

想了解如何选择合适的计算单元，请前往[选择合适的 CU 类型](./cu-types-explained)页面了解更多。

## 组织管理、项目协作和访问控制\{#organization-collaboration-and-rbac}

Zilliz Cloud现在提供灵活的组织和成员管理功能，允许组织成员在不同层级（如集群、项目和组织）之间无缝协作。基于角色的访问控制使您能够精确控制用户对资源的访问权限，既保证了团队协作的灵活性，又确保了高级别的数据安全能力。

想了解更多如何使用上述特性达成安全有序的管理目标，请前往[访问控制概览](./access-control-overview)了解更多。

## Partition Key\{#partition-key}

Zilliz Cloud 的 Partition Key 特性允许您在创建 Collection 时指定一个字段作为 Partition Key，这样在插入数据时，Zilliz Cloud 会根据每条数据在该字段上的取值自动将数据存储在指定的 Partition 中。
这个特性特别适用于查询过滤场景。由于具有相同 Partition Key 的实体会被存储在相近的位置，这样在查询时就可以避免不必要的扫描。因此，基于 Partition Key 字段的条件查询执行起来比传统的基于扫描过滤的查询要快得多。

## 动态 Schema\{#dynamic-schema}

Zilliz Cloud 提供的动态 Schema 特性将极大地提升 Zilliz Cloud 集群在应对复杂业务场景时的灵活性。现在，用户可以在无需预先定义Schema的情况下，动态地向 Collection 中插入各种类型的字段。
对于高级用户而言，Zilliz Cloud 允许您在一个 Collection 中同时使用动态和静态字段。您可以在设计 Schema 时将静态字段作为必选字段，并通过动态 Schema 机制引入一些可选字段，从而优化索引、提升查询性能，并保持 Schema 的灵活性。

想了解更多关于动态 Schema 的内容，请阅读[Dynamic Field](./enable-dynamic-field)。

## JSON 数据类型\{#json-type-support}

JSON 是一种在数据管理中经常使用的重要的数据交换格式，因此，我们在 Zilliz Cloud 集群中引入了对 JSON 的支持。现在，您可以在您的 Zilliz Cloud 集群中轻松地存储和管理您的 JSON 数据。
相信 Zilliz Cloud 集群提供的相似近邻搜索功能结合灵活的JSON数据格式，将为您带来全新的搜索体验。

想了解关于 JSON 数据类型的更多内容，请阅读[JSON 类型](./use-json-fields)。