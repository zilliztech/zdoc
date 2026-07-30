---
title: "Zilliz Claude Code Plugin Capabilities | Cloud"
slug: /zilliz-plugin-capabilities
sidebar_label: "Core Capabilities"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The Zilliz Plugin offers capabilities across various areas for managing Zilliz Cloud resources using natural language. In this guide, you will find the main features related to managing clusters and collections, as well as vector operations. | Cloud"
type: origin
token: A6q4wqxGViorDmkD5iKcoDBOnRh
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - ai-agents
  - decision matrix
  - skill
  - claude
  - zilliz cli
  - capabilities
  - vector operations
  - cluster management
  - collection management
displayed_sidebar: agentsSidebar

---

import Admonition from '@theme/Admonition';


# Zilliz Claude Code Plugin Capabilities

The Zilliz Plugin offers capabilities across various areas for managing Zilliz Cloud resources using natural language. In this guide, you will find the main features related to managing clusters and collections, as well as vector operations.

## Cluster Management

**What you can do:**

- Create serverless or dedicated clusters

- Suspend and resume clusters

- Delete clusters

- Modify cluster configuration

- List and describe clusters

**Natural language examples:**

- "Create a serverless cluster in us-west-2"

- "Suspend my development cluster"

- "Show me all my clusters"

- "Resume the production cluster"

**Equivalent CLI:**

```bash
zilliz cluster create --name my-cluster --type serverless --region us-west-2
zilliz cluster suspend --cluster-id <id>
zilliz cluster list
zilliz cluster resume --cluster-id <id>
```

## Collection Management

**What you can do:**

- Create collections with custom schemas

- Load and release collections

- Rename and drop collections

- Get collection statistics

**Natural language examples:**

- "Create a collection called products with 768-dimension vectors"

- "Load the user_embeddings collection"

- "Show me stats for my collections"

**Equivalent CLI:**

```bash
zilliz collection create --name products --dimension 768
zilliz collection load --name user_embeddings
zilliz collection getstats --name products
```

## Vector Operations

**What you can do:**

- Insert vectors

- Search for similar vectors

- Query with filters

- Delete vectors

- Upsert (insert or update)

**Natural language examples:**

- "Search for 10 similar items in products collection"

- "Insert these vectors into my collection"

- "Query users where age > 25"

- "Delete vectors with id in [1,2,3]"

**Equivalent CLI:**

```bash
zilliz vector search --collection products --limit 10
zilliz vector query --collection users --filter "age > 25"
zilliz vector delete --collection products --ids 1,2,3
```

For more capabilities, you can read the [Zilliz CLI reference](/reference/cli/overview) docs.