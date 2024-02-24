---
slug: /release-notes-230
beta: FALSE
notebook: FALSE
token: MocQwCCItiHYEbkkJtOcROPTnod
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Release Notes (Oct 17, 2023)

We're pleased to announce the launch of our AWS Frankfurt region in the EU. Accompanying this expansion, we introduce beta features: Range Search, Upsert, and Cosine Metric Type, enhancing search capabilities and data management efficiency. Additional functionalities include API Key Access, Retrieve Raw Vectors, JSON_CONTAINS Filter, and Entity Count. Noteworthy improvements in RBAC, billing, pricing calculation, account management, and service stability have also been implemented for an enhanced user experience. 

## Milvus Compatibility{#milvus-compatibility}

This release is compatible with __Milvus 2.2.x__ and __Milvus 2.3.x (Beta)__.

## New AWS Region: Frankfurt (aws-eu-central-1) - Now Live{#new-aws-region-frankfurt-aws-eu-central-1-now-live}

We're delighted to unveil our new AWS Frankfurt region, designed to better cater to our European user base. This region not only provides enhanced support but also offers the convenience of AWS Marketplace payment options. For all available cloud regions, refer to [Cloud Providers & Regions](./cloud-providers-and-regions).

## Innovative Beta Features{#innovative-beta-features}

Explore the future with our latest beta features, available for dedicated clusters. Upgrade now to experience these enhancements:

- _Range Search_

    Redefine your queries with [Range Search](./single-vector-search#range-search), enabling you to set a radius for your searches. Unlike traditional ANN Search, Range Search ensures the inclusion of all vectors within the specified radius, providing a more comprehensive view.

- _Upsert_

    Seamlessly manage dynamic datasets with [Upsert](./insert-update-delete#upsert-entities), a fusion of 'update' and 'insert'. Enjoy increased efficiency for datasets where changes are frequent.

- _Cosine Metric Type_

    Experience advanced vector search with [Cosine](./search-metrics-explained#cosine-similarity), [Inner Product](./search-metrics-explained#inner-product-ip), and [Euclidean Distance](./search-metrics-explained#euclidean-distance-l2) support. Cosine metric eliminates the need for prior vector normalization, streamlining your search process.

- _Access Control_

    Securely access dedicated clusters and serverless instances with [API Key](./manage-api-keys) or [username password authentication](./cluster-credentials-console).

- _Return Raw Vectors_

    Specify vector fields in your [search parameters](./single-vector-search#search-parameters) to receive them as part of your search results.

- _JSON_CONTAINS Filter_

    Refine searches further with the [JSON_CONTAINS operator](./use-json-fields#advanced-operators), allowing you to specify filtering conditions based on JSON field values.

- _Entity Count_

    Get a quick overview of [the total number of entities within loaded collections](./get-and-scalar-query#advanced-operators) for better data management.

## Enhancements{#enhancements}

We've also implemented several enhancements to improve your overall experience:

- _New Role for RBAC_

    Grant [Project Member Role](./resource-hierarchy) to project collaborators for more streamlined collaboration.

- _Billing Optimizations_

    Enjoy more efficient billing management with streamlined processes.

- _Advanced [Pricing Calculator](https://zilliz.com/pricing#calculator)_

    Get comprehensive estimations that combine primary keys, vector fields, and string fields for a more accurate pricing overview.

- _Self-Service Account Deletion_

    Easily [delete your own accounts](./email-accounts#delete-your-account) or [organizations](./delete-your-organization) for greater control over your profile.

- _Stability Enhancements_

    We've addressed known issues to enhance the reliability of our service.

Thank you for choosing Zilliz Cloud, where innovation meets performance!