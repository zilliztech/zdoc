---
title: "Zilliz Codex Plugin | Cloud"
slug: /zilliz-codex-plugin
sidebar_label: "Codex Plugin"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Codex Plugin lets OpenAI Codex operate Zilliz Cloud through natural language. After installation, Codex can help you install and use Zilliz CLI, authenticate to Zilliz Cloud, set an active cluster context, and run common cloud and data operations such as managing clusters, collections, vectors, indexes, imports, backups, users, roles, and monitoring status. | Cloud"
type: origin
token: HgQBwNTmGiRJ5xkp3OecH5KZn3d
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Zilliz Codex Plugin

Zilliz Codex Plugin lets OpenAI Codex operate Zilliz Cloud through natural language. After installation, Codex can help you install and use Zilliz CLI, authenticate to Zilliz Cloud, set an active cluster context, and run common cloud and data operations such as managing clusters, collections, vectors, indexes, imports, backups, users, roles, and monitoring status.

## Prerequisites\{#prerequisites}

- You have installed OpenAI Codex.

- You have a Zilliz Cloud account.

- You can install Codex plugins in your local Codex environment.

## Setup procedure\{#setup-procedure}

<Procedures>

1. Add the marketplace.

    ```plaintext
    codex plugin marketplace add zilliztech/zilliz-plugin
    ```

1. Open `/plugins` in Codex and install `zilliz` from the marketplace.

</Procedures>

You can also install directly with [codex-marketplace](https://www.npmjs.com/package/codex-marketplace) as follows.

```plaintext
npx codex-marketplace add zilliztech/zilliz-plugin --plugins
```

## Initial setup\{#initial-setup}

After installation, invoke the `quickstart` skill in Codex. For example, ask Codex:

```plaintext
Set up the Zilliz CLI.
```

The setup flow will guide you through:

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
    zilliz login
    ```

    This opens a browser for authentication. After login, your credentials are stored locally.

1. Connect to your cluster.

    Configure your default cluster connection:

    ```bash
    zilliz context set --cluster-id <your-cluster-id>
    ```

    Or let the plugin help you select from available clusters.

</Procedures>

## Verification\{#verification}

Test the plugin with a simple request:

```plaintext
List my clusters.
```

The plugin should display your Zilliz Cloud clusters.

You can also ask Codex to check your current environment:

```plaintext
Show my Zilliz Cloud status.
```

## Troubleshooting\{#troubleshooting}

- **Plugin does not appear in Codex**

    Solution: Make sure the marketplace was added successfully:

    ```plaintext
    codex plugin marketplace add zilliztech/zilliz-plugin
    ```

    Then open `/plugins` and install `zilliz`.

- **Plugin shows "CLI not found"**

    Solution: Install the Zilliz CLI:

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

    Solution:

    1. Check your internet connection.

    1. Verify your Zilliz Cloud account is active.

    1. Try logging out and back in:

    ```plaintext
    zilliz logout
    zilliz login
    ```

- **No cluster configured**

    Solution: Set a default cluster:

    ```plaintext
    zilliz context set --cluster-id <cluster-id>
    ```

## Next step\{#next-step}

Zilliz Codex Plugin, Zilliz Claude Code Plugin, and Zilliz Gemini CLI Extension all use Zilliz CLI as the underlying execution layer. You can read [Zilliz Claude Code Plugin Capabilities](./zilliz-plugin-capabilities) and [Zilliz Claude Code Plugin Examples](./zilliz-plugin-examples) to learn how to write prompts.