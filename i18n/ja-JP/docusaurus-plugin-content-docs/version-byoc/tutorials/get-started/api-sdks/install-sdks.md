---
title: "SDK のインストール | BYOC"
slug: /install-sdks
sidebar_label: "SDK のインストール"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud クラスターへの効率的な接続を可能にする、Milvus SDK をシームレスにインストールする方法を発見してください。 | BYOC"
type: origin
token: J274wT61xiEM4fkYeL8cMb4Pnbd
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - sdk
  - milvus
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction

---

import Admonition from '@theme/Admonition';


# SDK のインストール

Zilliz Cloud クラスターへの効率的な接続を可能にする、Milvus SDK をシームレスにインストールする方法を発見してください。

## 概要\{#overview}

Zilliz Cloud は、マネージド Milvus ベクトルデータベースをサービスとして提供しています。クラスター接続を容易にするための4つの SDK オプションがあります：[Python](./install-sdks#install-pymilvus-python-sdk)、[Java](./install-sdks#install-java-sdk)、[Go](./install-sdks#install-go-sdk)、または[Node.js](./install-sdks#install-nodejs-sdk)。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz Cloud は、バージョン互換性を確保するためにクラスターを常にアップグレードしています。詳細は、<a href="./organization-settings">組織設定の管理</a>ページを参照してください。SDK バージョンの不一致により接続の問題が発生した場合は、提供されたプロンプトに従い、互換性のある SDK バージョンに戻してください。メンテナンス後、SDK をアップグレードできます。</p></li>
<li><p>以下に示すすべての SDK は、安定バージョンとベータバージョンの両方を提供しています。安定バージョンは通常のクラスター用であり、ベータバージョンはベータクラスターに対応しています。クラスターをベータバージョンにアップグレードした場合は、SDK もベータバージョンにアップグレードしていることを確認してください。</p></li>
</ul>

</Admonition>

## PyMilvus：Python SDK のインストール\{#install-pymilvus-python-sdk}

PyMilvus は Milvus の Python SDK です。[GitHub 上のソースコード](https://github.com/milvus-io/pymilvus) にアクセスしてください。

<Admonition type="info" icon="📘" title="Notes">

<p>インストール前に、<strong>Python</strong> バージョンが <strong>3.8</strong> 以上であることを確認してください。</p>

</Admonition>

```bash
# Milvus v2.5.x に対応する pymilvus をインストール
python -m pip install pymilvus==2.5.16

# PyMilvus を最新バージョンに更新
python -m pip install --upgrade pymilvus

# インストール成功を確認
python -m pip list | grep pymilvus
```

クラスターが **Milvus v2.6.x (パブリックプレビュー)** に対応している場合は、上記コマンドの `2.5.16` を `2.6.3` に変更してください。

## Node.js SDK のインストール\{#install-nodejs-sdk}

Milvus の Node.js SDK には、**npm** または **yarn** を使用してください。[GitHub 上のソースコード](https://github.com/milvus-io/milvus-sdk-node) にアクセスしてください。

<Admonition type="info" icon="📘" title="Notes">

<p>インストール前に、<strong>Node.js</strong> バージョンが <strong>14</strong> 以上であることを確認してください。</p>

</Admonition>

```bash
# Milvus v2.5.x に対応する Node.js SDK をインストール
npm install @zilliz/milvus2-sdk-node@2.5.13
# または、
yarn add @zilliz/milvus2-sdk-node@2.5.13

# 最新バージョンにアップグレード
npm update @zilliz/milvus2-sdk-node
# または、
yarn upgrade @zilliz/milvus2-sdk-node

# インストールを確認
npm list | grep @zilliz/milvus2-sdk-node
# または
yarn list | grep @zilliz/milvus2-sdk-node
```

この SDK は、CommonJS または ES6 モジュールとして使用できます。通常、`npm init` プロジェクトでは CommonJS を使用し、`npm init es6` では ES6 の方が好ましいです。

```javascript
// SDK を CommonJS モジュールとしてインポート
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

// SDK を ES6 モジュールとしてインポート
import { MilvusClient } from "@zilliz/milvus2-sdk-node"
```

クラスターが **Milvus v2.6.x (パブリックプレビュー)** に対応している場合は、上記コマンドの `2.5.13` を `2.6.4` に変更してください。

## Java SDK のインストール\{#install-java-sdk}

Apache Maven または Gradle/Grails を使用して SDK を取得してください。[GitHub 上のソースコード](https://github.com/milvus-io/milvus-sdk-java) を参照してください。

- Apache Maven の場合は、`pom.xml` 依存関係に以下を追加してください：

    ```xml
    <!-- Milvus v2.5.x に対応する Java SDK をインストール -->
    <dependency>
         <groupId>io.milvus</groupId>
         <artifactId>milvus-sdk-java</artifactId>
         <version>2.5.14</version>
     </dependency>
    ```

- Gradle/Grails の場合は、以下を実行してください：

    ```bash
    # Milvus v2.5.x に対応する Java SDK をインストール
    compile 'io.milvus:milvus-sdk-java:2.5.14'
    ```

クラスターが **Milvus v2.6.x (パブリックプレビュー)** に対応している場合は、上記コマンドの `2.5.14` を `2.6.6` に変更してください。

## Go SDK のインストール\{#install-go-sdk}

Go SDK は `go get` 経由で入手できます。[GitHub 上のソースコード](https://github.com/milvus-io/milvus-sdk-go) を参照してください。

```bash
# Milvus v2.5.x に対応する Go SDK をインストール
go get -u github.com/milvus-io/milvus-sdk-go/v2@v2.5.6
```

クラスターが **Milvus v2.6.x (パブリックプレビュー)** に対応している場合は、上記コマンドの `2.5.6` を `2.6.1` に変更してください。