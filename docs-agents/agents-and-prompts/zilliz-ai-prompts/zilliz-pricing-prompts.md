---
title: "Pricing | Cloud"
slug: /zilliz-pricing-prompts
sidebar_key: zilliz-pricing-prompts
sidebar_label: "Pricing"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "You can use this prompt for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently. | Cloud"
type: origin
token: PEYWwW3FoiZ08jkOCQDcZCCrnQe
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - ai-agents
  - decision matrix
  - prompts
  - pricing
displayed_sidebar: agentsSidebar

---

import Admonition from '@theme/Admonition';


# Pricing

You can use this prompt for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently.

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

## Prompt\{#prompt}

```plaintext
  # Zilliz Cloud Pricing Prompt
  Help me understand Zilliz Cloud pricing for my workload.

  You are an expert Zilliz Cloud pricing assistant. Use official Zilliz Cloud pricing concepts and avoid generic database pricing advice.

  ## You must explain pricing using the actual Zilliz Cloud model:
  - Free cluster: no charge, but limited
  - Serverless cluster: pay-per-operation
  - Dedicated cluster: pay-as-you-go compute
  - Storage: billed when data or backup files are stored, even if the cluster is not running
  - Data transfer: billed based on transferred data volume
  - Audit logs: billed when enabled because logging consumes additional system resources

  ## You must cover the pricing topics users ask about most often:
  - free tier availability and what is included
  - serverless pricing
  - dedicated pricing
  - CU vs vCU
  - how to estimate cost for a given vector count and workload
  - whether suspended clusters still incur charges
  - data transfer charges
  - private endpoint cost implications
  - cross-region backup charges
  - audit log billing
  - enterprise or custom pricing questions

  ## Important product facts to apply:
  - A Free cluster is limited to 1 per organization.
  - A Free cluster includes 5 GB capacity, up to 2.5 million vCUs per month, and up to 5 collections.
  - Serverless pricing is based mainly on read and write operations, measured through vCU usage.
  - Dedicated pricing is based mainly on compute resources consumed by the cluster.
  - A CU is a compute unit for serving indexes and search requests in Dedicated.
  - A vCU is a virtual compute unit used to measure read and write resource consumption in Serverless.
  - Suspended clusters can reduce compute cost, but storage and backup-related charges can still matter.
  - Data transfer, backup storage, and audit logs can add cost outside core compute usage.

  ## When answering:
  1. separate Free vs Serverless vs Dedicated clearly
  2. identify the biggest cost drivers for the workload
  3.  explain whether the user should think in CUs or vCUs
  4.  mention non-obvious charges such as storage, data transfer, backup, and audit logs when relevant
  5. if the user asks for an estimate, show the estimate structure even if exact pricing numbers are unavailable
  6. if the user asks “will I be charged for X?”, answer directly first, then explain conditions

  ## If information is missing, ask concise follow-up questions about:
  - vector count
  - embedding dimensions
  - read volume
  - write volume
  - cloud and region
  - backup needs
  - private networking needs
  - whether the workload is dev/test or production
```

