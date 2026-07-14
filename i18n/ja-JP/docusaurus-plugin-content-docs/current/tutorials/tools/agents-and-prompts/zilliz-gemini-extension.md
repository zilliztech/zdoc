---
title: "Zilliz Gemini CLI Extension | Cloud"
slug: /zilliz-gemini-extension
sidebar_label: "Gemini CLI 拡張機能"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Gemini CLI 向け Zilliz Cloud 拡張機能は、Zilliz Cloud の操作を IDE に直接持ち込む自然言語インターフェースです。CLI コマンドを暗記したり Web コンソールに切り替えたりする代わりに、やりたいことを平易な言葉で記述するだけで、プラグインが処理します。 | Cloud"
type: origin
token: FDwgwyDbMi98nckzPxkc2qWynW4
sidebar_position: 3
keywords: 
  - zilliz
  - ベクターデータベース
  - ai-agents
  - decision matrix
  - skill
  - gemini
  - zilliz cli
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Zilliz Gemini CLI Extension

Gemini CLI 向け Zilliz Cloud 拡張機能は、Zilliz Cloud の操作を IDE に直接持ち込む自然言語インターフェースです。CLI コマンドを暗記したり Web コンソールに切り替えたりする代わりに、やりたいことを平易な言葉で記述するだけで、プラグインが処理します。

## できること\{#what-it-does}

- 自然言語のリクエストを `zilliz-cli` コマンドに変換します

- clusters、databases、collections、partitions、indexes、vectors、imports、backups、users/roles、monitoring、projects、billing など、主要な Zilliz Cloud 操作をすべてカバーします

- 呼び出し時にライブの `--help` 出力を埋め込むため、アシスタントは常に最新のフラグ情報を利用できます

- 破壊的な操作の前には、必ず明示的なユーザー確認が必要です

## 前提条件\{#prerequisites}

- Gemini CLI をインストール済みであること。

## セットアップ手順\{#setup-procedure}

```bash
gemini extensions install https://github.com/zilliztech/gemini-cli-extension
```

または、まず [このリポジトリ](https://github.com/zilliztech/gemini-cli-extension.git) をローカルに clone し、次のコマンドを実行することもできます。

```bash
gemini extensions link /path/to/gemini-cli-extension
```

## 初期セットアップ\{#initial-setup}

インストール後、クイックスタートウィザードを実行します。

```bash
/zilliz:setup
```

ウィザードでは、以下の手順を案内します。

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

1. cluster に接続します。

    デフォルトの cluster 接続を設定します。

    ```bash
    zilliz context set --cluster-id <your-cluster-id>
    ```

    または、プラグインに利用可能な clusters の中から選択を手伝わせることもできます。

</Procedures>

## 検証\{#verification}

簡単なコマンドでプラグインをテストします。

```plaintext
You: "List my clusters"
```

プラグインには、Zilliz Cloud clusters が表示されるはずです。

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

    1. ログアウトしてから再度ログインを試します。

    ```bash
    zilliz logout
    zilliz login
    ```

1. **"No cluster configured"**

    **解決策**: デフォルトの cluster を設定します。

    ```bash
    zilliz context set --cluster-id <cluster-id>
    ```

## 次のステップ\{#next-step}

Zilliz Claude Code Plugin と Zilliz Gemini CLI Extension は、どちらも基盤として Zilliz CLI を共有しています。プロンプトの書き方について学ぶには、[Zilliz Claude Code Plugin の機能](./zilliz-plugin-capabilities) と [Zilliz Claude Code Plugin の例](./zilliz-plugin-examples) を参照してください。
