---
title: "Zilliz Claude Code Plugin セットアップ | Cloud"
slug: /zilliz-plugin-setup
sidebar_label: "セットアップ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Claude Code で Zilliz Plugin をインストールしてセットアップする方法を説明します。 | Cloud"
type: origin
token: UDxnwONhSidaQikY6NGcRdmOnUh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Zilliz Claude Code Plugin セットアップ

このガイドでは、Claude Code で Zilliz Plugin をインストールしてセットアップする方法を説明します。

## 前提条件\{#prerequisites}

- すでに [Claude Code](https://code.claude.com/) をインストールしていること。

## セットアップ手順\{#setup-procedure}

<Procedures>

1. Claude Code を実行します

    ```bash
    > claude
    ```

1. プラグインマーケットプレイスを開きます

    ```bash
    /plugin
    ```

1. Zilliz Plugin を見つけてインストールします

    **Discover** タブに移動し、zilliz を検索します。zilliz plugin を選択してインストールします。

    ![TqS3b4z7Ho9xcXxHJaIc7HTZn1e](https://zdoc-images.s3.us-west-2.amazonaws.com/tqs3b4z7ho9xcxxhjaic7htzn1e.png "TqS3b4z7Ho9xcXxHJaIc7HTZn1e")

</Procedures>

お使いの環境がマーケットプレイスでの検索に対応していない場合でも、Zilliz plugin marketplace を手動で追加することでプラグインをインストールできる可能性があります。

<details>

<summary>Zilliz Cloud plugin marketplace を追加してインストールする</summary>

1. Claude Code を実行します

    ```bash
    > claude
    ```

1. Zilliz Plugin marketplace を追加します。

    ```bash
    /plugin marketplace add zilliztech/zilliz-plugin
    ```

1. プラグインをインストールします

    ```bash
    /plugin install zilliz@zilliztech/zilliz-plugin
    ```

</details>

## 初期セットアップ\{#initial-setup}

インストール後、クイックスタートウィザードを実行します。

```bash
/zilliz:setup
```

ウィザードでは次の手順を案内します。

<Procedures>

1. Zilliz CLI をインストールします。

    このプラグインには Zilliz CLI が必要です。インストールされていない場合は、次を実行します。

    <Tabs groupId="cli-install" defaultValue='linux' values={[{"label":"macOS / Linux","value":"linux"},{"label":"Windows","value":"windows"}]}>

    <TabItem value="linux">

    ```bash
    curl -fsSL https://zilliz.com/cli/install.sh | bash
    ```

    </TabItem>

    <TabItem value="windows">

    ```bash
    irm https://zilliz.com/cli/install.ps1 | iex
    ```

    </TabItem>

    </Tabs>

    インストールを確認します。

    ```bash
    zilliz --version
    ```

1. 認証します。

    Zilliz Cloud アカウントで認証します。

    ```bash
    zilliz auth login
    ```

    これにより認証用のブラウザが開きます。ログイン後、認証情報はローカルに保存されます。

1. クラスターに接続します。

    デフォルトのクラスター接続を設定します。

    ```bash
    zilliz context set --cluster-id <your-cluster-id>
    ```

    または、プラグインに利用可能なクラスターの中から選択させることもできます。

</Procedures>

## 検証\{#verification}

簡単なコマンドでプラグインをテストします。

```plaintext
You: "List my clusters"
```

プラグインに Zilliz Cloud のクラスターが表示されるはずです。

## トラブルシューティング\{#troubleshooting}

- **プラグインに "CLI not found" と表示される**

    **解決策**: Zilliz CLI をインストールします。

    <Tabs groupId="cli-install" defaultValue='linux' values={[{"label":"macOS / Linux","value":"linux"},{"label":"Windows","value":"windows"}]}>

    <TabItem value="linux">

    ```bash
    curl -fsSL https://zilliz.com/cli/install.sh | bash
    ```

    </TabItem>

    <TabItem value="windows">

    ```bash
    irm https://zilliz.com/cli/install.ps1 | iex
    ```

    </TabItem>

    </Tabs>

- **認証に失敗する**

    **解決策**:

    1. インターネット接続を確認します

    1. Zilliz Cloud アカウントが有効であることを確認します

    1. ログアウトして再度ログインしてみます。

    ```bash
    zilliz logout
    zilliz login
    ```

1. **"No cluster configured"**

    **解決策**: デフォルトのクラスターを設定します。

    ```bash
    zilliz context set --cluster-id <cluster-id>
    ```

## 次のステップ\{#next-steps}

- [機能リファレンス](./zilliz-plugin-capabilities)

- [例](./zilliz-plugin-examples)

