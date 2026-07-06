---
title: "Zilliz Skill | Cloud"
slug: /zilliz-skill
sidebar_label: "Zilliz Skill"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Skills are reusable skill modules for Claude Code that provide specialized capabilities for working with Zilliz Cloud. | Cloud"
type: origin
token: EXj3wKsw8ijsqJk8uYPcmfXWn3g
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - ai-agents
  - skill
  - opencode
  - gemini cli
  - qwen code
  - zilliz cli
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Skill

Zilliz Skills are reusable skill modules for Claude Code that provide specialized capabilities for working with Zilliz Cloud.

## What are Zilliz Skills?\{#what-are-zilliz-skills}

Skills are modular capabilities that extend Claude Code's functionality. The [Zilliz Skills repository](https://github.com/zilliztech/zilliz-skill) contains pre-built skills for common Zilliz Cloud operations.

## Setup\{#setup}

Run the following command to install the Zilliz skill. Ensure that you have Node.js installed.

```bash
npx skills add zilliztech/zilliz-skill
```

This command will guide you in choosing the target tools and determining the installation scope.

## Available Skills\{#available-skills}

| Area | What You Can Do |
| --- | --- |
| Clusters | Create, delete, suspend, resume, modify |
| Collections | Create with custom schema, load, release, rename, drop |
| Vectors | Search, query, insert, upsert, delete, hybrid search |
| Indexes | Create (AUTOINDEX), list, describe, drop |
| Databases | Create, list, describe, drop |
| Users & Roles | RBAC setup, privilege management |
| Backups | Create, restore, export, policy management |
| Import | Bulk data import from S3/GCS/Azure Blob Storage |
| Partitions | Create, load, release, manage |
| Monitoring | Cluster status, collection stats, load states |
| Projects | Project and region management |
| Billing | Usage queries, invoices |

## How to Use\{#how-to-use}

Skills are invoked with proper natural language prompts as follows:

```plaintext
"Create a serverless cluster in us-east-1 and set up a collection with 768-dimension vectors"
"Search for similar items in my product collection with filter age > 20"
"Show me the status of all my clusters and collections"
"Set up a daily backup policy for my production cluster with 7-day retention"
"Create a role with read-only access to the analytics collection"
```

## Next Steps\{#next-steps}

- [Zilliz Plugin](./zilliz-plugin)

- [GitHub Repository](https://github.com/zilliztech/zilliz-skill)

