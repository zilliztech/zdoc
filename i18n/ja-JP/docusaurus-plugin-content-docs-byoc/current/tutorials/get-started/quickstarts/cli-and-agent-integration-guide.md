---
title: "CLI とエージェント統合のクイックスタート | BYOC"
slug: /cli-and-agent-integration-guide
sidebar_label: "CLI とエージェント統合のクイックスタート"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz CLI と、ローカル環境のワークフローに最適なエージェント統合をインストールします。Zilliz は、Claude Code および OpenAI Codex 向けの Zilliz Plugin、スキル対応エージェント向けの Zilliz Skill、ターミナルや自動化ワークフローで直接使用する Zilliz CLI を通じて、エージェントとの連携をサポートしています。 | BYOC"
type: shortcut
token: HxWmwteOEi1Egukx26pcBnnknSd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# CLI とエージェント統合のクイックスタート

Zilliz CLI と、ローカル環境のワークフローに最適なエージェント統合をインストールします。Zilliz は、Claude Code および OpenAI Codex 向けの Zilliz Plugin、スキル対応エージェント向けの Zilliz Skill、ターミナルや自動化ワークフローで直接使用する Zilliz CLI を通じて、エージェントとの連携をサポートしています。

セットアップが完了すると、エージェントに Zilliz Cloud の直接操作を指示したり、スクリプトやターミナルで CLI を利用したりできます。

## インストール\{#installation}

開始前に、以下の条件を満たしていることを確認してください。

