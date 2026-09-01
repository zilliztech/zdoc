---
title: "Zilliz Codex Plugin | BYOC"
slug: /zilliz-codex-plugin
sidebar_label: "Codex Plugin"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Codex Plugin を使用すると、OpenAI Codex が自然言語で Zilliz Cloud を操作できるようになります。インストール後、Codex は Zilliz CLI のインストールと利用、Zilliz Cloud への認証、アクティブなクラスターコンテキストの設定をサポートします。さらに、クラスター、コレクション、ベクトル、インデックス、インポート、バックアップ、ユーザー、ロール、監視ステータスの管理など、一般的なクラウドおよびデータ操作を実行できます。 | BYOC"
type: origin
token: HgQBwNTmGiRJ5xkp3OecH5KZn3d
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Zilliz Codex Plugin

Zilliz Codex Plugin を使用すると、OpenAI Codex が自然言語で Zilliz Cloud を操作できるようになります。インストール後、Codex は Zilliz CLI のインストールと利用、Zilliz Cloud への認証、アクティブなクラスターコンテキストの設定をサポートします。さらに、クラスター、コレクション、ベクトル、インデックス、インポート、バックアップ、ユーザー、ロール、監視ステータスの管理など、一般的なクラウドおよびデータ操作を実行できます。

## 前提条件\{#prerequisites}

- OpenAI Codex がインストールされていること。

- Zilliz Cloud アカウントを保有していること。

- ローカルの Codex 環境に Codex プラグインをインストールできること。

## セットアップ手順\{#setup-procedure}

<Procedures>

1. マーケットプレイスを追加します。

    ```plaintext
    codex plugin marketplace add zilliztech/zilliz-plugin
    ```

1. Codex で `/plugins` を開き、マーケットプレイスから `zilliz` をインストールします。

</Procedures>

[codex-marketplace](https://www.npmjs.com/package/codex-marketplace) を使用して、以下のように直接インストールすることも可能です。

```plaintext
npx codex-marketplace add zilliztech/zilliz-plugin --plugins
```

## 初期設定\{#initial-setup}

インストール完了後、Codex で `quickstart` スキルを呼び出します。たとえば、Codex に次のように問いかけます。

```plaintext
Set up the Zilliz CLI.
```

セットアップフローでは、以下の手順に沿って進めます。

<Procedures>

1. Zilliz CLI のインストール

    このプラグインには Zilliz CLI が必要です。未インストールの場合は、以下のコマンドを実行してください。

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

    インストールを確認するには、以下を実行します。

    ```bash
    zilliz --version
    ```

1. 認証

    Zilliz Cloud アカウントを使用して認証を行います。

    ```bash
    zilliz login
    ```

    認証用のブラウザーウィンドウが開きます。ログインが完了すると、認証情報がローカルに保存されます。

1. クラスターへの接続

    デフォルトのクラスター接続を設定します。

    ```bash
    zilliz context set --cluster-id <your-cluster-id>
    ```

    または、プラグインを利用して利用可能なクラスター一覧から選択することもできます。

</Procedures>

## 動作確認\{#verification}

簡単なリクエストを送信して、プラグインの動作を確認します。

```plaintext
List my clusters.
```

正常に動作していれば、Zilliz Cloud のクラスター一覧が表示されます。

Codex に現在の環境状態を確認させることもできます。

```plaintext
Show my Zilliz Cloud status.
```

## トラブルシューティング\{#troubleshooting}

- **プラグインが Codex に表示されない**

    対処法: マーケットプレイスが正しく追加されているか確認してください。

    ```plaintext
    codex plugin marketplace add zilliztech/zilliz-plugin
    ```

    その後、`/plugins` を開いて `zilliz` をインストールしてください。

- **「CLI not found」と表示される**

    対処法: Zilliz CLI をインストールしてください。

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

    対処法:

    1. インターネット接続を確認してください。

    1. Zilliz Cloud アカウントが有効であることを確認してください。

    1. ログアウトしてから再度ログインを試してください。

    ```plaintext
    zilliz logout
    zilliz login
    ```

- **クラスターが設定されていない**

    対処法: デフォルトのクラスターを設定してください。

    ```plaintext
    zilliz context set --cluster-id <cluster-id>
    ```

## 次のステップ\{#next-step}

Zilliz Codex Plugin、Zilliz Claude Code Plugin、Zilliz Gemini CLI Extension はいずれも、基盤となる実行レイヤーとして Zilliz CLI を使用しています。プロンプトの作成方法については、[Zilliz Claude Code Plugin Capabilities](./zilliz-plugin-capabilities) および [Zilliz Claude Code Plugin Examples](./zilliz-plugin-examples) をご参照ください。
