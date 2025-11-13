---
title: "MCP Server | Cloud"
slug: /zilliz-mcp-server
sidebar_label: "MCP Server"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、AIエージェントが標準化された[Model Context Protocol (MCP)](https://modelcontextprotocol.io/)を通じてZilliz Cloudとシームレスにやり取りできるようにするMCPサーバーを提供します。このページでは、Zilliz MCP Serverをローカルにセットアップし、お気に入りのAIエージェントで使用する方法を説明します。 | Cloud"
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
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search

---

import Admonition from '@theme/Admonition';


# MCP Server

Zilliz Cloudは、AIエージェントが標準化された[Model Context Protocol (MCP)](https://modelcontextprotocol.io/)を通じてZilliz Cloudとシームレスにやり取りできるようにする[MCPサーバー](https://github.com/zilliztech/zilliz-mcp-server/tree/master)を提供します。このページでは、Zilliz MCP Serverをローカルにセットアップし、お気に入りのAIエージェントで使用する方法を説明します。

## 始める前に\{#before-you-start}

以下を確保してください：

- Zilliz Cloud APIキーを取得した。

    [このページ](./manage-api-keys#create-an-api-key)のガイドに従って作成できます。

- Python 3.10以降のバージョンをインストールした。

    インストールされたPythonバージョンを確認するには、端末で以下のコマンドを実行します：

    ```bash
    python3 -V
    ```

    利用可能なPythonリリースについては、[ダウンロードページ](https://www.python.org/downloads/)を参照してください。

- uvをインストールし、PATHに追加した。

    インストールされたuvバージョンを確認するには、端末で以下のコマンドを実行します：

    ```bash
    uv -V
    ```

    [このページ](https://github.com/astral-sh/uv?tab=readme-ov-file#installation)のガイドに従ってインストールできます。

## 手順\{#procedure}

Zilliz MCP Serverを実行するには、設定を準備し、お気に入りのAIエージェントに追加する必要があります。

### ステップ1：Zilliz MCP Serverの設定を準備\{#step-1-prepare-zilliz-mcp-server-configuration}

Zilliz MCP Serverは以下のモードのいずれかで構成できます：

#### ローカルモード（標準入力/出力）\{#local-mode-standard-inputoutput}

このモードでは、Zilliz MCP Serverが同じマシン上で実行され、AIエージェントがZilliz MCP Serverのライフサイクルを直接管理します。

AIエージェントを実行するマシンにPythonとuvをインストールしたら、`YOUR-API-KEY`を適切な権限を持つ有効なZilliz Cloud APIキーに置き換えた後、以下のサーバー構成を使用できます。

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

#### サーバーモード（Streamable HTTP）\{#server-mode-streamable-http}

異なるマシンで実行される複数のAIエージェント間でZilliz MCP Serverを共有したい場合は、サーバーモードでZilliz MCP Serverを実行します。これには、Zilliz MCP Serverリポジトリをクローンし、設定を準備する前に別のマシンでサーバーを起動する必要があります。

1. Zilliz MCP Serverリポジトリをクローンします。

    ```bash
    git clone https://github.com/zilliztech/zilliz-mcp-server.git
    cd zilliz-mcp-server
    ```

1. 環境変数ファイル（**.env**）を作成します。

    ```bash
    cp example.env .env
    ```

1. Zilliz Cloud APIキーを**.env**ファイルに追加します。

    **.env**ファイルは以下のようになります。適切な権限を持つ有効なZilliz Cloud APIキーを`ZILLIZ_CLOUD_TOKEN=`の末尾に追加してください。

    ```bash
    # Zilliz MCP Server Configuration
    # Copy this file to .env and fill in your actual values

    # Zilliz Cloud Configuration

    ZILLIZ_CLOUD_TOKEN=
    ZILLIZ_CLOUD_URI=https://api.cloud.zilliz.com
    ZILLIZ_CLOUD_FREE_CLUSTER_REGION=gcp-us-west1

    # MCP Server Configuration

    # HTTP/SSEトランスポート使用時のMCPサーバーのポート（デフォルト：8000）
    MCP_SERVER_PORT=8000
    # HTTP/SSEトランスポート使用時のMCPサーバーのホスト（デフォルト：localhost）
    MCP_SERVER_HOST=localhost
    ```

    Zilliz MCP Serverはデフォルトで`localhost:8000`で起動します。`MCP_SERVER_HOST`と`MCP_SERVER_PORT`を適切な値に設定して変更できます。

1. Zilliz MCP Serverを起動します。

    ```bash
    uv run src/zilliz_mcp_server/server.py --transport streamable-http
    ```

1. サーバー構成を準備します。

    Zilliz MCP Serverはデフォルトで`localhost:8000`で起動します。上記の**.env**ファイルでサーバー設定を変更した場合は、以下の構成のURLを正しいものに更新してください。

    ```json
    {
      "mcpServers": {
        "zilliz-mcp-server": {
          "url": "http://localhost:8000/mcp",
          "transport": "streamable-http",
          "description": "Zilliz Cloud and Milvus MCP Server"
        }
      }
    }
    ```

### ステップ2：お気に入りのAIエージェントに構成を追加\{#step-2-add-the-configuration-to-your-preferred-ai-agent}

MCPは、アプリケーションがLLMにコンテキストを提供する方法を標準化するオープンプロトコルです。多くのAI駆動アプリケーションがこれをサポートしています。このステップでは、AIコードエディタのCursorに構成を追加する方法を学びます。

1. Cursorを起動し、トップメニューバーで**Cursor** > **Settings** > **Cursor Settings**を選択します。

1. 左側のナビゲーションペインから**Tools & Integrations**を選択します。

1. **Add Custom MCP**をクリックします。これにより`mcp.json`が開きます。

1. [ステップ1](./zilliz-mcp-server#step-1-prepare-zilliz-mcp-server-configuration)で準備した構成をコピーし、開いているファイルに貼り付けます。

1. ファイルを保存し、**Tools & Integrations**に戻ります。AIエージェントが呼び出すことのできるツールとして、**MCP Tools**にZilliz MCP Serverが一覧表示されていることが確認できます。

    ![D8YHbAKHQoEskbx23bNcj3jCnDg](/img/D8YHbAKHQoEskbx23bNcj3jCnDg.png)

お気に入りのAIアプリケーションにZilliz MCP Serverを追加する手順は非常に似ています。AIアプリケーション固有の説明に従って構成を追加してください。

## 利用可能なツール\{#available-tools}

Zilliz MCP Serverは、Zilliz Cloudとやり取りするための以下のツールを提供します。

### 制御プレーンツール\{#control-plane-tools}

これらのツールは、プロジェクトやクラスターなどのリソースを制御プレーンで管理するために使用されます。

<table>
   <tr>
     <th><p>ツール</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>list_projects</code></p></td>
     <td><p>Zilliz Cloudアカウント内のすべてのプロジェクトを一覧表示します。</p></td>
   </tr>
   <tr>
     <td><p><code>list_clusters</code></p></td>
     <td><p>プロジェクト内のすべてのクラスターを一覧表示します。</p></td>
   </tr>
   <tr>
     <td><p><code>create_free_cluster</code></p></td>
     <td><p>新しい無料版Milvusクラスターを作成します。</p></td>
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
     <td><p>一時停止されたクラスターを再開します。</p></td>
   </tr>
   <tr>
     <td><p><code>query_cluster_metrics</code></p></td>
     <td><p>クラスターのさまざまなパフォーマンスメトリックを照会します。</p></td>
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
     <td><p>エンティティ（ベクトルを持つデータレコード）をコレクションに挿入します。</p></td>
   </tr>
   <tr>
     <td><p><code>delete_entities</code></p></td>
     <td><p>IDまたはフィルター式に基づいてコレクションからエンティティを削除します。</p></td>
   </tr>
   <tr>
     <td><p><code>search</code></p></td>
     <td><p>コレクションでベクトル類似性検索を実行します。</p></td>
   </tr>
   <tr>
     <td><p><code>query</code></p></td>
     <td><p>スカラー フィルター式に基づいてエンティティを照会します。</p></td>
   </tr>
   <tr>
     <td><p><code>hybrid_search</code></p></td>
     <td><p>ベクトル類似性とスカラー フィルターを組み合わせたハイブリッド検索を実行します。</p></td>
   </tr>
</table>

## トラブルシューティング\{#troubleshooting}

1. **AIエージェントがZilliz MCP Serverにツールがゼロと報告するのはなぜですか？**

    これは通常、**Python**や**uv**などの特定の依存関係が欠落していることが原因です。これらを適切にインストールしたことを確認してください。詳細については、[始める前に](./zilliz-mcp-server#before-you-start)を参照してください。