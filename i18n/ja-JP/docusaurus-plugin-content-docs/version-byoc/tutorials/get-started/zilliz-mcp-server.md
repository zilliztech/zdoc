---
title: "MCP サーバー | BYOC"
slug: /zilliz-mcp-server
sidebar_key: zilliz-mcp-server
sidebar_label: "MCP サーバー"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、AI エージェントが標準化された [Model Context Protocol (MCP)](https://github.com/zilliztech/zilliz-mcp-server/tree/master) を介して Zilliz Cloud とシームレスに連携できるようにする MCP サーバーを提供しています。このページでは、Zilliz MCP サーバーをローカルにセットアップし、お好みの AI エージェントで使用する方法について説明します。 | BYOC"
type: origin
token: WRFqwygyNiZ0YJkmsfwcGEsSn4d
sidebar_position: 17
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - mcp
  - milvus
  - mcp サーバー

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# MCP サーバー

Zilliz Cloud は、AI エージェントが標準化された [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) を介して Zilliz Cloud とシームレスに連携できるようにする [MCP サーバー](https://github.com/zilliztech/zilliz-mcp-server/tree/master) を提供しています。このページでは、Zilliz MCP サーバーをローカルにセットアップし、お好みの AI エージェントで使用する方法について説明します。

## 始める前に\{#before-you-start}

以下の準備ができていることを確認してください。

- Python 3.10 以降がインストールされていること。

    インストールされている Python のバージョンを確認するには、ターミナルで次のコマンドを実行します。

    ```bash
    python3 -V
    ```

    利用可能な Python リリースについては、[ダウンロードページ](https://www.python.org/downloads/) を参照してください。

- uv をインストールし、PATH に追加済みであること。

    インストール済みの uv のバージョンを確認するには、ターミナルで以下のコマンドを実行します：

    ```bash
    uv -V
    ```

    [このページ](https://github.com/astral-sh/uv?tab=readme-ov-file#installation) のガイドに従ってインストールできます。

## Procedure\{#procedure}

Zilliz MCP Server を実行するには、設定を準備し、お好みの AI エージェントに追加する必要があります。

### Step 1: Prepare Zilliz MCP Server configuration\{#step-1-prepare-zilliz-mcp-server-configuration}

Zilliz MCP Server は、以下のいずれかのモードで設定できます。

#### Local mode (Standard Input/Output)\{#local-mode-standard-inputoutput}

このモードでは、Zilliz MCP Server およびお好みの AI エージェントが同じマシン上でローカルに実行され、AI エージェントが Zilliz MCP Server のライフサイクルを直接管理します。

AI エージェントが実行されているマシンに Python と uv をインストールしたら、十分な権限を持つクラスターユーザー名とパスワードを `user:pass` の形式（コロンで結合）で `YOUR-CLUSTER-TOKEN` に置き換えた後、以下のサーバー設定を使用できます。 

```json
{
  "mcpServers": {
    "zilliz-mcp-server": {
      "command": "uvx",
      "args": ["zilliz-mcp-server"],
      "env": {
          "ZILLIZ_CLOUD_TOKEN": "YOUR-CLUSTER-TOKEN"
      }
    }
  }
}
```

#### Server mode (Streamable HTTP)\{#server-mode-streamable-http}

複数の AI エージェントが異なるマシン上で実行されている間で Zilliz MCP Server を共有したい場合は、Zilliz MCP Server をサーバーモードで実行してください。これには、設定を準備する前に Zilliz MCP Server リポジトリをクローンし、別のマシン上でサーバーを起動する必要があります。

<Procedures>

1. Zilliz MCP Server リポジトリをクローンします。

    ```bash
    git clone https://github.com/zilliztech/zilliz-mcp-server.git
    cd zilliz-mcp-server
    ```

1. 環境変数ファイル（**.env**）を作成します。

    ```bash
    cp example.env .env
    ```

1. Zilliz Cloud クラスタートークンを **.env** ファイルに追加します。

    **.env** ファイルは以下のようになります。`ZILLIZ_CLOUD_TOKEN=` の末尾に、適切な権限を持つクラスタユーザー名とパスワードを `user:pass` の形式（コロンで結合）で追加してください。

    ```bash
    # Zilliz MCP Server Configuration
    # Copy this file to .env and fill in your actual values
    
    # Zilliz Cloud Configuration
    
    ZILLIZ_CLOUD_TOKEN=
    ZILLIZ_CLOUD_URI=https://api.cloud.zilliz.com
    ZILLIZ_CLOUD_FREE_CLUSTER_REGION=gcp-us-west1
    
    # MCP Server Configuration
    
    # Port for MCP server when using HTTP/SSE transports (default: 8000)
    MCP_SERVER_PORT=8000
    # Host for MCP server when using HTTP/SSE transports (default: localhost)
    MCP_SERVER_HOST=localhost
    ```

    Zilliz MCP Server はデフォルトで `localhost*:*8000` で起動します。`MCP_SERVER_HOST` と `MCP_SERVER_PORT` を適切な値に設定することで、これを変更できます。

1. Zilliz MCP Server を起動します。

    ```bash
    uv run src/zilliz_mcp_server/server.py --transport streamable-http
    ```

1. サーバー設定を準備します。

    Zilliz MCP Server はデフォルトで `localhost*:*8000` で起動します。上記の **.env** ファイルでサーバー設定を変更している場合は、以下の設定内の URL を正しいものに更新してください。

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

</Procedures>

### ステップ 2: お好みの AI エージェントに設定を追加する\{#step-2-add-the-configuration-to-your-preferred-ai-agent}

MCP は、アプリケーションが LLM にコンテキストを提供する方法を標準化するオープンプロトコルです。多くの AI 駆動型アプリケーションがこれをサポートしています。このステップでは、AI コードエディターである カーソル に設定を追加する方法を学びます。

<Procedures>

1. カーソル を起動し、トップメニューバーで **カーソル** > **Settings** > **カーソル Settings** を選択します。

1. 左側のナビゲーションペインから **ツールと統合** を選択します。

1. **Add Custom MCP** をクリックします。これにより `mcp.json` が開きます。

1. [ステップ 1](./zilliz-mcp-server#step-1-prepare-zilliz-mcp-server-configuration) で準備した設定をコピーし、開いているファイルに貼り付けます。

1. ファイルを保存して **ツールと統合** に戻ります。**MCP Tools** に Zilliz MCP Server が一覧表示され、AI エージェントが呼び出せる利用可能なツールが表示されていることを確認できます。

    ![D8YHbAKHQoEskbx23bNcj3jCnDg](https://zdoc-images.s3.us-west-2.amazonaws.com/d8yhbakhqoeskbx23bncj3jcndg.png "D8YHbAKHQoEskbx23bNcj3jCnDg")

</Procedures>

お好みの AI アプリケーションに Zilliz MCP Server を追加する手順は非常に類似しています。お使いの AI アプリケーション固有の手順に従って設定を追加してください。

## 利用可能なツール\{#available-tools}

Zilliz MCP Server は、Zilliz Cloud と対話するための以下のツールを提供します。

### コントロールプレーンツール\{#control-plane-tools}

これらのツールは、コントロールプレーン上でプロジェクトやクラスターなどのリソースを管理するために使用されます。

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
     <td><p>新しいフリーティアの Milvus クラスターを作成します。</p></td>
   </tr>
   <tr>
     <td><p><code>describe_cluster</code></p></td>
     <td><p>特定のクラスターに関する詳細情報を取得します。</p></td>
   </tr>
   <tr>
     <td><p><code>suspend_cluster</code></p></td>
     <td><p>コストを節約するために実行中のクラスターを一時停止します。</p></td>
   </tr>
   <tr>
     <td><p><code>resume_cluster</code></p></td>
     <td><p>一時停止されたクラスターを再開します。</p></td>
   </tr>
   <tr>
     <td><p><code>query_cluster_metrics</code></p></td>
     <td><p>クラスターのさまざまなパフォーマンス指標を照会します。</p></td>
   </tr>
</table>

### データプレーンツール\{#data-plane-tools}

これらのツールは、データプレーン上でデータベースとコレクションなどのリソースを管理し、ベクトル検索を実行するために使用されます。

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
     <td><p>指定されたスキーマを持つ新しいコレクションを作成します。</p></td>
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
     <td><p>スカラーフィルター式に基づいてエンティティを照会します。</p></td>
   </tr>
   <tr>
     <td><p><code>hybrid_search</code></p></td>
     <td><p>ベクトル類似性とスカラーフィルターを組み合わせたハイブリッド検索を実行します。</p></td>
   </tr>
</table>

## トラブルシューティング\{#troubleshooting}

1. **AI エージェントが Zilliz MCP Server にツールが 0 個あると報告するのはなぜですか？**

    これは通常、**Python** や **uv** などの特定の依存関係が欠落していることが原因です。それらが適切にインストールされていることを確認してください。詳細については、[始める前に](./zilliz-mcp-server#before-you-start) を参照してください。