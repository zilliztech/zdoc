---
title: "MCP Server | Cloud"
slug: /zilliz-mcp-server
sidebar_key: zilliz-mcp-server
sidebar_label: "MCP Server"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供了 Zilliz MCP Server](https//github.com/zilliztech/zilliz-mcp-server/tree/master)，使 AI 智能体能够通过标准化的[模型上下文协议（Model Context Protocol，MCP）无缝地与 Zilliz Cloud 进行交互。本页面将指导你如何在本地设置 Zilliz MCP 服务器，并将其与你喜爱的 AI 智能体配合使用。 | Cloud"
type: origin
token: BUaEwl1UkiSVtLkKMUocinNMntT
sidebar_position: 12
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - mcp

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# MCP Server

Zilliz Cloud 提供了 [Zilliz MCP Server](https://github.com/zilliztech/zilliz-mcp-server/tree/master)，使 AI 智能体能够通过标准化的[模型上下文协议](https://modelcontextprotocol.io/)（Model Context Protocol，MCP）无缝地与 Zilliz Cloud 进行交互。本页面将指导你如何在本地设置 Zilliz MCP 服务器，并将其与你喜爱的 AI 智能体配合使用。

## 准备工作\{#before-you-start}

请确保你已完成以下准备：

- 已获取 Zilliz Cloud 的 API 密钥。你可以根据[此页](./manage-api-keys)上的指引创建密钥。

- 已安装 Python 3.10 或更高版本。要查看已安装的 Python 版本，请在终端中运行以下命令：  

    ```bash
    python3 -V
    ```

    有关可用的 Python 版本，请访问其[下载页面](https://www.python.org/downloads/)。

- 已安装 uv 并将其添加到系统路径（PATH）中。要查看已安装的 uv 版本，请在终端中运行以下命令：  

    ```bash
    uv -V
    ```

    你可以根据[此页](https://github.com/astral-sh/uv?tab=readme-ov-file#installation)上的指引进行安装。

## 操作步骤\{#procedure}

要运行 Zilliz MCP Server，你需要准备好配置文件，并将其添加到你喜爱的 AI 智能体中。

### 步骤 1：准备 Zilliz MCP Server 配置\{#step-1-prepare-zilliz-mcp-server-configuration}

您可以使用如下两种方式配置准备 Zilliz MCP Server。

#### 本地模式（Standard Input/Output）\{#local-mode-standard-inputoutput}

在这种模式下，Zilliz MCP Server 与你喜爱的 AI 智能体在同一台机器上本地运行，且 AI 智能体直接管理 Zilliz MCP Server 的生命周期。

在你的 AI 智能体所运行的机器上安装了 Python 和 uv 之后，只需将以下服务器配置中的 `YOUR-CLUSTER_TOKEN` 替换为具有足够权限且有效 Zilliz Cloud API 密钥或者一个由冒号（:）连接的目标集群的用户名和密码，如 `username:password`，即可使用该配置。

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

#### 服务器模式（Streamable HTTP）\{#server-mode-streamable-http}

如果你希望在不同机器上运行的多个 AI 智能体之间共享 Zilliz MCP Server，可以以服务器模式运行 Zilliz MCP Server。你需要先克隆 Zilliz MCP Server 的代码仓库，并在独立的机器上启动服务器，然后再进行配置文件的准备。

<Procedures>

1. 克隆 Zilliz MCP Server 仓库。

    ```bash
    git clone https://github.com/zilliztech/zilliz-mcp-server.git
    cd zilliz-mcp-server
    ```

1. 创建环境变量文件（**.env**）。

    ```bash
    cp example.env .env
    ```

1. 添加 Zilliz Cloud API Key 到 **.env** 文件。

    该文件如下所示。您需要将您的具有足够权限且有效 Zilliz Cloud API 密钥或者一个由冒号（:）连接的目标集群的用户名和密码，如 `username:password`，添加到 `ZILLIZ_CLOUD_TOKEN=` 的后面。

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

    Zilliz MCP Server 默认监听 `localhost:8000`。您可以通过修改`MCP_SERVER_HOST` 和 `MCP_SERVER_PORT` 来修改此设置。

1. 启动 Zilliz MCP Server。

    ```bash
    uv run src/zilliz_mcp_server/server.py --transport streamable-http
    ```

1. 准备 Zilliz MCP Server 配置文件。

    Zilliz MCP Server 默认监听 `localhost:8000`。如果您修改了 .env 文件中的相关设置，需要更新配置中的 `url` 参数为正确的地址。

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

### 步骤2：添加服务器配置到 AI Agent\{#step-2-add-the-configuration-to-your-preferred-ai-agent}

MCP 是一种开放协议，用于标准化应用程序向大语言模型（LLM）提供上下文的方式，许多 AI 驱动的应用程序都支持该协议。在本步骤中，你将学习如何将配置添加到 AI 代码编辑器 Cursor 中。

<Procedures>

1. 启动 Cursor，然后在顶部菜单栏中选择 **Cursor** > **Settings** > **Cursor Settings**。

1. 在左侧导航栏中选择 **Tools & Integrations**。

1. 点击 **Add Custom MCP**。这将打开 `mcp.json` 文件。

1. 将你在[步骤 1 ](./zilliz-mcp-server#step-1-prepare-zilliz-mcp-server-configuration)中准备好的配置复制并粘贴到打开的文件中。

1. 保存文件并返回到 **Tools & Integrations** 页面。你会看到 **Zilliz MCP Server** 已列在 **MCP Tools** 中，并显示了可供 AI 智能体调用的可用工具。

    ![KOzMbMi9PozfpQx4CsOcSgQjnXf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/KOzMbMi9PozfpQx4CsOcSgQjnXf.png "KOzMbMi9PozfpQx4CsOcSgQjnXf")

</Procedures>

将 Zilliz MCP 服务器添加到你偏好的 AI 应用程序中的操作流程非常相似。你可以根据所使用的 AI 应用程序提供的具体指引来添加配置文件。

## 可用工具\{#available-tools}

Zilliz MCP Server 提供了以下工具，供你与 Zilliz Cloud 进行交互。

### 控制平面工具\{#control-plane-tools}

这些工具用于在控制平面上管理资源，例如项目和集群。

<table>
   <tr>
     <th><p>Tool</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>list_projects</code></p></td>
     <td><p>列出你在 Zilliz Cloud 账户中的所有项目。</p></td>
   </tr>
   <tr>
     <td><p><code>list_clusters</code></p></td>
     <td><p>列出项目内的所有集群。</p></td>
   </tr>
   <tr>
     <td><p><code>create_free_cluster</code></p></td>
     <td><p>创建一个新的免费版 Milvus 集群。</p></td>
   </tr>
   <tr>
     <td><p><code>describe_cluster</code></p></td>
     <td><p>获取某个特定集群的详细信息。</p></td>
   </tr>
   <tr>
     <td><p><code>suspend_cluster</code></p></td>
     <td><p>暂停正在运行的集群以节省成本。</p></td>
   </tr>
   <tr>
     <td><p><code>resume_cluster</code></p></td>
     <td><p>恢复已暂停的集群。</p></td>
   </tr>
   <tr>
     <td><p><code>query_cluster_metrics</code></p></td>
     <td><p>查询集群的各项性能指标。</p></td>
   </tr>
</table>

### 数据平面工具\{#data-plane-tools}

这些工具用于在数据平面上管理资源（如数据库和集合），并执行向量搜索。

<table>
   <tr>
     <th><p>Tool Name</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>list_databases</code></p></td>
     <td><p>列出指定集群中的所有数据库。</p></td>
   </tr>
   <tr>
     <td><p><code>list_collections</code></p></td>
     <td><p>列出数据库中的所有集合（collection）。</p></td>
   </tr>
   <tr>
     <td><p><code>create_collection</code></p></td>
     <td><p>使用指定的 schema 创建一个新的集合。</p></td>
   </tr>
   <tr>
     <td><p><code>describe_collection</code></p></td>
     <td><p>获取集合的详细信息，包括其 schema。</p></td>
   </tr>
   <tr>
     <td><p><code>insert_entities</code></p></td>
     <td><p>将实体（包含向量的数据记录）插入到集合中。</p></td>
   </tr>
   <tr>
     <td><p><code>delete_entities</code></p></td>
     <td><p>根据 ID 或过滤表达式从集合中删除实体。</p></td>
   </tr>
   <tr>
     <td><p><code>search</code></p></td>
     <td><p>在集合上执行向量相似性搜索。</p></td>
   </tr>
   <tr>
     <td><p><code>query</code></p></td>
     <td><p>根据标量过滤表达式查询实体。</p></td>
   </tr>
   <tr>
     <td><p><code>hybrid_search</code></p></td>
     <td><p>执行结合向量相似性和标量过滤的混合搜索。</p></td>
   </tr>
</table>

## 常见问题排查\{#troubleshooting}

1. **为什么我的 AI 智能体提示 Zilliz MCP Server 没有提供任何工具？**

    这种情况通常是因为缺少必要的依赖项（如 Python 或 uv）导致的。请确保你已正确安装这些依赖项。具体要求请参见[准备工作](./zilliz-mcp-server#before-you-start)。