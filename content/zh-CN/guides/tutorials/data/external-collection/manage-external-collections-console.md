---
title: "管理 External Collection | Cloud"
slug: /manage-external-collections-console
sidebar_key: manage-external-collections-console
sidebar_label: "控制台"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: PUBLIC
notebook: FALSE
description: "本页介绍如何通过 Zilliz Cloud Web 控制台管理 External Collection。 | Cloud"
type: origin
token: EWblwBycHiR65UkifyDcJaCwnye
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 管理
  - external collection
  - collections

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 管理 External Collection

本页介绍如何通过 Zilliz Cloud Web 控制台管理 External Collection。

## 创建 External Collection\{#create-an-external-collection}

开始之前，请确保您已创建 [External Volume](./external-volume)。

<Supademo id="cmokttyiy05dxpimdm3d8vnxv" title=""  />

<Admonition type="info" icon="📘" title="说明">

在按需计算 Database 中创建的 External Collection 不支持删除索引。

</Admonition>

## Refresh 数据\{#refresh-data}

![SSXSw4P7jhepf8bIQ8KcBuSrnch](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/SSXSw4P7jhepf8bIQ8KcBuSrnch.png)

## 开启 Query Mode\{#enable-query-mode}

 开始之前，请确保您已删除向量索引。

![Gy5ewhb7whmjEqbMnbGcWAAZnrc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Gy5ewhb7whmjEqbMnbGcWAAZnrc.png)

## 删除 External Collection\{#drop-an-external-collection}

删除 External Collection 只会移除 Zilliz Cloud 中的 Schema、Manifest 和索引，您的数据仍会完整保留在对象存储中。

<Supademo id="cmokvd5hr06grpimd8ugly112" title=""  />

