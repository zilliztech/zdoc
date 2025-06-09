---
title: "External Migration Basics | Cloud"
slug: /external-migration-basics
sidebar_label: "External Migration Basics"
beta: FALSE
notebook: FALSE
description: "External migration simplifies the process of moving your vector databases and search systems to Zilliz Cloud. Whether you're migrating from vector databases like Pinecone and Qdrant, or from search engines with vector capabilities like Elasticsearch and OpenSearch, Zilliz Cloud provides migration tools to ensure data integrity while minimizing migration complexity. | Cloud"
type: origin
token: WZe4w7lNji6RVHkR5alcrTw8nQ2
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - external
  - data source
  - basics
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# External Migration Basics

External migration simplifies the process of moving your vector databases and search systems to Zilliz Cloud. Whether you're migrating from vector databases like Pinecone and Qdrant, or from search engines with vector capabilities like Elasticsearch and OpenSearch, Zilliz Cloud provides migration tools to ensure data integrity while minimizing migration complexity.

## Supported data sources{#supported-data-sources}

Zilliz Cloud supports migration from leading vector databases and search platforms:

<table>
   <tr>
     <th><p>Data Source</p></th>
     <th><p>Type</p></th>
     <th><p>Key Features</p></th>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-pinecone">Pinecone</a></p></td>
     <td><p>Vector database</p></td>
     <td><p>Serverless indexes with similarity search</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-qdrant">Qdrant</a></p></td>
     <td><p>Vector database</p></td>
     <td><p>Open-source engine, cloud and self-hosted</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-elasticsearch">Elasticsearch</a></p></td>
     <td><p>Search engine</p></td>
     <td><p>Dense vector support with full-text search</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-pgvector">PostgreSQL</a></p></td>
     <td><p>Relational database</p></td>
     <td><p>Vector extension (pgvector) support</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-tencent-cloud">Tencent Cloud VectorDB</a></p></td>
     <td><p>Managed service</p></td>
     <td><p>Managed vector database service</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-opensearch">OpenSearch</a></p></td>
     <td><p>Search platform</p></td>
     <td><p>KNN plugin with vector capabilities</p></td>
   </tr>
</table>

## Core capabilities{#core-capabilities}

Our migration tools provide extensive configuration options to ensure your data structure fits perfectly on Zilliz Cloud:

<table>
   <tr>
     <th><p>Feature Category</p></th>
     <th><p>Capability</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><strong>Schema control</strong></p></td>
     <td><p>Field name customization</p></td>
     <td><p>Rename fields during migration to match your preferred naming style</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>Dynamic to fixed fields</p></td>
     <td><p>Convert flexible metadata into fixed, structured fields for better performance</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>Additional fields</p></td>
     <td><p>Add new fields beyond source data to accommodate evolving requirements</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>Data type mapping</p></td>
     <td><p>Zilliz Cloud detects and maps field types automatically, with option to adjust manually</p></td>
   </tr>
   <tr>
     <td><p><strong>Collection setup</strong></p></td>
     <td><p>Smart naming</p></td>
     <td><p>By default, Zilliz Cloud retains the source table name for the target collection; if a duplicate name is detected, the system issues an error alert so the user can rename it. For naming‐rule conflicts, such as when a source table name contains a hyphen (<code>-</code>), Zilliz Cloud will either automatically convert the hyphen (<code>-</code>) to an underscore (<code>_</code>) or raise an error prompting the user to adjust, depending on the data source</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>Shard configuration</p></td>
     <td><p>Set up data distribution to match how you plan to query your data</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>Partition strategies</p></td>
     <td><p>Organize data using either automatic partitioning or custom groupings</p></td>
   </tr>
   <tr>
     <td><p><strong>Data integrity</strong></p></td>
     <td><p>Primary key handling</p></td>
     <td><p>Create, keep, or modify unique identifiers for your records</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>Field attributes</p></td>
     <td><p>Set whether fields can contain null values and define default values</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>Validation checks</p></td>
     <td><p>Access detailed migration reports showing migration details</p></td>
   </tr>
