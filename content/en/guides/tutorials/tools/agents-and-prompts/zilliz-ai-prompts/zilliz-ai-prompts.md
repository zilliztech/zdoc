---
title: "AI Prompts | Cloud"
slug: /zilliz-ai-prompts
sidebar_label: "AI Prompts"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The Zilliz Cloud AI prompt library offers curated prompts for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently. | Cloud"
type: origin
token: Li1gwPA8HiBgsokLgO4cKA7nnDg
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# AI Prompts

The Zilliz Cloud AI prompt library offers curated prompts for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently.

## How to use these prompts\{#how-to-use-these-prompts}

Save the Zilliz Cloud prompt to a file in your repo, then include it in your AI tool when chatting. The table below demonstrates where to place the prompt in different tools.

| **Tool** | **Where to place the prompt** | **Reference** |
| --- | --- | --- |
| Claude Code | Include the prompt in your `CLAUDE.md` file. | [Store instructions and memories](https://code.claude.com/docs/en/memory) |
| Cursor | Add the prompt to your project rules. | [Configure project rules](https://docs.cursor.com/en/context/rules) |
| GitHub Copilot | Save the prompt to a file in your project and reference it using `#<filename>`. | [Custom instructions in Copilot](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions) |
| Gemini CLI | Include the prompt in your `GEMINI.md` file. | [Gemini CLI codelab](https://codelabs.developers.google.com/gemini-cli-hands-on) |

## Best practices\{#best-practices}

Use the base prompt for all Zilliz Cloud tasks.

Add the module prompt that matches the job you want the AI tool to help with.

If you are building against the API or an SDK, tell the AI tool which interface you want to use: RESTful API, Python SDK, Java SDK, Go SDK, Node.js SDK, or Terraform.

## Prompts\{#prompts}

| [Base Prompt](./zilliz-base-prompts) | [Resource Planning](./zilliz-resource-planning-prompts) | [Pricing](./zilliz-pricing-prompts) | [Cluster Connection](./zilliz-cluster-connection-prompts) | [Search](./zilliz-search-prompts) |
| --- | --- | --- | --- | --- |
| [Import](./zilliz-import-prompts) | [Migration](./zilliz-migration-prompts) | [Integrations](./zilliz-integrations-prompts) | [Access Control](./zilliz-access-control-prompts) | [Schema Design](./zilliz-schema-design-prompts) |



import DocCardList from '@theme/DocCardList';

<DocCardList />