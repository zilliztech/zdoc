---
title: "安装 SDK | BYOC"
slug: /install-sdks
sidebar_label: "安装 SDK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本文介绍如何安装 Milvus SDK，以连接到 Zilliz Cloud 集群。 | BYOC"
type: origin
token: Jo4bwNi6zi4zlHkN2bWcewFYnDc
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - sdk

---

import Admonition from '@theme/Admonition';


# 安装 SDK

本文介绍如何安装 Milvus SDK，以连接到 Zilliz Cloud 集群。

Zilliz Cloud 提供托管式 Milvus 向量数据库服务。您可以按需安装以下语言的 SDK 以连接到集群：[Python](./install-sdks#install-pymilvus-python-sdk)、[Java](./install-sdks#install-java-sdk)、[Go](./install-sdks#install-go-sdk) 或 [Node.js](./install-sdks#install-nodejs-sdk)。

<Admonition type="info" icon="📘" title="说明">

<ul>
<li><p>Zilliz Cloud 会定期将您的集群升级到可兼容的最新版本。更多信息，请参见<a href="./organization-settings#set-up-maintenance-window">设置运维窗口</a>。升级后如果您无法使用最新版本的 SDK 连接到集群，请按照提示降级 SDK 到其他可兼容版本。运维完成后，我们会发送邮件通知，之后您便可以安全地升级 SDK。</p></li>
<li><p>下列所有 SDK 均提供了稳定版和 Beta 版，分别对应稳定版和 Beta 版集群。如果您将集群升级到了 Beta 版本，请同步升级您的 SDK 版本。</p></li>
</ul>

</Admonition>

## 安装 PyMilvus：Python SDK\{#install-pymilvus-python-sdk}

PyMilvus 是 Milvus 的 Python SDK。您可以在 [GitHub](https://github.com/milvus-io/pymilvus) 上找到相关源代码。

<Admonition type="info" icon="📘" title="说明">

<p>安装前，请确保您的 <strong>Python</strong> 版本在 <strong>3.8</strong> 以上。</p>

</Admonition>

执行以下命令，安装 PyMilvus：

```bash
# Install pymilvus compatible with Milvus v2.5.x
python -m pip install pymilvus==2.5.16

# Update PyMilvus to the newest version
python -m pip install --upgrade pymilvus

# Verify installation success
python -m pip list | grep pymilvus
```

如果您的集群兼容 **Milvus v2.6.x** 的公测版本，请将上述版本号由 `2.5.16` 修改为 `2.6.3`。

## 安装 Node.js SDK\{#install-nodejs-sdk}

要使用 Node.js SDK，建议您使用 `npm`（Node 包管理器）或 `yarn` 在项目中安装相关依赖。您可以在 [GitHub](https://github.com/milvus-io/milvus-sdk-node) 上找到相关源代码。

<Admonition type="info" icon="📘" title="说明">

<p>安装前，请确保您的 <strong>Node.js</strong> 版本在 <strong>14</strong> 以上。</p>

</Admonition>

```bash
# Install Node.js SDK compatible with Milvus v2.5.x
npm install @zilliz/milvus2-sdk-node@2.5.13
# Alternatively,
yarn add @zilliz/milvus2-sdk-node@2.5.13

# Upgrade to the latest version
npm update @zilliz/milvus2-sdk-node
# Alternatively,
yarn upgrade @zilliz/milvus2-sdk-node

# Verify installation
npm list | grep @zilliz/milvus2-sdk-node
# or
yarn list | grep @zilliz/milvus2-sdk-node
```

您可以将 SDK 以 CommonJS 模块或 ES6 模块导入到项目中。一般而言，对于使用`npm init`创建的项目，可以将 SDK 以 CommonJS 模块导入；对于使用`npm init es6`创建的项目，可以将 SDK 以 ES6 模块导入。

```javascript
// Import the SDK as a CommonJS module
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

// Import the SDK as a ES6 module
import { MilvusClient } from "@zilliz/milvus2-sdk-node"
```

如果您的集群兼容 **Milvus v2.6.x** 的公测版本，请将上述版本号由 `2.5.13` 修改为 `2.6.4`。

## 安装 Java SDK\{#install-java-sdk}

您可以使用 Apache Maven 或 Gradle / Grails 下载 Java SDK。您可以在 [GitHub](https://github.com/milvus-io/milvus-sdk-java) 找到相关源代码。

- Apache Maven

    只需将以下依赖项添加到 **pom.xml**：

    ```xml
    <!-- Install Java SDK compatible with Milvus v2.5.x -->
    <dependency>
         <groupId>io.milvus</groupId>
         <artifactId>milvus-sdk-java</artifactId>
         <version>2.5.14</version>
     </dependency>
    ```

- Gradle / Grails

    在 Shell 中执行以下命令：

    ```bash
    # Install Java SDK compatible with Milvus v2.5.x
    compile 'io.milvus:milvus-sdk-java:2.5.14'
    ```

如果您的集群兼容 **Milvus v2.6.x** 的公测版本，请将上述版本号由 `2.5.14` 修改为 `2.6.6`。

## 安装 Go SDK\{#install-go-sdk}

您可以通过 `go get` 安装 Go SDK。您可以在 [GitHub](https://github.com/milvus-io/milvus-sdk-go) 找到相关源代码。

```bash
# Install Go SDK compatible with Milvus v2.5.x
go get -u github.com/milvus-io/milvus-sdk-go/v2@v2.5.6
```

如果您的集群兼容 **Milvus v2.6.x** 的公测版本，请将上述版本号由 `2.5.6` 修改为 `2.6.1`。

## 相关文档\{#related-docs}

- [创建集群](./create-cluster-byoc)

- [创建 Collection](./manage-collections-sdks)

- [插入与删除](./insert-update-delete)

- [搜索与重排](./search-query-get)

