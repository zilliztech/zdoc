---
title: "数据安全 | BYOC"
slug: /data-security
sidebar_label: "数据安全"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "数据安全是 Zilliz Cloud 不可或缺的一部分。本文档总结了 Zilliz Cloud 为全面保护您的数据而实施的关键措施和政策。 | BYOC"
type: origin
token: E7X4wc69bibTo4kFfNic5hBVnhb
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 数据安全

---

import Admonition from '@theme/Admonition';


# 数据安全

数据安全是 Zilliz Cloud 不可或缺的一部分。本文档总结了 Zilliz Cloud 为全面保护您的数据而实施的关键措施和政策。

## 账户与隐私保护\{#account-and-privacy-protection}

Zilliz Cloud 从您注册开始就通过以下方式保护您的数据：

- 使用先进的加密算法（SHA-256、bcrypt）。

- 坚持严格的政策，禁止内部存储用户名和密码。

## BYOC 中的 VPC 隔离\{#vpc-isolation-in-byoc}

Zilliz Cloud 在其 BYOC 解决方案中实现了您的 VPC 与 Zilliz Cloud 的 VPC 之间的隔离，以确保数据安全。有关详细信息，请参阅 [BYOC 简介](./byoc-intro)中的[安全保障](./byoc-intro#security-assurance)一节的内容。

## 数据隔离与驻留\{#data-isolation-residency}

Zilliz Cloud 为您的集群提供强大的隔离和保护：

- **多种数据驻留选项**：您可以在首选的云服务提供商和区域中创建集群。

- **专用命名空间**：每个专用集群都在一个具有定制网络策略的隔离命名空间中运行。

- **独立存储**：数据分别存储在专用对象存储桶中。

- **独立的VPC或子网**：**控制平面**（管理任务）和**数据平面**（操作处理）分别位于独立、相互隔离的 VPC 或子网中。

## 认证\{#authentication}

Zilliz Cloud 使用 OAuth0 进行安全的用户身份验证：

- 支持单点登录（SSO）。

- 支持多因素身份验证（MFA）。

- 通过 API 密钥和集群凭证提供集群访问权限。

详情请参考[用户鉴权](./authentication)。

## 访问控制\{#access-control}

细粒度和基于角色的访问控制：

- 分层权限（组织、项目、集群）。

- 预定义角色，简化权限分配。

- 控制台直观操作和应用程序的编程访问均可用。

详情请参考[访问控制](./access-control)。

## 安全网络访问\{#secure-network-access}

Zilliz Cloud 通过以下方式保障您的网络交互安全：

- **IP 白名单**：定义允许的 IP 地址范围（CIDR块）以限制访问。

- **私有链接**：在您的 VPC 和 Zilliz Cloud 控制面之间建立安全、私有的连接。

## 数据加密\{#data-encryption}

### 传输中\{#in-transit}

- 采用 TLS 1.2+ 的 HTTPS/gRPC。

- AES-256 加密确保数据传输安全。

### 存储时\{#at-rest}

- 磁盘/对象存储上存储的数据使用 AES-256（256 位高级加密标准）加密算法进行加密。

## 审计日志记录与监控\{#audit-logging-and-monitoring}

通过审计日志保持可见性和问责制：

- 记录控制平面和数据平面的活动。

- 直接将日志流式传输到您的存储解决方案。

- 利用第三方工具进行日志分析。

详情请参考[审计日志](./auditing)。

## 数据完整性和备份\{#data-integrity-and-backup}

确保数据可用性和恢复：

- 自动和手动备份选项。

- 回收站功能用于数据恢复（有规定的保留期）。

详情请参考[备份与恢复](./backup-and-restore)和[使用回收站](./use-recycle-bin)。

## 证书和 TLS\{#certificates-and-tls}

Zilliz Cloud 确保安全连接：

- 使用 Let's Encrypt 和 AWS 证书管理器来管理SSL证书。

- 在证书到期前 30 天自动续订（有效期：90天）。

- 仅支持 TLS 1.2 或更高版本。

<Admonition type="info" icon="📘" title="说明">

<p>目前尚不支持双向TLS（mTLS）。</p>

</Admonition>

## 总结\{#summary}

Zilliz Cloud 始终将数据安全作为首要任务，通过全面加密、严格认证、强大的访问控制、专用网络和持续审计实践来强化数据安全措施，帮助您维护数据的保密性、完整性和可用性。