- [Zilliz Cloud アカウント](https://cloud.zilliz.com/login) を保有していること。

- [Claude Code Plugin](/docs/agents/zilliz-plugin) を使用する場合は、Claude Code がインストールされていること。

- [Codex Plugin](./zilliz-codex-plugin) を使用する場合は、Codex がインストールされていること。

- [Zilliz Skill](https://github.com/zilliztech/zilliz-skill) をインストールする場合は、Node.js がインストールされていること。

### OpenAI Codex 向け Zilliz Plugin のインストール\{#install-zilliz-plugin-for-openai-codex}

OpenAI Codex から直接 Zilliz Cloud を操作する場合は、[Zilliz](https://github.com/zilliztech/zilliz-plugin)[ Plugin](https://github.com/zilliztech/zilliz-plugin) を使用します。

<Procedures>

1. マーケットプレイスを追加します。

    ```plaintext
    codex plugin marketplace add zilliztech/zilliz-plugin
    ```

1. Codex で `/plugins` を開き、マーケットプレイスから `zilliz` をインストールします。

</Procedures>

次のように [codex-marketplace](https://www.npmjs.com/package/codex-marketplace) を使って直接インストールすることも可能です。

```plaintext
npx codex-marketplace add zilliztech/zilliz-plugin --plugins
```

### Claude Code 向け Zilliz Plugin のインストール\{#install-zilliz-plugin-for-claude-code}

Claude Code から直接 Zilliz Cloud を操作する場合は、[Claude Code Plugin](/docs/agents/zilliz-plugin) を使用します。

<Procedures>

1. Claude Code を起動します。

    ```bash
    > claude
    ```

1. プラグインマーケットプレイスを開きます。

    ```bash
    /plugin
    ```

1. Zilliz Plugin を検索してインストールします。

    **Discover** タブで「zilliz」を検索し、表示された zilliz プラグインを選択してインストールします。

    ![TqS3b4z7Ho9xcXxHJaIc7HTZn1e](https://zdoc-images.s3.us-west-2.amazonaws.com/tqs3b4z7ho9xcxxhjaic7htzn1e.png "TqS3b4z7Ho9xcXxHJaIc7HTZn1e")

1. クイックスタートウィザードを実行します。このウィザードでは、CLI のインストール、認証、クラスターへの接続、および最初の操作について順を追って案内されます。

    ```plaintext
    /zilliz:quickstart
    ```

</Procedures>

### 主要なエージェントフレームワーク向け Zilliz Skill のインストール\{#install-zilliz-skill-for-common-agent-frameworks}

Codex、Gemini CLI、Cursor など、お使いのコーディングエージェントがエージェントスキルに対応している場合は、以下のように [Zilliz Skill](https://github.com/zilliztech/zilliz-skill) をインストールできます。

```bash
npx skills add zilliztech/zilliz-skill
```

このコマンドを実行すると、対象となるエージェントフレームワークとインストール範囲の選択が求められます。

### Zilliz CLI のインストール\{#install-zilliz-cli}

[Zilliz CLI](/reference/cli/cli/overview) は、Plugin や Skill の基盤となるコマンドラインツールです。

<Procedures>

1. Zilliz CLI をインストールします。

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

    インストール結果を確認します。

    ```bash
    zilliz --version
    ```

1. 認証を行います。

    お持ちの Zilliz Cloud アカウントで認証します。

    ```bash
    zilliz login
    ```

    ブラウザが開いて認証画面が表示されます。ログインが完了すると、認証情報がローカルに保存されます。

</Procedures>

## CLI、Plugin、Skill の使い分け\{#when-to-use-cli-plugin-or-skill}

これらのツールは、以下のような場面で活用できます。

- ローカル環境で手動による開発やテストを行う場合。

- 再利用可能なワークフローを実現するための自動化スクリプトを作成する場合。

- エージェントからベクトルデータベースや ベクトル Lakebase サービスを自動的に呼び出したい場合。

### ツールの比較\{#tool-comparison}

Claude Code Plugin、Zilliz Skill、Zilliz CLI はいずれも主要な機能を網羅しています。機能の違いではなく、ご自身のワークフローに合わせて適切なツールを選択してください。

|  | **OpenAI Codex Plugin** | **Claude Code Plugin** | **Zilliz Skill** | **Zilliz CLI** |
| --- | --- | --- | --- | --- |
| **推奨用途** | Codex を使った自然言語ワークフロー | Claude Code を使った自然言語ワークフロー | スキル対応のコーディングエージェント | ターミナル操作、スクリプト実行、CI パイプライン |
| **セットアップ** | `quickstart` スキルによるガイド付きセットアップ | `/zilliz:quickstart` | `npx skills add zilliztech/zilliz-skill` | インストールスクリプト + `zilliz login` |
| **自然言語対応** | はい | はい | はい | いいえ |
| **自動化** | エージェント支援型 | エージェント支援型 | エージェント支援型 | スクリプト主体 |
| **構造化出力** | エージェント可読なレスポンス | エージェント可読なレスポンス | エージェント可読なレスポンス | スクリプト向け `--output json` |

### サポートされている機能\{#supported-capabilities}

下表に、CLI、Plugin、および Skill で利用可能な機能の一覧を示します。

| カテゴリ | 主な操作 |
| --- | --- |
| クラスター | 作成、削除、一時停止、再開、設定変更 |
| コレクション | カスタムスキーマでの作成、ロード、リリース、名前変更、ドロップ |
| ベクトル | 検索、クエリ、挿入、アップサート、削除、ハイブリッド検索 |
| インデックス | 作成（AUTOINDEX）、一覧取得、詳細確認、ドロップ |
| データベース | 作成、一覧取得、詳細確認、ドロップ |
| ユーザーとロール | RBAC の設定、権限管理 |
| バックアップ | 作成、復元、エクスポート、ポリシー管理 |
| インポート | S3/GCS/Azure Blob Storage からのバルクデータインポート |
| パーティション | 作成、ロード、リリース、管理 |
| モニタリング | クラスターのステータス確認、コレクションの統計情報、ロード状態の確認 |
| プロジェクト | プロジェクトおよびリージョンの管理 |
| 課金 | 使用量の照会、請求書の確認 |

## エージェントへの指示例\{#what-you-can-ask-your-agent-to-do}

インストール後、エージェントに対してタスク内容を自然言語で伝えるだけで、エージェントがそれを適切な Zilliz CLI コマンドに変換して実行します。以下の例は、自然言語での指示が実際にどのような CLI コマンドとして実行されるかを示しています。

- **クラスターの一覧を表示して、現在アクティブなものを教えて。**

    想定される CLI コマンド:

    ```bash
    zilliz cluster list
    zilliz context current
    ```

- **商品埋め込み用に、768次元のベクトルフィールドを持つコレクションを作成して。**

    想定される CLI コマンド:

    ```bash
    zilliz collection create --name product_embeddings --dimension 768
    ```

- **S3 からコレクションにデータをインポートして、インポートジョブのステータスを確認して。**

    想定される CLI コマンド:

    ```bash
    zilliz import start --cluster-id <cluster-id> --collection product_embeddings --body '{"files": [["s3://bucket/path/data.json"]]}'
    ```

- **本番環境のクラスターのバックアップを作成して。**

    想定される CLI コマンド:

    ```bash
    zilliz backup create --cluster-id <cluster-id>
    ```

- **メタデータフィルターを使ってコレクションを検索し、上位10件の結果を取得して。**

    想定される CLI コマンド:

    ```bash
    zilliz vector search --collection product_embeddings --data '[[0.1, 0.2, 0.3]]' --filter 'age > 20' --limit 10 --output-fields '["name", "age"]'
    ```

- **analytics コレクションへの読み取り専用アクセス権限を持つロールを作成して。**

    想定される CLI コマンド:

    ```bash
    zilliz role create --role analytics_readonly
    zilliz role grant-privilege --role analytics_readonly --object-type Collection --object-name analytics --privilege Search
    zilliz role grant-privilege --role analytics_readonly --object-type Collection --object-name analytics --privilege Query
    ```
