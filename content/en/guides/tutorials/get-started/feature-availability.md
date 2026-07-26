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
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Feature Availability

*Last updated: Oct 13, 2025*

The **availability phase** of a feature indicates its maturity, stability, and recommended usage in Zilliz Cloud. Below is an overview of the feature lifecycle stages and what they mean for you as a user.

![YBh6wiorGhbetoba42DchATjnVm](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/YBh6wiorGhbetoba42DchATjnVm.png)

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

## Current feature availability\{#current-feature-availability}

### Private preview\{#private-preview}

- [Export backup files](./export-backup-files)

- Hosted models

<Admonition type="info" icon="📘" title="📘 Notes">

Contact [Zilliz Support](http://support.zilliz.com) to request access to these features. 

</Admonition>

### Public preview\{#public-preview}

- Embedding ([OpenAI](./openai), [Voyage AI](./voyage-ai), and [Cohere](./cohere)) and Rerank Functions ([Cohere reranker](./cohere-model-ranker) and [Voyage AI reranker](./voyage-ai-model-ranker))

<Admonition type="info" icon="📘" title="📘 Notes">

Upgrade your cluster Milvus version to access these features.

</Admonition>

- [Access Logs Overview](./access-log-overview)

- [On-demand compute](./on-demand-cluster)

<Admonition type="info" icon="📘" title="📘 Notes">

If your region does support this feature, [contact us](http://support.zilliz.com) to request more regions

</Admonition>

### Deprecation notice\{#deprecation-notice}

- [Import Data from NumPy Files](./data-import-numpy)

- [RESTful APIs (V1)](/reference/restful/v1)

### Deprecated\{#deprecated}

- Pipelines

