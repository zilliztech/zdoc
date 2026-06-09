---
title: "Zilliz Skill | BYOC"
slug: /zilliz-skill
sidebar_label: "Zilliz Skill"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Skills are reusable skill modules for Claude Code that provide specialized capabilities for working with Zilliz Cloud. | BYOC"
type: origin
token: EXj3wKsw8ijsqJk8uYPcmfXWn3g
sidebar_position: 1
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

