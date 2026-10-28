---
title: "Zilliz Cloud IP | Cloud"
slug: /zilliz-cloud-ips
sidebar_label: "Zilliz Cloud IP"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 使用一组固定的 IP 地址从您的数据源中拉取数据，并将其发送到目标集群。为了确保 Zilliz Cloud 能够执行此操作，您需要在防火墙中将这些 IP 地址添加到安全列表中： | Cloud"
type: origin
token: J86AwNi3midzR9kqgbHcnX14ntc
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud IP

Zilliz Cloud 使用一组固定的 IP 地址从您的数据源中拉取数据，并将其发送到目标集群。为了确保 Zilliz Cloud 能够执行此操作，您需要在防火墙中将这些 IP 地址添加到安全列表中：

- Zilliz Cloud 服务 IP 地址

- 目标集群所在云地域的 IP 地址

## Zilliz Cloud 服务 IP 地址\{#zilliz-cloud-service-ip-addresses}

<RegionIps scope="service" />

## 目标集群所在云地域 IP 地址\{#target-cluster-region-ip-addresses}

将目标 Zilliz Cloud 集群所在云服务提供商和地域对应的 IP 地址加入安全列表。

### 阿里云\{#aliyun}

<RegionIps provider="alibaba" />

### 腾讯云\{#tencent-cloud}

<RegionIps provider="tencent" />

### 亚马逊云科技\{#amazon}

<RegionIps provider="amazon-cn" />

