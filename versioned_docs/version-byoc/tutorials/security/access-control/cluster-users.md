---
title: "Manage Cluster Users (Console) | BYOC"
slug: /cluster-users
sidebar_label: "Manage Cluster Users (Console)"
beta: FALSE
notebook: FALSE
description: "In Zilliz Cloud, you can create cluster users and assign them cluster roles to define the privileges, achieving data security. | BYOC"
type: origin
token: CWT2wh5YriZfPZkGlgCcWxVnnAf
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - access control
  - rbac
  - users
  - overview
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots

---

import Admonition from '@theme/Admonition';


# Manage Cluster Users (Console)

In Zilliz Cloud, you can create cluster users and assign them cluster roles to define the privileges, achieving data security.

Upon the creation of a cluster, a default user named `db_admin` is automatically generated. This user cannot be dropped. In addition to this default user, you can create more cluster users for fine-grained access control.

To manage cluster users, you must be an **Organization Owner** or a **Project Admin** or have a role with **Cluster_Admin** privileges.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is exclusively available to Dedicated clusters.</p>

</Admonition>

## Create a cluster user{#create-a-cluster-user}

When creating a cluster user, you need to:

- Input the name of the user.

- Grant this user either a built-in cluster role or [a custom cluster role](./cluster-roles).

- Set the password for this cluster user. This password will be used for [authentication](./cluster-credentials-console).

![add-cluster-user](/byoc/add-cluster-user.png)

<Admonition type="info" icon="📘" title="Notes">

<p>Each cluster can have up to 100 cluster users.</p>

</Admonition>

## Edit the role of a cluster user{#edit-the-role-of-a-cluster-user}

![edit-cluster-user-role](/byoc/edit-cluster-user-role.png)

## Drop a cluster user{#drop-a-cluster-user}

<Admonition type="info" icon="📘" title="Notes">

<p>The default user <strong>db_admin</strong> cannot be dropped.</p>

</Admonition>

![drop-cluster-user](/byoc/drop-cluster-user.png)

