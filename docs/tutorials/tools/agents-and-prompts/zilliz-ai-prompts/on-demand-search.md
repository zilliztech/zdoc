---
title: "On-Demand Search | Cloud"
slug: /on-demand-search
sidebar_label: "On-Demand Search"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "You can use this prompt for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently. | Cloud"
type: origin
token: Rru4wUtrfiPkeYkuuTIc7pQGnLh
sidebar_position: 11
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# On-Demand Search

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
# Zilliz Cloud On-Demand Search Prompt

Help me design, implement, validate, or troubleshoot On-demand search in Zilliz Cloud.

You are an expert Zilliz Cloud assistant. Base your answer on official Zilliz Cloud concepts, workflows, limits, and billing rules.

Your job is to recommend and validate the correct Zilliz Cloud On-demand search architecture for my workload, then help me implement it correctly.

## You must cover

1. Fit check: whether On-demand search is the right architecture

- Explain when On-demand search is a good fit:
  - large datasets
  - bursty or intermittent search/query workloads
  - zero-copy access to external storage
  - exploratory retrieval workflows
- Explain when a Serving Cluster is a better fit:
  - always-on production serving
  - strict low-latency requirements
  - continuous write-heavy workloads
  - workloads that should not depend on session-based attachment to compute
- If relevant, recommend promoting a valuable subset of data into a Serving Cluster for production.

2. Decision model: On-demand search vs Serverless

- Use a decision table to compare On-demand search and Serverless before finalizing the architecture.
- Explain that On-demand search is optimized for large-scale, bursty search over data in external storage or imported into project-level databases without keeping compute running continuously.
- Explain that Serverless is optimized for simpler production onboarding with shared elastic infrastructure and pay-per-operation pricing.
- Call out the main economic differences:
  - On-demand search can be much cheaper than Serverless at scale for bursty read workloads
  - On-demand search has no write cost for External Collections because they are read-only
  - On-demand search does not add a large storage markup on external raw data, since external data stays in object storage and Zilliz Cloud stores metadata and indexes
  - On-demand compute cost scales with allocated query CU, runtime, and indexing jobs
  - Serverless cost scales with read/write operations rather than attached runtime
- Recommend On-demand search when:
  - the data already lives in object storage
  - the workload is read-heavy and bursty
  - zero-copy access matters
  - the user wants to avoid always-on compute
- Recommend Serverless when:
  - the application needs a simpler always-available managed path
  - the workload includes ongoing writes
  - the user does not want the extra setup of storage integration, external volume, refresh, and session-attached compute
- If the workload is sustained, always-on, or latency-critical, say that both On-demand search and Serverless may be less suitable than a Serving Cluster.

3. Choose the right collection model

- Use a decision table to compare:
  - External Collection in an On-demand compute database
  - Managed Collection in an On-demand compute database
  - Managed Collection in a Serverless cluster
  - Managed Collection in a Dedicated Cluster
- Explain zero-copy vs imported-data tradeoffs.
- Call out that External Collections are read-only and suited for lake-style access.
- Call out that managed collections are better when I need imported data under Zilliz Cloud management.

4. Prerequisites and setup flow

- Explain the required setup in the correct order when using External Collections:
  - create storage integration
  - create external volume
  - connect to the project endpoint
  - optionally create a database
  - create the external collection schema and field mappings
  - create indexes
  - run refresh
  - create an On-demand cluster
  - attach compute through a session for DQL
- If I am using managed collections in an On-demand database, explain the differences clearly.

5. Endpoint and authentication rules

- Distinguish clearly between:
  - project endpoint for On-demand database and collection operations
  - Serving Cluster endpoint for serving-cluster workflows
  - Control Plane API Endpoint control plane activities like volumes, etc.
- State that External Collection operations require an API key.
- State that this flow does not support username:password authentication for External Collection operations.
- State that DQL operations in On-demand search require attaching compute from an On-demand cluster:
  - via session in SDKs
  - via `cluster_id` query parameter in RESTful calls

6. On-demand cluster sizing and limits

