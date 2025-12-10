---
title: "MCP Server | Cloud"
slug: /zilliz-mcp-server
sidebar_label: "MCP Server"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud provides an MCP server](https//github.com/zilliztech/zilliz-mcp-server/tree/master) that enables AI agents to interact with Zilliz Cloud seamlessly through the standardized [Model Context Protocol (MCP). This page guides you through setting up the Zilliz MCP Server locally and using it with your preferred AI agents. | Cloud"
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
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - openai vector db

---

import Admonition from '@theme/Admonition';


# MCP Server

Zilliz Cloud provides an [MCP server](https://github.com/zilliztech/zilliz-mcp-server/tree/master) that enables AI agents to interact with Zilliz Cloud seamlessly through the standardized [Model Context Protocol (MCP)](https://modelcontextprotocol.io/). This page guides you through setting up the Zilliz MCP Server locally and using it with your preferred AI agents.

## Before you start\{#before-you-start}

Ensure that you have

- Obtained a Zilliz Cloud API key. 

    You can create a one by following the guides on [this page](./manage-api-keys#create-an-api-key).

- Installed Python 3.10 or a later version.

    To check the installed Python version, run the following command in your terminal:

    ```bash
    python3 -V
    ```

    For available Python releases, refer to the [download page](https://www.python.org/downloads/).

- Installed uv and added it to your PATH. 

    To check the installed uv version, run the following command in your terminal:

    ```bash
    uv -V
    ```

    You can install it by following the guides on [this page](https://github.com/astral-sh/uv?tab=readme-ov-file#installation).

## Procedure\{#procedure}

To run Zilliz MCP Server, you need to prepare the configuration and add it to your preferred AI agents.

### Step 1: Prepare Zilliz MCP Server configuration\{#step-1-prepare-zilliz-mcp-server-configuration}

You can configure Zilliz MCP Server in either of the following modes:

#### Local mode (Standard Input/Output)\{#local-mode-standard-inputoutput}

In this mode, Zilliz MCP Server is running locally along with your preferred AI agent on the same machine, and the AI agent manages Zilliz MCP Server's lifecycle directly. 

Once you have installed Python and uv on the machine where your AI agent runs, you can use the following server configuration after you replace `YOUR-API-KEY` with a valid Zilliz Cloud API key that has sufficient permissions. 

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

#### Server mode (Streamable HTTP)\{#server-mode-streamable-http}

If you prefer to share Zilliz MCP Server among multiple AI agents running on different machines, run Zilliz MCP Server in server mode. This requires you to clone the Zilliz MCP Server repository and start the server on a separate machines before preparing the configurations.

1. Clone the Zilliz MCP Server repository.

    ```bash
    git clone https://github.com/zilliztech/zilliz-mcp-server.git
    cd zilliz-mcp-server
    ```

1. Create the environment variable file (**.env**).

    ```bash
    cp example.env .env
    ```

1. Add your Zilliz Cloud API key to the **.env** file.

    The **.env** file is similar to the following. Append a valid Zilliz Cloud API key with sufficient permissions to the end of `ZILLIZ_CLOUD_TOKEN=`.

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

    Zilliz MCP Server starts at `localhost*:*8000` by default. You can change this by setting `MCP_SERVER_HOST` and `MCP_SERVER_PORT` to proper values.

1. Start Zilliz MCP Server.

    ```bash
    uv run src/zilliz_mcp_server/server.py --transport streamable-http
    ```

1. Prepare the server configuration.

    Zilliz MCP Server starts at `localhost*:*8000` by default. If you have modified the server settings in the **.env** file above, update the URL in the following configuration with the correct one.

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

### Step 2: Add the configuration to your preferred AI agent\{#step-2-add-the-configuration-to-your-preferred-ai-agent}

MCP is an open protocol that standardizes how applications provide context to LLMs. Lots of AI-driven applications support it. In this step, you will learn how to add the configuration to Cursor, an AI code editor.

1. Start Cursor and choose **Cursor** > **Settings** > **Cursor Settings** in the top menu bar.

1. Choose **Tools & Integrations** from the left navigation pane.

1. Click **Add Custom MCP**. This opens `mcp.json`.

1. Copy the configuration prepared in [Step 1](./zilliz-mcp-server#step-1-prepare-zilliz-mcp-server-configuration) and paste it into the open file.

1. Save the file and go back to **Tools & Integrations**. You will find Zilliz MCP Server is listed in **MCP Tools** with available tools for AI agents to call.

    ![D8YHbAKHQoEskbx23bNcj3jCnDg](https://zdoc-images.s3.us-west-2.amazonaws.com/d8yhbakhqoeskbx23bncj3jcndg.png "D8YHbAKHQoEskbx23bNcj3jCnDg")

The procedures for adding Zilliz MCP Server to your preferred AI applications are very similar. You can follow the instructions specific to your AI applications to add the configuration.

## Available Tools\{#available-tools}

Zilliz MCP Server provides the following tools for you to interact with Zilliz Cloud.

### Control plane tools\{#control-plane-tools}

These tools are used to manage resources, such as projects and clusters, on the control plane.

<table>
   <tr>
     <th><p>Tool</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>list_projects</code></p></td>
     <td><p>List all projects in your Zilliz Cloud account.</p></td>
   </tr>
   <tr>
     <td><p><code>list_clusters</code></p></td>
     <td><p>List all clusters within your projects.</p></td>
   </tr>
   <tr>
     <td><p><code>create_free_cluster</code></p></td>
     <td><p>Create a new, free-tier Milvus cluster.</p></td>
   </tr>
   <tr>
     <td><p><code>describe_cluster</code></p></td>
     <td><p>Get detailed information about a specific cluster.</p></td>
   </tr>
   <tr>
     <td><p><code>suspend_cluster</code></p></td>
     <td><p>Suspend a running cluster to save costs.</p></td>
   </tr>
   <tr>
     <td><p><code>resume_cluster</code></p></td>
     <td><p>Resume a suspended cluster.</p></td>
   </tr>
   <tr>
     <td><p><code>query_cluster_metrics</code></p></td>
     <td><p>Query various performance metrics for a cluster.</p></td>
   </tr>
</table>

### Data plane tools\{#data-plane-tools}

These tools are used to manage resources, such as databases and collections, and conduct vector searches on the data plane.

<table>
   <tr>
     <th><p>Tool Name</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>list_databases</code></p></td>
     <td><p>List all databases within a specific cluster.</p></td>
   </tr>
   <tr>
     <td><p><code>list_collections</code></p></td>
     <td><p>List all collections within a database.</p></td>
   </tr>
   <tr>
     <td><p><code>create_collection</code></p></td>
     <td><p>Create a new collection with a specified schema.</p></td>
   </tr>
   <tr>
     <td><p><code>describe_collection</code></p></td>
     <td><p>Get detailed information about a collection, including its schema.</p></td>
   </tr>
   <tr>
     <td><p><code>insert_entities</code></p></td>
     <td><p>Insert entities (data records with vectors) into a collection.</p></td>
   </tr>
   <tr>
     <td><p><code>delete_entities</code></p></td>
     <td><p>Delete entities from a collection based on IDs or a filter expression.</p></td>
   </tr>
   <tr>
     <td><p><code>search</code></p></td>
     <td><p>Perform a vector similarity search on a collection.</p></td>
   </tr>
   <tr>
     <td><p><code>query</code></p></td>
     <td><p>Query entities based on a scalar filter expression.</p></td>
   </tr>
   <tr>
     <td><p><code>hybrid_search</code></p></td>
     <td><p>Perform a hybrid search combining vector similarity and scalar filters.</p></td>
   </tr>
</table>

## Troubleshooting\{#troubleshooting}

1. **Why does my AI agent report that Zilliz MCP Server has zero tools?**

    This is usually caused by missing certain dependencies, such as **Python** and **uv**. Ensure that you have installed them properly. For details, refer to [Before you start](./zilliz-mcp-server#before-you-start).