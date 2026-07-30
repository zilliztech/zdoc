---
title: "Zilliz Cloud IP | BYOC"
slug: /zilliz-cloud-ips
sidebar_label: "Zilliz Cloud IP"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 使用一组固定的 IP 地址从您的数据源中拉取数据，并将其发送到目标集群。为了确保 Zilliz Cloud 能够执行此操作，您需要在防火墙中将这些 IP 地址添加到安全列表中： | BYOC"
type: origin
token: J86AwNi3midzR9kqgbHcnX14ntc
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud IP

Zilliz Cloud 使用一组固定的 IP 地址从您的数据源中拉取数据，并将其发送到目标集群。为了确保 Zilliz Cloud 能够执行此操作，您需要在防火墙中将这些 IP 地址添加到安全列表中：

- Zilliz Cloud 服务 IP 地址

- 目标集群所在云地域的 IP 地址

## Zilliz Cloud 服务 IP 地址\{#zilliz-cloud-ip}

这些 IP 地址由 Zilliz Cloud 用于提供服务，请确保将它们添加到防火墙的安全列表中。

| 云地域 | 位置 | IP 地址（CIDR） |
| --- | --- | --- |
| cn-hangzhou | 华东1（杭州） | `114.55.232.32` |

## 目标集群所在云地域 IP 地址\{#ip}

将目标 Zilliz Cloud 集群所在云服务提供商和地域对应的 IP 地址加入安全列表。

### 阿里云\{#}

| 云地域 | 位置 | IP 地址（CIDR） |
| --- | --- | --- |
| cn-hangzhou | 华东1（杭州） | `114.55.232.32` |
| cn-beijing | 华北2（北京） | `39.105.24.167` |
| cn-shenzhen | 华南1（深圳） | `47.107.39.14` |
| cn-shanghai | 华东2（上海） | `47.117.150.202` |
| us-east | 美国（弗吉尼亚） | `47.253.55.20` |
| ap-southeast-1 | 新加坡 | `47.237.71.220` |

### 腾讯云\{#}

| 云地域 | 位置 | IP 地址（CIDR） |
| --- | --- | --- |
| ap-beijing | 华北地区（北京） | `82.156.105.162` |
| ap-shanghai | 华东地区（上海） | `124.222.234.127` |
| na-ashburn | 美国东部（弗吉尼亚） | `43.130.121.239` |

### 亚马逊云科技\{#}

| 云地域 | 位置 | IP 地址（CIDR） |
| --- | --- | --- |
| cn-northwest-1 | 中国（宁夏） | `43.192.24.37` |

