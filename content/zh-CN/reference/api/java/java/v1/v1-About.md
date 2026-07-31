---
title: "关于 | Java | v1"
slug: /java/v1-About
sidebar_label: "关于"
beta: NEAR DEPRECATE
notebook: FALSE
description: "Milvus Java SDK 是一个开源项目，其源代码托管在 GitHub 上。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#doxcnwl3WAzrojyyvlllUicOGBd
sidebar_position: 1
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# 关于

Milvus Java SDK 是一个开源项目，其源代码托管在 [GitHub](https://github.com/milvus-io/milvus-sdk-java) 上。

<Admonition type="caution" title="已弃用">
  Java SDK v1 API（旧版 `io.milvus` 包）已弃用。新开发请使用 [Java SDK v2](./v2)。
</Admonition>

## **兼容性**\{#compatibility}

<table>
    <tr>
        <th><p>Milvus 版本</p></th>
        <th><p>推荐的 SDK 版本</p></th>
    </tr>
    <tr>
        <td><p>2.0.2</p></td>
        <td><p>2.0.4</p></td>
    </tr>
    <tr>
        <td><p>2.1</p></td>
        <td><p>2.1.0-beta4</p></td>
    </tr>
    <tr>
        <td><p>2.2.0 ~ 2.2.8</p></td>
        <td><p>2.2.5</p></td>
    </tr>
    <tr>
        <td><p>2.2.9 ~ 2.2.14</p></td>
        <td><p>2.2.13</p></td>
    </tr>
    <tr>
        <td><p>2.3.x</p></td>
        <td><p>2.3.9</p></td>
    </tr>
    <tr>
        <td><p>2.4.x</p></td>
        <td><p>2.4.3</p></td>
    </tr>
    <tr>
        <td><p>2.5.x</p></td>
        <td><p>2.5.15</p></td>
    </tr>
    <tr>
        <td><p>2.6.x</p></td>
        <td><p>2.6.18</p></td>
    </tr>
</table>

## **安装**\{#installation}

您可以使用 **[Apache Maven](https://maven.apache.org/install.html)** 或 **[Gradle](https://gradle.org/install/)** 下载 SDK。

- Apache Maven

```xml
 <dependency>
     <groupId>io.milvus</groupId>
     <artifactId>milvus-sdk-java</artifactId>
     <version>2.6.18</version>
 </dependency>
```

- Gradle/Groovy

```plaintext
implementation 'io.milvus:milvus-sdk-java:2.6.18'
```

- Gradle/Kotlin

```sql
implementation("io.milvus:milvus-sdk-java:2.6.18")
```

## **贡献**\{#contributing}

我们致力于为 Milvus 构建一个协作开放、充满活力的开源社区。因此，欢迎所有人参与 Milvus Java SDK 的贡献。在为此项目做出贡献之前，请参阅[贡献指南](https://github.com/milvus-io/milvus-sdk-java/blob/master/CONTRIBUTING.md)。如果您需要任何帮助或希望提出自己的想法，可以[提交 issue](https://github.com/milvus-io/milvus-sdk-java/issues/new)。
