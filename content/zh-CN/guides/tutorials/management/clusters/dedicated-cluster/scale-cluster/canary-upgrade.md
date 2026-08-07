---
title: "金丝雀升级（Canary Upgrade） | Cloud"
slug: /canary-upgrade
sidebar_label: "金丝雀升级"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 对扩缩容操作使用 金丝雀升级 方法。平台会先在有限范围内验证目标配置，并在健康检查通过后逐步推出。 | Cloud"
type: origin
token: TzqKwQTo8iBmiYkVraHccZuCnie
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 金丝雀升级（Canary Upgrade）

Zilliz Cloud 对扩缩容操作使用 **金丝雀升级** 方法。平台会先在有限范围内验证目标配置，并在健康检查通过后逐步推出。

当你增加或减少 Query CU、变更 Replica 时，Zilliz Cloud 会在准备和验证新配置期间将集群置于 `Modifying` 状态。其目标是通过尽早发现问题，并限制每个推出步骤影响的范围，来降低服务影响。

## 金丝雀升级为什么重要\{#why-canary-upgrade-matters}

金丝雀升级专为扩缩容变更而设计。在这类变更中，平台需要先验证目标资源健康，再将变更广泛应用。

- 增加或减少 Query CU

- 增加或减少 Replica

- 通过手动扩缩容、定时扩缩容或动态扩缩容调整服务资源

| 收益 | 描述 |
| --- | --- |
| 初始影响范围小 | 新配置会先引入到有限范围内，因此潜在问题可以在变更扩大前被发现。 |
| 基于健康状态推进 | Zilliz Cloud 会检查就绪状态和服务健康状态，再进入下一步推出。 |
| 渐进式流量迁移 | 金丝雀阶段健康后，流量会逐步迁移，从而降低突然出现容量或延迟冲击的概率。 |
| 回滚路径 | 如果金丝雀未通过验证，Zilliz Cloud 可以停止推出，并继续使用之前可用的配置。 |

## 工作方式\{#how-it-works}

![SY6ObBG2aoPIDoxeEnCc8nHKnAc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/sy6obbg2aopidoxeencc8nhknac.png "SY6ObBG2aoPIDoxeEnCc8nHKnAc")

使用金丝雀升级的扩缩容操作通常遵循以下顺序。

| 阶段 | 发生的事情 |
| --- | --- |
| 之前的配置 | 扩缩容任务启动时，之前可用的配置会继续提供服务。 |
| 目标准备 | Zilliz Cloud 准备目标 Query CU 或 Replica 配置。 |
| 有限金丝雀 | 平台先在有限范围内验证新资源。 |
| 健康门禁 | 如果检查失败，推出会停止，集群继续使用之前可用的配置。 |
| 渐进式推出 | 如果检查通过，Zilliz Cloud 会以受控步骤扩大推出范围，直到扩缩容任务完成。 |

1. **保持之前的配置可用**
扩缩容任务启动时，集群会继续使用之前可用的配置提供服务。在此期间，集群可能进入 `Modifying` 状态。

1. **准备目标配置**
Zilliz Cloud 会供应并准备目标 Query CU 或 Replica 配置所需的资源。

1. **运行有限金丝雀**
平台先在有限范围内验证新资源。金丝雀阶段会检查新资源是否能够加载所需数据、恢复服务状态，并通过就绪和健康检查。

1. **观察金丝雀健康状态**
Zilliz Cloud 会监控金丝雀的就绪状态、服务健康状态和转换行为。如果金丝雀不符合预期健康标准，推出不会继续。

1. **渐进式推出变更**
金丝雀健康后，Zilliz Cloud 会扩大推出范围，并以受控步骤将服务流量迁移到目标配置。

1. **完成扩缩容任务**
当目标配置完全激活且健康后，扩缩容任务完成。不再需要的资源会在退出服务路径后被清理。

## 金丝雀升级与云原生存储\{#canary-upgrade-and-cloud-native-storage}

云原生存储让基于金丝雀的扩缩容更安全，因为持久化数据与计算资源相互分离。

在许多传统有状态系统中，新增节点要求现有节点将本地数据重新均衡到新节点。在此期间，现有节点必须同时服务在线流量并传输数据，这可能增加 CPU、内存、磁盘 I/O 和网络压力。

在 Zilliz Cloud 中，持久化数据存储在对象存储中。新资源可以在参与服务流量前独立加载所需数据。这使金丝雀阶段能够验证新资源，而不依赖现有服务节点作为本地数据传输来源。

## 扩缩容期间你可能注意到什么\{#what-you-may-notice-during-scaling}

在基于金丝雀升级的扩缩容操作期间：

- 集群状态可能会变为 `Modifying`。

- 当金丝雀被准备和验证时，现有服务通常会继续使用之前可用的配置运行。

- 部分管理操作可能暂时不可用。

- 当流量在推出阶段之间迁移时，可能出现轻微服务抖动。

- 只有扩缩容任务成功完成后，新配置才会生效。

- 如果金丝雀或后续推出阶段无法成功完成，集群会继续使用之前可用的配置。

- 扩缩容任务期间，Zilliz Cloud 会继续按之前的配置对集群计费。只有扩缩容任务成功完成后，新的 Query CU 或 Replica 配置才会用于计费。

<Admonition type="info" icon="📘" title="📘 注意">

金丝雀升级可以降低扩缩容期间的服务影响，但并不意味着每个操作都一定完全没有抖动。对于延迟敏感的生产工作负载，尽可能在低流量窗口执行重大扩缩容变更。

</Admonition>