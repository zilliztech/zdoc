---
title: "SDKのインストール | BYOC"
slug: /install-sdks
sidebar_label: "SDKのインストール"
beta: FALSE
notebook: FALSE
description: "Milvus SDKをシームレスにインストールする方法を発見し、Zilliz Cloudクラスターへの効率的な接続を可能にします。 | BYOC"
type: origin
token: JBrKwDkmxia6kWkHn76cHnXonUf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - sdk
  - milvus
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search

---

import Admonition from '@theme/Admonition';


# SDKのインストール

Milvus SDKをシームレスにインストールする方法を発見し、Zilliz Cloudクラスターへの効率的な接続を可能にします。

## 概要について{#overview}

Zilliz Cloudは、管理されたMilvusベクトルデータベースをサービスとして提供しています。クラスター接続を容易にするために、4つのSDKオプションが存在します:[Python](./install-sdks#install-pymilvus-python-sdk)、[Java](./install-sdks#install-java-sdk)、[Go](./install-sdks#install-go-sdk)、または[Node. js](./install-sdks#install-nodejs-sdk)。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>Zilliz Cloudは、バージョンの互換性を確保するためにクラスターを一貫してアップグレードしています。詳細については、<a href="./organization-settings">組織の設定を管理する</a>の管理ページをご覧ください。SDKバージョンの不一致により接続に問題が発生した場合は、提供されたプロンプトに従って、互換性のあるSDKバージョンに戻してください。メンテナンス後、問題なくSDKをアップグレードできることをお知らせします。</p></li>
<li><p>以下のすべてのSDKは、安定版とベータ版の両方を提供しています。安定版は一般的なクラスター向けであり、ベータ版はベータクラスターに対応しています。クラスターをベータ版にアップグレードした場合は、S DKもベータ版にアップグレードしていることを確認してください。</p></li>
</ul>

</Admonition>

## PyMilvus: Python SDKのインストール{#install-pymilvus-python-sdk}

PyMilvusはMilvusのPython SDKです。[GitHubでソースコードに](https://github.com/milvus-io/pymilvus)アクセスしてください。

<Admonition type="info" icon="📘" title="ノート">

<p>インストールする前に、<strong>Python</strong>のバージョンが<strong>3.8</strong>を超えていることを確認してください。</p>

</Admonition>

```bash
# Install pymilvus compatible with Milvus v2.4.x
python -m pip install pymilvus==2.4.10

# Update PyMilvus to the newest version
python -m pip install --upgrade pymilvus

# Verify installation success
python -m pip list | grep pymilvus
```

## Node. jsSDKのインストール{#install-nodejs-sdk}

MilvusのNode. js SDKでは、**npm**または**yarn**を使用してください。[GitHubでソースコード](https://github.com/milvus-io/milvus-sdk-node)にアクセスしてください。

<Admonition type="info" icon="📘" title="ノート">

<p>インストールする前に、<strong>Node. js</strong>のバージョンが<strong>14</strong>以上であることを確認してください。</p>

</Admonition>

```bash
# Install Node.js SDK compatible with Milvus v2.4.x
npm install @zilliz/milvus2-sdk-node@2.4.9
# Alternatively,
yarn add @zilliz/milvus2-sdk-node@2.4.9

# Upgrade to the latest version
npm update @zilliz/milvus2-sdk-node
# Alternatively,
yarn upgrade @zilliz/milvus2-sdk-node

# Verify installation
npm list | grep @zilliz/milvus2-sdk-node
# or
yarn list | grep @zilliz/milvus2-sdk-node
```

このSDKはCommonJSまたはES 6モジュールとして使用できます。通常、`npm init`プロジェクトではCommonJSを使用します。`npm init es 6`プロジェクトではES 6が望ましいです。

```javascript
// Import the SDK as a CommonJS module
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

// Import the SDK as a ES6 module
import { MilvusClient } from "@zilliz/milvus2-sdk-node"
```

## JavaSDKのインストール{#install-java-sdk}

Apache MavenまたはGradle/Grailsを使用してSDKを入手してください。[GitHubでソースコードに](https://github.com/milvus-io/milvus-sdk-java)アクセスしてください。

- Apache Mavenの場合、`pom. xml`の依存関係にこれを追加してください

```xml
<!-- Install Java SDK compatible with Milvus v2.4.x -->
<dependency>
     <groupId>io.milvus</groupId>
     <artifactId>milvus-sdk-java</artifactId>
     <version>2.4.9</version>
 </dependency>
```

- Gradle/Grailsの場合、以下を実行してください:

```bash
# Install Java SDK compatible with Milvus v2.4.x
compile 'io.milvus:milvus-sdk-java:2.4.9'
```

## GoSDKダウンロード{#install-go-sdk}

Go SDKは`go get`を通じて利用可能です。[GitHubでソースコード](https://github.com/milvus-io/milvus-sdk-go)を探索してください。

```bash
# Install Go SDK compatible with Milvus v2.4.x
go get -u github.com/milvus-io/milvus-sdk-go/v2@v2.4.2
```

