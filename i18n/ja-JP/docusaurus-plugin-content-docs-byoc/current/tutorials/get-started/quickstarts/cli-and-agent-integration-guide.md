---
title: "CLI とエージェント統合のクイックスタート | BYOC"
slug: /cli-and-agent-integration-guide
sidebar_label: "CLI とエージェント統合のクイックスタート"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz CLI と、ローカルのワークフローに合ったエージェント統合をインストールします。Zilliz は、Claude Code と OpenAI Codex 向けの Zilliz Plugin、スキル互換エージェント向けの Zilliz Skill、およびターミナルや自動化ワークフローで直接使用できる Zilliz CLI を通じて、エージェント統合をサポートしています。 | BYOC"
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

Zilliz CLI と、ローカルのワークフローに合ったエージェント統合をインストールします。Zilliz は、Claude Code と OpenAI Codex 向けの Zilliz Plugin、スキル互換エージェント向けの Zilliz Skill、およびターミナルや自動化ワークフローで直接使用できる Zilliz CLI を通じて、エージェント統合をサポートしています。

セットアップが完了すると、エージェントに Zilliz Cloud の直接操作を依頼したり、スクリプトやターミナルで CLI を使用したりできます。

## インストール\{#installation}

開始する前に、以下を満たしていることを確認してください。

