---
title: "版本说明书（2025/01/09） | Cloud"
slug: /release-notes-2120
sidebar_key: release-notes-2120
sidebar_label: "2025/01/09"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "在本次发布中，Zilliz Cloud 推出了预付费订阅计划，旨在帮助财务审批流程复杂的企业客户简化采购流程，确保业务顺畅运行；新创建的 Collection 根据订阅计划和集群类型采用不同的全局 mmap 策略，Dedicated 集群还支持针对特定列自定义原始数据和索引的 mmap 策略，提升搜索性能并扩展容量；Dedicated 集群现支持创建 Database，并在 Collection 级别实现基于角色的访问控制（RBAC），助力数据管理和多租户方案；此外，新增十级召回率调优和召回率估算功能，方便优化搜索参数，提升搜索精度与性能。 | Cloud"
type: origin
token: YLFKwQdzAiyVxckcvcecQ4DPnKf
sidebar_position: 14
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2025/01/09）

在本次发布中，Zilliz Cloud 推出了预付费订阅计划，旨在帮助财务审批流程复杂的企业客户简化采购流程，确保业务顺畅运行；新创建的 Collection 根据订阅计划和集群类型采用不同的全局 mmap 策略，Dedicated 集群还支持针对特定列自定义原始数据和索引的 mmap 策略，提升搜索性能并扩展容量；Dedicated 集群现支持创建 Database，并在 Collection 级别实现基于角色的访问控制（RBAC），助力数据管理和多租户方案；此外，新增十级召回率调优和召回率估算功能，方便优化搜索参数，提升搜索精度与性能。

## Milvus 兼容性\{#milvus-compatibility}

本次发布后创建的所有集群均兼容 **Milvus v2.4.x**。

## 全新的预付费包年订阅计划\{#pre-paid-subscription}

Zilliz Cloud 新版本正式推出了：预付费包年集群和订单管理功能，旨在帮助财务审批流程复杂的企业客户简化采购流程，确保业务顺畅运行。用户在创建集群时，可以选择购买“包年集群”，支持1年和3年的预付费选项，购买一年可享7折优惠，购买三年则享5折优惠。这种包年方式为客户提供了更具成本效益的选择，特别适合业务稳定的情况。此外，本次更新引入了订单体系。用户提交订单后，可以在控制台中轻松查询和管理订单记录。该系统为包年相关的购买和续费提供了消费记录查询功能，大大便利了用户的财务管理。

## 增加 Database 层级支持\{#support-for-database-layer}

您现在可以在集群中创建 Database，并在 Database 中创建 Collection。让您的数据管理体验更有效率，还为您的多租户方案提供更多选择。Database 作为组织和管理数据的逻辑层，用户可以通过创建多个 Database 为不同的应用和租户实现逻辑上的数据隔离，进一步保障数据安全。更多内容，可以参考 [Database](./database)。

## 增加 mmap 支持，扩展 Collection 容量\{#mmap-support-for-expanded-data-capacity}

本次发布还带来了 `mmap` 支持，最高可以将现有 Collection 的容量提高三倍。该功能允许您通过内存映射的方式访问存储在磁盘上的大体积文件，从而让 Zilliz Cloud 集群可以有选择地将加载后的 Collection 中各字段的索引和原始数据存放在内存和磁盘中，让您可以根据数据访问频率决定数据存放位置，在保证搜索性能的同时，极大的扩展了 Collection 的容量。

对于 Dedicated 用户而言，Zilliz Cloud 允许您根据工作负载需要对高频访问的向量和标量字段上执行的 `mmap` 设置进行灵活调整。更多内容，可以参考[使用 mmap](./use-mmap)。

## 增加 Collection 层级的 RBAC 支持\{#collection-level-rbac-support}

本次发布还引入了对 Collection 层级 RBAC 的支持，通过在 Collection 层级管理不同用户的权限，进一步增强您的多租户方案的隔离能力。 

Zilliz Cloud 在 Collection 层级提供了如下权限组：

- **CollectionReadOnly (COLL_RO)**：授予指定 Collection 数据的只读权限。

- **CollectionReadWrite (COLL_RW)**：授予指定 Collection 数据的读写权限。

- **CollectionAdmin (COLL_ADMIN)**：授予指定 Collection 数据的读写权限以及 Collection 的管理权限。

更多内容，可以参考 [Collection 层级权限组](./cluster-privileges#collection-level-privilege-groups)。

## 高精度向量搜索\{#high-recall-rate}

Zilliz Cloud 在 Search 操作中引入了一个新参数 `level`，增加了召回精度调节范围。该参数取值范围为 `1` 到 `10`，默认值为 `1`。调整该参数可以让您在召回率和向量搜索性能间找到一个平衡。

- 默认值（`level=1`）：在典型场景中支持 90% 以上的召回率，同时保持高优向量搜索性能。

- 高精度搜索（`level=[6, 10]`）：对于有高召回率要求（如 99% 或更高）的场景，您可以通过在 `6` 到 `10` 之间滑动该参数的取值来进行调优。对于性能不敏感场景，可以考虑将该值设置为 `10`。

您可以根据实际需要灵活调整向量搜索行为，从而达成搜索精度和搜索性能之间的平衡。更多内容，可以参考[使用 'level' 参数](./single-vector-search#use-level)。

## 估算召回率\{#recall-rate-estimation}

在提供高召回向量搜索的同时，Zilliz Cloud 还引入了搜索时召回率预估能力。通过在 Search 请求中将 `enable_recall_calculation` 参数设置为 `true`，可以在获取搜索结果的同时得到 Zilliz Cloud 针对本次搜索估算的召回率。

通过结合召回率估算功能和 `level` 参数的设置，您可以轻松的完成对向量搜索召回率的调优。更多内容，可以参考[查看召回率](./single-vector-search#get-recall-rate)。