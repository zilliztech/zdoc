---
title: "Zilliz Claude Code Plugin Examples | Cloud"
slug: /zilliz-plugin-examples
sidebar_key: zilliz-plugin-examples
sidebar_label: "More Examples"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "In this guide, you will find more examples that use natural language to provision infrastructure, perform data operations, back up and restore your data across clusters, and implement access control for the sake of cluster security. | Cloud"
type: origin
token: JiHgw9rQsibSugklTvBcpS1unGe
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - ai-agents
  - decision matrix
  - skill
  - claude
  - zilliz cli
  - examples
  - rbac
  - migration
displayed_sidebar: agentsSidebar

---

import Admonition from '@theme/Admonition';


# Zilliz Claude Code Plugin Examples

In this guide, you will find more examples that use natural language to provision infrastructure, perform data operations, back up and restore your data across clusters, and implement access control for the sake of cluster security.

## Example 1: Infrastructure Provisioning\{#example-1-infrastructure-provisioning}

**Scenario**: Set up a new Zilliz Cloud environment

```plaintext
You: "Create a serverless cluster called dev-cluster in us-east-1"
Plugin: Creates the cluster

You: "Create a database called my_app"
Plugin: Creates database

You: "Create a collection called products with 768-dimension vectors and fields: id, name, price"
Plugin: Creates collection with schema
```

## Example 2: Data Operations Workflow\{#example-2-data-operations-workflow}

**Scenario**: Insert data and perform searches

```plaintext
You: "Insert 100 product vectors from my CSV file"
Plugin: Processes bulk insert

You: "Create an IVF_FLAT index on the products collection"
Plugin: Creates index

You: "Search for 5 similar products to vector [0.1, 0.2, ...]"
Plugin: Executes vector search and returns results
```

## Example 3: Backup and Restore\{#example-3-backup-and-restore}

**Scenario**: Set up automated backups

```plaintext
You: "Create a backup policy for my production cluster with daily backups and 7-day retention"
Plugin: Configures backup policy

You: "Create a backup of the users collection right now"
Plugin: Initiates manual backup

You: "Restore the users collection from yesterday's backup"
Plugin: Restores from backup
```

## Example 4: Access Control\{#example-4-access-control}

**Scenario**: Set up RBAC for team members

```plaintext
You: "Create a role called analyst with read-only access to the analytics collection"
Plugin: Creates role with privileges

You: "Create a user alice@company.com and assign the analyst role"
Plugin: Creates user and assigns role
```

For more examples, you can read the [Zilliz CLI reference](/reference/cli/overview) docs.