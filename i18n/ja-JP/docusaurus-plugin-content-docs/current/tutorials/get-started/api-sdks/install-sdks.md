---
title: "SDKのインストール | Cloud"
slug: /install-sdks
sidebar_label: "SDKのインストール"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudクラスターへの効率的な接続を可能にするMilvus SDKをシームレスにインストールする方法を発見してください。 | Cloud"
type: origin
token: J274wT61xiEM4fkYeL8cMb4Pnbd
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - sdk
  - milvus
  - rag llm architecture
  - private llms
  - nn search
  - llm eval

---

import Admonition from '@theme/Admonition';


# SDKのインストール

Zilliz Cloudクラスターへの効率的な接続を可能にするMilvus SDKをシームレスにインストールする方法を発見してください。

## 概要\{#overview}

Zilliz Cloudは、サービスとして提供される管理型Milvusベクターデータベースを提供しています。クラスター接続を容易にするために4つのSDKオプションがあります：[Python](./install-sdks#install-pymilvus-python-sdk)、[Java](./install-sdks#install-java-sdk)、[Go](./install-sdks#install-go-sdk)、または[Node.js](./install-sdks#install-nodejs-sdk)。

<Admonition type="info" icon="📘" title="注釈">

<ul>
<li><p>Zilliz Cloudはバージョン互換性を確保するためにクラスターを常にアップグレードします。詳細は <a href="./organization-settings">組織設定の管理</a> ページをご覧ください。SDKバージョンの不一致により接続の問題が発生した場合は、互換性のあるSDKバージョンにロールバックするための指示に従ってください。メンテナンス後には、SDKをアップグレードして問題ありません。</p></li>
<li><p>以下に示すすべてのSDKには、安定版とベータ版の両方があります。安定版は一般クラスターを対象としており、ベータ版はベータクラスターに対応しています。クラスターをベータ版にアップグレードした場合は、SDKもベータ版にアップグレードしてください。</p></li>
</ul>

</Admonition>

## PyMilvus：Python SDKのインストール\{#install-pymilvus-python-sdk}

PyMilvusはMilvusのPython SDKです。[GitHubのソースコード](https://github.com/milvus-io/pymilvus)にアクセスできます。

<Admonition type="info" icon="📘" title="注釈">

<p>インストール前に <strong>Python</strong> バージョンが <strong>3.8</strong> を超えていることを確認してください。</p>

</Admonition>

```bash
# Milvus v2.5.x と互換性のある pymilvus をインストール
python -m pip install pymilvus==2.5.16

# PyMilvus を最新バージョンに更新
python -m pip install --upgrade pymilvus

# インストール成功を確認
python -m pip list | grep pymilvus
```

クラスターが **Milvus v2.6.x（パブリックプレビュー）** と互換性がある場合は、上記のコマンドの `2.5.16` を `2.6.3` に変更してください。

## Node.js SDKのインストール\{#install-nodejs-sdk}

MilvusのNode.js SDKには、**npm** または **yarn** を使用します。[GitHubのソースコード](https://github.com/milvus-io/milvus-sdk-node)にアクセスできます。

<Admonition type="info" icon="📘" title="注釈">

<p>インストール前に <strong>Node.js</strong> バージョンが <strong>14</strong> 以上であることを確認してください。</p>

</Admonition>

```bash
# Milvus v2.5.x と互換性のある Node.js SDK をインストール
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

このSDKはCommonJSまたはES6モジュールとして使用できます。通常、`npm init`プロジェクトにはCommonJSを使用し、`npm init es6`プロジェクトにはES6が推奨されます。

```javascript
// CommonJSモジュールとしてSDKをインポート
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

// ES6モジュールとしてSDKをインポート
import { MilvusClient } from "@zilliz/milvus2-sdk-node"
```

クラスターが **Milvus v2.6.x（パブリックプレビュー）** と互換性がある場合は、上記のコマンドの `2.5.13` を `2.6.4` に変更してください。

## Java SDKのインストール\{#install-java-sdk}

Apache MavenまたはGradle/Grailsを使用してSDKを取得します。[GitHubのソースコード](https://github.com/milvus-io/milvus-sdk-java)を参照してください。

- Apache Mavenの場合、`pom.xml`の依存関係に以下を追加します：

    ```xml
    <!-- Milvus v2.5.x と互換性のある Java SDK をインストール -->
    <dependency>
         <groupId>io.milvus</groupId>
         <artifactId>milvus-sdk-java</artifactId>
         <version>2.5.14</version>
     </dependency>
    ```

- Gradle/Grailsの場合、以下を実行します：

    ```bash
    # Milvus v2.5.x と互換性のある Java SDK をインストール
    compile 'io.milvus:milvus-sdk-java:2.5.14'
    ```

クラスターが **Milvus v2.6.x（パブリックプレビュー）** と互換性がある場合は、上記のコマンドの `2.5.14` を `2.6.6` に変更してください。

## Go SDKのインストール\{#install-go-sdk}

Go SDKは `go get` から利用できます。[GitHubのソースコード](https://github.com/milvus-io/milvus-sdk-go)を参照してください。

```bash
# Milvus v2.5.x と互換性のある Go SDK をインストール
go get -u github.com/milvus-io/milvus-sdk-go/v2@v2.5.6
```

クラスターが **Milvus v2.6.x（パブリックプレビュー）** と互換性がある場合は、上記のコマンドの `2.5.6` を `2.6.1` に変更してください。