- [Zilliz Cloud アカウント](https://cloud.zilliz.com/login) を保有していること。

- [Zilliz Claude Code Plugin](./zilliz-plugin) を使用する場合は、Claude Code がインストールされていること。

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

次のように [codex-marketplace](https://www.npmjs.com/package/codex-marketplace) を使用して直接インストールすることもできます。

```plaintext
npx codex-marketplace add zilliztech/zilliz-plugin --plugins
```

### Claude Code 向け Zilliz Plugin のインストール\{#install-zilliz-plugin-for-claude-code}

Claude Code から直接 Zilliz Cloud を操作する場合は、[Zilliz Claude Code Plugin](./zilliz-plugin) を使用します。

<Procedures>

1. Claude Code を実行します。

    ```bash
    > claude
    ```

1. プラグインマーケットプレイスを開きます。

    ```bash
    /plugin
    ```

1. Zilliz Plugin を検索してインストールします。

    **Discover** タブに移動して zilliz を検索し、zilliz プラグインを選択してインストールします。

    ![TqS3b4z7Ho9xcXxHJaIc7HTZn1e](https://zdoc-images.s3.us-west-2.amazonaws.com/tqs3b4z7ho9xcxxhjaic7htzn1e.png "TqS3b4z7Ho9xcXxHJaIc7HTZn1e")

1. クイックスタートウィザードを実行します。このウィザードでは、CLI のインストール、認証、クラスターへの接続、および最初の操作について順を追って案内します。

    ```plaintext
    /zilliz:quickstart
    ```

</Procedures>

### 主要なエージェントフレームワーク向け Zilliz Skill のインストール\{#install-zilliz-skill-for-common-agent-frameworks}

Codex、Gemini CLI、Cursor などのコーディングエージェント、またはその他のスキル互換エージェントがエージェントスキルをサポートしている場合は、次のように [Zilliz Skill](https://github.com/zilliztech/zilliz-skill) をインストールします。

```bash
npx skills add zilliztech/zilliz-skill
```

このコマンドを実行すると、対象のエージェントフレームワークとインストールスコープの選択を求めるプロンプトが表示されます。

### Zilliz CLI のインストール\{#install-zilliz-cli}

[Zilliz CLI](/reference/cli/cli/overview) は、Plugin および Skill で使用される基本のコマンドラインツールです。

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

1. 認証を行います。

    Zilliz Cloud アカウントで認証します。

    ```bash
    zilliz login
    ```

    ブラウザが開いて認証が行われます。ログイン後、認証情報はローカルに保存されます。

</Procedures>

## CLI、Plugin、Skill の使い分け\{#when-to-use-cli-plugin-or-skill}

これらのツールは、次のような場合に使用します。

- ローカル環境で手動による開発とテストを行う場合。

- 反復可能なワークフロー向けの自動化運用スクリプトを作成する場合。

- エージェントがベクトルデータベースまたは ベクトル Lakebase サービスを自動的に呼び出せるようにする場合。

### ツールの比較\{#tool-comparison}

Claude Code Plugin、Zilliz Skill、および Zilliz CLI は、同じ主要な機能をカバーしているはずです。機能の範囲ではなく、ワークフローに基づいて選択してください。

|  | **OpenAI Codex plugin** | **Claude Code Plugin** | **Zilliz Skill** | **Zilliz CLI** |
| --- | --- | --- | --- | --- |
| **最適な用途** | Codex の自然言語ワークフロー | Claude Code の自然言語ワークフロー | スキル互換のコーディングエージェント | ターミナルでの利用、スクリプト、および CI |
| **セットアップ** | `quickstart` スキルによるガイド付きセットアップ | `/zilliz:quickstart` | `npx skills add zilliztech/zilliz-skill` | インストールスクリプト + `zilliz login` |
| **自然言語** | はい | はい | はい | いいえ |
| **自動化** | エージェント支援 | エージェント支援 | エージェント支援 | スクリプト優先 |
| **構造化出力** | エージェントが読み取れるレスポンス | エージェントが読み取れるレスポンス | エージェントが読み取れるレスポンス | スクリプト向けの `--output json` |

### サポートされている機能\{#supported-capabilities}

次の表に、CLI、Plugin、および Skill で実行できる操作を示します。

| 領域 | できること |
| --- | --- |
| クラスター | 作成、削除、一時停止、再開、変更 |
| コレクション | カスタムスキーマでの作成、ロード、リリース、名前変更、ドロップ |
| ベクトル | 検索、クエリ、挿入、アップサート、削除、ハイブリッド検索 |
| インデックス | 作成（AUTOINDEX）、一覧表示、詳細表示、ドロップ |
| データベース | 作成、一覧表示、詳細表示、ドロップ |
| ユーザーとロール | RBAC の設定、権限管理 |
| バックアップ | 作成、復元、エクスポート、ポリシー管理 |
| インポート | S3/GCS/Azure Blob Storage からのバルクデータインポート |
| パーティション | 作成、ロード、リリース、管理 |
| モニタリング | クラスターのステータス、コレクションの統計情報、ロード状態 |
| プロジェクト | プロジェクトとリージョンの管理 |
| 課金 | 使用量の照会、請求書 |

## エージェントに依頼できること\{#what-you-can-ask-your-agent-to-do}

インストールが完了したら、実行したいタスクを直接伝えてください。エージェントがそのリクエストを対応する Zilliz CLI コマンドに変換します。次の例は、自然言語によるリクエストが、エージェントが実行すると想定される CLI コマンドにどのように対応するかを示しています。

- **クラスターの一覧を表示し、現在アクティブなものを教えてください。**

    想定される CLI コマンド:

    ```bash
    zilliz cluster list
    zilliz context current
    ```

- **768 次元のベクトルフィールドを持つ、商品埋め込み用のコレクションを作成してください。**

    想定される CLI コマンド:

    ```bash
    zilliz collection create --name product_embeddings --dimension 768
    ```

- **S3 からコレクションにデータをインポートし、インポートジョブのステータスを確認してください。**

    想定される CLI コマンド:

    ```bash
    zilliz import start --cluster-id <cluster-id> --collection product_embeddings --body '{"files": [["s3://bucket/path/data.json"]]}'
    ```

- **本番環境のクラスターのバックアップを作成してください。**

    想定される CLI コマンド:

    ```bash
    zilliz backup create --cluster-id <cluster-id>
    ```

- **メタデータフィルターを使用してコレクションを検索し、上位 10 件の結果を返してください。**

    想定される CLI コマンド:

    ```bash
    zilliz vector search --collection product_embeddings --data '[[0.1, 0.2, 0.3]]' --filter 'age > 20' --limit 10 --output-fields '["name", "age"]'
    ```

- **analytics コレクションへの読み取り専用アクセス権を持つロールを作成してください。**

    想定される CLI コマンド:

    ```bash
    zilliz role create --role analytics_readonly
    zilliz role grant-privilege --role analytics_readonly --object-type Collection --object-name analytics --privilege Search
    zilliz role grant-privilege --role analytics_readonly --object-type Collection --object-name analytics --privilege Query
    ```

