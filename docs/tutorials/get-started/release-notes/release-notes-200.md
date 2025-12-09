---
title: "Release Notes (June 11, 2023) | Cloud"
slug: /release-notes-200
sidebar_label: "Release Notes (June 11, 2023)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The release of Zilliz Cloud sets a new standard in vector database management. It significantly enhances the user experience for beginners, offers more affordable and flexible pricing options, enables seamless team collaboration, and provides flexible schema management. Key features of this update include a serverless cluster, diverse tier plans, organization and collaboration support, RBAC support, partition key, dynamic schema, and JSON type support. Try out this game-changing update today! | Cloud"
type: origin
token: BcXMwUYQ3iD7mEkWKFhcU5PUnB5
sidebar_position: 25
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization

---

import Admonition from '@theme/Admonition';


# Release Notes (June 11, 2023)

The release of Zilliz Cloud sets a new standard in vector database management. It significantly enhances the user experience for beginners, offers more affordable and flexible pricing options, enables seamless team collaboration, and provides flexible schema management. Key features of this update include a serverless cluster, diverse tier plans, organization and collaboration support, RBAC support, partition key, dynamic schema, and JSON type support. Try out this game-changing update today!

## Milvus Compatibility\{#milvus-compatibility}

This release is compatible with **Milvus 2.1.x**.

## Zilliz Cloud Serverless Vector Database Service Launch\{#zilliz-cloud-serverless-vector-database-service-launch}

We are excited to announce the launch of Zilliz Cloud's Serverless Vector Database Service. This new offering provides an even more effortless vector data search experience compared to our dedicated cluster solutions.

To support early-stage ventures, we are offering two free collections as part of our Serverless Service. Each collection has the capacity to handle 500,000 vectors on a 768-dimensional scale, providing substantial data handling capabilities without the need for extensive infrastructure. Try our innovative new feature and boost your data processing capabilities today. [Free Trials](./free-trials).

## Zilliz Cloud's Plan Tiers: Starter, Standard, Enterprise, and Self-hosted\{#zilliz-clouds-plan-tiers-starter-standard-enterprise-and-self-hosted}

We are pleased to offer a range of plan tiers: Starter, Standard, Enterprise, and Self-hosted. Each tier is designed to balance cost, service, and security considerations, ensuring that every user has a plan that meets their needs. With Zilliz Cloud, you have the flexibility to scale and evolve your vector database management in alignment with your business growth.

- Starter Plan: The simplest way to experience fully-managed vector databases with our Serverless instances. Minimal configuration is required, and it is available on GCP.

- Standard Plan: Designed for teams with fewer than five engineers and complex workloads. It offers a dedicated cluster with advanced database features and configurations, as well as excellent cost-efficiency. Available on both AWS and GCP.

- Enterprise Plan: Designed for at-scale organizations with advanced security and support needs. It offers a dedicated cluster with full features, high availability, and advanced configurations, providing robust database solutions on both AWS and GCP.

- Self-hosted Plan: Ideal for businesses prioritizing privacy and regulatory adherence. It provides self-managed vector database services within your Virtual Private Cloud (VPC), giving you full control. Suitable for environments prioritizing privacy and regulatory adherence.

[Learn more on the pricing page.](https://zilliz.com/pricing)

## Organization, Collaboration, and RBAC\{#organization-collaboration-and-rbac}

We are excited to announce that Zilliz Cloud now offers sophisticated organizational and member management capabilities. This allows multiple users to collaborate seamlessly across various levels, including Cluster, Project, and Organization.

This major update is supported by the integration of Role-Based Access Control (RBAC), which allows fine-grained control over who can access specific resources. This ensures both security and flexibility, enabling teams to work together more efficiently while maintaining a high degree of data protection.

This enhancement not only offers greater control over project access but also streamlines the collaborative process, making it easier for teams to manage their vector database in a more secure and organized environment. Dive into this feature today and experience a new level of collaborative efficiency with Zilliz Cloud. For details, refer to [Access Control](./access-control).

## Partition Key\{#partition-key}

Zilliz Cloud 2.0.0 introduces the Partition Key feature. This feature allows you to designate a specific field as a partition key when creating a collection. Entities are then stored into partitions based on the values of their partition keys.

This feature is particularly useful during query filtering, as conditions on the partition key field can be executed significantly faster than traditional scan-based filtering methods. Essentially, entities with the same partition key are physically grouped together, thus avoiding unnecessary scans.

## Dynamic Schema\{#dynamic-schema}

We are excited to announce that Zilliz Cloud now supports Dynamic Schema starting from version 2.0.0. This major enhancement significantly improves flexibility in accommodating diverse business requirements. Users can now insert entities with dynamically varied fields into a collection, rather than being limited by a pre-defined static schema.

For advanced users, we have incorporated a hybrid approach to collection creation by blending Dynamic and Static Schema. This allows users to designate "required" fields in the schema design and activate advanced indexing optimizations. Meanwhile, "optional" fields are supported by the dynamic schema mechanism. This novel approach boosts query performance while maintaining schema flexibility.

Explore this feature in Zilliz Cloud 2.0.0 and witness a significant uplift in your database schema's adaptability. [Learn more about this feature](./enable-dynamic-field).

## JSON Type Support\{#json-type-support}

We are excited to announce a major enhancement to Zilliz Cloud in our latest update - the integration of JSON data management and Approximate Nearest Neighbor (ANN) Search capabilities.

JSON, or JavaScript Object Notation, is a crucial data interchange format that has become essential in today's database management world. With the introduction of JSON support in Zilliz Cloud, you can now easily store and manage JSON data, opening up endless possibilities for data manipulation and querying.

The real power lies in the innovative coupling of this with our existing ANN Search feature. This combination means you can now perform complex queries that combine the flexibility of JSON data structure with the precision of ANN search, offering a significant leap forward in database querying capabilities.

Experience the synergistic benefits of these two powerful technologies in one place, and unlock a new level of efficiency and precision in your data management and querying tasks. Step into the future of database technology with Zilliz Cloud today. [Learn more about this feature](./use-json-fields).