</table>

## Migration process{#migration-process}

The migration follows a three-phase approach designed to ensure data integrity and provide visibility throughout the process:

![TlBawqVufhMN4BbNzdXcNQjpnVb](/img/TlBawqVufhMN4BbNzdXcNQjpnVb.png)

### Phase 1: Connect & configure{#phase-1-connect-and-configure}

1. **Establish connection**: Provide authentication credentials (API keys, connection strings) to access your source system

1. **Select source data**: Choose specific indexes, collections, or tables to migrate

1. **Configure target**: Select your Zilliz Cloud cluster and database as the destination

### Phase 2: Review mappings{#phase-2-review-mappings}

This phase involves two key components:

#### Schema mapping{#schema-mapping}

- **Automatic detection**: The system identifies vector fields, scalar fields, and metadata

- **Field customization**: Adjust field names and types as needed

- **Type conversion**: Review and confirm data type mappings between source and target

- **Advanced options**: Configure shards, partition keys, and nullable fields based on your requirements

#### Shard setting{#shard-setting}

For optimal performance, configure shards based on your data volume:

- **Small datasets** (≤100M rows): Single shard typically sufficient

- **Large datasets** (>1B rows): [Contact support](https://zilliz.com/contact-sales) for optimal shard configuration

### Phase 3: Migrate & verify{#phase-3-migrate-and-verify}

Once configuration is complete, execute the migration and track progress:

- **Real-time monitoring**: Track migration status through the Jobs page

- **Progress indicators**: View rows migrated, error counts, and estimated completion time

- **Error handling**: Review detailed code logs if issues occur

- **Validation**: Automatic row count verification ensures data completeness

## Limitations{#limitations}

Before starting your migration, be aware of these common limitations that apply across all supported data sources:

<table>
   <tr>
     <th><p>Consideration</p></th>
     <th><p>Impact</p></th>
     <th><p>Solution</p></th>
   </tr>
   <tr>
     <td><p>No automatic indexing or loading</p></td>
     <td><p>Collections not queryable immediately</p></td>
     <td><p>Manually create indexes and load the collections post-migration. For detailed steps, refer to <a href="./index-vector-fields">Index Vector Fields</a> and <a href="./load-release-collections">Load & Release</a>.</p></td>
   </tr>
   <tr>
     <td><p>Empty source data</p></td>
     <td><p>Cannot select empty indexes/tables</p></td>
     <td><p>Ensure source contains data before migrating</p></td>
   </tr>
   <tr>
     <td><p>Vector field requirements</p></td>
     <td><p>Collections must contain vector data</p></td>
     <td><p>Verify your source has vector fields before migration</p></td>
   </tr>
   <tr>
     <td><p>Unsupported data types</p></td>
     <td><p>Some specialized data types may not transfer</p></td>
     <td><p>Review platform-specific guides for data type mappings</p></td>
   </tr>
</table>

## Getting started{#getting-started}

Ready to migrate your data to Zilliz Cloud?

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login)

1. Navigate to **Migrations** and choose your source platform

1. Follow the guided workflow to complete your migration

<Supademo id="cmb7mg34n4sqrppkp8pnm8dub" title="Zilliz Cloud - Access Migration Portal Demo" />

## Platform-specific migration guides{#platform-specific-migration-guides}

For detailed instructions, prerequisites, and data mapping information specific to your platform:

- [Migrate from Pinecone to Zilliz Cloud](./migrate-from-pinecone)

- [Migrate from Qdrant to Zilliz Cloud](./migrate-from-qdrant)

- [Migrate from Elasticsearch to Zilliz Cloud](./migrate-from-elasticsearch)

- [Migrate from PostgreSQL to Zilliz Cloud](./migrate-from-pgvector)

- [Migrate from Tencent Cloud to Zilliz Cloud](./migrate-from-tencent-cloud)

- [Migrate from OpenSearch to Zilliz Cloud](./migrate-from-opensearch)

