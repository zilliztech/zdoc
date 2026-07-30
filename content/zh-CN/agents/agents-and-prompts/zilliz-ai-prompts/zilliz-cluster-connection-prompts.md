---
title: "Cluster Connection | Cloud"
slug: /zilliz-cluster-connection-prompts
sidebar_label: "Cluster Connection"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "You can use this prompt for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently. | Cloud"
type: origin
token: XgbAwy9ZUimC1Pk7kBtcEKsIn7d
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - ai-agents
  - decision matrix
  - prompts
  - cluster connection
displayed_sidebar: agentsSidebar

---

import Admonition from '@theme/Admonition';


# Cluster Connection

You can use this prompt for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently.

## How to use these prompts

Save the Zilliz Cloud prompt to a file in your repo, then include it in your AI tool when chatting. The table below demonstrates where to place the prompt in different tools.

<table>
   <tr>
     <th><p><strong>Tool</strong></p></th>
     <th><p><strong>Where to place the prompt</strong></p></th>
     <th><p><strong>Reference</strong></p></th>
   </tr>
   <tr>
     <td><p>Claude Code</p></td>
     <td><p>Include the prompt in your <code>CLAUDE.md</code> file.</p></td>
     <td><p><a href="https://code.claude.com/docs/en/memory">Store instructions and memories</a></p></td>
   </tr>
   <tr>
     <td><p>Cursor</p></td>
     <td><p>Add the prompt to your project rules.</p></td>
     <td><p><a href="https://docs.cursor.com/en/context/rules">Configure project rules</a></p></td>
   </tr>
   <tr>
     <td><p>GitHub Copilot</p></td>
     <td><p>Save the prompt to a file in your project and reference it using <code>#&lt;filename&gt;</code>.</p></td>
     <td><p><a href="https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions">Custom instructions in Copilot</a></p></td>
   </tr>
   <tr>
     <td><p>Gemini CLI</p></td>
     <td><p>Include the prompt in your <code>GEMINI.md</code> file.</p></td>
     <td><p><a href="https://codelabs.developers.google.com/gemini-cli-hands-on">Gemini CLI codelab</a></p></td>
   </tr>
</table>

## Prompt

```plaintext
  # Zilliz Cloud Cluster Connection Prompt
  Help me connect to a Zilliz Cloud cluster.

  You are an expert Zilliz Cloud assistant. Use official Zilliz Cloud connection concepts and avoid generic Milvus advice unless it applies directly.

  ## You must follow these Zilliz Cloud rules:
  - To connect to a cluster, use the cluster endpoint from the Zilliz Cloud console.
  - Authenticate with either:
    - an API key, or
    - cluster credentials in the form \`username:password\`
  - The default cluster user is \`db_admin\`.
  - The initial cluster password is shown only once during cluster creation, so tell me to save it if I have not done so.
  - Separate connection setup from data operations.
  - If I mention REST, explain that REST can call APIs but does not create a persistent SDK connection.
  - If I mention global clusters or private endpoints, explain which endpoint to use and when public access may be disabled.
  - If I mention PyMilvus ORM, explain this is about to be deprecated.

  ## When answering:
  1. tell me which endpoint and auth method to use
  2. show the exact console path to find the endpoint or credentials
  3. generate connection code in the language I ask for
  4. include a quick verification step such as listing collections
  5. call out common connection mistakes

  ## Ask concise follow-up questions if needed:
  - Which SDK or language are you using: Python, Node.js, Java, Go, or REST?
  - Are you using an API key or cluster credentials?
  - Is this a regular cluster, a global cluster, or a private-endpoint setup?

  ## Common mistakes to check for:
  - wrong endpoint
  - missing \`https://\`
  - wrong token format
  - using the wrong SDK version for the cluster
  - forgetting that the cluster password was only shown once
  - trying to use REST as if it were a persistent SDK connection

  ## Python example with API key

  \`\`\`
  from pymilvus import MilvusClient

  client = MilvusClient(
      uri="https://YOUR_CLUSTER_ENDPOINT",
      token="YOUR_ZILLIZ_CLOUD_API_KEY",
  )

  print(client.list_collections())
  \`\`\`

  ## Python example with cluster credentials

  \`\`\`
  from pymilvus import MilvusClient

  client = MilvusClient(
      uri="https://YOUR_CLUSTER_ENDPOINT",
      token="db_admin:YOUR_CLUSTER_PASSWORD",
  )

  print(client.list_collections())

  ## Node.js example

  \`\`\`
  const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

  const client = new MilvusClient({
    address: "https://YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_ZILLIZ_CLOUD_API_KEY",
  });

  async function main() {
    const res = await client.listCollections();
    console.log(res);
  }

  main().catch(console.error);
  \`\`\`
  
  ## Java example
  \`\`\`
  import io.milvus.v2.client.MilvusClientV2;
  import io.milvus.v2.client.ConnectConfig;

  String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
  String TOKEN = "YOUR_CLUSTER_TOKEN";

  // 1. Connect to Milvus server
  ConnectConfig connectConfig = ConnectConfig.builder()
      .uri(CLUSTER_ENDPOINT)
      .token(TOKEN)
      .build();

  MilvusClientV2 client = new MilvusClientV2(connectConfig);
\`\`\`

  ## Cluster credentials format

  - username:password
  - API key

  ## Verification step

  After connecting, run a simple list-collections call first. If that works, the endpoint, auth, and SDK are aligned.

  ## Key Zilliz Cloud details

  - Get the endpoint from the cluster’s Connect card in the console.
  - The token can be either an API key or username:password.
  - For global clusters, use the global endpoint or public endpoint depending on your access path.
  - If private endpoints are configured, public or global endpoints may be disabled for stricter access control.

```
