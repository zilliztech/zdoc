---
title: "Manage Cluster Users (Console) | Cloud"
slug: /cluster-users
sidebar_label: "Manage Cluster Users (Console)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In Zilliz Cloud, you can create cluster users and assign them cluster roles to define the privileges, achieving data security. | Cloud"
type: origin
token: CWT2wh5YriZfPZkGlgCcWxVnnAf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Manage Cluster Users (Console)

In Zilliz Cloud, you can create cluster users and assign them cluster roles to define the privileges, achieving data security.

Upon the creation of a cluster, a default user named `db_admin` is automatically generated. This user cannot be dropped. In addition to this default user, you can create more cluster users for fine-grained access control.

To manage cluster users, you must be an **Organization Owner** or a **Project Admin** or have a role with **Cluster_Admin** privileges.

<Admonition type="info" icon="📘" title="Notes">

This feature is available only to **Dedicated** clusters.

</Admonition>

## Create a cluster user\{#create-a-cluster-user}

When creating a cluster user, you need to:

- Input the name of the user.

- (Optional) Enter the description of the user.

- Grant this user either a built-in cluster role or [a custom cluster role](./cluster-roles).

- Set the password for this cluster user. This password will be used for [authentication](./cluster-credentials).

![X8A2bdNuTopfLWxt53Ich1FHntf](https://zdoc-images.s3.us-west-2.amazonaws.com/x8a2bdnutopflwxt53ich1fhntf.png "X8A2bdNuTopfLWxt53Ich1FHntf")

<Admonition type="info" icon="📘" title="Notes">

Each cluster can have up to 500 cluster users.

</Admonition>

## Edit the role or desrciption of a cluster user\{#edit-the-role-or-desrciption-of-a-cluster-user}

![V1PkbqpnZoGkmQxu2kbcNIH2neb](https://zdoc-images.s3.us-west-2.amazonaws.com/v1pkbqpnzogkmqxu2kbcnih2neb.png "V1PkbqpnZoGkmQxu2kbcNIH2neb")

## Drop a cluster user\{#drop-a-cluster-user}

<Admonition type="info" icon="📘" title="📘 Notes">

The default user **db_admin** cannot be dropped.

</Admonition>

![drop-cluster-user](https://zdoc-images.s3.us-west-2.amazonaws.com/drop-cluster-user.png "drop-cluster-user")

