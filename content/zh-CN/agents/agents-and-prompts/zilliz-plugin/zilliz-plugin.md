---
title: "Zilliz Claude Code Plugin | Cloud"
slug: /zilliz-plugin
sidebar_label: "Claude Code Plugin"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The Zilliz Cloud plugin for Claude Code is a natural language interface that brings Zilliz Cloud operations directly into your IDE. Instead of memorizing CLI commands or switching to the web console, describe what you want in plain language and the plugin handles it. | Cloud"
type: origin
token: LFepwAKeGiURJUksNA4cqYPYnIb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - ai-agents
  - decision matrix
  - skill
  - claude
  - zilliz cli
displayed_sidebar: agentsSidebar

---

import Admonition from '@theme/Admonition';


# Zilliz Claude Code Plugin

The Zilliz Cloud plugin for Claude Code is a natural language interface that brings Zilliz Cloud operations directly into your IDE. Instead of memorizing CLI commands or switching to the web console, describe what you want in plain language and the plugin handles it.

## What is the Zilliz Plugin?

A Claude Code plugin that wraps the Zilliz CLI with natural language capabilities, enabling you to manage Zilliz Cloud resources through conversational commands.

## Key Features

### 14 Capability Areas

- **Clusters**: Create, delete, suspend, resume, modify clusters

- **Collections**: Create with custom schema, load, release, rename, drop

- **Vectors**: Search, query, insert, upsert, delete vectors

- **Indexes**: Create, list, describe, drop indexes

- **Databases**: Create, list, describe, drop databases

- **Users & Roles**: RBAC setup, privilege management

- **Backups**: Create, restore, export, policy management

- **Import**: Bulk data import from cloud storage

- **Partitions**: Create, load, release, and manage partitions

- **Monitoring**: Cluster status, collection statistics

- **Billing**: Billing management

- **Jobs**: Job management

- **Project/Region**: Project and region settings

- **Setup**: Initial configuration and quickstart

### Natural Language Interface

```plaintext
You: "Create a serverless cluster in us-east-1 called my-vectors"
Plugin: Creates cluster with appropriate configuration

You: "Search for similar items in my product collection with filter age > 20"
Plugin: Executes vector search with filters
```

## Prerequisites

- Python 3.10 or later

- Zilliz Cloud account

- Claude Code IDE

## Quick Example

After installation, run the quickstart:

```plaintext
/zilliz:quickstart
```

This guides you through:

1. CLI installation

1. Authentication setup

1. Cluster connection

1. First operations

## Next Steps



import DocCardList from '@theme/DocCardList';

<DocCardList />