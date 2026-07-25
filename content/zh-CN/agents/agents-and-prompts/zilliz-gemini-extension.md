---
title: "Zilliz Gemini CLI Extension | Cloud"
slug: /zilliz-gemini-extension
sidebar_label: "Gemini CLI Extension"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The Zilliz Cloud extension for Gemini CLI is a natural language interface that brings Zilliz Cloud operations directly into your IDE. Instead of memorizing CLI commands or switching to the web console, describe what you want in plain language and the plugin handles it. | Cloud"
type: origin
token: FDwgwyDbMi98nckzPxkc2qWynW4
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - ai-agents
  - decision matrix
  - skill
  - gemini
  - zilliz cli
displayed_sidebar: agentsSidebar

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Zilliz Gemini CLI Extension

The Zilliz Cloud extension for Gemini CLI is a natural language interface that brings Zilliz Cloud operations directly into your IDE. Instead of memorizing CLI commands or switching to the web console, describe what you want in plain language and the plugin handles it.

## What it does

- Translates natural-language requests into `zilliz-cli` commands

- Covers all major Zilliz Cloud operations: clusters, databases, collections, partitions, indexes, vectors, imports, backups, users/roles, monitoring, projects, and billing

- Embeds live `--help` output at invocation time so the assistant always has up-to-date flag information

- Requires explicit user confirmation before any destructive operation

## Prerequisites

- You have installed Gemini CLI.

## Setup Procedure

```bash
gemini extensions install https://github.com/zilliztech/gemini-cli-extension
```

Alternatively, you can first clone [this repo](https://github.com/zilliztech/gemini-cli-extension.git) locally, and run the following command:

```bash
gemini extensions link /path/to/gemini-cli-extension
```

## Initial Setup

After installation, run the quickstart wizard:

```bash
/zilliz:setup
```

The wizard will guide you through:

<Procedures>

1. Install Zilliz CLI.

    The plugin requires the Zilliz CLI. If not installed, run:

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
    zilliz auth login
    ```

    This opens a browser for authentication. After login, your credentials are stored locally.

1. Connect to your cluster.

    Configure your default cluster connection:

    ```bash
    zilliz context set --cluster-id <your-cluster-id>
    ```

    Or let the plugin help you select from available clusters.

</Procedures>

## Verification

Test the plugin with a simple command:

```plaintext
You: "List my clusters"
```

The plugin should display your Zilliz Cloud clusters.

## Troubleshooting

- **Plugin shows "CLI not found"**

    **Solution**: Install the Zilliz CLI:

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

- **Authentication fails**

    **Solution**:

    1. Check your internet connection

    1. Verify your Zilliz Cloud account is active

    1. Try logging out and back in:

    ```bash
    zilliz logout
    zilliz login
    ```

1. **"No cluster configured"**

    **Solution**: Set a default cluster:

    ```bash
    zilliz context set --cluster-id <cluster-id>
    ```

## Next Step

Both Zilliz Claude Code Plugin and Zilliz Gemini CLI Extension share Zilliz CLI at the bottom. You can read [Zilliz Claude Code Plugin Capabilities](./zilliz-plugin-capabilities) and [Zilliz Claude Code Plugin Examples](./zilliz-plugin-examples) to learn how to write prompts.