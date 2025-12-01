---
title: "MCP サーバー | BYOC"
slug: /zilliz-mcp-server
sidebar_label: "MCP サーバー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は [MCP サーバー](https://github.com/zilliztech/zilliz-mcp-server/tree/master) を提供しており、AI エージェントが標準化された [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) を介して Zilliz Cloud とシームレスにやり取りできるようにします。このページでは、Zilliz MCP サーバーをローカルにセットアップし、使用したい AI エージェントで使用する方法を説明します。 | BYOC"
type: origin
token: WRFqwygyNiZ0YJkmsfwcGEsSn4d
sidebar_position: 13
keywords:
  - zilliz
  - vector database
  - cloud
  - mcp
  - milvus
  - mcp server
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search

---

import Admonition from '@theme/Admonition';


# MCP サーバー

Zilliz Cloud は [MCP サーバー](https://github.com/zilliztech/zilliz-mcp-server/tree/master) を提供しており、AI エージェントが標準化された [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) を介して Zilliz Cloud とシームレスにやり取りできるようにします。このページでは、Zilliz MCP サーバーをローカルにセットアップし、使用したい AI エージェントで使用する方法を説明します。

## はじめる前に\{#before-you-start}

以下を確認してください：

- Zilliz Cloud API キーを取得している。

  [このページ](./manage-api-keys#create-an-api-key) のガイドに従って作成できます。

- Python 3.10 以降のバージョンがインストールされている。

  インストールされている Python バージョンを確認するには、ターミナルで以下のコマンドを実行します：

  ```bash
  python3 -V
  ```

  利用可能な Python リリースについては、[ダウンロードページ](https://www.python.org/downloads/) を参照してください。

- uv がインストールされ、PATH に追加されている。

  インストールされている uv バージョンを確認するには、ターミナルで以下のコマンドを実行します：

  ```bash
  uv -V
  ```

  [このページ](https://github.com/astral-sh/uv?tab=readme-ov-file#installation) のガイドに従ってインストールできます。

## 手順\{#procedure}

Zilliz MCP サーバーを実行するには、設定を準備し、使用したい AI エージェントに追加する必要があります。

### ステップ 1: Zilliz MCP サーバー設定を準備\{#step-1-prepare-zilliz-mcp-server-configuration}

Zilliz MCP サーバーは、以下のいずれかのモードで設定できます：

#### ローカルモード (標準入力/出力)\{#local-mode-standard-inputoutput}

このモードでは、Zilliz MCP サーバーは使用中の AI エージェントと同じマシンでローカルに実行され、AI エージェントが Zilliz MCP サーバーのライフサイクルを直接管理します。

AI エージェントが実行されているマシンに Python と uv をインストールすると、有効な Zilliz Cloud API キー（十分な権限を持つ）に `YOUR-API-KEY` を置き換えた後、以下のサーバー設定を使用できます。

```json
{
  "mcpServers": {
    "zilliz-mcp-server": {
      "command": "uvx",
      "args": ["zilliz-mcp-server"],
      "env": {
          "ZILLIZ_CLOUD_TOKEN": "YOUR-API-KEY"
      }
    }
  }
}
```

#### サーバーモード (ストリーム可能な HTTP)\{#server-mode-streamable-http}

複数のマシンで実行されている複数の AI エージェントで Zilliz MCP サーバーを共有したい場合は、サーバーモードで Zilliz MCP サーバーを実行します。これには、Zilliz MCP サーバーリポジトリをクローンし、設定を準備する前に別のマシンでサーバーを起動する必要があります。

1. Zilliz MCP サーバーリポジトリをクローンします。

    ```bash
    git clone https://github.com/zilliztech/zilliz-mcp-server.git
    cd zilliz-mcp-server
    ```

1. 環境変数ファイル (**.env**) を作成します。

    ```bash
    cp example.env .env
    ```

1. **.env** ファイルに Zilliz Cloud API キーを追加します。

    **.env** ファイルは以下のようになります。十分な権限を持つ有効な Zilliz Cloud API キーを `ZILLIZ_CLOUD_TOKEN=` の末尾に追加してください。

    ```bash
    # Zilliz MCP サーバー設定
    # このファイルを .env にコピーし、実際の値を入力してください

    # Zilliz Cloud 設定

    ZILLIZ_CLOUD_TOKEN=
    ZILLIZ_CLOUD_URI=https://api.cloud.zilliz.com
    ZILLIZ_CLOUD_FREE_CLUSTER_REGION=gcp-us-west1

    # MCP サーバー設定

    # HTTP/SSE トランスポートを使用する場合の MCP サーバーのポート (デフォルト: 8000)
    MCP_SERVER_PORT=8000
    # HTTP/SSE トランスポートを使用する場合の MCP サーバーのホスト (デフォルト: localhost)
    MCP_SERVER_HOST=localhost
    ```

    Zilliz MCP サーバーはデフォルトで `localhost:*8000` で起動します。`MCP_SERVER_HOST` と `MCP_SERVER_PORT` を適切な値に設定して変更できます。

1. Zilliz MCP サーバーを起動します。

    ```bash
    uv run src/zilliz_mcp_server/server.py --transport streamable-http
    ```

1. サーバー設定を準備します。

    Zilliz MCP サーバーはデフォルトで `localhost:*8000` で起動します。上記の **.env** ファイルでサーバー設定を変更した場合は、以下の設定の URL を正しいものに更新してください。

    ```json
    {
      "mcpServers": {
        "zilliz-mcp-server": {
          "url": "http://localhost:8000/mcp",
          "transport": "streamable-http",
          "description": "Zilliz Cloud および Milvus MCP サーバー"
        }
      }
    }
    ```

### ステップ 2: 使用する AI エージェントに設定を追加\{#step-2-add-the-configuration-to-your-preferred-ai-agent}

MCP は、アプリケーションが LLM にコンテキストを提供する方法を標準化するオープンプロトコルです。多くの AI 主導のアプリケーションがこれをサポートしています。このステップでは、AI コードエディタである Cursor に設定を追加する方法を学びます。

1. Cursor を起動し、トップメニューバーで **Cursor** > **設定** > **Cursor 設定** を選択します。

1. 左側のナビゲーションペインから **ツールと統合** を選択します。

1. **カスタム MCP を追加** をクリックします。これで `mcp.json` が開きます。

1. [ステップ 1](./zilliz-mcp-server#step-1-prepare-zilliz-mcp-server-configuration) で準備した設定をコピーして、開いたファイルに貼り付けます。

1. ファイルを保存し、**ツールと統合** に戻ります。**MCP ツール** に Zilliz MCP サーバーが一覧表示され、AI エージェントが呼び出せる利用可能なツールが表示されます。

    ![D8YHbAKHQoEskbx23bNcj3jCnDg](/img/D8YHbAKHQoEskbx23bNcj3jCnDg.png)

Zilliz MCP サーバーを希望の AI アプリケーションに追加する手順は非常に似ています。AI アプリケーションに特有の指示に従って設定を追加できます。

## 利用可能なツール\{#available-tools}

Zilliz MCP サーバーは、Zilliz Cloud とやり取りするための以下のツールを提供します。

### コントロールプレーンツール\{#control-plane-tools}

これらのツールは、プロジェクトやクラスターなどのリソースをコントロールプレーンで管理するために使用されます。

<table>
   <tr>
     <th><p>ツール</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>list_projects</code></p></td>
     <td><p>Zilliz Cloud アカウント内のすべてのプロジェクトを一覧表示します。</p></td>
   </tr>
   <tr>
     <td><p><code>list_clusters</code></p></td>
     <td><p>プロジェクト内のすべてのクラスターを一覧表示します。</p></td>
   </tr>
   <tr>
     <td><p><code>create_free_cluster</code></p></td>
     <td><p>新しいフリーティア Milvus クラスターを作成します。</p></td>
   </tr>
   <tr>
     <td><p><code>describe_cluster</code></p></td>
     <td><p>特定のクラスターに関する詳細情報を取得します。</p></td>
   </tr>
   <tr>
     <td><p><code>suspend_cluster</code></p></td>
     <td><p>実行中のクラスターを一時停止してコストを節約します。</p></td>
   </tr>
   <tr>
     <td><p><code>resume_cluster</code></p></td>
     <td><p>一時停止したクラスターを再開します。</p></td>
   </tr>
   <tr>
     <td><p><code>query_cluster_metrics</code></p></td>
     <td><p>クラスターのさまざまなパフォーマンスメトリクスを照会します。</p></td>
   </tr>
</table>

### データプレーンツール\{#data-plane-tools}

これらのツールは、データベースやコレクションなどのリソースを管理し、データプレーンでベクトル検索を実行するために使用されます。

<table>
   <tr>
     <th><p>ツール名</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>list_databases</code></p></td>
     <td><p>特定のクラスター内のすべてのデータベースを一覧表示します。</p></td>
   </tr>
   <tr>
     <td><p><code>list_collections</code></p></td>
     <td><p>データベース内のすべてのコレクションを一覧表示します。</p></td>
   </tr>
   <tr>
     <td><p><code>create_collection</code></p></td>
     <td><p>指定されたスキーマで新しいコレクションを作成します。</p></td>
   </tr>
   <tr>
     <td><p><code>describe_collection</code></p></td>
     <td><p>スキーマを含むコレクションに関する詳細情報を取得します。</p></td>
   </tr>
   <tr>
     <td><p><code>insert_entities</code></p></td>
     <td><p>エンティティ（ベクトルを含むデータレコード）をコレクションに挿入します。</p></td>
   </tr>
   <tr>
     <td><p><code>delete_entities</code></p></td>
     <td><p>ID またはフィルター式に基づいてコレクションからエンティティを削除します。</p></td>
   </tr>
   <tr>
     <td><p><code>search</code></p></td>
     <td><p>コレクションでベクトル類似性検索を実行します。</p></td>
   </tr>
   <tr>
     <td><p><code>query</code></p></td>
     <td><p>スカラー（数値）フィルター式に基づいてエンティティを照会します。</p></td>
   </tr>
   <tr>
     <td><p><code>hybrid_search</code></p></td>
     <td><p>ベクトル類似性とスカラー（数値）フィルターを組み合わせたハイブリッド検索を実行します。</p></td>
   </tr>
</table>

## トラブルシューティング\{#troubleshooting}

1. **AI エージェントが Zilliz MCP サーバーのツール数が 0 と報告するのはなぜですか？**

   これは通常、**Python** や **uv** などの特定の依存関係が不足しているために発生します。それらが適切にインストールされていることを確認してください。詳細は、[はじめる前に](./zilliz-mcp-server#before-you-start) を参照してください。