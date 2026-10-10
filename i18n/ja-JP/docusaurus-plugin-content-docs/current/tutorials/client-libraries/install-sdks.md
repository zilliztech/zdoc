---
title: "SDK のインストール | Cloud"
slug: /install-sdks
sidebar_label: "SDK のインストール"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、マネージド Milvus ベクトルデータベースをサービスとして提供します。クラスター接続を容易にする SDK オプションは 6つあります Python](./install-sdks#install-pymilvus-python-sdk), [Java](./install-sdks#install-java-sdk), [Go](./install-sdks#install-go-sdk), [Node.js](./install-sdks#install-nodejs-sdk), [C++](./install-sdks#install-c-sdk), および [Rust。 | Cloud"
type: origin
token: J274wT61xiEM4fkYeL8cMb4Pnbd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# SDK のインストール

Zilliz Cloud は、マネージド Milvus ベクトルデータベースをサービスとして提供します。クラスター接続を容易にする SDK オプションには、[Python](./install-sdks#install-pymilvus-python-sdk)、[Java](./install-sdks#install-java-sdk)、[Go](./install-sdks#install-go-sdk)、[Node.js](./install-sdks#install-nodejs-sdk)、[C++](./install-sdks#install-c-sdk)、[Rust](./install-sdks#install-rust-sdk) の 6つがあります。

<Admonition type="info" title="Notes">

- Zilliz Cloud は、バージョンの互換性を確保するためにクラスターを継続的にアップグレードします。詳細については、[組織設定の管理](./organization-settings) ページを参照してください。SDK バージョンの不一致により接続の問題が発生した場合は、表示されるプロンプトに従って互換性のある SDK バージョンに戻してください。メンテナンス完了後に通知しますので、その後は安心して SDK をアップグレードできます。

- 以下のすべての SDK には、安定版とベータ版の両方が用意されています。安定版は一般的なクラスターを対象とし、ベータ版はベータクラスターに対応します。クラスターをベータ版にアップグレードしている場合は、SDK もベータ版にアップグレードしていることを確認してください。

</Admonition>

## SDK の互換性\{#sdk-compatibility}

次の表は、各 Milvus バージョンと互換性のある SDK バージョンを示しています。

| **Milvus バージョン** | **Python SDK** | **Node.js SDK** | **Java SDK** | **Go SDK** | **C++** | **Rust SDK** |
| --- | --- | --- | --- | --- | --- | --- |
| `3.0.x` | `3.0.1` | `3.0.6` | `3.0.10` | `3.0.0` | `3.0.3` | `3.0.2` |
| `2.6.x` | `2.6.17` | `2.6.17` | `2.6.24` | `2.6.5` | `2.6.6` | `2.6.1` |
| `2.5.x` | `2.5.18` | `2.5.13` | `2.5.15` | `2.5.6` | -- | -- |

## PyMilvus のインストール: Python SDK\{#install-pymilvus-python-sdk}

PyMilvus は Milvus の Python SDK です。[GitHub のソースコード](https://github.com/milvus-io/pymilvus) にアクセスできます。

<Admonition type="info" title="Notes">

インストールする前に、**Python** のバージョンが **3.8** を超えていることを確認してください。

</Admonition>

```bash
# Install or update PyMilvus to the latest v3.0.x
pip install --upgrade pymilvus==v3.0.1

# Install the Model library for embedding operations (optional)
pip install pymilvus[model]

# Verify the installed version
python -c "from pymilvus import __version__; print(__version__)"
```

## Node.js SDK のインストール\{#install-nodejs-sdk}

Milvus の Node.js SDK を利用するには、**npm** または **yarn** を使用します。[GitHub のソースコード](https://github.com/milvus-io/milvus-sdk-node) にアクセスできます。

<Admonition type="info" title="Notes">

インストールする前に、**Node.js** のバージョンが **14** 以上であることを確認してください。

</Admonition>

```bash
npm install @zilliz/milvus2-sdk-node
# Alternatively,
yarn add @zilliz/milvus2-sdk-node

# Upgrade to the latest version
npm update @zilliz/milvus2-sdk-node
# Alternatively,
yarn upgrade @zilliz/milvus2-sdk-node

# Verify installation
npm list | grep @zilliz/milvus2-sdk-node
# or
yarn list | grep @zilliz/milvus2-sdk-node
```

この SDK は CommonJS または ES6 モジュールとして使用できます。通常、`npm init` プロジェクトでは CommonJS を使用します。`npm init es6` のプロジェクトでは、ES6 が推奨されます。

```javascript
// Import the SDK as a CommonJS module
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

// Import the SDK as a ES6 module
import { MilvusClient } from "@zilliz/milvus2-sdk-node"
```

## Java SDK のインストール\{#install-java-sdk}

SDK を取得するには、Apache Maven または Gradle/Grails を使用します。[GitHub のソースコード](https://github.com/milvus-io/milvus-sdk-java) にアクセスしてください。

- Apache Maven の場合は、次の内容を `pom.xml` の依存関係に追加します。

    ```xml
    <!-- Install the Java SDK compatible with Milvus v3.0.x -->
    <dependency>
        <groupId>io.milvus</groupId>
        <artifactId>milvus-sdk-java</artifactId>
        <version>3.0.10</version>
    </dependency>
    <!-- Optional: to use BulkWriter, also add -->
    <dependency>
        <groupId>io.milvus</groupId>
        <artifactId>milvus-sdk-java-bulkwriter</artifactId>
        <version>3.0.10</version>
    </dependency>
    ```

- Gradle/Grails, の場合は、次を実行します。

    ```bash
    # Install the Java SDK compatible with Milvus v3.0.x
    implementation 'io.milvus:milvus-sdk-java:3.0.10'
    # Optional: to use BulkWriter, also add
    implementation 'io.milvus:milvus-sdk-java-bulkwriter:3.0.10' 
    ```

## Go SDK のインストール\{#install-go-sdk}

Go SDK は `go get` で利用できます。[GitHub のソースコード](https://github.com/milvus-io/milvus-sdk-go) を参照してください。

```bash
# Install the Go SDK compatible with Milvus v3.0.x
go get -u github.com/milvus-io/milvus/client/v3
```

## C++ SDK のインストール\{#install-c-sdk}

C++ SDK は次のようにして利用できます。[GitHub のソースコード](https://github.com/milvus-io/milvus-sdk-cpp) を参照してください。

```shell
# Install the C++ SDK (Milvus 3.0.x, release v3.0.3) from source
git clone https://github.com/milvus-io/milvus-sdk-cpp.git
cd milvus-sdk-cpp
git checkout v3.0.3
bash scripts/install_deps.sh
make

# install the sdk
make install       # install to /usr/local
```

## Rust SDK のインストール\{#install-rust-sdk}

Milvus の Rust SDK を使用するには、[Cargo](https://crates.io/crates/milvus-sdk-rust) を使用します。ソースコードは [GitHub](https://github.com/milvus-io/milvus-sdk-rust) で確認できます。

<Tabs groupId="code" defaultValue='shell' values={[{"label":"Zilliz CLI","value":"shell"},{"label":"Rust","value":"rust"}]}>
<TabItem value='shell'>

```shell
# Add the Rust SDK to your Cargo.toml
[dependencies]
milvus-sdk-rust = "3.0.2"
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// Connect to Milvus
#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(&ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT")).await?;
    Ok(())
}
```

</TabItem>
</Tabs>