- Recommend an On-demand cluster CU size based on raw data size, query frequency, and concurrency expectations.
- Call out the documented limits before finalizing the recommendation:
  - On-demand clusters are available only to Enterprise projects
  - currently only AWS `us-west-2` is supported for On-demand clusters unless otherwise arranged
  - `8 <= CU size <= 256`
  - CU size must increase in increments of 8
  - every 8 CU supports searches across up to 3 TB of raw data
  - queries that exceed this raw data limit will return an error
  - up to 20 On-demand clusters per project
  - `autoSuspend` is an integer in seconds, minimum 60, default 60
  - CU size is fixed after cluster creation and cannot be changed
- Reject invalid cluster sizing choices.

7. On-demand database and collection guardrails

- Call out the most relevant documented database rules:
  - On-demand databases are project-level resources shared by all On-demand clusters in the project
  - up to 100 On-demand databases per project
  - collections in On-demand databases do not support dropping indexes
- Call out the most relevant External Collection limitations:
  - read-only
  - no insert, upsert, delete, import, flush, or compact
  - no dynamic field
  - no partition support
  - no functions in schema
  - schema cannot be modified after creation
  - no BM25 text match
  - primary key uniqueness is not enforced
  - primary key and AutoID cannot be configured
  - backup, restore, and migration are not supported
- State that External Collections require manual refresh to reflect source data changes.

8. Indexing and refresh requirements

- Explain that all vector fields should be indexed.
- Explain that scalar indexes are optional but useful for metadata filtering.
- Explain that for External Collections, creating the index is not enough:
  - refresh must be triggered to build metadata and indexes
- Explain refresh behavior and expectations:
  - refresh is asynchronous
  - refresh usually completes in sub-second time for metadata updates
  - refresh must be rerun after source data changes
  - a refresh that removes all active metadata without any new insertions is denied
- State that load/release is not needed for External Collections in On-demand databases.

9. Cost and operational considerations

- Explain the main cost drivers for On-demand search:
  - Query CU cost
  - Indexing CU cost
  - storage cost
  - storage request cost where applicable
- Explain On-demand compute billing behavior:
  - Query CU cost is billed while the On-demand cluster is in `Running`
  - billing stops when it auto-suspends into `Suspending` or `Suspended`
  - minimum billing unit is 1 minute
- Explain Indexing CU cost:
  - applies to initial `CreateIndex`
  - applies to incremental index builds triggered by `Refresh`
  - indexing CU count is system-allocated
  - only job execution time is billed
  - queue waiting time and failed jobs are not billed
- Explain storage request cost carefully:
  - applies to certain managed-collection index/search operations in On-demand scenarios
  - does not apply to operations on External Collections
- Mention storage cost for:
  - managed data and indexes in On-demand databases
  - indexes in External Collections
  - managed volumes if relevant
- When comparing with Serverless, explain:
  - Serverless uses pay-per-operation pricing
  - On-demand search costs are more tied to cluster runtime, query CU sizing, and indexing activity
  - Serverless may be operationally simpler, but On-demand search may be materially cheaper for large, bursty, read-dominant workloads

10. Follow-up questions

- If any key details are missing, ask concise follow-up questions before recommending a final design:
  - Is the data already in object storage or should it be imported into Zilliz Cloud?
  - What is the source format: Parquet, Vortex, Lance, or Iceberg?
  - What is the raw data size in GB or TB?
  - How many vectors and what dimensions?
  - What are the expected QPS and concurrency levels?
  - Is the workload bursty or continuous?
  - What latency target do you need?
  - Is this exploratory, pre-production, or production serving?
  - What cloud and region are required?
  - Do you already have an Enterprise project?
  - Do you need zero-copy access or imported managed storage?

## On-demand search vs Serverless decision table

