---
title: "Feature Availability | Cloud"
slug: /feature-availability
sidebar_label: "Feature Availability"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Last updated Oct 13, 2025 | Cloud"
type: origin
token: HpbSwzS6kiW9gikHpQ0cUZLWnlc
sidebar_position: 15
keywords: 
  - zilliz
  - vector database
  - cloud
  - feature availability
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source

---

import Admonition from '@theme/Admonition';


# Feature Availability

*Last updated: Oct 13, 2025*

The **availability phase** of a feature indicates its maturity, stability, and recommended usage in Zilliz Cloud. Below is an overview of the feature lifecycle stages and what they mean for you as a user.

![YBh6wiorGhbetoba42DchATjnVm](/img/YBh6wiorGhbetoba42DchATjnVm.png)

- **Private Preview:** 

    - **Definition:** Features in private preview are under active development and subject to change. While they have been implemented and tested within Zilliz Cloud, full usability, stability, and corner-case coverage may not be complete.

    - **Access**: Not available by default. Contact [Zilliz Support](http://support.zilliz.com) to request access.

    - **Usage**: Not intended for production workloads.

- **Public Preview:** 

    - **Definition:** Features in public preview are close to production-ready and unlikely to change significantly before reaching General Availability (GA).

    - **Access**: Generally enabled by default after upgrading your cluster Milvus version. Some features may be inaccessible if your cluster is running an older version of Milvus. In such cases, [contact support](http://support.zilliz.com) to upgrade your cluster.

    - **Usage:** Not recommended for production use.

- **General Availability (GA):** 

    - **Definition:** GA features are fully released, production-ready, and actively supported.

    - **Access**: Enabled by default for most users, except for a few features—such as those enterprise features with pricing considerations—which require [contacting sales](https://zilliz.com/contact-sales) for activation.

    - **Usage**: For production use.

- **Deprecation Notice:** 

    - **Definition:** Features in this phase are still functional and accessible but are no longer under active development except for critical bug fixes.

    - **Access**: Still available, but a formal deprecation announcement has been issued via email.

    - **Usage**: [Talk to our expert](https://zilliz.com/contact-sales) to begin migrating to a new solution as the feature will be removed on a future date.

- **Deprecated:** 

    - **Definition:** The feature has been fully removed from Zilliz Cloud and is no longer accessible or supported.

    - **Access**: Unavailable.

## How to identify a feature's availability phase\{#how-to-identify-a-features-availability-phase}

The availability phase of each feature is indicated in the Zilliz Cloud documentation by a corresponding label. Unless otherwise indicated, a feature is considered to be in general availability.

## Current Feature Availability\{#current-feature-availability}

### Private Preview\{#private-preview}

- [Extract, Transform & Load (ETL)](/reference/restful/merge-data-v2)

- [Zero downtime migration](./zero-downtime-migration)

- [Export backup files](./export-backup-files)

<Admonition type="info" icon="📘" title="Notes">

<p>Contact <a href="http://support.zilliz.com">Zilliz Support</a> to request access to these features. </p>

</Admonition>

### Public preview\{#public-preview}

- [JSON index](./use-json-fields)

- [JSON shredding](./json-shredding)

- [Add fields to an existing collection](./add-fields-to-an-existing-collection)

- [Boost ranker](./boost-ranker)

- [Decay ranker](./decay-ranker-oveview)

- [INT8_VECTOR data type](./use-dense-vector)

- [Ngram index](./ngram-index-type)

- [MINHASH_LSH index](./minhash-lsh)

- [Multi-language analyzer](./multi-language-analyzers)

- [Tiered-storage cluster type](./cu-types-explained)

- [Geometry Field](./use-geometry-field)

- [Array of Structs](./use-array-of-structs)

<Admonition type="info" icon="📘" title="Notes">

<p>Upgrade your cluster Milvus version to access these features.</p>

</Admonition>

### Deprecation notice\{#deprecation-notice}

- [Import Data from NumPy Files](./data-import-numpy)

- [RESTful APIs (V1)](/reference/restful/v1)

### Deprecated\{#deprecated}

- Pipelines

