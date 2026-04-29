---
title: "SDK のインストール | Cloud"
slug: /install-sdks
sidebar_key: install-sdks
sidebar_label: "SDK のインストール"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、マネージド型の Milvus ベクトルデータベースをサービスとして提供しています。クラスターへの接続を容易にするため、Python](./install-sdks#install-pymilvus-python-sdk)、[Java](./install-sdks#install-java-sdk)、[Go](./install-sdks#install-go-sdk)、または [Node.js の 4 つの SDK オプションが用意されています。| Cloud"
type: origin
token: J274wT61xiEM4fkYeL8cMb4Pnbd
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - sdk
  - milvus

---

import Admonition from '@theme/Admonition';


# SDKのインストール

Zilliz Cloudは、マネージドMilvusベクトルデータベースをサービスとして提供しています。クラスターへの接続を容易にするため、4つのSDKオプションが用意されています：[Python](./install-sdks#install-pymilvus-python-sdk)、[Java](./install-sdks#install-java-sdk)、[Go](./install-sdks#install-go-sdk)、または[Node.js](./install-sdks#install-nodejs-sdk)。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz Cloudは常にクラスターをアップグレードし、バージョン互換性を確保しています。詳細については、<a href="./organization-settings">組織設定の管理</a>ページをご覧ください。SDKのバージョン不一致により接続に問題が発生した場合は、表示されるプロンプトに従って互換性のあるSDKバージョンに戻してください。メンテナンス完了後には通知が届きますので、その後は安心してSDKをアップグレードできます。</p></li>
<li><p>以下のすべてのSDKには、安定版（stable version）とベータ版（beta version）の両方が提供されています。安定版は通常のクラスター向けであり、ベータ版はベータクラスターに対応しています。クラスターをベータ版にアップグレードした場合は、SDKも必ずベータ版にアップグレードしてください。</p></li>
</ul>

</Admonition>

## SDKの互換性\{#sdk-compatibility}

次の表は、各Milvusバージョンに対応するSDKバージョンの一覧です。

<table>
   <tr>
     <th><p><strong>Milvus Version</strong></p></th>
     <th><p><strong>Python SDK</strong></p></th>
     <th><p><strong>Node.js SDK</strong></p></th>
     <th><p><strong>Java SDK</strong></p></th>
     <th><p><strong>Go SDK</strong></p></th>
   </tr>
   <tr>
     <td><p><code>2.6.x</code></p></td>
     <td><p><code>2.6.9</code></p></td>
     <td><p><code>2.6.10</code></p></td>
     <td><p><code>2.6.14</code></p></td>
     <td><p><code>2.6.2</code></p></td>
   </tr>
   <tr>
     <td><p><code>2.5.x</code></p></td>
     <td><p><code>2.5.18</code></p></td>
     <td><p><code>2.5.13</code></p></td>
     <td><p><code>2.5.15</code></p></td>
     <td><p><code>2.5.6</code></p></td>
   </tr>
</table>

## PyMilvus（Python SDK）のインストール\{#install-pymilvus-python-sdk}

PyMilvusはMilvusのPython SDKです。[GitHub上のソースコード](https://github.com/milvus-io/pymilvus)をご確認ください。

<Admonition type="info" icon="📘" title="Notes">

<p><strong>Python</strong>のバージョンが<strong>3.8</strong>を超えていることをインストール前にご確認ください。</p>

</Admonition>

```bash
# Install pymilvus compatible with Milvus v2.5.x
python -m pip install pymilvus==2.5.18

# Update PyMilvus to the newest version
python -m pip install --upgrade pymilvus

# Verify installation success
python -m pip list | grep pymilvus
```

クラスターが **Milvus v2.6.x (パブリックプレビュー)** と互換性がある場合は、上記のコマンド内の `2.5.18` を `2.6.9` に変更してください。

## Install Node.js SDK\{#install-nodejs-sdk}

Milvus の Node.js SDK は、**npm** または **yarn** を使用してインストールします。[GitHub 上のソースコード](https://github.com/milvus-io/milvus-sdk-node)をご確認ください。

<Admonition type="info" icon="📘" title="Notes">

<p><strong>Node.js</strong> のバージョンが <strong>14</strong> 以上であることをインストール前にご確認ください。</p>

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

この SDK は CommonJS モジュールとしても、ES6 モジュールとしても使用できます。通常、`npm init` プロジェクトでは CommonJS を使用し、`npm init es6` プロジェクトでは ES6 を使用することを推奨します。

```javascript
// Import the SDK as a CommonJS module
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

// Import the SDK as a ES6 module
import { MilvusClient } from "@zilliz/milvus2-sdk-node"
```

クラスターが **Milvus v2.6.x (パブリックプレビュー)** と互換性がある場合は、上記のコマンド内の `2.5.13` を `2.6.10` に変更してください。

## Install Java SDK\{#install-java-sdk}

Apache Maven または Gradle/Grails を使用して SDK を取得します。[GitHub 上のソースコード](https://github.com/milvus-io/milvus-sdk-java)にアクセスしてください。

- Apache Maven の場合、`pom.xml` の dependencies に以下を追加します:

    ```xml
    <!-- Install Java SDK compatible with Milvus v2.5.x -->
    <dependency>
         <groupId>io.milvus</groupId>
         <artifactId>milvus-sdk-java</artifactId>
         <version>2.5.15</version>
     </dependency>
    ```

- Gradle/Grails の場合、次を実行します:

    ```bash
    # Install Java SDK compatible with Milvus v2.5.x
    compile 'io.milvus:milvus-sdk-java:2.5.15'
    ```

クラスターが **Milvus v2.6.x (パブリックプレビュー)** と互換性がある場合は、上記のコマンド内の `2.5.15` を `2.6.14` に変更してください。

## Install Go SDK\{#install-go-sdk}

Go SDK は `go get` で利用可能です。[GitHub 上のソースコード](https://github.com/milvus-io/milvus-sdk-go)をご確認ください。

```bash
# Install Go SDK compatible with Milvus v2.5.x
go get -u github.com/milvus-io/milvus-sdk-go/v2@v2.5.6
```

クラスターが **Milvus v2.6.x (パブリックプレビュー)** と互換性がある場合は、上記のコマンド内の `2.5.6` を `2.6.1` に変更してください。