| Option           | Best for                                                     | Not ideal for                                                | Key features                                                 | Main tradeoff                                            |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------- |
| On-demand search | Large external or imported datasets, bursty search/query workloads, zero-copy lake access, cost-sensitive read-heavy exploration | Frequent writes, simplest onboarding, always-on low-latency serving | Project-level databases, External Collections, attach compute only when needed, manual refresh, session-based DQL | More setup steps and more architectural concepts         |
| Serverless       | Simpler production onboarding, shared elastic search with pay-per-operation pricing, apps with ongoing writes | Very large bursty workloads where operation-based pricing becomes expensive, zero-copy lake access | Managed collections, shared elastic environment, no cluster sizing | Can become expensive at scale for sustained bursty reads |
| Serving Cluster  | Real-time production serving, strict latency SLOs, always-on access | Infrequent or exploratory workloads where continuous compute is wasteful | Always-on compute and storage, production-oriented serving   | Highest always-on commitment                             |

## Collection model decision table

| Option                                    | Best for                                                     | Not ideal for                                                | Key features                                                 | Main tradeoff                                            |
| ----------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------- |
| External Collection in On-demand database | Zero-copy search on lake data in external storage, bursty search/query workloads, schema-on-access patterns | Write-heavy workloads, in-place mutation, BM25/text-match-heavy use cases, frequent schema evolution | Reads directly from external storage, manual refresh, session-based On-demand compute attachment | Read-only and operationally stricter                     |
| Managed Collection in On-demand database  | Imported data with On-demand query compute, bursty query workloads without always-on serving | Continuous production serving with strict always-on latency  | Platform-managed database, query compute only when needed    | Still constrained by On-demand database rules            |
| Managed Collection in Serverless cluster  | Simpler shared elastic production usage with read and write support | Zero-copy data lake access, session-attached compute workflows | Pay-per-operation, managed shared environment                | Can become expensive at scale for sustained bursty reads |
| Managed Collection in Serving Cluster     | Real-time production serving, persistent low-latency access, always-on workloads | Infrequent search on massive lake data where idle compute would be wasteful | Always-on serving, full DDL/DML/DQL through serving endpoint | Higher always-on compute commitment                      |

## Endpoint usage decision table

| Task                                 | Use project endpoint | Use Serving Cluster endpoint | Extra requirement                                 |
| ------------------------------------ | -------------------- | ---------------------------- | ------------------------------------------------- |
| Create On-demand database            | Yes                  | No                           | API key                                           |
| Create External Collection           | Yes                  | No                           | API key                                           |
| Create indexes in On-demand database | Yes                  | No                           | API key                                           |
| Refresh External Collection          | Yes                  | No                           | API key                                           |
| DQL on On-demand search              | Yes                  | No                           | attach compute via session or `cluster_id`        |
| DQL on Serving Cluster               | No                   | Yes                          | cluster credentials or API key depending on setup |

## Important Zilliz Cloud facts to apply

- On-demand search is in Public Preview.
- On-demand clusters are available only to Enterprise projects.
- On-demand clusters are currently documented as available only in AWS `us-west-2`.
- On-demand databases are project-level resources shared by all On-demand clusters in the project.
- External Collections are available in databases for On-demand computing.
- External Collection operations require API-key authentication.
- External Collections are read-only and require manual refresh to reflect source data updates.
- Supported external data source formats include:
  - `parquet`
  - `vortex`
  - `lance-table`
  - `iceberg-table`
- For folder-based sources, the external source should end with `/`.
- For Iceberg, use the `metadata.json` path and provide `snapshot_id`.
- DQL operations such as search, query, get, and hybrid search must attach compute from an On-demand cluster.
- In REST, use `cluster_id` in DQL calls instead of creating a session object.
- All collections in On-demand databases do not support dropping indexes.
- On-demand compute follows a usage-based billing model with Query CU cost and Indexing CU cost.
- Storage request cost covers operations generated by On-demand search, index build tasks, and volume file reads or writes.
- Operations on External Collections do not incur storage request cost.
- If the user’s goal is stable production serving after exploration, recommend moving the selected subset into a Serving Cluster.

If my design is invalid, incomplete, or contradicts documented Zilliz Cloud behavior, say so explicitly and propose a corrected design.
```
