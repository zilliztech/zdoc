---
title: "Cluster Credentials (Console) | BYOC"
slug: /cluster-credentials-console
sidebar_label: "Cluster Credentials (Console)"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud authenticates your identity using a cluster credential or an API key. This guide introduces authentication with cluster credentials. | BYOC"
type: origin
token: YmsVwIzOBinv4OklCfmc2nyznAe
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster credentials
  - console
  - rag llm architecture
  - private llms
  - nn search
  - llm eval

---

import Admonition from '@theme/Admonition';


# Cluster Credentials (Console)

Zilliz Cloud authenticates your identity using a cluster credential or an API key. This guide introduces authentication with cluster credentials.

A cluster credential consists of a username and password pair (`user:password`), utilized to authenticate and authorize your requests for cluster interaction.

When setting up a cluster, Zilliz Cloud creates the default cluster user `db_admin` with the `Admin` role, granting full cluster access. The password of the default user will only be shown once during cluster creation, so it is crucial to note it down and securely store it in an appropriate location.

Beyond the default `db_admin` user, you can also [create](./cluster-users#create-a-cluster-user) more cluster users with corresponding password for authentication.

## Reset Password{#reset-password}

If you forget a user's password or suspect it has been leaked, you can reset the password.

![reset-cluster-user-password](/byoc/reset-cluster-user-password.png)