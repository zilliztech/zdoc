---
title: "Customer-Managed Encryption Keys | Cloud"
slug: /cmek
sidebar_label: "CMEK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud encrypts data at rest on disk/object storage using the 256-bit Advanced Encryption Standard (AES-256) algorithm by default. For customers with the highest security requirements, Zilliz Cloud adds an additional layer of security by leveraging the customer's cloud provider's Key Management Service (KMS) in combination with Zilliz Cloud's Customer-Managed Encryption Key (CMEK) feature. | Cloud"
type: origin
token: GLxhwO5vWiWkTBkoNCPcg4ahnbe
sidebar_position: 12
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Customer-Managed Encryption Keys

Zilliz Cloud encrypts data at rest on disk/object storage using the 256-bit Advanced Encryption Standard (AES-256) algorithm by default. For customers with the highest security requirements, Zilliz Cloud adds an additional layer of security by leveraging the customer's cloud provider's Key Management Service (KMS) in combination with Zilliz Cloud's Customer-Managed Encryption Key (CMEK) feature.

<Admonition type="info" icon="📘" title="Notes">

This feature is available only to **Dedicated** clusters in a **Business Critical** project.

</Admonition>

## How encryption works\{#how-encryption-works}

On Zilliz Cloud, a customer-managed encryption key is a cryptographic key created by your cloud provider's KMS and used to secure data in your clusters. After adding your KMS key to a Zilliz Cloud Business Critical project, you can use it to encrypt data stored on disk, in object storage, and in message queues.

![Ehcyw7EZphWQO0bTJMDchzTYnIf](https://zdoc-images.s3.us-west-2.amazonaws.com/Ehcyw7EZphWQO0bTJMDchzTYnIf.png)

As shown in the diagram above, Zilliz Cloud manages encryption keys hierarchically, using the user-supplied KMS key as the **root key**. 

Within a cluster, each database is associated with an **Encryption Zone (EZ)**, and Zilliz Cloud creates an encryption key for each zone, known as an **Encryption Zone Key (EZK)**. To protect the EZKs, Zilliz Cloud encrypts them using the root key and stores the encrypted EZKs.

For each database file, Zilliz Cloud generates a **Data Encryption Key (DEK)** and uses it to encrypt the file. To secure the DEK, Zilliz Cloud encrypts it with the EZK and stores both the encrypted DEK and the encrypted files.

When accessing a file, Zilliz Cloud sends the encrypted EZK to the KMS for decryption, uses the decrypted EZK to decrypt the encrypted DEK, and uses the decrypted DEK to decrypt the file.

## Encryption scope\{#encryption-scope}

All data-related files stored in the following locations are encrypted:

- Object storage, including binlogs and index files,

- Local disk, and

- Insert/delete messages in message queues.

## Limitations\{#limitations}

- Customer-managed encryption keys are managed at the project level.

- You can add up to 20 unique keys to each project. Adding duplicate keys will cause failures.

- Once a cluster is encrypted, migrating collections across databases is prohibited.

- Always ensure that the cloud provider and region of a KMS key match those of the Zilliz Cloud cluster using that key.

- To enable CMEK on existing clusters compatible with Milvus v2.5.x, back up the data and restore it to a new cluster compatible with Milvus v2.6.x.  Upgrading clusters does not encrypt data prior to the upgrade.

<Admonition type="info" icon="📘" title="Notes">

Currently, CMEK is available only in AWS regions. For other regions, please [contact us](https://support.zilliz.com/hc/en-us).

</Admonition>

## Supported KMS providers\{#supported-kms-providers}

The following key management service (KMS) providers are available:



import DocCardList from '@theme/DocCardList';

<DocCardList />