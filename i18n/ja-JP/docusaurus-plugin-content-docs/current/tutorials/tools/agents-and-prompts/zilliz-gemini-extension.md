---
title: "Zilliz Gemini CLI Extension | Cloud"
slug: /zilliz-gemini-extension
sidebar_label: "Gemini CLI Extension"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Gemini CLI 用の Zilliz Cloud 拡張機能は、Zilliz Cloud の操作を IDE に直接もたらす自然言語インターフェースです。CLI コマンドを暗記したり Web コンソールに切り替えたりすることなく、実行したい内容を自然言語で記述するだけで、プラグインが処理します。 | Cloud"
type: origin
token: FDwgwyDbMi98nckzPxkc2qWynW4
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Zilliz Gemini CLI Extension

Gemini CLI 用の Zilliz Cloud 拡張機能は、Zilliz Cloud の操作を IDE に直接もたらす自然言語インターフェースです。CLI コマンドを暗記したり Web コンソールに切り替えたりすることなく、実行したい内容を自然言語で記述するだけで、プラグインが処理します。

## できること\{#what-it-does}

- 自然言語のリクエストを `zilliz-cli` コマンドに変換します

- クラスター、データベース、コレクション、パーティション、インデックス、ベクトル、インポート、バックアップ、users/roles, 監視、プロジェクト、請求など、Zilliz Cloud の主要な操作をすべてカバーします

- 呼び出し時に実際の `--help` 出力を埋め込むため、アシスタントは常に最新のフラグ情報を参照できます

- 破壊的な操作の前には、ユーザーによる明示的な確認を必須とします

## 事前準備\{#prerequisites}

- Gemini CLI がインストールされていること。

## セットアップ手順\{#setup-procedure}

```bash
gemini extensions install https://github.com/zilliztech/gemini-cli-extension
```

または、[このリポジトリ](https://github.com/zilliztech/gemini-cli-extension.git) をローカルにクローンしてから、次のコマンドを実行することもできます。

```bash
gemini extensions link /path/to/gemini-cli-extension
```

## 初期セットアップ\{#initial-setup}

インストール後、クイックスタートウィザードを実行します。

```bash
/zilliz:setup
```

ウィザードでは、以下の手順に沿って設定を進めます。

<Procedures>

1. Zilliz CLI をインストールします。

    このプラグインには Zilliz CLI が必要です。未インストールの場合は、以下を実行してください。

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

    Zilliz Cloud アカウントを使用して認証を行います。

    ```bash
    zilliz auth login
    ```

    ブラウザが起動し、認証が行われます。ログイン後、認証情報はローカルに保存されます。

1. クラスターに接続します。

    デフォルトのクラスター接続を構成します。

    ```bash
    zilliz context set --cluster-id <your-cluster-id>
    ```

    または、プラグインを利用して、利用可能なクラスターから選択することもできます。

</Procedures>

## 動作確認\{#verification}

簡単なコマンドでプラグインをテストします。

```plaintext
You: "List my clusters"
```

プラグインによって、Zilliz Cloud のクラスターが表示されるはずです。

## トラブルシューティング\{#troubleshooting}

- **プラグインに「CLI not found」と表示される**

    **対処法**: Zilliz CLI をインストールしてください。

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

    **対処法**:

    1. インターネット接続を確認してください。

    1. Zilliz Cloud アカウントが有効であることを確認してください。

    1. ログアウトしてから、もう一度ログインを試してください。

    ```bash
    zilliz logout
    zilliz login
    ```

1. **「No クラスター configured」**

    **対処法**: デフォルトのクラスターを設定します。

    ```bash
    zilliz context set --cluster-id <cluster-id>
    ```

## 次のステップ\{#next-step}

Zilliz Claude Code Plugin と Zilliz Gemini CLI Extension はどちらも、基盤となる Zilliz CLI を共有しています。プロンプトの書き方を学ぶには、[Zilliz Claude Code Plugin の機能](./zilliz-plugin-capabilities) および [Zilliz Claude Code Plugin の例](./zilliz-plugin-examples) を参照してください。
