---
title: "版本说明书（2025/02/07） | Cloud"
slug: /release-notes-2130
sidebar_key: release-notes-2130
sidebar_label: "2025/02/07"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Milvus 2.5.x 的相关特性在 Zilliz Cloud 进行公测阶段。本次发布在语义检索的基础上引入了全文搜索能力。通过对 BM25 及稀疏向量的支持，为您提供更好地检索和存储性能。全文搜索功能允许您在搜索请求中直接传入查询文本，而无须提前将其转换成对应的向量表示。另外，本次更新针对上传大量小文件导致的性能问题做了性能优化。 | Cloud"
type: origin
token: Jv0uwMRw4iQvOtkCkRNcXeAjnpd
sidebar_position: 13
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2025/02/07）

Milvus 2.5.x 的相关特性在 Zilliz Cloud 进行公测阶段。本次发布在语义检索的基础上引入了全文搜索能力。通过对 BM25 及稀疏向量的支持，为您提供更好地检索和存储性能。全文搜索功能允许您在搜索请求中直接传入查询文本，而无须提前将其转换成对应的向量表示。另外，本次更新针对上传大量小文件导致的性能问题做了性能优化。

## Milvus 兼容性\{#milvus-compatibility}

本次发布后创建的所有集群均兼容 **Milvus v2.4.x**。

如果您希望体验 **Milvus v2.5.x** 的各项新功能，可以考虑在集群详情页面单击**试用公测版新功能**将您的集群升级到**公测版**。

![C9L6b0vgpodxLHxVBF7cZgoCn2d](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/C9L6b0vgpodxLHxVBF7cZgoCn2d.png "C9L6b0vgpodxLHxVBF7cZgoCn2d")

## Zilliz Cloud 公测版现已支持 Milvus 2.5，引入全文搜索能力\{#zilliz-cloud-now-supports-milvus-25-in-public-preview-introducing-full-text-search}

Zilliz Cloud 公测版集群兼容 **Milvus v2.5.x**，引入了一个重要的新功能：**全文搜索**。该功能与关键字搜索类似，允许您通过查找其中的特定单词或短语来查找文档，如同您在Google上进行搜索。该功能补充了我们现有的语义搜索功能，弥补了专注基于语义搜索的不足，可以更加精准的匹配文档中的关键词。

该功能基于**业界标准的 BM25 算法**实现，并结合**稀疏向量**对文档的相似性进行评分，为您提供更好地检索和存储性能。简单来说，一个稀疏向量如同表格中的一行记录，该记录中的大多数单元格为空，只有少多单元格中包含数据。使用稀疏向量来表示文本，能够让语义检索更有效率。这也契合了 Milvus 使用基于向量进行检索的核心思想。

在 Milvus 中引入全文搜索能力，可以让**您直接插入和查询文本，而无须提前将其转换成对应的向量表示**。这也让 Zilliz Cloud 向全功能非结构化数据处理平台的努力更进了一步。

关于全文搜索的相关功能介绍，可以参考[全文搜索](./full-text-search)。

## 其它功能增强\{#enhancements}

**支持大规模小文件导入**：针对数据导入时上传大量小文件的场景进行了专门性能优化，保证了高效快捷的数据导入体验。