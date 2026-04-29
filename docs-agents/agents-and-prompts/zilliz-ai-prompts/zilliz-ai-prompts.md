---
title: "AI Prompts | Cloud"
slug: /zilliz-ai-prompts
sidebar_key: zilliz-ai-prompts
sidebar_label: "AI Prompts"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "The Zilliz Cloud AI prompt library offers curated prompts for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently. | Cloud"
type: origin
token: Li1gwPA8HiBgsokLgO4cKA7nnDg
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - ai-agents
  - decision matrix
  - prompts
displayed_sidebar: agentsSidebar

---

import Admonition from '@theme/Admonition';


# AI Prompts

The Zilliz Cloud AI prompt library offers curated prompts for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently.

## How to use these prompts\{#how-to-use-these-prompts}

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

## Best practices\{#best-practices}

Use the base prompt for all Zilliz Cloud tasks.

Add the module prompt that matches the job you want the AI tool to help with.

If you are building against the API or an SDK, tell the AI tool which interface you want to use: RESTful API, Python SDK, Java SDK, Go SDK, Node.js SDK, or Terraform.

## Prompts\{#prompts}

<table>
   <tr>
     <th><p><a href="./zilliz-base-prompts">Base Prompt</a></p></th>
     <th><p><a href="./zilliz-resource-planning-prompts">Resource Planning</a></p></th>
     <th><p><a href="./zilliz-pricing-prompts">Pricing</a></p></th>
     <th><p><a href="./zilliz-cluster-connection-prompts">Cluster Connection</a></p></th>
     <th><p><a href="./zilliz-search-prompts">Search</a></p></th>
   </tr>
   <tr>
     <td><p><a href="./zilliz-import-prompts">Import</a></p></td>
     <td><p><a href="./zilliz-migration-prompts">Migration</a></p></td>
     <td><p><a href="./zilliz-integrations-prompts">Integrations</a></p></td>
     <td><p><a href="./zilliz-access-control-prompts">Access Control</a></p></td>
     <td><p><a href="./zilliz-schema-design-prompts">Schema Design</a></p></td>
   </tr>
</table>



import DocCardList from '@theme/DocCardList';

<DocCardList />