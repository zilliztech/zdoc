---
title: "CLI とエージェント連携のクイックスタート | Cloud"
slug: /cli-and-agent-integration-guide
sidebar_label: "CLI とエージェント連携のクイックスタート"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz CLI とエージェント連携をローカルでセットアップする方法を説明します。セットアップ後は、エージェントを使って自然言語で Zilliz Cloud を操作したり、CLI をターミナル、スクリプト、CI ワークフローで直接使用したりできます。 | Cloud"
type: shortcut
token: HxWmwteOEi1Egukx26pcBnnknSd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# CLI とエージェント連携のクイックスタート

このガイドでは、Zilliz CLI とエージェント連携をローカルでセットアップする方法を説明します。セットアップ後は、エージェントを使って自然言語で Zilliz Cloud を操作したり、CLI をターミナル、スクリプト、CI ワークフローで直接使用したりできます。

## インストール\{#installation}

開始する前に、以下を用意してください。

- [Zilliz Cloud アカウント](https://cloud.zilliz.com/login)

- [Claude Code Plugin](/docs/agents/zilliz-plugin) を使用する場合は、Claude Code

- [Zilliz Skill](https://github.com/zilliztech/zilliz-skill) をインストールする場合は、Node.js

### Claude Code Plugin をインストールする\{#install-claude-code-plugin}

Claude Code から直接 Zilliz Cloud を操作したい場合は、[Claude Code Plugin](/docs/agents/zilliz-plugin) を使用してください。

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

    **Discover** タブに移動し、zilliz を検索します。zilliz プラグインを選択してインストールします。

    ![TqS3b4z7Ho9xcXxHJaIc7HTZn1e](https://zdoc-images.s3.us-west-2.amazonaws.com/tqs3b4z7ho9xcxxhjaic7htzn1e.png "TqS3b4z7Ho9xcXxHJaIc7HTZn1e")

1. クイックスタートウィザードを実行します。ウィザードは、CLI のインストール、認証、クラスター接続、最初の操作を案内します。

    ```plaintext
    /zilliz:quickstart
    ```

</Procedures>

### 一般的なエージェントフレームワーク向けに Zilliz Skill をインストールする\{#install-zilliz-skill-for-common-agent-frameworks}

Codex、Gemini CLI、Cursor、またはその他の Skill 対応エージェントなどのコーディングエージェントがエージェントスキルをサポートしている場合は、以下のように [Zilliz Skill](https://github.com/zilliztech/zilliz-skill) をインストールします。

```bash
npx skills add zilliztech/zilliz-skill
```

このコマンドを実行すると、対象のエージェントフレームワークとインストール範囲を選択するよう求められます。

### Zilliz CLI をインストールする\{#install-zilliz-cli}

[Zilliz CLI](/reference/cli/cli/overview) は、Plugin と Skill が使用する基本のコマンドラインツールです。

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

    インストールを確認します。

    ```bash
    zilliz --version
    ```

1. 認証します。

    Zilliz Cloud アカウントで認証します。

    ```bash
    zilliz login
    ```

    これにより、認証用のブラウザが開きます。ログイン後、認証情報はローカルに保存されます。

</Procedures>

## CLI、Plugin、または Skill を使うタイミング\{#when-to-use-cli-plugin-or-skill}

これらのツールは、次のような場合に使用します。

- ローカル環境から手動で開発およびテストする場合

- 再現可能なワークフローのために自動操作スクリプトを作成する場合

- エージェントが Vector Database または Vector Lakebase サービスを自動的に呼び出せるようにする場合

### ツール比較\{#tool-comparison}

Claude Code Plugin、Zilliz Skill、Zilliz CLI は、同じ主要な機能をカバーすることを想定しています。機能範囲ではなく、ワークフローに基づいて選択してください。

|  | **Claude Code Plugin** | **Zilliz Skill** | **Zilliz CLI** |
| --- | --- | --- | --- |
| **最適な用途** | Claude Code の自然言語ワークフロー | Skill 対応コーディングエージェント | ターミナル利用、スクリプト、CI |
| **セットアップ** | `/zilliz:quickstart` | `npx skills add zilliztech/zilliz-skill` | インストールスクリプト + `zilliz login` |
| **自然言語** | はい | はい | いいえ |
| **自動化** | エージェント支援 | エージェント支援 | スクリプト優先 |
| **構造化出力** | エージェントが読めるレスポンス | エージェントが読めるレスポンス | スクリプト向けの `--output json` |

### サポートされる機能\{#supported-capabilities}

次の表では、CLI、Plugin、Skill の機能について説明します。

| 領域 | 実行できること |
| --- | --- |
| クラスター | 作成、削除、一時停止、再開、変更 |
| コレクション | カスタムスキーマで作成、ロード、リリース、名前変更、削除 |
| ベクトル | 検索、クエリ、挿入、アップサート、削除、ハイブリッド検索 |
| インデックス | 作成（AUTOINDEX）、一覧表示、説明表示、削除 |
| データベース | 作成、一覧表示、説明表示、削除 |
| ユーザーとロール | RBAC セットアップ、権限管理 |
| バックアップ | 作成、復元、エクスポート、ポリシー管理 |
| インポート | S3/GCS/Azure Blob Storage からの一括データインポート |
| パーティション | 作成、ロード、リリース、管理 |
| モニタリング | クラスターのステータス、コレクション統計、ロード状態 |
| プロジェクト | プロジェクトとリージョンの管理 |
| 請求 | 利用状況クエリ、請求書 |

## エージェントに依頼できること\{#what-you-can-ask-your-agent-to-do}

インストール後は、タスクをそのまま記述してください。エージェントはそのリクエストを対応する Zilliz CLI コマンドに変換するはずです。以下の例は、自然言語のリクエストが、エージェントが実行することを想定される CLI コマンドにどのように対応するかを示しています。

- **自分のクラスターを一覧表示し、現在アクティブなものを示してください。**

    想定される CLI コマンド:

    ```bash
    zilliz cluster list
    zilliz context current
    ```

- **768 次元のベクトルフィールドを持つ product embeddings 用のコレクションを作成してください。**

    想定される CLI コマンド:

    ```bash
    zilliz collection create --name product_embeddings --dimension 768
    ```

- **S3 から自分のコレクションにデータをインポートし、インポートジョブのステータスを確認してください。**

    想定される CLI コマンド:

    ```bash
    zilliz import start --cluster-id <cluster-id> --collection product_embeddings --body '{"files": [["s3://bucket/path/data.json"]]}'
    ```

- **本番クラスターのバックアップを作成してください。**

    想定される CLI コマンド:

    ```bash
    zilliz backup create --cluster-id <cluster-id>
    ```

- **メタデータフィルターを使って自分のコレクションを検索し、上位 10 件の結果を返してください。**

    想定される CLI コマンド:

    ```bash
    zilliz vector search --collection product_embeddings --data '[[0.1, 0.2, 0.3]]' --filter 'age > 20' --limit 10 --output-fields '["name", "age"]'
    ```

- **analytics コレクションに読み取り専用アクセスを持つロールを作成してください。**

    想定される CLI コマンド:

    ```bash
    zilliz role create --role analytics_readonly
    zilliz role grant-privilege --role analytics_readonly --object-type Collection --object-name analytics --privilege Search
    zilliz role grant-privilege --role analytics_readonly --object-type Collection --object-name analytics --privilege Query
    ```

