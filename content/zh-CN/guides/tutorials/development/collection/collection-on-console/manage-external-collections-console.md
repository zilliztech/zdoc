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

import Procedures from '@site/src/components/Procedures';

# 管理 External Collection

本页介绍如何通过 Zilliz Cloud Web 控制台管理 External Collection。

## 创建 External Collection\{#create-an-external-collection}

开始之前，请确保您已创建 [External Volume](./external-volume)。

<Supademo id="cmpdu0ib10p9uqm8qfrtzqu8i" title=""  />

<Procedures>  

1. 进入目标项目，在左侧导航栏中选择 **按需计算资源** > **Database**。

1. 点击目标 Database 旁的 **...**，选择 **创建 Collection**。

1. 配置 Collection 名称和描述，并选择 **External** 作为 Collection 类型。

1. 在 **外部数据源** 区域，选择 **External Volume** 和数据格式，并按需填写 **路径前缀**。

1. 按需设置是否 **创建后自动刷新数据**。

1. 配置 Collection Schema，包括字段名称、外部字段映射、字段类型和向量维度。

1. 点击 **创建**。页面右上角出现 **Collection 已创建** 提示，即表示创建成功。

</Procedures>

<Admonition type="info" title="说明">

- 在按需计算 Database 中创建的 External Collection 不支持删除索引。

- 仅支持在按需计算场景下的 Database 中创建 External Collection。即将支持在 Serving Dedicated 集群中创建 External Collection。

<NextChannel action="include">

- 通过 `milvus://` 跨集群源创建外表当前仅支持 SDK 与 RESTful API，控制台暂不支持该源类型。

</NextChannel>

</Admonition>

## 刷新 Collection 数据\{#refresh-data}

![SSXSw4P7jhepf8bIQ8KcBuSrnch](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/SSXSw4P7jhepf8bIQ8KcBuSrnch.png)

<Procedures>  

1. 进入目标 External Collection 的详情页面。

1. 在 **概览** 页签的 **外部数据源** 区域，点击 **刷新**。

1. 阅读对话框中的说明，点击 **刷新**。

</Procedures>

## 开启 Query Mode\{#enable-query-mode}

 开始之前，请确保您已删除向量索引。

![Gy5ewhb7whmjEqbMnbGcWAAZnrc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Gy5ewhb7whmjEqbMnbGcWAAZnrc.png)

<Procedures>  

1. 进入目标 External Collection 的详情页面。

1. 在 **Overview** 页签中，打开 **Query Mode** 右侧的开关。

1. 阅读确认对话框中的说明，点击 **Enable**。

</Procedures>

## 删除 External Collection\{#drop-an-external-collection}

删除 External Collection 只会移除 Zilliz Cloud 中的 Schema、Manifest 和索引，您的数据仍会完整保留在对象存储中。

<Supademo id="cmpdubvzy0qcaqm8qwyypazbd" title=""  />

<Procedures>  

1. 进入目标 External Collection 的详情页面。

1. 点击 **操作**，在下拉菜单中选择 **删除**。

1. 在弹出的对话框中，输入 Collection 名称以确认删除，然后点击 **删除**。

1. 页面右上角出现成功提示，即表示 Collection 已删除。

</Procedures>