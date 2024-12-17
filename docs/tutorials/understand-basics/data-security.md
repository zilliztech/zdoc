---
title: "Data Security | Cloud"
slug: /data-security
sidebar_label: "Data Security"
beta: FALSE
notebook: FALSE
description: "Data security is a crucial aspect of any cloud platform, and Zilliz Cloud is no exception. To safeguard data, Zilliz Cloud provides robust measures in various aspects, including authorization and authentication, network isolation, encryption, and backup and restoration. | Cloud"
type: origin
token: SIhBwKFJri4u2CkyD3ucnO7an3g
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - data
  - security

---

import Admonition from '@theme/Admonition';


# Data Security

Data security is a crucial aspect of any cloud platform, and Zilliz Cloud is no exception. To safeguard data, Zilliz Cloud provides robust measures in various aspects, including authorization and authentication, network isolation, encryption, and backup and restoration.

This topic provides an overview of how Zilliz Cloud secures data at every stage.

## Registering an account with privacy protection{#registering-an-account-with-privacy-protection}

Zilliz Cloud prioritizes data security from the moment of account registration.

When you register an account in the web console, Zilliz Cloud employs a combination of encryption techniques to protect user data. Robust cryptographic algorithms such as [SHA-256](https://en.wikipedia.org/wiki/SHA-2) and [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) are utilized to encrypt your account information.

In addition, Zilliz Cloud adheres to a stringent policy of not storing usernames and passwords within its systems. This approach ensures that, even in the unlikely event of a security breach, the confidential account information remains secure.

## Starting a cluster with security{#starting-a-cluster-with-security}

Once an account is ready, you can log into the Zilliz Cloud console to create and run a cluster with security enabled.

By design, the Zilliz Cloud platform comprises two planes: the control plane and the kernel plane. These planes reside in separate security groups with isolated networks. Such a design reinforces data security.

As a supplement, Zilliz Cloud supports security settings, such as whitelists, and private links, access control, securing internal and external communication with your cluster.

### Authentication{#authentication}

Zilliz Cloud implements authentication using the OAuth2 protocol, which requires users to prove their identity by providing a cluster credential (a token), before they can access or execute on any cluster resources. Cluster credentials usually consist of username and password pairs or API keys.

For details, see [Cluster Credentials (Console)](./cluster-credentials-console) and [API Keys](./manage-api-keys).

### Access control{#access-control}

In many cases, authenticating users is far from enough. You also need a way to control what users can access and which scope of operations they can perform.

To meet these needs, Zilliz Cloud enables access control, which allows you to restrict user permissions and authorize them to access only specific resources. With this mechanism, users can be granted one or more roles that determine the scope of their permissions on cluster resources and operations. This helps prevent unauthorized access beyond the defined permission scope.

For details, see [User Roles](./user-roles).

### Whitelists{#whitelists}

For Internet connections, Zilliz Cloud uses the HTTPS protocol and provides a whitelist feature to enable IP filtering.

Once you add specific CIDR blocks to the whitelist of a cluster, only IP addresses in the specified range can access the cluster. To completely prevent Internet access, you can add **127.0.0.1/32** to the cluster whitelist.

For details, see [Set up Whitelist](./setup-whitelist).

### Private links{#private-links}

If you do not want cluster traffic to go over the Internet, Zilliz Cloud also supports adding a private link to your cluster. This private link serves as an extra layer of protection by ensuring that only resources in the trusted virtual private cloud (VPC) can establish communication with the cluster.

For details, see [Set up a Private Link](./setup-a-private-link).

## Storing and transmitting data with encryption{#storing-and-transmitting-data-with-encryption}

Once a cluster is up and security settings are applied, Zilliz Cloud implements various measures to secure data storage and transmission.

In Zilliz Cloud, vector data is stored in object storage (AWS S3 or GCS) with server-side encryption enabled. Data belonging to different users is isolated in buckets. Additionally, Zilliz Cloud uses [JumpServer](https://en.wikipedia.org/wiki/Jump_server) to keep records and perform audits on all cluster access operations, such as logins, queries, and modifications. These audit logs can be used to track and investigate potential security incidents or data leakage risks.

## Backup and restoration{#backup-and-restoration}

To safeguard data integrity, Zilliz Cloud offers reliable backup and restoration mechanisms.

The platform features a recycle bin functionality with a maximum retention period of 30 days, allowing you to recover accidentally deleted data. Furthermore, you can schedule automatic backups to ensure regular and secure data backups.

For details, see [Backup & Restore](/docs/backup-and-restore).

## Summary{#summary}

In summary, Zilliz Cloud prioritizes data security at every stage, employing encryption techniques, authentication protocols, access control, whitelists, private links, server-side encryption, audit logs, and backup and restoration mechanisms to ensure the confidentiality, integrity, and availability of your data.