---
title: "管理 Index | BYOC"
slug: /manage-indexes
sidebar_label: "管理 Index"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本教程将介绍如何通过 SDK 管理向量和标量索引。 | BYOC"
type: origin
token: VSiYw5CHMixHpIklpvgcTWMhngd
sidebar_position: 4
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 索引
  - index
  - AUTOINDEX
  - 向量索引
  - 标量索引

---

import Admonition from '@theme/Admonition';


# 管理 Index

本教程将介绍如何通过 SDK 管理向量和标量索引。

<Admonition type="info" icon="📘" title="说明">

<p>索引是否自动加载取决于你选择的 Collection 创建方式。Collection 和索引在以下情况中会自动加载：</p>
<ul>
<li><p><a href="./manage-collections-console">通过 Web 控制台创建 Collection</a></p></li>
<li><p><a href="/reference/create-collection">通过 RESTful API 创建 Collection</a></p></li>
<li><p><a href="./manage-collections-sdks">通过 SDK 定制化创建 Collection 并设置索引参数</a></p></li>
</ul>
<p>您也可以创建非自动加载的 Collection，并自行管理索引。</p>

</Admonition>

## 相关文档\{#contents}

本章节中，您将学习如何管理向量和标量索引。

import DocCardList from '@theme/DocCardList';

<DocCardList />