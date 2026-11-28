---
title: "Rust SDK Reference | Cloud"
displayed_sidebar: rustSidebar
slug: /rust
sidebar_label: "Overview"
sidebar_position: 6
beta: FALSE
notebook: FALSE
---

# Rust SDK Reference

The [milvus-sdk-rust](https://github.com/milvus-io/milvus-sdk-rust) is the official Rust SDK for Milvus and Zilliz Cloud. It provides an async V2 client for vector similarity search, metadata filtering, and full collection, index, and user management.

## Features

- **Async-first client** — Create a `ClientV2` with a builder-style `ConnectConfig`; operations return Rust futures.
- **Vector operations** — Similarity search, hybrid search with function chains, rerankers, and filter templates
- **Data management** — Insert, upsert, delete, and query with scalar filters and iterators
- **Schema flexibility** — Dynamic fields, struct fields, and functions for multi-tenancy
- **Bulk operations** — Server-side bulk import with object storage, volumes, and import job management
- **Enterprise features** — RBAC, privilege groups, snapshots, databases, and file resources

## Installation

```bash
cargo add milvus-sdk-rust
```

**Requirements:** Rust 1.86+

## Quick Start

Copy the public endpoint from the cluster **Connect** card and use an API key or cluster credential as the token.

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    )
    .await?;

    let collections = client
        .list_collections(ListCollectionsRequest::builder().build()?)
        .await?;
    println!("{:?}", collections);

    Ok(())
}
```

import DocCardList from '@theme/DocCardList';

<DocCardList />
