---
title: "Quickstart to CLI & Agent Integration | BYOC"
slug: /cli-and-agent-integration-guide
sidebar_key: cli-and-agent-integration-guide
sidebar_label: "Quickstart to CLI & Agent Integration"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "This guide helps you set up Zilliz CLI and agent integrations locally. After setup, you can use your agent to operate Zilliz Cloud through natural language, or use the CLI directly in terminals, scripts, and CI workflows. | BYOC"
type: shortcut
token: HxWmwteOEi1Egukx26pcBnnknSd
sidebar_position: 8
keywords: 
  - zilliz
  - vector database
  - quickstart
  - cloud
  - milvus
  - cli
  - agent
  - integration

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Quickstart to CLI & Agent Integration

This guide helps you set up Zilliz CLI and agent integrations locally. After setup, you can use your agent to operate Zilliz Cloud through natural language, or use the CLI directly in terminals, scripts, and CI workflows.

## Installation\{#installation}

Before you start, ensure that you have:

- A [Zilliz Cloud account](https://cloud.zilliz.com/login).

- Claude Code, if you want to use the [Claude Code Plugin](/docs/agents/zilliz-plugin).

- Node.js, if you want to install [Zilliz Skill](https://github.com/zilliztech/zilliz-skill).

### Install Claude Code Plugin\{#install-claude-code-plugin}

Use the [Claude Code Plugin](/docs/agents/zilliz-plugin) if you want to operate Zilliz Cloud directly from Claude Code.

<Procedures>

1. Run Claude Code

    ```bash
    > claude
    ```

1. Open the plugin marketplace

    ```bash
    /plugin
    ```

1. Find and install the Zilliz Plugin

    Go to the **Discover** tab and search for zilliz. Select the zilliz plugin to install it.

    ![TqS3b4z7Ho9xcXxHJaIc7HTZn1e](https://zdoc-images.s3.us-west-2.amazonaws.com/tqs3b4z7ho9xcxxhjaic7htzn1e.png "TqS3b4z7Ho9xcXxHJaIc7HTZn1e")

1. Run the quickstart wizard. The wizard guides you through CLI installation, authentication, cluster connection, and first operations.

    ```plaintext
    /zilliz:quickstart
    ```

</Procedures>

### Install Zilliz Skill for common agent frameworks\{#install-zilliz-skill-for-common-agent-frameworks}

If your coding agent, such as Codex, Gemini CLI, Cursor, or another skill-compatible agent, supports agent skills, install [Zilliz Skill](https://github.com/zilliztech/zilliz-skill) as follows:

```bash
npx skills add zilliztech/zilliz-skill
```

This command will prompt you to choose the target agent framework and installation scope.

### Install Zilliz CLI\{#install-zilliz-cli}

The [Zilliz CLI](/reference/cli/overview) is the base command-line tool used by the Plugin and Skill.

<Procedures>

1. Install Zilliz CLI.

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

    Verify installation:

    ```bash
    zilliz --version
    ```

1. Authenticate.

    Authenticate with your Zilliz Cloud account:

    ```bash
    zilliz login
    ```

    This opens a browser for authentication. After login, your credentials are stored locally.

</Procedures>

## When to use CLI, Plugin, or Skill\{#when-to-use-cli-plugin-or-skill}

Use these tools when you need to:

- Develop and test manually from your local environment.

- Write automated operations scripts for repeatable workflows.

- Enable your agent to call Vector Database or Vector Lakebase services automatically.

### Tool comparison\{#tool-comparison}

The Claude Code Plugin, Zilliz Skill, and Zilliz CLI should cover the same main capabilities. Choose based on workflow, not feature scope.

<table>
   <tr>
     <th></th>
     <th><p><strong>Claude Code Plugin</strong></p></th>
     <th><p><strong>Zilliz Skill</strong></p></th>
     <th><p><strong>Zilliz CLI</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Best for</strong></p></td>
     <td><p>Claude Code natural-language workflows</p></td>
     <td><p>Skill-compatible coding agents</p></td>
     <td><p>Terminal use, scripts, and CI</p></td>
   </tr>
   <tr>
     <td><p><strong>Setup</strong></p></td>
     <td><p><code>/zilliz:quickstart</code></p></td>
     <td><p><code>npx skills add zilliztech/zilliz-skill</code></p></td>
     <td><p>Install script + <code>zilliz login</code></p></td>
   </tr>
   <tr>
     <td><p><strong>Natural language</strong></p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
     <td><p>No</p></td>
   </tr>
   <tr>
     <td><p><strong>Automation</strong></p></td>
     <td><p>Agent-assisted</p></td>
     <td><p>Agent-assisted</p></td>
     <td><p>Script-first</p></td>
   </tr>
   <tr>
     <td><p><strong>Structured output</strong></p></td>
     <td><p>Agent-readable responses</p></td>
     <td><p>Agent-readable responses</p></td>
     <td><p><code>--output json</code> for scripts</p></td>
   </tr>
</table>

### Supported capabilities\{#supported-capabilities}

The following table explains the capabilities of the CLI, Plugin and Skill.

<table>
   <tr>
     <th><p>Area</p></th>
     <th><p>What You Can Do</p></th>
   </tr>
   <tr>
     <td><p>Clusters</p></td>
     <td><p>Create, delete, suspend, resume, modify</p></td>
   </tr>
   <tr>
     <td><p>Collections</p></td>
     <td><p>Create with custom schema, load, release, rename, drop</p></td>
   </tr>
   <tr>
     <td><p>Vectors</p></td>
     <td><p>Search, query, insert, upsert, delete, hybrid search</p></td>
   </tr>
   <tr>
     <td><p>Indexes</p></td>
     <td><p>Create (AUTOINDEX), list, describe, drop</p></td>
   </tr>
   <tr>
     <td><p>Databases</p></td>
     <td><p>Create, list, describe, drop</p></td>
   </tr>
   <tr>
     <td><p>Users & Roles</p></td>
     <td><p>RBAC setup, privilege management</p></td>
   </tr>
   <tr>
     <td><p>Backups</p></td>
     <td><p>Create, restore, export, policy management</p></td>
   </tr>
   <tr>
     <td><p>Import</p></td>
     <td><p>Bulk data import from S3/GCS/Azure Blob Storage</p></td>
   </tr>
   <tr>
     <td><p>Partitions</p></td>
     <td><p>Create, load, release, manage</p></td>
   </tr>
   <tr>
     <td><p>Monitoring</p></td>
     <td><p>Cluster status, collection stats, load states</p></td>
   </tr>
   <tr>
     <td><p>Projects</p></td>
     <td><p>Project and region management</p></td>
   </tr>
   <tr>
     <td><p>Billing</p></td>
     <td><p>Usage queries, invoices</p></td>
   </tr>
</table>

## What you can ask your agent to do\{#what-you-can-ask-your-agent-to-do}

After installation, describe the task directly. Your agent should translate the request into the corresponding Zilliz CLI commands. The following examples show how a natural-language request maps to the CLI commands your agent is expected to run.

- **List my clusters and show which one is currently active.**

    Expected CLI commands:

    ```bash
    zilliz cluster list
    zilliz context current
    ```

- **Create a collection for product embeddings with a 768-dimensional vector field.**

    Expected CLI command:

    ```bash
    zilliz collection create --name product_embeddings --dimension 768
    ```

- **Import data from S3 into my collection and check the import job status.**

    Expected CLI command:

    ```bash
    zilliz import start --cluster-id <cluster-id> --collection product_embeddings --body '{"files": [["s3://bucket/path/data.json"]]}'
    ```

- **Create a backup for my production cluster.**

    Expected CLI command:

    ```bash
    zilliz backup create --cluster-id <cluster-id>
    ```

- **Search my collection with a metadata filter and return the top 10 results.**

    Expected CLI command:

    ```bash
    zilliz vector search --collection product_embeddings --data '[[0.1, 0.2, 0.3]]' --filter 'age > 20' --limit 10 --output-fields '["name", "age"]'
    ```

- **Create a role with read-only access to the analytics collection.**

    Expected CLI commands:

    ```bash
    zilliz role create --role analytics_readonly
    zilliz role grant-privilege --role analytics_readonly --object-type Collection --object-name analytics --privilege Search
    zilliz role grant-privilege --role analytics_readonly --object-type Collection --object-name analytics --privilege Query
    ```

