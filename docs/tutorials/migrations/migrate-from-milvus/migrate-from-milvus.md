---
title: "Migrate from Milvus to Zilliz Cloud | Cloud"
slug: /migrate-from-milvus
sidebar_label: "Migrate from Milvus"
beta: FALSE
notebook: FALSE
description: "Milvus is an open-source vector database optimized for scalable similarity search and AI applications. Known for its high performance and ease of use, it is widely used for managing large-scale vector data. | Cloud"
type: origin
token: TDkbwhwMyi7bPykZAoUc5PFfnIb
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - milvus
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection

---

import Admonition from '@theme/Admonition';


# Migrate from Milvus to Zilliz Cloud

[Milvus](https://milvus.io/docs) is an open-source vector database optimized for scalable similarity search and AI applications. Known for its high performance and ease of use, it is widely used for managing large-scale vector data.

Zilliz Cloud simplifies deployment and maintenance by offering managed Milvus services, enabling easy migration of your existing Milvus deployments to the cloud. By connecting to your Milvus instance or uploading backups, you can transfer your vector data to Zilliz Cloud.

Zilliz Cloud provides two primary methods for migrating your data from Milvus:

- [Via endpoint](./via-endpoint): allows you to migrate one database at a time from Milvus to Zilliz Cloud. Each database is migrated individually in sequence, making it ideal for scenarios where you need to carefully manage each database's migration process.

- [Via backup files](./via-backup-files): supports migrating multiple databases simultaneously, making it much faster and more efficient for large-scale migrations.



import DocCardList from '@theme/DocCardList';

<DocCardList />