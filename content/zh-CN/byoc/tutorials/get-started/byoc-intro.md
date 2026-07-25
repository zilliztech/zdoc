---
title: "BYOC 简介 | BYOC"
slug: /byoc-intro
sidebar_label: "BYOC 简介"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "BYOC 部署方案可以帮助有需要的组织在自己的云账户下托管应用和数据，而无须使用 Zilliz Cloud 提供的基础设施。该方案适合因特定安全合规要求而需要拥有完整数据主权的组织使用。 | BYOC"
type: origin
token: DOUbw9IGNidZoZk541EcxkH1nY7
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - BYOC

---

import Admonition from '@theme/Admonition';


# BYOC 简介

BYOC 部署方案可以帮助有需要的组织在自己的云账户下托管应用和数据，而无须使用 Zilliz Cloud 提供的基础设施。该方案适合因特定安全合规要求而需要拥有完整数据主权的组织使用。

<Admonition type="info" icon="📘" title="说明">

<p>Zilliz BYOC 部署方案目前处于<strong>正式可用</strong>阶段。如需了解详情或试用，请联系 <a href="https://zilliz.com.cn/contact-sales">Zilliz Cloud 技术支持</a>。</p>

</Admonition>

## 为何选择 Zilliz BYOC\{#why-use-zilliz-byoc}

Zilliz BYOC 提供了一种独特的完全托管式部署选项，让您在降低运营开销的同时，完全控制您的数据。该方案具有以下优势：

- **运维**

    - 您可以[联系我们](https://zilliz.com.cn/contact-sales)为您创建 BYOC 项目并完成基础设施的部署。

    - 您可以使用经过精细设计的指标体系和告警设置来监控项目中的 BYOC 集群。

- **扩缩容**

    - 您可以通过购买更多 License 的方式扩容您的 BYOC 项目。

    - BYOC 项目中的集群也支持手动和自动扩缩容。

- **数据管理和安全**

    - 提供组织级、项目级和集群级的基于角色的访问控制（RBAC）。

    - 所有的数据的存储和处理都在您指定的云账户中进行。

## 业务流程\{#how-it-works}

部署 Zilliz BYOC 除了需要在您的云环境中部署 Milvus 之外，还需要在 Zilliz 的云环境中部署由 Zilliz 管理的诸如升级业务流、资源调度器、开放 API以及控制台等后台服务。这样一来，数据的存放和处理都在您自有的基础设置中进行。

![D1sawFTYuhDAhPbaEvscp4QWnHf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/D1sawFTYuhDAhPbaEvscp4QWnHf.png)

根据上述架构图，您需要提供一个 VPC、一个对象存储桶以及以最小授权方式让 Zilliz Cloud 可以以您的身份在您的 VPC 中部署 K8S 集群及其它必要的组件，包括 Milvus Operator，数据导入和备份工具、包括 Grafana 及 Prometheus 等监控工具的监控栈以及 Milvus 实例。

另外，Zilliz Cloud 还在您的 VPC 和 Zilliz 之间建立了如下两层相互独立的通讯链路：

- **控制面**

    Zilliz Cloud 通过控制面与部署在您 VPC 中的组件进行通信，用于调度资源、升级Milvus实例，以及提供对 Zilliz Cloud 控制台和控制面开放 API 服务的访问。

- **数据面**

    您的应用程序/服务可以通过数据面与部署在您的 VPC 中的 Milvus 实例进行通信，管理数据存储和检索。

## 安全保障\{#security-assurance}

通过完善的加密策略和严格的访问控制来保障网络边界的通信安全。

### 网络安全\{#network-security}

- **内部流量**：集群安全组内允许所有 TCP/UDP 通信。

- **外部流量**：集群安全组外仅允许通过出站方向的 443 端口与安全组内进行加密通信，包括

    - 到 Zilliz Cloud 控制面的连接，以及

    - 访问数据源或镜像仓库等。

- **相同安全组策略**：同一安全组内，允许所有 TCP/UDP 通信。

### 访问控制\{#access-control}

- 为 Zilliz 技术支持工程师提供安全的 VPN 以及基于证书的即时认证能力。

- 每次访问需要单独审批并记录日志供后续审计。

- 控制面通过出站方向的 TCP 加密连接监控和收集数据面指标数据。

这些强有力的措施保护数据的完整性和保密性，确保在云端的安全可靠运行。

## 动态加密\{#encryption-in-transit}

客户端通过 HTTPS 或 gRPC 与 Zilliz Cloud 集群建立连接。在该连接上传输的数据均经过 AES-256 加密协议和 TLS 1.2（或更高）通讯协议完成动态加密。

### 静态加密\{#encryption-at-rest}

Zilliz Cloud 数据面使用 AES-256 算法对在对象存储中存储的数据进行加密。

## 成本管理\{#cost-management}

Zilliz BYOC 通过资源管理对您在 BYOC 项目中使用的服务收费。不过，您仍需承担云服务提供商的基础设施费用，如下图所示。

![NKdRwk2y3hwTbmbI5PtcRGiznR3](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/NKdRwk2y3hwTbmbI5PtcRGiznR3.png)

