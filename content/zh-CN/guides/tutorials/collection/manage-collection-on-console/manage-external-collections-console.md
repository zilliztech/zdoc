---
title: "管理 External Collection | Cloud"
slug: /manage-external-collections-console
sidebar_label: "管理 External Collection"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本页介绍如何通过 Zilliz Cloud Web 控制台管理 External Collection。 | Cloud"
type: origin
token: EWblwBycHiR65UkifyDcJaCwnye
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 管理 External Collection

本页介绍如何通过 Zilliz Cloud Web 控制台管理 External Collection。

## 创建 External Collection\{#create-an-external-collection}

开始之前，请确保您已创建 [External Volume](./external-volume)。

<Supademo id="cmpdu0ib10p9uqm8qfrtzqu8i" title=""  />

<Admonition type="info" icon="📘" title="说明">

在按需计算 Database 中创建的 External Collection 不支持删除索引。

</Admonition>

## 刷新 Collection 数据\{#refresh-data}

![SSXSw4P7jhepf8bIQ8KcBuSrnch](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/SSXSw4P7jhepf8bIQ8KcBuSrnch.png)

## 开启 Query Mode\{#enable-query-mode}

 开始之前，请确保您已删除向量索引。

![Gy5ewhb7whmjEqbMnbGcWAAZnrc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Gy5ewhb7whmjEqbMnbGcWAAZnrc.png)

## 删除 External Collection\{#drop-an-external-collection}

删除 External Collection 只会移除 Zilliz Cloud 中的 Schema、Manifest 和索引，您的数据仍会完整保留在对象存储中。

<Supademo id="cmpdubvzy0qcaqm8qwyypazbd" title=""  />

