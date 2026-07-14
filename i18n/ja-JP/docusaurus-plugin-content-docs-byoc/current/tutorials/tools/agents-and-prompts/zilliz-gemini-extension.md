---
title: "Zilliz Gemini CLI 拡張機能 | BYOC"
slug: /zilliz-gemini-extension
sidebar_label: "Gemini CLI 拡張機能"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Gemini CLI 向け Zilliz Cloud 拡張機能は、Zilliz Cloud の操作を IDE に直接持ち込む自然言語インターフェースです。CLI コマンドを暗記したり Web コンソールに切り替えたりする代わりに、やりたいことを平易な言葉で説明するだけで、プラグインがそれを処理します。 | BYOC"
type: origin
token: FDwgwyDbMi98nckzPxkc2qWynW4
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Zilliz Gemini CLI 拡張機能

Gemini CLI 向け Zilliz Cloud 拡張機能は、Zilliz Cloud の操作を IDE に直接持ち込む自然言語インターフェースです。CLI コマンドを暗記したり Web コンソールに切り替えたりする代わりに、やりたいことを平易な言葉で説明するだけで、プラグインがそれを処理します。

## できること\{#what-it-does}

- 自然言語のリクエストを `zilliz-cli` コマンドに変換します

- クラスター、データベース、コレクション、パーティション、インデックス、ベクトル、インポート、バックアップ、ユーザー/ロール、モニタリング、プロジェクト、請求など、主要な Zilliz Cloud 操作をすべてカバーします

- 呼び出し時に最新の `--help` 出力を埋め込むため、アシスタントは常に最新のフラグ情報を利用できます

- 破壊的な操作を実行する前に、必ずユーザーによる明示的な確認を要求します

## 前提条件\{#prerequisites}

- Gemini CLI をインストール済みであること。

## セットアップ手順\{#setup-procedure}

```bash
gemini extensions install https://github.com/zilliztech/gemini-cli-extension
```

あるいは、先に [このリポジトリ](https://github.com/zilliztech/gemini-cli-extension.git) をローカルにクローンし、次のコマンドを実行することもできます。

```bash
gemini extensions link /path/to/gemini-cli-extension
```

## 初期セットアップ\{#initial-setup}

インストール後、クイックスタートウィザードを実行します。

```bash
/zilliz:setup
```

ウィザードでは、次の手順を案内します。

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

    これにより、認証のためのブラウザが開きます。ログイン後、認証情報はローカルに保存されます。

1. クラスターに接続します。

    デフォルトのクラスター接続を設定します。

    ```bash
    zilliz context set --cluster-id <your-cluster-id>
    ```

    または、プラグインの案内に従って利用可能なクラスターから選択することもできます。

</Procedures>

## 検証\{#verification}

簡単なコマンドでプラグインをテストします。

```plaintext
You: "List my clusters"
```

プラグインは、あなたの Zilliz Cloud クラスターを表示するはずです。

## トラブルシューティング\{#troubleshooting}

- **プラグインに "CLI not found" と表示される**

    **解決方法**: Zilliz CLI をインストールします。

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

    **解決方法**:

    1. インターネット接続を確認します

    1. Zilliz Cloud アカウントが有効であることを確認します

    1. ログアウトして再度ログインしてみます。

    ```bash
    zilliz logout
    zilliz login
    ```

1. **"No cluster configured"**

    **解決方法**: デフォルトのクラスターを設定します。

    ```bash
    zilliz context set --cluster-id <cluster-id>
    ```

## 次のステップ\{#next-step}

Zilliz Claude Code Plugin と Zilliz Gemini CLI 拡張機能は、どちらも基盤として Zilliz CLI を共有しています。プロンプトの書き方を学ぶには、[Zilliz Claude Code Plugin の機能](./zilliz-plugin-capabilities) と [Zilliz Claude Code Plugin の例](./zilliz-plugin-examples) を参照してください。
