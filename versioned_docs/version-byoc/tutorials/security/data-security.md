---
title: "Data Security | BYOC"
slug: /data-security
sidebar_label: "Data Security"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Data security is integral to Zilliz Cloud. This document summarizes key measures and policies that Zilliz Cloud implements to safeguard your data comprehensively. | BYOC"
type: origin
token: SIhBwKFJri4u2CkyD3ucnO7an3g
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - data
  - security
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance

---

import Admonition from '@theme/Admonition';


# Data Security

Data security is integral to Zilliz Cloud. This document summarizes key measures and policies that Zilliz Cloud implements to safeguard your data comprehensively.

## Account and Privacy Protection\{#account-and-privacy-protection}

Zilliz Cloud protects user data from registration onwards by:

- Using advanced cryptographic algorithms (SHA-256, bcrypt).

- Adhering to strict policies against internal storage of usernames and passwords.

## VPC Isolation in BYOC\{#vpc-isolation-in-byoc}

Zilliz implements isolation between your VPC and ours to ensure data security in our BYOC solution. For details, refer to [Security assurance](/docs/byoc/byoc-intro#security-assurance) in [BYOC Overview](/docs/byoc/byoc-intro).

## Data Isolation & Residency\{#data-isolation-and-residency}

Zilliz Cloud provides robust isolation and protection for your clusters:

- **Multiple data residency options**: You can create clusters in your preferred cloud providers and regions.

- **Dedicated Namespaces:** Each dedicated cluster operates in an isolated namespace with tailored network policies.

- **Separate Storage:** Data is stored separately in dedicated object storage buckets.

- **Distinct VPC or subnet:** The **Control Plane** (administrative tasks) and **Data Plane** (operational handling) reside in separate, isolated VPC or subnet.

## Authentication\{#authentication}

Zilliz Cloud utilizes OAuth0 for secure user authentication:

- Supports Single Sign-On (SSO).

- Supports Multi-Factor Authentication (MFA).

- Provides cluster access through API keys and cluster credentials.

For details, refer to [Authentication](./authentication).

## Access Control\{#access-control}

Granular and role-based access control:

- Hierarchical permissions (organization, project, cluster).

- Pre-defined roles to simplify permission assignments.

- Both intuitive operations on the console and programmatic access from your app are available.

For details, refer to [Access Control](./access-control).

## Secure Network Access\{#secure-network-access}

Zilliz Cloud secures your network interactions through:

- **IP Allowlisting:** Define allowed IP ranges (CIDR blocks) to restrict access.

- **Private Links:** Establish secure, private connections between your VPC and Zilliz Cloud control plane.

## Data Encryption\{#data-encryption}

### In Transit\{#in-transit}

- HTTPS/gRPC with TLS 1.2+.

- AES-256 encryption ensures secure data transfers.

### At Rest\{#at-rest}

- The stored data on Disk/Object Storage is encrypted using the AES-256 (256-bit Advanced Encryption Standard ) encryption algorithm.

## Audit Logging and Monitoring\{#audit-logging-and-monitoring}

Maintain visibility and accountability through audit logs:

- Record activities across both control-plane and data-plane.

- Stream logs directly to your storage solutions.

- Leverage third-party tools for log analysis.

For details, refer to [Auditing](./auditing).

## Data Integrity and Backup\{#data-integrity-and-backup}

Ensure data availability and recovery:

- Automated and manual backup options.

- Recycle bin functionality for data restoration (with defined retention).

For details, refer to [Backup & Restore](./backup-and-restore) and [Use Recycle Bin](./use-recycle-bin).

## Certificates and TLS\{#certificates-and-tls}

Zilliz Cloud ensures secure connections:

- Uses Let's Encrypt and AWS Certificate Manager for SSL certificates.

- Auto-renews certificates 30 days before expiration (validity: 90 days).

- Exclusively supports TLS 1.2 or higher.

<Admonition type="info" icon="📘" title="Notes">

<p>Two-way TLS (mTLS) is currently not available. </p>

</Admonition>

## Summary\{#summary}

Zilliz Cloud always places data security as its top priority. It emphasizes data security through comprehensive encryption, rigorous authentication, robust access control, private networking, and consistent auditing practices to maintain data confidentiality, integrity, and availability.