---
title: "云服务提供商和地域 | Cloud"
slug: /cloud-providers-and-regions
sidebar_label: "云服务提供商和地域"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 支持阿里云、腾讯云、亚马逊云科技上的多个云服务商和区域。 | Cloud"
type: origin
token: BErdww1kOirndzkHrKoc2ibynlb
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 云服务提供商和地域

Zilliz Cloud 支持阿里云、腾讯云、亚马逊云科技上的多个云服务商和区域。

云地域支持情况可能因工作负载类型、部署选项和功能而异。创建项目前，请根据本文选择合适的云地域。

## 如何选择云地域\{#how-to-choose-a-cloud-region}

- 选择靠近应用或用户的地域。

- 考虑数据驻留和合规要求。

- 考虑延迟和跨地域数据传输影响。

- 检查目标地域是否支持所需功能。

- 如果所需地域或功能不可用，请[联系我们](https://zilliz.com.cn/all-regions#region-request)。

## 支持的云地域\{#supported-regions}

不同云地域对计算类型、部署方式和功能的支持情况可能不同。创建项目前，请先确认目标地域是否支持所需能力。

<Admonition type="info" title="说明">

如需 BYOC 部署，请[联系我们](http://zilliz.com.cn/contact-sales)。

</Admonition>

下表按云服务商列出支持的地域，并分别展示 Zilliz 托管云（SaaS）的 [Serving 集群](/docs/create-cluster)（分为 Free 和 Serverless、Dedicated）、[按需计算](/docs/on-demand-cluster)及 BYOC 的可用性。✅ 表示支持。

### 阿里云\{#alibaba-cloud}

<CloudRegions provider="alibaba" />

### 腾讯云\{#tencent-cloud}

<CloudRegions provider="tencent" />

### 亚马逊云科技\{#amazon-cn}

<CloudRegions provider="amazon-cn" />

## 云地域的功能支持情况\{#feature-support-by-cloud-region}

<CloudFeatures matrix="features" />

