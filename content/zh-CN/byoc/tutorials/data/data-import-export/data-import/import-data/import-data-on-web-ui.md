---
title: "通过 Web 控制台导入 | BYOC"
slug: /import-data-on-web-ui
sidebar_label: "控制台"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本文介绍如何通过 Zilliz Cloud Web 控制台将数据导入现有 Collection 中。 | BYOC"
type: origin
token: BXBvwZh9Yiis0Vk8LcdcjZSPnQd
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 导入
  - 控制台

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 通过 Web 控制台导入

本文介绍如何通过 Zilliz Cloud Web 控制台将数据导入现有 Collection 中。

## 开始前\{#before-you-start}

请确保已完成以下步骤：

- 已创建集群。详情请参见[创建集群](./create-cluster-byoc)。

- 已按照格式准备需要导入的数据。更多详情，请参阅[支持的对象存储](./data-import-storage-options)和[支持的数据格式](./data-import-format-options)。

- 已创建 Collection，且该 Collection 的 Schema 与示例数据集相匹配。详情请参见[创建 Collection](./manage-collections-sdks)。

## 导入数据\{#import-data-on-the-web-ui}

数据文件准备好后，您可以直接从本地导入，也可以先将文件上传到对象存储桶（如阿里云 OSS），然后进行远程导入。

<Admonition type="info" icon="📘" title="说明">

<ul>
<li><p>在同一个 Collection 下，导入任务队列中最多可以同时包含 10 条运行中或等待中的任务。</p></li>
<li><p>Zilliz Cloud 界面支持上传本地 JSON 或 Parquet 文件的最大大小为 1 GB。 如需上传更大的文件，我们推荐通过对象存储桶进行导入。有关情况，可以查看<a href="./data-import-storage-options">支持的对象存储</a>。如果您在导入数据过程中遇到任何问题，请<a href="https://support.zilliz.com.cn/hc/zh-cn">提交工单</a>。</p></li>
</ul>

</Admonition>

### 导入本地文件\{#local-file}

Zilliz Cloud 支持上传本地 JSON 或 Parquet 文件。如果您的数据格式为 Numpy，请通过[对象存储桶](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket)进行导入。

要导入数据，您可以将本地文件拖放到上传区域中，或单击**上传文件**并选择文件。

<Supademo id="cme9uc5b54igsh3pyto6qzsep?utm_source=link" title=""  />

### 从对象存储桶中导入远程文件\{#remote-files-from-an-object-storage-bucket}

要导入远程文件，您需要先将其上传到远程存储桶。您可以使用[BulkWriter 工具](./use-bulkwriter)将原始数据转换为支持的格式并将结果文件上传。

上传准备好的文件到远程存储桶后，您只需选择对象存储服务，并填写文件所在路径及存储桶的访问凭证，Zilliz Cloud 将会从您的存储桶中拉取数据。

根据您的数据安全需求，在导入数据时可以选择使用长期凭证或会话令牌。

 有关获取凭证的更多信息，请参见：

- 阿里云：[获取单个或多个文件的 URL](https://help.aliyun.com/zh/oss/user-guide/how-to-obtain-the-url-of-a-single-object-or-the-urls-of-multiple-objects?spm=a2c4g.11186623.0.i18) 和[创建 Access Key](https://help.aliyun.com/zh/ram/user-guide/create-an-accesskey-pair)。

- 腾讯云：[导出对象 URL](https://www.tencentcloud.com/zh/document/product/436/42391) 和[临时密钥生成及使用指引](https://cloud.tencent.com/document/product/598/40488)。

- 亚马逊云科技：[使用预签名 URL 共享对象](https://docs.amazonaws.cn/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html)和[使用长期凭证进行身份验证](https://docs.amazonaws.cn/sdkref/latest/guide/access-iam-users.html)。

根据您的数据安全需求，您也可以使用 [临时 Token](/docs/faq-data-import#can-i-use-session-tokens-when-importing-data-from-an-object-storage-service)。

<Supademo id="cme9ujdvy023mz40hswufsrd8?utm_source=link" title=""  />

## 结果验证\{#verify-the-result}

单击**导入**后，Zilliz Cloud 会生成一条导入任务。您可以前往[任务中心](./view-activities)查看导入进度及任务详情。

## 支持的导入路径\{#supported-object-paths}

关于导入路径需遵循的格式要求，可查看[支持的对象存储](./data-import-storage-options)。

## 推荐阅读\{#related-topics}

- [支持的对象存储](./data-import-storage-options)

- [支持的数据格式](./data-import-format-options)

- [使用 BulkWriter](./use-bulkwriter)

- [通过 RESTful API 导入](./import-data-via-restful-api)

- [通过 SDK 导入](./import-data-via-sdks)

